# Password Reset Documentation

This document explains the password reset (forgot password) functionality implemented in TrendBite API.

## Overview

The password reset feature allows users to securely reset their password by receiving a reset link via email. The implementation follows security best practices with token expiration and hashed tokens.

## Features

✅ Secure password reset via email  
✅ Token-based authentication with 1-hour expiration  
✅ Beautiful HTML email template  
✅ Automatic login after successful password reset  
✅ Security measures to prevent email enumeration  

## How It Works

### 1. User Requests Password Reset

**Endpoint**: `POST /api/users/forgot-password`

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Process**:
1. User submits their email address
2. System checks if user exists and is active
3. Generates a secure random token (32 bytes)
4. Hashes the token using SHA-256 and stores it in database
5. Sets expiration time to 1 hour from now
6. Sends beautiful HTML email with reset link
7. Returns success message (same message regardless of email existence for security)

**Response**:
```json
{
  "success": true,
  "message": "Password reset link has been sent to your email"
}
```

### 2. User Receives Email

The user receives a beautifully designed email containing:
- Personalized greeting with their name
- Clear explanation of the password reset request
- Prominent "Reset Password" button
- Alternative plain text link (if button doesn't work)
- Security notice about ignoring the email if they didn't request it
- Expiration notice (1 hour)

**Email Contains**:
- Reset link: `{FRONTEND_URL}/reset-password/{token}`
- Token is the unhashed version (not stored in database)

### 3. User Resets Password

**Endpoint**: `POST /api/users/reset-password/:token`

**Request**:
```json
{
  "password": "newSecurePassword123"
}
```

**Process**:
1. Token from URL is hashed using SHA-256
2. System finds user with matching hashed token
3. Checks if token hasn't expired (within 1 hour)
4. Updates user's password (automatically hashed by pre-save hook)
5. Clears reset token and expiration from database
6. Generates new JWT token for automatic login
7. Returns user data and authentication token

**Success Response (200)**:
```json
{
  "success": true,
  "message": "Password reset successful",
  "data": {
    "user": {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "customer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400)**:
```json
{
  "success": false,
  "message": "Invalid or expired reset token"
}
```

## Database Schema Updates

### User Model Fields Added

```javascript
{
  resetPasswordToken: {
    type: String,
    select: false  // Not included in queries by default
  },
  resetPasswordExpires: {
    type: Date,
    select: false  // Not included in queries by default
  }
}
```

### User Model Methods Added

```javascript
// Instance method to generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  // Generate random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token and save to database
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  // Set expiry time (1 hour from now)
  this.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
  
  // Return unhashed token (this is what we'll send to user)
  return resetToken;
};
```

## Security Features

### 1. Token Hashing
- Plain token sent in email is NOT stored in database
- Database stores SHA-256 hashed version
- Even if database is compromised, tokens cannot be used

### 2. Token Expiration
- Tokens expire after 1 hour
- Expired tokens are rejected
- Old tokens are cleared after password reset

### 3. Email Enumeration Prevention
- Same success message returned whether email exists or not
- Prevents attackers from discovering valid email addresses

### 4. Inactive Account Protection
- Password reset not sent for inactive accounts
- Same success message returned (no information leakage)

### 5. Automatic Token Cleanup
- Reset tokens are cleared after successful password reset
- Prevents token reuse

## Email Template

The password reset email includes:
- Professional gradient header (purple/blue)
- Personalized greeting
- Clear call-to-action button
- Alternative text link
- Security warning notice
- Expiration reminder
- Responsive design for mobile devices

## Environment Variables Required

```env
# Frontend URL for reset link
FRONTEND_URL=http://localhost:3000

# Email service (already configured)
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=noreply@trendbite.com
BREVO_SENDER_NAME=TrendBite
```

## API Endpoints Summary

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/users/forgot-password` | Public | Request password reset link |
| POST | `/api/users/reset-password/:token` | Public | Reset password with token |

## Testing the Feature

### 1. Request Password Reset

```bash
curl -X POST http://localhost:5000/api/users/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

### 2. Check Email

Look for an email with subject: "Reset Your Password - TrendBite 🔐"

### 3. Reset Password

```bash
curl -X POST http://localhost:5000/api/users/reset-password/TOKEN_FROM_EMAIL \
  -H "Content-Type: application/json" \
  -d '{
    "password": "newSecurePassword123"
  }'
```

## Error Scenarios

### Invalid Email Format
- Caught by email validation
- Returns 400 error

### Token Not Found or Expired
- Returns 400 error
- Message: "Invalid or expired reset token"

### Password Too Short
- Returns 400 error
- Message: "Password must be at least 6 characters long"

### Email Service Failure
- Reset token is cleared from database
- Returns 500 error
- Message: "Error sending email. Please try again later."

## Frontend Integration

### Step 1: Forgot Password Page
Create a form that submits email to `/api/users/forgot-password`

```javascript
const handleForgotPassword = async (email) => {
  const response = await fetch('/api/users/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  
  const data = await response.json();
  // Show success message
};
```

### Step 2: Reset Password Page
Create a page at `/reset-password/:token` route

```javascript
const handleResetPassword = async (token, password) => {
  const response = await fetch(`/api/users/reset-password/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  
  const data = await response.json();
  if (data.success) {
    // Store JWT token
    localStorage.setItem('token', data.data.token);
    // Redirect to dashboard
    window.location.href = '/dashboard';
  }
};
```

## Files Modified/Created

### Modified Files:
1. `src/models/User.js` - Added reset token fields and method
2. `src/controllers/userController.js` - Added forgotPassword and resetPassword controllers
3. `src/routes/userRoutes.js` - Added forgot/reset password routes
4. `src/utils/emailTemplates.js` - Added password reset email template
5. `src/utils/emailService.js` - Added sendPasswordResetEmail function
6. `API_ENDPOINTS_DOCUMENTATION.md` - Updated with new endpoints

### Created Files:
1. `PASSWORD_RESET_DOCUMENTATION.md` - This documentation file

## Best Practices Implemented

✅ **Security**: Tokens are hashed, expired, and single-use  
✅ **User Experience**: Beautiful emails, automatic login after reset  
✅ **Error Handling**: Comprehensive error messages and validation  
✅ **Documentation**: Complete API documentation and Swagger specs  
✅ **Code Quality**: Clean, maintainable, well-commented code  

## Troubleshooting

### Email Not Received
1. Check spam/junk folder
2. Verify BREVO_API_KEY is correct
3. Check email service logs in console
4. Verify BREVO_SENDER_EMAIL is verified in Brevo dashboard

### Token Invalid Error
1. Check if token has expired (1 hour limit)
2. Ensure token from email matches URL parameter
3. Verify token hasn't been used already

### Password Not Updating
1. Check password meets minimum length (6 characters)
2. Verify user exists and is active
3. Check database connection

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify all environment variables are set
3. Test email service separately
4. Review API documentation

---

**Last Updated**: October 10, 2025  
**Version**: 1.0.0

