// src/controllers/genomicsController.ts
import { Request, Response } from 'express';
import pool from '../config/database';
import { redisClient } from '../config/redis';
import { GenomicSchema } from '../validation/genomicValidation';

const CACHE_TTL = parseInt(process.env.REDIS_CACHE_TTL || '300');

export const ingestGenomicData = async (req: Request, res: Response): Promise<void> => {
  // Validate the data
  const { error, value } = GenomicSchema.validate(req.body);
  if (error) {
    res.status(400).json({ message: 'Invalid Genomic data', details: error.details });
    return;
  }

  const data = value;  // Data is validated and safe to use
  
  // Normalize timestamp to ISO format
  const normalizedTimestamp = new Date(data.timestamp).toISOString();

  const normalizedData = {
    patientId: data.patientId,
    timestamp: normalizedTimestamp,
    snps: JSON.stringify(data.snps),  // Store SNPs as JSONB
  };

  // Cache data with a unique key, such as patientId and timestamp (TODO maybe add rsId as we reformat)
  const cacheKey = `genomic:${normalizedData.patientId}:${normalizedData.timestamp}`;
  
  try {
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(normalizedData));
    console.log("Cached Genomic data:", normalizedData);

    const query = `
      INSERT INTO genomic_data (patient_id, timestamp, snp_data)
      VALUES ($1, $2, $3)
    `;
    const values = [normalizedData.patientId, normalizedData.timestamp, normalizedData.snps];
    await pool.query(query, values);

    res.status(200).json({ message: 'Genomic data ingested and cached successfully' });
    return;
  } catch (err) {
    console.error('Error caching Genomic data:', err);
    res.status(500).json({ message: 'Failed to cache Genomic data' });
    return;
  }
};
