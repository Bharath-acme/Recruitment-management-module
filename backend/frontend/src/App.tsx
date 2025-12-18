import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { RequisitionManager } from "./components/RequisitionManager";
import { CandidateManager } from "./components/CandidateManager";
import { InterviewManager } from "./components/InterviewManager";
import { OfferManager } from "./components/OfferManager";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { VendorManager } from "./components/VendorManager";
import { AdminPanel } from "./components/AdminPanel";
import OpenPositions from "./components/OpenPositions";
import { AuthProvider, useAuth } from "./components/AuthProvider";
import { LoginForm } from "./components/LoginForm";
import { Toaster } from "./components/ui/sonner";
import { Card } from "./components/ui/card";
import { Dashboard } from "./components/Dashboard";
import CandidateProfile from "./components/Candidate";
import RquisitionPage2 from "./components/Requisition2";
import HomePage from "./components/landingPage"
import { Menu, Bell, Building2, ChevronDown, X, Download, FileCheck } from "lucide-react"; 
import file from "./media/RSA.pdf";

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

export const Modal = ({ isOpen, onClose, title, children, downloadUrl, clientName }: any) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    if (!downloadUrl) return;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', (clientName || 'agreement') + '.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

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
          <Button variant="primary" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
};
import {InterviewDetail} from "./components/InterviewDetail";
import InvoiceManagement from "./components/invoices/InvoiceManagement";
import InvoiceDetails from "./components/invoices/InvoiceDetails";
import NotificationBell from "./components/Notifications";
import HeaderNavigation from "./components/ClientNavigation";
import EntityManagementPage from "./components/EntityManagement";
import { Dashboard2 } from "./components/Dashboard2";

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

const Button = ({ children, variant = "primary", size = "md", onClick, className = "" }: any) => {
  const baseStyle = "inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 active:scale-95";
  const variants: any = {
    primary: "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 hover:to-indigo-600",
    outline: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm",
    ghost: "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
    dark: "bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-900/20",
    light: "bg-white text-gray-700"
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


function AcmeTopBar({ selectedCompany, onCompanyChange, allCompanies, mainMargin, selectedCompanyObject, onPreviewAgreement } : any) {
    return (
        <div style={{ left: mainMargin }} className="fixed top-0 right-0 z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200 p-2 px-4">
            <div className="flex justify-end items-center">
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                    {selectedCompanyObject && (
                        <>
                            <Badge >
                                {selectedCompanyObject.client_type || 'N/A'}
                            </Badge>
                            <Button variant="outline" size="sm" onClick={() => onPreviewAgreement(selectedCompanyObject)}>
                                <FileCheck className="h-4 w-4 mr-2" />
                                Agreement
                            </Button>
                        </>
                    )}
                    <div className="w-full sm:w-48">
                        <Select 
                            icon={Building2}
                            placeholder="All Companies" 
                            options={allCompanies?.map((c:any) => c.name) || []} 
                            value={selectedCompany} 
                            onChange={onCompanyChange} 
                        />
                    </div>
                    <Button variant="light" className="px-2" onClick={() => {}}>
                        <Bell className="h-6 w-6" />
                    </Button>
                </div>
            </div>
        </div>
    );
}


function AppContent() {
  const { user, loading, userRole, allCompanies } = useAuth();
  const [selectedCompany, setSelectedCompany] = React.useState<string>("");
  const [selectedCountry, setSelectedCountry] = React.useState<string>("");
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [selectedClientForPreview, setSelectedClientForPreview] = React.useState<any>(null);

  const handlePreviewRAS = (client: any) => {
    setSelectedClientForPreview(client);
    setPreviewOpen(true);
  };

  const selectedCompanyObject = allCompanies.find(c => c.name === selectedCompany);


  const isAcmeUser = user?.company?.name?.toLowerCase() === "acme global hub pvt ltd";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="p-8">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading...</span>
          </div>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
    < Routes>
    <Route path="/" element={<HomePage/>} />
    <Route path="/login" element={<LoginForm/>} />
     {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
    </ Routes>)
  }


  const mainMargin = isAcmeUser 
        ? (isCollapsed ? 80 : 256) 
        : 0; 
    
  return (
    <div className="min-h-screen bg-slate-50">
      {isAcmeUser && <AcmeTopBar 
        selectedCompany={selectedCompany} 
        onCompanyChange={setSelectedCompany} 
        allCompanies={allCompanies} 
        mainMargin={mainMargin}
        selectedCompanyObject={selectedCompanyObject}
        onPreviewAgreement={handlePreviewRAS}
         />}
      {/* Left: Sidebar Navigation */}
       {isAcmeUser ? <aside
        style={{ background: "navy", color: "#fff", position: "fixed" }}
        className={`transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        } min-h-screen border-r flex flex-col`}
      >
        

        <Navigation
          selectedCompany={selectedCompany}
          selectedCountry={selectedCountry}
          onCompanyChange={setSelectedCompany}
          onCountryChange={setSelectedCountry}
          userRole={userRole}
          isCollapsed={isCollapsed} // 👈 Pass as prop
        />
      </aside> :
       <HeaderNavigation
        selectedCompany={selectedCompany}
          selectedCountry={selectedCountry}
          onCompanyChange={setSelectedCompany}
          onCountryChange={setSelectedCountry}
          userRole={userRole}
       />}
      {/* Right: Main Content */}
      <main 
      style={{ marginLeft: mainMargin, paddingTop: isAcmeUser ? '4.5rem' : '1rem' }} 
      className="flex-1 p-6 transition-all duration-300">
        <Routes>
          <Route path="/dashboard" element={<Dashboard2 selectedCompany={selectedCompany} selectedCountry={selectedCountry} onCompanyChange={setSelectedCompany} onCountryChange={setSelectedCountry} />} />
          <Route path="/requisitions" element={<RequisitionManager selectedCompany={selectedCompany} selectedCountry={selectedCountry} />} />
          <Route path="/candidates" element={<CandidateManager selectedCompany={selectedCompany} selectedCountry={selectedCountry} />} />
          <Route path="/interviews" element={<InterviewManager 
          selectedCompany={selectedCompany} selectedCountry={selectedCountry} 
          />} />
          <Route path="/offers" element={<OfferManager selectedCompany={selectedCompany} selectedCountry={selectedCountry} />} />
          <Route path="/analytics" element={<AnalyticsDashboard selectedCompany={selectedCompany} selectedCountry={selectedCountry} />} />
          <Route path="/vendors" element={<VendorManager selectedCompany={selectedCompany} selectedCountry={selectedCountry} />} />
          {userRole === "admin" && (
            <Route path="/admin" element={<AdminPanel />} />
          )}
          <Route path="/open-positions" element={<OpenPositions />} />
          <Route path="/candidates/:id" element={<CandidateProfile />} />
          <Route path="/requisitions/:id" element={<RquisitionPage2 />} />
          <Route path="/interviews/:id" element={<InterviewDetail />} />
          <Route path="/invoices" element={<InvoiceManagement/>}/>
          <Route path="/invoices/:id" element={<InvoiceDetails/>}/>
          <Route path="/entity" element={<EntityManagementPage/>}/>
          {/* Redirect any unknown route to dashboard */}
          <Route path="*" element={<Dashboard selectedCompany={selectedCompany} selectedCountry={selectedCountry} />}/>
        </Routes>
        <Toaster />
      </main>
      <Modal 
        isOpen={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        title={selectedClientForPreview ? `RAS Agreement - ${selectedClientForPreview.name}` : 'Agreement Preview'}
        downloadUrl={selectedClientForPreview?.company_agreement ? `/${selectedClientForPreview.company_agreement}` : file}
        clientName={selectedClientForPreview?.name}
      >
        <iframe
            src={selectedClientForPreview?.company_agreement ? `/${selectedClientForPreview.company_agreement}` : file}
            title="Agreement Preview"
            className="w-full h-[90vh]"
        />
      </Modal>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
