import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { 
  Plus, 
  Search, 
  Building2, 
  Eye,
  Edit,
  Star,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface VendorManagerProps {
  selectedCompany: string;
  selectedCountry: string;
}

interface Vendor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  specialization: string[];
  locations: string[];
  contractType: string;
  feeStructure: string;
  status: 'active' | 'inactive' | 'on-hold';
  rating: number;
  totalSubmissions: number;
  successfulHires: number;
  avgTimeToSubmit: number;
  costPerHire: number;
  joinDate: string;
  lastActivity: string;
}

interface Performance {
  period: string;
  submissions: number;
  interviews: number;
  offers: number;
  hires: number;
  revenue: number;
}

export function VendorManager({ selectedCompany, selectedCountry }: VendorManagerProps) {
  const [vendors, setVendors] = useState<Vendor[]>([
    {
      id: 'VND-001',
      name: 'Elite Recruitment Partners',
      contactPerson: 'Sarah Al-Mahmoud',
      email: 'sarah@eliterecruitment.ae',
      phone: '+971-4-123-4567',
      specialization: ['IT & Technology', 'Engineering', 'Product Management'],
      locations: ['Dubai', 'Abu Dhabi', 'Riyadh'],
      contractType: 'Preferred Vendor',
      feeStructure: '15% of annual salary',
      status: 'active',
      rating: 4.5,
      totalSubmissions: 89,
      successfulHires: 12,
      avgTimeToSubmit: 3.2,
      costPerHire: 8500,
      joinDate: '2024-01-15',
      lastActivity: '2025-08-29'
    },
    {
      id: 'VND-002',
      name: 'GCC Talent Solutions',
      contactPerson: 'Ahmed Hassan',
      email: 'ahmed@gcctalent.com',
      phone: '+966-11-987-6543',
      specialization: ['Sales & Marketing', 'Finance', 'Operations'],
      locations: ['Riyadh', 'Jeddah', 'Doha'],
      contractType: 'Standard',
      feeStructure: '18% of annual salary',
      status: 'active',
      rating: 4.2,
      totalSubmissions: 65,
      successfulHires: 8,
      avgTimeToSubmit: 4.1,
      costPerHire: 9200,
      joinDate: '2024-03-10',
      lastActivity: '2025-08-28'
    },
    {
      id: 'VND-003',
      name: 'Regional Headhunters',
      contactPerson: 'Fatima Al-Zahra',
      email: 'fatima@regionalhr.qa',
      phone: '+974-44-555-666',
      specialization: ['Executive Search', 'Leadership', 'C-Level'],
      locations: ['Doha', 'Kuwait City', 'Manama'],
      contractType: 'Executive Search',
      feeStructure: '25% of annual salary',
      status: 'active',
      rating: 4.8,
      totalSubmissions: 24,
      successfulHires: 6,
      avgTimeToSubmit: 7.5,
      costPerHire: 15000,
      joinDate: '2024-02-20',
      lastActivity: '2025-08-27'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);

  const [newVendor, setNewVendor] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    specialization: '',
    locations: '',
    contractType: 'standard',
    feeStructure: ''
  });

  const filteredVendors = vendors.filter(vendor =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.specialization.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()))
  ).filter(vendor =>
    statusFilter === 'all' || vendor.status === statusFilter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getContractTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'preferred vendor': return 'bg-purple-100 text-purple-800';
      case 'executive search': return 'bg-blue-100 text-blue-800';
      case 'standard': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateSuccessRate = (hires: number, submissions: number) => {
    return submissions > 0 ? ((hires / submissions) * 100).toFixed(1) : '0';
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
    ));
  };

  const performanceData: Performance[] = [
    { period: 'Q1 2025', submissions: 45, interviews: 28, offers: 8, hires: 6, revenue: 85000 },
    { period: 'Q2 2025', submissions: 52, interviews: 32, offers: 12, hires: 9, revenue: 125000 },
    { period: 'Q3 2025', submissions: 38, interviews: 25, offers: 7, hires: 5, revenue: 95000 }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendor Management</h1>
          <p className="text-gray-600">Manage recruitment agencies and vendors</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
              <DialogDescription>
                Add a new recruitment vendor or agency to your vendor network.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Vendor Name</Label>
                  <Input
                    id="name"
                    value={newVendor.name}
                    onChange={(e) => setNewVendor({...newVendor, name: e.target.value})}
                    placeholder="Elite Recruitment Partners"
                  />
                </div>
                <div>
                  <Label htmlFor="contactPerson">Contact Person</Label>
                  <Input
                    id="contactPerson"
                    value={newVendor.contactPerson}
                    onChange={(e) => setNewVendor({...newVendor, contactPerson: e.target.value})}
                    placeholder="Sarah Al-Mahmoud"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newVendor.email}
                    onChange={(e) => setNewVendor({...newVendor, email: e.target.value})}
                    placeholder="sarah@eliterecruitment.ae"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newVendor.phone}
                    onChange={(e) => setNewVendor({...newVendor, phone: e.target.value})}
                    placeholder="+971-4-123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="specialization">Specialization</Label>
                  <Input
                    id="specialization"
                    value={newVendor.specialization}
                    onChange={(e) => setNewVendor({...newVendor, specialization: e.target.value})}
                    placeholder="IT & Technology, Engineering"
                  />
                </div>
                <div>
                  <Label htmlFor="locations">Locations</Label>
                  <Input
                    id="locations"
                    value={newVendor.locations}
                    onChange={(e) => setNewVendor({...newVendor, locations: e.target.value})}
                    placeholder="Dubai, Abu Dhabi"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contractType">Contract Type</Label>
                  <Select value={newVendor.contractType} onValueChange={(value) => setNewVendor({...newVendor, contractType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="preferred">Preferred Vendor</SelectItem>
                      <SelectItem value="executive">Executive Search</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="feeStructure">Fee Structure</Label>
                  <Input
                    id="feeStructure"
                    value={newVendor.feeStructure}
                    onChange={(e) => setNewVendor({...newVendor, feeStructure: e.target.value})}
                    placeholder="15% of annual salary"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button>
                  Add Vendor
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vendor Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="sla">SLA Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor Details</TableHead>
                      <TableHead>Specialization</TableHead>
                      <TableHead>Performance</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVendors.map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{vendor.name}</div>
                            <div className="text-sm text-gray-500">{vendor.contactPerson}</div>
                            <div className="text-sm text-gray-500">{vendor.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {vendor.specialization.slice(0, 2).map((spec, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                            {vendor.specialization.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{vendor.specialization.length - 2} more
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm">
                              Success Rate: {calculateSuccessRate(vendor.successfulHires, vendor.totalSubmissions)}%
                            </div>
                            <div className="text-sm text-gray-500">
                              {vendor.successfulHires}/{vendor.totalSubmissions} hires
                            </div>
                            <div className="text-sm text-gray-500">
                              Avg Submit: {vendor.avgTimeToSubmit} days
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {renderStars(vendor.rating)}
                            <span className="text-sm ml-2">({vendor.rating})</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <Badge className={getStatusColor(vendor.status)}>{vendor.status}</Badge>
                            <Badge variant="outline" className={getContractTypeColor(vendor.contractType)}>
                              {vendor.contractType}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => setSelectedVendor(vendor)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendors.slice(0, 3).map((vendor, index) => (
                    <div key={vendor.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{vendor.name}</div>
                          <div className="text-sm text-gray-500">
                            {calculateSuccessRate(vendor.successfulHires, vendor.totalSubmissions)}% success rate
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{vendor.successfulHires} hires</div>
                        <div className="text-sm text-gray-500">${vendor.costPerHire.toLocaleString()} per hire</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quarterly Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceData.map((period) => (
                    <div key={period.period} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{period.period}</span>
                        <span className="text-sm text-gray-500">${period.revenue.toLocaleString()}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div>
                          <div className="text-gray-500">Submissions</div>
                          <div className="font-medium">{period.submissions}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Interviews</div>
                          <div className="font-medium">{period.interviews}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Offers</div>
                          <div className="font-medium">{period.offers}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Hires</div>
                          <div className="font-medium">{period.hires}</div>
                        </div>
                      </div>
                      <Progress value={(period.hires / period.submissions) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sla">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>SLA Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendors.map((vendor) => (
                    <div key={vendor.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">{vendor.name}</div>
                        <div className="flex items-center">
                          {vendor.avgTimeToSubmit <= 5 ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Avg Time to Submit</span>
                          <span className={vendor.avgTimeToSubmit <= 5 ? 'text-green-600' : 'text-red-600'}>
                            {vendor.avgTimeToSubmit} days
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>SLA Target</span>
                          <span>≤ 5 days</span>
                        </div>
                        <Progress 
                          value={Math.min((5 / vendor.avgTimeToSubmit) * 100, 100)} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendors.map((vendor) => (
                    <div key={vendor.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{vendor.name}</div>
                        <div className="text-sm text-gray-500">{vendor.feeStructure}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${vendor.costPerHire.toLocaleString()}</div>
                        <div className="text-sm text-gray-500">per hire</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}