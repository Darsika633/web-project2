import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from 'url';

import { ENV } from "./config/env.js";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

// Import routes
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import discountRoutes from "./routes/discountRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import deliveryRoutes from "./routes/deliveryRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

// Import Swagger setup
import { setupSwagger } from "./config/swagger.js";

// Import cron jobs
import { initializeCronJobs } from "./utils/cronJobs.js";

dotenv.config();

const app = express();

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
    'https://trend-bite-admin.vercel.app',
    'https://online-cloth-store.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middleware to parse JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get("/", (req, res) => {
    res.json({
      success: true,
      message: "TrendBite Server is running!",
      version: "1.0.0",
      timestamp: new Date().toISOString()
    });
  });
  
  // API health check
  app.get("/api/health", (req, res) => {
    res.json({
      success: true,
      message: "API is healthy",
      timestamp: new Date().toISOString()
    });
  });

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/delivery", deliveryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/payments", paymentRoutes);

// Setup Swagger documentation
setupSwagger(app);

// Basic route
const startServer = async () => {
    try {
      await connectDB();
      
      const server = app.listen(ENV.PORT, () => {
        console.log(`🚀 TrendBite API server listening on http://localhost:${ENV.PORT}`);
      });

      // Initialize cron jobs to keep the application alive on Render
      // Only start cron jobs in production or when explicitly enabled
      if (ENV.NODE_ENV === 'production' || ENV.ENABLE_CRON_JOBS === 'true') {
        const cronJobs = initializeCronJobs();
        
        // Graceful shutdown handling
        process.on('SIGTERM', () => {
          console.log('🛑 SIGTERM received, shutting down gracefully...');
          server.close(() => {
            console.log('✅ Server closed');
            process.exit(0);
          });
        });

        process.on('SIGINT', () => {
          console.log('🛑 SIGINT received, shutting down gracefully...');
          server.close(() => {
            console.log('✅ Server closed');
            process.exit(0);
          });
        });
      } else {
        console.log('ℹ️  Cron jobs disabled in development mode');
      }
      
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  startServer();
