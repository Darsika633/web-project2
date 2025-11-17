import React from 'react';
import { Heart, Star } from 'lucide-react';

const Reviewed = () => {
  const reviewedProducts = [
    { 
      id: 1, 
      name: "Casual T-shirt", 
      price: 45.99, 
      originalPrice: 55.99,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop",
      rating: 4,
      sale: true
    },
    { 
      id: 2, 
      name: "Denim Jacket", 
      price: 89.99, 
      originalPrice: null,
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200&h=200&fit=crop",
      rating: 5,
      sale: false
    },
    { 
      id: 3, 
      name: "Cotton Polo", 
      price: 34.99, 
      originalPrice: null,
      image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=200&h=200&fit=crop",
      rating: 4,
      sale: false
    }
  ];

  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <h2 className="text-xl font-semibold mb-6 border-b-2 border-primary inline-block pb-1">
          Reviewed By You
        </h2>
        
        <div className="space-y-4">
          {reviewedProducts.map((product) => (
            <div key={product.id} className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-sm">
              <div className="relative">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded"
                />
                {product.sale && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 py-0.5 rounded text-[10px]">
                    SALE
                  </span>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-medium text-sm text-gray-800 mb-1">{product.name}</h3>
                
                {/* Rating */}
                <div className="flex items-center space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-3 h-3 ${i < product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                
                {/* Price */}
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-black text-sm">${product.price}</span>
                  {product.originalPrice && (
                    <span className="text-xs text-gray-500 line-through">${product.originalPrice}</span>
                  )}
                </div>
              </div>
              
              <button className="p-2 hover:bg-gray-100 rounded">
                <Heart className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ))}
        </div>

        {/* Season Sale Banner */}
        <div className="mt-8">
          <div 
            className="relative h-48 bg-cover bg-center rounded-lg overflow-hidden"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=400&h=300&fit=crop')"
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
              <div className="text-center text-white">
                <h3 className="text-2xl font-bold mb-2">SEASON</h3>
                <h2 className="text-4xl font-bold mb-4">SALE</h2>
                <p className="text-sm mb-4">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
                <button className="bg-white text-black px-6 py-2 font-semibold text-sm hover:bg-gray-100 transition-colors">
                  SHOP NOW
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reviewed;