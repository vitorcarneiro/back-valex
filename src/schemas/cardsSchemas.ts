import joi from 'joi';

const createCardSchema = joi.object({
  employeeId: joi.number().required(),
  type: joi.string().required()
});

export default createCardSchema;