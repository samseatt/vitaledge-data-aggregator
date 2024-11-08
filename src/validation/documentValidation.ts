// src/validation/documentValidation.ts
import Joi from 'joi';
import { DocumentData } from '../types/requestTypes';

export const documentSchema = Joi.object<DocumentData>({
  documentId: Joi.string().required(),
  patientId: Joi.string().required(),
  timestamp: Joi.string().isoDate().required(),  // Validates ISO date format
  parsedText: Joi.string().required(),
  extractedFields: Joi.object().required(),
  type: Joi.string().required() // Type of document, e.g., 'bloodwork'
});

// Bloodwork validation schema
export const bloodworkSchema = Joi.object().pattern(
  Joi.string(), // key for each bloodwork item (e.g., "RBC", "CREA")
  Joi.number().required() // value of each bloodwork item
);
