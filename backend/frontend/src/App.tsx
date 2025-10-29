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
import HomePage from "./components/landingPage";
import { Menu } from "lucide-react"; 
import {InterviewDetail} from "./components/InterviewDetail";



function AppContent() {
  const { user, loading, userRole } = useAuth();
  const [selectedCompany, setSelectedCompany] = React.useState<string>("");
  const [selectedCountry, setSelectedCountry] = React.useState<string>("");
  const [isCollapsed, setIsCollapsed] = React.useState(false);

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

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left: Sidebar Navigation */}
       <aside
        style={{ background: "navy", color: "#fff", position: "fixed" }}
        className={`transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-64"
        } min-h-screen border-r flex flex-col`}
      >
        {/* Top menu toggle */}
        <div className={`relative  w-6 left-5 top-2 `}>
          <button
            className="text-white hover:text-gray-300"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        <Navigation
          selectedCompany={selectedCompany}
          selectedCountry={selectedCountry}
          onCompanyChange={setSelectedCompany}
          onCountryChange={setSelectedCountry}
          userRole={userRole}
          isCollapsed={isCollapsed} // 👈 Pass as prop
        />
      </aside>

      {/* Right: Main Content */}
      <main style={{ marginLeft: isCollapsed ? 60 : 200 }} className="flex-1 p-6 transition-all duration-300">
        <Routes>
          <Route path="/dashboard" element={<Dashboard selectedCompany={selectedCompany} selectedCountry={selectedCountry}  />} />
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
          {/* Redirect any unknown route to dashboard */}
          <Route path="*" element={<Dashboard selectedCompany={selectedCompany} selectedCountry={selectedCountry} />}/>
        </Routes>
        <Toaster />
      </main>
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