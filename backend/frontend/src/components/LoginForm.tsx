import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { Users } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import logo from '../media/thumbnail_image001.png';
import login_image from '../media/LoginImg.png';
import signup_image from '../media/signup_img.png';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function LoginForm() {
  const { signIn } = useAuth();
  const { signUp } = useAuth();
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
    companySize: '',
    companyDescription: '',
    country: ''
  });
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("login");

useEffect(() => {
  const tabParam = searchParams.get("tab");
  if (tabParam === "signup") {
    setActiveTab("signup");
  } else {
    setActiveTab("login");
  }
}, [searchParams]);

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
    const res = await signUp(signupData.email, signupData.password, {
      name: signupData.name,
      role: signupData.role,
      company: signupData.company,
      company_size: signupData.companySize,
      company_description: signupData.companyDescription,
      country: signupData.country,
      confirm_password: signupData.confirmPassword,
    });

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Signup successful!");
      navigate("/dashboard");
    }
  } catch (error: any) {
    toast.error(error.message || "Something went wrong");
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

  const countries = ['UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman','India'];

   return (
      <div
       className="relative min-h-screen bg-cover bg-top flex items-center justify-end"
       style={{ backgroundImage: `url(${  login_image})`,
        transition: 'background-image 0.5s ease-in-out',
        }}
        >
       <img src={logo} alt="Logo" className="absolute top-4 left-6 h-20 w-52" />

       {/* Login Form Overlay */}
        <div className="bg-transparent p-8 rounded-xl w-full max-w-md mr-40">
         <div className="text-center mb-3">
          <h1 className="text-2xl font-bold text-white">Talent Acquisition System</h1>
           <p className="text-gray-100">Enterprise Recruitment Management</p>
         </div>

         <Card className="bg-transparent shadow-none border-none flex flex-col items-center">
           <CardHeader>
             <CardTitle className="text-xl text-center text-white">Welcome</CardTitle>
           </CardHeader>
           <CardContent>
             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
               <TabsList className="grid w-full grid-cols-2 bg-white/20 text-white">
                 <TabsTrigger value="login">Sign In</TabsTrigger>
                 <TabsTrigger value="signup">Sign Up</TabsTrigger>
               </TabsList>

                {/* Login Form */}
                <TabsContent value="login" className="space-y-4 w-100 ">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label className='text-white'>Email</Label>
                      <Input
                        type="email"
                        placeholder="your.email@company.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className='text-white'>Password</Label>
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
                <TabsContent  value="signup" className="space-y-4 w-100">
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className='text-white'>Full Name</Label>
                        <Input
                          placeholder="John Smith"
                          value={signupData.name}
                          onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className='text-white'>Email</Label>
                        <Input
                          type="email"
                          placeholder="john.smith@company.com"
                          value={signupData.email}
                          onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className='text-white'>Role</Label>
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
                        <Label className='text-white'>Company Name</Label>
                        <Input
                          placeholder="ACME Corporation"
                          value={signupData.company}
                          onChange={(e) => setSignupData({ ...signupData, company: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className='text-white'>Company Size</Label>
                        <Input
                          placeholder="e.g. 100-500"
                          value={signupData.companySize}
                          onChange={(e) => setSignupData({ ...signupData, companySize: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className='text-white'>Company Description</Label>
                        <Input
                          placeholder="Describe your company"
                          value={signupData.companyDescription}
                          onChange={(e) => setSignupData({ ...signupData, companyDescription: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className='text-white'>Country</Label>
                        <Input
                          placeholder="Country"
                          value={signupData.companyDescription}
                          onChange={(e) => setSignupData({ ...signupData, country: e.target.value })}
                          required
                        />
                      </div>
                      {/* <div className="space-y-2">
                        <Label className='text-white'>Country</Label>
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
                      </div> */}
                      <div className="space-y-2">
                        <Label className='text-white'>Password</Label>
                        <Input
                          type="password"
                          placeholder="Create a password"
                          value={signupData.password}
                          onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className='text-white'>Confirm Password</Label>
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

          <div className="mt-6 text-center text-sm text-gray-300">
            <p>Demo credentials available upon request</p>
          </div>
        </div>
      </div>

  );
}
