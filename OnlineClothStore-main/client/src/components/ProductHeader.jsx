import React from 'react';

const ProductHeader = ({ 
  title = "Shop", 
  breadcrumbText = "Shop", 
  bannerImage = "https://mollee-html-ten.vercel.app/assets/img/banner-shop.jpg",
  altText = "Banner Image"
}) => {
  return (
    <div className="bg-background">
      {/* Breadcrumb */}
      <nav className="container mx-auto px-4 py-4 max-w-6xl">
        <div className="flex items-center space-x-2 text-sm">
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
            {breadcrumbText}
          </span>
        </div>
      </nav>

      {/* Banner Section */}
      <div className="relative  min-h-[400px] flex items-center">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div>
              <h1 
                className="mb-4"
                style={{ 
                  color: 'rgb(0, 0, 0)',
                  font: '400 48px / 54px "Josefin Sans", sans-serif'
                }}
              >
                {title}
              </h1>
              <div className="w-16 h-1 bg-red-500 mb-6"></div>
            </div>
            
            {/* Right Image */}
            <div className="flex justify-end">
              <div className="relative">
                <img 
                  src={bannerImage}
                  alt={altText} 
                  className="w-full max-w-lg h-[300px] object-cover rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductHeader;