import React, { useState } from "react";
import ProductHeader from "../components/ProductHeader";
import MyProfile from "../components/MyProfile";
import MyOrders from "../components/MyOrders";
import ErrorBoundary from "../components/ErrorBoundary";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState("orders");
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    console.log("Newsletter subscription:", email);
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Profile Header */}
      <ProductHeader 
        title="My Account"
        breadcrumbText="My Account"
        bannerImage="https://mollee-html-ten.vercel.app/assets/img/banner-checkout.jpg"
        altText="My Account Banner"
      />
      
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Side - Orders */}
          <div className="lg:col-span-8">
            {/* Tab Navigation */}
            <div className="flex items-center space-x-8 mb-8 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("profile")}
                className={`pb-4 border-b-2 transition-colors ${
                  activeTab === "profile"
                    ? "border-black"
                    : "border-transparent text-gray-500 hover:text-black"
                }`}
                style={{ font: '16px / 24px Raleway, sans-serif' }}
              >
                My Profile
              </button>
              <button
                onClick={() => setActiveTab("orders")}
                className={`pb-4 border-b-2 transition-colors ${
                  activeTab === "orders"
                    ? "border-black"
                    : "border-transparent text-gray-500 hover:text-black"
                }`}
                style={{ font: '16px / 24px Raleway, sans-serif' }}
              >
                My Orders
              </button>
            </div>

            {/* Orders Content */}
            {activeTab === "orders" && (
              <ErrorBoundary>
                <MyOrders />
              </ErrorBoundary>
            )}

            {/* Profile Content */}
            {activeTab === "profile" && <MyProfile />}
          </div>

          {/* Right Side - Newsletter */}
          <div className="lg:col-span-4">
            <div className="bg-gray-50 p-8 rounded-lg sticky top-4">
              <h3 
                className="mb-6"
                style={{ 
                  color: 'rgb(0, 0, 0)',
                  font: '400 28px / 34px "Josefin Sans", sans-serif'
                }}
              >
                Newsletter
              </h3>
              
              <p 
                className="mb-6"
                style={{ 
                  color: 'rgb(119, 119, 119)',
                  font: '16px / 24px Raleway, sans-serif'
                }}
              >
                Subscribe to be the first to hear about deals, offers and upcoming collections.
              </p>
              
              <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:border-black"
                  style={{ font: '16px / 24px Raleway, sans-serif' }}
                />
                
                <button
                  type="submit"
                  className="w-full bg-black text-white py-3 hover:bg-gray-800 transition-colors"
                  style={{ font: '600 16px / 24px Raleway, sans-serif' }}
                >
                  Subscribe
                </button>
              </form>
            </div>

            {/* Season Banner */}
            <div className="mt-8">
              <div 
                className="relative bg-cover bg-center h-64 rounded-lg overflow-hidden"
                style={{ 
                  backgroundImage: "url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop')"
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <h4 
                    className="text-white text-center"
                    style={{ 
                      font: '400 24px / 30px "Josefin Sans", sans-serif'
                    }}
                  >
                    NEW SEASON
                  </h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;