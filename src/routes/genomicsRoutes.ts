// src/routes/genomicsRoutes.ts
import { Router } from 'express';
import { ingestGenomicData } from '../controllers/genomicsController';

const router = Router();
router.post('/genomics', ingestGenomicData);

export default router;
