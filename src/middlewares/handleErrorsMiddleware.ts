const serviceErrorToStatusCode = {
    unauthorized: 401,
    notFound: 404,
    conflict: 409,
    unprocessableEntity: 422
  };
  
export function unauthorized() {
    return { type: "unauthorized" };
}
  
export function notFound(entity?: string) {
    if (!entity) return { type: "not_found"}
    
    return { type: "not_found", message:  `Could not find specified "${entity}"!`};
}
  
export function conflict() {
    return { type: "conflict" };
}

export function unprocessableEntity() {
    return { type: "unprocessable_entity" };
}
  
export default function handleErrorsMiddleware(err, req, res, next) {
    if (err.type) {
        res.sendStatus(serviceErrorToStatusCode[err.type]);
    }
  
    res.sendStatus(500);
}
  