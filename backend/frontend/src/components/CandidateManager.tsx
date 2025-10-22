import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  Plus, 
  Search, 
  Filter, 
  Users, 
  Eye,
  Edit,
  Star,
  Download,
  Mail,
  Phone,
  MapPin,
  FileText,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import CandidateForm from './CandidateForm';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface CandidateManagerProps {
  selectedCompany: string;
  selectedCountry: string;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  position: string;
  requisition_id: string;
  stage: string;
  status: string;
  rating: number;
  experience: number;
  skills: string[];
  source: string;
  applied_date: string;
  last_activity: string;
  recruiter: string;
  resumeUrl?: string;
  notes?: string;
  current_ctc?: string;
  expected_ctc?: string;
  notice_period?: string;
  current_company?: string;
  dob?: string;
  marital_status?: string;
  nationality?: string;

}

export function CandidateManager({ selectedCompany, selectedCountry }: CandidateManagerProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const [newCandidate, setNewCandidate] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    position: '',
    requisitionId: '',
    experience: '',
    skills: '',
    source: 'direct',
    current_ctc: '',      // snake_case
    expected_ctc: '',
    notice_period: '',
    current_company: '',
    dob: '',
    marital_status: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadCandidates();

  }, []);
  
  useEffect(() => {
    loadCandidates();

  }, [selectedCompany, selectedCountry, stageFilter]);

  const token = localStorage.getItem('token');

 const loadCandidates = async () => {
  setLoading(true);
  try {
    const response = await fetch(`${API_BASE_URL}/candidates`, {
      headers: { 'Content-Type': 'application/json',
        authorization: `Bearer ${token}`
       }
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Fetched candidates:', data);

      // Adjust depending on backend response
      setCandidates(Array.isArray(data) ? data : data.candidates || []);
    } else {
      console.error("Failed to fetch candidates");
    }
  } catch (error) {
    console.error('Candidates load error:', error);
  } finally {
    setLoading(false);
  }
};

  
  const handleAddCandidate = async (candidateData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/candidates`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
        authorization: `Bearer ${token}`
       },
      body: JSON.stringify(candidateData),
    });

    if (response.ok) {
      toast.success("Candidate added successfully!");
      setShowAddDialog(false);
      loadCandidates();
    } else {
      toast.error("Failed to add candidate");
    }
  } catch (error) {
    console.error("Add candidate error:", error);
    toast.error("Failed to add candidate");
  }
};


 const filteredCandidates = candidates.filter(candidate => {
  const name = (candidate.name??"").toLowerCase();
  const email = (candidate.email??"").toLowerCase();
  const position = (candidate.position??"").toLowerCase();
  // const skills = Array.isArray(candidate.skills) ? candidate.skills : [];

  return (
    name.includes(searchTerm.toLowerCase()) ||
    email.includes(searchTerm.toLowerCase()) ||
    position.includes(searchTerm.toLowerCase()) 
    // skills.some(skill => skill?.toLowerCase().includes(searchTerm.toLowerCase()))
  );
});


  console.log('Filtered Candidates:', candidates);

 const getStageColor = (stage?: string) => {
  switch ((stage ?? "").toLowerCase()) {
    case "applied": return "bg-gray-100 text-gray-800";
    case "screening": return "bg-blue-100 text-blue-800";
    case "interview": return "bg-yellow-100 text-yellow-800";
    case "offer": return "bg-green-100 text-green-800";
    case "hired": return "bg-emerald-100 text-emerald-800";
    case "rejected": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

  const getSourceColor = (source: string) => {
    switch ((source??"").toLowerCase()) {
      case 'linkedin': return 'bg-blue-100 text-blue-800';
      case 'referral': return 'bg-purple-100 text-purple-800';
      case 'job board': return 'bg-orange-100 text-orange-800';
      case 'agency': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
    ));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidate Management</h1>
          <p className="text-gray-600">Manage candidate pipeline and applications</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Candidate
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Candidate</DialogTitle>
              <DialogDescription>Fill candidate details below.</DialogDescription>
            </DialogHeader>

            <CandidateForm
              onSubmit={handleAddCandidate}
              onCancel={() => setShowAddDialog(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search candidates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Stages</SelectItem>
            <SelectItem value="applied">Applied</SelectItem>
            <SelectItem value="screening">Screening</SelectItem>
            <SelectItem value="interview">Interview</SelectItem>
            <SelectItem value="offer">Offer</SelectItem>
            <SelectItem value="hired">Hired</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
        {/* <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button> */}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Applied</TableHead>
                <TableHead>Recruiter</TableHead>
                {/* <TableHead>Actions</TableHead> */}
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
                    {/* <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell> */}
                  </TableRow>
                ))
              ) : (
                filteredCandidates.map((candidate) => (
                  <TableRow onClick={()=>navigate(`/candidates/${candidate.id}`)} key={candidate.id}
                    className="border  border-gray-200 rounded-lg shadow-sm transition-all duration-200 ease-in-out hover:shadow-lg hover:bg-blue-50 hover:-translate-y-[2px] cursor-pointer">
                    <TableCell >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{candidate.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{candidate.name}</div>
                          <div className="text-sm text-gray-500 flex items-center space-x-2">
                            <Mail className="h-3 w-3" />
                            <span>{candidate.email}</span>
                          </div>
                          <div className="text-sm text-gray-500 flex items-center space-x-2">
                            <MapPin className="h-3 w-3" />
                            <span>{candidate.location}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{candidate.position}</div>
                        <div className="text-sm text-gray-500">{candidate.requisition_id}</div>
                        <div className="text-sm text-gray-500">{candidate.experience} yrs</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStageColor(candidate.stage)}>
                        {candidate.stage ?? "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {renderStars(candidate.rating)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getSourceColor(candidate.source)}>
                        {candidate.source ?? "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(candidate.applied_date).toLocaleDateString()}</div>
                        <div className="text-gray-500">
                          Last: {new Date(candidate.last_activity).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{candidate.recruiter}</TableCell>
                    {/* <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell> */}
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