import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { Building2, Users, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LoginForm() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: '',
    company: '',
    country: ''
  });

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    const { data, error } = await signIn(loginData.email, loginData.password);
    if (error) throw new Error(error);
    toast.success("Login successful!");
    navigate("/dashboard");
  } catch (error: any) {
    toast.error(error.message || "Failed to sign in");
  } finally {
    setLoading(false);
  }
};


const handleSignup = async (e: React.FormEvent) => {
  e.preventDefault();
  if (signupData.password !== signupData.confirmPassword) {
    toast.error("Passwords do not match");
    return;
  }

  setLoading(true);
  try {
    const res = await fetch("http://127.0.0.1:8000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: signupData.email,
        password: signupData.password,
        confirm_password:signupData.confirmPassword,
        name: signupData.name,
        role: signupData.role,
        company: signupData.company,
        country: signupData.country,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Signup failed");
    }

    const data = await res.json();
    toast.success(data.message);
    navigate("/dashboard");
    setSignupData({
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      role: "",
      company: "",
      country: "",
    });
  } catch (error: any) {
    toast.error(error.message);
  } finally {
    setLoading(false);
  }
};



  const roles = [
    { value: 'admin', label: 'HR Admin / TA Lead' },
    { value: 'recruiter', label: 'Recruiter (TA Partner)' },
    { value: 'hiring_manager', label: 'Hiring Manager' },
    { value: 'interviewer', label: 'Interviewer / Panel' },
    { value: 'finance', label: 'Finance Controller' },
    { value: 'agency', label: 'Agency Partner' }
  ];

  const companies = [
    'ACME Corporation',
    'Global Tech Solutions',
    'Emirates Industries',
    'Gulf Innovation Labs',
    'KSA Enterprise Group'
  ];

  const countries = [
    'UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-xl">
              <Users className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Talent Acquisition System</h1>
          <p className="text-gray-600">Enterprise Recruitment Management</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl text-center">Welcome</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="your.email@company.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="Enter your password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        placeholder="John Smith"
                        value={signupData.name}
                        onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="john.smith@company.com"
                        value={signupData.email}
                        onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-role">Role</Label>
                      <Select value={signupData.role} onValueChange={(value:any) => setSignupData({ ...signupData, role: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-company">Company</Label>
                      <Select value={signupData.company} onValueChange={(value:any) => setSignupData({ ...signupData, company: value })}>
                        <SelectTrigger>
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

                    <div className="space-y-2">
                      <Label htmlFor="signup-country">Country</Label>
                      <Select value={signupData.country} onValueChange={(value:any) => setSignupData({ ...signupData, country: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
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

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password"
                        value={signupData.password}
                        onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirm Password</Label>
                      <Input
                        id="signup-confirm"
                        type="password"
                        placeholder="Confirm your password"
                        value={signupData.confirmPassword}
                        onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Demo credentials available upon request</p>
        </div>
      </div>
    </div>
  );
}