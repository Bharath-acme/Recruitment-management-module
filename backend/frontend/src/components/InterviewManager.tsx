import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useAuth } from './AuthProvider';
import { SideDrawer } from './invoices/InvoiceDialog';
import { 
  Plus, 
  Search, 
  Calendar as CalendarIcon, 
  Clock, 
  Video,
  MapPin,
  Users,
  Eye,
  Edit,
  CheckCircle2,
  XCircle,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from "react-router-dom";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import InterviewScheduler from './interviews/ParentForom';


interface InterviewManagerProps {
  selectedCompany: string;
  selectedCountry: string;
}

interface Interview {
  id: string;
  candidateName: string;
  candidateEmail: string;
  position: string;
  requisition_id: string;
  interviewType: string;
  mode: string;
  datetime: string;
  duration: number;
  location: string;
  meetingLink?: string;
  interviewers: string[];
  status: string;
  feedback?: string;
  score?: number;
  notes?: string;
  createdDate: string;
  cadidate_id: string;
  company_id:number;
  candidate: { id: string; name: string; email: string; position: string; requisition_id: string};
  requisition: { id: string; position: string };
}

export function InterviewManager({ selectedCompany, selectedCountry }: InterviewManagerProps) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [open,setOpen] = useState(false)


  const [newInterview, setNewInterview] = useState({
    candidateName: '',
    candidateEmail: '',
    position: '',
    requisition_id: '',
    interviewType: 'technical',
    mode: 'video',
    date: '',
    time: '',
    duration: 60,
    location: '',
    interviewers: '',
    cadidate_id: '',
    company_id:null
  });

  const token = localStorage.getItem('token');
  const {user} = useAuth()

  const [candidates, setCandidates] = useState<
  { id:string, email: string; name: string; position: string; requisition_id: string }[]
>([]);
const navigate = useNavigate();

useEffect(() => {
  fetch(`${API_BASE_URL}/candidates`)
  fetch("http://localhost:8000/candidates", {
      headers: { 'Content-Type': 'application/json',
        authorization: `Bearer ${token}`
       }
    })
    .then((res) => res.json())
    .then((data) => setCandidates(data));

    loadInterviews();
}, []);
console.log("Candidates:", candidates); 

  useEffect(() => {
    loadInterviews();
  }, [selectedCompany, selectedCountry, statusFilter]);

  const loadInterviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/interviews`, {
        headers: {
         
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json();
        setInterviews(data || []);
        console.log("Fetched interviews:", data);
      } else {
        
      }
    } catch (error) {
      console.error('Interviews load error:', error);
     
    } finally {
      setLoading(false);
    }
  };

 
 const handleScheduleInterview = async () => {
  try {

     const datetime = newInterview.date && newInterview.time
      ? new Date(`${newInterview.date}T${newInterview.time}`).toISOString()
      : '';
    const payload = {
      candidate_id: newInterview.cadidate_id,

      requisition_id: String(newInterview.requisition_id),
      interview_type: newInterview.interviewType,
      mode: newInterview.mode,
      datetime,
      duration: newInterview.duration,
      location: newInterview.location,
      interviewers: newInterview.interviewers.split(",").map(i => i.trim())
    };
  const response = await fetch(`${API_BASE_URL}/interviews`, {
   
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      toast.success("Interview scheduled successfully!");
      setShowScheduleDialog(false);
      loadInterviews();
      
    } else {
      toast.error("Failed to schedule interview");
    }
  } catch (err) {
    console.error(err);
    toast.error("Failed to schedule interview");
  }
};


  const filteredInterviews = interviews.filter(interview =>
    interview.candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interview.requisition.position.toLowerCase().includes(searchTerm.toLowerCase()) 
   
  );

  const getStatusColor = (status: string) => {
    switch ((status??'').toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch ((type??'').toLowerCase()) {
      case 'technical': return 'bg-purple-100 text-purple-800';
      case 'behavioral': return 'bg-green-100 text-green-800';
      case 'cultural': return 'bg-blue-100 text-blue-800';
      case 'portfolio review': return 'bg-orange-100 text-orange-800';
      case 'final': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDateTime = (datetime: string) => {
    const date = new Date(datetime);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  const isToday = (datetime: string) => {
    const today = new Date();
    const interviewDate = new Date(datetime);
    return today.toDateString() === interviewDate.toDateString();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Interview Management</h1>
          <p className="text-gray-600">Schedule and manage candidate interviews</p>
        </div>

         {/* <Button onClick={()=>setOpen(true) }>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Interview
          </Button>

        <SideDrawer open={open} onClose={() => setOpen(false)}>
          <InterviewScheduler/>
        </SideDrawer> */}

       {user?.company?.name?.trim().toLowerCase() === 'acme global hub' && user?.role === 'recruiter' &&( <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
               {/* <InterviewScheduler/> */}
            <DialogHeader>
              <DialogTitle>Schedule New Interview</DialogTitle>
              <DialogDescription>
                Fill in the details below to schedule a new interview with the candidate.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                
                <div>
                <Label htmlFor="candidateEmail">Candidate Email</Label>
                <Select 
                  value={newInterview.candidateEmail || ''} 
                  onValueChange={(value: any) => {
                    setNewInterview({ ...newInterview, candidateEmail: value });
                    const selectedCandidate = candidates.find(c => c.email === value);
                    if (selectedCandidate) {
                      setNewInterview({
                        ...newInterview,
                        candidateEmail: value,
                        cadidate_id: selectedCandidate.id,
                        candidateName: selectedCandidate.name,
                        position: selectedCandidate.position,
                        requisition_id: selectedCandidate.requisition_id,
                        company_id:selectedCandidate.company_id
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select candidate email" />
                  </SelectTrigger>
                  <SelectContent>
                    {candidates.map((c) => (
                      <SelectItem key={c.email} value={c.email}>
                        {c.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                  <Label htmlFor="candidateName">Candidate Name</Label>
                  <Input
                    id="candidateName"
                    value={newInterview.candidateName || ''}
                    onChange={(e) => setNewInterview({...newInterview, candidateName: e.target.value})}
                    placeholder="Ahmed Al-Rashid"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={newInterview.position || ''}
                    onChange={(e) => setNewInterview({...newInterview, position: e.target.value})}
                    placeholder="Senior Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="requisitionId">Requisition ID</Label>
                  <Input
                    id="requisitionId"
                    value={newInterview.requisition_id ||''}
                    onChange={(e) => setNewInterview({...newInterview, requisition_id: e.target.value})}
                    placeholder="REQ-2025-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="interviewType">Interview Type</Label>
                  <Select value={newInterview.interviewType || ''} onValueChange={(value: any) => setNewInterview({...newInterview, interviewType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="screening">Initial Screening</SelectItem>
                      <SelectItem value="technical">Technical Interview</SelectItem>
                      <SelectItem value="behavioral">Behavioral Interview</SelectItem>
                      <SelectItem value="cultural">Cultural Fit</SelectItem>
                      <SelectItem value="portfolio">Portfolio Review</SelectItem>
                      <SelectItem value="final">Final Interview</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="mode">Interview Mode</Label>
                  <Select value={newInterview.mode || ''} onValueChange={(value: any) => setNewInterview({...newInterview, mode: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video Call</SelectItem>
                      <SelectItem value="phone">Phone Call</SelectItem>
                      <SelectItem value="in-person">In-Person</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newInterview.date || ''}
                    onChange={(e) => setNewInterview({...newInterview, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newInterview.time || ''}
                    onChange={(e) => setNewInterview({...newInterview, time: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newInterview.duration || 0}
                    onChange={(e) => setNewInterview({...newInterview, duration: parseInt(e.target.value) || 60})}
                    min="15"
                    step="15"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location / Meeting Details</Label>
                <Input
                  id="location"
                  value={newInterview.location || ''}
                  onChange={(e) => setNewInterview({...newInterview, location: e.target.value})}
                  placeholder="Conference Room A or Meeting Link"
                />
              </div>

              <div>
                <Label htmlFor="interviewers">Interviewers (comma-separated)</Label>
                <Input
                  id="interviewers"
                  value={newInterview.interviewers || ''}
                  onChange={(e) => setNewInterview({...newInterview, interviewers: e.target.value})}
                  placeholder="Sarah Johnson, Mike Chen"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleScheduleInterview}>
                  Schedule Interview
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>)}
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search interviews..."
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
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      
        <CardContent className="p-0">
           <div className="overflow-x-auto">
            <Table className="w-full border-separate border-spacing-y-3">
            <TableHeader className='border bg-blue-100 rounded-lg shadow-sm'>
              <TableRow>
                <TableHead className=' first:pl-4'>Candidate & Position</TableHead>
                <TableHead>Interview Details</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Interviewers</TableHead>
                <TableHead className='rounded-r-lg'>Actions</TableHead>
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
                  </TableRow>
                ))
              ) : (
                filteredInterviews.map((interview) => {
                  const { date, time } = formatDateTime(interview.datetime);
                  return (
                    <TableRow key={interview.id} 
                     onClick={() => navigate(`/interviews/${interview.id}`)}
                   
                     className="border border-gray-200 rounded-lg shadow-sm transition-all duration-200 ease-in-out hover:shadow-lg hover:bg-blue-50 hover:-translate-y-[2px] cursor-pointer">
                      <TableCell className="border-l-[5px] border-blue-800 pl-4 rounded-l-lg">
                        <div>
                          <div className="font-medium">{interview.candidate.name}</div>
                          <div className="text-sm text-gray-500">{interview.requisition.position}</div>
                          <div className="text-sm text-gray-500">{interview.requisition_id}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge className={getTypeColor(interview.interviewType)}>{interview.interviewType}</Badge>
                          <div className="text-sm text-gray-600 flex items-center">
                            {interview.mode === 'Video Call' && <Video className="h-3 w-3 mr-1" />}
                            {interview.mode === 'In-Person' && <MapPin className="h-3 w-3 mr-1" />}
                            <span>{interview.mode}</span>
                          </div>
                          <div className="text-sm text-gray-500">{interview.duration} min</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                            <span className={isToday(interview.datetime) ? 'font-medium text-blue-600' : ''}>
                              {date}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-gray-400" />
                            <span>{time}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Badge className={getStatusColor(interview.status)}>{interview.status}</Badge>
                          {interview.score && (
                            <div className="text-sm text-gray-600">Score: {interview.score}/5</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {interview.interviewers.map((interviewer, index) => (
                            <div key={index} className="text-sm">{interviewer}</div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {interview.status === 'Scheduled' && (
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {interview.status === 'Completed' && (
                            <Button size="sm" variant="outline">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      
    </div>
  );
}