import joi from 'joi';

export const create = joi.object({
  employeeId: joi.number().required(),
  type: joi.string().valid('groceries', 'restaurant', 'transport', 'education', 'health').required()
});

export const activate = joi.object({
  cvv: joi.string().length(3).pattern(/^[0-9]+$/, 'numbers').required(),
  password: joi.string().length(4).pattern(/^[0-9]+$/, 'numbers').required()
});