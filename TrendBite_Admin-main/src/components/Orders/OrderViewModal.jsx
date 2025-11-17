import React from 'react';
import {
  X,
  Package,
  User,
  MapPin,
  CreditCard,
  Truck,
  Calendar,
  Phone,
  Mail,
  Edit,
  Eye,
  Image as ImageIcon,
} from 'lucide-react';

const OrderViewModal = ({ order, isOpen, onClose, onUpdateStatus, onUpdateShipping, onUpdatePayment }) => {
  if (!isOpen || !order) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-warning-100 text-warning-800', label: 'Pending' },
      processing: { color: 'bg-blue-100 text-blue-800', label: 'Processing' },
      shipped: { color: 'bg-info-100 text-info-800', label: 'Shipped' },
      delivered: { color: 'bg-success-100 text-success-800', label: 'Delivered' },
      cancelled: { color: 'bg-danger-100 text-danger-800', label: 'Cancelled' },
      returned: { color: 'bg-gray-100 text-gray-800', label: 'Returned' },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-warning-100 text-warning-800', label: 'Pending' },
      paid: { color: 'bg-success-100 text-success-800', label: 'Paid' },
      failed: { color: 'bg-danger-100 text-danger-800', label: 'Failed' },
      refunded: { color: 'bg-gray-100 text-gray-800', label: 'Refunded' },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getShippingStatusBadge = (status) => {
    const statusConfig = {
      not_shipped: { color: 'bg-gray-100 text-gray-800', label: 'Not Shipped' },
      shipped: { color: 'bg-info-100 text-info-800', label: 'Shipped' },
      in_transit: { color: 'bg-blue-100 text-blue-800', label: 'In Transit' },
      delivered: { color: 'bg-success-100 text-success-800', label: 'Delivered' },
      failed: { color: 'bg-danger-100 text-danger-800', label: 'Delivery Failed' },
    };
    
    const config = statusConfig[status] || statusConfig.not_shipped;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
            <p className="text-gray-600 mt-1">Order #{order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Status */}
              <div className="card">
                <div className="card-content mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
                    <button
                      onClick={() => onUpdateStatus(order)}
                      className="btn btn-primary btn-sm"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Update Status
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Order Status
                      </label>
                      {getStatusBadge(order.status)}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Payment Status
                      </label>
                      {getPaymentStatusBadge(order.payment?.status || order.paymentStatus)}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        Shipping Status
                      </label>
                      {getShippingStatusBadge(order.shippingStatus)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="card">
                <div className="card-content mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {order.items?.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                        <div className="flex-shrink-0">
                          {item.product?.images && item.product.images.length > 0 ? (
                            <img
                              src={item.product.images[0].url}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {item.product?.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {item.variant?.size && `Size: ${item.variant.size}`}
                            {item.variant?.color && ` • Color: ${item.variant.color.name}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            SKU: {item.variant?.sku}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatPrice(item.unitPrice)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatPrice(item.totalPrice)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="card">
                <div className="card-content mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatPrice(order.subtotal)}</span>
                    </div>
                    {order.deliveryCost > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery</span>
                        <span className="font-medium">{formatPrice(order.deliveryCost)}</span>
                      </div>
                    )}
                    {order.discount && (
                      <div className="flex justify-between text-success-600">
                        <span>Discount ({order.discount.code})</span>
                        <span className="font-medium">-{formatPrice(order.discount.amount)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between">
                        <span className="text-lg font-semibold text-gray-900">Total</span>
                        <span className="text-lg font-semibold text-gray-900">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="card">
                <div className="card-content mt-4">
                  <div className="flex items-center mb-4">
                    <User className="h-5 w-5 text-gray-400 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Customer</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {order.customer?.firstName || order.user?.firstName} {order.customer?.lastName || order.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">{order.customer?.email || order.user?.email}</p>
                    </div>
                    {(order.customer?.phone || order.user?.phone) && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {order.customer?.phone || order.user?.phone}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Delivery Address */}
              <div className="card">
                <div className="card-content mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">Delivery Address</h3>
                    </div>
                    <button
                      onClick={() => onUpdateShipping(order)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Update
                    </button>
                  </div>
                  {order.deliveryAddress ? (
                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-gray-900">
                        {order.deliveryAddress.street}
                      </p>
                      <p className="text-gray-600">
                        {order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}
                      </p>
                      <p className="text-gray-600">{order.deliveryAddress.country}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No delivery address provided</p>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div className="card">
                <div className="card-content mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
                      <h3 className="text-lg font-semibold text-gray-900">Payment</h3>
                    </div>
                    <button
                      onClick={() => onUpdatePayment(order)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Update
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Method</span>
                      <span className="font-medium capitalize">
                        {order.payment?.method || order.paymentDetails?.method || order.paymentMethod || 'N/A'}
                      </span>
                    </div>
                    {(order.payment?.transactionId || order.paymentDetails?.transactionId) && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transaction ID</span>
                        <span className="font-medium text-xs">
                          {order.payment?.transactionId || order.paymentDetails?.transactionId}
                        </span>
                      </div>
                    )}
                    {(order.payment?.paidAt || order.paymentDetails?.paidAt) && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Paid At</span>
                        <span className="font-medium">
                          {formatDate(order.payment?.paidAt || order.paymentDetails?.paidAt)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              {(order.shipping?.trackingNumber || order.trackingInfo) && (
                <div className="card">
                  <div className="card-content mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Truck className="h-5 w-5 text-gray-400 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">Shipping</h3>
                      </div>
                      <button
                        onClick={() => onUpdateShipping(order)}
                        className="btn btn-secondary btn-sm"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Update
                      </button>
                    </div>
                    <div className="space-y-2 text-sm">
                      {order.shipping?.deliveryPartner && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Carrier</span>
                          <span className="font-medium">{order.shipping.deliveryPartner}</span>
                        </div>
                      )}
                      {(order.shipping?.trackingNumber || order.trackingInfo?.trackingNumber) && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Tracking Number</span>
                          <span className="font-medium text-xs">
                            {order.shipping?.trackingNumber || order.trackingInfo?.trackingNumber}
                          </span>
                        </div>
                      )}
                      {(order.shipping?.estimatedDeliveryDate || order.trackingInfo?.estimatedDelivery) && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Est. Delivery</span>
                          <span className="font-medium">
                            {formatDate(order.shipping?.estimatedDeliveryDate || order.trackingInfo?.estimatedDelivery)}
                          </span>
                        </div>
                      )}
                      {order.shippedAt && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipped At</span>
                          <span className="font-medium">
                            {formatDate(order.shippedAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Order Timeline */}
              <div className="card">
                <div className="card-content mt-4">
                  <div className="flex items-center mb-4">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Order Created</p>
                        <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    {(order.payment?.paidAt || order.paymentDetails?.paidAt) && (
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-success-600 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Payment Received</p>
                          <p className="text-xs text-gray-500">{formatDate(order.payment?.paidAt || order.paymentDetails?.paidAt)}</p>
                        </div>
                      </div>
                    )}
                    {order.shippedAt && (
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-info-600 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Order Shipped</p>
                          <p className="text-xs text-gray-500">{formatDate(order.shippedAt)}</p>
                        </div>
                      </div>
                    )}
                    {order.updatedAt && order.updatedAt !== order.createdAt && (
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-gray-400 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Last Updated</p>
                          <p className="text-xs text-gray-500">{formatDate(order.updatedAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="btn btn-secondary btn-md"
          >
            Close
          </button>
          <button
            onClick={() => onUpdateStatus(order)}
            className="btn btn-primary btn-md"
          >
            <Edit className="h-4 w-4 mr-2" />
            Update Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderViewModal;
