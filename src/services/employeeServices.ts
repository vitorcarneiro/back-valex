import * as employeeRepository from '../repositories/employeeRepository.js';

import * as errors from '../middlewares/handleErrorsMiddleware.js'

export async function validateId(id: number) {
    const employee = await employeeRepository.findById(id);

    if (!employee) {  return errors.notFound() }

    return employee;
}