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
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface InterviewManagerProps {
  selectedCompany: string;
  selectedCountry: string;
}

interface Interview {
  id: string;
  candidateName: string;
  candidateEmail: string;
  position: string;
  requisitionId: string;
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
}

export function InterviewManager({ selectedCompany, selectedCountry }: InterviewManagerProps) {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const [newInterview, setNewInterview] = useState({
    candidateName: '',
    candidateEmail: '',
    position: '',
    requisitionId: '',
    interviewType: 'technical',
    mode: 'video',
    date: '',
    time: '',
    duration: 60,
    location: '',
    interviewers: ''
  });

  useEffect(() => {
    loadInterviews();
  }, [selectedCompany, selectedCountry, statusFilter]);

  const loadInterviews = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-66aec17b/interviews?status=${statusFilter}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setInterviews(data.interviews || []);
      } else {
        loadDemoData();
      }
    } catch (error) {
      console.error('Interviews load error:', error);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = () => {
    setInterviews([
      {
        id: 'INT-001',
        candidateName: 'Ahmed Al-Rashid',
        candidateEmail: 'ahmed.rashid@email.com',
        position: 'Senior Software Engineer',
        requisitionId: 'REQ-2025-001',
        interviewType: 'Technical',
        mode: 'Video Call',
        datetime: '2025-08-30T10:00:00',
        duration: 60,
        location: 'Microsoft Teams',
        meetingLink: 'https://teams.microsoft.com/l/meetup-join/...',
        interviewers: ['Sarah Johnson', 'Mike Chen'],
        status: 'Scheduled',
        createdDate: '2025-08-28'
      },
      {
        id: 'INT-002',
        candidateName: 'Fatima Al-Zahra',
        candidateEmail: 'fatima.zahra@email.com',
        position: 'Product Manager',
        requisitionId: 'REQ-2025-002',
        interviewType: 'Behavioral',
        mode: 'In-Person',
        datetime: '2025-08-30T14:00:00',
        duration: 45,
        location: 'Conference Room A, Dubai Office',
        interviewers: ['Lisa Park', 'John Davis'],
        status: 'Scheduled',
        createdDate: '2025-08-28'
      },
      {
        id: 'INT-003',
        candidateName: 'Omar Hassan',
        candidateEmail: 'omar.hassan@email.com',
        position: 'UI/UX Designer',
        requisitionId: 'REQ-2025-003',
        interviewType: 'Portfolio Review',
        mode: 'Video Call',
        datetime: '2025-08-31T09:00:00',
        duration: 90,
        location: 'Zoom',
        meetingLink: 'https://zoom.us/j/123456789',
        interviewers: ['Emma Wilson'],
        status: 'Completed',
        score: 4,
        feedback: 'Strong design skills, good portfolio presentation',
        createdDate: '2025-08-27'
      }
    ]);
  };

  const handleScheduleInterview = async () => {
    try {
      const interviewData = {
        ...newInterview,
        datetime: `${newInterview.date}T${newInterview.time}:00`,
        interviewers: newInterview.interviewers.split(',').map(i => i.trim()).filter(i => i)
      };

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-66aec17b/interviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(interviewData)
      });

      if (response.ok) {
        toast.success('Interview scheduled successfully!');
        setShowScheduleDialog(false);
        loadInterviews();
        setNewInterview({
          candidateName: '',
          candidateEmail: '',
          position: '',
          requisitionId: '',
          interviewType: 'technical',
          mode: 'video',
          date: '',
          time: '',
          duration: 60,
          location: '',
          interviewers: ''
        });
      } else {
        toast.error('Failed to schedule interview');
      }
    } catch (error) {
      console.error('Schedule interview error:', error);
      toast.error('Failed to schedule interview');
    }
  };

  const filteredInterviews = interviews.filter(interview =>
    interview.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interview.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interview.requisitionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
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
        <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Interview
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Schedule New Interview</DialogTitle>
              <DialogDescription>
                Fill in the details below to schedule a new interview with the candidate.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="candidateName">Candidate Name</Label>
                  <Input
                    id="candidateName"
                    value={newInterview.candidateName}
                    onChange={(e) => setNewInterview({...newInterview, candidateName: e.target.value})}
                    placeholder="Ahmed Al-Rashid"
                  />
                </div>
                <div>
                  <Label htmlFor="candidateEmail">Candidate Email</Label>
                  <Input
                    id="candidateEmail"
                    type="email"
                    value={newInterview.candidateEmail}
                    onChange={(e) => setNewInterview({...newInterview, candidateEmail: e.target.value})}
                    placeholder="ahmed@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={newInterview.position}
                    onChange={(e) => setNewInterview({...newInterview, position: e.target.value})}
                    placeholder="Senior Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="requisitionId">Requisition ID</Label>
                  <Input
                    id="requisitionId"
                    value={newInterview.requisitionId}
                    onChange={(e) => setNewInterview({...newInterview, requisitionId: e.target.value})}
                    placeholder="REQ-2025-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="interviewType">Interview Type</Label>
                  <Select value={newInterview.interviewType} onValueChange={(value) => setNewInterview({...newInterview, interviewType: value})}>
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
                  <Select value={newInterview.mode} onValueChange={(value) => setNewInterview({...newInterview, mode: value})}>
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
                    value={newInterview.date}
                    onChange={(e) => setNewInterview({...newInterview, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newInterview.time}
                    onChange={(e) => setNewInterview({...newInterview, time: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newInterview.duration}
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
                  value={newInterview.location}
                  onChange={(e) => setNewInterview({...newInterview, location: e.target.value})}
                  placeholder="Conference Room A or Meeting Link"
                />
              </div>

              <div>
                <Label htmlFor="interviewers">Interviewers (comma-separated)</Label>
                <Input
                  id="interviewers"
                  value={newInterview.interviewers}
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
        </Dialog>
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

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate & Position</TableHead>
                <TableHead>Interview Details</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Interviewers</TableHead>
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
                  </TableRow>
                ))
              ) : (
                filteredInterviews.map((interview) => {
                  const { date, time } = formatDateTime(interview.datetime);
                  return (
                    <TableRow key={interview.id} className={isToday(interview.datetime) ? 'bg-blue-50' : ''}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{interview.candidateName}</div>
                          <div className="text-sm text-gray-500">{interview.position}</div>
                          <div className="text-sm text-gray-500">{interview.requisitionId}</div>
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
        </CardContent>
      </Card>
    </div>
  );
}