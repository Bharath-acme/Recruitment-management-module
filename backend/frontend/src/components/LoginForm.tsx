import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { useSearchParams, useNavigate } from 'react-router-dom';
import logo from '../media/thumbnail_image001.png';




export function LoginForm() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "login");
  const [signupStep, setSignupStep] = useState(1);
  
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
    company_size: '',
    company_sector: '',
    company_address: '',
    company_city: '',
    company_website: '',
    company_phone_number: '',
    country: '',
      client_type: ''
  });

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "signup" || tabParam === "login") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleSelectChange = (name: keyof typeof signupData, value: string) => {
    setSignupData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await signIn(loginData.email, loginData.password);
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
      const { confirmPassword, ...payload } = signupData;
      const res = await signUp(signupData.email, signupData.password, { ...payload, confirm_password: confirmPassword });

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

  const handleNextStep = () => {
    if (signupData.name && signupData.email && signupData.role && signupData.password && signupData.confirmPassword) {
      if (signupData.password === signupData.confirmPassword) {
        setSignupStep(2);
      } else {
        toast.error("Passwords do not match");
      }
    } else {
      toast.error("Please fill all the required fields.");
    }
  };

  const roles = [
    { value: 'admin', label: 'HR Admin ' },
    { value: 'recruiter', label: 'Recruiter (TA Partner)' },
    { value: 'hiring_manager', label: 'Hiring Manager' },
    { value: 'interviewer', label: 'Interviewer / Panel' },
    { value: 'finance', label: 'Finance Controller' },
    { value: 'agency', label: 'Agency Partner' }
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full min-h-screen grid grid-cols-1 md:grid-cols-2">
        {/* Left Column: Visual Panel */}
        <div className="hidden md:flex bg-gradient-to-br from-[#1C3A5A] to-[#0A1C2A] text-white p-12 lg:p-16 relative overflow-hidden flex-col justify-between">
          <div className="absolute top-8 left-8">
            <img src={logo} alt="Logo" className="h-20 w-auto" />
          </div>
          <div className="flex flex-col justify-center items-center h-full relative z-10 pt-20">
            {/* Visual Network Graphic */}
            <div className="relative w-80 h-80 mx-auto mb-16">
                {/* Decorative circles */}
                <div className="absolute inset-0 rounded-full border border-blue-400 opacity-10 animate-pulse" style={{ transform: 'scale(1.75)' }}></div>
                <div className="absolute inset-0 rounded-full border border-blue-400 opacity-20 animate-pulse" style={{ transform: 'scale(1.25)' }}></div>
                <div className="absolute inset-0 rounded-full border border-blue-400 opacity-20 animate-pulse" style={{ transform: 'scale(0.75)' }}></div>

                {/* Avatars and Labels */}
                
                {/* Outer Circle (1 item) */}
                {roles.slice(0, 1).map((item, index) => {
                    const angle = Math.PI / 2; // Bottom center
                    const radius = 150;
                    const top = -30 - radius * Math.cos(angle);
                    const left =  -80+ radius * Math.sin(angle);
                    return (
                        <div key={item.value} className="absolute text-center" style={{ top: `${top}%`, left: `${left}%`, transform: 'translate(-50%, -50%)' }}>
                            {/* <img src='' alt={item.label} className="w-12 h-12 rounded-full border-2 border-blue-300/50 shadow-lg mb-1" /> */}
                            <Avatar label={item.label} index={index} />
                            <span className="text-[10px] font-semibold text-blue-200">{item.label}</span>
                        </div>
                    );
                })}

                {/* Middle Circle (2 items) */}
                {roles.slice(1, 3).map((item, index) => {
                    const angle = (index * Math.PI) - (Math.PI / 2); // Left and Right
                    const radius = 53;
                    const top = 40 - radius * Math.cos(angle);
                    const left = 55 + radius * Math.sin(angle);
                    return (
                        <div key={item.value} className="absolute text-center" style={{ top: `${top}%`, left: `${left}%`, transform: 'translate(-50%, -50%)' }}>
                            <Avatar label={item.label} index={index} />
                            {/* <img src='' alt={item.label} className="w-12 h-12 rounded-full border-2 border-blue-300/50 shadow-lg mb-1" /> */}
                            <span className="text-[10px] font-semibold text-blue-200">{item.label}</span>
                        </div>
                    );
                })}

                {/* Inner Circle (3 items) */}
                {roles.slice(3, 6).map((item, index) => {
                    const angle = (index / 3) * 2 * Math.PI + (Math.PI / 2); // 3 items, spaced out
                    const radius = 35;
                    const top = 53 - radius * Math.sin(angle);
                    const left = 55 + radius * Math.cos(angle);
                    return (
                        <div key={item.value} className="absolute text-center" style={{ top: `${top}%`, left: `${left}%`, transform: 'translate(-50%, -50%)' }}>
                            <Avatar label={item.label} index={index} />
                            {/* <img src='' alt={item.label} className="w-12 h-12 rounded-full border-2 border-blue-300/50 shadow-lg mb-1" /> */}
                            <span className="text-[10px] font-semibold text-blue-200">{item.label}</span>
                        </div>
                    );
                })}
            </div>
            <h3 className="text-3xl font-bold text-center mb-4 leading-snug text-blue-100">
              Enterprise Recruitment Management
            </h3>
            <p className="text-center text-blue-200/80 text-sm max-w-md">
              Streamline your talent acquisition process with smart automation and integrated tools.
            </p>
          </div>
        </div>

        {/* Right Column: Form Panel */}
        <div className="p-8 lg:py-12 lg:px-12 flex flex-col justify-start bg-white text-gray-900">
          <div className="w-full max-w-md mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Welcome</h1>
              <p className="text-gray-600">Please enter your details to continue.</p>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 text-gray-700 rounded-lg p-1">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              {/* Login Form */}
              <TabsContent value="login" className="mt-6">
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input type="email" placeholder="your.email@company.com" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" placeholder="Enter your password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              {/* Signup Form */}
              <TabsContent value="signup" className="mt-6">
                <div className="text-center mb-4">
                  <p className="text-sm font-semibold text-gray-800">
                    {signupStep === 1 ? 'Step 1: Personal Details' : 'Step 2: Company Information'}
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: signupStep === 1 ? '50%' : '100%' }}></div>
                  </div>
                </div>
                <form onSubmit={handleSignup} className="space-y-4">
                  {signupStep === 1 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label>Full Name</Label>
                        <Input name="name" placeholder="John Smith" value={signupData.name} onChange={handleSignupChange} required />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Email</Label>
                        <Input name="email" type="email" placeholder="john.smith@company.com" value={signupData.email} onChange={handleSignupChange} required />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Your Role</Label>
                        <Select value={signupData.role} onValueChange={(v) => handleSelectChange('role', v)}>
                          <SelectTrigger><SelectValue placeholder="Select your role" /></SelectTrigger>
                          <SelectContent>
                            {roles.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Password</Label>
                        <Input name="password" type="password" placeholder="Create a password" value={signupData.password} onChange={handleSignupChange} required />
                      </div>
                      <div className="space-y-2">
                        <Label>Confirm Password</Label>
                        <Input name="confirmPassword" type="password" placeholder="Confirm your password" value={signupData.confirmPassword} onChange={handleSignupChange} required />
                      </div>
                      <div className="md:col-span-2">
                        <Button type="button" className="w-full !mt-6" onClick={handleNextStep}>
                          Next
                        </Button>
                      </div>
                    </div>
                  )}

                  {signupStep === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label>Company Name</Label>
                        <Input name="company" placeholder="ACME Corporation" value={signupData.company} onChange={handleSignupChange} required />
        
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Client Type</Label>
                        <Select
                          value={signupData.client_type}
                          onValueChange={(v) => handleSelectChange('client_type', v)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select client type" />
                          </SelectTrigger>

                          <SelectContent>
                            <SelectItem value="affiliate_client">Affiliate Client</SelectItem>
                            <SelectItem value="corporate_client">Corporate Client</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Company Website</Label>
                        <Input name="company_website" placeholder="https://acme.com" value={signupData.company_website} onChange={handleSignupChange} />
                      </div>
                      <div className="space-y-2">
                        <Label>Sector</Label>
                        <Input name="company_sector" placeholder="e.g. Technology" value={signupData.company_sector} onChange={handleSignupChange} />
                      </div>
                       <div className="space-y-2">
                        <Label>Company Size</Label>
                        <Input name="company_size" placeholder="e.g. 100-500" value={signupData.company_size} onChange={handleSignupChange} />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input name="company_phone_number" placeholder="+1-555-123-4567" value={signupData.company_phone_number} onChange={handleSignupChange} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label>Address</Label>
                        <Input name="company_address" placeholder="123 Main St, Anytown" value={signupData.company_address} onChange={handleSignupChange} />
                      </div>
                      <div className="space-y-2">
                        <Label>City</Label>
                        <Input name="company_city" placeholder="New York" value={signupData.company_city} onChange={handleSignupChange} />
                      </div>
                      <div className="space-y-2">
                        <Label>Country</Label>
                        <Input name="country" placeholder="USA" value={signupData.country} onChange={handleSignupChange} required />
                      </div>
                      <div className="md:col-span-2 flex gap-4">
                        <Button type="button" className="w-54 !mt-6" variant="outline" onClick={() => setSignupStep(1)}>
                          Back
                        </Button>
                        <Button type="submit" className="w-54 !mt-6" disabled={loading}>
                          {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}


const avatarColors = [
  "bg-blue-600",
  "bg-yellow-400",
  "bg-purple-600",
  "bg-teal-600",
  "bg-blue-200",
  "bg-rose-600",
];

function Avatar({
  label,
  image,
  index,
}: {
  label: string;
  image?: string;
  index: number;
}) {
  const firstLetter = label.charAt(0).toUpperCase();
  const bgColor = avatarColors[index % avatarColors.length];

  if (image) {
    return (
      <img
        src={image}
        alt={label}
        className="w-12 h-12 rounded-full border-2 border-blue-300/50 shadow-lg mb-1 object-cover"
      />
    );
  }

  return (
    <div
      className={`w-12 h-12 rounded-full ${bgColor} flex items-center justify-center text-white font-bold text-lg shadow-lg mb-1`}
    >
      {firstLetter}
    </div>
  );
}
export { Avatar };