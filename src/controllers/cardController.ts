import * as cardServices from "../services/cardServices.js";
import { Request, Response} from "express";

export async function createPhysicalCard(req: Request, res: Response) {
    const { employeeId, type } = req.body;

    await cardServices.createCard(employeeId, type, false);

    res.status(201).send(`${type} physical card created`);
}

export async function activateCard(req: Request, res: Response) {
    const { id :cardId } = req.params;

    await cardServices.activateCard(cardId, '123', '1235');

    res.status(202).send(` ${cardId} card activate`);
}

