import cron from 'node-cron';
import fetch from 'node-fetch';
import { ENV } from '../config/env.js';

/**
 * Cron job service to keep the application alive on Render
 * This prevents the application from spinning down due to inactivity
 */

// Get the application URL from environment variables
const APP_URL = ENV.APP_URL;

/**
 * Ping the application to keep it alive
 * This function makes a request to the health check endpoint
 */
const pingApplication = async () => {
  try {
    const response = await fetch(`${APP_URL}/api/health`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Keep-alive ping successful: ${new Date().toISOString()}`);
      return true;
    } else {
      console.error(`❌ Keep-alive ping failed with status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Keep-alive ping error:`, error.message);
    return false;
  }
};

/**
 * Initialize cron jobs
 * Runs every 10 minutes to keep the application active
 */
export const initializeCronJobs = () => {
  console.log('🕒 Initializing cron jobs...');
  
  // Schedule the keep-alive ping every 10 minutes
  // Render typically spins down after 15 minutes of inactivity
  const keepAliveJob = cron.schedule('*/10 * * * *', async () => {
    console.log('🔄 Running keep-alive ping...');
    await pingApplication();
  }, {
    scheduled: false, // Don't start automatically
    timezone: 'UTC'
  });

  // Start the cron job
  keepAliveJob.start();
  console.log('✅ Keep-alive cron job started - running every 10 minutes');

  // Run initial ping immediately
  console.log('🔄 Running initial keep-alive ping...');
  pingApplication();

  // Return the job instance for potential cleanup
  return {
    keepAliveJob
  };
};

/**
 * Alternative cron job for more frequent pings (every 5 minutes)
 * Use this if you want more aggressive keep-alive
 */
export const initializeAggressiveCronJobs = () => {
  console.log('🕒 Initializing aggressive cron jobs...');
  
  // Schedule the keep-alive ping every 5 minutes
  const keepAliveJob = cron.schedule('*/5 * * * *', async () => {
    console.log('🔄 Running aggressive keep-alive ping...');
    await pingApplication();
  }, {
    scheduled: false,
    timezone: 'UTC'
  });

  keepAliveJob.start();
  console.log('✅ Aggressive keep-alive cron job started - running every 5 minutes');

  // Run initial ping immediately
  console.log('🔄 Running initial keep-alive ping...');
  pingApplication();

  return {
    keepAliveJob
  };
};

/**
 * Graceful shutdown function to stop cron jobs
 */
export const stopCronJobs = (jobs) => {
  console.log('🛑 Stopping cron jobs...');
  if (jobs && jobs.keepAliveJob) {
    jobs.keepAliveJob.stop();
    console.log('✅ Cron jobs stopped');
  }
};
