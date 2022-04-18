import { NextFunction, Request, Response } from 'express';

const serviceErrorToStatusCode = {
    bad_request: 400,
    unauthorized: 401,
    not_found: 404,
    not_acceptable: 406,
    conflict: 409,
    unprocessable_entity: 422
};
 
export function badRequest(message?: string) {
    if (!message) return { type: "bad_request" }
    return { type: "bad_request", message:  message };
}

export function unauthorized(message?: string) {
    if (!message) return { type: "unauthorized" }
    return { type: "unauthorized", message:  message };
}
  
export function notFound(message?: string) {
    if (!message) return { type: "not_found"}
    return { type: "not_found", message:  message };
}
  
export function notAcceptable(message?: string) {
    if (!message) return { type: "not_acceptable" }
    return { type: "not_acceptable", message:  message };
}
  
export function conflict(message?: string) {
    if (!message) return { type: "conflict" };
    return { type: "conflict", message:  message };
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
  