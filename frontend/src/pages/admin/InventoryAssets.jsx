import React, { useEffect, useState, useMemo } from 'react';
import axiosInstance from '../../utils/axiosConfig';
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAdminResponsiveLayout } from "../../hooks/useAdminResponsiveLayout";
import {
  BuildingOfficeIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  UserIcon,
  CalendarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  ChartBarIcon,
  XMarkIcon,
  EyeIcon,
  PencilIcon,
} from "@heroicons/react/24/solid";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatCard = ({ label, value, icon, iconBg }) => (
  <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-200 hover:shadow-2xl transition-all duration-300 flex justify-between items-center group transform hover:-translate-y-1">
    <div className="space-y-1 sm:space-y-2 flex-1 min-w-0">
      <p className="text-xs sm:text-sm font-semibold text-slate-600 uppercase tracking-wide truncate">{label}</p>
      <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 group-hover:text-green-600 transition-colors duration-300">{value}</p>
    </div>
    <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 ${iconBg} group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
  </div>
);

const badge = (text, color, icon = null) => (
  <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm border ${color}`}>
    {icon && <span className="w-3 h-3">{icon}</span>}
    {text}
  </span>
);

const getStatusColor = (status) => {
  switch (status) {
    case 'approved':
      return 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border-emerald-200';
    case 'pending':
      return 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border-amber-200';
    case 'denied':
      return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-800 border-red-200';
    default:
      return 'bg-gradient-to-r from-slate-100 to-gray-100 text-slate-800 border-slate-200';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'approved':
      return <CheckCircleIcon className="w-3 h-3" />;
    case 'pending':
      return <ClockIcon className="w-3 h-3" />;
    case 'denied':
      return <ExclamationTriangleIcon className="w-3 h-3" />;
    default:
      return <ClockIcon className="w-3 h-3" />;
  }
};

// Actions Dropdown Component
const ActionsDropdown = ({ request, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-gradient-to-br from-slate-100 to-gray-200 hover:from-slate-200 hover:to-gray-300 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg"
      >
        <ChevronDownIcon className="w-5 h-5 text-slate-600" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-slate-200 z-20 overflow-hidden">
            {/* Quick Process - One click approval + payment + tracking */}
            {request.status === 'pending' && (
              <button
                onClick={() => { onAction('quick-process', request.id); setIsOpen(false); }}
                className="w-full px-4 py-3 text-left hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 flex items-center gap-3 border-b border-slate-100 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                  <CheckCircleIcon className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">Quick Process</div>
                  <div className="text-xs text-gray-500">Approve + Pay + Track</div>
                </div>
              </button>
            )}

            {/* Individual Actions */}
            {request.status === 'pending' && (
              <>
                <button
                  onClick={() => { onAction('approve', request.id); setIsOpen(false); }}
                  className="w-full px-4 py-3 text-left hover:bg-emerald-50 flex items-center gap-3 transition-colors"
                >
                  <CheckCircleIcon className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm font-medium">Approve Only</span>
                </button>
                <button
                  onClick={() => { onAction('decline', request.id); setIsOpen(false); }}
                  className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center gap-3 transition-colors"
                >
                  <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium">Decline</span>
                </button>
              </>
            )}

            {request.status === 'approved' && request.payment_status !== 'paid' && (
              <button
                onClick={() => { onAction('payment', request.id); setIsOpen(false); }}
                className="w-full px-4 py-3 text-left hover:bg-purple-50 flex items-center gap-3 transition-colors"
              >
                <CurrencyDollarIcon className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Process Payment</span>
              </button>
            )}

            {request.payment_status === 'paid' && (
              <>
                {!request.tracking_number && (
                  <button
                    onClick={() => { onAction('tracking', request); setIsOpen(false); }}
                    className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center gap-3 transition-colors"
                  >
                    <DocumentTextIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium">Generate Tracking</span>
                  </button>
                )}
                <button
                  onClick={() => { onAction('receipt', request); setIsOpen(false); }}
                  className="w-full px-4 py-3 text-left hover:bg-indigo-50 flex items-center gap-3 transition-colors"
                >
                  <DocumentTextIcon className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-medium">Download Receipt</span>
                </button>
              </>
            )}

            <button
              onClick={() => { onAction('view', request); setIsOpen(false); }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-t border-slate-100 transition-colors"
            >
              <EyeIcon className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">View Details</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// Tracking Actions Dropdown Component
const TrackingActionsDropdown = ({ asset, onGenerateTracking, onViewDetails }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-gradient-to-br from-slate-100 to-gray-200 hover:from-slate-200 hover:to-gray-300 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg"
      >
        <ChevronDownIcon className="w-5 h-5 text-slate-600" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-slate-200 z-20 overflow-hidden">
            {!asset.trackingNumber && (
              <button
                onClick={() => { onGenerateTracking(asset); setIsOpen(false); }}
                className="w-full px-4 py-3 text-left hover:bg-purple-50 flex items-center gap-3 transition-colors border-b border-slate-100"
              >
                <DocumentTextIcon className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">Generate Tracking</span>
              </button>
            )}
            
            <button
              onClick={() => { onViewDetails(asset); setIsOpen(false); }}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <EyeIcon className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">View Details</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const InventoryAssets = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { mainClasses } = useAdminResponsiveLayout();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState(null);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState('all'); // all, pending, approved, paid, denied
  const [filteredRequests, setFilteredRequests] = useState([]);
  
  // Tab state - read from URL query parameter
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    return tabParam === 'tracking' ? 'tracking' : 'requests';
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusCounts, setStatusCounts] = useState({
    approved: 0,
    pending: 0,
    denied: 0,
    paid: 0
  });

  // Tracking tab states
  const [trackingRecords, setTrackingRecords] = useState([]);
  const [filteredTrackingRecords, setFilteredTrackingRecords] = useState([]);
  const [trackingSearch, setTrackingSearch] = useState("");

  // Analytics state
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  
  // Management dropdown
  const [showManagementDropdown, setShowManagementDropdown] = useState(false);
  
  // Details Modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Tracking Modal states
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [selectedAssetForTracking, setSelectedAssetForTracking] = useState(null);
  const [returnDate, setReturnDate] = useState('');
  const [returnTime, setReturnTime] = useState('');

  // Sync activeTab with URL query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'tracking') {
      setActiveTab('tracking');
    } else if (tabParam === null || tabParam === 'requests') {
      setActiveTab('requests');
    }
  }, [searchParams]);

  useEffect(() => {
    fetchRequests(currentPage);
    fetchTrackingRecords(); // Always fetch tracking records for count
  }, [currentPage]);

  // Fetch tracking records when switching to tracking tab
  useEffect(() => {
    if (activeTab === 'tracking') {
      fetchTrackingRecords();
    }
  }, [activeTab]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchRequests(currentPage);
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, currentPage]);

  // Manual refresh function
  const handleManualRefresh = () => {
    fetchRequests(currentPage, true);
  };

  // Filter requests based on search and view mode
  useEffect(() => {
    setFilteredRequests(
      requests.filter((request) => {
        const matchesSearch =
          (request.resident && request.resident.profile &&
            `${request.resident.profile.first_name || ''} ${request.resident.profile.last_name || ''}`.toLowerCase().includes(search.toLowerCase())) ||
          (request.resident && request.resident.residents_id &&
            request.resident.residents_id.toLowerCase().includes(search.toLowerCase())) ||
          (request.asset && request.asset.name &&
            request.asset.name.toLowerCase().includes(search.toLowerCase()));
        
        let matchesView = true;
        if (viewMode === 'paid') {
          matchesView = request.payment_status === 'paid';
        } else if (viewMode !== 'all') {
          matchesView = request.status === viewMode;
        }
        
        return matchesSearch && matchesView;
      })
    );
  }, [search, viewMode, requests]);

  // Filter tracking records based on search
  useEffect(() => {
    setFilteredTrackingRecords(
      trackingRecords.filter((record) => {
        const matchesSearch =
          record.residentName.toLowerCase().includes(trackingSearch.toLowerCase()) ||
          record.residentId.toLowerCase().includes(trackingSearch.toLowerCase()) ||
          record.name.toLowerCase().includes(trackingSearch.toLowerCase()) ||
          (record.trackingNumber && record.trackingNumber.toLowerCase().includes(trackingSearch.toLowerCase())) ||
          (record.receiptNumber && record.receiptNumber.toLowerCase().includes(trackingSearch.toLowerCase()));
        return matchesSearch;
      })
    );
  }, [trackingSearch, trackingRecords]);

  const fetchRequests = async (page = 1, showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    }
    setLoading(true);

    try {
      const requestsRes = await axiosInstance.get(`/asset-requests?page=${page}&per_page=${perPage}`);
      setRequests(requestsRes.data.data);
      setCurrentPage(requestsRes.data.current_page);
      setLastPage(requestsRes.data.last_page);
      setTotal(requestsRes.data.total);

      const statusRes = await axiosInstance.get('/asset-requests/status-counts');
      setStatusCounts({
        approved: statusRes.data.approved,
        pending: statusRes.data.pending,
        denied: statusRes.data.denied,
        paid: statusRes.data.paid
      });

      setChartData(generateChartData(requestsRes.data.data));
      setLastRefresh(new Date());

      if (showRefreshIndicator) {
        setToastMessage({
          type: 'success',
          message: '🔄 Data refreshed successfully',
          duration: 2000
        });
      }
    } catch (err) {
      console.error('Failed to load requests:', err);
      if (showRefreshIndicator) {
        setToastMessage({
          type: 'error',
          message: '❌ Failed to refresh data',
          duration: 4000
        });
      }
    } finally {
      setLoading(false);
      if (showRefreshIndicator) {
        setIsRefreshing(false);
      }
    }
  };

  const generateChartData = (requests) => {
    const monthlyData = {};
    const now = new Date();
    
    requests.forEach(request => {
      if (request.created_at) {
        const date = new Date(request.created_at);
        const m = date.getMonth() + 1;
        const y = date.getFullYear();
        const key = `${y}-${String(m).padStart(2, '0')}`;
        monthlyData[key] = (monthlyData[key] || 0) + 1;
      }
    });

    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      data.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        requests: monthlyData[key] || 0
      });
    }
    return data;
  };

  const fetchTrackingRecords = async () => {
    try {
      // Fetch all paid requests for tracking
      let allRequests = [];
      let currentPage = 1;
      let hasMorePages = true;
      
      while (hasMorePages) {
        const res = await axiosInstance.get(`/asset-requests?page=${currentPage}&per_page=100`);
        const pageData = res.data.data || res.data;
        
        if (Array.isArray(pageData)) {
          allRequests = [...allRequests, ...pageData];
        }
        
        hasMorePages = currentPage < res.data.last_page;
        currentPage++;
      }
      
      // Filter only paid requests and transform to tracking format
      const paidRequests = allRequests.filter(request => request.payment_status === 'paid');
      const trackingData = paidRequests.map(request => {
        const firstItem = request.items && request.items[0] ? request.items[0] : null;
        const firstAsset = firstItem && firstItem.asset ? firstItem.asset : null;
        
        let residentId = 'N/A';
        if (request.resident && request.resident.resident_id && request.resident.resident_id.trim() !== '') {
          residentId = request.resident.resident_id;
        } else if (request.resident && request.resident.residents_id) {
          residentId = request.resident.residents_id;
        } else if (request.resident && request.resident.id) {
          residentId = `R-${request.resident.id}`;
        }
        
        return {
          id: firstItem ? firstItem.id : request.id,
          itemId: firstItem ? firstItem.id : null,
          requestId: request.id,
          residentId: residentId,
          residentName: request.resident && request.resident.profile 
            ? `${request.resident.profile.first_name || ''} ${request.resident.profile.last_name || ''}`.trim()
            : (request.user ? request.user.name : 'Unknown'),
          name: firstAsset ? firstAsset.name : 'Unknown Asset',
          description: firstAsset ? firstAsset.description : '',
          receiptNumber: request.receipt_number,
          amountPaid: parseFloat(request.amount_paid || request.total_amount || 0),
          paidAt: request.paid_at,
          rentalDuration: firstItem ? firstItem.rental_duration_days : 1,
          returnDate: firstItem ? firstItem.return_date : null,
          isReturned: firstItem ? firstItem.is_returned : false,
          requestDate: request.request_date,
          allItems: request.items || [],
          trackingNumber: firstItem ? firstItem.tracking_number : null,
          trackingGeneratedAt: firstItem ? firstItem.tracking_generated_at : null,
          createdAt: request.created_at,
          updatedAt: request.updated_at
        };
      });
      
      setTrackingRecords(trackingData);
      setFilteredTrackingRecords(trackingData);
    } catch (error) {
      console.error('Error fetching tracking data:', error);
      setToastMessage({
        type: 'error',
        message: '❌ Failed to load tracking data',
        duration: 4000
      });
    }
  };

  // Quick Process - Approve + Pay + Generate Tracking in one action
  const handleQuickProcess = async (id) => {
    if (!window.confirm('This will approve the request, process payment, and generate tracking number. Continue?')) return;

    try {
      setToastMessage({ type: 'loading', message: '⚡ Quick processing...' });
      
      // Step 1: Approve
      await axiosInstance.patch(`/asset-requests/${id}`, { status: 'approved' });
      
      // Step 2: Process Payment
      const paymentRes = await axiosInstance.post(`/asset-requests/${id}/pay`);
      
      // Step 3: Auto-generate tracking with default return date
      const request = requests.find(r => r.id === id);
      if (request && request.items && request.items[0]) {
        const item = request.items[0];
        const requestDate = new Date(request.request_date);
        const defaultReturnDate = new Date(requestDate);
        defaultReturnDate.setDate(requestDate.getDate() + (item.rental_duration_days || 1));
        defaultReturnDate.setHours(17, 0, 0, 0); // 5:00 PM
        
        await axiosInstance.post(`/asset-request-items/${item.id}/generate-tracking`, {
          return_date: defaultReturnDate.toISOString()
        });
      }
      
      setToastMessage({
        type: 'success',
        message: `✅ Request processed successfully!\nReceipt: ${paymentRes.data.receipt_number}`,
        duration: 4000
      });
      
      // Refresh data
      fetchRequests(currentPage);
      
      // Auto-download receipt
      await generateReceipt(paymentRes.data.asset_request, paymentRes.data.receipt_number, paymentRes.data.amount_paid);
      
    } catch (err) {
      console.error('Quick process failed:', err);
      setToastMessage({
        type: 'error',
        message: '❌ ' + (err.response?.data?.error || 'Quick process failed'),
        duration: 4000
      });
    }
  };

  // Individual actions
  const handleApprove = async (id) => {
    try {
      await axiosInstance.patch(`/asset-requests/${id}`, { status: 'approved' });
      setRequests(requests.map(r => r.id === id ? { ...r, status: 'approved' } : r));
      setToastMessage({ type: 'success', message: '✅ Request approved', duration: 2000 });
    } catch (err) {
      setToastMessage({ type: 'error', message: '❌ Failed to approve', duration: 3000 });
    }
  };

  const handleDecline = async (id) => {
    if (!window.confirm('Are you sure you want to decline this request?')) return;
    try {
      await axiosInstance.patch(`/asset-requests/${id}`, { status: 'denied' });
      setRequests(requests.map(r => r.id === id ? { ...r, status: 'denied' } : r));
      setToastMessage({ type: 'success', message: '✅ Request declined', duration: 2000 });
    } catch (err) {
      setToastMessage({ type: 'error', message: '❌ Failed to decline', duration: 3000 });
    }
  };

  const handlePayment = async (id) => {
    if (!window.confirm('Process payment for this request?')) return;
    setProcessingPayment(id);
    
    try {
      const res = await axiosInstance.post(`/asset-requests/${id}/pay`);
      setRequests(requests.map(r => r.id === id ? { 
        ...r, 
        payment_status: 'paid',
        receipt_number: res.data.receipt_number,
        amount_paid: res.data.amount_paid,
        paid_at: new Date().toISOString()
      } : r));
      
      setToastMessage({
        type: 'success',
        message: `✅ Payment processed!\nReceipt: ${res.data.receipt_number}`,
        duration: 3000
      });
      
      await generateReceipt(res.data.asset_request, res.data.receipt_number, res.data.amount_paid);
    } catch (err) {
      setToastMessage({
        type: 'error',
        message: '❌ ' + (err.response?.data?.error || 'Payment failed'),
        duration: 4000
      });
    } finally {
      setProcessingPayment(null);
    }
  };

  const handleGenerateTracking = async (request) => {
    try {
      if (!request.items || !request.items[0]) {
        setToastMessage({ type: 'error', message: '❌ No items found', duration: 3000 });
        return;
      }

      const item = request.items[0];
      const requestDate = new Date(request.request_date);
      const defaultReturnDate = new Date(requestDate);
      defaultReturnDate.setDate(requestDate.getDate() + (item.rental_duration_days || 1));
      defaultReturnDate.setHours(17, 0, 0, 0);

      const response = await axiosInstance.post(`/asset-request-items/${item.id}/generate-tracking`, {
        return_date: defaultReturnDate.toISOString()
      });

      setToastMessage({
        type: 'success',
        message: `📋 Tracking: ${response.data.tracking_number}`,
        duration: 4000
      });

      fetchRequests(currentPage);
      if (activeTab === 'tracking') {
        fetchTrackingRecords();
      }
    } catch (err) {
      setToastMessage({
        type: 'error',
        message: '❌ ' + (err.response?.data?.error || 'Tracking generation failed'),
        duration: 4000
      });
    }
  };

  // Open tracking modal for manual date/time selection
  const openTrackingModal = (asset) => {
    setSelectedAssetForTracking(asset);
    
    const requestDate = new Date(asset.requestDate);
    const defaultReturnDate = new Date(requestDate);
    defaultReturnDate.setDate(requestDate.getDate() + asset.rentalDuration);
    
    const year = defaultReturnDate.getFullYear();
    const month = String(defaultReturnDate.getMonth() + 1).padStart(2, '0');
    const day = String(defaultReturnDate.getDate()).padStart(2, '0');
    
    setReturnDate(`${year}-${month}-${day}`);
    setReturnTime('17:00');
    setShowTrackingModal(true);
  };

  // Generate tracking number with custom date/time
  const generateTrackingNumberWithDate = async () => {
    if (!returnDate || !returnTime) {
      setToastMessage({
        type: 'error',
        message: '❌ Please set both return date and time',
        duration: 3000
      });
      return;
    }

    try {
      const asset = selectedAssetForTracking;
      const returnDateTime = new Date(`${returnDate}T${returnTime}`);
      
      if (isNaN(returnDateTime.getTime())) {
        setToastMessage({
          type: 'error',
          message: '❌ Invalid date or time selected',
          duration: 3000
        });
        return;
      }
      
      const itemId = asset.itemId || asset.id;
      
      const response = await axiosInstance.post(`/asset-request-items/${itemId}/generate-tracking`, {
        return_date: returnDateTime.toISOString()
      });

      if (response.data && response.data.tracking_number) {
        setToastMessage({
          type: 'success',
          message: `📋 Tracking: ${response.data.tracking_number}\nReturn: ${returnDateTime.toLocaleDateString()}`,
          duration: 4000
        });

        setShowTrackingModal(false);
        setSelectedAssetForTracking(null);
        setReturnDate('');
        setReturnTime('');
        
        fetchTrackingRecords();
      }
    } catch (err) {
      console.error('Error generating tracking number:', err);
      setToastMessage({
        type: 'error',
        message: '❌ ' + (err.response?.data?.error || 'Failed to generate tracking number'),
        duration: 4000
      });
    }
  };

  const generateReceipt = async (assetRequest, receiptNumber, amount) => {
    try {
      setToastMessage({
        type: 'loading',
        message: 'Generating receipt PDF...',
        duration: 0
      });

      console.log('Generating receipt:', {
        asset_request_id: assetRequest.id,
        receipt_number: receiptNumber,
        amount_paid: amount
      });

      // Backend returns JSON with base64-encoded PDF data, not a blob
      const response = await axiosInstance.post('/asset-requests/generate-receipt', {
        asset_request_id: assetRequest.id,
        receipt_number: receiptNumber,
        amount_paid: amount
      });

      // Check if response is successful
      if (!response.data || !response.data.success) {
        throw new Error(response.data?.error || response.data?.message || 'Failed to generate receipt');
      }

      // Validate that we have PDF data
      if (!response.data.pdf_data) {
        throw new Error('No PDF data received from server');
      }

      console.log('Receipt PDF generated successfully:', {
        filename: response.data.filename,
        hasPdfData: !!response.data.pdf_data
      });

      // Convert base64 to blob
      const byteCharacters = atob(response.data.pdf_data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      // Create download link for PDF
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.data.filename || `receipt-${receiptNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setToastMessage({
        type: 'success',
        message: `📄 Receipt PDF downloaded successfully!`,
        duration: 3000
      });

    } catch (err) {
      console.error('Error generating receipt PDF:', err);
      console.error('Error details:', {
        response: err.response,
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      let errorMessage = 'Failed to generate receipt PDF. Please try again.';
      
      if (err.response) {
        if (err.response.data) {
          errorMessage = err.response.data.error || err.response.data.message || errorMessage;
        }
        
        // Provide specific error messages based on status
        if (err.response.status === 400) {
          errorMessage = err.response.data?.error || err.response.data?.message || 'Invalid request. Payment may not be confirmed yet.';
        } else if (err.response.status === 404) {
          errorMessage = err.response.data?.error || err.response.data?.message || 'Receipt template or asset request not found.';
        } else if (err.response.status === 500) {
          errorMessage = err.response.data?.error || err.response.data?.message || 'Server error occurred while generating receipt. Please try again or contact support.';
        }
      } else if (err.request) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setToastMessage({
        type: 'error',
        message: `❌ ${errorMessage}`,
        duration: 5000
      });
    }
  };

  const handleAction = async (action, data) => {
    switch (action) {
      case 'quick-process':
        await handleQuickProcess(data);
        break;
      case 'approve':
        await handleApprove(data);
        break;
      case 'decline':
        await handleDecline(data);
        break;
      case 'payment':
        await handlePayment(data);
        break;
      case 'tracking':
        await handleGenerateTracking(data);
        break;
      case 'receipt':
        // Validate that receipt data exists
        if (!data.receipt_number) {
          setToastMessage({
            type: 'error',
            message: '❌ Receipt number not found. Payment may not be confirmed yet.',
            duration: 4000
          });
          return;
        }
        if (!data.amount_paid && !data.total_amount) {
          setToastMessage({
            type: 'error',
            message: '❌ Payment amount not found.',
            duration: 4000
          });
          return;
        }
        await generateReceipt(
          data, 
          data.receipt_number, 
          data.amount_paid || data.total_amount
        );
        break;
      case 'view':
        setSelectedRequest(data);
        setShowDetailsModal(true);
        break;
      default:
        break;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Auto-hide toast messages
  React.useEffect(() => {
    if (toastMessage && toastMessage.duration > 0) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, toastMessage.duration);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Toast Notification Component
  const ToastNotification = ({ message, type, onClose }) => (
    <div className={`fixed top-24 right-6 z-50 max-w-md rounded-xl shadow-2xl border-2 p-4 transition-all duration-500 transform ${
      message ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    } ${
      type === 'success'
        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800'
        : type === 'loading'
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-800'
          : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800'
    }`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {type === 'success' && <CheckCircleIcon className="w-5 h-5 text-green-600" />}
          {type === 'loading' && <ArrowPathIcon className="w-5 h-5 text-blue-600 animate-spin" />}
          {type === 'error' && <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm whitespace-pre-line">{message}</div>
        </div>
        {type !== 'loading' && (
          <button onClick={onClose} className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors">
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {toastMessage && (
        <ToastNotification
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      <Navbar />
      <Sidebar />
      <main className="bg-gradient-to-br from-green-50 to-emerald-50 min-h-screen ml-0 lg:ml-64 pt-20 lg:pt-36 px-4 pb-16 font-sans">
        <div className="w-full max-w-8xl mx-auto space-y-8 px-4">
          {/* Header */}
          <div className="text-center space-y-4 py-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4">
              <BuildingOfficeIcon className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-600 tracking-tight">
              Asset Rental Management
            </h1>
            <p className="text-slate-600 text-sm sm:text-base max-w-2xl mx-auto">
              Streamlined asset rental requests with quick processing and tracking
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              label="TOTAL"
              value={total}
              icon={<BuildingOfficeIcon className="w-6 h-6 text-green-600" />}
              iconBg="bg-green-100"
            />
            <StatCard
              label="PENDING"
              value={statusCounts.pending}
              icon={<ClockIcon className="w-6 h-6 text-orange-600" />}
              iconBg="bg-orange-100"
            />
            <StatCard
              label="APPROVED"
              value={statusCounts.approved}
              icon={<CheckCircleIcon className="w-6 h-6 text-green-600" />}
              iconBg="bg-green-100"
            />
            <StatCard
              label="PAID"
              value={statusCounts.paid}
              icon={<CurrencyDollarIcon className="w-6 h-6 text-green-600" />}
              iconBg="bg-green-100"
            />
          </div>

          {/* Collapsible Analytics */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ChartBarIcon className="w-6 h-6 text-emerald-600" />
                <h3 className="text-lg font-bold text-gray-800">Analytics & Insights</h3>
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                  Last 6 months
                </span>
              </div>
              <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${showAnalytics ? 'rotate-180' : ''}`} />
            </button>

            {showAnalytics && (
              <div className="p-6 border-t border-slate-200 bg-gradient-to-br from-slate-50 to-emerald-50">
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="requests"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Current View Indicator */}
          {activeTab === 'tracking' && (
            <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 rounded-2xl shadow-lg border-2 border-purple-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
                    <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">Asset Tracking View</h3>
                    <p className="text-sm text-gray-600">Viewing {trackingRecords.length} paid assets with tracking</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setActiveTab('requests');
                    setSearchParams({});
                  }}
                  className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm transition-all border-2 border-gray-200 flex items-center gap-2"
                >
                  <BuildingOfficeIcon className="w-4 h-4" />
                  Back to Requests
                </button>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Management Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowManagementDropdown(!showManagementDropdown)}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-semibold transition-all duration-300"
                >
                  <BuildingOfficeIcon className="w-5 h-5" />
                  Manage Assets
                  <ChevronDownIcon className="w-4 h-4" />
                </button>

                {showManagementDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowManagementDropdown(false)}></div>
                    <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border-2 border-slate-200 z-20 overflow-hidden">
                      <Link
                        to="/admin/assets-management"
                        className="block px-4 py-3 hover:bg-emerald-50 transition-colors text-sm font-medium text-gray-700 border-b border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <BuildingOfficeIcon className="w-4 h-4 text-emerald-600" />
                          Asset Records
                        </div>
                      </Link>
                      <button
                        onClick={() => navigate('/admin/assets-post-management')}
                        className="w-full text-left px-4 py-3 hover:bg-emerald-50 transition-colors text-sm font-medium text-gray-700 border-b border-slate-100"
                      >
                        <div className="flex items-center gap-3">
                          <DocumentTextIcon className="w-4 h-4 text-teal-600" />
                          Post Management
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab('tracking');
                          setSearchParams({ tab: 'tracking' });
                          setShowManagementDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors text-sm font-medium text-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <DocumentTextIcon className="w-4 h-4 text-purple-600" />
                          <div>
                            <div>Asset Tracking</div>
                            <div className="text-xs text-purple-600 font-semibold">
                              {trackingRecords.length} paid assets
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Search */}
              <div className="relative flex-1">
                {activeTab === 'requests' ? (
                  <>
                    <input
                      type="text"
                      className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl text-sm shadow-sm transition-all duration-300 bg-slate-50 focus:bg-white"
                      placeholder="Search by resident name, ID, or asset..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
                  </>
                ) : (
                  <>
                    <input
                      type="text"
                      className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 rounded-xl text-sm shadow-sm transition-all duration-300 bg-slate-50 focus:bg-white"
                      placeholder="Search by name, ID, asset, tracking, or receipt..."
                      value={trackingSearch}
                      onChange={(e) => setTrackingSearch(e.target.value)}
                    />
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" />
                  </>
                )}
              </div>

              {/* View Mode Filter - Only show for requests tab */}
              {activeTab === 'requests' && (
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  className="px-6 py-3 text-sm border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 focus:bg-white shadow-sm transition-all duration-300 font-medium"
                >
                  <option value="all">All Requests ({total})</option>
                  <option value="pending">Pending ({statusCounts.pending})</option>
                  <option value="approved">Approved ({statusCounts.approved})</option>
                  <option value="paid">Paid ({statusCounts.paid})</option>
                  <option value="denied">Denied ({statusCounts.denied})</option>
                </select>
              )}

              {/* Refresh Button */}
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 hover:from-emerald-200 hover:to-green-200 transition-all duration-300 disabled:opacity-50 shadow-sm"
              >
                <ArrowPathIcon className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {/* Active Filter Info */}
            {activeTab === 'requests' && (search || viewMode !== 'all') && (
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="text-gray-600">Active filters:</span>
                {search && (
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">
                    Search: "{search}"
                  </span>
                )}
                {viewMode !== 'all' && (
                  <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium capitalize">
                    {viewMode}
                  </span>
                )}
                <button
                  onClick={() => { setSearch(''); setViewMode('all'); }}
                  className="text-red-600 hover:text-red-700 font-medium ml-2"
                >
                  Clear all
                </button>
              </div>
            )}
            {activeTab === 'tracking' && trackingSearch && (
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="text-gray-600">Active filters:</span>
                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-medium">
                  Search: "{trackingSearch}"
                </span>
                <button
                  onClick={() => setTrackingSearch('')}
                  className="text-red-600 hover:text-red-700 font-medium ml-2"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 via-emerald-800 to-green-800 px-6 py-4">
              <h3 className="text-white font-bold text-xl flex items-center gap-3">
                <BuildingOfficeIcon className="w-6 h-6" />
                {activeTab === 'requests' ? 'Asset Requests' : 'Asset Tracking'}
              </h3>
              <p className="text-emerald-100 mt-1 text-sm">
                {activeTab === 'requests' 
                  ? 'Manage and process asset rental requests' 
                  : 'Track and manage paid asset rentals with tracking numbers'}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gradient-to-r from-slate-50 to-emerald-50 border-b-2 border-slate-200">
                  {activeTab === 'requests' ? (
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-slate-700 text-xs uppercase">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-slate-500" />
                          Resident
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-slate-700 text-xs uppercase">
                        <div className="flex items-center gap-2">
                          <BuildingOfficeIcon className="w-4 h-4 text-slate-500" />
                          Asset
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-slate-700 text-xs uppercase hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-slate-500" />
                          Date
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-slate-700 text-xs uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-slate-700 text-xs uppercase hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <CurrencyDollarIcon className="w-4 h-4 text-slate-500" />
                          Amount
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-slate-700 text-xs uppercase hidden lg:table-cell">
                        Receipt/Tracking
                      </th>
                      <th className="px-4 py-3 text-center font-bold text-slate-700 text-xs uppercase">
                        Actions
                      </th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="px-4 py-3 text-left font-bold text-slate-700 text-xs uppercase">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-slate-500" />
                          Resident
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-slate-700 text-xs uppercase">
                        <div className="flex items-center gap-2">
                          <BuildingOfficeIcon className="w-4 h-4 text-slate-500" />
                          Asset
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-slate-700 text-xs uppercase hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-slate-500" />
                          Rental Period
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-slate-700 text-xs uppercase hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <CurrencyDollarIcon className="w-4 h-4 text-slate-500" />
                          Amount
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left font-bold text-slate-700 text-xs uppercase">
                        <div className="flex items-center gap-2">
                          <DocumentTextIcon className="w-4 h-4 text-slate-500" />
                          Tracking Number
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center font-bold text-slate-700 text-xs uppercase">
                        Actions
                      </th>
                    </tr>
                  )}
                </thead>

                <tbody className="divide-y divide-slate-200">
                  {activeTab === 'requests' ? (
                    // Requests Table Body
                    loading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                          <td className="px-4 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                          <td className="px-4 py-4 hidden md:table-cell"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                          <td className="px-4 py-4"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                          <td className="px-4 py-4 hidden lg:table-cell"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                          <td className="px-4 py-4 hidden lg:table-cell"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                          <td className="px-4 py-4"><div className="h-8 bg-gray-200 rounded w-10 mx-auto"></div></td>
                        </tr>
                      ))
                    ) : filteredRequests.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <BuildingOfficeIcon className="w-12 h-12 text-gray-300" />
                            <p className="text-gray-500 font-medium">No requests found</p>
                            <p className="text-gray-400 text-sm">Try adjusting your filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all duration-200">
                          <td className="px-4 py-4">
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">
                                {request.resident && request.resident.profile
                                  ? `${request.resident.profile.first_name || ''} ${request.resident.profile.last_name || ''}`.trim()
                                  : request.user?.name || 'N/A'}
                              </div>
                              <div className="text-xs font-mono text-emerald-600">
                                {request.resident?.residents_id || 'N/A'}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-medium text-gray-700 text-sm">
                              {request.asset?.name || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-gray-600 text-xs hidden md:table-cell">
                            {formatDate(request.request_date)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-1">
                              {badge(
                                request.status.charAt(0).toUpperCase() + request.status.slice(1),
                                getStatusColor(request.status),
                                getStatusIcon(request.status)
                              )}
                              {request.payment_status === 'paid' && (
                                <span className="text-xs text-emerald-600 font-semibold">Paid</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 hidden lg:table-cell">
                            <span className="font-semibold text-emerald-600 text-sm">
                              ₱{request.total_amount ? request.total_amount.toFixed(2) : '0.00'}
                            </span>
                          </td>
                          <td className="px-4 py-4 hidden lg:table-cell">
                            <div className="space-y-1">
                              {request.receipt_number && (
                                <div className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                  {request.receipt_number}
                                </div>
                              )}
                              {request.items?.[0]?.tracking_number && (
                                <div className="text-xs font-mono text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                  {request.items[0].tracking_number}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-center">
                              <ActionsDropdown request={request} onAction={handleAction} />
                            </div>
                          </td>
                        </tr>
                      ))
                    )
                  ) : (
                    // Tracking Table Body
                    filteredTrackingRecords.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <DocumentTextIcon className="w-12 h-12 text-gray-300" />
                            <p className="text-gray-500 font-medium">No paid assets found for tracking</p>
                            <p className="text-gray-400 text-sm">Only paid requests with tracking numbers appear here</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredTrackingRecords.map((asset) => (
                        <tr key={asset.id} className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-200">
                          <td className="px-4 py-4">
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">
                                {asset.residentName}
                              </div>
                              <div className="text-xs font-mono text-emerald-600">
                                {asset.residentId}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="font-medium text-gray-700 text-sm">
                              {asset.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-xs">
                              {asset.description}
                            </div>
                          </td>
                          <td className="px-4 py-4 hidden md:table-cell">
                            <div className="space-y-1">
                              <div className="text-xs text-gray-600">
                                {formatDate(asset.requestDate)}
                              </div>
                              <div className="text-xs text-emerald-600 font-medium">
                                {asset.rentalDuration} day rental
                              </div>
                              {asset.returnDate && (
                                <div className="text-xs text-gray-500">
                                  Return: {formatDate(asset.returnDate)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 hidden lg:table-cell">
                            <span className="font-semibold text-emerald-600 text-sm">
                              ₱{asset.amountPaid ? parseFloat(asset.amountPaid).toFixed(2) : '0.00'}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            {asset.trackingNumber ? (
                              <div className="font-mono text-xs font-bold text-purple-600 bg-purple-50 px-3 py-2 rounded-lg border border-purple-200 inline-block">
                                {asset.trackingNumber}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-400 italic">
                                Not generated
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex justify-center">
                              <TrackingActionsDropdown
                                asset={asset}
                                onGenerateTracking={openTrackingModal}
                                onViewDetails={(asset) => {
                                  setSelectedRequest({ ...asset, id: asset.requestId, items: asset.allItems });
                                  setShowDetailsModal(true);
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination - Only show for requests tab */}
            {activeTab === 'requests' && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-700 font-medium">
                    Showing <span className="text-emerald-600 font-bold">{(currentPage - 1) * perPage + 1}</span> to{' '}
                    <span className="text-emerald-600 font-bold">{Math.min(currentPage * perPage, total)}</span> of{' '}
                    <span className="text-emerald-600 font-bold">{total}</span> results
                  </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200 shadow-sm'
                    }`}
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {(() => {
                      const pages = [];
                      const maxVisible = 5;
                      let start = Math.max(1, currentPage - 2);
                      let end = Math.min(lastPage, start + maxVisible - 1);

                      if (end - start + 1 < maxVisible) {
                        start = Math.max(1, end - maxVisible + 1);
                      }

                      for (let i = start; i <= end; i++) {
                        pages.push(
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i)}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                              i === currentPage
                                ? 'bg-emerald-600 text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-emerald-50 border border-gray-200'
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }
                      return pages;
                    })()}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, lastPage))}
                    disabled={currentPage === lastPage}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      currentPage === lastPage
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200 shadow-sm'
                    }`}
                  >
                    Next
                  </button>
                </div>
                </div>
              </div>
            )}

            {/* Tracking Tab Results Info */}
            {activeTab === 'tracking' && (
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-700 font-medium text-center">
                  Showing <span className="text-purple-600 font-bold">{filteredTrackingRecords.length}</span> of{' '}
                  <span className="text-purple-600 font-bold">{trackingRecords.length}</span> paid assets for tracking
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Tracking Number Generation Modal */}
      {showTrackingModal && selectedAssetForTracking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <DocumentTextIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-xl">Generate Tracking Number</h2>
                    <p className="text-purple-100 mt-1 text-sm">Set return date and time for asset tracking</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTrackingModal(false)}
                  className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all"
                >
                  <XMarkIcon className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="space-y-6">
                {/* Asset Information */}
                <div className="bg-gradient-to-br from-slate-50 to-purple-50 rounded-xl p-4 border border-slate-200">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">Asset Information</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-xs text-gray-500">Asset:</span>
                      <p className="font-medium text-gray-800">{selectedAssetForTracking.name}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Resident:</span>
                      <p className="font-medium text-gray-800">{selectedAssetForTracking.residentName}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Request Date:</span>
                      <p className="font-medium text-gray-800">{formatDate(selectedAssetForTracking.requestDate)}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Rental Duration:</span>
                      <p className="font-medium text-purple-600">{selectedAssetForTracking.rentalDuration} days</p>
                    </div>
                  </div>
                </div>

                {/* Return Date and Time Selection */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                  <h3 className="text-sm font-semibold text-gray-800 mb-4">Set Return Date & Time</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">Return Date *</label>
                      <input
                        type="date"
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-2">Return Time *</label>
                      <input
                        type="time"
                        value={returnTime}
                        onChange={(e) => setReturnTime(e.target.value)}
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Preview */}
                  {returnDate && returnTime && (
                    <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-gray-800 text-xs mb-2 flex items-center gap-2">
                        Preview
                      </h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex justify-between">
                          <span>Return:</span>
                          <span className="font-semibold">
                            {new Date(`${returnDate}T${returnTime}`).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })} at {new Date(`${returnDate}T${returnTime}`).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowTrackingModal(false)}
                className="px-5 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all text-sm"
              >
                Cancel
              </button>
              <button
                onClick={generateTrackingNumberWithDate}
                className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all text-sm flex items-center gap-2"
              >
                <DocumentTextIcon className="w-4 h-4" />
                Generate Tracking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-slate-800 via-emerald-800 to-green-800 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-xl">Request Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all"
                >
                  <XMarkIcon className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 text-sm uppercase border-b pb-2">Resident Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-gray-500">Name</span>
                      <p className="font-medium text-gray-800">
                        {selectedRequest.resident && selectedRequest.resident.profile
                          ? `${selectedRequest.resident.profile.first_name || ''} ${selectedRequest.resident.profile.last_name || ''}`.trim()
                          : selectedRequest.user?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Resident ID</span>
                      <p className="font-mono text-sm text-emerald-600">{selectedRequest.resident?.residents_id || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 text-sm uppercase border-b pb-2">Request Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-gray-500">Asset</span>
                      <p className="font-medium text-gray-800">{selectedRequest.asset?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Request Date</span>
                      <p className="font-medium text-gray-800">{formatDate(selectedRequest.request_date)}</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Status</span>
                      <div className="mt-1">
                        {badge(
                          selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1),
                          getStatusColor(selectedRequest.status),
                          getStatusIcon(selectedRequest.status)
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-800 text-sm uppercase border-b pb-2">Payment Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-gray-500">Amount</span>
                      <p className="font-semibold text-emerald-600 text-lg">
                        ₱{selectedRequest.total_amount ? selectedRequest.total_amount.toFixed(2) : '0.00'}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Payment Status</span>
                      <p className="font-medium text-gray-800">{selectedRequest.payment_status || 'Unpaid'}</p>
                    </div>
                    {selectedRequest.receipt_number && (
                      <div>
                        <span className="text-xs text-gray-500">Receipt Number</span>
                        <p className="font-mono text-sm text-blue-600">{selectedRequest.receipt_number}</p>
                      </div>
                    )}
                  </div>
                </div>

                {selectedRequest.items && selectedRequest.items.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-800 text-sm uppercase border-b pb-2">Rental Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-gray-500">Duration</span>
                        <p className="font-medium text-gray-800">{selectedRequest.items[0].rental_duration_days || 1} days</p>
                      </div>
                      {selectedRequest.items[0].tracking_number && (
                        <div>
                          <span className="text-xs text-gray-500">Tracking Number</span>
                          <p className="font-mono text-sm text-purple-600">{selectedRequest.items[0].tracking_number}</p>
                        </div>
                      )}
                      {selectedRequest.items[0].return_date && (
                        <div>
                          <span className="text-xs text-gray-500">Return Date</span>
                          <p className="font-medium text-gray-800">{formatDate(selectedRequest.items[0].return_date)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all text-sm"
              >
                Close
              </button>
              {selectedRequest.receipt_number && (
                <button
                  onClick={() => handleAction('receipt', selectedRequest)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all text-sm flex items-center gap-2"
                >
                  <DocumentTextIcon className="w-4 h-4" />
                  Download Receipt
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InventoryAssets;
