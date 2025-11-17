import React, { useState } from "react";
import { Eye, EyeOff, CheckCircle, Lock } from 'lucide-react';

const SetNewPasswordPage = () => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    password: "",
    confirmPassword: ""
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // Password strength validation
  const validatePassword = (password) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    return requirements;
  };

  const passwordRequirements = validatePassword(formData.password);
  const isPasswordStrong = Object.values(passwordRequirements).every(req => req);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Validation
    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (!isPasswordStrong) {
      newErrors.password = "Password doesn't meet requirements";
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Call change-password API
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users/change-password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.password
        })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setIsSuccess(true);
        setErrors({});
      } else {
        setErrors({ password: result.message || 'Failed to change password' });
      }
    } catch (err) {
      setErrors({ password: 'Network error. Please try again.' },err);
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Simulate API call
    console.log("Setting new password:", formData);
    setIsSuccess(true);
  };


  return (
    <div className="min-h-screen">
      {/* Header Section with Title and Image */}
      <div className="min-h-screen flex">
        <div className="w-1/2 flex flex-col justify-center px-16 bg-white">
          <div className="max-w-md">
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
                Set New Password
              </span>
            </div>
            {/* Horizontal line separator */}
            <div className="w-16 h-1 bg-red-500 mb-16"></div>
          </div>
        </div>
        
        {/* Right side - Background image */}
        <div className="w-1/2 relative mt-24">
          <img
            src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&h=800&fit=crop&crop=center"
            alt="Set New Password Banner"
            className="absolute inset-0 w-full h-[400px] object-cover object-center"
          />
        </div>
      </div>

      {/* Main Set New Password Section */}
      <div className="bg-white">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Side - Set New Password Form (only one form: current, new, confirm) */}
            <div className="lg:col-span-8">
              <div className="max-w-2xl">
                {!isSuccess ? (
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <h2 
                      className="mb-6"
                      style={{ 
                        color: 'rgb(0, 0, 0)',
                        font: '400 36px / 42px "Josefin Sans", sans-serif'
                      }}
                    >
                      Update Password
                    </h2>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${errors.currentPassword ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                      />
                      {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                    </div>
                    <button
                      type="submit"
                      className="w-full py-3 bg-black text-white font-semibold rounded hover:bg-gray-800 transition"
                    >
                      Update Password
                    </button>
                  </form>
                ) : (
                  <div className="text-center">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Password Updated!</h3>
                    <p className="text-gray-600 mb-6">Your password has been changed successfully.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side - Password Requirements */}
            <div className="lg:col-span-4">
              <div className="bg-gray-50 p-8 rounded-lg sticky top-4">
                <h3 
                  className="mb-6"
                  style={{ 
                    color: 'rgb(0, 0, 0)',
                    font: '400 28px / 34px "Josefin Sans", sans-serif'
                  }}
                >
                  Password Requirements
                </h3>
                
                <div className="space-y-4">
                  <div className={`flex items-center space-x-3 ${passwordRequirements.length ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircle className="w-4 h-4" />
                    <span 
                      style={{ 
                        font: '14px / 20px Raleway, sans-serif'
                      }}
                    >
                      At least 8 characters
                    </span>
                  </div>
                  
                  <div className={`flex items-center space-x-3 ${passwordRequirements.uppercase ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircle className="w-4 h-4" />
                    <span 
                      style={{ 
                        font: '14px / 20px Raleway, sans-serif'
                      }}
                    >
                      One uppercase letter
                    </span>
                  </div>
                  
                  <div className={`flex items-center space-x-3 ${passwordRequirements.lowercase ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircle className="w-4 h-4" />
                    <span 
                      style={{ 
                        font: '14px / 20px Raleway, sans-serif'
                      }}
                    >
                      One lowercase letter
                    </span>
                  </div>
                  
                  <div className={`flex items-center space-x-3 ${passwordRequirements.number ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircle className="w-4 h-4" />
                    <span 
                      style={{ 
                        font: '14px / 20px Raleway, sans-serif'
                      }}
                    >
                      One number
                    </span>
                  </div>
                  
                  <div className={`flex items-center space-x-3 ${passwordRequirements.special ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircle className="w-4 h-4" />
                    <span 
                      style={{ 
                        font: '14px / 20px Raleway, sans-serif'
                      }}
                    >
                      One special character
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Tips */}
              <div className="mt-8 bg-blue-50 p-6 rounded-lg">
                <h4 
                  className="font-medium mb-4"
                  style={{ 
                    color: 'rgb(0, 0, 0)',
                    font: '18px / 24px Raleway, sans-serif'
                  }}
                >
                  Security Tips
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p 
                      style={{ 
                        color: 'rgb(119, 119, 119)',
                        font: '14px / 20px Raleway, sans-serif'
                      }}
                    >
                      Use a unique password you haven't used before
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p 
                      style={{ 
                        color: 'rgb(119, 119, 119)',
                        font: '14px / 20px Raleway, sans-serif'
                      }}
                    >
                      Avoid common words or personal information
                    </p>
                  </div>
                  
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p 
                      style={{ 
                        color: 'rgb(119, 119, 119)',
                        font: '14px / 20px Raleway, sans-serif'
                      }}
                    >
                      Consider using a password manager
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

export default SetNewPasswordPage;