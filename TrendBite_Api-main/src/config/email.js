import nodemailer from 'nodemailer';
import { ENV } from './env.js';

/**
 * Email Configuration
 * Supports multiple email providers (Gmail, SendGrid, Mailgun, etc.)
 */

// Create transporter based on environment configuration
const createTransporter = () => {
  // Common connection settings for better reliability
  const connectionSettings = {
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 5000,    // 5 seconds
    socketTimeout: 15000,     // 15 seconds
    pool: true,               // Use connection pooling
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000,
    rateLimit: 5
  };

  // For Gmail
  if (ENV.EMAIL_SERVICE?.toLowerCase() === 'gmail') {
    console.log('📧 Configuring Gmail SMTP transport...');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: ENV.EMAIL_USER,
        pass: ENV.EMAIL_PASS // Use App Password for Gmail
      },
      ...connectionSettings
    });
  }

  // For SendGrid
  if (ENV.EMAIL_SERVICE?.toLowerCase() === 'sendgrid') {
    console.log('📧 Configuring SendGrid SMTP transport...');
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: ENV.SENDGRID_API_KEY
      },
      ...connectionSettings
    });
  }

  // For Brevo (formerly Sendinblue)
  if (ENV.EMAIL_SERVICE?.toLowerCase() === 'brevo') {
    console.log('📧 Configuring Brevo SMTP transport...');
    return nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 2525,
      secure: false,
      auth: {
        user: ENV.BREVO_SMTP_USER || ENV.EMAIL_USER,
        pass: ENV.BREVO_SMTP_KEY || ENV.EMAIL_PASS
      },
      ...connectionSettings,
      tls: {
        rejectUnauthorized: false // For some cloud hosting environments
      }
    });
  }

  // For Mailgun
  if (ENV.EMAIL_SERVICE?.toLowerCase() === 'mailgun') {
    console.log('📧 Configuring Mailgun SMTP transport...');
    return nodemailer.createTransport({
      host: ENV.MAILGUN_SMTP_HOST || 'smtp.mailgun.org',
      port: ENV.MAILGUN_SMTP_PORT || 587,
      secure: false,
      auth: {
        user: ENV.MAILGUN_SMTP_USER,
        pass: ENV.MAILGUN_SMTP_PASS
      },
      ...connectionSettings
    });
  }

  // Generic SMTP configuration
  if (ENV.SMTP_HOST) {
    console.log(`📧 Configuring Generic SMTP transport (${ENV.SMTP_HOST}:${ENV.SMTP_PORT || 587})...`);
    return nodemailer.createTransport({
      host: ENV.SMTP_HOST,
      port: ENV.SMTP_PORT || 587,
      secure: ENV.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: ENV.SMTP_USER,
        pass: ENV.SMTP_PASS
      },
      ...connectionSettings
    });
  }

  // Fallback - for development/testing with Ethereal
  // In production, this should never be used
  console.warn('⚠️  No email configuration found. Using development mode.');
  return null;
};

// Initialize transporter
export const transporter = createTransporter();

/**
 * Verify email configuration
 */
export const verifyEmailConfig = async () => {
  if (!transporter) {
    console.warn('⚠️  Email service not configured. Emails will not be sent.');
    return false;
  }

  try {
    console.log('🔍 Verifying email configuration...');
    console.log(`📧 Email Service: ${ENV.EMAIL_SERVICE || 'Not specified'}`);
    console.log(`📧 Email User: ${ENV.EMAIL_USER ? ENV.EMAIL_USER.substring(0, 3) + '***' : 'Not set'}`);
    
    await transporter.verify();
    console.log('✅ Email service is ready and verified');
    return true;
  } catch (error) {
    console.error('❌ Email service verification failed:', error.message);
    console.error('Error code:', error.code);
    console.error('Error command:', error.command);
    
    // Provide helpful error messages
    if (error.code === 'ETIMEDOUT') {
      console.error('💡 Timeout Suggestions:');
      console.error('   1. Check if your SMTP host/port are correct');
      console.error('   2. Verify firewall settings allow SMTP connections');
      console.error('   3. Try using port 2525 if 587/465 are blocked');
      console.error('   4. Check if your hosting provider blocks SMTP (Render, Vercel, etc.)');
    } else if (error.code === 'EAUTH') {
      console.error('💡 Authentication Error: Check your email credentials');
    } else if (error.code === 'ECONNECTION') {
      console.error('💡 Connection Error: SMTP server might be down or unreachable');
    }
    
    return false;
  }
};

/**
 * Send email helper function with retry logic
 */
export const sendEmail = async ({ to, subject, html, attachments = [] }, retries = 3) => {
  if (!transporter) {
    console.warn('⚠️  Email not sent: Email service not configured');
    return { success: false, message: 'Email service not configured' };
  }

  const mailOptions = {
    from: `"${ENV.EMAIL_FROM_NAME || 'TrendBite'}" <${ENV.EMAIL_FROM || ENV.EMAIL_USER}>`,
    to,
    subject,
    html,
    attachments
  };

  let lastError;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`📧 Sending email to ${to} (Attempt ${attempt}/${retries})...`);
      console.log(`📧 Mail Options:`, mailOptions);
      console.log(`📧 Transporter:`, transporter);
      const info = await transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${to}:`, info.messageId);
      
      return {
        success: true,
        messageId: info.messageId,
        response: info.response,
        attempts: attempt
      };
    } catch (error) {
      lastError = error;
      console.error(`❌ Email send attempt ${attempt}/${retries} failed:`, error.message);
      console.error(`   Error code: ${error.code}`);
      console.error(`   Recipient: ${to}`);
      
      // If it's the last attempt, don't wait
      if (attempt < retries) {
        const waitTime = attempt * 2000; // Exponential backoff: 2s, 4s, 6s
        console.log(`⏳ Waiting ${waitTime/1000}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // All retries failed
  console.error(`❌ Failed to send email to ${to} after ${retries} attempts`);
  console.error('Last error:', lastError);
  
  // Provide specific guidance based on error type
  if (lastError.code === 'ETIMEDOUT') {
    console.error('💡 Connection Timeout Solutions:');
    console.error('   - Brevo: Try port 587 with smtp-relay.brevo.com');
    console.error('   - SendGrid: Try port 587 with smtp.sendgrid.net');
    console.error('   - Gmail: Ensure App Password is used (not regular password)');
    console.error('   - Consider using an API-based solution (Brevo API, SendGrid API)');
  }
  
  return {
    success: false,
    message: lastError.message,
    error: lastError,
    attempts: retries
  };
};

export default {
  transporter,
  verifyEmailConfig,
  sendEmail
};

