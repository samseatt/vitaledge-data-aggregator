// src/validation/healthkitValidation.ts
import Joi from 'joi';
import { HealthKitData } from '../types/requestTypes';

export const healthkitSchema = Joi.object<HealthKitData>({
  userId: Joi.string().required(),
  timestamp: Joi.string().isoDate().required(),
  stepCount: Joi.number().integer().min(0).required(),
  caloriesBurned: Joi.number().integer().min(0).required(),
});
