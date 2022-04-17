import { Request, Response} from "express";
import { ObjectSchema } from "joi";
import { unprocessableEntity } from "./handleErrorsMiddleware.js";

export function validateSchemaMiddleware(schema: ObjectSchema) {
    return (req: Request, res: Response, next: Function) => {
      const validation = schema.validate(req.body, { abortEarly: false });
      if (validation.error) {
        throw unprocessableEntity(validation.error.message);
      }
      next();
    }
}