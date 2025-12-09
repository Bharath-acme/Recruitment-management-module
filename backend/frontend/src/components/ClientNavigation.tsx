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
    LogOut,
} from "lucide-react";
import { Capitalize } from "../utils/Utils";
import logo from "../media/profile_logo.png";


// Assuming NavigationProps is defined in this file or imported
interface NavigationProps {
    selectedCompany: string;
    selectedCountry: string;
    onCompanyChange: (company: string) => void;
    onCountryChange: (country: string) => void;
    userRole: string | null;
    isCollapsed?: boolean;
} 

export default function HeaderNavigation({ userRole, isCollapsed = false }: NavigationProps) {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Define navigation items
    const navItems = [
        { path: "/dashboard", label: "Dashboard", icon: BarChart3, roles: ["admin", "recruiter", "hiring_manager", "finance"] },
        { path: "/requisitions", label: "Requisitions", icon: FileText, roles: ["admin", "recruiter", "hiring_manager"] },
        { path: "/candidates", label: "Candidates", icon: Users, roles: ["admin", "recruiter", "hiring_manager", "interviewer"] },
        { path: "/interviews", label: "Interviews", icon: Calendar, roles: ["admin", "recruiter", "hiring_manager", "interviewer"] },
        { path: "/invoices", label: "Invoice", icon: HandHeart, roles: ["admin", "recruiter", "finance", "hiring_manager"] },
    ];
    
    // Filter items based on user role
    const filteredNavItems = navItems.filter(
        (item) => !userRole || item.roles.includes(userRole)
    );

    // Handle sign out process
    const handleSignOut = async () => {
        console.log("Logout triggered. Clearing state and redirecting.");
        await signOut();
        navigate("/login");
    };
    
    // Use optional chaining for safety when accessing user data
    const companyName = user?.company?.name || 'Client Portal';
    const userName = Capitalize(user?.name || "");

    console.log('User in HeaderNavigation:', user); // 🚨 DEBUG: Check the structure here

    return (
        <header className="bg-blue-900 text-white flex justify-between items-center h-16 px-6 border-b">
            {/* Left: Logo/Brand */}
            <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold">{companyName}</h1>
            </div>

            {/* Middle: Navigation Links */}
            <nav className="flex space-x-4">
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
                      
            </nav>

            {/* Right: User/Logout */}
            <div className="flex items-center space-x-4">
                <div
                        className={`px-4 flex items-center  space-x-3 transition-all duration-300 ${
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
                {/* 🚨 Ensure no conflicting CSS (like z-index or absolute positioning) interferes with the click */}
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSignOut} 
                    className="text-white hover:bg-white/10"
                >
                    <LogOut className="h-4 w-4" />
                </Button>
            </div>
        </header>
    );
}