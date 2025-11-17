import React, { useState } from "react";
import { Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ResetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (!email) return setError('Please enter your email');

    setLoading(true);
    const base = import.meta.env.VITE_API_BASE_URL || '';
    const url = `${base}/api/users/forgot-password`;

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const message = data?.message || 'Failed to send reset link';
          throw new Error(message);
        }
        return data;
      })
      .then(() => {
        // expected: { success: true, message: 'Password reset link has been sent to your email' }
        setIsSubmitted(true);
      })
      .catch((err) => {
        setError(err.message || 'An unexpected error occurred');
      })
      .finally(() => setLoading(false));
  };

  const handleBackToLogin = () => {
    // Navigate back to login page
    // If using react-router, navigate to /login
    if (navigate) navigate('/login');
  };

  return (
    <div className="min-h-screen">
      {/* Header Section with Title and Image */}
      <div className="min-h-screen flex">
        <div className="w-1/2 flex flex-col justify-center px-16 bg-white">
          <div className="max-w-md">
            <h1 
              className="mb-8 text-black"
              style={{ 
                font: '400 48px / 54px "Josefin Sans", sans-serif'
              }}
            >
              Reset Password
            </h1>
            
            {/* Breadcrumb navigation */}
            <div className="flex items-center space-x-2 text-gray-600 mb-4">
              <a 
                href="/" 
                className="hover:text-black transition-colors"
                style={{ 
                  color: 'rgb(102, 102, 102)',
                  font: '14px / 20px Raleway, sans-serif'
                }}
              >
                Home
              </a>
              <span 
                style={{ 
                  color: 'rgb(102, 102, 102)',
                  font: '14px / 20px Raleway, sans-serif'
                }}
              >
                /
              </span>
              <span 
                className="font-medium"
                style={{ 
                  color: 'rgb(235, 87, 87)',
                  font: '14px / 20px Raleway, sans-serif'
                }}
              >
                Reset Password
              </span>
            </div>
            
            {/* Horizontal line separator */}
            <div className="w-16 h-1 bg-red-500 mb-16"></div>
          </div>
        </div>
        
        {/* Right side - Background image */}
        <div className="w-1/2 relative mt-24">
          <img
            src="https://mollee-html-ten.vercel.app/assets/img/sale-image_1.jpg"
            alt="Reset Password Banner"
            className="absolute inset-0 w-full h-auto object-cover object-center"
          />
        </div>
      </div>

      {/* Main Reset Password Section */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Side - Reset Password Form */}
            <div className="lg:col-span-8">
              <div className="max-w-2xl">
                {!isSubmitted ? (
                  <>
                    <h2 
                      className="mb-6"
                      style={{ 
                        color: 'rgb(0, 0, 0)',
                        font: '400 36px / 42px "Josefin Sans", sans-serif'
                      }}
                    >
                      Forgot Your Password?
                    </h2>

                    <p 
                      className="mb-8"
                      style={{ 
                        color: 'rgb(119, 119, 119)',
                        font: '16px / 24px Raleway, sans-serif'
                      }}
                    >
                      Enter your email address and we'll send you a link to reset your password.
                    </p>

                    {/* Reset Password form */}
                    <form onSubmit={handleSubmit} className="space-y-8">
                      <div className="relative">
                        <Mail className="absolute left-0 top-4 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter your email address"
                          required
                          className="w-full pl-8 pr-0 py-4 border-0 border-b border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:border-black focus:outline-none transition-colors"
                          style={{ font: '16px / 24px Raleway, sans-serif' }}
                        />
                      </div>

                      {error && (
                        <div className="text-sm text-red-600">{error}</div>
                      )}

                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={loading}
                          className={`bg-black text-white py-4 px-8 hover:bg-gray-800 transition-colors mb-6 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                          style={{ font: '600 16px / 24px Raleway, sans-serif' }}
                        >
                          {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                        <button
                          type="button"
                          onClick={handleBackToLogin}
                          className="hover:text-red-600 transition-colors"
                          style={{ 
                            color: 'rgb(119, 119, 119)',
                            font: '16px / 24px Raleway, sans-serif'
                          }}
                        >
                          Back to{' '}
                          <span 
                            className="hover:text-red-600 transition-colors"
                            style={{ 
                              color: 'rgb(235, 87, 87)',
                              font: '16px / 24px Raleway, sans-serif'
                            }}
                          >
                            Login
                          </span>
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  // Success state
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Mail className="w-8 h-8 text-green-600" />
                    </div>
                    
                    <h2 
                      className="mb-6"
                      style={{ 
                        color: 'rgb(0, 0, 0)',
                        font: '400 36px / 42px "Josefin Sans", sans-serif'
                      }}
                    >
                      Check Your Email
                    </h2>

                    <p 
                      className="mb-8"
                      style={{ 
                        color: 'rgb(119, 119, 119)',
                        font: '16px / 24px Raleway, sans-serif'
                      }}
                    >
                      We've sent a password reset link to{' '}
                      <span className="font-medium text-black">{email}</span>
                    </p>

                    <div className="space-y-4">
                      <button
                        onClick={() => setIsSubmitted(false)}
                        className="bg-black text-white py-4 px-8 hover:bg-gray-800 transition-colors block mx-auto"
                        style={{ font: '600 16px / 24px Raleway, sans-serif' }}
                      >
                        Try Another Email
                      </button>
                      
                      <div className="flex items-center justify-center space-x-2">
                        <ArrowLeft className="w-4 h-4 text-gray-500" />
                        <button
                          onClick={handleBackToLogin}
                          className="hover:text-red-600 transition-colors"
                          style={{ 
                            color: 'rgb(119, 119, 119)',
                            font: '16px / 24px Raleway, sans-serif'
                          }}
                        >
                          Back to{' '}
                          <span 
                            className="hover:text-red-600 transition-colors"
                            style={{ 
                              color: 'rgb(235, 87, 87)',
                              font: '16px / 24px Raleway, sans-serif'
                            }}
                          >
                            Login
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Help Info */}
            <div className="lg:col-span-4">
              <div className="bg-gray-50 p-8 rounded-lg sticky top-4">
                <h3 
                  className="mb-6"
                  style={{ 
                    color: 'rgb(0, 0, 0)',
                    font: '400 28px / 34px "Josefin Sans", sans-serif'
                  }}
                >
                  Need Help?
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 
                        className="font-medium mb-2"
                        style={{ 
                          color: 'rgb(0, 0, 0)',
                          font: '16px / 24px Raleway, sans-serif'
                        }}
                      >
                        Check your spam folder
                      </h4>
                      <p 
                        style={{ 
                          color: 'rgb(119, 119, 119)',
                          font: '14px / 20px Raleway, sans-serif'
                        }}
                      >
                        Sometimes reset emails end up in spam or junk folders.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 
                        className="font-medium mb-2"
                        style={{ 
                          color: 'rgb(0, 0, 0)',
                          font: '16px / 24px Raleway, sans-serif'
                        }}
                      >
                        Wait a few minutes
                      </h4>
                      <p 
                        style={{ 
                          color: 'rgb(119, 119, 119)',
                          font: '14px / 20px Raleway, sans-serif'
                        }}
                      >
                        It may take a few minutes for the email to arrive.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <h4 
                        className="font-medium mb-2"
                        style={{ 
                          color: 'rgb(0, 0, 0)',
                          font: '16px / 24px Raleway, sans-serif'
                        }}
                      >
                        Try a different email
                      </h4>
                      <p 
                        style={{ 
                          color: 'rgb(119, 119, 119)',
                          font: '14px / 20px Raleway, sans-serif'
                        }}
                      >
                        Make sure you're using the email associated with your account.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 
                    className="font-medium mb-3"
                    style={{ 
                      color: 'rgb(0, 0, 0)',
                      font: '16px / 24px Raleway, sans-serif'
                    }}
                  >
                    Still having trouble?
                  </h4>
                  <p 
                    className="mb-4"
                    style={{ 
                      color: 'rgb(119, 119, 119)',
                      font: '14px / 20px Raleway, sans-serif'
                    }}
                  >
                    Contact our support team for assistance.
                  </p>
                  <button
                    className="bg-black text-white py-3 px-6 hover:bg-gray-800 transition-colors text-sm"
                    style={{ font: '600 14px / 20px Raleway, sans-serif' }}
                  >
                    Contact Support
                  </button>
                </div>
              </div>

              {/* Security Note */}
              <div className="mt-8 bg-blue-50 p-6 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <div>
                    <h4 
                      className="font-medium mb-2"
                      style={{ 
                        color: 'rgb(0, 0, 0)',
                        font: '16px / 24px Raleway, sans-serif'
                      }}
                    >
                      Security Note
                    </h4>
                    <p 
                      style={{ 
                        color: 'rgb(119, 119, 119)',
                        font: '14px / 20px Raleway, sans-serif'
                      }}
                    >
                      For your security, reset links expire after 24 hours. If you don't reset your password within this time, you'll need to request a new link.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;