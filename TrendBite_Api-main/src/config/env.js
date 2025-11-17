import dotenv from "dotenv";

dotenv.config();

export const ENV = {
    // Server Configuration
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development',
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173/forgot-password',
    
    // Database Configuration
    MONGO_URI: process.env.MONGO_URI,
    
    // Cloudinary Configuration
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    
    
    // JWT Configuration (if needed for additional auth)
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    
    // Email Configuration
    EMAIL_SERVICE: process.env.EMAIL_SERVICE, // gmail, sendgrid, mailgun, smtp
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    EMAIL_FROM: process.env.EMAIL_FROM,
    EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME || 'TrendBite',
    
    // SendGrid Configuration
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    
    // Brevo (formerly Sendinblue) Configuration
    BREVO_SMTP_USER: process.env.BREVO_SMTP_USER,
    BREVO_SMTP_KEY: process.env.BREVO_SMTP_KEY,
    
    // Mailgun Configuration
    MAILGUN_SMTP_HOST: process.env.MAILGUN_SMTP_HOST,
    MAILGUN_SMTP_PORT: process.env.MAILGUN_SMTP_PORT,
    MAILGUN_SMTP_USER: process.env.MAILGUN_SMTP_USER,
    MAILGUN_SMTP_PASS: process.env.MAILGUN_SMTP_PASS,
    
    // Generic SMTP Configuration
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_SECURE: process.env.SMTP_SECURE,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    
    // Payment Configuration (for future use)
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    
    // Cron Job Configuration
    APP_URL: process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`,
    ENABLE_CRON_JOBS: process.env.ENABLE_CRON_JOBS || 'false',
    
    // Other Configuration
    BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
};
