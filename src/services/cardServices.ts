import faker from '@faker-js/faker';
import dayjs from 'dayjs';
import bcrypt from 'bcrypt';

import * as employeeServices from "./employeeServices.js";
import * as cardRepository from "../repositories/cardRepository.js";
import * as errors from "../middlewares/handleErrorsMiddleware.js";

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
    const id = parseInt(cardId);
    if (isNaN(id)) throw errors.unprocessableEntity(`cardId must be a number`);

    const card = await cardRepository.findByCardById(id)
    if (!card) throw errors.notFound(`card '${cardId}' not found`);

    if(card.password !== null) throw errors.badRequest(`card '${cardId}' already activated`);

    if (isCardExpired(card.expirationDate)) throw errors.notAcceptable(`card '${cardId}' is expired`);

    if(cvv !== card.securityCode) throw errors.unauthorized(`CVV does not match`);

    await cardRepository.update(id, { password: bcrypt.hashSync(password, 10) });
}

export function isCardExpired(expirationDate: string) {
    if(expirationDate.length !== 5) throw errors.conflict(`registered expiration date is wrong`)
    
    const expirationDateArray = expirationDate.split('/');
    if(expirationDateArray.length !== 2) throw errors.conflict(`registered expiration date is wrong`)

    if(expirationDateArray[0] > dayjs().format('MM') && expirationDateArray[1] > dayjs().format('YY'))
        return true;

    return false;
}