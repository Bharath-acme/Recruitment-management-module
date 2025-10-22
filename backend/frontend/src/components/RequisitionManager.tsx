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
  AlertCircle,
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { RequisitionForm } from './RequisitionFrom';
import { useAuth } from './AuthProvider';
import { Capitalize } from '../utils/Utils';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


interface RequisitionManagerProps {
  selectedCompany: string;
  selectedCountry: string;
}

export interface Requisition {
  id: string;
  position: string;
  department: string;
  location: string;
  employment_type: string;
  work_mode: string;
  grade: string;
  min_salary: number;
  max_salary: number;
  currency: string;
  status: string;
  priority: string;
  positions_count: number;
  filled: number;
  daysOpen: number;
  candidates: any[];
  hiring_manager: string;
  recruiter: any;
  recruiter_id: number;
  job_description: string;
  skills: string[];
  progress: number; // percentage of positions filled
  // Add any other fields as necessary
  target_startdate: string;
  sla: number;
  approval_status: string;
  created_date: string;
  positions:any[],
  req_id: string;
}

export function RequisitionManager({ selectedCompany, selectedCountry }: RequisitionManagerProps) {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedRequisition, setSelectedRequisition] = useState<Requisition | null>(null);
  // const [approval, setApproval] = useState('');
  const navigate = useNavigate();
 
  const {user } = useAuth();
  const [newRequisition, setNewRequisition] = useState({
    position: '',
    department: '',
    location: '',
    employment_type: '',
    work_mode: 'onsite',
    grade: '',
    min_salary: '',
    max_salary: '',
    currency: 'AED',
    priority: 'medium',
    positions_count: null,
    job_description: '',
    skills: '',
    recruiter:'',
    hiring_manager: user?.name || '',
    target_startdate: '',
    created_date: ''
    
  });

  useEffect(() => {
    loadRequisitions();
   
  }, [selectedCompany, selectedCountry, statusFilter]);

 const queryvalues = () => {
    if (user?.role === 'admin' || user?.role === 'hiring_manager') {
      return 'all';
    } else {
      return 'approved';
    }
 }
  const token = localStorage.getItem("token");

 const loadRequisitions = async () => {
  setLoading(true);
  try {
    const approvalStatus = queryvalues();
    const response = await fetch(
      `${API_BASE_URL}/requisitions/?approval_status=${approvalStatus}&user_id=${user?.id}&role=${user?.role}`,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (response.ok) {
      const data = await response.json();
      setRequisitions(data || []);
    }
  } catch (error) {
    console.error('Requisitions load error:', error);
  } finally {
    setLoading(false);
  }
};


  

  // Add the missing handler function for creating a requisition
  const handleCreateRequisition = async (requisitionData:any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/requisitions/create-requisition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
         body: JSON.stringify(requisitionData),
        
      });

      if (response.ok) {
        toast.success('Requisition created successfully!');
        setShowCreateDialog(false);
        loadRequisitions();
      } else {
        toast.error('Failed to create requisition');
      }
    } catch (error) {
      console.error('Create requisition error:', error);
      toast.error('Failed to create requisition');
    }
  };

 

  //const filteredRequisitions = requisitions.filter(req =>
   // req.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    //req.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
   // req.id.toLowerCase().includes(searchTerm.toLowerCase())
 // );
 const filteredRequisitions = requisitions.filter(requisition => {
  const position = (requisition.position??"").toLowerCase();
  const department = (requisition.department??"").toLowerCase();
  const req_id = (requisition.req_id??"").toLowerCase();
  const location = (requisition.location??"").toLowerCase();
  

  return (
    position.includes(searchTerm.toLowerCase()) ||
    department.includes(searchTerm.toLowerCase()) ||
    req_id.includes(searchTerm.toLowerCase())  ||
    location.includes(searchTerm.toLowerCase())
    
  );
});

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

  const daysOpen = (createdDate: string) => {
    const created = new Date(createdDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getApprovalStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
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
         {(user?.role === 'hiring_manager' || user?.role === 'admin') &&  <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Requisition
            </Button>
          </DialogTrigger>}
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Requisition</DialogTitle>
              <DialogDescription>
                Create a new job requisition by filling in the position details and requirements below.
              </DialogDescription>
            </DialogHeader>
            <RequisitionForm
            onSubmit={handleCreateRequisition}
            onCancel={() => setShowCreateDialog(false)}
            />
            
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

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full border-separate border-spacing-y-3">
            <TableHeader >
              <TableRow >
              <TableHead className="first:pl-10">Position</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Days Open</TableHead>
              <TableHead>Hiring Manager</TableHead>
              <TableHead>Approval</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow  key={i}>
                    <TableCell><div  className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
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
                  
                  <TableRow 
                       onClick={()=>{ navigate(`/requisitions/${req.id}`)}} key={req.id}
                       className="border border-gray-200 rounded-lg shadow-sm transition-all duration-200 ease-in-out hover:shadow-lg hover:bg-blue-50 hover:-translate-y-[2px] cursor-pointer">
                
                    <TableCell className="border-l-[5px] border-blue-600 pl-4 rounded-lg">
                        <div className="font-medium">{req.position}</div>
                        <div className="text-sm text-gray-500">{req.req_id}</div>
                       
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                           <MapPin className="h-3 w-3" /> <span>{req.location}</span>
                        </div>  
                    </TableCell>
                    <TableCell>{req.department}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(req.status)}>{req.status}</Badge>
                        
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(req.priority)}>{req.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{req.filled} {req.positions_count} filled</div>
                        <div className="text-sm text-gray-500"> applicants</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className={daysOpen(req.created_date) > req.sla ? 'text-red-600' : 'text-gray-600'}>
                          {daysOpen(req.created_date)} days
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{Capitalize(req.hiring_manager)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                        // onClick={(e:any)=>{e.stopPropagation(); }} 
                        // onClick={(e)=>{ e.stopPropagation(); setApproval(req.id);}}
                        className="flex items-center gap-2"
                        size="sm" 
                        variant="outline">
                          {/* <Eye className="h-4 w-4" /> */}
                          {Capitalize(req.approval_status)}
                         {getApprovalStatusIcon(req.approval_status)}
                        </Button>
                        {/* {getApprovalStatusIcon(req?.approvalStatus)} */}
                        {/* <Button onClick={(e:any)=>{e.stopPropagation(); }} size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button> */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
    </div>
  );
}