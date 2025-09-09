import React, { useState, useEffect } from 'react';
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
  Calendar,
  FileText,
  MessageSquare
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface CandidateManagerProps {
  selectedCompany: string;
  selectedCountry: string;
}

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  position: string;
  requisitionId: string;
  stage: string;
  status: string;
  rating: number;
  experience: string;
  skills: string[];
  source: string;
  appliedDate: string;
  lastActivity: string;
  recruiter: string;
  resumeUrl?: string;
  notes?: string;
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
    source: 'direct'
  });
  useEffect(() => {
     setCandidates([
      {
        id: 'CND-001',
        name: 'Ahmed Al-Rashid',
        email: 'ahmed.rashid@email.com',
        phone: '+971-50-123-4567',
        location: 'Dubai, UAE',
        position: 'Senior Software Engineer',
        requisitionId: 'REQ-2025-001',
        stage: 'Interview',
        status: 'Active',
        rating: 4,
        experience: '8 years',
        skills: ['React', 'Node.js', 'Python', 'AWS'],
        source: 'LinkedIn',
        appliedDate: '2025-08-25',
        lastActivity: '2025-08-28',
        recruiter: 'Sarah Johnson',
        notes: 'Strong technical background, good cultural fit'
      },
      {
        id: 'CND-002',
        name: 'Fatima Al-Zahra',
        email: 'fatima.zahra@email.com',
        phone: '+966-55-987-6543',
        location: 'Riyadh, KSA',
        position: 'Product Manager',
        requisitionId: 'REQ-2025-002',
        stage: 'Offer',
        status: 'Active',
        rating: 5,
        experience: '6 years',
        skills: ['Product Strategy', 'Analytics', 'Leadership', 'Agile'],
        source: 'Referral',
        appliedDate: '2025-08-20',
        lastActivity: '2025-08-29',
        recruiter: 'Mike Chen',
        notes: 'Excellent product sense, strong leadership skills'
      },
      {
        id: 'CND-003',
        name: 'Omar Hassan',
        email: 'omar.hassan@email.com',
        phone: '+974-33-456-7890',
        location: 'Doha, Qatar',
        position: 'UI/UX Designer',
        requisitionId: 'REQ-2025-003',
        stage: 'Screening',
        status: 'Active',
        rating: 3,
        experience: '4 years',
        skills: ['Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research'],
        source: 'Job Board',
        appliedDate: '2025-08-27',
        lastActivity: '2025-08-28',
        recruiter: 'Lisa Park',
        notes: 'Good portfolio, needs to improve presentation skills'
      }
    ]);
  },[])
  useEffect(() => {
    loadCandidates();

  }, [selectedCompany, selectedCountry, stageFilter]);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-66aec17b/candidates?stage=${stageFilter}`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCandidates(data.candidates || []);
      } else {
        loadDemoData();
      }
    } catch (error) {
      console.error('Candidates load error:', error);
      loadDemoData();
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = () => {
    setCandidates([
      {
        id: 'CND-001',
        name: 'Ahmed Al-Rashid',
        email: 'ahmed.rashid@email.com',
        phone: '+971-50-123-4567',
        location: 'Dubai, UAE',
        position: 'Senior Software Engineer',
        requisitionId: 'REQ-2025-001',
        stage: 'Interview',
        status: 'Active',
        rating: 4,
        experience: '8 years',
        skills: ['React', 'Node.js', 'Python', 'AWS'],
        source: 'LinkedIn',
        appliedDate: '2025-08-25',
        lastActivity: '2025-08-28',
        recruiter: 'Sarah Johnson',
        notes: 'Strong technical background, good cultural fit'
      },
      {
        id: 'CND-002',
        name: 'Fatima Al-Zahra',
        email: 'fatima.zahra@email.com',
        phone: '+966-55-987-6543',
        location: 'Riyadh, KSA',
        position: 'Product Manager',
        requisitionId: 'REQ-2025-002',
        stage: 'Offer',
        status: 'Active',
        rating: 5,
        experience: '6 years',
        skills: ['Product Strategy', 'Analytics', 'Leadership', 'Agile'],
        source: 'Referral',
        appliedDate: '2025-08-20',
        lastActivity: '2025-08-29',
        recruiter: 'Mike Chen',
        notes: 'Excellent product sense, strong leadership skills'
      },
      {
        id: 'CND-003',
        name: 'Omar Hassan',
        email: 'omar.hassan@email.com',
        phone: '+974-33-456-7890',
        location: 'Doha, Qatar',
        position: 'UI/UX Designer',
        requisitionId: 'REQ-2025-003',
        stage: 'Screening',
        status: 'Active',
        rating: 3,
        experience: '4 years',
        skills: ['Figma', 'Adobe Creative Suite', 'Prototyping', 'User Research'],
        source: 'Job Board',
        appliedDate: '2025-08-27',
        lastActivity: '2025-08-28',
        recruiter: 'Lisa Park',
        notes: 'Good portfolio, needs to improve presentation skills'
      }
    ]);
  };

  const handleAddCandidate = async () => {
    try {
      const candidateData = {
        ...newCandidate,
        skills: newCandidate.skills.split(',').map(s => s.trim()).filter(s => s)
      };

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-66aec17b/candidates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(candidateData)
      });

      if (response.ok) {
        toast.success('Candidate added successfully!');
        setShowAddDialog(false);
        loadCandidates();
        setNewCandidate({
          name: '',
          email: '',
          phone: '',
          location: '',
          position: '',
          requisitionId: '',
          experience: '',
          skills: '',
          source: 'direct'
        });
      } else {
        toast.error('Failed to add candidate');
      }
    } catch (error) {
      console.error('Add candidate error:', error);
      toast.error('Failed to add candidate');
    }
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'applied': return 'bg-gray-100 text-gray-800';
      case 'screening': return 'bg-blue-100 text-blue-800';
      case 'interview': return 'bg-yellow-100 text-yellow-800';
      case 'offer': return 'bg-green-100 text-green-800';
      case 'hired': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source.toLowerCase()) {
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
              <DialogDescription>
                Add a new candidate to the system by filling in their details below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newCandidate.name}
                    onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})}
                    placeholder="Ahmed Al-Rashid"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCandidate.email}
                    onChange={(e) => setNewCandidate({...newCandidate, email: e.target.value})}
                    placeholder="ahmed@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newCandidate.phone}
                    onChange={(e) => setNewCandidate({...newCandidate, phone: e.target.value})}
                    placeholder="+971-50-123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newCandidate.location}
                    onChange={(e) => setNewCandidate({...newCandidate, location: e.target.value})}
                    placeholder="Dubai, UAE"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position">Position Applied For</Label>
                  <Input
                    id="position"
                    value={newCandidate.position}
                    onChange={(e) => setNewCandidate({...newCandidate, position: e.target.value})}
                    placeholder="Senior Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    value={newCandidate.experience}
                    onChange={(e) => setNewCandidate({...newCandidate, experience: e.target.value})}
                    placeholder="5 years"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="requisitionId">Requisition ID</Label>
                  <Input
                    id="requisitionId"
                    value={newCandidate.requisitionId}
                    onChange={(e) => setNewCandidate({...newCandidate, requisitionId: e.target.value})}
                    placeholder="REQ-2025-001"
                  />
                </div>
                <div>
                  <Label htmlFor="source">Source</Label>
                  <Select value={newCandidate.source} onValueChange={(value) => setNewCandidate({...newCandidate, source: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">Direct Application</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="job-board">Job Board</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="agency">Agency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  value={newCandidate.skills}
                  onChange={(e) => setNewCandidate({...newCandidate, skills: e.target.value})}
                  placeholder="React, Node.js, Python, AWS"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCandidate}>
                  Add Candidate
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
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
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
                filteredCandidates.map((candidate) => (
                  <TableRow key={candidate.id}>
                    <TableCell>
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
                        <div className="text-sm text-gray-500">{candidate.requisitionId}</div>
                        <div className="text-sm text-gray-500">{candidate.experience} experience</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStageColor(candidate.stage)}>{candidate.stage}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {renderStars(candidate.rating)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getSourceColor(candidate.source)}>
                        {candidate.source}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(candidate.appliedDate).toLocaleDateString()}</div>
                        <div className="text-gray-500">
                          Last: {new Date(candidate.lastActivity).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{candidate.recruiter}</TableCell>
                    <TableCell>
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