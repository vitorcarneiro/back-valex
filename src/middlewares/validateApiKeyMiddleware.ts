import { NextFunction, Request, Response } from "express";
import * as companyService from "../services/companyServices.js";

export async function validateApiKeyMiddleware(req: Request, res: Response, next: NextFunction) {
    const {"x-api-key": apiKey} = req.headers;

    const company = await companyService.validateApiKey(apiKey.toString());
    
    res.locals.user = company;
    next();
}