import * as cardServices from "../services/cardServices.js";
import { Request, Response} from "express";

export async function createPhysicalCard(req: Request, res: Response) {
    const { employeeId, type } = req.body;

    await cardServices.createCard(employeeId, type, false);

    res.status(201).send(`${type} physical card created`);
}

export async function activateCard(req: Request, res: Response) {
    const { id :cardId } = req.params;
    const { cvv, password } = req.body;

    await cardServices.activateCard(cardId, cvv, password);

    res.status(200).send(`card '${cardId}' activated`);
}

export async function showCardBalance(req: Request, res: Response) {
    const { id :cardId } = req.params;

    const cardBalance = await cardServices.getCardBalance(cardId);

    res.send(cardBalance);
}