# Cron Jobs Setup for Render Keep-Alive

This document explains how the cron jobs are configured to prevent Render from spinning down your application due to inactivity.

## Overview

The cron job system automatically pings your application every 10 minutes to keep it active on Render's free tier, preventing the 50+ second cold start delays.

## Files Added/Modified

### New Files:
- `src/utils/cronJobs.js` - Main cron job implementation
- `CRON_JOBS_SETUP.md` - This documentation file

### Modified Files:
- `src/server.js` - Added cron job initialization
- `src/config/env.js` - Added cron job environment variables
- `package.json` - Added `node-cron` and `node-fetch` dependencies

## Environment Variables

Add these to your `.env` file:

```env
# Cron Job Configuration
APP_URL=https://your-render-app.onrender.com  # Your actual Render URL
ENABLE_CRON_JOBS=true  # Set to 'true' to enable cron jobs
```

### Environment Variables Explained:

- **APP_URL**: The full URL of your deployed application on Render
- **ENABLE_CRON_JOBS**: Set to 'true' to enable cron jobs (automatically enabled in production)

## How It Works

1. **Automatic Activation**: Cron jobs are automatically enabled when `NODE_ENV=production`
2. **Health Check Pinging**: Every 10 minutes, the system pings `/api/health` endpoint
3. **Logging**: All ping attempts are logged with timestamps and success/failure status
4. **Graceful Shutdown**: Proper cleanup when the server shuts down

## Cron Schedule

- **Default**: Every 10 minutes (`*/10 * * * *`)
- **Alternative**: Every 5 minutes for more aggressive keep-alive (available but not enabled by default)

## Production Setup on Render

1. **Set Environment Variables**:
   ```env
   NODE_ENV=production
   APP_URL=https://your-app-name.onrender.com
   ```

2. **Deploy**: The cron jobs will automatically start when your app deploys

3. **Monitor**: Check your Render logs to see the keep-alive ping messages:
   ```
   ✅ Keep-alive ping successful: 2024-01-15T10:30:00.000Z
   ```

## Development

In development mode, cron jobs are disabled by default. To enable them:

```env
ENABLE_CRON_JOBS=true
```

## Troubleshooting

### Cron Jobs Not Starting
- Check that `NODE_ENV=production` or `ENABLE_CRON_JOBS=true`
- Verify `APP_URL` is set correctly
- Check server logs for initialization messages

### Ping Failures
- Ensure your app URL is accessible
- Check that the `/api/health` endpoint is working
- Verify network connectivity from Render

### High Memory Usage
- The cron job uses minimal resources
- If concerned, you can increase the interval to 15 minutes by modifying the cron expression

## Alternative Configurations

### More Aggressive Keep-Alive (5 minutes)
```javascript
import { initializeAggressiveCronJobs } from "./utils/cronJobs.js";
// Use this instead of initializeCronJobs()
```

### Custom Interval
Modify the cron expression in `src/utils/cronJobs.js`:
```javascript
// Every 15 minutes
'*/15 * * * *'

// Every 30 minutes  
'*/30 * * * *'
```

## Benefits

- ✅ Eliminates 50+ second cold start delays
- ✅ Improves user experience
- ✅ Minimal resource usage
- ✅ Automatic in production
- ✅ Configurable for different needs
- ✅ Proper error handling and logging

## Notes

- Render's free tier spins down after ~15 minutes of inactivity
- The 10-minute ping interval provides a safety buffer
- This solution works for any hosting service with similar behavior
- No external services required - uses your existing health check endpoint
