import React, { useState, useEffect } from 'react';
const lkr = new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' });
import { useParams } from 'react-router-dom';
import { Heart, Star, Plus, Minus } from 'lucide-react';
import { Button } from '../ui/button';
import ProductReviews from '../components/ProductReviews';
import ProductHeader from '../components/ProductHeader';
import ReviewedByYouSection from '../components/ReviewedByYouSection';
import { toast } from 'react-toastify';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      
      try {
        // Get product ID from URL parameters
        const productId = id;
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/${productId}`);
        const data = await response.json();
        
        if (data.success) {
          setProduct(data.data.product);
          // Set first variant as default
          if (data.data.product.variants && data.data.product.variants.length > 0) {
            setSelectedVariant(data.data.product.variants[0]);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div>
        <ProductHeader />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <ProductHeader />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-500">Product not found</div>
          </div>
        </div>
      </div>
    );
  }

  // Get unique sizes and colors from variants
  const availableSizes = [...new Set(product.variants.map(v => v.size))];
  const availableColors = product.variants.reduce((acc, variant) => {
    if (!acc.find(c => c.name === variant.color.name)) {
      acc.push(variant.color);
    }
    return acc;
  }, []);

  // Handle variant selection
  const handleSizeChange = (size) => {
    const newVariant = product.variants.find(v => 
      v.size === size && v.color.name === selectedVariant?.color.name
    ) || product.variants.find(v => v.size === size);
    
    if (newVariant) {
      setSelectedVariant(newVariant);
    }
  };

  const handleColorChange = (colorName) => {
    const newVariant = product.variants.find(v => 
      v.color.name === colorName && v.size === selectedVariant?.size
    ) || product.variants.find(v => v.color.name === colorName);
    
    if (newVariant) {
      setSelectedVariant(newVariant);
    }
  };

  const handleQuantityChange = (change) => {
    setQuantity(Math.max(1, quantity + change));
  };

  // Function to check if the same variant is already in cart
  const checkIfAlreadyInCart = async (productId, variantSku) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return false;

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data.cart.items) {
          // Check if any item in cart has the same product ID and variant SKU
          return result.data.cart.items.some(item => 
            item.product._id === productId && item.variant.sku === variantSku
          );
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking cart:', error);
      return false;
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      toast.error('Please select a variant');
      return;
    }
    
    if (selectedVariant.stockQuantity <= 0) {
      toast.error('This product is out of stock');
      return;
    }
    
    // Get the auth token from localStorage
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('Please login to add items to cart');
      return;
    }

    // Check if the same variant is already in cart
    const alreadyInCart = await checkIfAlreadyInCart(product._id, selectedVariant.sku);
    if (alreadyInCart) {
      toast.warning(`${product.name} (${selectedVariant.size}, ${selectedVariant.color.name}) is already in your cart!`);
      return;
    }
    
    const cartData = {
      productId: product._id,
      variant: {
        sku: selectedVariant.sku,
        size: selectedVariant.size,
        color: {
          name: selectedVariant.color.name,
          hex: selectedVariant.color.hex
        }
      },
      quantity: quantity
    };
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(cartData)
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        toast.success(`Added ${quantity} x ${product.name} (${selectedVariant.size}, ${selectedVariant.color.name}) to cart!`);
      } else {
        toast.error('Failed to add item to cart: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const renderStars = (rating, interactive = false, onStarClick = null) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 cursor-pointer ${
          i < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        }`}
        onClick={() => interactive && onStarClick && onStarClick(i + 1)}
      />
    ));
  };

  return (
    <div>
      <ProductHeader />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Product Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative">
            <img
              src={product.images[selectedImage]?.url || product.images[0]?.url}
              alt={product.images[selectedImage]?.alt || product.name}
              className="w-full h-96 object-cover rounded-lg"
            />
            {selectedVariant?.price?.sale < selectedVariant?.price?.regular && (
              <span className="absolute top-4 left-4 bg-red-500 text-white text-xs px-2 py-1 rounded">
                SALE
              </span>
            )}
            <button className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100">
              <Heart className="w-5 h-5" />
            </button>
          </div>
          <div className="flex space-x-2">
            {product.images.map((image, index) => (
              <img
                key={image._id}
                src={image.url}
                alt={image.alt}
                onClick={() => setSelectedImage(index)}
                className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${
                  selectedImage === index ? 'border-gray-600' : 'border-transparent hover:border-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 
              className="capitalize pb-5 text-gray-900" 
              style={{ 
                font: '400 40px / 1 "Josefin Sans", sans-serif' 
              }}
            >
              {product.name}
            </h1>
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center">
                {renderStars(product.averageRating || 4)}
              </div>
              <span className="text-sm text-gray-500">({product.reviewCount || 23})</span>
            </div>
          </div>

          <p 
            className="relative"
            style={{ 
              color: 'rgb(68, 68, 68)',
              font: '16px / 27px Raleway, sans-serif',
              background: 'rgb(255, 255, 255)'
            }}
          >
            {product.shortDescription || product.description}
          </p>

          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Status:</span>
              <span className="text-sm font-medium text-green-600">
                {selectedVariant?.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">SKU:</span>
              <span className="text-sm text-gray-800">{selectedVariant?.sku || 'N/A'}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-3xl font-bold text-gray-900">
              {selectedVariant?.price?.sale
                ? lkr.format(selectedVariant.price.sale)
                : lkr.format(selectedVariant?.price?.regular || 0)}
            </span>
            {selectedVariant?.price?.sale && selectedVariant?.price?.regular && selectedVariant.price.sale < selectedVariant.price.regular && (
              <span className="text-lg text-gray-500 line-through">
                {lkr.format(selectedVariant.price.regular)}
              </span>
            )}
          </div>

          {/* Size Selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Size</h3>
            <div className="flex space-x-2">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => handleSizeChange(size)}
                  className={`w-10 h-10 rounded border text-sm font-medium ${
                    selectedVariant?.size === size
                      ? 'border-black bg-black text-white'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Color</h3>
            <div className="flex space-x-2">
              {availableColors.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleColorChange(color.name)}
                  style={{ backgroundColor: color.hex }}
                  className={`w-8 h-8 rounded-full border-2 border-gray-300 ${
                    selectedVariant?.color.name === color.name ? 'ring-2 ring-offset-2 ring-gray-500' : ''
                  }`}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center border border-gray-300 rounded">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="p-2 hover:bg-gray-100"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 font-medium">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="p-2 hover:bg-gray-100"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <Button 
              className="flex-1 bg-black text-white hover:bg-gray-800 py-3"
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.stockQuantity <= 0}
            >
              Add To Cart
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="border-t pt-8">
        <div className="flex space-x-8 mb-6">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-4 font-medium ${
              activeTab === 'description'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 font-medium ${
              activeTab === 'reviews'
                ? 'border-b-2 border-black text-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Reviews
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'description' && (
          <div className="py-6">
            <p 
              className="relative"
              style={{ 
                color: 'rgb(68, 68, 68)',
                font: '16px / 27px Raleway, sans-serif',
                background: 'rgb(255, 255, 255)'
              }}
            >
              {product.description}
            </p>
            
            {product.material && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Material</h4>
                <p className="text-gray-600">{product.material}</p>
              </div>
            )}
            
            {product.tags && product.tags.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <ProductReviews productId={product._id} />
        )}
      </div>
      </div>
      
      {/* Reviewed By You Section */}
      <ReviewedByYouSection />
    </div>
  );
};

export default ProductDetail;