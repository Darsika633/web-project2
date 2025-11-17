import React, { useState, useEffect } from 'react';
const lkr = new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' });
import { Button } from '../ui/button';
import { Heart, Search, Star } from 'lucide-react';
import { X, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';

const ProductCollection = () => {
  // Removed priceRange state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [tagOptions, setTagOptions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewedProducts, setReviewedProducts] = useState([]);
  const [lastProduct, setLastProduct] = useState(null);
  const pageSize = 6;

  // ...existing code...

  // Fetch products from API with category filter
  useEffect(() => {
    // Extract unique tags from products and set tagOptions
    const extractTags = (productsArr) => {
      const tagSet = new Set();
      productsArr.forEach(product => {
        if (Array.isArray(product.tags)) {
          product.tags.forEach(tag => tagSet.add(tag));
        }
      });
      setTagOptions(Array.from(tagSet));
    };
    // Always fetch all products to get all categories
    const fetchAllProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products`);
        const data = await response.json();
        if (data.success && data.data && data.data.products) {
          // Extract all unique categories from all products
          const uniqueCategories = [];
          const seen = new Set();
          data.data.products.forEach(product => {
            if (product.category && product.category._id && !seen.has(product.category._id)) {
              uniqueCategories.push(product.category);
              seen.add(product.category._id);
            }
          });
          // Ensure 'Men' category is always present
          const hasMen = uniqueCategories.some(cat => cat.name && cat.name.toLowerCase() === 'men');
          if (!hasMen) {
            uniqueCategories.push({ _id: 'men-fallback', name: "Men's", status: "Active" });
          }
          setCategories(uniqueCategories);
        } else {
          setCategories([]);
        }
      } catch (error) {
        setCategories([]);
        console.error('Error fetching categories:', error);
      }
    };

    // Fetch filtered products from API using query params
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        let url = `${import.meta.env.VITE_API_BASE_URL}/api/products?`;
        if (selectedCategory) url += `category=${selectedCategory}&`;
        if (searchQuery.trim()) url += `tags=${encodeURIComponent(searchQuery.trim())}&`;
  // Removed priceRange filter
        url = url.replace(/&$/, '');
        const response = await fetch(url);
        const data = await response.json();
        if (data.success && data.data && data.data.products) {
          setProducts(data.data.products);
          extractTags(data.data.products);
        } else {
          setProducts([]);
          setTagOptions([]);
        }
      } catch (error) {
        setProducts([]);
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch reviewed products for sidebar
    const fetchReviewedProducts = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/reviews/my-products`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.data && data.data.products) {
          setReviewedProducts(data.data.products);
        } else {
          setReviewedProducts([]);
        }
      } catch {
        setReviewedProducts([]);
      }
    };

    // Fetch last product for sidebar
    const fetchLastProduct = async () => {
      try {
        let url = `${import.meta.env.VITE_API_BASE_URL}/api/products?`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.success && data.data && data.data.products && data.data.products.length > 0) {
          setLastProduct(data.data.products[data.data.products.length - 1]);
        } else {
          setLastProduct(null);
        }
      } catch {
        setLastProduct(null);
      }
    };

    fetchAllProducts();
    fetchFilteredProducts();
    fetchReviewedProducts();
    fetchLastProduct();
  }, [selectedCategory, searchQuery]);

  // Handle category selection
  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
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

  // Handle add to cart
  const handleAddToCart = async (product) => {
    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (!token) {
      toast.error('Please login to add items to cart');
      return;
    }

    const firstVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
    
    if (!firstVariant) {
      toast.error('No variants available for this product');
      return;
    }
    
    if (firstVariant.stockQuantity <= 0) {
      toast.error('This product is out of stock');
      return;
    }

    const alreadyInCart = await checkIfAlreadyInCart(product._id, firstVariant.sku);
    if (alreadyInCart) {
      toast.warning(`${product.name} is already in your cart!`);
      return;
    }
    
    const cartData = {
      productId: product._id,
      variant: {
        sku: firstVariant.sku,
        size: firstVariant.size,
        color: {
          name: firstVariant.color.name,
          hex: firstVariant.color.hex
        }
      },
      quantity: 1
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
        toast.success(`Added ${product.name} to cart!`);
      } else {
        toast.error('Failed to add item to cart: ' + (result.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-6xl py-8">
      {/* Centered search bar above product grid */}
      <div className="flex justify-center mb-8">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full max-w-2xl">
          <div className="relative w-full md:w-2/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Search by tag"
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-none text-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative w-full md:w-1/3 flex items-center">
            <div className="w-full relative">
              <select
                className="w-full py-2 px-3 pr-8 border border-gray-200 rounded-none text-sm bg-white appearance-none"
                value={selectedTag}
                onChange={e => {
                  setSelectedTag(e.target.value);
                  setSearchQuery(e.target.value);
                }}
              >
                <option value="">Select Tag</option>
                {tagOptions.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
              {/* Show cross icon only when a tag is selected, otherwise show dropdown arrow */}
              <span className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
                {selectedTag ? (
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-700 bg-white px-1 rounded"
                    style={{ pointerEvents: 'auto' }}
                    onClick={() => {
                      setSelectedTag('');
                      setSearchQuery('');
                    }}
                    aria-label="Clear tag filter"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          {/* Search bar removed from sidebar */}

          {/* Categories */}
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-4 border-b-2 border-primary inline-block pb-1">Categories</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="category"
                  value=""
                  checked={selectedCategory === ''}
                  onChange={() => handleCategoryChange('')}
                  className="rounded" 
                />
                <span className="text-sm font-medium">All</span>
              </label>
              {categories.map((category) => (
                <label key={category._id} className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="category"
                    value={category._id}
                    checked={selectedCategory === category._id}
                    onChange={() => handleCategoryChange(category._id)}
                    className="rounded" 
                  />
                  <span className="text-sm font-medium">{category.name}</span>
                  {selectedCategory === category._id && (
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded ml-1">Active</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Price Filter removed */}


          {/* Reviewed By You Section */}
          <div className="mt-8">
            <h3 className="font-semibold text-lg mb-4 border-b-2 border-primary inline-block pb-1">
              Reviewed By You
            </h3>
            <div className="space-y-3">
              {lastProduct ? (
                <div className="flex items-center gap-5 p-5 bg-white rounded-2xl border border-gray-200  hover:shadow-xl transition-shadow cursor-pointer">
                  <img
                    src={lastProduct.images?.[0]?.url || 'https://via.placeholder.com/80x80'}
                    alt={lastProduct.name}
                    className="w-28 h-28 object-cover rounded-xl"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-base text-gray-900 truncate">{lastProduct.name}</h4>
                      <span className="font-bold text-lg text-black">{lastProduct.variants?.[0]?.price?.regular ? lkr.format(lastProduct.variants[0].price.regular) : ''}</span>
                    </div>
                    <div className="flex items-center space-x-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-base ${i < (lastProduct.averageRating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm italic line-clamp-2">{lastProduct.description || '“Great quality and fits perfectly. Would recommend to anyone looking for comfort and style!”'}</p>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-sm">No reviewed products found.</div>
              )}
            </div>
          </div>

          {/* Season Sale Banner */}
          <div className="mt-8">
            <div 
              className="relative h-32 bg-cover bg-center rounded overflow-hidden flex items-center justify-center"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80')"
              }}
            >
              <div className="text-center text-white px-2 drop-shadow-lg">
                <h3 className="text-lg font-bold mb-1">SEASON</h3>
                <h2 className="text-xl font-bold mb-2">SALE</h2>
                <button className="bg-white text-black px-3 py-1 text-xs font-semibold hover:bg-gray-100 transition-colors">
                  SHOP NOW
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          {/* Sort and View Options removed */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="group cursor-pointer animate-pulse">
                  <div className="relative overflow-hidden bg-gray-200 mb-3 h-64"></div>
                  <div className="text-center">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                  </div>
                </div>
              ))
            ) : products && products.length > 0 ? (
              products.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((product) => {
                const firstVariant = product.variants?.[0];
                const regularPrice = firstVariant?.price?.regular;
                const salePrice = firstVariant?.price?.sale;
                const hasDiscount = salePrice && salePrice < regularPrice;
                const mainImage = product.images?.find(img => img.isMain)?.url || 
                                  product.images?.[0]?.url || 
                                  'https://via.placeholder.com/300x300';
                return (
                  <div key={product._id} className="group cursor-pointer">
                    <div className="relative overflow-hidden bg-gray-50 mb-3">
                      <img 
                        src={mainImage} 
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {hasDiscount && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                          SALE
                        </span>
                      )}
                      {product.isFeatured && (
                        <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          FEATURED
                        </span>
                      )}
                      <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-100">
                        <Heart className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-2 left-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <a href={`/product/${product._id}`}>
                          <Button size="sm" className="flex-1 bg-white text-black hover:bg-gray-100 rounded-none text-xs">
                            Quick View
                          </Button>
                        </a>
                        <Button 
                          size="sm" 
                          className="flex-1 bg-black text-white hover:bg-gray-800 rounded-none text-xs"
                          onClick={() => handleAddToCart(product)}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="font-medium text-sm mb-1 text-gray-800">{product.name}</h3>
                      <div className="flex justify-center items-center space-x-2">
                        {hasDiscount ? (
                          <>
                            <span className="font-semibold text-black">{lkr.format(salePrice)}</span>
                            <span className="text-sm text-gray-500 line-through">{lkr.format(regularPrice)}</span>
                          </>
                        ) : (
                          <span className="font-semibold text-black">{lkr.format(regularPrice)}</span>
                        )}
                      </div>
                      {product.averageRating && (
                        <div className="flex justify-center items-center mt-1">
                          <div className="flex items-center space-x-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-xs ${i < Math.floor(product.averageRating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                                ★
                              </span>
                            ))}
                            <span className="text-xs text-gray-500 ml-1">({product.reviewCount})</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500">No products found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center space-x-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              className="rounded-none"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            >←</Button>
            {Array.from({ length: Math.ceil(products.length / pageSize) }).map((_, idx) => (
              <Button
                key={idx + 1}
                variant="outline"
                size="sm"
                className={`rounded-none ${currentPage === idx + 1 ? 'bg-black text-white' : ''}`}
                onClick={() => setCurrentPage(idx + 1)}
              >{idx + 1}</Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="rounded-none"
              disabled={currentPage === Math.ceil(products.length / pageSize) || products.length === 0}
              onClick={() => setCurrentPage(currentPage + 1)}
            >→</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCollection;