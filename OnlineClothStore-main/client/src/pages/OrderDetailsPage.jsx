import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "../ui/button";
import ProductHeader from "../components/ProductHeader";

const OrderDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get data from checkout flow
  const checkoutData = location.state;
  
  // Redirect to checkout if no data
  useEffect(() => {
    if (!checkoutData) {
      navigate("/checkout");
    }
  }, [checkoutData, navigate]);

  const [formData, setFormData] = useState({
    firstName: checkoutData?.paymentInfo?.firstName || "",
    lastName: checkoutData?.paymentInfo?.lastName || "",
    phone: checkoutData?.paymentInfo?.phone || "",
    email: checkoutData?.paymentInfo?.email || "",
    agreeToPolicy: false,
    country: "United States",
    city: checkoutData?.paymentInfo?.city || "",
    address: checkoutData?.paymentInfo?.address || "",
    deliveryDay: "",
    deliveryTime: "",
    comment: "",
    createAccount: false,
    dontCallMe: false,
  });

  // const [currentStep, setCurrentStep] = useState(1);

  const cartItems = checkoutData?.cartItems || [];
  const orderPrice = checkoutData?.subtotal || 0;
  const delivery = checkoutData?.delivery || 16;
  const total = checkoutData?.total || (orderPrice + delivery);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleContinue = () => {
    // Handle form submission and navigate to order confirmation
    console.log('Form data:', formData);
    navigate("/order-confirmation", {
      state: {
        orderData: {
          ...checkoutData,
          deliveryInfo: formData,
          orderNumber: `ORD-${Date.now()}`,
          orderDate: new Date().toISOString(),
        }
      }
    });
  };

  const handleReturn = () => {
    // Handle return to checkout page
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Checkout Header */}
      <ProductHeader 
        title="Checkout"
        breadcrumbText="Checkout"
        bannerImage="https://mollee-html-ten.vercel.app/assets/img/banner-checkout.jpg"
        altText="Checkout Banner"
      />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl mt-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center space-x-8">
            {/* Step 1 - Order Details */}
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <img 
                  src="https://mollee-html-ten.vercel.app/assets/img/svg/car.svg" 
                  alt="Order Details" 
                  className="w-4 h-4"
                />
              </div>
              <span 
                className="text-gray-400"
                style={{ font: '16px / 24px Raleway, sans-serif' }}
              >
                Order Details
              </span>
            </div>

            <div className="w-16 h-px bg-gray-300"></div>

            {/* Step 2 - Payment Method */}
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mr-3">
                <img 
                  src="https://mollee-html-ten.vercel.app/assets/img/svg/car.svg" 
                  alt="Payment Method" 
                  className="w-4 h-4 text-white"
                />
              </div>
              <span 
                className="text-green-500 font-medium"
                style={{ font: '16px / 24px Raleway, sans-serif' }}
              >
                Payment Method
              </span>
            </div>

            <div className="w-16 h-px bg-gray-300"></div>

            {/* Step 3 - Finish */}
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                <span className="text-gray-400 text-sm">3</span>
              </div>
              <span 
                className="text-gray-400"
                style={{ font: '16px / 24px Raleway, sans-serif' }}
              >
                Finish
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Side - Form */}
          <div className="lg:col-span-8 space-y-12">
            {/* Contact Person Section */}
            <div>
              <h2 
                className="mb-8"
                style={{ 
                  color: 'rgb(0, 0, 0)',
                  font: '400 28px / 34px "Josefin Sans", sans-serif'
                }}
              >
                Contact Person
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <input
                  type="text"
                  name="firstName"
                  placeholder="Enter your name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-0 py-3 border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-black"
                  style={{ font: '16px / 24px Raleway, sans-serif' }}
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-0 py-3 border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-black"
                  style={{ font: '16px / 24px Raleway, sans-serif' }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter your phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-0 py-3 border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-black"
                  style={{ font: '16px / 24px Raleway, sans-serif' }}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-0 py-3 border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-black"
                  style={{ font: '16px / 24px Raleway, sans-serif' }}
                />
              </div>

              <div className="flex items-center mb-8">
                <input
                  type="checkbox"
                  name="agreeToPolicy"
                  checked={formData.agreeToPolicy}
                  onChange={handleInputChange}
                  className="mr-3 w-4 h-4"
                />
                <span 
                  style={{ 
                    color: 'rgb(119, 119, 119)',
                    font: '16px / 24px Raleway, sans-serif'
                  }}
                >
                  I agree with the{' '}
                  <span className="text-blue-500 underline cursor-pointer">privacy policy</span>
                </span>
              </div>
            </div>

            {/* Delivery Address Section */}
            <div>
              <h2 
                className="mb-8"
                style={{ 
                  color: 'rgb(0, 0, 0)',
                  font: '400 28px / 34px "Josefin Sans", sans-serif'
                }}
              >
                Delivery Address
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="relative">
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full px-0 py-3 border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-black appearance-none"
                    style={{ font: '16px / 24px Raleway, sans-serif' }}
                  >
                    <option value="">Choose your country</option>
                    <option value="us">United States</option>
                    <option value="uk">United Kingdom</option>
                    <option value="ca">Canada</option>
                  </select>
                  <div className="absolute right-0 top-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-0 py-3 border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-black appearance-none"
                    style={{ font: '16px / 24px Raleway, sans-serif' }}
                  >
                    <option value="">Choose your city</option>
                    <option value="new-york">New York</option>
                    <option value="london">London</option>
                    <option value="toronto">Toronto</option>
                  </select>
                  <div className="absolute right-0 top-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <input
                type="text"
                name="address"
                placeholder="Enter the delivery address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-0 py-3 mb-6 border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-black"
                style={{ font: '16px / 24px Raleway, sans-serif' }}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <input
                  type="text"
                  name="deliveryDay"
                  placeholder="Desired delivery day"
                  value={formData.deliveryDay}
                  onChange={handleInputChange}
                  className="w-full px-0 py-3 border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-black"
                  style={{ font: '16px / 24px Raleway, sans-serif' }}
                />
                <input
                  type="text"
                  name="deliveryTime"
                  placeholder="Desired delivery time"
                  value={formData.deliveryTime}
                  onChange={handleInputChange}
                  className="w-full px-0 py-3 border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-black"
                  style={{ font: '16px / 24px Raleway, sans-serif' }}
                />
              </div>

              <textarea
                name="comment"
                placeholder="Enter your comment to the order"
                value={formData.comment}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-0 py-3 mb-8 border-0 border-b border-gray-300 bg-transparent focus:outline-none focus:border-black resize-none"
                style={{ font: '16px / 24px Raleway, sans-serif' }}
              />

              <div className="space-y-4 mb-12">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="createAccount"
                    checked={formData.createAccount}
                    onChange={handleInputChange}
                    className="mr-3 w-4 h-4"
                  />
                  <span 
                    style={{ 
                      color: 'rgb(119, 119, 119)',
                      font: '16px / 24px Raleway, sans-serif'
                    }}
                  >
                    Create an account
                  </span>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="dontCallMe"
                    checked={formData.dontCallMe}
                    onChange={handleInputChange}
                    className="mr-3 w-4 h-4"
                  />
                  <span 
                    style={{ 
                      color: 'rgb(119, 119, 119)',
                      font: '16px / 24px Raleway, sans-serif'
                    }}
                  >
                    Don't call me, I'm sure of the order
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleReturn}
                className="flex items-center text-black hover:text-gray-600"
                style={{ font: '16px / 24px Raleway, sans-serif' }}
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Return
              </button>

              <Button
                onClick={handleContinue}
                className="bg-black text-white hover:bg-gray-800 px-8 py-3"
                style={{ font: '600 16px / 24px Raleway, sans-serif' }}
              >
                Continue
              </Button>
            </div>
          </div>

          {/* Right Side - Order Summary */}
          <div className="lg:col-span-4">
            <div className="bg-gray-50 p-8 sticky top-0 h-fit">
              <h3 
                className="mb-8"
                style={{ 
                  color: 'rgb(0, 0, 0)',
                  font: '400 28px / 34px "Josefin Sans", sans-serif'
                }}
              >
                Your Order
              </h3>

              {/* Order Items */}
              <div className="space-y-6 mb-8">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 
                        className="mb-1"
                        style={{ 
                          color: 'rgb(0, 0, 0)',
                          font: '16px / 20px Raleway, sans-serif'
                        }}
                      >
                        {item.name}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span 
                          className="font-semibold"
                          style={{ 
                            color: 'rgb(235, 87, 87)',
                            font: '16px / 20px Raleway, sans-serif'
                          }}
                        >
                          ${item.price}
                        </span>
                        {item.originalPrice && (
                          <span 
                            className="line-through text-sm"
                            style={{ 
                              color: 'rgb(153, 153, 153)',
                              font: '14px / 18px Raleway, sans-serif'
                            }}
                          >
                            ${item.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span 
                    style={{ 
                      color: 'rgb(102, 102, 102)',
                      font: '16px / 24px Raleway, sans-serif'
                    }}
                  >
                    Order price
                  </span>
                  <span 
                    style={{ 
                      color: 'rgb(0, 0, 0)',
                      font: '16px / 24px Raleway, sans-serif'
                    }}
                  >
                    ${orderPrice}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span 
                    style={{ 
                      color: 'rgb(102, 102, 102)',
                      font: '16px / 24px Raleway, sans-serif'
                    }}
                  >
                    Discount for promo code
                  </span>
                  <span 
                    style={{ 
                      color: 'rgb(102, 102, 102)',
                      font: '16px / 24px Raleway, sans-serif'
                    }}
                  >
                    No
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span 
                    style={{ 
                      color: 'rgb(102, 102, 102)',
                      font: '16px / 24px Raleway, sans-serif'
                    }}
                  >
                    Delivery <span className="text-sm">(Aug 02 at 16:00)</span>
                  </span>
                  <span 
                    style={{ 
                      color: 'rgb(0, 0, 0)',
                      font: '16px / 24px Raleway, sans-serif'
                    }}
                  >
                    ${delivery}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-300 pt-6">
                <div className="flex justify-between items-center">
                  <span 
                    className="font-semibold"
                    style={{ 
                      color: 'rgb(0, 0, 0)',
                      font: '18px / 24px Raleway, sans-serif'
                    }}
                  >
                    Total
                  </span>
                  <span 
                    className="font-bold"
                    style={{ 
                      color: 'rgb(0, 0, 0)',
                      font: '24px / 30px Raleway, sans-serif'
                    }}
                  >
                    ${total}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;