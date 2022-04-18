import { Router } from 'express';
import * as cardController from '../controllers/cardController.js';
import { validateApiKeyMiddleware } from '../middlewares/validateApiKeyMiddleware.js';
import { validateSchemaMiddleware } from '../middlewares/validateSchemaMiddleware.js';
import * as cardsSchemas from '../schemas/cardsSchemas.js';

const cardRouter = Router();

cardRouter.post('/cards/create', validateApiKeyMiddleware, validateSchemaMiddleware(cardsSchemas.create), cardController.createPhysicalCard);
cardRouter.patch('/cards/:id/activate', validateSchemaMiddleware(cardsSchemas.activate), cardController.activateCard);

export default cardRouter;