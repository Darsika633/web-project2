# 🚀 Quick Start - Password Reset Feature

## What You Got

A complete **Forgot Password** feature with email functionality is now implemented in your TrendBite API!

## 📍 New API Endpoints

### 1️⃣ Request Password Reset
```
POST /api/users/forgot-password
```

**Send this:**
```json
{
  "email": "user@example.com"
}
```

**Get this:**
```json
{
  "success": true,
  "message": "Password reset link has been sent to your email"
}
```

### 2️⃣ Reset Password
```
POST /api/users/reset-password/:token
```

**Send this:**
```json
{
  "password": "newPassword123"
}
```

**Get this:**
```json
{
  "success": true,
  "message": "Password reset successful",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

## 🧪 Test It Now!

### Using cURL:

**Step 1 - Request Reset:**
```bash
curl -X POST http://localhost:5000/api/users/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test-email@example.com"}'
```

**Step 2 - Check Email** (the user will receive a beautiful email with a reset link)

**Step 3 - Reset Password:**
```bash
curl -X POST http://localhost:5000/api/users/reset-password/TOKEN_FROM_EMAIL \
  -H "Content-Type: application/json" \
  -d '{"password":"newPassword123"}'
```

### Using the Test Script:
```bash
node test-password-reset.js
```

## 📧 What Users Get

Users receive a **beautiful HTML email** with:
- 🎨 Professional gradient design (purple/blue)
- 👋 Personalized greeting: "Hi John Doe"
- 🔗 Big "Reset Password" button
- 📝 Alternative text link
- ⚠️  Security warning
- ⏰ "Expires in 1 hour" notice

## 🔐 Security Features

✅ Secure random tokens (32 bytes)  
✅ Hashed tokens in database (SHA-256)  
✅ 1-hour expiration  
✅ Single-use tokens  
✅ Email enumeration prevention  
✅ Inactive account protection  

## 🎯 Frontend Integration

### React/Next.js Example:

**Forgot Password Page:**
```jsx
const handleForgotPassword = async (email) => {
  const res = await fetch('/api/users/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  alert(data.message);
};
```

**Reset Password Page (route: `/reset-password/:token`):**
```jsx
const handleResetPassword = async (token, password) => {
  const res = await fetch(`/api/users/reset-password/${token}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password })
  });
  const data = await res.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    router.push('/dashboard'); // User is now logged in!
  }
};
```

## ⚙️ Environment Variables

Make sure these are in your `.env` file:
```env
FRONTEND_URL=http://localhost:3000
BREVO_API_KEY=your_api_key
BREVO_SENDER_EMAIL=noreply@trendbite.com
BREVO_SENDER_NAME=TrendBite
```

## 📚 Documentation

- **Full Documentation**: `PASSWORD_RESET_DOCUMENTATION.md`
- **Implementation Summary**: `PASSWORD_RESET_IMPLEMENTATION_SUMMARY.md`
- **API Reference**: `API_ENDPOINTS_DOCUMENTATION.md`
- **Test Script**: `test-password-reset.js`

## ✅ What Was Changed

1. ✅ User model updated with reset token fields
2. ✅ Two new API endpoints created
3. ✅ Beautiful email template added
4. ✅ Email service function created
5. ✅ Complete documentation added
6. ✅ Swagger/OpenAPI docs added
7. ✅ Test script created

## 🎉 You're Ready!

The feature is **fully functional** and **production-ready**. Just make sure your Brevo email service is configured!

---

**Need Help?**
- Check `PASSWORD_RESET_DOCUMENTATION.md` for detailed docs
- Run `node test-password-reset.js` to test
- View Swagger docs at `http://localhost:5000/api-docs`

