import React, { useState, useEffect } from "react";

import ProductCard from "../ui/ProductCard"

export default function TopProducts() {
  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentDesktopSlide, setCurrentDesktopSlide] = useState(0);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/dashboard/top-selling-products`);
        const data = await response.json();
        if (data.success && data.data && Array.isArray(data.data.topSellingProducts)) {
          setProducts(data.data.topSellingProducts);
        } else {
          setProducts([]);
        }
      } catch {
        setProducts([]);
      }
    };
    fetchTopProducts();
  }, []);

  // Group products into pairs for mobile slider
  const productPairs = [];
  for (let i = 0; i < products.length; i += 2) {
    productPairs.push(products.slice(i, i + 2));
  }

  // Group products into sets of 4 for desktop slider
  const desktopProductSets = []
  for (let i = 0; i < products.length; i += 4) {
    desktopProductSets.push(products.slice(i, i + 4));
  }

  return (
    <section className="py-8 sm:py-12 lg:py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="pb-5 sm:pb-7 text-center">
          <span className="block pb-3 sm:pb-5 text-xs sm:text-sm leading-5 font-raleway text-gray-700 uppercase tracking-widest">
            <b>top</b> products
          </span>
          <h2 className="pb-3 sm:pb-5 text-2xl sm:text-3xl lg:text-4xl xl:text-[40px] xl:leading-none font-josefin font-normal capitalize">
            Best Sellers At Mollee
          </h2>
          <p className="max-w-2xl mx-auto text-sm sm:text-base leading-6 sm:leading-7 font-raleway text-gray-700 px-4">
            Discover our best-selling products, loved by customers for their quality and style. Shop the top picks and elevate your wardrobe with the latest trends.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12 text-lg text-gray-500 font-semibold">No top products available.</div>
        ) : (
          <>
            {/* Mobile Slider - Shows 2 products per slide */}
            <div className="block lg:hidden mb-8">
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {productPairs.map((pair, index) => (
                    <div key={index} className="min-w-full">
                      <div className="grid grid-cols-2 gap-4 px-2">
                        {pair.map((product) => (
                          <ProductCard 
                            key={product._id}
                            product={{
                              name: (
                                <a 
                                  href={`/product/${product._id}`}
                                  className="text-gray-900 hover:underline"
                                  title={product.productName}
                                >
                                  {product.productName}
                                </a>
                              ),
                              image: product.image,
                              price: product.totalRevenue,
                              brand: product.brand,
                              totalQuantity: product.totalQuantity,
                              ...product
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Mobile Navigation Dots */}
              <div className="flex justify-center gap-2 mt-6">
                {productPairs.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-8 h-0.5 rounded transition-colors duration-200 cursor-pointer ${
                      index === currentSlide ? 'bg-gray-800' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Desktop Grid - Shows all products */}
            <div className="hidden lg:block">
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentDesktopSlide * 100}%)` }}
                >
                  {desktopProductSets.map((productSet, index) => (
                    <div key={index} className="min-w-full">
                      <div className="grid grid-cols-4 gap-8 mb-12">
                        {productSet.map((product) => (
                          <ProductCard 
                            key={product._id}
                            product={{
                              name: product.productName,
                              image: product.image,
                              price: product.totalRevenue,
                              brand: product.brand,
                              totalQuantity: product.totalQuantity,
                              ...product
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Desktop Navigation Dots */}
              <div className="flex justify-center gap-2">
                {desktopProductSets.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentDesktopSlide(index)}
                    className={`w-8 h-0.5 rounded transition-colors duration-200 cursor-pointer ${
                      index === currentDesktopSlide ? 'bg-gray-800' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
