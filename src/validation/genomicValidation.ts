// src/validation/genomicValidation.ts
import Joi from 'joi';
import { GenomicData } from '../types/requestTypes';

export const GenomicSchema = Joi.object<GenomicData>({
  patientId: Joi.string().required(),
  timestamp: Joi.string().isoDate().required(),
  snps: Joi.array().items(
    Joi.object({
      rsId: Joi.string().required(),
      gene: Joi.string().required(),
      impact: Joi.string().valid('high', 'medium', 'low').required() // adjust values as needed
    })
  ).min(0) // Allows an empty array or any number of items
});
