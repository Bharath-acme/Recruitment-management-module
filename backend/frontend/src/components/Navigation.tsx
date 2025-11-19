import React from "react";
import { useAuth } from "./AuthProvider";
import { Button } from "./ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  FileText,
  Calendar,
  HandHeart,
  BarChart3,
  Building2,
  Settings,
  LogOut,
} from "lucide-react";
import logo from "../media/profile_logo.png";
import companyLogo from "../media/acme_logo.png";
import { Capitalize } from "../utils/Utils";
import acmelogo from "../media/acmelogo.png";

interface NavigationProps {
  selectedCompany: string;
  selectedCountry: string;
  onCompanyChange: (company: string) => void;
  onCountryChange: (country: string) => void;
  userRole: string | null;
  isCollapsed?: boolean;
} 

export function Navigation({
  selectedCompany,
  selectedCountry,
  onCompanyChange,
  onCountryChange,
  userRole,
  isCollapsed = false,
}: NavigationProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: BarChart3, roles: ["admin", "recruiter", "hiring_manager", "finance"] },
    { path: "/requisitions", label: "Requisitions", icon: FileText, roles: ["admin", "recruiter", "hiring_manager"] },
    { path: "/candidates", label: "Candidates", icon: Users, roles: ["admin", "recruiter", "hiring_manager", "interviewer"] },
    { path: "/interviews", label: "Interviews", icon: Calendar, roles: ["admin", "recruiter", "hiring_manager", "interviewer"] },
    // { path: "/offers", label: "Offers", icon: HandHeart, roles: ["admin", "recruiter", "finance", "hiring_manager"] },
    // { path: "/analytics", label: "Analytics", icon: BarChart3, roles: ["admin", "recruiter", "hiring_manager"] },
    // { path: "/vendors", label: "Vendors", icon: Building2, roles: ["admin", "recruiter", "hiring_manager"] },
    // { path: "/team", label: "Team", icon: Settings, roles: ["admin", "hiring_manager"] },
     { path: "/invoices", label: "Invoice", icon: HandHeart, roles: ["admin", "recruiter", "finance", "hiring_manager"] },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !userRole || item.roles.includes(userRole)
  );

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  // Adjust icon size dynamically
  const iconSize = isCollapsed ? "h-2 w-2" : "h-10 w-10";

  return (
    <nav
      className={`flex flex-col mt-2 h-full w-full border-r transition-all duration-300 ${
        isCollapsed ? "items-center" : ""
      }`}
    >
      {/* Company Logo */}
      <div
        className={`flex px-3 pt-3 pb-5 transition-all duration-300`}
      >
        <img
          src={isCollapsed ? acmelogo :companyLogo}
          alt="Company Logo"
          className={`transition-all duration-300 ${
            isCollapsed ? "h-12" : "h-20"
          } w-auto`}
        />
      </div>

         {/* User Info Section */}
      <div
        className={`px-4 pb-6 flex items-center  space-x-3 transition-all duration-300 ${
          isCollapsed ? "flex-col space-x-0" : "px-6"
        }`}
      >
        <img
          className={`rounded-full object-cover transition-all duration-300 ${
            isCollapsed ? "h-10 w-10" : "h-10 w-10"
          }`}
          src={logo}
          alt={`${user?.name}'s profile photo`}
        />
        {!isCollapsed && (
          <div className="text-sm flex-1 min-w-0">
            <p className="font-medium truncate">{Capitalize(user?.name || "")}</p>
            <p className="capitalize truncate">{userRole?.replace("_", " ")}</p>
          </div>
        )}
      </div>

      {/* Navigation Items */}
      <div className="flex-1 flex flex-col space-y-1 px-2 w-full">

      


        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive ? "navactive" : "ghost"}
                size="lg"
                className={`w-full flex items-center justify-start px-3 py-3 mb-1 space-x-2 transition-all duration-300 ${
                  isCollapsed ? "justify-center px-0" : "px-3"
                }`}
              >
                <Icon size={30}  />
                {!isCollapsed && (
                  <span className="text-[15px]">{item.label}</span>
                )}
              </Button>
            </Link>
          );
        })}

        {/* Logout Button */}
        <Button
          className={` absolute bottom-10 flex items-center justify-start px-3 py-3 mb-1 space-x-2 transition-all duration-300 ${
            isCollapsed ? "justify-center px-0 w-[85%]" : " w-[95%] px-3"
          }`}
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
        >
          <LogOut className={`${iconSize} shrink-0`} />
          {!isCollapsed && <span className="text-[15px]">Logout</span>}
        </Button>
      </div>

     
    </nav>
  );
}
