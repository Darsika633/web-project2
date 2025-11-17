import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Facebook, Twitter, Instagram } from 'lucide-react';
import axios from 'axios';

export default function RegisterForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agreeToPrivacy: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError(''); // Clear error when user starts typing
    if (success) setSuccess(''); // Clear success message when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    setFieldErrors({});

    // Validation
    const errors = {};
    // First/Last name — letters only
    // Use Unicode-aware regex if you need international characters: const nameRegex = /^[\p{L}]+$/u;
    const nameRegex = /^[A-Za-z]+$/;
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (!nameRegex.test(formData.firstName.trim())) {
      errors.firstName = 'First name must contain only letters';
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (!nameRegex.test(formData.lastName.trim())) {
      errors.lastName = 'Last name must contain only letters';
    }
    // Email
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^([a-zA-Z0-9_\-.]+)@([a-zA-Z0-9_\-.]+)\.([a-zA-Z]{2,5})$/.test(formData.email)) {
      errors.email = 'Enter a valid email address';
    }
    // Password
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}/.test(formData.password)) {
      errors.password = 'Password must contain uppercase, lowercase, number, and special character';
    }
    // Confirm Password
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    // Phone (accepts 764539863, 0774539863, +94764539863, +94 764539863)
    if (formData.phone) {
      const phone = formData.phone.trim().replace(/\s+/g, '');
      const valid = /^7\d{8}$/.test(phone) || /^0\d{9}$/.test(phone) || /^\+947\d{8}$/.test(phone) || /^\+94\d{9}$/.test(phone);
      if (!valid) {
        errors.phone = 'Enter a valid Sri Lankan mobile number (e.g. 764539863, 0774539863, +94764539863, +94 764539863)';
      }
    }
    // Privacy Policy
    if (!formData.agreeToPrivacy) {
      errors.agreeToPrivacy = 'You must agree to the privacy policy';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      // Prepare data for API (based on User schema)
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone || undefined, // Optional field
      };

      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/users/register`, userData);

      console.log('Registration successful:', response.data);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
   return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Layout */}
      <div className="lg:hidden">
        <div className="bg-white px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-normal text-black mb-4">Registration</h1>
            
            {/* Breadcrumb navigation */}
            <div className="flex items-center space-x-2 text-gray-600 text-sm mb-6">
              <a href="/" className="hover:text-black transition-colors">
                Home
              </a>
              <span className="text-orange-400">Registration</span>
            </div>
            
            {/* Horizontal line separator */}
            <div className="w-full h-px bg-gray-300"></div>
          </div>

          {/* Registration form section */}
          <div className="max-w-sm mx-auto">
            <h2 className="text-2xl font-normal mb-4 text-black">Register Now</h2>

            <p className="text-gray-600 mb-6 text-sm leading-relaxed">
              For your convenience, we have made it possible to register via social networks.
            </p>

            {/* Social login icons */}
            <div className="flex justify-center space-x-4 mb-8">
              <button className="w-10 h-10 bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors duration-200 rounded">
                <Facebook className="w-4 h-4 text-blue-600" />
              </button>
              <button className="w-10 h-10 bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors duration-200 rounded">
                <Twitter className="w-4 h-4 text-blue-400" />
              </button>
              <button className="w-10 h-10 bg-pink-50 flex items-center justify-center hover:bg-pink-100 transition-colors duration-200 rounded">
                <Instagram className="w-4 h-4 text-pink-600" />
              </button>
              <button className="w-10 h-10 bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors duration-200 rounded">
                <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
            </div>

            {/* Registration form */}
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
                  {success}
                </div>
              )}
              
              {/* Name fields - stacked on mobile */}
              <div className="space-y-6">
                <div>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder="Enter your first name"
                    className="w-full px-0 py-3 border-0 border-b border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:border-black focus:outline-none text-sm"
                    required
                  />
                  {fieldErrors.firstName && <div className="text-red-500 text-xs mt-1">{fieldErrors.firstName}</div>}
                </div>
                <div>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder="Enter your last name"
                    className="w-full px-0 py-3 border-0 border-b border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:border-black focus:outline-none text-sm"
                    required
                  />
                  {fieldErrors.lastName && <div className="text-red-500 text-xs mt-1">{fieldErrors.lastName}</div>}
                </div>
              </div>

              {/* Email and Phone - stacked on mobile */}
              <div className="space-y-6">
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="w-full px-0 py-3 border-0 border-b border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:border-black focus:outline-none text-sm"
                    required
                  />
                  {fieldErrors.email && <div className="text-red-500 text-xs mt-1">{fieldErrors.email}</div>}
                </div>
                <div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone (optional)"
                    className="w-full px-0 py-3 border-0 border-b border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:border-black focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Password fields - stacked on mobile */}
              <div className="space-y-6">
                <div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    className="w-full px-0 py-3 border-0 border-b border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:border-black focus:outline-none text-sm"
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm password"
                    className="w-full px-0 py-3 border-0 border-b border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:border-black focus:outline-none text-sm"
                    required
                  />
                </div>
              </div>

              <div className="pt-4">
                <label className="flex items-start mb-4">
                  <input 
                    type="checkbox" 
                    name="agreeToPrivacy"
                    checked={formData.agreeToPrivacy}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black mt-1"
                    required
                  />
                  <span className="ml-3 text-gray-700 text-sm leading-relaxed">
                    I agree with the <a href="#" className="text-orange-400 hover:text-orange-500">Privacy policy</a>
                  </span>
                </label>

                <div className="text-sm text-gray-600 mb-6">
                  Already have an account? Then{' '}
                  <a href="/login" className="text-orange-400 hover:text-orange-500">
                    log in
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-sm font-medium rounded"
              >
                {loading ? 'Creating Account...' : 'Register'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:block">
        {/* Top section with title and breadcrumb */}
        <div className="min-h-screen flex ">
          <div className="w-1/2 flex flex-col justify-center px-16 bg-white">
            <div className="max-w-md">
              <h1 className="text-6xl font-normal mb-8 text-black">Registration</h1>
              
              {/* Breadcrumb navigation */}
              <div className="flex items-center space-x-2 text-gray-600 mb-4">
                <a href="/" className="hover:text-black transition-colors">
                  Home
                </a>
                <span className="text-orange-400">Registration</span>
              </div>
              
              {/* Horizontal line separator */}
              <div className="w-full h-px bg-gray-300 mb-16"></div>
            </div>
          </div>
          
          {/* Right side - Background image */}
          <div className="w-1/2 relative mt-24">
            <img
              src="https://images.pexels.com/photos/974911/pexels-photo-974911.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt="Man in clothing store"
              className="absolute inset-0 w-full object-cover object-center"
            />
          </div>
        </div>

        {/* Main registration section */}
        <div className="min-h-screen flex">
          {/* Left side - Background image */}
          <div className="w-1/2 relative">
            <img
              src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt="Woman with glasses in relaxed pose"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>

          {/* Right side - Registration form */}
          <div className="w-1/2 flex flex-col justify-center px-16 bg-white">
            <div className="max-w-lg w-full">
              <h2 className="text-4xl font-normal mb-6 text-black">Register Now</h2>

              <p className="text-gray-600 mb-8 text-base leading-relaxed">
                For your convenience, we have made it possible to register via
                <br />
                social networks.
              </p>

              {/* Social login icons */}
              <div className="flex space-x-4 mb-12">
                <button className="w-12 h-12 bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors duration-200 rounded">
                  <Facebook className="w-5 h-5 text-blue-600" />
                </button>
                <button className="w-12 h-12 bg-blue-50 flex items-center justify-center hover:bg-blue-100 transition-colors duration-200 rounded">
                  <Twitter className="w-5 h-5 text-blue-400" />
                </button>
                <button className="w-12 h-12 bg-pink-50 flex items-center justify-center hover:bg-pink-100 transition-colors duration-200 rounded">
                  <Instagram className="w-5 h-5 text-pink-600" />
                </button>
                <button className="w-12 h-12 bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors duration-200 rounded">
                  <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </button>
              </div>

              {/* Registration form */}
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
                    {success}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="Enter your first name"
                      className="w-full px-0 py-3 border-0 border-b border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:border-black focus:outline-none text-base"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Enter your last name"
                      className="w-full px-0 py-3 border-0 border-b border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:border-black focus:outline-none text-base"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      className="w-full px-0 py-3 border-0 border-b border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:border-black focus:outline-none text-base"
                      required
                    />
                  </div>
                  <div className="flex items-center">
                    <span className="px-2 py-3 border-0 border-b border-gray-300 bg-transparent text-gray-900 text-base select-none">+94</span>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter your phone (optional)"
                      className="w-full px-0 py-3 border-0 border-b border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:border-black focus:outline-none text-base"
                      style={{ marginLeft: '-1px' }}
                    />
                    {fieldErrors.phone && <div className="text-red-500 text-xs mt-1">{fieldErrors.phone}</div>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter password"
                      className="w-full px-0 py-3 border-0 border-b border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:border-black focus:outline-none text-base"
                      required
                    />
                    {fieldErrors.password && <div className="text-red-500 text-xs mt-1">{fieldErrors.password}</div>}
                  </div>
                  <div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm password"
                      className="w-full px-0 py-3 border-0 border-b border-gray-300 bg-transparent text-gray-900 placeholder-gray-500 focus:border-black focus:outline-none text-base"
                      required
                    />
                    {fieldErrors.confirmPassword && <div className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</div>}
                  </div>
                </div>

                <div className="pt-4">
                  <label className="flex items-start mb-4">
                    <input 
                      type="checkbox" 
                      name="agreeToPrivacy"
                      checked={formData.agreeToPrivacy}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black mt-1"
                      required
                    />
                    {fieldErrors.agreeToPrivacy && <div className="text-red-500 text-xs mt-1">{fieldErrors.agreeToPrivacy}</div>}
                    <span className="ml-3 text-gray-700 text-sm leading-relaxed">
                      I agree with the <a href="#" className="text-orange-400 hover:text-orange-500">Privacy policy</a>
                    </span>
                  </label>

                  <div className="text-sm text-gray-600 mb-6">
                    Already have an account? Then{' '}
                    <a href="/login" className="text-orange-400 hover:text-orange-500">
                      log in
                    </a>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-black text-white py-3 px-8 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-base font-medium rounded"
                >
                  {loading ? 'Creating Account...' : 'Register'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}
