import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../media/thumbnail_image001.png';
import login_image from '../media/login_img2.png';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function LoginForm() {
  const { signIn } = useAuth();
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
    companyName: '',
    companySize: '',
    companyDescription: '',
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
      const res = await fetch(`${API_BASE_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupData.email,
          password: signupData.password,
          confirm_password: signupData.confirmPassword,
          name: signupData.name,
          role: signupData.role,
          company_name: signupData.companyName,
          company_size: signupData.companySize,
          company_description: signupData.companyDescription,
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
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { value: 'admin', label: 'Manager' },
    { value: 'recruiter', label: 'Recruiter (TA Partner)' },
    { value: 'hiring_manager', label: 'Hiring Manager' },
    { value: 'interviewer', label: 'Interviewer / Panel' },
    { value: 'finance', label: 'Finance Controller' },
    { value: 'agency', label: 'Agency Partner' }
  ];

  const countries = ['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman'];

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
       
      {/* Left Section with Image */}
              
      <div className="hidden flex flex-col md:flex bg-white rounded-e-3xl ">
        <img className='absolute top-0 left-0 h-15 ' src={logo}  />
        <div style={{
          height:'58%',
          width:'100%',
          
        }}>
        <img
          src={login_image}
          alt="Recruitment Illustration"
         
          style={{width:"100%", height:"100%", marginTop:0}}
        />
        </div>
        <div className='bg-gray-100' style={{height:'40%'}} >
          <div className='h-13 mt-5 mb-2 relative bg-white flex items-center justify-center  text-center  border border-blue-200 rounded-3xl w-50 '><span>Join ACME</span></div>
           <div className='h-13 mb-2 relative left-40 bg-white flex items-center justify-center  text-center  border border-blue-200 rounded-3xl w-50 '>Raise a Job</div>
            <div className='h-13 mb-2 relative left-80 bg-white flex items-center justify-center  text-center  border border-blue-200 rounded-3xl w-50 '>Relax</div>
             <div className='h-13 mb-2 relative left-120 bg-white flex items-center justify-center  text-center  border border-blue-200 rounded-3xl w-50 '>Get Talent</div>
        </div>
      </div>
     <div className=' bg-green-100 rounded-sm absolute '></div> 

      {/* Right Section with Form */}
      <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
           
            <h1 className="text-2xl font-bold text-gray-900">Talent Acquisition System</h1>
            <p className="text-gray-600">Enterprise Recruitment Management</p>
          </div>

          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl text-center">Welcome</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {/* Login Form */}
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        placeholder="your.email@company.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input
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

                {/* Signup Form */}
                <TabsContent value="signup" className="space-y-4">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input
                          placeholder="John Smith"
                          value={signupData.name}
                          onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input
                          type="email"
                          placeholder="john.smith@company.com"
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={signupData.role} onValueChange={(v:any) => setSignupData({ ...signupData, role: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((r) => (
                              <SelectItem key={r.value} value={r.value}>
                                {r.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Company Name</Label>
                        <Input
                          placeholder="ACME Corporation"
                          value={signupData.companyName}
                          onChange={(e) => setSignupData({ ...signupData, companyName: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Company Size</Label>
                        <Input
                          placeholder="e.g. 100-500"
                          value={signupData.companySize}
                          onChange={(e) => setSignupData({ ...signupData, companySize: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Company Description</Label>
                        <Input
                          placeholder="Describe your company"
                          value={signupData.companyDescription}
                          onChange={(e) => setSignupData({ ...signupData, companyDescription: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Select value={signupData.country} onValueChange={(v:any) => setSignupData({ ...signupData, country: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            {countries.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Password</Label>
                        <Input
                          type="password"
                          placeholder="Create a password"
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Confirm Password</Label>
                        <Input
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
    </div>
  );
}
