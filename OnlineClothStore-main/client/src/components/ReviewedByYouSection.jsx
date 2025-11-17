import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

const ReviewedByYouSection = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviewedProducts = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products?reviewedByMe=true`, {
          headers: {
            'Authorization': token ? `Bearer ${token}` : undefined,
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.data.products)) {
          setProducts(data.data.products);
        } else {
          setProducts([]);
        }
      } catch (error) {
        setProducts([],error);
      } finally {
        setLoading(false);
      }
    };
    fetchReviewedProducts();
  }, []);

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <p className="text-sm text-gray-500 tracking-wider uppercase mb-2">YOU VIEWED</p>
          <h2 
            className="mb-4"
            style={{ 
              font: '400 32px / 38px "Josefin Sans", sans-serif'
            }}
          >
            Reviewed By You
          </h2>
          <p 
            className="max-w-2xl mx-auto"
            style={{ 
              color: 'rgb(68, 68, 68)',
              font: '16px / 27px Raleway, sans-serif'
            }}
          >
            Here are the products you've reviewed. Explore your feedback and see what others think about your favorite items!
          </p>
        </div>

        {/* Products Grid */}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-4 text-center py-12 text-gray-500">Loading...</div>
            ) : currentProducts.length === 0 ? (
              <div className="col-span-4 text-center py-12 text-gray-500">No reviewed products found.</div>
            ) : (
              currentProducts.map((product) => {
                const variant = product.variants?.[0];
                const price = variant?.price;
                return (
                  <div key={product._id} className="group cursor-pointer">
                    <div className="relative overflow-hidden bg-gray-50 mb-4 aspect-[3/4]">
                      <img 
                        src={product.images?.[0]?.url || ''} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col space-y-1">
                        {product.tags?.map((tag) => (
                          <span 
                            key={tag}
                            className={`text-xs px-2 py-1 rounded text-white font-medium bg-gray-500`}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      {/* Heart Icon */}
                      <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Heart className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    {/* Product Info */}
                    <div className="text-center">
                      <h3 
                        className="mb-2"
                        style={{ 
                          color: 'rgb(68, 68, 68)',
                          font: '16px / 24px Raleway, sans-serif'
                        }}
                      >
                        {product.name}
                      </h3>
                      {variant && (
                        <div className="flex justify-center items-center space-x-2">
                          <span 
                            className="font-semibold"
                            style={{ 
                              color: 'rgb(0, 0, 0)',
                              font: '16px / 24px Raleway, sans-serif'
                            }}
                          >
                            {price?.sale ? `Rs. ${price.sale}` : `Rs. ${price?.regular || 0}`}
                          </span>
                          {price?.sale && price?.regular && price.sale < price.regular && (
                            <span 
                              className="line-through"
                              style={{ 
                                color: 'rgb(153, 153, 153)',
                                font: '14px / 20px Raleway, sans-serif'
                              }}
                            >
                              Rs. {price.regular}
                            </span>
                          )}
                        </div>
                      )}
                      {variant?.size && variant?.color?.name && (
                        <div className="text-xs text-gray-500 mt-1">{variant.size} / {variant.color.name}</div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center space-x-4 mt-8">
          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNumber = index + 1;
            return (
              <button
                key={pageNumber}
                onClick={() => goToPage(pageNumber)}
                className={`h-0.5 transition-all duration-300 ${
                  currentPage === pageNumber
                    ? 'w-8 bg-black'
                    : 'w-4 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReviewedByYouSection;