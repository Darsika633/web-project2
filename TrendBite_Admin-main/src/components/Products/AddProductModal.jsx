import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  X,
  Plus,
  Trash2,
  Upload,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { productsAPI, categoriesAPI } from '../../services/api';
import { mockApi } from '../../services/mockApi';
import toast from 'react-hot-toast';

const AddProductModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [variants, setVariants] = useState([
    {
      size: '',
      color: { name: '', hex: '#000000' },
      sku: '',
      stockQuantity: 0,
      price: { regular: 0, sale: 0 }
    }
  ]);
  const [images, setImages] = useState([]);
  const [manualSKUOverrides, setManualSKUOverrides] = useState({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      shortDescription: '',
      brand: '',
      category: '',
      gender: 'unisex',
      material: '',
      tags: '',
      currency: 'USD',
      status: 'draft',
      isFeatured: false,
      discountPercentage: 0,
      lowStockThreshold: 10,
    }
  });

  // Fetch categories when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Watch for product name changes and regenerate SKUs
  const productName = watch('name');
  useEffect(() => {
    if (productName && variants.length > 0) {
      regenerateAllSKUs(productName);
    }
  }, [productName]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await categoriesAPI.getAll({ limit: 100 });
      
      if (response.data && response.data.data) {
        setCategories(response.data.data.categories || []);
      } else {
        throw new Error('Unexpected API response structure');
      }
    } catch (error) {
      console.error('Error fetching categories from API, using mock data:', error);
      try {
        const mockResponse = await mockApi.getCategories({ limit: 100 });
        setCategories(mockResponse.data.data.categories || []);
      } catch (mockError) {
        console.error('Error with mock data:', mockError);
        toast.error('Failed to fetch categories');
        setCategories([]);
      }
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleClose = () => {
    reset();
    setVariants([{
      size: '',
      color: { name: '', hex: '#000000' },
      sku: '',
      stockQuantity: 0,
      price: { regular: 0, sale: 0 }
    }]);
    setImages([]);
    setCategories([]);
    setManualSKUOverrides({});
    onClose();
  };

  const addVariant = () => {
    setVariants([...variants, {
      size: '',
      color: { name: '', hex: '#000000' },
      sku: '',
      stockQuantity: 0,
      price: { regular: 0, sale: 0 }
    }]);
  };

  const removeVariant = (index) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  // Function to generate SKU based on product name, color, and variant name
  const generateSKU = (productName, colorName, variantName) => {
    if (!productName || !colorName || !variantName) return '';
    
    // Clean and format the inputs
    const cleanProductName = productName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 6); // Limit to 6 characters
    
    const cleanColorName = colorName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 3); // Limit to 3 characters
    
    const cleanVariantName = variantName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 3); // Limit to 3 characters
    
    // Generate a random 3-digit number for uniqueness
    const randomNumber = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `${cleanProductName}-${cleanVariantName}-${cleanColorName}-${randomNumber}`;
  };

  // Function to regenerate all SKUs when product name changes
  const regenerateAllSKUs = (productName) => {
    const updatedVariants = variants.map((variant, index) => {
      // Skip if this variant has a manual override
      if (manualSKUOverrides[index]) {
        return variant;
      }
      
      const colorName = variant.color?.name || '';
      const variantName = variant.size || '';
      
      if (productName && colorName && variantName) {
        return {
          ...variant,
          sku: generateSKU(productName, colorName, variantName)
        };
      }
      
      return variant;
    });
    
    setVariants(updatedVariants);
  };

  const updateVariant = (index, field, value) => {
    const updatedVariants = [...variants];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updatedVariants[index][parent][child] = value;
    } else {
      updatedVariants[index][field] = value;
    }
    
    // Auto-generate SKU when product name, color, or size changes (only if not manually overridden)
    if (!manualSKUOverrides[index]) {
      const productName = watch('name') || '';
      const colorName = updatedVariants[index].color?.name || '';
      const variantName = updatedVariants[index].size || '';
      
      if (productName && colorName && variantName) {
        updatedVariants[index].sku = generateSKU(productName, colorName, variantName);
      }
    }
    
    setVariants(updatedVariants);
  };

  // Function to handle manual SKU override
  const handleManualSKUChange = (index, value) => {
    const updatedVariants = [...variants];
    updatedVariants[index].sku = value;
    setVariants(updatedVariants);
    
    // Mark this variant as manually overridden
    if (value) {
      setManualSKUOverrides(prev => ({ ...prev, [index]: true }));
    } else {
      setManualSKUOverrides(prev => {
        const newOverrides = { ...prev };
        delete newOverrides[index];
        return newOverrides;
      });
    }
  };

  // Function to reset SKU to auto-generated
  const resetSKUToAuto = (index) => {
    const productName = watch('name') || '';
    const colorName = variants[index].color?.name || '';
    const variantName = variants[index].size || '';
    
    if (productName && colorName && variantName) {
      const updatedVariants = [...variants];
      updatedVariants[index].sku = generateSKU(productName, colorName, variantName);
      setVariants(updatedVariants);
    }
    
    // Remove manual override
    setManualSKUOverrides(prev => {
      const newOverrides = { ...prev };
      delete newOverrides[index];
      return newOverrides;
    });
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      
      if (!isValidType) {
        toast.error(`${file.name} is not a valid image file`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      return true;
    });

    // Check total image limit
    if (images.length + validFiles.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const newImages = validFiles.map((file, index) => ({
      file,
      url: URL.createObjectURL(file),
      isMain: images.length === 0 && index === 0,
      order: images.length + index + 1
    }));
    setImages([...images, ...newImages]);
    
    // Clear the input
    event.target.value = '';
  };

  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages.map((img, i) => ({ ...img, order: i + 1 })));
  };

  const setMainImage = (index) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      isMain: i === index
    }));
    setImages(updatedImages);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Validate variants
      const validVariants = variants.filter(variant => 
        variant.size && variant.color.name && variant.sku && variant.stockQuantity > 0
      );

      if (validVariants.length === 0) {
        toast.error('Please add at least one valid product variant with size, color, SKU, and stock quantity');
        return;
      }

      // Check for duplicate SKUs
      const skus = validVariants.map(v => v.sku);
      const duplicateSkus = skus.filter((sku, index) => skus.indexOf(sku) !== index);
      if (duplicateSkus.length > 0) {
        toast.error('Duplicate SKUs found. Please ensure each variant has a unique SKU.');
        return;
      }

      // Validate prices
      const invalidPrices = validVariants.filter(variant => 
        variant.price.regular <= 0 || (variant.price.sale > 0 && variant.price.sale >= variant.price.regular)
      );
      if (invalidPrices.length > 0) {
        toast.error('Please ensure all variants have valid prices (regular price > 0, sale price < regular price)');
        return;
      }

      // Prepare product data according to API documentation
      const productData = {
        name: data.name,
        description: data.description,
        shortDescription: data.shortDescription || '',
        brand: data.brand,
        category: data.category, // This should be the category ID
        gender: data.gender,
        material: data.material || '',
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        variants: validVariants.map(variant => ({
          size: variant.size,
          color: {
            name: variant.color.name,
            hex: variant.color.hex
          },
          sku: variant.sku,
          stockQuantity: parseInt(variant.stockQuantity),
          price: {
            regular: parseFloat(variant.price.regular),
            sale: parseFloat(variant.price.sale) || 0
          }
        })),
        currency: data.currency,
        status: data.status,
        isFeatured: data.isFeatured,
        discountPercentage: parseFloat(data.discountPercentage) || 0,
        lowStockThreshold: parseInt(data.lowStockThreshold) || 10
      };

      // Create product
      let response;
      try {
        response = await productsAPI.create(productData);
        console.log('Product created successfully:', response.data);
      } catch (apiError) {
        console.log('API failed, using mock data:', apiError);
        if (apiError.response?.data?.message) {
          toast.error(`API Error: ${apiError.response.data.message}`);
          return;
        }
        response = await mockApi.createProduct(productData);
      }
      
      // Upload images if any
      if (images.length > 0 && response.data.data.product._id) {
        const formData = new FormData();
        images.forEach((image, index) => {
          formData.append('images', image.file);
        });
        
        try {
          await productsAPI.uploadImages(response.data.data.product._id, formData);
          console.log('Images uploaded successfully');
        } catch (uploadError) {
          console.log('Image upload failed, using mock:', uploadError);
          if (uploadError.response?.data?.message) {
            toast.error(`Image upload error: ${uploadError.response.data.message}`);
          }
          await mockApi.uploadProductImages(response.data.data.product._id, formData);
        }
      }

      toast.success('Product created successfully!');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(error.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Add New Product</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {categoriesLoading && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600 mr-2" />
                <span className="text-blue-800">Loading categories...</span>
              </div>
            </div>
          )}
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                {...register('name', { 
                  required: 'Product name is required',
                  minLength: { value: 2, message: 'Product name must be at least 2 characters' },
                  maxLength: { value: 100, message: 'Product name must be less than 100 characters' }
                })}
                type="text"
                className={`input ${errors.name ? 'border-danger-500' : ''}`}
                placeholder="Enter product name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-danger-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand *
              </label>
              <input
                {...register('brand', { 
                  required: 'Brand is required',
                  minLength: { value: 2, message: 'Brand name must be at least 2 characters' },
                  maxLength: { value: 50, message: 'Brand name must be less than 50 characters' }
                })}
                type="text"
                className={`input ${errors.brand ? 'border-danger-500' : ''}`}
                placeholder="Enter brand name"
              />
              {errors.brand && (
                <p className="mt-1 text-sm text-danger-600">{errors.brand.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short Description
            </label>
            <input
              {...register('shortDescription')}
              type="text"
              className="input"
              placeholder="Brief product description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Description *
            </label>
            <textarea
              {...register('description', { 
                required: 'Description is required',
                minLength: { value: 10, message: 'Description must be at least 10 characters' },
                maxLength: { value: 1000, message: 'Description must be less than 1000 characters' }
              })}
              rows={4}
              className={`input ${errors.description ? 'border-danger-500' : ''}`}
              placeholder="Detailed product description"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-danger-600">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                {...register('category', { required: 'Category is required' })}
                className={`input ${errors.category ? 'border-danger-500' : ''}`}
                disabled={categoriesLoading}
              >
                <option value="">
                  {categoriesLoading ? 'Loading categories...' : 'Select category'}
                </option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-danger-600">{errors.category.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select {...register('gender')} className="input">
                <option value="unisex">Unisex</option>
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kids">Kids</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select {...register('status')} className="input">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Material
              </label>
              <input
                {...register('material')}
                type="text"
                className="input"
                placeholder="e.g., 100% Cotton"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                {...register('tags')}
                type="text"
                className="input"
                placeholder="casual, cotton, comfortable (comma separated)"
              />
            </div>
          </div>

          {/* Product Variants */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Product Variants</h3>
              <button
                type="button"
                onClick={addVariant}
                className="btn btn-secondary btn-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Variant
              </button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium text-gray-900">Variant {index + 1}</h4>
                    {variants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="text-danger-600 hover:text-danger-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Size *
                      </label>
                      <input
                        type="text"
                        value={variant.size}
                        onChange={(e) => updateVariant(index, 'size', e.target.value)}
                        className="input"
                        placeholder="S, M, L, XL"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color Name *
                      </label>
                      <input
                        type="text"
                        value={variant.color.name}
                        onChange={(e) => updateVariant(index, 'color.name', e.target.value)}
                        className="input"
                        placeholder="Red, Blue, Black"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color Hex
                      </label>
                      <div className="flex">
                        <input
                          type="color"
                          value={variant.color.hex}
                          onChange={(e) => updateVariant(index, 'color.hex', e.target.value)}
                          className="w-12 h-10 border border-gray-300 rounded-l-md"
                        />
                        <input
                          type="text"
                          value={variant.color.hex}
                          onChange={(e) => updateVariant(index, 'color.hex', e.target.value)}
                          className="input rounded-l-none"
                          placeholder="#FF0000"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SKU *
                        {!manualSKUOverrides[index] && (
                          <span className="text-xs text-gray-500 ml-1">(Auto-generated)</span>
                        )}
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          value={variant.sku}
                          onChange={(e) => handleManualSKUChange(index, e.target.value)}
                          className="input rounded-r-none"
                          placeholder="TSHIRT-M-RED-001"
                          required
                        />
                        {manualSKUOverrides[index] && (
                          <button
                            type="button"
                            onClick={() => resetSKUToAuto(index)}
                            className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 text-gray-600 hover:text-gray-800"
                            title="Reset to auto-generated SKU"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      {!manualSKUOverrides[index] && variant.sku && (
                        <p className="text-xs text-gray-500 mt-1">
                          Auto-generated from: {watch('name')} - {variant.size} - {variant.color.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock Quantity *
                      </label>
                      <input
                        type="number"
                        value={variant.stockQuantity}
                        onChange={(e) => updateVariant(index, 'stockQuantity', parseInt(e.target.value) || 0)}
                        className="input"
                        min="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Regular Price *
                      </label>
                      <input
                        type="number"
                        value={variant.price.regular}
                        onChange={(e) => updateVariant(index, 'price.regular', parseFloat(e.target.value) || 0)}
                        className="input"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sale Price
                      </label>
                      <input
                        type="number"
                        value={variant.price.sale}
                        onChange={(e) => updateVariant(index, 'price.sale', parseFloat(e.target.value) || 0)}
                        className="input"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Product Images */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Images</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="input"
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload up to 5 images (max 5MB each). First image will be the main image.
                Supported formats: JPG, JPEG, PNG, GIF, WebP
              </p>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.url}
                      alt={`Product ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <div className="absolute top-2 right-2 flex space-x-1">
                      {!image.isMain && (
                        <button
                          type="button"
                          onClick={() => setMainImage(index)}
                          className="bg-primary-600 text-white p-1 rounded-full hover:bg-primary-700"
                          title="Set as main image"
                        >
                          <Upload className="h-3 w-3" />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="bg-danger-600 text-white p-1 rounded-full hover:bg-danger-700"
                        title="Remove image"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    {image.isMain && (
                      <div className="absolute bottom-2 left-2 bg-primary-600 text-white px-2 py-1 rounded text-xs">
                        Main
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Low Stock Threshold
              </label>
              <input
                {...register('lowStockThreshold', { 
                  min: { value: 0, message: 'Low stock threshold must be 0 or greater' },
                  max: { value: 1000, message: 'Low stock threshold must be less than 1000' }
                })}
                type="number"
                className={`input ${errors.lowStockThreshold ? 'border-danger-500' : ''}`}
                min="0"
                max="1000"
              />
              {errors.lowStockThreshold && (
                <p className="mt-1 text-sm text-danger-600">{errors.lowStockThreshold.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Percentage
              </label>
              <input
                {...register('discountPercentage', { 
                  min: { value: 0, message: 'Discount percentage must be 0 or greater' },
                  max: { value: 100, message: 'Discount percentage must be 100 or less' }
                })}
                type="number"
                className={`input ${errors.discountPercentage ? 'border-danger-500' : ''}`}
                min="0"
                max="100"
              />
              {errors.discountPercentage && (
                <p className="mt-1 text-sm text-danger-600">{errors.discountPercentage.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              {...register('isFeatured')}
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Featured Product
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary btn-md w-full sm:w-auto"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-md w-full sm:w-auto"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
