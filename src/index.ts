// src/index.ts
import express from 'express';
import dotenv from 'dotenv';
import { connectRedis } from './config/redis'; // Import Redis connection
import iotRoutes from './routes/iotRoutes';
import healthkitRoutes from './routes/healthkitRoutes';
import genomicsRoutes from './routes/genomicsRoutes';
import documentsRoutes from './routes/documentsRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Establish Redis connection
connectRedis();

app.use('/api', iotRoutes);
app.use('/api', healthkitRoutes);
app.use('/api', genomicsRoutes);
app.use('/api', documentsRoutes);

app.get('/', (req, res) => {
  res.send('VitalEdge Data Aggregator API is running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
