import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import listingsRouter from './routes/listings';
import { claimManualListingPayment, adminVerifyPayment } from './services/payments';
import path from 'path';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Guarded media route (locks images for non-active listings)
app.use('/uploads', (await import('./routes/media')).default);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'CarRescueKe Backend'
  });
});

// API routes
app.use('/api/listings', listingsRouter);
// Manual payment claim endpoint
app.post('/api/payments/manual/claim', claimManualListingPayment);
// Admin verify endpoint
app.post('/api/payments/manual/verify', adminVerifyPayment);
app.use('/api/ads', (await import('./routes/ads')).default);
app.use('/api/admin', (await import('./routes/admin')).default);
app.use('/api/payments', (await import('./routes/payments')).default);
app.use('/api/airtel', (await import('./routes/airtel')).default);

app.get('/api', (req, res) => {
  res.json({
    message: 'CarRescueKe API is running',
    version: '1.0.0',
    paybill: {
      name: process.env.PAYBILL_NAME || 'Loop Bank',
      number: process.env.PAYBILL_NUMBER || '714777',
      account: process.env.PAYBILL_ACCOUNT || '0101355308'
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    console.log('✅ Database connected successfully');

    // Connect to Redis
    await connectRedis();
    console.log('✅ Redis connected successfully');

    // Start server
    app.listen(PORT, async () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 CarRescueKe Backend API ready`);
      // Seed initial admin
      try {
        const { seedInitialAdmin } = await import('./admin/seed');
        await seedInitialAdmin();
        console.log('👤 Initial admin ensured.');
      } catch (e) {
        console.error('Admin seed failed:', e);
      }
      // Schedule daily expiry (every 24h)
      try {
        const { expireListingsJob } = await import('./jobs/expire');
        setInterval(() => {
          expireListingsJob().catch(err => console.error('expireListingsJob error', err));
        }, 24 * 60 * 60 * 1000);
        console.log('⏰ Expiry scheduler set (24h).');
      } catch (e) {
        console.error('Failed to start expiry scheduler', e);
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export default app;