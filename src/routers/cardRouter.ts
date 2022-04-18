import { Router } from 'express';
import * as cardController from '../controllers/cardController.js';
import { validateApiKeyMiddleware } from '../middlewares/validateApiKeyMiddleware.js';
import { validateSchemaMiddleware } from '../middlewares/validateSchemaMiddleware.js';
import createCardSchema from '../schemas/cardsSchemas.js';

const cardRouter = Router();

cardRouter.post('/cards/create', validateApiKeyMiddleware, validateSchemaMiddleware(createCardSchema), cardController.createPhysicalCard);
cardRouter.patch('/cards/:id/activate', cardController.activateCard);

export default cardRouter;