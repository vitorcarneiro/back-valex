import * as employeeServices from "./employeeServices.js";
import * as cardRepository from "../repositories/cardRepository.js";
import * as errors from "../middlewares/handleErrorsMiddleware.js";

export async function createCard(employeeId: number, type: cardRepository.TransactionTypes) {
    const employee = await employeeServices.validateId(employeeId);

    console.log(employee);
    if (!employee) return errors.notFound('cardId');

    
    
}