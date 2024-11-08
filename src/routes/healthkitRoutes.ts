// src/routes/healthkitRoutes.ts
import { Router } from 'express';
import { ingestHealthKitData } from '../controllers/healthkitController';

const router = Router();
router.post('/healthkit', ingestHealthKitData);

export default router;
