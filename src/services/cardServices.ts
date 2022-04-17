import * as employeeServices from "./employeeServices.js";
import * as cardRepository from "../repositories/cardRepository.js";
import * as companyRepository from "../repositories/companyRepository.js";

export async function createCard(employeeId: number, type: cardRepository.TransactionTypes) {
    
    
    const employee = await employeeServices.validateId(employeeId);
    //const company = await companyRepository.validateApiKey

    
    
}