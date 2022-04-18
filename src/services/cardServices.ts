import faker from '@faker-js/faker';
import dayjs from 'dayjs';
import bcrypt from 'bcrypt';

import * as employeeServices from "./employeeServices.js";
import * as errors from "../middlewares/handleErrorsMiddleware.js";
import * as cardRepository from "../repositories/cardRepository.js";
import * as rechargeRepository from "../repositories/rechargeRepository.js";
import * as companyRepository from "../repositories/companyRepository.js";
import * as paymentRepository from "../repositories/paymentRepository.js";

export async function createCard(employeeId: number, type: cardRepository.TransactionTypes, isVirtual: boolean) {
    const employee = await employeeServices.validateId(employeeId);
    if (await employeeAlreadyHasTypeCard(employeeId, type)) throw errors.conflict(`employee already has a ${type} card`);

    const cardData = await cardConstructor(employee.fullName, employeeId, type, isVirtual);
    
    return await cardRepository.insert(cardData);
}

export async function employeeAlreadyHasTypeCard(employeeId: number, type: cardRepository.TransactionTypes) {
    const card = await cardRepository.findByTypeAndEmployeeId(type, employeeId);
    if (card) return true;
    
    return false;
}

export async function cardConstructor(employeeName: string, employeeId: number, type: cardRepository.TransactionTypes, isVirtual: boolean, originalCardId?: number) {
    const cardData = {
        "employeeId": employeeId,
        "number": await generateCardNumber('mastercard'),
        "cardholderName": generateCarHolderName(employeeName),
        "securityCode": generateSecurityCode(),
        "expirationDate": generateExpirationDate(5),
        "isVirtual": isVirtual,
        "originalCardId": isVirtual ? originalCardId : null,
        "isBlocked": true,
        "type": type
    };
    
    return cardData;
}

export async function generateCardNumber(cardBrand: 'mastercard' | 'visa' | 'amex' | 'elo') {
    let cardNumber = faker.finance.creditCardNumber(cardBrand).replace(/\s|-/g, '');

    if (await cardRepository.findByCardDetails(cardNumber)) 
        return generateCardNumber(cardBrand);
    
    return cardNumber;
}

export function generateSecurityCode() {
    return faker.finance.creditCardCVV();
}

export function generateCarHolderName(employeeName: string) {
    const cardholderNameArray = employeeName.toUpperCase().split(' ');
    
    let cardholderName = "";
    for (let i = 0; i < cardholderNameArray.length; i++) {
        if (i === 0 || i === cardholderNameArray.length - 1)
                cardholderName = cardholderName + ' ' + cardholderNameArray[i];

        else
            if (cardholderNameArray[i].length > 2) 
                cardholderName = cardholderName + ' ' + cardholderNameArray[i][0];
    }
    return cardholderName;
}

export function generateExpirationDate(durationYears: number) {
    return dayjs().add(durationYears, 'year').format('MM/YY');
}

export async function activateCard(cardId: any, cvv: string, password: string) {
    const id = Number(cardId);
    if (isNaN(id)) throw errors.unprocessableEntity(`cardId must be a number`);

    const card = await cardRepository.findByCardById(id)
    if (!card) throw errors.notFound(`card '${cardId}' not found`);

    if(card.password !== null) throw errors.badRequest(`card '${cardId}' already activated`);

    if (isCardExpired(card.expirationDate)) throw errors.notAcceptable(`card '${cardId}' is expired`);

    if(cvv !== card.securityCode) throw errors.unauthorized(`CVV does not match`);

    await cardRepository.update(id, { "password": bcrypt.hashSync(password, 10),  "isBlocked": false });
}

export function isCardExpired(expirationDate: string) {
    if(expirationDate.length !== 5) throw errors.conflict(`registered expiration date is wrong`)
    
    const expirationDateArray = expirationDate.split('/');
    if(expirationDateArray.length !== 2) throw errors.conflict(`registered expiration date is wrong`)

    if(expirationDateArray[0] > dayjs().format('MM') && expirationDateArray[1] > dayjs().format('YY'))
        return true;

    return false;
}

export async function getCardBalance(cardId: string) {
    const id =Number(cardId);
    if (isNaN(id)) throw errors.unprocessableEntity(`cardId must be a number`);

    const card = await cardRepository.findByCardById(id)
    if (!card) throw errors.notFound(`card '${cardId}' not found`);

    const transactions = await cardRepository.payments(id);
    const recharges = await cardRepository.recharges(id);

    const balance = calculateBalance(transactions, recharges);

    return { balance, transactions, recharges };
}

export function calculateBalance(transactions: cardRepository.Payments[], recharges: cardRepository.Recharges[]) {
    const transactionsAmount = transactions.reduce((acc, cur) => acc + cur.amount, 0);
    const rechargesAmount = recharges.reduce((acc, cur) => acc + cur.amount, 0);

    return rechargesAmount - transactionsAmount;
}

export async function recharge(cardId: string, amount: string) {
    const id = Number(cardId);
    if (isNaN(id)) throw errors.unprocessableEntity(`cardId must be a number`);

    const card = await cardRepository.findByCardById(id)
    if (!card) throw errors.notFound(`card '${cardId}' not found`);
    if (isCardExpired(card.expirationDate)) throw errors.notAcceptable(`card '${cardId}' is expired`);

    const value = Number(amount);
    if (isNaN(value)) throw errors.unprocessableEntity(`recharge amount must be a number`);
    if (value <= 0) throw errors.notAcceptable(`recharge amount must be higher than 0`);

    await rechargeRepository.insert({"cardId": id, "amount": value});
}

export async function debit(businessId: string, cardNumber: string, password: string, amount: string) {
    const companyId = Number(businessId);
    if (isNaN(companyId)) throw errors.unprocessableEntity(`businessId must be a number`);

    const value = Number(amount);
    if (isNaN(value)) throw errors.unprocessableEntity(`debit amount must be a number`);
    if (value <= 0) throw errors.notAcceptable(`debit amount must be higher than 0`);
    
    const card = await cardRepository.findCardByNumber(cardNumber);
    if (!card) throw errors.notFound(`card not found`);
    if (isCardExpired(card.expirationDate)) throw errors.notAcceptable(`card is expired`);
    if (card.isBlocked) throw errors.unauthorized(`card is blocked`);

    if(!bcrypt.compareSync(password, card.password)) throw errors.unauthorized(`password does not match`);

    const company = await companyRepository.findById(companyId);
    if (!company) throw errors.notFound(`company not found`);

    if(card.type !== company.type) throw errors.unauthorized(`type of card (${card.type}) does not match with company type (${company.type})`);

    const { balance } = await getCardBalance(card.id.toString());
    if (balance < value) throw errors.unauthorized(`balance insufficient`);

    await paymentRepository.insert({ "cardId": card.id, "businessId": companyId, "amount": value})
}