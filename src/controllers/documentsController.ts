// src/controllers/documentsController.ts
import { Request, Response } from 'express';
import pool from '../config/database';
import { redisClient } from '../config/redis';
import { documentSchema, bloodworkSchema } from '../validation/documentValidation';

const CACHE_TTL = parseInt(process.env.REDIS_CACHE_TTL || '300');

export const ingestDocumentData = async (req: Request, res: Response): Promise<void> => {
  // Validate the data
  const { error, value } = documentSchema.validate(req.body);
  if (error) {
    res.status(400).json({ message: 'Invalid Document data', details: error.details });
    return;
  }

  const data = value;  // Data is validated and safe to use
  
  // Normalize timestamp to ISO format
  const normalizedTimestamp = new Date(data.timestamp).toISOString();

  const normalizedData = {
    documentId: data.documentId,
    patientId: data.patientId,
    timestamp: normalizedTimestamp,
    type: data.type,
    parsedText: data.parsedText,
    extractedFields: data.extractedFields,
  };

  // Cache data with a unique key, such as documentId and TODO
  const cacheKey = `document:${normalizedData.documentId}${normalizedData.timestamp}`;
  
  try {
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(normalizedData));
    console.log("Cached Document data:", normalizedData);

    const query = `
      INSERT INTO document_data (document_id, timestamp, extracted_fields, parsed_text)
      VALUES ($1, $2, $3, $4)
    `;
    const values = [normalizedData.documentId, normalizedData.timestamp, normalizedData.extractedFields, normalizedData.parsedText];
    await pool.query(query, values);

    // Process bloodwork if the document type is bloodwork
    if (normalizedData.type === 'bloodwork' && normalizedData.extractedFields.bloodwork) {
      const bloodworkData = normalizedData.extractedFields.bloodwork;

      // Validate bloodwork data
      const { error: bloodworkError, value: validBloodworkData } = bloodworkSchema.validate(bloodworkData);
      if (bloodworkError) {
        res.status(400).json({ message: 'Invalid bloodwork data', details: bloodworkError.details });
        return;
      }

      // Insert bloodwork results individually
      for (const [key, result] of Object.entries(validBloodworkData)) {
        const bloodworkTypeIdQuery = 'SELECT id FROM bloodwork_catalog WHERE code = $1';
        const bloodworkTypeIdResult = await pool.query(bloodworkTypeIdQuery, [key]);

        if (bloodworkTypeIdResult.rows.length > 0) {
          const bloodworkTypeId = bloodworkTypeIdResult.rows[0].id;

          const bloodworkQuery = `
            INSERT INTO bloodwork (patient_id, timestamp, bloodwork_type_id, value)
            VALUES ($1, $2, $3, $4)
          `;
          const bloodworkValues = [normalizedData.patientId, normalizedTimestamp, bloodworkTypeId, result];
          await pool.query(bloodworkQuery, bloodworkValues);
        } else {
          console.warn(`Unknown bloodwork type code: ${key}`);
        }
      }
    }

    res.status(200).json({ message: 'Document data ingested and cached successfully' });
  } catch (err) {
    console.error('Error caching Document data:', err);
    res.status(500).json({ message: 'Failed to cache Document data' });
  }
};
