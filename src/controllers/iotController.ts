// src/controllers/iotController.ts
import { Request, Response } from 'express';
import { iotSchema } from '../validation/iotValidation';
import pool from '../config/database';
import { redisClient } from '../config/redis';

const CACHE_TTL = parseInt(process.env.REDIS_CACHE_TTL || '300');

export const ingestIoTData = async (req: Request, res: Response): Promise<void> => {
  // Validate the data
  const { error, value } = iotSchema.validate(req.body);
  if (error) {
    console.error('Invalid IoT data');
    res.status(400).json({ message: 'Invalid IoT data', details: error.details });
    return;
  }

  // Data is validated and safe to use
  const data = value;  

  // Normalize timestamp to ISO format
  const normalizedTimestamp = new Date(data.timestamp).toISOString();

  // Normalize metrics (example conversions; adjust based on actual requirements)
  // Assuming the heart rate is already in bpm and temperature in Celsius, so no conversion needed.
  // This step can be used if normalization of units is required in the future.
  const normalizedData = {
    deviceId: data.deviceId,
    timestamp: normalizedTimestamp,
    heartRate: data.metrics.heartRate, // Assuming bpm; convert here if needed
    temperature: data.metrics.temperature, // Assuming Celsius; convert here if needed
  };

  const cacheKey = `iot:${normalizedData.deviceId}:${normalizedData.timestamp}`;

  try {
    // Cache the normalized data in Redis
    await redisClient.setEx(cacheKey, CACHE_TTL, JSON.stringify(normalizedData));
    console.log("Cached HealthKit data:", normalizedData);

    const query = `
      INSERT INTO iot_data (device_id, timestamp, heart_rate, temperature)
      VALUES ($1, $2, $3, $4)
    `;
    const values = [
      normalizedData.deviceId,
      normalizedData.timestamp,
      normalizedData.heartRate,
      normalizedData.temperature
    ];
    await pool.query(query, values);

    res.status(200).json({ message: 'IoT data ingested, cached, and stored successfully' });
  } catch (err) {
    console.error('Error saving IoT data:', err);
    res.status(500).json({ message: 'Failed to store IoT data' });
  }
};
