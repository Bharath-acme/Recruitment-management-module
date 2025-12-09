import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { toast } from 'sonner';

export function SignupForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirm_password: '',
    company: '',
    country: '',
    company_sector: '',
    company_size: '',
    company_address: '',
    company_city: '',
    company_website: '',
    company_phone_number: '',
  });
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    const { confirm_password, ...signupData } = formData;
    const result = await signUp(signupData.email, signupData.password, signupData);

    if (result.success) {
      toast.success('Signup successful! Welcome.');
      navigate('/dashboard');
    } else {
      toast.error(result.error || 'Signup failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="confirm_password">Confirm Password</Label>
          <Input id="confirm_password" name="confirm_password" type="password" value={formData.confirm_password} onChange={handleChange} required />
        </div>
      </div>

      <hr className="my-6" />
      <h3 className="text-lg font-semibold">Company Details</h3>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company">Company Name</Label>
          <Input id="company" name="company" type="text" value={formData.company} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="company_website">Company Website</Label>
          <Input id="company_website" name="company_website" type="text" value={formData.company_website} onChange={handleChange} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company_sector">Sector</Label>
          <Input id="company_sector" name="company_sector" type="text" value={formData.company_sector} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="company_size">Company Size</Label>
          <Input id="company_size" name="company_size" type="text" value={formData.company_size} onChange={handleChange} />
        </div>
      </div>
      
      <div>
        <Label htmlFor="company_address">Address</Label>
        <Input id="company_address" name="company_address" type="text" value={formData.company_address} onChange={handleChange} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company_city">City</Label>
          <Input id="company_city" name="company_city" type="text" value={formData.company_city} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" type="text" value={formData.country} onChange={handleChange} required />
        </div>
      </div>
      
      <div>
          <Label htmlFor="company_phone_number">Phone Number</Label>
          <Input id="company_phone_number" name="company_phone_number" type="text" value={formData.company_phone_number} onChange={handleChange} />
      </div>

      <Button type="submit" className="w-full">Sign Up</Button>
    </form>
  );
}
