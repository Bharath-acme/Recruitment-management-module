import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  Plus, 
  Search, 
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
  progress: number;
  target_startdate: string;
  sla: number;
  approval_status: string;
  created_date: string;
  positions: any[];
  req_id: string;
  company_id:number;
}

export function RequisitionManager({ selectedCompany, selectedCountry }: RequisitionManagerProps) {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('all'); // 👈 new filter for top tabs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const navigate = useNavigate();
  const { user, allCompanies } = useAuth();

  const token = localStorage.getItem("token");

  useEffect(() => {
    loadRequisitions();
  }, [selectedCompany, selectedCountry]);

  const queryvalues = () => {
  if (!user) return "approved";

  switch (user.role) {
    case "admin":
    case "hiring_manager":
      return "all";

    case "recruiter":
      return "approved";

    default:
      return "approved";
  }
};

 const loadRequisitions = async () => {
  setLoading(true);

  try {
    const approvalStatus = queryvalues();
    const isAcmeUser = user?.company?.name?.toLowerCase() === 'acme global hub pvt ltd';
    let companyIdToFilter;

    if (isAcmeUser) {
        if (selectedCompany) {
            const company = allCompanies.find(c => c.name === selectedCompany);
            if (company) {
                companyIdToFilter = company.id;
            }
        }
    } else {
        companyIdToFilter = user?.company?.id;
    }


    // Build request URL with all backend parameters
    const url = new URL(`${API_BASE_URL}/requisitions`);

    url.searchParams.append("approval_status", approvalStatus);
    url.searchParams.append("role", user?.role || "");
    url.searchParams.append("user_id", user?.id?.toString() || "");
    if (companyIdToFilter) {
        url.searchParams.append("company_id", companyIdToFilter.toString());
    }

    const response = await fetch(url.toString(), {
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();

      const mapped = data.map((req: any) => ({
        ...req,
        department: req?.department?.name || "Not Assigned",
        location: req?.location?.name || "Not Assigned",
        skills: Array.isArray(req.skills) ? req.skills.map((s: any) => s.name) : [],
        recruiter: req?.recruiter?.name || "Unassigned",
        filled: req?.filled || 0,
        daysOpen: req.created_date
          ? Math.ceil(
              (Date.now() - new Date(req.created_date).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 0,
      }));

      setRequisitions(mapped || []);
    }
  } catch (error) {
    console.error("Requisitions load error:", error);
  } finally {
    setLoading(false);
  }
};


  const handleCreateRequisition = async (requisitionData: any) => {

    try {
      const response = await fetch(`${API_BASE_URL}/requisitions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requisitionData),
      });

      if (response.ok) {
        toast.success('Requisition created successfully!');
        setShowCreateDialog(false);
        loadRequisitions();
        window.dispatchEvent(new CustomEvent('refreshDashboard'));
      } else {
        toast.error('Failed to create requisition');
      }
    } catch (error) {
      console.error('Create requisition error:', error);
      toast.error('Failed to create requisition');
    }
  };

  // 🔍 Filter requisitions
  const filteredRequisitions = requisitions.filter((req) => {
    const position = (req.position ?? "").toLowerCase();
    const department = (req.department ?? "").toLowerCase();
    const req_id = (req.req_id ?? "").toLowerCase();
    const location = (req.location ?? "").toLowerCase();
    const approval = (req.approval_status ?? "").toLowerCase();

    const matchesSearch =
      position.includes(searchTerm.toLowerCase()) ||
      department.includes(searchTerm.toLowerCase()) ||
      req_id.includes(searchTerm.toLowerCase()) ||
      location.includes(searchTerm.toLowerCase());

    const matchesApproval =
      approvalFilter === "all" ? true : approval === approvalFilter;

    return matchesSearch && matchesApproval;
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
      {/* 🔹 Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Requisition Management</h1>
          <p className="text-gray-600">Manage job requisitions and hiring requests</p>
        </div>

        {/* Create Requisition Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          {(user?.role === 'hiring_manager' || user?.role === 'admin') && (
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Requisition
              </Button>
            </DialogTrigger>
          )}
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Requisition</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new job requisition.
              </DialogDescription>
            </DialogHeader>
            <RequisitionForm
              onSubmit={handleCreateRequisition}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* 🔹 Top Tabs for Approval Filter */}
      <div className='flex flex-row justify-between border-b pb-2 align-center'>
      <div className="flex space-x-6 ">
        {["all", "pending", "approved", "rejected"].map((status) => (
          <button
            key={status}
            onClick={() => setApprovalFilter(status)}
            className={`font-semibold pb-1 border-b-2 capitalize cursor-pointer transition-all ${
              approvalFilter === status
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-blue-600"
            }`}
          >
            {status === "pending" ? "Approval Pending" : status}
          </button>
        ))}
      </div>

      {/* 🔹 Search */}
       

      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search requisitions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-10 border-1 border-red rounded-full"
            />
          </div>
        </div>
      </div>
     </div>
      {/* 🔹 Table */}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="w-full border-separate border-spacing-y-3">
            <TableHeader className="border bg-blue-100 rounded-lg shadow-sm">
              <TableRow>
                <TableHead className="first:pl-10 rounded-l-lg">Position</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
               {isAcmeUser && <TableHead>Company</TableHead>}
                <TableHead>Priority</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Days Open</TableHead>
                <TableHead>Hiring Manager</TableHead>
                <TableHead className="rounded-r-lg">Approval</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {Array(8)
                      .fill(0)
                      .map((_, idx) => (
                        <TableCell key={idx}>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                      ))}
                  </TableRow>
                ))
              ) : filteredRequisitions.length > 0 ? (
                filteredRequisitions.map((req) => (
                  <TableRow
                    onClick={() => navigate(`/requisitions/${req.id}`)}
                    key={req.id}
                    className="border border-gray-200 rounded-lg shadow-sm transition-all duration-200 ease-in-out hover:shadow-lg hover:bg-blue-50 hover:-translate-y-[2px] cursor-pointer"
                  >
                    <TableCell className="border-l-[5px] border-blue-600 pl-4 rounded-l-lg">
                      <div className="font-medium">{req.position}</div>
                      <div className="text-sm text-gray-500">{req.req_id}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> <span>{req.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>{req.department}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(req.status)}>{req.status}</Badge>
                    </TableCell>
                     {isAcmeUser && <TableCell>
                      <span >{req.company?.name}</span>
                    </TableCell>}
                    <TableCell>
                      <Badge className={getPriorityColor(req.priority)}>{req.priority}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div>{req.filled} / {req.positions_count} filled</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span
                          className={
                            daysOpen(req.created_date) > req.sla
                              ? 'text-red-600'
                              : 'text-gray-600'
                          }
                        >
                          {daysOpen(req.created_date)} days
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{Capitalize(req.hiring_manager)}</TableCell>
                    <TableCell>
                      <Button className="flex items-center gap-2" size="sm" variant="outline">
                        {Capitalize(req.approval_status)}
                        {getApprovalStatusIcon(req.approval_status)}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-gray-500">
                    No requisitions found.
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </div>
  );
}
