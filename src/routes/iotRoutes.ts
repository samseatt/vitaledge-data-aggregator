// src/routes/iotRoutes.ts
import { Router } from 'express';
import { ingestIoTData } from '../controllers/iotController';

const router = Router();
router.post('/iot-data', ingestIoTData);

export default router;
