import React, { useState, useEffect } from 'react';
import { Truck, User, Clock, CheckCircle } from 'lucide-react';
import { deliveryAPI } from '../../services/api';
import toast from 'react-hot-toast';

const OrderDeliveryModal = ({ order, isOpen, onClose, onSuccess }) => {
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDeliveryPersons();
    }
  }, [isOpen]);

  const fetchDeliveryPersons = async () => {
    try {
      setLoading(true);
      const response = await deliveryAPI.getDeliveryPersons({ isActive: true });
      setDeliveryPersons(response.data.data || []);
    } catch (error) {
      console.error('Error fetching delivery persons:', error);
      toast.error('Failed to fetch delivery persons');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignOrder = async () => {
    if (!selectedDeliveryPerson) {
      toast.error('Please select a delivery person');
      return;
    }

    // Only confirmed orders can be assigned to delivery persons
    if (order.status !== 'confirmed') {
      toast.error('Only confirmed orders can be assigned to delivery persons');
      return;
    }

    try {
      setIsAssigning(true);
      await deliveryAPI.assignOrder(order._id, selectedDeliveryPerson);
      toast.success('Order assigned successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error assigning order:', error);
      toast.error('Failed to assign order');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleReassignOrder = async () => {
    if (!selectedDeliveryPerson) {
      toast.error('Please select a delivery person');
      return;
    }

    try {
      setIsAssigning(true);
      await deliveryAPI.reassignOrder(order._id, selectedDeliveryPerson);
      toast.success('Order reassigned successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error reassigning order:', error);
      toast.error('Failed to reassign order');
    } finally {
      setIsAssigning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Truck className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">
                {order.deliveryPerson ? 'Reassign Order' : 'Assign Order'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Order Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Order Information</h3>
            {order.status !== 'confirmed' && !order.deliveryPerson && (
              <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Only confirmed orders can be assigned to delivery persons. 
                  Current status: {order.status}
                </p>
              </div>
            )}
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Order:</strong> {order.orderNumber}</p>
              <p><strong>Customer:</strong> {order.user?.firstName} {order.user?.lastName}</p>
              <p><strong>Total:</strong> ${order.totalAmount?.toFixed(2)}</p>
              <p><strong>Status:</strong> 
                <span className={`ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  order.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                  order.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'out_for_delivery' ? 'bg-yellow-100 text-yellow-800' :
                  order.status === 'delivered' ? 'bg-purple-100 text-purple-800' :
                  order.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                  order.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status?.replace('_', ' ')}
                </span>
              </p>
              {order.deliveryPerson && (
                <p><strong>Current Delivery Person:</strong> {order.deliveryPerson.firstName} {order.deliveryPerson.lastName}</p>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Delivery Address</h3>
            <div className="text-sm text-gray-600">
              <p>{order.deliveryAddress?.street}</p>
              <p>{order.deliveryAddress?.city}, {order.deliveryAddress?.state} {order.deliveryAddress?.zipCode}</p>
              <p>{order.deliveryAddress?.country}</p>
            </div>
          </div>

          {/* Delivery Person Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Delivery Person
            </label>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md">
                {deliveryPersons.map((person) => (
                  <button
                    key={person._id}
                    onClick={() => setSelectedDeliveryPerson(person._id)}
                    className={`w-full text-left p-3 hover:bg-gray-50 border-l-4 ${
                      selectedDeliveryPerson === person._id 
                        ? 'bg-blue-50 border-blue-500' 
                        : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-sm font-medium text-blue-600">
                          {person.firstName?.charAt(0)}{person.lastName?.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {person.firstName} {person.lastName}
                        </p>
                        <p className="text-xs text-gray-600">{person.email}</p>
                        {person.stats && (
                          <div className="flex items-center mt-1 space-x-3 text-xs text-gray-500">
                            <span className="flex items-center">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {person.stats.totalCompleted} completed
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {person.stats.averageDeliveryTime ? Math.floor(person.stats.averageDeliveryTime / 60000) + 'm avg' : 'N/A'}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          person.stats?.deliveryRate >= 80 ? 'bg-green-100 text-green-800' :
                          person.stats?.deliveryRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {person.stats?.deliveryRate || 0}% success
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={order.deliveryPerson ? handleReassignOrder : handleAssignOrder}
              disabled={!selectedDeliveryPerson || isAssigning || (order.status !== 'confirmed' && !order.deliveryPerson)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
            >
              {isAssigning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {order.deliveryPerson ? 'Reassigning...' : 'Assigning...'}
                </>
              ) : (
                <>
                  <Truck className="h-4 w-4 mr-2" />
                  {order.deliveryPerson ? 'Reassign Order' : 'Assign Order'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDeliveryModal;
