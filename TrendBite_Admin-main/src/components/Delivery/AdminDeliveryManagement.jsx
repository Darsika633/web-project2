import React, { useState, useEffect } from "react";
import {
  Truck,
  Users,
  Package,
  BarChart3,
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  UserPlus,
  Star,
  TrendingUp,
} from "lucide-react";
import { deliveryAPI, usersAPI, ordersAPI } from "../../services/api";
import { mockApi } from "../../services/mockApi";
import toast from "react-hot-toast";

const AdminDeliveryManagement = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [deliveryPersons, setDeliveryPersons] = useState([]);
  const [stats, setStats] = useState({});
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [orderSearchTerm, setOrderSearchTerm] = useState("");
  const [deliveryPersonFilter, setDeliveryPersonFilter] = useState("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOrderViewModal, setShowOrderViewModal] = useState(false);
  const [showOrderAssignmentModal, setShowOrderAssignmentModal] =
    useState(false);
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Ratings state
  const [deliveryPersonsWithRatings, setDeliveryPersonsWithRatings] = useState(
    []
  );
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [ratingsSortBy, setRatingsSortBy] = useState("averageRating");
  const [ratingsSortOrder, setRatingsSortOrder] = useState("desc");
  const [showRatingsModal, setShowRatingsModal] = useState(false);
  const [selectedPersonRatings, setSelectedPersonRatings] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === "orders") {
      fetchOrders();
    } else if (activeTab === "ratings") {
      fetchDeliveryPersonsWithRatings();
    }
  }, [activeTab, ratingsSortBy, ratingsSortOrder]);

  const fetchData = async () => {
    try {
      setLoading(true);
      let deliveryPersonsRes, statsRes;

      try {
        [deliveryPersonsRes, statsRes] = await Promise.all([
          deliveryAPI.getDeliveryPersons(),
          deliveryAPI.getDeliveryStats(),
        ]);
      } catch (apiError) {
        console.log("API failed, using mock data:", apiError);
        [deliveryPersonsRes, statsRes] = await Promise.all([
          mockApi.getDeliveryPersons(),
          mockApi.getDeliveryStats(),
        ]);
      }

      setDeliveryPersons(deliveryPersonsRes.data.data || []);
      setStats(statsRes.data.data || {});
    } catch (error) {
      console.error("Error fetching delivery data:", error);

      // Set fallback data to prevent empty state
      setDeliveryPersons([]);
      setStats({
        overall: {
          totalAssigned: 0,
          totalDelivered: 0,
          totalCompleted: 0,
        },
        deliveryPersons: [],
      });

      toast.error("Failed to fetch delivery data. Using fallback data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const response = await ordersAPI.getAll({
        limit: 100,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      const ordersData = response.data.data || response.data;
      console.log("Orders data structure:", ordersData?.slice(0, 1)); // Log first order to see structure
      setOrders(ordersData || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
      toast.error("Failed to fetch orders data");
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleCreateDeliveryPerson = async (userData) => {
    try {
      // Update user role to deliveryperson
      await usersAPI.updateRole(userData.id, "deliveryperson");
      toast.success("Delivery person created successfully");
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error("Error creating delivery person:", error);
      toast.error("Failed to create delivery person");
    }
  };

  const handleViewDeliveryPerson = (person) => {
    setSelectedDeliveryPerson(person);
    setShowViewModal(true);
  };

  const handleEditDeliveryPerson = (person) => {
    setSelectedDeliveryPerson(person);
    setShowEditModal(true);
  };

  const handleUpdateDeliveryPerson = async (updatedData) => {
    try {
      console.log(
        "Updating delivery person:",
        selectedDeliveryPerson._id,
        updatedData
      );

      // Since there's no general PUT /users/{id} endpoint, we'll use a different approach
      // We'll make individual API calls for the fields that can be updated
      const updatePromises = [];

      // Update role if needed (this endpoint exists)
      if (
        updatedData.role &&
        updatedData.role !== selectedDeliveryPerson.role
      ) {
        updatePromises.push(
          usersAPI.updateRole(selectedDeliveryPerson._id, updatedData.role)
        );
      }

      // Update active status if needed (this endpoint exists)
      if (
        updatedData.isActive !== undefined &&
        updatedData.isActive !== selectedDeliveryPerson.isActive
      ) {
        if (updatedData.isActive) {
          updatePromises.push(usersAPI.activate(selectedDeliveryPerson._id));
        } else {
          updatePromises.push(usersAPI.deactivate(selectedDeliveryPerson._id));
        }
      }

      // For other fields (firstName, lastName, email, phone), we need to use a different approach
      // Since the API doesn't have a general update endpoint, we'll show a message
      if (
        updatedData.firstName ||
        updatedData.lastName ||
        updatedData.email ||
        updatedData.phone
      ) {
        toast.error(
          "Profile information updates are not supported through this interface. Please contact the system administrator."
        );
        return;
      }

      // Execute the available updates
      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
        toast.success("Delivery person updated successfully");
        setShowEditModal(false);
        setSelectedDeliveryPerson(null);
        fetchData();
      } else {
        toast.info("No changes to update");
      }
    } catch (error) {
      console.error("Error updating delivery person:", error);
      console.error("Error details:", error.response?.data);

      if (error.response?.status === 404) {
        toast.error("Delivery person not found. Please refresh and try again.");
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || "Invalid data provided");
      } else {
        toast.error("Failed to update delivery person. Please try again.");
      }
    }
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderViewModal(true);
  };

  const handleAssignDeliveryPerson = (order) => {
    setSelectedOrder(order);
    setShowOrderAssignmentModal(true);
  };

  const handleOrderAssignment = async (deliveryPersonId) => {
    try {
      if (selectedOrder.deliveryPerson) {
        // Reassign order
        await deliveryAPI.reassignOrder(selectedOrder._id, deliveryPersonId);
        toast.success("Order reassigned successfully");
      } else {
        // Assign order
        await deliveryAPI.assignOrder(selectedOrder._id, deliveryPersonId);
        toast.success("Order assigned successfully");
      }
      setShowOrderAssignmentModal(false);
      setSelectedOrder(null);
      fetchOrders(); // Refresh orders data
    } catch (error) {
      console.error("Error assigning order:", error);
      toast.error("Failed to assign order");
    }
  };

  const fetchDeliveryPersonsWithRatings = async () => {
    try {
      setRatingsLoading(true);
      const response = await deliveryAPI.getDeliveryPersonsWithRatings({
        sortBy: ratingsSortBy,
        sortOrder: ratingsSortOrder,
      });
      setDeliveryPersonsWithRatings(response.data.data.deliveryPersons || []);
    } catch (error) {
      console.error("Error fetching delivery persons with ratings:", error);
      toast.error("Failed to fetch ratings data");
      setDeliveryPersonsWithRatings([]);
    } finally {
      setRatingsLoading(false);
    }
  };

  const handleViewRatings = async (deliveryPerson) => {
    try {
      setRatingsLoading(true);
      const response = await deliveryAPI.getDeliveryPersonRatings(
        deliveryPerson.id,
        {
          page: 1,
          limit: 50,
        }
      );
      setSelectedPersonRatings(response.data.data);
      setShowRatingsModal(true);
    } catch (error) {
      console.error("Error fetching delivery person ratings:", error);
      toast.error("Failed to fetch detailed ratings");
    } finally {
      setRatingsLoading(false);
    }
  };

  const filteredDeliveryPersons = deliveryPersons.filter(
    (person) =>
      person.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter((order) => {
    const customer = order.user || order.customer;
    const matchesSearch =
      orderSearchTerm === "" ||
      order.orderNumber
        ?.toLowerCase()
        .includes(orderSearchTerm.toLowerCase()) ||
      customer?.firstName
        ?.toLowerCase()
        .includes(orderSearchTerm.toLowerCase()) ||
      customer?.lastName
        ?.toLowerCase()
        .includes(orderSearchTerm.toLowerCase()) ||
      customer?.email?.toLowerCase().includes(orderSearchTerm.toLowerCase());

    const matchesDeliveryPerson =
      deliveryPersonFilter === "all" ||
      (deliveryPersonFilter === "unassigned" && !order.deliveryPerson) ||
      (order.deliveryPerson &&
        order.deliveryPerson._id === deliveryPersonFilter);

    const matchesStatus =
      orderStatusFilter === "all" || order.status === orderStatusFilter;

    return matchesSearch && matchesDeliveryPerson && matchesStatus;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-orange-100 text-orange-800", label: "Pending" },
      confirmed: { color: "bg-purple-100 text-purple-800", label: "Confirmed" },
      assigned: { color: "bg-blue-100 text-blue-800", label: "Assigned" },
      out_for_delivery: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Out for Delivery",
      },
      delivered: { color: "bg-green-100 text-green-800", label: "Delivered" },
      completed: { color: "bg-gray-100 text-gray-800", label: "Completed" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: BarChart3 },
    { id: "delivery-persons", name: "Delivery Persons", icon: Users },
    { id: "orders", name: "Orders", icon: Package },
    { id: "ratings", name: "Ratings & Reviews", icon: Star },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">
          Loading delivery management...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Delivery Management
          </h1>
          <p className="text-gray-600">
            Manage delivery persons and track delivery performance
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Delivery Person
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Assigned
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.overall?.totalAssigned || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <Package className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Delivered
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.overall?.totalDelivered || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Active Delivery Persons
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {deliveryPersons.filter((p) => p.isActive).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-3 bg-yellow-100 rounded-full">
                  <BarChart3 className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Success Rate
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.overall?.totalAssigned > 0
                      ? Math.round(
                          (stats.overall.totalCompleted /
                            stats.overall.totalAssigned) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Person Performance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Delivery Person Performance
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Delivered
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Success Rate
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.deliveryPersons?.slice(0, 5).map((person) => (
                    <tr key={person._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                            {(() => {
                              const deliveryPerson = deliveryPersons.find(
                                (dp) =>
                                  `${dp.firstName} ${dp.lastName}` ===
                                  person.deliveryPersonName
                              );
                              return deliveryPerson?.avatar?.url ? (
                                <img
                                  src={deliveryPerson.avatar.url}
                                  alt={person.deliveryPersonName}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-sm font-medium text-blue-600">
                                  {person.deliveryPersonName?.charAt(0)}
                                </span>
                              );
                            })()}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {person.deliveryPersonName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {person.totalAssigned}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {person.totalDelivered}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {person.deliveryRate}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {person.averageDeliveryTime
                          ? Math.floor(person.averageDeliveryTime / 60000)
                          : 0}
                        m
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            person.deliveryRate >= 80
                              ? "bg-green-100 text-green-800"
                              : person.deliveryRate >= 60
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {person.deliveryRate >= 80
                            ? "Excellent"
                            : person.deliveryRate >= 60
                            ? "Good"
                            : "Needs Improvement"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "delivery-persons" && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search delivery persons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </button>
            </div>
          </div>

          {/* Delivery Persons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDeliveryPersons.map((person) => (
              <div
                key={person._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                      {person.avatar?.url ? (
                        <img
                          src={person.avatar.url}
                          alt={`${person.firstName} ${person.lastName}`}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-medium text-blue-600">
                          {person.firstName?.charAt(0)}
                          {person.lastName?.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {person.firstName} {person.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{person.email}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <button className="p-1 rounded-full hover:bg-gray-100">
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{person.phone}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        person.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {person.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {person.stats && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Performance
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Assigned:</span>
                        <span className="font-medium ml-1">
                          {person.stats.totalAssigned}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Delivered:</span>
                        <span className="font-medium ml-1">
                          {person.stats.totalDelivered}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewDeliveryPerson(person)}
                    className="flex-1 flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </button>
                  <button
                    onClick={() => handleEditDeliveryPerson(person)}
                    className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredDeliveryPersons.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No delivery persons found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm
                  ? "Try adjusting your search terms."
                  : "Get started by adding a delivery person."}
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === "orders" && (
        <div className="space-y-6">
          {/* Orders Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Order Assignments
              </h2>
              <p className="text-gray-600">
                View and manage order assignments to delivery persons
              </p>
            </div>
            <button
              onClick={fetchOrders}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Package className="h-4 w-4 mr-2" />
              Refresh Orders
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Orders
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Order number, customer..."
                    value={orderSearchTerm}
                    onChange={(e) => setOrderSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Delivery Person Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Person
                </label>
                <select
                  value={deliveryPersonFilter}
                  onChange={(e) => setDeliveryPersonFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Orders</option>
                  <option value="unassigned">Unassigned</option>
                  {deliveryPersons.map((person) => (
                    <option key={person._id} value={person._id}>
                      {person.firstName} {person.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Status
                </label>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="assigned">Assigned</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Results Count */}
              <div className="flex items-end">
                <div className="text-sm text-gray-600">
                  Showing {filteredOrders.length} of {orders.length} orders
                </div>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {ordersLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading orders...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Delivery Person
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No orders found
                          </h3>
                          <p className="text-gray-500">
                            No orders match your current filters.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {order.orderNumber}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {order._id.slice(-8)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-600">
                                    {(() => {
                                      const customer =
                                        order.user || order.customer;
                                      return (
                                        customer?.firstName?.charAt(0) || "?"
                                      );
                                    })()}
                                    {(() => {
                                      const customer =
                                        order.user || order.customer;
                                      return (
                                        customer?.lastName?.charAt(0) || ""
                                      );
                                    })()}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">
                                  {(() => {
                                    const customer =
                                      order.user || order.customer;
                                    return customer
                                      ? `${customer.firstName || ""} ${
                                          customer.lastName || ""
                                        }`.trim()
                                      : "Unknown Customer";
                                  })()}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {(order.user || order.customer)?.email ||
                                    "No email provided"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatPrice(order.totalAmount)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(order.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {order.deliveryPerson ? (
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8">
                                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-green-600">
                                      {order.deliveryPerson.firstName?.charAt(
                                        0
                                      )}
                                      {order.deliveryPerson.lastName?.charAt(0)}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">
                                    {order.deliveryPerson.firstName}{" "}
                                    {order.deliveryPerson.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {order.deliveryPerson.email}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8">
                                  <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-gray-600">
                                      ?
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-500">
                                    Unassigned
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    No delivery person
                                  </div>
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(order.createdAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleViewOrder(order)}
                                className="text-blue-600 hover:text-blue-900"
                                title="View order details"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              {!order.deliveryPerson &&
                                order.status === "confirmed" && (
                                  <button
                                    onClick={() =>
                                      handleAssignDeliveryPerson(order)
                                    }
                                    className="text-green-600 hover:text-green-900"
                                    title="Assign delivery person"
                                  >
                                    <UserPlus className="h-4 w-4" />
                                  </button>
                                )}
                              {order.deliveryPerson && (
                                <button
                                  onClick={() =>
                                    handleAssignDeliveryPerson(order)
                                  }
                                  className="text-purple-600 hover:text-purple-900"
                                  title="Reassign delivery person"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Ratings Tab */}
      {activeTab === "ratings" && (
        <div className="space-y-6">
          {/* Ratings Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Delivery Person Ratings
              </h2>
              <p className="text-gray-600">
                View ratings and reviews for delivery persons
              </p>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={ratingsSortBy}
                onChange={(e) => setRatingsSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="averageRating">Sort by Rating</option>
                <option value="totalRatings">Sort by Total Reviews</option>
                <option value="totalDeliveries">Sort by Deliveries</option>
              </select>
              <select
                value={ratingsSortOrder}
                onChange={(e) => setRatingsSortOrder(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>

          {/* Ratings Content */}
          {ratingsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading ratings...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deliveryPersonsWithRatings.map((person) => (
                <div
                  key={person.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  {/* Person Header */}
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
                      {person.avatar?.url ? (
                        <img
                          src={person.avatar.url}
                          alt={person.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-medium text-blue-600">
                          {person.name
                            ?.split(" ")
                            .map((n) => n.charAt(0))
                            .join("")}
                        </span>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {person.name}
                      </h3>
                      <p className="text-sm text-gray-600">{person.email}</p>
                      <p className="text-xs text-gray-500">{person.phone}</p>
                    </div>
                  </div>

                  {/* Rating Summary */}
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                        <span className="ml-2 text-3xl font-bold text-gray-900">
                          {person.stats.averageRating
                            ? person.stats.averageRating.toFixed(1)
                            : "0.0"}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {person.stats.totalRatings}{" "}
                          {person.stats.totalRatings === 1
                            ? "Review"
                            : "Reviews"}
                        </div>
                        <div className="text-xs text-gray-600">
                          {person.stats.totalDeliveries}{" "}
                          {person.stats.totalDeliveries === 1
                            ? "Delivery"
                            : "Deliveries"}
                        </div>
                      </div>
                    </div>

                    {/* Star Rating Display */}
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(person.stats.averageRating)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Performance Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {person.stats.totalOrders}
                      </div>
                      <div className="text-xs text-gray-600">Total Orders</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {person.stats.deliveryRate}%
                      </div>
                      <div className="text-xs text-gray-600">Delivery Rate</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {person.stats.deliveredOrders}
                      </div>
                      <div className="text-xs text-gray-600">Delivered</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {person.stats.pendingOrders}
                      </div>
                      <div className="text-xs text-gray-600">Pending</div>
                    </div>
                  </div>

                  {/* View Ratings Button */}
                  <button
                    onClick={() => handleViewRatings(person)}
                    disabled={person.stats.totalRatings === 0}
                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    {person.stats.totalRatings === 0
                      ? "No Reviews Yet"
                      : "View All Reviews"}
                  </button>
                </div>
              ))}
            </div>
          )}

          {deliveryPersonsWithRatings.length === 0 && !ratingsLoading && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <Star className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No ratings data
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                No delivery persons have been rated yet.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add Delivery Person Modal */}
      {showAddModal && (
        <AddDeliveryPersonModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreateDeliveryPerson}
        />
      )}

      {/* View Delivery Person Modal */}
      {showViewModal && (
        <ViewDeliveryPersonModal
          deliveryPerson={selectedDeliveryPerson}
          onClose={() => {
            setShowViewModal(false);
            setSelectedDeliveryPerson(null);
          }}
        />
      )}

      {/* Edit Delivery Person Modal */}
      {showEditModal && (
        <EditDeliveryPersonModal
          deliveryPerson={selectedDeliveryPerson}
          onClose={() => {
            setShowEditModal(false);
            setSelectedDeliveryPerson(null);
          }}
          onSubmit={handleUpdateDeliveryPerson}
        />
      )}

      {/* Order View Modal */}
      {showOrderViewModal && (
        <OrderViewModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderViewModal(false);
            setSelectedOrder(null);
          }}
        />
      )}

      {/* Order Assignment Modal */}
      {showOrderAssignmentModal && (
        <OrderAssignmentModal
          order={selectedOrder}
          deliveryPersons={deliveryPersons}
          onClose={() => {
            setShowOrderAssignmentModal(false);
            setSelectedOrder(null);
          }}
          onSubmit={handleOrderAssignment}
        />
      )}

      {/* Ratings Detail Modal */}
      {showRatingsModal && selectedPersonRatings && (
        <RatingsDetailModal
          ratingsData={selectedPersonRatings}
          onClose={() => {
            setShowRatingsModal(false);
            setSelectedPersonRatings(null);
          }}
        />
      )}
    </div>
  );
};

// Add Delivery Person Modal Component
const AddDeliveryPersonModal = ({ onClose, onSubmit }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    try {
      setLoading(true);
      const response = await usersAPI.getAll({
        search: searchTerm,
        role: "customer",
      });
      setUsers(response.data.data.users || []);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
    } finally {
      setLoading(false);
    }
  };

  // Phone number validation function
  const validatePhoneNumber = (phone) => {
    if (!phone) return true; // Phone is optional

    // Remove any spaces or special characters except + and numbers
    const cleanPhone = phone.replace(/[^\d+]/g, "");

    // Check if it starts with +94
    if (!cleanPhone.startsWith("+94")) {
      return false;
    }

    // Check if it has the correct length (should be +94 followed by 9 digits)
    if (cleanPhone.length !== 12) {
      return false;
    }

    return true;
  };

  // Format phone number with +94 prefix
  const formatPhoneNumber = (phone) => {
    if (!phone) return "";

    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, "");

    // If it starts with 94, add + prefix
    if (digits.startsWith("94")) {
      return "+" + digits;
    }

    // If it starts with 0, replace with +94
    if (digits.startsWith("0")) {
      return "+94" + digits.substring(1);
    }

    // If it doesn't start with 94, add +94 prefix
    if (!digits.startsWith("94")) {
      return "+94" + digits;
    }

    return phone;
  };

  const handleSubmit = () => {
    if (!selectedUser) return;

    // Validate phone number if provided
    if (phone && !validatePhoneNumber(phone)) {
      setPhoneError(
        "Phone number must start with +94 and be 12 characters long (e.g., +94771234567)"
      );
      return;
    }

    // Format phone number before submitting
    const userData = {
      ...selectedUser,
      phone: phone ? formatPhoneNumber(phone) : selectedUser.phone,
    };

    onSubmit(userData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Add Delivery Person
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Users
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Searching..." : "Search"}
                </button>
              </div>
            </div>

            {users.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select User
                </label>
                <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md">
                  {users.map((user) => (
                    <button
                      key={user._id}
                      onClick={() => setSelectedUser(user)}
                      className={`w-full text-left px-3 py-2 hover:bg-gray-50 ${
                        selectedUser?._id === user._id
                          ? "bg-blue-50 border-r-2 border-blue-600"
                          : ""
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                          {user.avatar?.url ? (
                            <img
                              src={user.avatar.url}
                              alt={`${user.firstName} ${user.lastName}`}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-sm font-medium text-gray-600">
                              {user.firstName?.charAt(0)}
                              {user.lastName?.charAt(0)}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedUser && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-gray-500">(Optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 text-sm">+94</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setPhoneError("");
                    }}
                    placeholder="771234567"
                    className={`w-full pl-12 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                      phoneError
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300 focus:ring-blue-500"
                    }`}
                  />
                </div>
                {phoneError && (
                  <p className="mt-1 text-sm text-red-600">{phoneError}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Enter phone number without +94 prefix (e.g., 771234567)
                </p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedUser}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                Add Delivery Person
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// View Delivery Person Modal Component
const ViewDeliveryPersonModal = ({ deliveryPerson, onClose }) => {
  if (!deliveryPerson) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4 overflow-hidden">
                {deliveryPerson.avatar?.url ? (
                  <img
                    src={deliveryPerson.avatar.url}
                    alt={`${deliveryPerson.firstName} ${deliveryPerson.lastName}`}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-medium text-blue-600">
                    {deliveryPerson.firstName?.charAt(0)}
                    {deliveryPerson.lastName?.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {deliveryPerson.firstName} {deliveryPerson.lastName}
                </h2>
                <p className="text-gray-600">{deliveryPerson.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Personal Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {deliveryPerson.firstName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {deliveryPerson.lastName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {deliveryPerson.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {deliveryPerson.phone || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      deliveryPerson.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {deliveryPerson.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">
                    {deliveryPerson.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Statistics */}
            {deliveryPerson.stats && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Performance Statistics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {deliveryPerson.stats.totalAssigned || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Assigned</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {deliveryPerson.stats.totalDelivered || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Delivered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {deliveryPerson.stats.deliveryRate || 0}%
                    </div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>
                {deliveryPerson.stats.averageDeliveryTime && (
                  <div className="mt-4 text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {Math.floor(
                        deliveryPerson.stats.averageDeliveryTime / 60000
                      )}{" "}
                      minutes
                    </div>
                    <div className="text-sm text-gray-600">
                      Average Delivery Time
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Account Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Member Since
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {deliveryPerson.createdAt
                      ? new Date(deliveryPerson.createdAt).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Updated
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {deliveryPerson.updatedAt
                      ? new Date(deliveryPerson.updatedAt).toLocaleDateString()
                      : "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Delivery Person Modal Component
const EditDeliveryPersonModal = ({ deliveryPerson, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    role: "",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (deliveryPerson) {
      setFormData({
        role: deliveryPerson.role || "deliveryperson",
        isActive: deliveryPerson.isActive !== false,
      });
    }
  }, [deliveryPerson]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error updating delivery person:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  if (!deliveryPerson) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Edit Delivery Person
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Read-only information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Profile Information (Read-only)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <p className="text-sm text-gray-900 bg-white px-3 py-2 border border-gray-200 rounded-md">
                    {deliveryPerson.firstName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <p className="text-sm text-gray-900 bg-white px-3 py-2 border border-gray-200 rounded-md">
                    {deliveryPerson.lastName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <p className="text-sm text-gray-900 bg-white px-3 py-2 border border-gray-200 rounded-md">
                    {deliveryPerson.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <p className="text-sm text-gray-900 bg-white px-3 py-2 border border-gray-200 rounded-md">
                    {deliveryPerson.phone || "Not provided"}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Profile information cannot be updated through this interface.
                Contact the system administrator for profile changes.
              </p>
            </div>

            {/* Editable fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                name="role"
                value={formData.role || deliveryPerson.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="deliveryperson">Delivery Person</option>
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Active Status
              </label>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating...
                  </>
                ) : (
                  "Update Delivery Person"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Order View Modal Component
const OrderViewModal = ({ order, onClose }) => {
  if (!order) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-orange-100 text-orange-800", label: "Pending" },
      confirmed: { color: "bg-purple-100 text-purple-800", label: "Confirmed" },
      assigned: { color: "bg-blue-100 text-blue-800", label: "Assigned" },
      out_for_delivery: {
        color: "bg-yellow-100 text-yellow-800",
        label: "Out for Delivery",
      },
      delivered: { color: "bg-green-100 text-green-800", label: "Delivered" },
      completed: { color: "bg-gray-100 text-gray-800", label: "Completed" },
      cancelled: { color: "bg-red-100 text-red-800", label: "Cancelled" },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
              <p className="text-gray-600">Order #{order.orderNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Order Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Order Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Order Number
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {order.orderNumber}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <div className="mt-1">{getStatusBadge(order.status)}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Total Amount
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatPrice(order.totalAmount)}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Order Date
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {(order.user || order.customer)?.firstName}{" "}
                    {(order.user || order.customer)?.lastName}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {(order.user || order.customer)?.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {(order.user || order.customer)?.phone || "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Delivery Information
              </h3>
              {order.deliveryPerson ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Delivery Person
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {order.deliveryPerson.firstName}{" "}
                      {order.deliveryPerson.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {order.deliveryPerson.email}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No delivery person assigned</p>
                </div>
              )}

              {order.deliveryAddress && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Delivery Address
                  </label>
                  <div className="mt-1 text-sm text-gray-900">
                    <p>{order.deliveryAddress.street}</p>
                    <p>
                      {order.deliveryAddress.city},{" "}
                      {order.deliveryAddress.state}{" "}
                      {order.deliveryAddress.zipCode}
                    </p>
                    <p>{order.deliveryAddress.country}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            {order.items && order.items.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Items
                </h3>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-white rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                          <Package className="h-6 w-6 text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.product?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {formatPrice(item.price)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Total: {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Order Assignment Modal Component
const OrderAssignmentModal = ({
  order,
  deliveryPersons,
  onClose,
  onSubmit,
}) => {
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order?.deliveryPerson) {
      setSelectedDeliveryPerson(order.deliveryPerson._id);
    }
  }, [order]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDeliveryPerson) {
      toast.error("Please select a delivery person");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(selectedDeliveryPerson);
    } catch (error) {
      console.error("Error assigning order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {order.deliveryPerson ? "Reassign Order" : "Assign Order"}
              </h2>
              <p className="text-gray-600">Order #{order.orderNumber}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Order Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Order Information
            </h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p>
                <strong>Customer:</strong>{" "}
                {(order.user || order.customer)?.firstName}{" "}
                {(order.user || order.customer)?.lastName}
              </p>
              <p>
                <strong>Total:</strong> ${order.totalAmount?.toFixed(2)}
              </p>
              <p>
                <strong>Status:</strong> {order.status}
              </p>
              {order.deliveryPerson && (
                <p>
                  <strong>Current Delivery Person:</strong>{" "}
                  {order.deliveryPerson.firstName}{" "}
                  {order.deliveryPerson.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Delivery Person
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md">
                {deliveryPersons.map((person) => (
                  <button
                    key={person._id}
                    type="button"
                    onClick={() => setSelectedDeliveryPerson(person._id)}
                    className={`w-full text-left p-3 hover:bg-gray-50 border-l-4 ${
                      selectedDeliveryPerson === person._id
                        ? "bg-blue-50 border-blue-500"
                        : "border-transparent"
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                        {person.avatar?.url ? (
                          <img
                            src={person.avatar.url}
                            alt={`${person.firstName} ${person.lastName}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-blue-600">
                            {person.firstName?.charAt(0)}
                            {person.lastName?.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {person.firstName} {person.lastName}
                        </p>
                        <p className="text-xs text-gray-600">{person.email}</p>
                        {person.stats && (
                          <div className="flex items-center mt-1 space-x-3 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Package className="h-3 w-3 mr-1" />
                              {person.stats.totalAssigned || 0} assigned
                            </span>
                            <span className="flex items-center">
                              <Truck className="h-3 w-3 mr-1" />
                              {person.stats.totalDelivered || 0} delivered
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            person.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {person.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                disabled={loading || !selectedDeliveryPerson}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {order.deliveryPerson ? "Reassigning..." : "Assigning..."}
                  </>
                ) : (
                  <>
                    <Truck className="h-4 w-4 mr-2" />
                    {order.deliveryPerson ? "Reassign Order" : "Assign Order"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Ratings Detail Modal Component
const RatingsDetailModal = ({ ratingsData, onClose }) => {
  if (!ratingsData) return null;

  const { deliveryPerson, ratingDistribution, ratings, pagination } =
    ratingsData;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate percentage for each rating
  const getRatingPercentage = (count) => {
    if (deliveryPerson.totalRatings === 0) return 0;
    return Math.round((count / deliveryPerson.totalRatings) * 100);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl font-medium text-blue-600">
                  {deliveryPerson.name
                    ?.split(" ")
                    .map((n) => n.charAt(0))
                    .join("")}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {deliveryPerson.name}
                </h2>
                <div className="flex items-center mt-1">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                  <span className="ml-1 text-lg font-semibold text-gray-900">
                    {deliveryPerson.averageRating
                      ? deliveryPerson.averageRating.toFixed(1)
                      : "0.0"}
                  </span>
                  <span className="ml-2 text-sm text-gray-600">
                    ({deliveryPerson.totalRatings}{" "}
                    {deliveryPerson.totalRatings === 1 ? "review" : "reviews"})
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Rating Distribution */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Rating Distribution
              </h3>
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => (
                  <div key={rating} className="flex items-center">
                    <div className="flex items-center w-12">
                      <span className="text-sm font-medium text-gray-700">
                        {rating}
                      </span>
                      <Star className="h-4 w-4 ml-1 text-yellow-500 fill-yellow-500" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-yellow-500 h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${getRatingPercentage(
                              ratingDistribution[rating]
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex items-center w-20 justify-end">
                      <span className="text-sm font-medium text-gray-700">
                        {ratingDistribution[rating]} (
                        {getRatingPercentage(ratingDistribution[rating])}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {deliveryPerson.totalDeliveries}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  Total Deliveries
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">
                  {deliveryPerson.totalRatings}
                </div>
                <div className="text-sm text-gray-600 mt-1">Total Ratings</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-yellow-600">
                  {deliveryPerson.averageRating
                    ? deliveryPerson.averageRating.toFixed(1)
                    : "0.0"}
                </div>
                <div className="text-sm text-gray-600 mt-1">Average Rating</div>
              </div>
            </div>

            {/* Individual Ratings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Reviews
              </h3>
              <div className="space-y-4">
                {ratings && ratings.length > 0 ? (
                  ratings.map((rating, index) => (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center overflow-hidden">
                            {rating.customer?.avatar?.url ? (
                              <img
                                src={rating.customer.avatar.url}
                                alt={rating.customer.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-sm font-medium text-white">
                                {rating.customer?.name
                                  ?.split(" ")
                                  .map((n) => n.charAt(0))
                                  .join("") || "?"}
                              </span>
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="font-medium text-gray-900">
                              {rating.customer?.name || "Anonymous"}
                            </div>
                            <div className="text-sm text-gray-500">
                              Order #{rating.orderNumber}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= rating.rating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {formatDate(rating.ratedAt)}
                          </div>
                        </div>
                      </div>
                      {rating.feedback && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-700 italic">
                            "{rating.feedback}"
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Star className="mx-auto h-12 w-12 text-gray-300 mb-2" />
                    <p>No reviews yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pagination Info */}
            {pagination && pagination.totalPages > 1 && (
              <div className="text-center text-sm text-gray-600 pt-4 border-t border-gray-200">
                Showing page {pagination.currentPage} of {pagination.totalPages}
                ({pagination.totalRatings} total{" "}
                {pagination.totalRatings === 1 ? "review" : "reviews"})
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to render avatars consistently
const renderAvatar = (person, size = "w-8 h-8", className = "") => {
  const sizeClasses = {
    "w-8 h-8": "text-sm",
    "w-10 h-10": "text-sm",
    "w-12 h-12": "text-lg",
  };

  return (
    <div
      className={`${size} bg-blue-100 rounded-full flex items-center justify-center overflow-hidden ${className}`}
    >
      {person.avatar?.url ? (
        <img
          src={person.avatar.url}
          alt={`${person.firstName} ${person.lastName}`}
          className={`${size} rounded-full object-cover`}
          onError={(e) => {
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
      ) : null}
      <span
        className={`${
          sizeClasses[size]
        } font-medium text-blue-600 flex items-center justify-center ${
          person.avatar?.url ? "hidden" : ""
        }`}
        style={{ display: person.avatar?.url ? "none" : "flex" }}
      >
        {person.firstName?.charAt(0)}
        {person.lastName?.charAt(0)}
      </span>
    </div>
  );
};

export default AdminDeliveryManagement;
