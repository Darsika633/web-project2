import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Edit3,
  AlertTriangle,
  Clock,
  DollarSign,
  MapPin,
  User,
  Phone,
  Calendar,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { paymentsAPI } from "../../services/api";
import PaymentViewModal from "./PaymentViewModal";
import PaymentCollectionModal from "./PaymentCollectionModal";
import PaymentStatistics from "./PaymentStatistics";
import PaymentReports from "./PaymentReports";

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [activeTab, setActiveTab] = useState("management");

  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: "",
    collectionStatus: "",
    deliveryPersonId: "",
    isOutstanding: "",
    startDate: "",
    endDate: "",
    search: "",
  });

  const [showFilters, setShowFilters] = useState(false);

  // Fetch payments
  const fetchPayments = async () => {
    try {
      setLoading(true);

      // Filter out empty parameters
      const cleanFilters = Object.entries(filters).reduce(
        (acc, [key, value]) => {
          if (value !== "" && value !== null && value !== undefined) {
            acc[key] = value;
          }
          return acc;
        },
        {}
      );

      const response = await paymentsAPI.getAll(cleanFilters);

      if (response.data && response.data.data) {
        const paymentsData = response.data.data.payments || [];

        // Transform the data to match our expected structure
        const transformedPayments = paymentsData.map((payment) => ({
          ...payment,
          order: payment.orderDetails?.[0] || {
            orderNumber: payment.orderNumber,
            totalAmount: payment.expectedAmount,
            deliveryAddress: payment.orderDetails?.[0]?.deliveryAddress || {},
            items: payment.orderDetails?.[0]?.items || [],
          },
          customer: payment.customerDetails?.[0] || {
            firstName: payment.customerName?.split(" ")[0] || "N/A",
            lastName: payment.customerName?.split(" ")[1] || "N/A",
            email: "N/A",
            phone: "N/A",
          },
          deliveryPerson: payment.deliveryPersonDetails?.[0] || {
            firstName: payment.deliveryPersonName?.split(" ")[0] || "N/A",
            lastName: payment.deliveryPersonName?.split(" ")[1] || "N/A",
          },
        }));

        setPayments(transformedPayments);
        setPagination(response.data.data.pagination || {});
        setError(null);
      } else {
        setError("Invalid response structure from server");
        setPayments([]);
        setPagination({});
      }
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Failed to fetch payments"
      );
      setPayments([]);
      setPagination({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch on initial mount
    fetchPayments();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();

    // Validate date range
    if (
      filters.startDate &&
      filters.endDate &&
      new Date(filters.startDate) > new Date(filters.endDate)
    ) {
      return; // Don't submit if dates are invalid
    }

    fetchPayments();
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleViewPayment = (payment) => {
    setSelectedPayment(payment);
    setShowViewModal(true);
  };

  const handleMarkAsReceived = (payment) => {
    setSelectedPayment(payment);
    setShowCollectionModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      paid_on_delivery: {
        color: "bg-blue-100 text-blue-800",
        icon: CheckCircle,
      },
      completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      failed: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
      partial: { color: "bg-orange-100 text-orange-800", icon: AlertTriangle },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {status.replace("_", " ")}
      </span>
    );
  };

  const getCollectionStatusBadge = (status) => {
    const statusConfig = {
      not_collected: { color: "bg-gray-100 text-gray-800", icon: Clock },
      collected: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      partial_collected: {
        color: "bg-orange-100 text-orange-800",
        icon: AlertTriangle,
      },
      failed_collection: {
        color: "bg-red-100 text-red-800",
        icon: AlertTriangle,
      },
    };

    const config = statusConfig[status] || statusConfig.not_collected;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {status.replace("_", " ")}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount)) {
      return "LKR 0.00";
    }
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(numAmount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Payment Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage COD payments and collections
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("management")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "management"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Payment Management
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "reports"
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Reports
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === "management" && (
        <>
          {/* Statistics */}
          <PaymentStatistics />

          {/* Filters */}
          {showFilters && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <form
                onSubmit={handleSearch}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    placeholder="Order number, customer name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <input
                    type="text"
                    value={filters.status}
                    onChange={(e) =>
                      handleFilterChange("status", e.target.value)
                    }
                    placeholder="e.g., pending, completed..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter: pending, paid_on_delivery, completed, failed, or
                    partial
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Collection Status
                  </label>
                  <select
                    value={filters.collectionStatus}
                    onChange={(e) =>
                      handleFilterChange("collectionStatus", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All Collection Statuses</option>
                    <option value="not_collected">Not Collected</option>
                    <option value="collected">Collected</option>
                    <option value="partial_collected">Partial Collected</option>
                    <option value="failed_collection">Failed Collection</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Outstanding
                  </label>
                  <select
                    value={filters.isOutstanding}
                    onChange={(e) =>
                      handleFilterChange("isOutstanding", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">All</option>
                    <option value="true">Outstanding Only</option>
                    <option value="false">Not Outstanding</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    max={filters.endDate || undefined}
                    onChange={(e) => {
                      const startDate = e.target.value;
                      handleFilterChange("startDate", startDate);

                      // If end date is before start date, clear it
                      if (
                        filters.endDate &&
                        startDate &&
                        new Date(startDate) > new Date(filters.endDate)
                      ) {
                        handleFilterChange("endDate", "");
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      filters.startDate &&
                      filters.endDate &&
                      new Date(filters.startDate) > new Date(filters.endDate)
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  {filters.startDate &&
                    filters.endDate &&
                    new Date(filters.startDate) > new Date(filters.endDate) && (
                      <p className="text-xs text-red-600 mt-1">
                        Start date cannot be after end date
                      </p>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    min={filters.startDate || undefined}
                    onChange={(e) => {
                      const endDate = e.target.value;
                      handleFilterChange("endDate", endDate);

                      // If start date is after end date, clear it
                      if (
                        filters.startDate &&
                        endDate &&
                        new Date(filters.startDate) > new Date(endDate)
                      ) {
                        handleFilterChange("startDate", "");
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      filters.startDate &&
                      filters.endDate &&
                      new Date(filters.startDate) > new Date(filters.endDate)
                        ? "border-red-300 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                  {filters.startDate &&
                    filters.endDate &&
                    new Date(filters.startDate) > new Date(filters.endDate) && (
                      <p className="text-xs text-red-600 mt-1">
                        End date cannot be before start date
                      </p>
                    )}
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={
                      filters.startDate &&
                      filters.endDate &&
                      new Date(filters.startDate) > new Date(filters.endDate)
                    }
                    className={`w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                      filters.startDate &&
                      filters.endDate &&
                      new Date(filters.startDate) > new Date(filters.endDate)
                        ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                        : "bg-primary-600 text-white hover:bg-primary-700"
                    }`}
                  >
                    <Search className="w-4 h-4 mr-2 inline" />
                    Search
                  </button>
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() =>
                      setFilters({
                        page: 1,
                        limit: 20,
                        status: "",
                        collectionStatus: "",
                        deliveryPersonId: "",
                        isOutstanding: "",
                        startDate: "",
                        endDate: "",
                        search: "",
                      })
                    }
                    className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Clear Filters
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Payments Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-3 text-gray-600">Loading payments...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600">{error}</p>
                  <button
                    onClick={fetchPayments}
                    className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : payments.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No payments found</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Try adjusting your filters or check if payments exist in the
                    system.
                  </p>
                  <button
                    onClick={fetchPayments}
                    className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order & Customer
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Delivery Person
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Collection Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payments.map((payment) => (
                        <tr key={payment._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {payment.order.orderNumber}
                              </div>
                              <div className="text-sm text-gray-500">
                                {payment.customer.firstName}{" "}
                                {payment.customer.lastName}
                              </div>
                              <div className="text-xs text-gray-400">
                                <Phone className="w-3 h-3 inline mr-1" />
                                {payment.customer.phone}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {payment.deliveryPerson
                                ? `${payment.deliveryPerson.firstName} ${payment.deliveryPerson.lastName}`
                                : "Not Assigned"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(payment.expectedAmount)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Collected:{" "}
                              {formatCurrency(payment.collectedAmount)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Balance: {formatCurrency(payment.balanceAmount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(payment.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getCollectionStatusBadge(payment.collectionStatus)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {formatDate(payment.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleViewPayment(payment)}
                                className="text-primary-600 hover:text-primary-900 p-1"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {payment.status !== "completed" && (
                                <button
                                  onClick={() => handleMarkAsReceived(payment)}
                                  className="text-green-600 hover:text-green-900 p-1"
                                  title="Mark as Received"
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() =>
                          handlePageChange(pagination.currentPage - 1)
                        }
                        disabled={!pagination.hasPrev}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          handlePageChange(pagination.currentPage + 1)
                        }
                        disabled={!pagination.hasNext}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{" "}
                          <span className="font-medium">
                            {(pagination.currentPage - 1) * pagination.limit +
                              1}
                          </span>{" "}
                          to{" "}
                          <span className="font-medium">
                            {Math.min(
                              pagination.currentPage * pagination.limit,
                              pagination.totalPayments
                            )}
                          </span>{" "}
                          of{" "}
                          <span className="font-medium">
                            {pagination.totalPayments}
                          </span>{" "}
                          results
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <button
                            onClick={() =>
                              handlePageChange(pagination.currentPage - 1)
                            }
                            disabled={!pagination.hasPrev}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>

                          {Array.from(
                            { length: Math.min(5, pagination.totalPages) },
                            (_, i) => {
                              const page = i + 1;
                              return (
                                <button
                                  key={page}
                                  onClick={() => handlePageChange(page)}
                                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                    page === pagination.currentPage
                                      ? "z-10 bg-primary-50 border-primary-500 text-primary-600"
                                      : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                  }`}
                                >
                                  {page}
                                </button>
                              );
                            }
                          )}

                          <button
                            onClick={() =>
                              handlePageChange(pagination.currentPage + 1)
                            }
                            disabled={!pagination.hasNext}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && <PaymentReports />}

      {/* Modals */}
      {showViewModal && selectedPayment && (
        <PaymentViewModal
          payment={selectedPayment}
          onClose={() => {
            setShowViewModal(false);
            setSelectedPayment(null);
          }}
          onUpdate={fetchPayments}
        />
      )}

      {showCollectionModal && selectedPayment && (
        <PaymentCollectionModal
          payment={selectedPayment}
          onClose={() => {
            setShowCollectionModal(false);
            setSelectedPayment(null);
          }}
          onSuccess={fetchPayments}
        />
      )}
    </div>
  );
};

export default PaymentManagement;
