import React, { useState, useEffect, createContext, useContext, use } from 'react';
import { 
  Users, 
  FileText, 
  Calendar, 
  HandHeart, 
  Clock, 
  Target,
  Briefcase,
  Bell,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  CheckCircle2,
  Building2,
  FileCheck,
  X,
  MapPin,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import file from '../media/RSA.pdf'
// import { NotificationService, Notification } from '../utils/Utils';

// --- !!! IMPORTANT: UNCOMMENT THE LINE BELOW IN YOUR VITE PROJECT !!! ---
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const API_BASE_URL = 'http://localhost:3000/api'; // Hardcoded for preview environment

// Mock Auth Provider for Preview
//const AuthContext = createContext(null);
//const useAuth = () => {
//  return { 
//    user: { id: 1, name: "Sarah Jenkins", role: "Senior Recruiter" },
//    allCompanies: [{ id: 1, name: "Global Tech" }]
//  };
//};
// Mock Notification Service for Preview
class NotificationService {
  constructor(userId, callback) {
    setTimeout(() => callback({ title: "System", message: "Dashboard connected successfully.", time: new Date() }), 1000);
  }
  close() {}
}
// --------------------------------------------------------------------------------------------------

// --- TYPES ---
interface DashboardProps {
  selectedCompany: string;
  selectedCountry: string;
}

interface RequisitionItem {
  id: string;
  title: string;
  // department: string; // Optional in your code, assuming needed for UI
  status: string;
  daysOpen: number;
  applicants: number;
  stage: string;
  priority: 'high' | 'medium' | 'low';
  location?: string; // Added for UI
  department?: string; // Added for UI
  created_date?: string;
}

// --- UI COMPONENTS ---

const Card = ({ children, className = "", onClick, style }: any) => (
  <div 
    onClick={onClick}
    style={style}
    className={`bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }: any) => (
  <div className={`px-6 py-5 border-b border-gray-100/50 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }: any) => (
  <h3 className={`text-lg font-bold text-gray-800 ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }: any) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = "default", className = "" }: any) => {
  const variants: any = {
    default: "bg-gray-100 text-gray-600",
    success: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    warning: "bg-amber-50 text-amber-600 border border-amber-100",
    danger: "bg-rose-50 text-rose-600 border border-rose-100",
    blue: "bg-blue-50 text-blue-600 border border-blue-100",
    active: "bg-green-100 text-green-800", // Mapped from your code
    "pending approval": "bg-yellow-100 text-yellow-800",
    "on hold": "bg-gray-100 text-gray-800",
    closed: "bg-blue-100 text-blue-800",
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800",
    outline: "bg-transparent border border-gray-200 text-gray-500"
  };
  // Fallback if variant key doesn't strictly match
  const selectedVariant = variants[variant?.toLowerCase()] || variants[variant] || variants.default;
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${selectedVariant} ${className}`}>
      {children}
    </span>
  );
};

const Button = ({ children, variant = "primary", size = "md", onClick, className = "" }: any) => {
  const baseStyle = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-95";
  const variants: any = {
    primary: "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:to-indigo-600",
    outline: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm",
    ghost: "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
    dark: "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20"
  };
  const sizes: any = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
};

const Select = ({ value, onChange, options, icon: Icon, placeholder }: any) => (
  <div className="relative group w-full">
    {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-hover:text-indigo-500 transition-colors" />}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`appearance-none w-full bg-white border border-gray-200 text-gray-700 py-2.5 ${Icon ? 'pl-10' : 'pl-4'} pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer hover:border-gray-300 font-medium text-sm shadow-sm`}
    >
      <option value="">{placeholder}</option>
      {options.map((opt: string) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none group-hover:text-gray-600 transition-colors" />
  </div>
);

// --- MODAL COMPONENT ---
export const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 ring-1 ring-white/20">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto p-0 bg-gray-50 flex-1">
          {children}
        </div>
        <div className="p-6 border-t border-gray-100 bg-white rounded-b-2xl flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button variant="primary" onClick={() => { alert('Downloading Agreement...'); onClose(); }}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- DASHBOARD COMPONENT ---

export function Dashboard2({ selectedCompany, selectedCountry }: DashboardProps) {
  const { user, allCompanies } = useAuth();
  // const navigate = useNavigate(); // Uncomment in production

  // State
  const [loading, setLoading] = useState(false);
  const [dashCount, setDashCount] = useState<any>({});
  const [recentRequisitions, setRecentRequisitions] = useState<RequisitionItem[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  
  // UI State
  const [activeTab, setActiveTab] = useState('overview');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [companies, setCompanies] = useState<any[]>([]);

  useEffect(() => {
    dashboardData();
    // loadDemoData();
    
  }, [selectedCompany, selectedCountry]);

  useEffect(() => {
    loadCompanies();
  }, []);
  // Simulate API Fetch
 const dashboardData = async ()=>{
      setLoading(true);
      try{
        const response = await fetch(`${API_BASE_URL}/summary`,
        { method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
        );
        if(!response.ok){
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        console.log('count',data);
        setDashCount(data.summary);  
        setRecentRequisitions(data.recent_requisitions);
        setUpcomingInterviews(data.upcoming_interviews);
        setPendingApprovals(data.pending_approvals);
        console.log('Dashboard data:', data);
        // Process and set metrics
      }
      catch(error){
        console.error('Error fetching dashboard data:', error);
      }
    finally{
        setLoading(false);
    }}

      const token = localStorage.getItem("token");


  const loadCompanies = async () => {
    try { 
      const response = await fetch(`${API_BASE_URL}/companies`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
           Authorization: `Bearer ${token}`,
        },
      });
      if(!response.ok){
          throw new Error('Failed to fetch companies data');
        }
      const data = await response.json();
      console.log('Companies data:', data);
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);

  }};


  const loadDemoData = () => {
    // Populate with demo data for UI Preview if API is not available
    setDashCount({
      open_positions: 14,
      active_candidates: 128,
      scheduled_interviews: 6,
      pending_offers: 5,
      fy_completed: 42,
    });

    // setUpcomingInterviews([
    //   { id: 1, candidateName: 'Ahmed Al-Rashid', position: 'Senior Software Engineer', time: '10:00 AM', date: 'Today', interviewer: 'Sarah Johnson', type: 'Technical' },
    //   { id: 2, candidateName: 'Fatima Al-Zahra', position: 'Product Manager', time: '2:00 PM', date: 'Today', interviewer: 'Mike Chen', type: 'Behavioral' },
    //   { id: 3, candidateName: 'Omar Hassan', position: 'UI/UX Designer', time: '9:00 AM', date: 'Tomorrow', interviewer: 'Lisa Park', type: 'Portfolio Review' }
    // ]);

    
  };

  const handleCardClick = (route: string) => {
    // navigate(route);
    console.log('Navigating to:', route);
  };

  const handlePreviewRAS = (client: any) => {
    setSelectedClient(client);
    setPreviewOpen(true);
  };

  // Mapped Metrics from State
  const metrics = [
    {
      title: 'Open Positions',
      value: dashCount?.open_positions || 0,
      change: '+2',
      changeType: 'increase',
      icon: Briefcase,
      route: "/requisitions",
      gradient: 'from-blue-400 to-indigo-500',
      shadow: 'shadow-blue-500/20'
    },
    {
      title: 'Active Candidates',
      value: dashCount?.active_candidates || 0,
      change: '+12%',
      changeType: 'increase',
      icon: Users,
      route: "/candidates",
      gradient: 'from-violet-400 to-purple-500',
      shadow: 'shadow-violet-500/20'
    },
    {
      title: 'Scheduled Interviews',
      value: dashCount?.scheduled_interviews || 0,
      change: 'Today',
      changeType: 'neutral',
      icon: Calendar,
      route: "/interviews",
      gradient: 'from-pink-400 to-rose-500',
      shadow: 'shadow-pink-500/20'
    },
    {
      title: 'Pending Offers',
      value: dashCount?.pending_offers || 8, // Fallback to 8 if not in API response
      change: '-1',
      changeType: 'decrease',
      icon: Clock,
      route: "/offers",
      gradient: 'from-amber-400 to-orange-500',
      shadow: 'shadow-amber-500/20'
    },
    {
      title: 'FY Closed Positions',
      value: dashCount?.fy_completed || 42, // Fallback
      change: '+15%',
      changeType: 'increase',
      icon: CheckCircle2,
      route: "/analytics",
      gradient: 'from-emerald-400 to-teal-500',
      shadow: 'shadow-emerald-500/20'
    }
  ];

  // Mock Clients for the Client Tab (Can be moved to API later)
  const MOCK_CLIENTS = [
    { id: 1, name: "TechNova Systems", type: "Technology", ras_status: "Active", location: "New York, USA" },
    { id: 2, name: "MediCare Plus", type: "Healthcare", ras_status: "Pending Renewal", location: "London, UK" },
    { id: 3, name: "Global Logistics Co", type: "Supply Chain", ras_status: "Active", location: "Dubai, UAE" },
    { id: 4, name: "FinServe Capital", type: "Finance", ras_status: "Draft", location: "Singapore" }
  ];

  if (loading && !dashCount.open_positions) {
     return (
        <div className="h-96 flex flex-col items-center justify-center animate-pulse">
           <div className="h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
           <p className="text-gray-400 font-medium">Loading Dashboard Data...</p>
        </div>
     )
  }

  return (
    <div className="p-8 space-y-10 pb-10 min-h-screen bg-[#F8FAFC]">
      
      {/* Header & Filter Bar */}
      <div className="flex flex-col xl:flex-row justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Executive Overview</h1>
          <p className="text-gray-500 mt-2 font-medium">
             Welcome back, {user?.name}. Here's your recruitment overview.
          </p>
        </div>
        
        {/* Dynamic Filters Area */}
         {/* <div className="flex flex-col sm:flex-row gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
           <div className="w-full sm:w-48">
              <Select 
                 icon={Building2}
                 placeholder="All Companies" 
                 options={allCompanies?.map((c:any) => c.name) || ["Global Tech"]} 
                 value={selectedCompany} 
                 onChange={() => {}} 
              />
           </div>
           <div className="w-full sm:w-48">
              <Select 
                 icon={MapPin}
                 placeholder="All Locations" 
                 options={["New York", "London", "Dubai", "Remote"]} 
                 value={selectedCountry} 
                 onChange={() => {}} 
              />
           </div>
           <Button variant="dark" className="px-6" onClick={() => {}}>
              <Bell className="h-4 w-4 mr-2" />
           </Button>
        </div>  */}
      </div>

      {/* Main Tabs */}
      <div className="flex space-x-1 bg-gray-100/50 p-1 rounded-xl w-fit">
        {['overview', 'clients'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 capitalize ${
              activeTab === tab 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
          
          {/* Metrics Grid - 5 Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <div 
                   key={index} 
                   onClick={() => handleCardClick(metric.route)}
                   className={`relative overflow-hidden bg-white rounded-2xl p-5 shadow-sm border border-gray-100 group hover:-translate-y-1 transition-all duration-300 cursor-pointer`}
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${metric.gradient} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-110`}></div>
                  
                  <div className="flex justify-between items-start relative z-10 h-full">
                    <div className="flex flex-col justify-between h-full">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{metric.title}</p>
                      <div className="mt-2">
                        <h3 className="text-2xl font-bold text-gray-900">{metric.value}</h3>
                        <div className="flex items-center mt-1 text-xs font-medium">
                            {metric.changeType === 'decrease' ? <ArrowDownRight className="h-3 w-3 mr-1 text-rose-500" /> : <ArrowUpRight className="h-3 w-3 mr-1 text-emerald-600" />}
                            <span className={metric.changeType === 'decrease' ? "text-rose-500" : "text-emerald-600"}>{metric.change}</span>
                            <span className="text-gray-400 ml-1 font-normal">vs last month</span>
                        </div>
                      </div>
                    </div>
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${metric.gradient} text-white ${metric.shadow}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Requisitions Table */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex justify-between items-center bg-gray-50/30">
                <CardTitle>Live Requisitions</CardTitle>
                <Button variant="ghost" size="sm" className="text-indigo-600">View All</Button>
              </CardHeader>
              <div className="divide-y divide-gray-100">
                {recentRequisitions.length > 0 ? recentRequisitions.map((req) => (
                  <div key={req.id} className="p-5 hover:bg-indigo-50/30 transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer border-l-2 border-transparent hover:border-indigo-500">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-sm shadow-inner">
                        {(req.department || req.title).substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{req.title || req.position}</h4>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                           <span className="flex items-center"><Building2 className="h-3 w-3 mr-1" /> {req.department || 'General'}</span>
                           <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                           <span className="flex items-center"><MapPin className="h-3 w-3 mr-1" /> {req.location || 'Remote'}</span>
                           <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                           <span>{req.daysOpen} days open</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                       <div className="text-right hidden sm:block">
                          <p className="text-xs font-semibold text-gray-900">{req.applicants || req.applications_count} Applicants</p>
                          <div className="w-24 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                             <div className="h-full bg-indigo-500 rounded-full" style={{width: '60%'}}></div>
                          </div>
                       </div>
                       <Badge variant={req.status}>{req.status}</Badge>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center text-gray-400">
                    <Filter className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p>No jobs found.</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Right: Interviews & Goal */}
            <div className="space-y-6">
              {/* <Card className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-none shadow-xl">
                <div className="p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                     <Target className="h-40 w-40 transform rotate-12" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-lg font-bold text-white mb-1">Quarterly Goal</h3>
                    <p className="text-indigo-200 text-sm mb-6">Revenue Target Progress</p>
                    
                    <div className="text-4xl font-bold mb-2 tracking-tight">$850k</div>
                    <div className="flex justify-between text-xs text-indigo-300 mb-2">
                       <span>Achieved</span>
                       <span>Target: $1.2M</span>
                    </div>
                    <div className="h-3 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-white/10">
                       <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 w-[70%] shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                    </div>
                  </div>
                </div>
              </Card> */}

              <Card>
                <CardHeader>
                   <CardTitle>Upcoming Interviews</CardTitle>
                </CardHeader>
                <div className="p-6 pt-2 space-y-6">
                   {upcomingInterviews.map((int: any, i: number) => (
                      <div key={int.id} className="flex gap-4 group">
                         <div className="flex flex-col items-center">
                            <div className={`h-2 w-2 rounded-full ${i===0 ? 'bg-emerald-500' : 'bg-gray-300'} ring-4 ring-white`}></div>
                            <div className="w-0.5 h-full bg-gray-100 my-1"></div>
                         </div>
                         <div className="pb-4">
                            <p className="text-xs font-bold text-gray-400 mb-0.5">{int.time} - {int.date}</p>
                            <h4 className="text-sm font-bold text-gray-900">{int.candidateName}</h4>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <span>{int.position}</span>
                                <span>•</span>
                                <span>{int.type}</span>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        /* CLIENTS VIEW */
        <div className="animate-in slide-in-from-right-4 duration-300">
           <Card>
              <CardHeader className="flex justify-between items-center">
                 <div>
                    <CardTitle>Client Agreements</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Manage RAS documents and status</p>
                 </div>
                 {/* <Button variant="dark">
                    <Building2 className="h-4 w-4 mr-2" />
                    Add Partner
                 </Button> */}
              </CardHeader>
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                          <th className="px-6 py-4 font-semibold">Client Entity</th>
                          <th className="px-6 py-4 font-semibold">Location</th>
                          <th className="px-6 py-4 font-semibold">Status</th>
                          <th className="px-6 py-4 font-semibold">Agreement</th>
                          <th className="px-6 py-4 font-semibold text-right"></th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                       {MOCK_CLIENTS.map((client) => (
                          <tr key={client.id} className="hover:bg-gray-50/50 transition-colors group">
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                   <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-200">
                                      {client.name.charAt(0)}
                                   </div>
                                   <div>
                                      <div className="font-bold text-gray-900">{client.name}</div>
                                      <div className="text-xs text-gray-500">{client.type}</div>
                                   </div>
                                </div>
                             </td>
                             <td className="px-6 py-4 text-sm font-medium text-gray-600 flex items-center">
                                <MapPin className="h-3 w-3 mr-2 text-gray-400" />
                                {client.location}
                             </td>
                             <td className="px-6 py-4">
                                <Badge variant={client.ras_status === 'Active' ? 'success' : 'warning'}>
                                   {client.ras_status}
                                </Badge>
                             </td>
                             <td className="px-6 py-4">
                                <button 
                                   onClick={() => handlePreviewRAS(client)}
                                   className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg w-fit"
                                >
                                   <FileCheck className="h-4 w-4 mr-1.5" />
                                   Review RAS
                                </button>
                             </td>
                             <td className="px-6 py-4 text-right">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                                   <MoreHorizontal className="h-4 w-4" />
                                </Button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </Card>
        </div>
      )}

      {/* Notifications Panel */}
      {/* <NotificationsPanel userId={Number(user?.id || 0)} /> */}

      {/* RAS PREVIEW MODAL */}
      <Modal 
        isOpen={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        title={selectedClient ? `RAS Agreement - ${selectedClient.name}` : 'Agreement Preview'}
      >

        <iframe
              src={file}
              title="Resume Preview"
              className="w-full h-[90vh]"
            />
        {/* <div className="bg-white  max-w-4xl mx-auto shadow-sm h-[90vh] border border-gray-100 overflow-hidden  relative">
           <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
              <FileCheck className="h-48 w-48" />
           </div>

           <div className="flex justify-between items-start mb-12 border-b-2 border-gray-900 pb-8">
              <div>
                 <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">SERVICE AGREEMENT</h1>
                 <p className="text-gray-500 uppercase tracking-widest text-xs font-semibold">Ref: RAS-{new Date().getFullYear()}-{selectedClient?.id}005</p>
              </div>
              <div className="text-right">
                 <div className="text-xl font-bold text-indigo-900">RecruitPro</div>
                 <div className="text-xs text-gray-400">Excellence in Hiring</div>
              </div>
           </div>

           <div className="space-y-8 font-serif text-gray-800 leading-relaxed max-w-2xl mx-auto">
              <p className="text-lg">
                 <strong>THIS AGREEMENT</strong> is made effective as of {new Date().toLocaleDateString()} between:
              </p>
              
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 text-sm grid grid-cols-2 gap-8">
                  <div>
                      <h5 className="font-bold text-gray-900 uppercase text-xs mb-2">Provider</h5>
                      <p>RecruitPro Inc.</p>
                      <p>123 Business Avenue</p>
                      <p>New York, NY 10001</p>
                  </div>
                  <div>
                      <h5 className="font-bold text-gray-900 uppercase text-xs mb-2">Client</h5>
                      <p>{selectedClient?.name}</p>
                      <p>{selectedClient?.location}</p>
                  </div>
              </div>

              <div>
                  <h4 className="font-bold uppercase text-sm border-b border-gray-200 pb-2 mb-3">1. Engagement</h4>
                  <p className="text-sm text-gray-600">
                     Client hereby engages Agency to provide recruitment and staffing services on a non-exclusive basis. 
                     Agency shall use commercially reasonable efforts to present qualified candidates.
                  </p>
              </div>

              <div>
                  <h4 className="font-bold uppercase text-sm border-b border-gray-200 pb-2 mb-3">2. Compensation</h4>
                  <p className="text-sm text-gray-600">
                     For each Candidate employed by Client, a placement fee of <strong>20%</strong> of the Candidate's 
                     First Year Annual Base Salary shall be payable.
                  </p>
              </div>
              
              <div className="pt-12 flex justify-between gap-12">
                 <div className="flex-1">
                    <div className="h-16 border-b border-gray-300 mb-2 relative">
                        <span className="absolute bottom-2 font-handwriting text-2xl text-blue-800">Sarah Jenkins</span>
                    </div>
                    <p className="text-xs uppercase font-bold text-gray-400">RecruitPro Inc.</p>
                 </div>
                 <div className="flex-1">
                    <div className="h-16 border-b border-gray-300 mb-2"></div>
                    <p className="text-xs uppercase font-bold text-gray-400">{selectedClient?.name}</p>
                 </div>
              </div>
           </div>
          
        </div> */}
      </Modal>
    </div>
  );
}

// Notifications Panel Component
const NotificationsPanel: React.FC<{ userId: number }> = ({ userId }) => {
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // In production, use your actual NotificationService
    const service = new NotificationService(userId, (notif: any) => {
      setNotifications((prev) => [notif, ...prev]);
    });
    return () => service.close();
  }, [userId]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((notif, idx) => (
        <div key={idx} className="bg-white border-l-4 border-indigo-500 shadow-lg rounded-r-lg p-4 w-80 animate-in slide-in-from-right duration-300 flex items-start gap-3">
          <Bell className="h-5 w-5 text-indigo-500 mt-0.5" />
          <div>
            <strong className="block text-sm font-semibold text-gray-900">{notif.title}</strong>
            <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
            {notif.time && <small className="text-[10px] text-gray-400 mt-2 block">{new Date(notif.time).toLocaleTimeString()}</small>}
          </div>
        </div>
      ))}
    </div>
  );
};