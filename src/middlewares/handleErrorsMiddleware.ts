import { NextFunction, Request, Response } from 'express';

const serviceErrorToStatusCode = {
    unauthorized: 401,
    not_found: 404,
    conflict: 409,
    unprocessable_entity: 422
};
  
export function unauthorized() {
    return { type: "unauthorized" };
}
  
export function notFound(message?: string) {
    if (!message) return { type: "not_found"}
    return { type: "not_found", message:  message};
}
  
export function conflict(message?: string) {
    if (!message) return { type: "conflict" };
    return { type: "conflict", message:  message};
}

export function unprocessableEntity(message?: string) {    
    if (!message) return { type: "unprocessable_entity" }
    return { type: "unprocessable_entity", message: message};
}
  
export default function handleErrorsMiddleware(err?: any, req?: Request, res?: Response, next?: NextFunction) {
    const { type, message } = err;
    console.error(err);

    if (type && message) return res.status(serviceErrorToStatusCode[type]).send(message);
    
    if (type) return res.sendStatus(serviceErrorToStatusCode[type]);
  
    return res.sendStatus(500);
}
  