import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbares from '../../components/Navbares';
import Sidebares from '../../components/Sidebares';
import { useSidebar } from '../../contexts/SidebarContext';
import axios from '../../utils/axiosConfig';
import { FaUser, FaEnvelope, FaExclamationTriangle, FaChevronDown, FaChevronUp, FaPhoneAlt, FaListOl, FaChartLine, FaBullhorn, FaClipboardList, FaPhone } from 'react-icons/fa';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isCollapsed } = useSidebar();
  
  // State management
  const [announcements, setAnnouncements] = useState([]);
  const [hotlines, setHotlines] = useState([]);
  const [expandedHotline, setExpandedHotline] = useState(null);
  const [error, setError] = useState('');
  const [hotlineError, setHotlineError] = useState('');
  const [loading, setLoading] = useState(true);
  const [hotlineLoading, setHotlineLoading] = useState(true);
  
  // Programs state
  const [programs, setPrograms] = useState([]);
  const [programLoading, setProgramLoading] = useState(true);
  const [programError, setProgramError] = useState('');
  
  // Program modal state
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [showProgramModal, setShowProgramModal] = useState(false);
  
  // Welcome toast state
  const [showWelcome, setShowWelcome] = useState(false);
  
  // Tab state - initialize from URL parameter or default to 'announcements'
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = searchParams.get('tab');
    return tabParam && ['announcements', 'programs', 'hotlines'].includes(tabParam) ? tabParam : 'announcements';
  });

  // Helper: fallback for new hotline fields
  const getHotlineDetails = (hotline) => ({
    contactPerson: hotline.contactPerson || 'N/A',
    email: hotline.email || 'N/A',
    type: hotline.type || 'General',
    description: hotline.description || 'No description provided.',
    responseProcedure: hotline.responseProcedure || hotline.emergency_response_procedure || hotline.procedure || 'No emergency response procedure provided.',
    hotline: hotline.hotline,
    id: hotline.id,
  });

  // Welcome message effect
  useEffect(() => {
    if (window.location.state && window.location.state.profileCompleted) {
      setShowWelcome(true);
      window.history.replaceState({}, document.title);
    } else if (sessionStorage.getItem('showWelcomeDashboard') === '1') {
      setShowWelcome(true);
      sessionStorage.removeItem('showWelcomeDashboard');
    }
  }, []);

  // Update activeTab when URL parameter changes
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['announcements', 'programs', 'hotlines'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (showWelcome) {
      const timer = setTimeout(() => setShowWelcome(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome]);

  // OPTIMIZATION: Load all data in parallel instead of sequentially
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setHotlineLoading(true);
        setProgramLoading(true);
        
        // OPTIMIZATION: Fetch all data in parallel
        const [announcementsRes, hotlinesRes, programsRes] = await Promise.allSettled([
          axios.get('/announcements'),
          axios.get('/emergency-hotlines'),
          axios.get('/programs/residents')
        ]);
        
        // Handle announcements
        if (announcementsRes.status === 'fulfilled') {
          setAnnouncements(announcementsRes.value.data.announcements || []);
        } else {
          console.error('Error fetching announcements:', announcementsRes.reason);
          setError('❌ Failed to load announcements. Please login or try again later.');
        }
        
        // Handle hotlines
        if (hotlinesRes.status === 'fulfilled') {
          setHotlines(Array.isArray(hotlinesRes.value.data) ? hotlinesRes.value.data : []);
        } else {
          console.error('Error fetching hotlines:', hotlinesRes.reason);
          setHotlineError('❌ Failed to load emergency hotlines.');
        }
        
        // Handle programs - filter out full programs
        if (programsRes.status === 'fulfilled') {
          const allPrograms = programsRes.value.data || [];
          // Filter out programs that have reached their maximum beneficiary capacity
          const availablePrograms = allPrograms.filter(program => !program.is_full);
          setPrograms(availablePrograms);
        } else {
          console.error('Error fetching programs:', programsRes.reason);
          setProgramError('❌ Failed to load available programs.');
        }
        
      } catch (err) {
        console.error('Error in fetchAllData:', err);
      } finally {
        setLoading(false);
        setHotlineLoading(false);
        setProgramLoading(false);
      }
    };
    
    fetchAllData();
  }, []);

  const toggleExpand = (id) => {
    setExpandedHotline(expandedHotline === id ? null : id);
  };

  const openProgramModal = (program) => {
    setSelectedProgram(program);
    setShowProgramModal(true);
  };

  const closeProgramModal = () => {
    setShowProgramModal(false);
    setSelectedProgram(null);
  };

  const viewFullDetails = (program) => {
    console.log('Dashboard: Attempting navigation to program:', program);
    console.log('Dashboard: Navigation URL:', `/residents/modules/Programs/ProgramAnnouncements?program=${program.id}`);
    // Navigate to the program details page with the program ID as a query parameter
    navigate(`/residents/modules/Programs/ProgramAnnouncements?program=${program.id}`);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Update URL without causing a page reload
    navigate(`/residents/dashboard?tab=${tab}`, { replace: true });
  };

  return (
    <>
      <Navbares />
      <Sidebares />
      
      {/* Welcome Toast */}
      {showWelcome && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gradient-to-r from-green-400 via-emerald-400 to-blue-400 text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-4 border-2 border-green-200 animate-fadeInUp">
            <span className="text-2xl">🎉</span>
            <div>
              <div className="font-bold text-lg">Welcome! Your profile is now complete.</div>
              <div className="text-sm font-medium">You can now access all barangay services and dashboard features.</div>
            </div>
          </div>
        </div>
      )}

      <main className={`
        bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen pt-36 px-6 pb-16 font-sans relative overflow-hidden
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}
        ml-0
      `}>
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-1/2 -left-40 w-96 h-96 bg-gradient-to-br from-green-200 to-teal-200 rounded-full opacity-15 animate-pulse" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-gradient-to-br from-pink-200 to-rose-200 rounded-full opacity-10 animate-pulse" style={{animationDelay: '4s'}}></div>
        </div>
        
        <div className="w-full max-w-[98%] mx-auto space-y-10 relative z-10 px-2 lg:px-4">
          
          {/* Enhanced Header */}
          <div className="text-center space-y-4 mb-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full shadow-xl mb-4">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
            </div>
            <div className="flex items-center justify-center gap-4">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
                Resident Dashboard
              </h1>
              <button
                onClick={() => window.location.reload()}
                className="p-2 bg-green-100 hover:bg-green-200 rounded-full transition-colors duration-200"
                title="Refresh Dashboard"
              >
                <svg 
                  className="w-5 h-5 text-green-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Welcome, Barangay Mamatid Resident! Manage your profile, view programs, and stay updated with barangay services.
            </p>
          </div>


          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-8">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => handleTabChange('announcements')}
                className={`flex-1 px-6 py-4 font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === 'announcements'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-b-4 border-green-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-green-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/>
                </svg>
                Latest Announcements
              </button>
              <button
                onClick={() => handleTabChange('programs')}
                className={`flex-1 px-6 py-4 font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === 'programs'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-b-4 border-green-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-green-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                </svg>
                Available Programs
              </button>
              <button
                onClick={() => handleTabChange('hotlines')}
                className={`flex-1 px-6 py-4 font-semibold text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                  activeTab === 'hotlines'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-b-4 border-green-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-green-600'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                Emergency Hotlines
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'announcements' && (
            <section className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/>
                  </svg>
                  Latest Announcements
                </h3>
              </div>
              <div className="p-8">
                {loading ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-red-600">⚠️</span>
                      <span className="font-medium">{error}</span>
                    </div>
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">📭</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Announcements</h3>
                    <p className="text-gray-500">Check back later for updates from your barangay officials.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {announcements.map((announcement, index) => (
                      <article
                        key={announcement.id}
                        className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-green-300"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/>
                                </svg>
                              </div>
                              <div>
                                <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-700 transition-colors">
                                  {announcement.title}
                                </h3>
                                <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                    <span>{new Date(announcement.published_at || announcement.created_at).toLocaleDateString()}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                                    <span>{new Date(announcement.published_at || announcement.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-4 text-base">{announcement.content}</p>
                        {announcement.image && (
                          <div className="mb-4 overflow-hidden rounded-xl border border-gray-200 shadow-md">
                            <img
                              src={`http://localhost:8000/storage/${announcement.image}`}
                              alt="Announcement"
                              className="w-full max-h-[300px] object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                              </svg>
                            </div>
                            <div>
                              <span className="text-sm font-medium text-gray-600 block">Barangay Official</span>
                              <span className="text-xs text-gray-500">Government Authority</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                              Active
                            </span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {activeTab === 'programs' && (
            <section className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                  </svg>
                  Available Programs
                </h3>
              </div>
              <div className="p-8">
                  {programLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  ) : programError ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-red-600">⚠️</span>
                        <span className="font-medium">{programError}</span>
                      </div>
                    </div>
                  ) : programs.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📭</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No Programs Available</h3>
                      <p className="text-gray-500">All programs have reached their maximum number of beneficiaries and are no longer accepting new applications. Check back later for new programs and opportunities.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {programs.map((program) => (
                        <div key={program.id} className="group bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 hover:border-green-400 flex flex-col h-full">
                          {/* Header Section */}
                          <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50">
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-14 h-14 flex-shrink-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-base font-bold text-gray-800 group-hover:text-green-700 transition-colors leading-tight mb-2">
                                  {program.name}
                                </h3>
                                <div className="flex flex-wrap gap-1.5">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                    {program.status || 'ongoing'}
                                  </span>
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                                    {program.beneficiary_type || 'General'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Content Section */}
                          <div className="p-5 flex-grow flex flex-col">
                            <p className="text-gray-600 leading-relaxed mb-4 text-sm line-clamp-3 flex-grow">
                              {program.description}
                            </p>
                            
                            {/* Details Box */}
                            <div className="space-y-2.5 bg-gray-50 rounded-xl p-4 border border-gray-100">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 font-medium">Assistance Type:</span>
                                <span className="text-xs font-semibold text-gray-700 text-right max-w-[60%] truncate">{program.assistance_type || 'N/A'}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 font-medium">Amount:</span>
                                <span className="text-sm font-bold text-green-600">₱{program.amount ? program.amount.toLocaleString() : 'TBD'}</span>
                              </div>
                              {program.max_beneficiaries && (
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-500 font-medium">Available Slots:</span>
                                  <span className="text-xs font-semibold text-emerald-600">
                                    {program.max_beneficiaries - (program.current_beneficiaries || 0)} / {program.max_beneficiaries}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Footer Section */}
                          <div className="px-5 pb-5">
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                  </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs font-semibold text-gray-700 truncate">Barangay Program</div>
                                  <div className="text-xs text-gray-500 truncate">Government Initiative</div>
                                </div>
                              </div>
                              <button
                                onClick={() => openProgramModal(program)}
                                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-300 shadow-md hover:shadow-xl whitespace-nowrap flex-shrink-0 ml-2"
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            </section>
          )}

          {activeTab === 'hotlines' && (
            <section className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                  <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                    Emergency Hotlines
                  </h3>
                </div>
                <div className="p-8">
                  {hotlineLoading ? (
                    <div className="flex justify-center items-center py-12">
                      <div className="relative">
                        <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  ) : hotlineError ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-red-600">⚠️</span>
                        <span className="font-medium">{hotlineError}</span>
                      </div>
                    </div>
                  ) : hotlines.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">📞</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No Emergency Hotlines Available</h3>
                      <p className="text-gray-500">Check back later for emergency contact information.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {hotlines.map((hotline) => {
                        const details = getHotlineDetails(hotline);
                        const isExpanded = expandedHotline === hotline.id;
                        return (
                          <div
                            key={hotline.id}
                            className="bg-white border border-green-100 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden"
                          >
                            <div className="p-6">
                              <div className="flex flex-col gap-3">
                                <div className="flex items-center">
                                  <span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                                    <FaExclamationTriangle className="mr-2 text-green-500" />
                                    {details.type}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-3 text-xl font-bold text-green-700">
                                  <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                                    </svg>
                                  </div>
                                  {details.hotline}
                                </div>
                                
                                <div className="space-y-2 text-sm text-gray-700">
                                  <div className="flex items-center gap-2">
                                    <FaUser className="text-emerald-600" />
                                    <span className="font-semibold">Contact:</span> {details.contactPerson}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <FaEnvelope className="text-emerald-600" />
                                    <span className="font-semibold">Email:</span> {details.email}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Description:</span> {details.description}
                                  </div>
                                </div>
                                
                                <div>
                                  <button
                                    className="flex items-center gap-2 text-green-600 hover:underline text-sm font-semibold focus:outline-none"
                                    onClick={() => toggleExpand(hotline.id)}
                                    aria-expanded={isExpanded}
                                  >
                                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                                    {isExpanded ? 'Hide Procedure' : 'Show Procedure'}
                                  </button>
                                  <div
                                    className={`transition-all duration-300 overflow-hidden ${
                                      isExpanded ? 'max-h-96 opacity-100 mt-3' : 'max-h-0 opacity-0'
                                    }`}
                                  >
                                    {isExpanded && (
                                      <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-gray-700 text-sm">
                                        <span className="font-semibold block mb-2 text-green-700 flex items-center gap-2">
                                          <FaExclamationTriangle className="text-green-600" />
                                          Emergency Response Procedure
                                        </span>
                                        {Array.isArray(details.responseProcedure) ? (
                                          <ol className="list-decimal pl-4 space-y-1">
                                            {details.responseProcedure.map((step, idx) => (
                                              <li key={idx} className="flex items-start gap-2">
                                                <FaListOl className="mt-1 text-green-400" />
                                                <span>{step}</span>
                                              </li>
                                            ))}
                                          </ol>
                                        ) : (typeof details.responseProcedure === 'string' && details.responseProcedure.includes('\n')) ? (
                                          <ol className="list-decimal pl-4 space-y-1">
                                            {details.responseProcedure.split(/\r?\n|\d+\./).filter(Boolean).map((step, idx) => (
                                              <li key={idx} className="flex items-start gap-2">
                                                <FaListOl className="mt-1 text-green-400" />
                                                <span>{step.trim()}</span>
                                              </li>
                                            ))}
                                          </ol>
                                        ) : (
                                          <span>{details.responseProcedure}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
            </section>
          )}
        </div>

        {/* Program Details Modal */}
        {showProgramModal && selectedProgram && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <span className="text-white text-2xl">🎯</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedProgram.name}</h2>
                      <p className="text-green-100">Program Details</p>
                    </div>
                  </div>
                  <button
                    onClick={closeProgramModal}
                    className="text-white hover:text-green-200 transition-colors duration-200 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-white/30 rounded-full p-1"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Program Information */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Program Information</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedProgram.description}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Status:</span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          selectedProgram.status === 'ongoing' ? 'bg-green-100 text-green-800' : 
                          selectedProgram.status === 'complete' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedProgram.status || 'Active'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Beneficiary Type:</span>
                        <span className="text-gray-800">{selectedProgram.beneficiary_type || 'General'}</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Assistance Type:</span>
                        <span className="text-gray-800">{selectedProgram.assistance_type || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Amount:</span>
                        <span className="text-green-600 font-semibold">₱{selectedProgram.amount ? selectedProgram.amount.toLocaleString() : 'TBD'}</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-600 font-medium">Max Beneficiaries:</span>
                        <span className="text-gray-800">{selectedProgram.max_beneficiaries || 'Unlimited'}</span>
                      </div>
                      {selectedProgram.max_beneficiaries && (
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <span className="text-gray-600 font-medium">Current Beneficiaries:</span>
                          <span className="text-gray-800">{selectedProgram.current_beneficiaries || 0} / {selectedProgram.max_beneficiaries}</span>
                        </div>
                      )}
                      {selectedProgram.max_beneficiaries && (
                        <div className="flex items-center justify-between py-3 border-b border-gray-100">
                          <span className="text-gray-600 font-medium">Available Slots:</span>
                          <span className={`font-semibold ${selectedProgram.is_full ? 'text-red-600' : 'text-emerald-600'}`}>
                            {selectedProgram.max_beneficiaries - (selectedProgram.current_beneficiaries || 0)} remaining
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between py-3">
                        <span className="text-gray-600 font-medium">Duration:</span>
                        <span className="text-gray-800">
                          {selectedProgram.start_date && selectedProgram.end_date 
                            ? `${new Date(selectedProgram.start_date).toLocaleDateString()} - ${new Date(selectedProgram.end_date).toLocaleDateString()}`
                            : 'Ongoing'
                          }
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Program Highlights */}
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Program Highlights</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-lg">🎯</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Target Audience</p>
                          <p className="text-xs text-gray-600">{selectedProgram.beneficiary_type || 'All residents'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-lg">💰</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Financial Support</p>
                          <p className="text-xs text-gray-600">₱{selectedProgram.amount ? selectedProgram.amount.toLocaleString() : 'TBD'} per beneficiary</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-lg">📋</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Application Required</p>
                          <p className="text-xs text-gray-600">Complete the application form to apply</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 text-lg">📅</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Program Duration</p>
                          <p className="text-xs text-gray-600">
                            {selectedProgram.start_date && selectedProgram.end_date 
                              ? `${new Date(selectedProgram.start_date).toLocaleDateString()} - ${new Date(selectedProgram.end_date).toLocaleDateString()}`
                              : 'Ongoing program'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-100">
                  <button
                    onClick={closeProgramModal}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-300"
                  >
                    Close
                  </button>
                  {selectedProgram.is_full ? (
                    <div className="px-6 py-3 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">⚠️</span>
                        <span>This program has reached its maximum number of beneficiaries and is no longer accepting new applications.</span>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => viewFullDetails(selectedProgram)}
                      className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg"
                    >
                      View Full Details & Apply
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Dashboard;