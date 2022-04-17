import bcrypt from 'bcrypt';
import {v4 as uuid} from 'uuid';
import { connection } from '../database.js';
import * as cardRepository from "../repositories/cardRepository.js";
import * as employeeServices from "../services/employeeServices.js";
import * as cardServices from "../services/cardServices.js";
import { Request, Response} from "express";

export async function createCard(req: Request, res: Response) {
    const { employeeId, type } = req.body;

    await cardServices.createCard(employeeId, type);

    res.status(201).send(`${type} card created`);
}