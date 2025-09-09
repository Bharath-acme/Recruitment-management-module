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
import { Link, useLocation } from 'react-router-dom';   // ✅ Router imports

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
  const location = useLocation();  // ✅ detect current URL path

  const companies = [
    'ACME Corporation',
    'Global Tech Solutions',
    'Emirates Industries',
    'Gulf Innovation Labs',
    'KSA Enterprise Group',
  ];

  const countries = ['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman'];

  const navItems = [
    { path: '/', label: 'Dashboard', icon: BarChart3, roles: ['admin', 'recruiter', 'hiring_manager', 'finance'] },
    { path: '/requisitions', label: 'Requisitions', icon: FileText, roles: ['admin', 'recruiter', 'hiring_manager'] },
    { path: '/candidates', label: 'Candidates', icon: Users, roles: ['admin', 'recruiter', 'hiring_manager', 'interviewer'] },
    { path: '/interviews', label: 'Interviews', icon: Calendar, roles: ['admin', 'recruiter', 'hiring_manager', 'interviewer'] },
    { path: '/offers', label: 'Offers', icon: HandHeart, roles: ['admin', 'recruiter', 'finance'] },
    { path: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['admin', 'recruiter'] },
    { path: '/vendors', label: 'Vendors', icon: Building2, roles: ['admin', 'recruiter'] },
    { path: '/admin', label: 'Admin', icon: Settings, roles: ['admin'] },
    // { path: '/open-positions', label: 'Open Positions', icon: Users, roles: ['admin', 'recruiter', 'hiring_manager', 'interviewer', 'finance'] },
  ];

  const filteredNavItems = navItems.filter((item) => !userRole || item.roles.includes(userRole));

  return (
    <nav className="bg-white border-b border-gray-200 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">TalentAcq</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path; // ✅ highlight active
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? 'default' : 'ghost'}
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right Side (company, country, user) */}
          <div className="flex items-center space-x-4">
            {/* Company Select */}
            <div className="flex items-center space-x-2">
              <Building2 className="h-4 w-4 text-gray-500" />
              <Select value={selectedCompany} onValueChange={onCompanyChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company} value={company}>
                      {company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Country Select */}
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-gray-500" />
              <Select value={selectedCountry} onValueChange={onCountryChange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-3">
              <div className="text-sm">
                <p className="text-gray-900 font-medium">{user?.name}</p>
                <p className="text-gray-500 capitalize">{userRole?.replace('_', ' ')}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden border-t border-gray-200">
        <div className="px-2 py-2 space-y-1 max-h-64 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className="w-full justify-start"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
