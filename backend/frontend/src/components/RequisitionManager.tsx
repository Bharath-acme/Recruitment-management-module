import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Calendar, 
  Users, 
  Eye,
  Edit,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface RequisitionManagerProps {
  selectedCompany: string;
  selectedCountry: string;
}

interface Requisition {
  id: string;
  title: string;
  department: string;
  location: string;
  employmentType: string;
  workMode: string;
  grade: string;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  status: string;
  priority: string;
  openings: number;
  filled: number;
  daysOpen: number;
  applicants: number;
  hiringManager: string;
  recruiter: string;
  targetStartDate: string;
  sla: number;
  approvalStatus: string;
  createdDate: string;
}

export function RequisitionManager({ selectedCompany, selectedCountry }: RequisitionManagerProps) {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null);

  const [newRequisition, setNewRequisition] = useState({
    title: '',
    department: '',
    location: '',
    employmentType: 'permanent',
    workMode: 'onsite',
    grade: '',
    budgetMin: '',
    budgetMax: '',
    currency: 'AED',
    priority: 'medium',
    openings: 1,
    description: '',
    requirements: '',
    hiringManager: '',
    targetStartDate: ''
  });

  useEffect(() => {
    loadRequisitions();
  }, [selectedCompany, selectedCountry, statusFilter]);

  const loadRequisitions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-66aec17b/requisitions?status=${statusFilter}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequisitions(data.requisitions || []);
      } else {
        loadDemoData();
      }
    } catch (error) {
      console.error('Requisitions load error:', error);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = () => {
    setRequisitions([
      {
        id: 'REQ-2025-001',
        title: 'Senior Software Engineer',
        department: 'Engineering',
        location: 'Dubai, UAE',
        employmentType: 'Permanent',
        workMode: 'Hybrid',
        grade: 'Senior',
        budgetMin: 15000,
        budgetMax: 20000,
        currency: 'AED',
        status: 'Active',
        priority: 'High',
        openings: 2,
        filled: 0,
        daysOpen: 12,
        applicants: 23,
        hiringManager: 'Sarah Johnson',
        recruiter: 'Ahmed Al-Rashid',
        targetStartDate: '2025-10-01',
        sla: 30,
        approvalStatus: 'Approved',
        createdDate: '2025-08-18'
      },
      {
        id: 'REQ-2025-002',
        title: 'Product Manager',
        department: 'Product',
        location: 'Riyadh, KSA',
        employmentType: 'Permanent',
        workMode: 'Onsite',
        grade: 'Senior',
        budgetMin: 18000,
        budgetMax: 25000,
        currency: 'SAR',
        status: 'Active',
        priority: 'High',
        openings: 1,
        filled: 0,
        daysOpen: 8,
        applicants: 31,
        hiringManager: 'Mike Chen',
        recruiter: 'Fatima Al-Zahra',
        targetStartDate: '2025-09-15',
        sla: 25,
        approvalStatus: 'Approved',
        createdDate: '2025-08-22'
      },
      {
        id: 'REQ-2025-003',
        title: 'UI/UX Designer',
        department: 'Design',
        location: 'Doha, Qatar',
        employmentType: 'Contract',
        workMode: 'Remote',
        grade: 'Mid',
        budgetMin: 12000,
        budgetMax: 16000,
        currency: 'QAR',
        status: 'Pending Approval',
        priority: 'Medium',
        openings: 1,
        filled: 0,
        daysOpen: 3,
        applicants: 0,
        hiringManager: 'Lisa Park',
        recruiter: 'Omar Hassan',
        targetStartDate: '2025-09-30',
        sla: 20,
        approvalStatus: 'Pending',
        createdDate: '2025-08-27'
      }
    ]);
  };

  const handleCreateRequisition = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-66aec17b/requisitions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRequisition)
      });

      if (response.ok) {
        toast.success('Requisition created successfully!');
        setShowCreateDialog(false);
        loadRequisitions();
        setNewRequisition({
          title: '',
          department: '',
          location: '',
          employmentType: 'permanent',
          workMode: 'onsite',
          grade: '',
          budgetMin: '',
          budgetMax: '',
          currency: 'AED',
          priority: 'medium',
          openings: 1,
          description: '',
          requirements: '',
          hiringManager: '',
          targetStartDate: ''
        });
      } else {
        toast.error('Failed to create requisition');
      }
    } catch (error) {
      console.error('Create requisition error:', error);
      toast.error('Failed to create requisition');
    }
  };

  const filteredRequisitions = requisitions.filter(req =>
    req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending approval': return 'bg-yellow-100 text-yellow-800';
      case 'on hold': return 'bg-gray-100 text-gray-800';
      case 'closed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApprovalStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Requisition Management</h1>
          <p className="text-gray-600">Manage job requisitions and hiring requests</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Requisition
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Requisition</DialogTitle>
              <DialogDescription>
                Create a new job requisition by filling in the position details and requirements below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Position Title</Label>
                  <Input
                    id="title"
                    value={newRequisition.title}
                    onChange={(e) => setNewRequisition({...newRequisition, title: e.target.value})}
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Select value={newRequisition.department} onValueChange={(value) => setNewRequisition({...newRequisition, department: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="HR">Human Resources</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newRequisition.location}
                    onChange={(e) => setNewRequisition({...newRequisition, location: e.target.value})}
                    placeholder="e.g. Dubai, UAE"
                  />
                </div>
                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <Select value={newRequisition.grade} onValueChange={(value) => setNewRequisition({...newRequisition, grade: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Junior">Junior</SelectItem>
                      <SelectItem value="Mid">Mid Level</SelectItem>
                      <SelectItem value="Senior">Senior</SelectItem>
                      <SelectItem value="Lead">Lead</SelectItem>
                      <SelectItem value="Principal">Principal</SelectItem>
                      <SelectItem value="Director">Director</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="employmentType">Employment Type</Label>
                  <Select value={newRequisition.employmentType} onValueChange={(value) => setNewRequisition({...newRequisition, employmentType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="permanent">Permanent</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="temporary">Temporary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="workMode">Work Mode</Label>
                  <Select value={newRequisition.workMode} onValueChange={(value) => setNewRequisition({...newRequisition, workMode: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="onsite">Onsite</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={newRequisition.priority} onValueChange={(value) => setNewRequisition({...newRequisition, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="budgetMin">Min Salary</Label>
                  <Input
                    id="budgetMin"
                    type="number"
                    value={newRequisition.budgetMin}
                    onChange={(e) => setNewRequisition({...newRequisition, budgetMin: e.target.value})}
                    placeholder="15000"
                  />
                </div>
                <div>
                  <Label htmlFor="budgetMax">Max Salary</Label>
                  <Input
                    id="budgetMax"
                    type="number"
                    value={newRequisition.budgetMax}
                    onChange={(e) => setNewRequisition({...newRequisition, budgetMax: e.target.value})}
                    placeholder="20000"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={newRequisition.currency} onValueChange={(value) => setNewRequisition({...newRequisition, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AED">AED</SelectItem>
                      <SelectItem value="SAR">SAR</SelectItem>
                      <SelectItem value="QAR">QAR</SelectItem>
                      <SelectItem value="KWD">KWD</SelectItem>
                      <SelectItem value="BHD">BHD</SelectItem>
                      <SelectItem value="OMR">OMR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="openings">Number of Openings</Label>
                  <Input
                    id="openings"
                    type="number"
                    min="1"
                    value={newRequisition.openings}
                    onChange={(e) => setNewRequisition({...newRequisition, openings: parseInt(e.target.value) || 1})}
                  />
                </div>
                <div>
                  <Label htmlFor="targetStartDate">Target Start Date</Label>
                  <Input
                    id="targetStartDate"
                    type="date"
                    value={newRequisition.targetStartDate}
                    onChange={(e) => setNewRequisition({...newRequisition, targetStartDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  value={newRequisition.description}
                  onChange={(e) => setNewRequisition({...newRequisition, description: e.target.value})}
                  placeholder="Describe the role and responsibilities..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea
                  id="requirements"
                  value={newRequisition.requirements}
                  onChange={(e) => setNewRequisition({...newRequisition, requirements: e.target.value})}
                  placeholder="List the required skills, experience, and qualifications..."
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateRequisition}>
                  Create Requisition
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search requisitions..."
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
            <SelectItem value="pending">Pending Approval</SelectItem>
            <SelectItem value="on-hold">On Hold</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Days Open</TableHead>
                <TableHead>Hiring Manager</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredRequisitions.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{req.title}</div>
                        <div className="text-sm text-gray-500">{req.id}</div>
                        <div className="text-sm text-gray-500">{req.location}</div>
                      </div>
                    </TableCell>
                    <TableCell>{req.department}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(req.status)}>{req.status}</Badge>
                        {getApprovalStatusIcon(req.approvalStatus)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(req.priority)}>{req.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{req.filled}/{req.openings} filled</div>
                        <div className="text-sm text-gray-500">{req.applicants} applicants</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className={req.daysOpen > req.sla ? 'text-red-600' : 'text-gray-600'}>
                          {req.daysOpen}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{req.hiringManager}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}