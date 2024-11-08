// src/controllers/healthkitController.ts
import { Request, Response } from 'express';
import pool from '../config/database';
import { redisClient } from '../config/redis';
import { healthkitSchema } from '../validation/healthkitValidation';

const CACHE_TTL = parseInt(process.env.REDIS_CACHE_TTL || '300');

export const ingestHealthKitData = async (req: Request, res: Response): Promise<void> => {
  // Validate the data
  const { error, value } = healthkitSchema.validate(req.body);
  if (error) {
    console.error('Invalid HealthKit data')
    res.status(400).json({ message: 'Invalid HealthKit data', details: error.details });
    return;
  }

  const data = value;  // Data is validated and safe to use
  
  // Normalize timestamp to ISO format
  const normalizedTimestamp = new Date(data.timestamp).toISOString();

  // Normalize metrics (example conversions; adjust based on actual requirements)
  // This step can be used if normalization of units is required in the future.
  const normalizedData = {
    userId: data.userId,
    timestamp: normalizedTimestamp,
    stepCount: data.stepCount,
    caloriesBurned: data.caloriesBurned,
  };
  
  // Cache data with a unique key, such as userId and timestamp
  const cacheKey = `healthkit:${normalizedData.userId}:${normalizedData.timestamp}`;
  
  try {
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(normalizedData));
    console.log("Cached HealthKit data:", normalizedData);

    const query = `
      INSERT INTO healthkit_data (user_id, timestamp, step_count, calories_burned)
      VALUES ($1, $2, $3, $4)
    `;
    const values = [normalizedData.userId, normalizedData.timestamp, normalizedData.stepCount, normalizedData.caloriesBurned];
    await pool.query(query, values);

    res.status(200).json({ message: 'HealthKit data ingested and cached successfully' });
  } catch (err) {
    console.error('Error caching HealthKit data:', err);
    res.status(500).json({ message: 'Failed to cache HealthKit data' });
  }
};
