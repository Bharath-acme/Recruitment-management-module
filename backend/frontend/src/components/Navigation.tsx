import React from 'react';
import { useAuth } from './AuthProvider';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  Users,
  FileText,
  Calendar,
  HandHeart,
  BarChart3,
  Building2,
  Settings,
  LogOut,
  Globe,
} from 'lucide-react';
import logo from '../media/profile_logo.png';
import companyLogo from '../media/component 1.png';
import { Link, useLocation, useNavigate } from 'react-router-dom';   // ✅ Router imports

interface NavigationProps {
  selectedCompany: string;
  selectedCountry: string;
  onCompanyChange: (company: string) => void;
  onCountryChange: (country: string) => void;
  userRole: string | null;
}



export function Navigation({
  selectedCompany,
  selectedCountry,
  onCompanyChange,
  onCountryChange,
  userRole,
}: NavigationProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3, roles: ['admin', 'recruiter', 'hiring_manager', 'finance'] },
    { path: '/requisitions', label: 'Requisitions', icon: FileText, roles: ['admin', 'recruiter', 'hiring_manager'] },
    { path: '/candidates', label: 'Candidates', icon: Users, roles: ['admin', 'recruiter', 'hiring_manager', 'interviewer'] },
    { path: '/interviews', label: 'Interviews', icon: Calendar, roles: ['admin', 'recruiter', 'hiring_manager', 'interviewer'] },
    { path: '/offers', label: 'Offers', icon: HandHeart, roles: ['admin', 'recruiter', 'finance','hiring_manager'] },
    // { path: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'recruiter','hiring_manager'] },
    // { path: '/vendors', label: 'Vendors', icon: Building2, roles: ['admin', 'recruiter','hiring_manager'] },
    // { path: '/admin', label: 'Admin', icon: Settings, roles: ['admin','hiring_manager'] },
  ];
  const filteredNavItems = navItems.filter((item) => !userRole || item.roles.includes(userRole));

  // 3. Create the asynchronous handler for sign out and navigation
    const handleSignOut = async () => {
        await signOut(); // Clear token and local state
        navigate('/login'); // Redirect to the login page (or whichever page is appropriate)
    }
  return (
    <nav style={{height:'100vh'}} className="flex flex-col mt-5 h-full w-full border-r">
      {/* Logo */}
      <div className="flex items-center px-3 pt-3 pb-5 ">
        {/* <Users className="h-8 w-8 text-white-600" />
        <span className="ml-2 text-xl font-bold text-white-900">ACME Talent</span> */}
        <img src={companyLogo} alt="Company Logo" className="h-20 w-auto" />
      </div>

       {/* User Info at bottom */}
      
      <div className="px-6 pb-6  flex items-center space-x-3">
        <div className="flex-shrink-0 h-10 w-10">
          <img
            className="h-10 w-10 rounded-full object-cover"
            src={logo}
            alt={`${user?.name}'s profile photo`}
          />
        </div>
        <div className="text-sm flex-1 min-w-0">
          <p className="text-white-900 font-medium truncate">{user?.name}</p>
          <p className="text-white-500 capitalize truncate">{userRole?.replace('_', ' ')}</p>
          
        </div>
        
       
      </div>
      {/* Nav Items */}
      <div className="flex-1 flex flex-col space-y-1 px-2">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <Button
                variant={isActive ? 'navactive' : 'ghost'}
                size="lg"
                className="w-full flex items-center space-x-2 justify-start px-3 py-2 mb-1"
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Button>
            </Link>
          );
        })}
         <Button
         className="w-full flex items-center space-x-2 justify-start px-3 py-2 mb-1"
         variant="ghost" size="sm" onClick={handleSignOut}>
         <LogOut className="h-4 w-4" />  <span>Logout</span> 
        </Button>
      </div>
     
      
    </nav>
  );
}
