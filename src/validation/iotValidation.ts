// src/validation/iotValidation.ts
import Joi from 'joi';
import { IoTData } from '../types/requestTypes';

export const iotSchema = Joi.object<IoTData>({
  deviceId: Joi.string().required(),
  timestamp: Joi.string().isoDate().required(),  // Validates ISO date format
  metrics: Joi.object({
    heartRate: Joi.number().integer().min(0).required(),
    temperature: Joi.number().required(),
  }).required(),
});
