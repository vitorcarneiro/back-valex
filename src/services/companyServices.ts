import * as companyRepository from "../repositories/companyRepository.js";
import * as errors from '../middlewares/handleErrorsMiddleware.js'

export async function validateApiKey(apiKey: string) {
    const company = await companyRepository.findByApiKey(apiKey);
    if (!company) throw errors.notFound(`company api key "${apiKey}" not found`);
    return company;
}