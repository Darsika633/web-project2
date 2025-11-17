import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Phone, MapPin, Edit3, Save, X, Upload, Camera, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import { mockApi } from '../../services/mockApi';
import toast from 'react-hot-toast';

const DeliveryProfile = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || ''
        }
      });
      
      // Set profile image if available
      if (user.avatar?.url) {
        setProfileImagePreview(user.avatar.url);
      }
    }
  }, [user]);

  const validateField = (field, value) => {
    let error = '';

    switch (field) {
      case 'firstName':
        if (!value.trim()) {
          error = 'First name is required';
        } else if (value.trim().length < 2) {
          error = 'First name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = 'First name can only contain letters';
        }
        break;

      case 'lastName':
        if (!value.trim()) {
          error = 'Last name is required';
        } else if (value.trim().length < 2) {
          error = 'Last name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = 'Last name can only contain letters';
        }
        break;

      case 'email':
        if (!value.trim()) {
          error = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;

      case 'phone':
        if (!value.trim()) {
          error = 'Phone number is required';
        } else if (!/^\d{10}$/.test(value.replace(/\D/g, ''))) {
          error = 'Phone number must be exactly 10 digits';
        }
        break;

      case 'address.street':
        if (!value.trim()) {
          error = 'Street address is required';
        }
        break;

      case 'address.city':
        if (!value.trim()) {
          error = 'City is required';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = 'City can only contain letters';
        }
        break;

      case 'address.state':
        if (!value.trim()) {
          error = 'State is required';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = 'State can only contain letters';
        }
        break;

      case 'address.zipCode':
        if (!value.trim()) {
          error = 'ZIP code is required';
        } else if (!/^\d{4,6}$/.test(value)) {
          error = 'ZIP code must be 4-6 digits';
        }
        break;

      case 'address.country':
        if (!value.trim()) {
          error = 'Country is required';
        } else if (!/^[a-zA-Z\s]+$/.test(value)) {
          error = 'Country can only contain letters';
        }
        break;

      default:
        break;
    }

    return error;
  };

  const handleInputChange = (field, value) => {
    // Update the field value
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProfileData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Validate the field
    const error = validateField(field, value);
    
    // Update errors
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setErrors(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: error
        }
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        [field]: error
      }));
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setProfileImage(file);
    setProfileImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setProfileImagePreview(user?.avatar?.url || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadProfileImage = async () => {
    if (!profileImage) return null;

    try {
      setImageLoading(true);
      const formData = new FormData();
      formData.append('avatar', profileImage);

      let response;
      try {
        response = await authAPI.uploadAvatar(formData);
      } catch (apiError) {
        console.log('API failed, using mock data:', apiError);
        response = await mockApi.uploadAvatar(formData);
      }
      
      return response.data.data.avatar;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload profile image');
      return null;
    } finally {
      setImageLoading(false);
    }
  };

  const validateAllFields = () => {
    const newErrors = {
      firstName: validateField('firstName', profileData.firstName),
      lastName: validateField('lastName', profileData.lastName),
      email: validateField('email', profileData.email),
      phone: validateField('phone', profileData.phone),
      address: {
        street: validateField('address.street', profileData.address.street),
        city: validateField('address.city', profileData.address.city),
        state: validateField('address.state', profileData.address.state),
        zipCode: validateField('address.zipCode', profileData.address.zipCode),
        country: validateField('address.country', profileData.address.country)
      }
    };

    setErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => {
      if (typeof error === 'object') {
        return Object.values(error).some(err => err !== '');
      }
      return error !== '';
    });

    return !hasErrors;
  };

  const handleSave = async () => {
    // Validate all fields before saving
    if (!validateAllFields()) {
      toast.error('Please fix all validation errors before saving');
      return;
    }

    try {
      setLoading(true);
      
      // Upload profile image first if there's a new one
      let avatarData = null;
      if (profileImage) {
        avatarData = await uploadProfileImage();
        if (!avatarData) {
          toast.error('Failed to upload profile image');
          return;
        }
      }

      // Update profile data
      const updateData = {
        ...profileData,
        ...(avatarData && { avatar: avatarData })
      };

      // Call profile update API
      let response;
      try {
        response = await authAPI.updateProfile(updateData);
      } catch (apiError) {
        console.log('API failed, using mock data:', apiError);
        response = await mockApi.updateProfile(updateData);
      }
      
      // Update the user context with new data
      if (response.data.success) {
        const updatedUser = response.data.data.user;
        
        // Update localStorage with new user data
        localStorage.setItem('adminUser', JSON.stringify(updatedUser));
        
        // Update local profile data state to reflect changes immediately
        setProfileData({
          firstName: updatedUser.firstName || '',
          lastName: updatedUser.lastName || '',
          email: updatedUser.email || '',
          phone: updatedUser.phone || '',
          address: {
            street: updatedUser.address?.street || '',
            city: updatedUser.address?.city || '',
            state: updatedUser.address?.state || '',
            zipCode: updatedUser.address?.zipCode || '',
            country: updatedUser.address?.country || ''
          }
        });
        
        // Update profile image preview if avatar was updated
        if (updatedUser.avatar?.url) {
          setProfileImagePreview(updatedUser.avatar.url);
        }
        
        toast.success('Profile updated successfully');
        setIsEditing(false);
        setProfileImage(null);
        
        // Trigger a page refresh to update the AuthContext
        window.location.reload();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      address: {
        street: user.address?.street || '',
        city: user.address?.city || '',
        state: user.address?.state || '',
        zipCode: user.address?.zipCode || '',
        country: user.address?.country || ''
      }
    });
    setErrors({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: ''
      }
    });
    setProfileImage(null);
    setProfileImagePreview(user?.avatar?.url || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsEditing(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600">Manage your delivery person profile</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            Edit Profile
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
          <div className="flex items-center">
            <div className="relative">
              <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center overflow-hidden">
                {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}
                  </span>
                )}
              </div>
              
              {isEditing && (
                <div className="absolute -bottom-1 -right-1 flex space-x-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-50 transition-colors"
                    title="Upload new image"
                  >
                    <Camera className="h-4 w-4 text-blue-600" />
                  </button>
                  {profileImagePreview && (
                    <button
                      onClick={handleRemoveImage}
                      className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="h-4 w-4 text-white" />
                    </button>
                  )}
                </div>
              )}
              
              {isEditing && !profileImagePreview && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-white text-xs font-medium"
                  >
                    Upload Photo
                  </button>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-white">
                {profileData.firstName} {profileData.lastName}
              </h2>
              <p className="text-blue-100">Delivery Person</p>
              <p className="text-blue-200 text-sm">{profileData.email}</p>
              {imageLoading && (
                <p className="text-blue-200 text-xs mt-1">Uploading image...</p>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.firstName 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900 py-2">{profileData.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.lastName 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900 py-2">{profileData.lastName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.email 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900 py-2">{profileData.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Phone
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="10 digit number"
                      maxLength="10"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.phone 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900 py-2">{profileData.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              <MapPin className="inline h-5 w-5 mr-2" />
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={profileData.address.street}
                      onChange={(e) => handleInputChange('address.street', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.address.street 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.address.street && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.street}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900 py-2">{profileData.address.street}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={profileData.address.city}
                      onChange={(e) => handleInputChange('address.city', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.address.city 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.address.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.city}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900 py-2">{profileData.address.city}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={profileData.address.state}
                      onChange={(e) => handleInputChange('address.state', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.address.state 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.address.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.state}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900 py-2">{profileData.address.state}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={profileData.address.zipCode}
                      onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                      placeholder="4-6 digits"
                      maxLength="6"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.address.zipCode 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.address.zipCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.zipCode}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900 py-2">{profileData.address.zipCode}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={profileData.address.country}
                      onChange={(e) => handleInputChange('address.country', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                        errors.address.country 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {errors.address.country && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.country}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-900 py-2">{profileData.address.country}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Role:</span>
            <p className="font-medium">Delivery Person</p>
          </div>
          <div>
            <span className="text-gray-600">Status:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>
          <div>
            <span className="text-gray-600">Member Since:</span>
            <p className="font-medium">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Last Login:</span>
            <p className="font-medium">
              {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryProfile;
