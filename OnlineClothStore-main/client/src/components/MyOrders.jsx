
import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';

const MyOrders = () => {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Pagination state
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1 });
  const [showActive, setShowActive] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          setError('Please login to view your orders.');
          setLoading(false);
          return;
        }
        const url = `${import.meta.env.VITE_API_BASE_URL}/api/orders/my-orders?page=${pagination.currentPage}&limit=7`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const result = await response.json();
        if (response.ok && result.success) {
          setOrders(result.data);
          if (result.pagination) {
            setPagination({
              currentPage: result.pagination.currentPage,
              totalPages: result.pagination.totalPages
            });
          }
        } else {
          setError(result.message || 'Failed to fetch orders.');
        }
      } catch (err) {
        console.error('Failed to fetch orders', err);
        setError(err?.message || 'Failed to fetch orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [pagination.currentPage]);

  const toggleOrderDetails = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleDeleteHistory = () => {
    console.log("Delete order history");
  };

  // Inline cancel UI state
  const [cancelUI, setCancelUI] = useState({ orderId: null, reason: 'Changed my mind', custom: '' });
  // Rating UI state
  const [rateUI, setRateUI] = useState({ orderId: null, rating: 5, feedback: '' });
  const cancelOptions = [
    'Changed my mind',
    'Found a better price',
    'Ordered by mistake',
    'Delivery time is too long',
    'Other'
  ];

  const openCancelUI = (orderId) => {
    setCancelUI({ orderId, reason: 'Changed my mind', custom: '' });
  };
  const closeCancelUI = () => {
    setCancelUI({ orderId: null, reason: 'Changed my mind', custom: '' });
  };

  const openRateUI = (orderId) => {
    setRateUI({ orderId, rating: 5, feedback: '' });
  };
  const closeRateUI = () => {
    setRateUI({ orderId: null, rating: 5, feedback: '' });
  };

  const handleRateSubmit = async (orderId) => {
    const { rating, feedback } = rateUI;
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        toast.error('Please login to rate delivery.');
        return;
      }
      const url = `${import.meta.env.VITE_API_BASE_URL}/api/orders/${orderId}/rate-delivery`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rating, feedback })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        // Prefer server returned order if present
        const updatedOrder = result.data?.order || result.data || null;
        toast.success(result.message || 'Thank you for your feedback');
        if (updatedOrder && updatedOrder._id) {
          setOrders(prev => prev.map(o => o._id === orderId ? ({ ...o, ...updatedOrder }) : o));
        } else {
          // Safe local merge to avoid removing properties expected by the UI
          setOrders(prev => prev.map(o => o._id === orderId ? ({ ...o, status: 'delivered', statusDisplay: 'Delivered', deliveryRating: rating, deliveryFeedback: feedback }) : o));
        }
        // close modal after a short delay so toast is visible
        setTimeout(() => closeRateUI(), 500);
      } else {
        toast.error(result.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('Rate submit error', error);
      toast.error('Failed to submit rating');
    }
  };

  const handleCancelOrder = async (orderId) => {
    let reason = cancelUI.reason === 'Other' ? cancelUI.custom.trim() : cancelUI.reason;
    if (!reason) {
      toast.error('Please provide a reason for cancellation.');
      return;
    }
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      const result = await response.json();
      if (response.ok && result.success) {
        toast.success(result.message || 'Order cancelled successfully');
        setOrders((prev) => prev.map(o => o._id === orderId ? { ...o, status: 'cancelled', statusDisplay: 'Cancelled' } : o));
        closeCancelUI();
      } else {
        toast.error(result.message || 'Failed to cancel order');
      }
    } catch (err) {
      toast.error('Failed to cancel order',err);
    }
  };

  // Filter for active orders (pending/assigned)
  const filteredOrders = showActive
    ? orders.filter(order => order.status === 'pending' || order.status === 'assigned')
    : orders;

  return (
    <div className="space-y-0">
      {loading ? (
        <div className="text-center py-12 text-gray-600">Loading your orders...</div>
      ) : error ? (
        <div className="text-center py-12 text-red-600">{error}</div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-gray-600">No orders found.</div>
      ) : (
        filteredOrders.map((order) => {
          // Status color, label, and icon
          let statusColor = 'text-gray-500';
          let statusLabel = order.statusDisplay || order.status;
          let statusIcon = null;
          if (order.status === 'pending') {
            statusColor = 'text-orange-500';
            statusIcon = (
              <svg className="ml-2 w-5 h-5 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-30"/>
                <path d="M12 7v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="16" r="1" fill="currentColor" />
              </svg>
            );
          }
          if (order.status === 'assigned') {
            statusColor = 'text-blue-500';
            statusLabel = 'Assigned';
            statusIcon = (
              <svg className="ml-2 w-5 h-5 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-30"/>
                <path d="M8 12h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="16" r="1" fill="currentColor" />
              </svg>
            );
          }
          if (order.status === 'delivered') {
            statusColor = 'text-green-500';
            statusIcon = (
              <img
                src="https://mollee-html-ten.vercel.app/assets/img/svg/order-icon_2.svg"
                alt="Delivered"
                className="ml-2 w-4 h-4"
              />
            );
          }
          if (order.status === 'cancelled') {
            statusColor = 'text-red-500';
            statusIcon = (
              <svg className="ml-2 w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-30"/><path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            );
          }
          // Order date
          const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '-';
          return (
            <div key={order._id || order.orderNumber} className="border-b border-gray-200 last:border-b-0">
              {/* Order Header */}
              <div
                className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleOrderDetails(order._id || order.orderNumber)}
              >
                <div className="flex items-center space-x-8">
                  <span
                    className="font-medium"
                    style={{
                      color: 'rgb(0, 0, 0)',
                      font: '16px / 24px Raleway, sans-serif'
                    }}
                  >
                    {order.orderNumber || order._id}
                  </span>
                  <span
                    style={{
                      color: 'rgb(119, 119, 119)',
                      font: '16px / 24px Raleway, sans-serif'
                    }}
                  >
                    {orderDate}
                  </span>
                  <span
                    className={`font-medium ${statusColor} flex items-center`}
                    style={{ font: '16px / 24px Raleway, sans-serif' }}
                  >
                    {statusLabel}
                    {statusIcon}
                  </span>
                  {/* Cancel button for pending/assigned */}
                  {(order.status === 'pending' || order.status === 'assigned') && (
                    <div className="flex flex-col items-start">
                      <button
                        className="ml-4 px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        onClick={e => {
                          e.stopPropagation();
                          openCancelUI(order._id);
                        }}
                        disabled={cancelUI.orderId === order._id}
                      >
                        Cancel
                      </button>
                      {cancelUI.orderId === order._id && (
                        <div className="mt-2 ml-4 flex flex-col gap-2 bg-gray-50 border border-gray-200 rounded p-4 w-72 shadow-lg">
                          <span className="font-medium mb-1 text-sm">Select reason:</span>
                          {cancelOptions.map(option => (
                            <label key={option} className="flex items-center text-sm">
                              <input
                                type="radio"
                                name={`cancelReason-${order._id}`}
                                value={option}
                                checked={cancelUI.reason === option}
                                onChange={() => setCancelUI(ui => ({ ...ui, reason: option }))}
                                className="mr-2"
                              />
                              {option}
                            </label>
                          ))}
                          {cancelUI.reason === 'Other' && (
                            <input
                              type="text"
                              className="mt-1 w-full border border-gray-300 rounded px-2 py-1 text-sm"
                              placeholder="Type your reason..."
                              value={cancelUI.custom}
                              onChange={e => setCancelUI(ui => ({ ...ui, custom: e.target.value }))}
                              maxLength={100}
                              required
                            />
                          )}
                          <div className="flex gap-2 mt-2">
                            <button
                              type="button"
                              className="px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 text-sm"
                              onClick={closeCancelUI}
                            >
                              Close
                            </button>
                            <button
                              type="button"
                              className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600 text-sm"
                              onClick={() => handleCancelOrder(order._id)}
                            >
                              Confirm Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <svg
                  className={`w-5 h-5 transition-transform duration-200 text-gray-400 ${
                    expandedOrder === (order._id || order.orderNumber) ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
              {/* Order Details - Expandable */}
              {expandedOrder === (order._id || order.orderNumber) && (
                <div className="px-6 pb-6 bg-gray-50">
                  <div className="pt-4 border-t border-gray-200">
                    {/* Order Items */}
                    <div className="space-y-4 mb-6">
                      {(order.items || order.orderItems || []).map((item, idx) => (
                        <div key={item._id || item.product?._id || idx} className="flex items-center space-x-4">
                          <img
                            src={item.product?.images?.[0]?.url || item.product?.mainImage?.url || ''}
                            alt={item.product?.name || ''}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h4
                              className="font-medium mb-1"
                              style={{
                                color: 'rgb(0, 0, 0)',
                                font: '16px / 20px Raleway, sans-serif'
                              }}
                            >
                              {item.product?.name || ''} {item.variant?.size ? `(${item.variant.size})` : ''}
                            </h4>
                            <p
                              style={{
                                color: 'rgb(119, 119, 119)',
                                font: '14px / 18px Raleway, sans-serif'
                              }}
                            >
                              x{item.quantity}
                            </p>
                          </div>
                          <span
                            className="font-semibold"
                            style={{
                              color: 'rgb(0, 0, 0)',
                              font: '16px / 20px Raleway, sans-serif'
                            }}
                          >
                            LKR {typeof item.totalPrice === 'number' ? item.totalPrice.toFixed(2) : (item.unitPrice ? (item.unitPrice * item.quantity).toFixed(2) : '-')}
                          </span>
                        </div>
                      ))}
                    </div>
                    <hr className="my-6 border-gray-300" />
                    {/* Order Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5
                          className="font-semibold mb-2"
                          style={{
                            color: 'rgb(0, 0, 0)',
                            font: '16px / 20px Raleway, sans-serif'
                          }}
                        >
                          Order amount
                        </h5>
                        <p
                          className="text-xl font-bold"
                          style={{
                            color: 'rgb(0, 0, 0)',
                            font: '20px / 24px Raleway, sans-serif'
                          }}
                        >
                          LKR {order.totalAmount ? order.totalAmount.toFixed(2) : '-'}
                        </p>
                      </div>
                      <div>
                        <h5
                          className="font-semibold mb-2"
                          style={{
                            color: 'rgb(0, 0, 0)',
                            font: '16px / 20px Raleway, sans-serif'
                          }}
                        >
                          Delivered to
                        </h5>
                        <p
                          style={{
                            color: 'rgb(119, 119, 119)',
                            font: '14px / 18px Raleway, sans-serif'
                          }}
                        >
                          {order.deliveryAddress ? `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zipCode}, ${order.deliveryAddress.country}` : '-'}
                        </p>
                      </div>
                    </div>
                    {/* Rating UI - show for delivered orders or allow rating after delivery */}
                    <div className="mt-4">
                      {order.status === 'delivered' && (
                        <div className="flex items-center space-x-3">
                          <button
                            className={`px-3 py-1 rounded text-sm shadow-md transition-colors ${order.deliveryRating ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                            onClick={e => {
                              e.stopPropagation();
                              const dr = order.deliveryRating;
                              const ratingValue = typeof dr === 'number' ? dr : (dr && typeof dr === 'object' ? dr.rating : null);
                              if (ratingValue != null) {
                                toast.error('You have already submitted a delivery review for this order.');
                                return;
                              }
                              openRateUI(order._id);
                            }}
                            disabled={!!order.deliveryRating}
                          >
                            Rate delivery
                          </button>
                          {(() => {
                            const dr = order.deliveryRating ?? order.deliveryRating;
                            const ratingValue = typeof dr === 'number' ? dr : (dr && typeof dr === 'object' ? dr.rating : null);
                            if (ratingValue != null) {
                              return <div className="text-sm text-gray-700">Your rating: {ratingValue} / 5</div>;
                            }
                            return null;
                          })()}
                        </div>
                      )}

                      {/* Rating Modal */}
                      {rateUI.orderId === order._id && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                          <div className="absolute inset-0 bg-black opacity-40" onClick={closeRateUI} />
                          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6 z-10">
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="text-xl font-semibold">Rate your delivery</h3>
                                <p className="text-sm text-gray-500">Tell us about your delivery experience.</p>
                              </div>
                              <button onClick={closeRateUI} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>

                            <div className="mt-4">
                              <div className="flex items-center space-x-2">
                                {/* Star rating */}
                                <div className="flex items-center">
                                  {[1,2,3,4,5].map(i => (
                                    <button
                                      key={i}
                                      type="button"
                                      onClick={() => setRateUI(ui => ({ ...ui, rating: i }))}
                                      className={`text-3xl transition-colors ${i <= rateUI.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                      aria-label={`Rate ${i} stars`}
                                    >
                                      ★
                                    </button>
                                  ))}
                                </div>
                                <div className="text-sm text-gray-600">{rateUI.rating} / 5</div>
                              </div>

                              <div className="mt-4">
                                <label className="text-sm font-medium text-gray-700">Feedback (optional)</label>
                                <textarea
                                  value={rateUI.feedback}
                                  onChange={e => setRateUI(ui => ({ ...ui, feedback: e.target.value }))}
                                  rows={4}
                                  className="mt-2 w-full border border-gray-200 rounded p-3 text-sm placeholder-gray-400"
                                  placeholder="Share anything that stood out about the delivery..."
                                />
                              </div>

                              <div className="mt-6 flex justify-end gap-3">
                                <button
                                  onClick={closeRateUI}
                                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleRateSubmit(order._id)}
                                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-900 shadow"
                                >
                                  Submit review
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center space-x-1" aria-label="Pagination">
            <button
              onClick={() => setPagination(p => ({ ...p, currentPage: Math.max(1, p.currentPage - 1) }))}
              disabled={pagination.currentPage === 1}
              className={`px-2 py-1 text-base border border-gray-300 bg-white ${pagination.currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              aria-label="Previous"
            >
              &#60;
            </button>
            {[...Array(pagination.totalPages)].map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => setPagination(p => ({ ...p, currentPage: idx + 1 }))}
                className={`px-3 py-1 text-base border border-gray-300 ${pagination.currentPage === idx + 1 ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100 bg-white'}`}
                aria-current={pagination.currentPage === idx + 1 ? 'page' : undefined}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => setPagination(p => ({ ...p, currentPage: Math.min(p.totalPages, p.currentPage + 1) }))}
              disabled={pagination.currentPage === pagination.totalPages}
              className={`px-2 py-1 text-base border border-gray-300 bg-white ${pagination.currentPage === pagination.totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
              aria-label="Next"
            >
              &#62;
            </button>
          </nav>
        </div>
      )}
      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-8">
        <button
          onClick={handleDeleteHistory}
          className="bg-black text-white px-6 py-3 hover:bg-gray-800 transition-colors"
          style={{ font: '600 16px / 24px Raleway, sans-serif' }}
        >
          Delete History
        </button>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="showActive"
            className="mr-2 w-4 h-4"
            checked={showActive}
            onChange={e => setShowActive(e.target.checked)}
          />
          <label
            htmlFor="showActive"
            style={{
              color: 'rgb(119, 119, 119)',
              font: '16px / 24px Raleway, sans-serif'
            }}
          >
            Show only active (Pending/Assigned)
          </label>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;