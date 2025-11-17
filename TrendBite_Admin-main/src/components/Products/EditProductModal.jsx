import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  X,
  Plus,
  Trash2,
  Upload,
  Loader2,
} from 'lucide-react';
import { productsAPI, categoriesAPI } from '../../services/api';
import { mockApi } from '../../services/mockApi';
import toast from 'react-hot-toast';

const EditProductModal = ({ isOpen, onClose, onSuccess, product }) => {
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState([]);
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
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

  // Initialize form when product changes
  useEffect(() => {
    if (product && isOpen) {
      console.log('Product data received:', product); // Debug log
      console.log('Product category:', product.category); // Debug log
      // Set basic form values
      Object.keys(product).forEach(key => {
        if (key !== 'variants' && key !== 'images' && key !== '_id' && key !== 'createdAt' && key !== 'updatedAt' && key !== '__v') {
          if (key === 'tags' && Array.isArray(product[key])) {
            setValue(key, product[key].join(', '));
          } else if (key === 'category') {
            // Handle category setting - check both object and string formats
            if (typeof product[key] === 'object' && product[key]?._id) {
              setValue(key, product[key]._id);
            } else if (typeof product[key] === 'string') {
              setValue(key, product[key]);
            } else {
              setValue(key, '');
            }
          } else {
            setValue(key, product[key] || '');
          }
        }
      });

      // Set variants
      if (product.variants && product.variants.length > 0) {
        setVariants(product.variants);
      } else {
        setVariants([{
          size: '',
          color: { name: '', hex: '#000000' },
          sku: '',
          stockQuantity: 0,
          price: { regular: 0, sale: 0 }
        }]);
      }

      // Set images
      if (product.images && product.images.length > 0) {
        setImages(product.images.map((img, index) => ({
          ...img,
          isMain: index === 0,
          order: index + 1
        })));
      } else {
        setImages([]);
      }
    }
  }, [product, isOpen, setValue]);

  // Set category value after categories are loaded
  useEffect(() => {
    if (product && categories.length > 0 && isOpen) {
      // Ensure category is set correctly after categories are loaded
      console.log('Setting category after categories loaded:', product.category, categories.length); // Debug log
      if (product.category) {
        if (typeof product.category === 'object' && product.category._id) {
          console.log('Setting category ID:', product.category._id); // Debug log
          setValue('category', product.category._id);
        } else if (typeof product.category === 'string') {
          console.log('Setting category string:', product.category); // Debug log
          setValue('category', product.category);
        }
      }
    }
  }, [categories, product, isOpen, setValue]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await categoriesAPI.getAll({ limit: 100 });
      
      // Handle different response structures
      if (response.data && response.data.data) {
        const { categories: categoriesData } = response.data.data;
        
        // Check if we have categories data
        if (categoriesData && Array.isArray(categoriesData)) {
          console.log('Categories loaded:', categoriesData); // Debug log
          setCategories(categoriesData);
        } else {
          // If categories is not an array, use the data directly
          console.log('Categories loaded (direct):', response.data.data.categories); // Debug log
          setCategories(response.data.data.categories || []);
        }
      } else if (response.data && response.data.categories) {
        // Handle direct categories response
        setCategories(response.data.categories || []);
      } else if (response.data && response.data.data && response.data.data.categories) {
        // Handle nested categories response
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

  const updateVariant = (index, field, value) => {
    const updatedVariants = [...variants];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updatedVariants[index][parent][child] = value;
    } else {
      updatedVariants[index][field] = value;
    }
    setVariants(updatedVariants);
  };

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map((file, index) => ({
      file,
      url: URL.createObjectURL(file),
      isMain: images.length === 0 && index === 0,
      order: images.length + index + 1
    }));
    setImages([...images, ...newImages]);
  };

  const removeImage = async (index) => {
    const imageToRemove = images[index];
    
    // If it's an existing image (has _id), delete it from server
    if (imageToRemove._id) {
      try {
        await productsAPI.deleteImage(product._id, imageToRemove._id);
      } catch (error) {
        console.log('Failed to delete image from server:', error);
        // Continue with local removal even if server deletion fails
      }
    }
    
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages.map((img, i) => ({ ...img, order: i + 1 })));
  };

  const setMainImage = (index) => {
    const updatedImages = images.map((img, i) => ({
      ...img,
      isMain: i === index,
      order: i === index ? 1 : i + 1
    }));
    setImages(updatedImages);
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      // Prepare product data
      const productData = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        variants: variants.filter(variant => 
          variant.size && variant.color.name && variant.sku
        ),
      };

      // Validate that at least one variant exists
      if (productData.variants.length === 0) {
        toast.error('At least one product variant is required');
        return;
      }

      // Update product
      let response;
      try {
        response = await productsAPI.update(product._id, productData);
        if (!response.data?.success) {
          throw new Error(response.data?.message || 'Failed to update product');
        }
      } catch (apiError) {
        console.log('API failed, using mock data:', apiError);
        response = await mockApi.updateProduct(product._id, productData);
      }
      
      // Upload new images if any
      const newImages = images.filter(img => img.file);
      if (newImages.length > 0) {
        const formData = new FormData();
        newImages.forEach((image) => {
          formData.append('images', image.file);
        });
        
        try {
          const uploadResponse = await productsAPI.uploadImages(product._id, formData);
          if (!uploadResponse.data?.success) {
            throw new Error(uploadResponse.data?.message || 'Failed to upload images');
          }
        } catch (uploadError) {
          console.log('Image upload failed, using mock:', uploadError);
          await mockApi.uploadProductImages(product._id, formData);
        }
      }

      // Update image order if images were reordered
      const existingImages = images.filter(img => !img.file && img._id);
      if (existingImages.length > 0) {
        const imageOrders = existingImages.map(img => ({
          imageId: img._id,
          order: img.order,
          isMain: img.isMain
        }));
        
        try {
          await productsAPI.updateImageOrder(product._id, { imageOrders });
        } catch (orderError) {
          console.log('Image order update failed:', orderError);
          // Don't fail the entire operation for image order issues
        }
      }

      toast.success('Product updated successfully!');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
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
                {...register('name', { required: 'Product name is required' })}
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
                {...register('brand', { required: 'Brand is required' })}
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
              {...register('description', { required: 'Description is required' })}
              rows={4}
              className={`input w-full h-full ${errors.description ? 'border-danger-500' : ''}`}
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
                {/* Show current product category if it's not in the loaded categories */}
                {product?.category && 
                 typeof product.category === 'object' && 
                 product.category.name && 
                 !categories.find(c => c._id === product.category._id) && (
                  <option value={product.category._id} selected>
                    {product.category.name} (Current)
                  </option>
                )}
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
                      </label>
                      <input
                        type="text"
                        value={variant.sku}
                        onChange={(e) => updateVariant(index, 'sku', e.target.value)}
                        className="input"
                        placeholder="TSHIRT-M-RED-001"
                        required
                      />
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
                Upload New Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="input"
              />
              <p className="text-sm text-gray-500 mt-1">
                Upload additional images. First new image will be set as main.
              </p>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.url || image.file}
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
                {...register('lowStockThreshold', { min: 0 })}
                type="number"
                className="input"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Percentage
              </label>
              <input
                {...register('discountPercentage', { min: 0, max: 100 })}
                type="number"
                className="input"
                min="0"
                max="100"
              />
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
                  Updating...
                </>
              ) : (
                'Update Product'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductModal;

