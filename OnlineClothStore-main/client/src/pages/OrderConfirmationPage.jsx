import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, Package, Clock, Phone, MapPin } from "lucide-react";
import { Button } from "../ui/button";

const OrderConfirmationPage = () => {
  const navigate = useNavigate();

  // Get order data from location state
  const location = useLocation();
  const orderData = location.state?.order;

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No order data found</h2>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const handleContinueShopping = () => {
    navigate("/");
  };

  const handleViewOrders = () => {
    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="flex flex-col items-center mb-6">
            <img
              src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=400&q=80"
              alt="Order Confirmed - Cloth Store"
              className="w-32 h-32 object-cover mx-auto rounded-full shadow-lg border-4 border-green-100"
              style={{ background: '#e6f9ed' }}
            />
            <div className="mt-4 text-xl font-bold text-green-700" style={{ fontFamily: 'Josefin Sans, sans-serif' }}>
              Welcome Again!
            </div>
          </div>
          
          <h1 
            className="mb-4"
            style={{ 
              color: 'rgb(0, 0, 0)',
              font: '400 36px / 42px "Josefin Sans", sans-serif'
            }}
          >
            Order Placed Successfully!
          </h1>
          
          <p 
            className="mb-8"
            style={{ 
              color: 'rgb(119, 119, 119)',
              font: '18px / 28px Raleway, sans-serif'
            }}
          >
            Thank you for your order. We'll send you a confirmation email shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Order Details */}
          <div className="space-y-8">
            {/* Order Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 
                className="mb-6"
                style={{ 
                  color: 'rgb(0, 0, 0)',
                  font: '400 24px / 30px "Josefin Sans", sans-serif'
                }}
              >
                Order Information
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span style={{ color: 'rgb(119, 119, 119)', font: '16px / 24px Raleway, sans-serif' }}>Order Number:</span>
                  <span className="font-semibold" style={{ color: 'rgb(0, 0, 0)', font: '16px / 24px Raleway, sans-serif' }}>{orderData.orderNumber || orderData._id || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'rgb(119, 119, 119)', font: '16px / 24px Raleway, sans-serif' }}>Order Date:</span>
                  <span style={{ color: 'rgb(0, 0, 0)', font: '16px / 24px Raleway, sans-serif' }}>{orderData.orderDate ? orderData.orderDate : (orderData.createdAt ? new Date(orderData.createdAt).toLocaleDateString() : '-')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'rgb(119, 119, 119)', font: '16px / 24px Raleway, sans-serif' }}>Payment Method:</span>
                  <span style={{ color: 'rgb(0, 0, 0)', font: '16px / 24px Raleway, sans-serif' }}>{orderData.paymentMethod ? orderData.paymentMethod.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Cash on Delivery'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span style={{ color: 'rgb(119, 119, 119)', font: '16px / 24px Raleway, sans-serif' }}>Total Amount:</span>
                  <span className="font-bold text-lg" style={{ color: 'rgb(0, 0, 0)', font: '18px / 24px Raleway, sans-serif' }}>{orderData.totalAmount ? `LKR ${orderData.totalAmount.toFixed(2)}` : '-'}</span>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-green-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <Clock className="w-5 h-5 text-green-600 mr-3" />
                <h3 
                  style={{ 
                    color: 'rgb(0, 0, 0)',
                    font: '400 20px / 26px "Josefin Sans", sans-serif'
                  }}
                >
                  Expected Delivery
                </h3>
              </div>
              
              <p 
                className="font-semibold"
                style={{ 
                  color: 'rgb(34, 197, 94)',
                  font: '18px / 24px Raleway, sans-serif'
                }}
              >
                {(() => {
                  // Get order date
                  let orderDate = orderData.orderDate ? new Date(orderData.orderDate) : (orderData.createdAt ? new Date(orderData.createdAt) : new Date());
                  let deliveryDate = new Date(orderDate);
                  deliveryDate.setDate(orderDate.getDate() + 3);
                  return deliveryDate.toLocaleDateString();
                })()}
              </p>
              
              <div className="flex items-start mt-4">
                <MapPin className="w-4 h-4 text-gray-500 mr-2 mt-1" />
                <p 
                  style={{ 
                    color: 'rgb(119, 119, 119)',
                    font: '14px / 20px Raleway, sans-serif'
                  }}
                >
                  {orderData.deliveryAddress
                    ? `${orderData.deliveryAddress.street}, ${orderData.deliveryAddress.city}, ${orderData.deliveryAddress.state} ${orderData.deliveryAddress.zipCode}, ${orderData.deliveryAddress.country}`
                    : (orderData.customer?.address || '-')}
                </p>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 
                className="mb-4"
                style={{ 
                  color: 'rgb(0, 0, 0)',
                  font: '400 20px / 26px "Josefin Sans", sans-serif'
                }}
              >
                Contact Information
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="w-4 h-4 text-gray-500 mr-3">🏪</span>
                  <span 
                    style={{ 
                      color: 'rgb(0, 0, 0)',
                      font: '16px / 24px Raleway, sans-serif'
                    }}
                  >
                    Tradevite Online Cloth Store
                  </span>
                </div>
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 text-gray-500 mr-3" />
                  <span 
                    style={{ 
                      color: 'rgb(0, 0, 0)',
                      font: '16px / 24px Raleway, sans-serif'
                    }}
                  >
                    123 Main Road, Colombo, Sri Lanka
                  </span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 text-gray-500 mr-3" />
                  <span 
                    style={{ 
                      color: 'rgb(0, 0, 0)',
                      font: '16px / 24px Raleway, sans-serif'
                    }}
                  >
                    +94 77 123 4567
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-4 h-4 text-gray-500 mr-3">@</span>
                  <span 
                    style={{ 
                      color: 'rgb(0, 0, 0)',
                      font: '16px / 24px Raleway, sans-serif'
                    }}
                  >
                    Tradevite@gmail.com
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-4 h-4 text-gray-500 mr-3">🕒</span>
                  <span 
                    style={{ 
                      color: 'rgb(0, 0, 0)',
                      font: '16px / 24px Raleway, sans-serif'
                    }}
                  >
                    Business Hours: Mon-Sat 9:00 AM - 7:00 PM
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 
                className="mb-6"
                style={{ 
                  color: 'rgb(0, 0, 0)',
                  font: '400 24px / 30px "Josefin Sans", sans-serif'
                }}
              >
                Order Items
              </h3>
              
              <div className="space-y-6">
                {(orderData.items || orderData.orderItems || []).map((item, idx) => (
                  <div key={item.id || item._id || idx} className="flex items-center gap-4 bg-white p-4 rounded  mb-4">
                    <img
                      src={item.image || item.product?.mainImage?.url || item.product?.images?.[0] || ''}
                      alt={item.name || item.product?.name || ''}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between">
                        <h4 className="mb-1 font-medium text-lg text-black" style={{ font: '16px / 20px Raleway, sans-serif' }}>{item.name || item.product?.name || ''}{item.variant?.size ? ` (${item.variant.size})` : ''}</h4>
                        <span className="font-bold text-xl text-black" style={{ font: '20px / 24px Raleway, sans-serif' }}>
                          {typeof item.price === 'number' && !isNaN(item.price)
                            ? `LKR ${item.price.toFixed(2)}`
                            : (item.unitPrice ? `LKR ${item.unitPrice.toFixed(2)}` : (item.product?.price ? `LKR ${item.product.price.toFixed(2)}` : '-'))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-gray-500 text-base" style={{ font: '14px / 18px Raleway, sans-serif' }}>Quantity: {item.quantity}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-gray-300 mt-6 pt-6">
                <div className="flex justify-between items-center">
                  <span 
                    className="font-semibold"
                    style={{ 
                      color: 'rgb(0, 0, 0)',
                      font: '18px / 24px Raleway, sans-serif'
                    }}
                  >
                    Total Amount
                  </span>
                  <span className="font-bold text-xl" style={{ color: 'rgb(0, 0, 0)', font: '24px / 30px Raleway, sans-serif' }}>{orderData.totalAmount ? `LKR ${orderData.totalAmount.toFixed(2)}` : '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12 relative">
          <Button
            onClick={handleContinueShopping}
            variant="outline"
            className="px-8 py-3 border-black text-black hover:bg-gray-50"
            style={{ font: '600 16px / 24px Raleway, sans-serif' }}
          >
            Continue Shopping
          </Button>
          <Button
            onClick={handleViewOrders}
            className="bg-black text-white hover:bg-gray-800 px-8 py-3"
            style={{ font: '600 16px / 24px Raleway, sans-serif' }}
          >
            View My Orders
          </Button>
          
        </div>

        {/* Additional Information */}
        <div className="text-center mt-12 p-6 bg-blue-50 rounded-lg">
          <div className="flex justify-center mb-4">
            <Package className="w-8 h-8 text-blue-600" />
          </div>
          <h4 
            className="mb-2"
            style={{ 
              color: 'rgb(0, 0, 0)',
              font: '400 20px / 26px "Josefin Sans", sans-serif'
            }}
          >
            What happens next?
          </h4>
          <p 
            style={{ 
              color: 'rgb(119, 119, 119)',
              font: '16px / 24px Raleway, sans-serif'
            }}
          >
            We'll prepare your order and contact you before delivery. 
            You can pay cash when your order arrives at your doorstep.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;