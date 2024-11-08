// src/routes/documentsRoutes.ts
import { Router } from 'express';
import { ingestDocumentData } from '../controllers/documentsController';

const router = Router();
router.post('/documents', ingestDocumentData);

export default router;
