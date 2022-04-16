import { Router } from 'express';
import * as cardController from '../controllers/cardController.js';
import { validateSchemaMiddleware } from '../middlewares/validateSchemaMiddleware.js';
import createCardSchema from '../schemas/cardsSchemas.js';

const cardRouter = Router();

cardRouter.post('card/create', validateSchemaMiddleware(createCardSchema), cardController.createCard);

export default cardRouter;