import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Phone, 
  MapPin,
  Eye,
  MessageSquare,
  Download,
  Trash2,
  Calendar,
  Filter
} from 'lucide-react';
import { deliveryAPI } from '../../services/api';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
// TrendBite logo from assets folder
const TrendBiteLogo = 'src/assets/images/TrendBite.jpeg';

const DeliveryOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [statusData, setStatusData] = useState({
    status: '',
    estimatedDeliveryTime: '',
    deliveryNotes: ''
  });
  const [deleteFilters, setDeleteFilters] = useState({
    dateFrom: '',
    dateTo: '',
    olderThanDays: '',
    confirmDelete: false
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await deliveryAPI.getMyOrders();
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      await deliveryAPI.updateOrderStatus(selectedOrder._id, statusData);
      toast.success('Order status updated successfully');
      setShowStatusModal(false);
      setSelectedOrder(null);
      setStatusData({ status: '', estimatedDeliveryTime: '', deliveryNotes: '' });
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleDeleteDeliveredOrders = async () => {
    if (!deleteFilters.confirmDelete) {
      toast.error('Please confirm the deletion by checking the confirmation box');
      return;
    }

    try {
      setDeleteLoading(true);
      const params = {
        confirmDelete: 'true'
      };

      // Add date filters if provided
      if (deleteFilters.dateFrom) {
        params.dateFrom = deleteFilters.dateFrom;
      }
      if (deleteFilters.dateTo) {
        params.dateTo = deleteFilters.dateTo;
      }
      if (deleteFilters.olderThanDays) {
        params.olderThanDays = deleteFilters.olderThanDays;
      }

      const response = await deliveryAPI.deleteDeliveredOrders(params);
      toast.success(response.data.message || 'Delivered orders deleted successfully');
      setShowDeleteModal(false);
      setDeleteFilters({
        dateFrom: '',
        dateTo: '',
        olderThanDays: '',
        confirmDelete: false
      });
      fetchOrders();
    } catch (error) {
      console.error('Error deleting delivered orders:', error);
      toast.error(error.response?.data?.message || 'Failed to delete delivered orders');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'out_for_delivery':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'assigned':
        return <Package className="h-4 w-4" />;
      case 'out_for_delivery':
        return <Clock className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const generatePDF = async () => {
    if (orders.length === 0) {
      toast.error('No orders to download');
      return;
    }

    // Create HTML template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { display: flex; align-items: center; margin-bottom: 20px; }
          .logo { width: 80px; height: 40px; margin-right: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #333; }
          .subtitle { font-size: 12px; color: #666; margin-top: 5px; }
          .filters { background: #f5f5f5; padding: 10px; margin: 10px 0; border-radius: 5px; }
          .filter-item { margin: 5px 0; font-size: 12px; }
          .stats { background: #e8f4fd; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .stats h3 { margin: 0 0 10px 0; color: #0066cc; }
          .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
          .stat-item { text-align: center; }
          .stat-value { font-size: 18px; font-weight: bold; color: #0066cc; }
          .stat-label { font-size: 12px; color: #666; }
          .order-item { border: 1px solid #ddd; margin: 10px 0; padding: 15px; border-radius: 5px; }
          .order-header { font-weight: bold; font-size: 16px; color: #333; margin-bottom: 10px; }
          .order-details { font-size: 12px; margin: 5px 0; }
          .customer-info { background: #f9f9f9; padding: 10px; margin: 10px 0; border-radius: 3px; }
          .address-info { background: #f0f0f0; padding: 10px; margin: 10px 0; border-radius: 3px; }
          .items-list { margin: 10px 0; }
          .item { margin: 5px 0; padding-left: 15px; }
          .footer { margin-top: 30px; font-size: 10px; color: #999; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${TrendBiteLogo}" alt="TrendBite Logo" class="logo" />
          <div>
            <div class="title">Delivery Orders Report</div>
            <div class="subtitle">Generated on: ${new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</div>
          </div>
        </div>
        
        <div class="filters">
          <strong>Applied Filters:</strong>
          ${searchTerm ? `<div class="filter-item">Search Filter: "${searchTerm}"</div>` : ''}
          ${statusFilter !== 'all' ? `<div class="filter-item">Status Filter: ${statusFilter.replace('_', ' ').toUpperCase()}</div>` : ''}
          ${dateFilter !== 'all' ? `<div class="filter-item">Date Filter: ${dateFilter}</div>` : ''}
        </div>

        <h3>Current Page: ${orders.length} orders (Page ${currentPage} of ${totalPages})</h3>
        
        ${orders.map(order => `
          <div class="order-item">
            <div class="order-header">Order #${order.orderNumber}</div>
            <div class="order-details"><strong>Order ID:</strong> ${order._id}</div>
            <div class="order-details"><strong>Status:</strong> ${order.status.replace('_', ' ').toUpperCase()}</div>
            <div class="order-details"><strong>Total Amount:</strong> ${formatPrice(order.totalAmount)}</div>
            <div class="order-details"><strong>Created Date:</strong> ${formatDate(order.createdAt)}</div>
            
            <div class="customer-info">
              <strong>Customer Information:</strong>
              ${(() => {
                const customer = order.customer || order.user;
                return `
                  <div>Name: ${customer?.firstName} ${customer?.lastName}</div>
                  <div>Email: ${customer?.email}</div>
                  ${customer?.phone ? `<div>Phone: ${customer.phone}</div>` : ''}
                `;
              })()}
            </div>
            
            ${order.deliveryAddress ? `
            <div class="address-info">
              <strong>Delivery Address:</strong>
              <div>${order.deliveryAddress.street}</div>
              <div>${order.deliveryAddress.city}, ${order.deliveryAddress.state} ${order.deliveryAddress.zipCode}</div>
              ${order.deliveryAddress.country ? `<div>${order.deliveryAddress.country}</div>` : ''}
            </div>
            ` : ''}
            
            ${order.items && order.items.length > 0 ? `
            <div class="items-list">
              <strong>Order Items:</strong>
              ${order.items.map(item => `
                <div class="item">
                  <div><strong>${item.product?.name || 'Unknown Product'}</strong></div>
                  ${item.variant ? `<div>Variant: ${item.variant.size || 'N/A'} - ${item.variant.color?.name || 'N/A'}</div>` : ''}
                  <div>Quantity: ${item.quantity} | Unit Price: ${formatPrice(item.unitPrice || 0)} | Total: ${formatPrice(item.totalPrice || 0)}</div>
                </div>
              `).join('')}
            </div>
            ` : ''}
            
            ${order.deliveryPerson ? `
            <div class="order-details">
              <strong>Delivery Person:</strong>
              <div>Name: ${order.deliveryPerson.firstName} ${order.deliveryPerson.lastName}</div>
              ${order.deliveryPerson.phone ? `<div>Phone: ${order.deliveryPerson.phone}</div>` : ''}
            </div>
            ` : ''}
            
            ${order.estimatedDeliveryTime ? `
            <div class="order-details">
              <strong>Estimated Delivery Time:</strong> ${formatDate(order.estimatedDeliveryTime)}
            </div>
            ` : ''}
            
            ${order.deliveryNotes ? `
            <div class="order-details">
              <strong>Delivery Notes:</strong> ${order.deliveryNotes}
            </div>
            ` : ''}
          </div>
        `).join('')}
        
        <div class="footer">
          <p>This report shows ${orders.length} orders from page ${currentPage} of ${totalPages}.</p>
          <p>Total orders in system: ${totalOrders}</p>
        </div>
      </body>
      </html>
    `;

    // Create a new window and print the HTML content
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for images to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 1000);
    };


    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    yPosition = addText('Delivery Orders Report', margin, yPosition);
    yPosition += 10;

    // Report generation date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPosition = addText(`Generated on: ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, margin, yPosition);
    yPosition += 15;

    // Summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    yPosition = addText('Summary', margin, yPosition);
    yPosition += 5;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    yPosition = addText(`Total Orders: ${orders.length}`, margin, yPosition);
    
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      yPosition = addText(`${status.replace('_', ' ').toUpperCase()}: ${count}`, margin, yPosition);
    });
    
    yPosition += 10;

    // Orders details
    orders.forEach((order, index) => {
      checkNewPage(50);
      
      // Order header
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      yPosition = addText(`Order #${order.orderNumber}`, margin, yPosition);
      yPosition += 5;

      // Order details
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      yPosition = addText(`Status: ${order.status.replace('_', ' ').toUpperCase()}`, margin, yPosition);
      yPosition = addText(`Total Amount: ${formatCurrency(order.totalAmount)}`, margin, yPosition);
      yPosition = addText(`Assigned Date: ${formatDate(order.assignedAt)}`, margin, yPosition);
      yPosition += 5;

      // Customer information
      doc.setFont('helvetica', 'bold');
      yPosition = addText('Customer Information:', margin, yPosition);
      doc.setFont('helvetica', 'normal');
      yPosition = addText(`Name: ${order.customer?.firstName} ${order.customer?.lastName}`, margin, yPosition);
      yPosition = addText(`Email: ${order.customer?.email}`, margin, yPosition);
      yPosition = addText(`Phone: ${order.customer?.phone}`, margin, yPosition);
      yPosition += 5;

      // Delivery address
      doc.setFont('helvetica', 'bold');
      yPosition = addText('Delivery Address:', margin, yPosition);
      doc.setFont('helvetica', 'normal');
      yPosition = addText(`${order.deliveryAddress?.street}`, margin, yPosition);
      yPosition = addText(`${order.deliveryAddress?.city}, ${order.deliveryAddress?.state} ${order.deliveryAddress?.zipCode}`, margin, yPosition);
      yPosition = addText(`${order.deliveryAddress?.country}`, margin, yPosition);
      yPosition += 5;

      // Order items
      if (order.items && order.items.length > 0) {
        doc.setFont('helvetica', 'bold');
        yPosition = addText('Order Items:', margin, yPosition);
        doc.setFont('helvetica', 'normal');
        
        order.items.forEach((item) => {
          checkNewPage(15);
          yPosition = addText(`• ${item.product?.name}`, margin + 5, yPosition);
          yPosition = addText(`  Variant: ${item.variant?.size} - ${item.variant?.color?.name}`, margin + 5, yPosition);
          yPosition = addText(`  Quantity: ${item.quantity} | Price: ${formatCurrency(item.totalPrice)}`, margin + 5, yPosition);
        });
      }

      // Delivery person notes
      if (order.shipping?.deliveryNotes) {
        yPosition += 5;
        doc.setFont('helvetica', 'bold');
        yPosition = addText('Delivery Notes:', margin, yPosition);
        doc.setFont('helvetica', 'normal');
        yPosition = addText(order.shipping.deliveryNotes, margin, yPosition);
      }

      // Estimated delivery time
      if (order.shipping?.deliveryPersonEstimatedTime) {
        yPosition += 5;
        doc.setFont('helvetica', 'bold');
        yPosition = addText('Estimated Delivery Time:', margin, yPosition);
        doc.setFont('helvetica', 'normal');
        yPosition = addText(formatDate(order.shipping.deliveryPersonEstimatedTime), margin, yPosition);
      }

      yPosition += 15;

      // Add separator line between orders (except for the last one)
      if (index < orders.length - 1) {
        checkNewPage(10);
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, 190, yPosition);
        yPosition += 10;
      }
    });

    toast.success('Delivery orders report opened for printing');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600">Manage your assigned delivery orders</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={generatePDF}
            disabled={orders.length === 0}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Delivered
          </button>
          <button
            onClick={fetchOrders}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No orders assigned</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have any orders assigned to you yet.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Order Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Package className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-semibold text-gray-900">{order.orderNumber}</span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                  {getStatusIcon(order.status)}
                  <span className="ml-1 capitalize">{order.status.replace('_', ' ')}</span>
                </span>
              </div>

              {/* Customer Info */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Customer</h3>
                <p className="text-sm text-gray-600">
                  {order.customer?.firstName} {order.customer?.lastName}
                </p>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <Phone className="h-3 w-3 mr-1" />
                  {order.customer?.phone}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Delivery Address</h3>
                <div className="flex items-start text-xs text-gray-600">
                  <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                  <div>
                    <p>{order.deliveryAddress?.street}</p>
                    <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.zipCode}</p>
                  </div>
                </div>
              </div>

              {/* Order Details */}
              <div className="mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium">{formatCurrency(order.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Assigned:</span>
                  <span className="font-medium">{formatDate(order.assignedAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowDetailsModal(true);
                  }}
                  className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </button>
                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setStatusData({
                      status: order.status,
                      estimatedDeliveryTime: order.shipping?.deliveryPersonEstimatedTime || '',
                      deliveryNotes: order.shipping?.deliveryNotes || ''
                    });
                    setShowStatusModal(true);
                  }}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  Update
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Order Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Order Number:</span>
                      <p className="font-medium">{selectedOrder.orderNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>
                      <p className="font-medium capitalize">{selectedOrder.status.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Amount:</span>
                      <p className="font-medium">{formatCurrency(selectedOrder.totalAmount)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Assigned Date:</span>
                      <p className="font-medium">{formatDate(selectedOrder.assignedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <p className="font-medium">
                          {selectedOrder.customer?.firstName} {selectedOrder.customer?.lastName}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <p className="font-medium">{selectedOrder.customer?.email}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Phone:</span>
                        <p className="font-medium">{selectedOrder.customer?.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Delivery Address</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-sm">
                      <p className="font-medium">{selectedOrder.deliveryAddress?.street}</p>
                      <p className="text-gray-600">
                        {selectedOrder.deliveryAddress?.city}, {selectedOrder.deliveryAddress?.state} {selectedOrder.deliveryAddress?.zipCode}
                      </p>
                      <p className="text-gray-600">{selectedOrder.deliveryAddress?.country}</p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{item.product?.name}</p>
                          <p className="text-xs text-gray-600">
                            {item.variant?.size} - {item.variant?.color?.name}
                          </p>
                          <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-sm">{formatCurrency(item.totalPrice)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Customer */}
                <div className="flex space-x-3">
                  <a
                    href={`tel:${selectedOrder.customer?.phone}`}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Customer
                  </a>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      setStatusData({
                        status: selectedOrder.status,
                        estimatedDeliveryTime: selectedOrder.shipping?.deliveryPersonEstimatedTime || '',
                        deliveryNotes: selectedOrder.shipping?.deliveryNotes || ''
                      });
                      setShowStatusModal(true);
                    }}
                    className="flex-1 flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Update Order Status</h2>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusData.status}
                    onChange={(e) => setStatusData({ ...statusData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {/* Delivery persons can only update from assigned → out_for_delivery → delivered */}
                    {statusData.status === 'assigned' && (
                      <>
                        <option value="assigned">Assigned</option>
                        <option value="out_for_delivery">Out for Delivery</option>
                      </>
                    )}
                    {statusData.status === 'out_for_delivery' && (
                      <>
                        <option value="out_for_delivery">Out for Delivery</option>
                        <option value="delivered">Delivered</option>
                      </>
                    )}
                    {statusData.status === 'delivered' && (
                      <option value="delivered">Delivered</option>
                    )}
                    {statusData.status === 'completed' && (
                      <option value="completed">Completed</option>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Delivery Time
                  </label>
                  <input
                    type="datetime-local"
                    value={statusData.estimatedDeliveryTime ? new Date(statusData.estimatedDeliveryTime).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setStatusData({ ...statusData, estimatedDeliveryTime: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Notes
                  </label>
                  <textarea
                    value={statusData.deliveryNotes}
                    onChange={(e) => setStatusData({ ...statusData, deliveryNotes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any delivery notes or updates..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStatusUpdate}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Delivered Orders Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Delete Delivered Orders</h2>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-red-800">Warning</h3>
                      <p className="text-sm text-red-700 mt-1">
                        This action will permanently delete delivered orders. This cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Filter className="h-4 w-4 inline mr-1" />
                    Filter Options (Optional)
                  </label>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Date From
                      </label>
                      <input
                        type="date"
                        value={deleteFilters.dateFrom}
                        onChange={(e) => setDeleteFilters({ ...deleteFilters, dateFrom: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Date To
                      </label>
                      <input
                        type="date"
                        value={deleteFilters.dateTo}
                        onChange={(e) => setDeleteFilters({ ...deleteFilters, dateTo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Older Than (Days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={deleteFilters.olderThanDays}
                        onChange={(e) => setDeleteFilters({ ...deleteFilters, olderThanDays: e.target.value })}
                        placeholder="e.g., 30"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="confirmDelete"
                    checked={deleteFilters.confirmDelete}
                    onChange={(e) => setDeleteFilters({ ...deleteFilters, confirmDelete: e.target.checked })}
                    className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="confirmDelete" className="ml-2 text-sm text-gray-700">
                    I understand this action cannot be undone and I want to proceed with deleting delivered orders.
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteDeliveredOrders}
                    disabled={!deleteFilters.confirmDelete || deleteLoading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete Orders'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryOrders;
