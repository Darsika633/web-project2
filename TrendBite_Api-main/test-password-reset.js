import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api/users';

// Test 1: Request Password Reset
async function testForgotPassword() {
  console.log('\n📧 Testing Forgot Password...');
  console.log('─'.repeat(50));
  
  try {
    const response = await fetch(`${API_URL}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com' // Replace with a real email from your database
      })
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Password reset email sent successfully!');
      console.log('📬 Check the email inbox for reset link');
    } else {
      console.log('❌ Failed to send password reset email');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test 2: Reset Password with Token
async function testResetPassword(token, newPassword) {
  console.log('\n🔑 Testing Reset Password...');
  console.log('─'.repeat(50));
  
  try {
    const response = await fetch(`${API_URL}/reset-password/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password: newPassword
      })
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('✅ Password reset successful!');
      console.log('🎫 New JWT Token:', data.data?.token?.substring(0, 20) + '...');
      console.log('👤 User:', data.data?.user?.email);
    } else {
      console.log('❌ Password reset failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test 3: Reset Password with Invalid Token
async function testResetPasswordInvalidToken() {
  console.log('\n🔒 Testing Reset Password with Invalid Token...');
  console.log('─'.repeat(50));
  
  try {
    const response = await fetch(`${API_URL}/reset-password/invalid-token-123`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password: 'newpassword123'
      })
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (!data.success && data.message.includes('Invalid or expired')) {
      console.log('✅ Correctly rejected invalid token');
    } else {
      console.log('❌ Unexpected response for invalid token');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Test 4: Reset Password with Short Password
async function testResetPasswordShortPassword(token) {
  console.log('\n⚠️  Testing Reset Password with Short Password...');
  console.log('─'.repeat(50));
  
  try {
    const response = await fetch(`${API_URL}/reset-password/${token}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        password: '123' // Too short
      })
    });

    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    if (!data.success && data.message.includes('at least 6 characters')) {
      console.log('✅ Correctly validated password length');
    } else {
      console.log('❌ Password validation failed');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('\n🧪 Password Reset Feature Tests');
  console.log('═'.repeat(50));
  
  // Test 1: Forgot Password
  await testForgotPassword();
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 2: Invalid Token
  await testResetPasswordInvalidToken();
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('\n\n📝 Manual Testing Instructions:');
  console.log('═'.repeat(50));
  console.log('1. Check the email inbox for the reset link');
  console.log('2. Extract the token from the email URL');
  console.log('3. Run: node test-password-reset.js reset <token> <new-password>');
  console.log('\nExample:');
  console.log('  node test-password-reset.js reset abc123def456 mynewpassword123');
  console.log('');
}

// Command line interface
const command = process.argv[2];
const token = process.argv[3];
const password = process.argv[4];

if (command === 'reset' && token && password) {
  testResetPassword(token, password);
} else if (command === 'reset' && token) {
  testResetPasswordShortPassword(token);
} else {
  runTests();
}

