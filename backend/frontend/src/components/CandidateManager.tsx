import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Avatar, AvatarFallback } from './ui/avatar';
import {
  Plus,
  Search,
  Star,
  Mail,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import CandidateForm from './CandidateForm';
import { useAuth } from './AuthProvider';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface CandidateManagerProps {
  selectedCompany: string;
  selectedCountry: string;
}

export interface Candidate {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  position?: string;
  requisition_id?: string;
  stage?: string;
  status?: string;
  rating?: number;
  experience?: number;
  skills?: string[];
  source?: string;
  applied_date?: string;
  last_activity?: string;
  recruiter?: string;
  resumeUrl?: string;
  notes?: string;
  current_ctc?: string;
  expected_ctc?: string;
  notice_period?: string;
  current_company?: string;
  dob?: string;
  marital_status?: string;
  nationality?: string;
  company_id?:number;
}

export function CandidateManager({ selectedCompany, selectedCountry }: CandidateManagerProps) {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeStage, setActiveStage] = useState<string>('all'); // default is "all"
  const [showAddDialog, setShowAddDialog] = useState(false);

  const { user, allCompanies } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const isAcmeUser = user?.company?.name?.toLowerCase() === "acme global hub pvt ltd";

  useEffect(() => {
    loadCandidates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompany, selectedCountry]);

  const loadCandidates = async () => {
    setLoading(true);
    try {
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

        const url = new URL(`${API_BASE_URL}/candidates`);
        if (companyIdToFilter) {
            url.searchParams.append("company_id", companyIdToFilter.toString());
        }

      const response = await fetch(url.toString(), {
        headers: {
          authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCandidates(Array.isArray(data) ? data : data.candidates || []);
      } else {
        console.error('Failed to fetch candidates');
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
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
        },
        body: candidateData,
      });

      if (response.ok) {
        toast.success('Candidate added successfully!');
        setShowAddDialog(false);
        loadCandidates();
      } else {
        toast.error('Failed to add candidate');
      }
    } catch (error) {
      console.error('Add candidate error:', error);
      toast.error('Failed to add candidate');
    }
  };

  // tolerant mapping: maps DB status → pipeline tab key
  const mapStatusToStage = (status?: string) => {
    const s = (status || '').toLowerCase().trim();

    if (!s) return 'screening'; // default fallback

    // tolerant checks using includes for variations
    // if (s.includes('new')) return 'screening';
    if (s.includes('approve') || s === 'approved') return 'selected'; // approve / approved
    if (s === 'selected' || s.includes('selected')) return 'Job offer';
    if (s.includes('offer')) return 'offer proposal';
    if (s.includes('hire')) return 'hired';
    if (s.includes('reject')) return 'rejected';

    // final fallback
    return 'screening';
  };

  const stages = ['all',  'selected', 'Job offer', 'hired', 'rejected'];

  // memoize filtered candidates for performance
  const filteredCandidates = useMemo(() => {
    const search = (searchTerm || '').toLowerCase().trim();

    return candidates.filter((candidate) => {
      // if active stage is all -> include every candidate (fast path)
      if (activeStage === 'all' && !search) return true;

      // search matching
      const name = (candidate.name || '').toLowerCase();
      const email = (candidate.email || '').toLowerCase();
      const position = (candidate.position || '').toLowerCase();

      const matchesSearch =
        !search ||
        name.includes(search) ||
        email.includes(search) ||
        position.includes(search);

      // map status to stage and compare
      const candidateStage = mapStatusToStage(candidate.status);
      const matchesStage = activeStage === 'all' ? true : candidateStage === activeStage;

      return matchesSearch && matchesStage;
    });
  }, [candidates, searchTerm, activeStage]);

  const getStageColor = (stage?: string) => {
    switch ((stage || '').toLowerCase()) {
      case 'screening':
        return 'bg-blue-100 text-blue-800';
      case 'selected':
        return 'bg-purple-100 text-purple-800';
      case 'offer proposal':
        return 'bg-yellow-100 text-yellow-800';
      case 'hired':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceColor = (source?: string) => {
    switch ((source || '').toLowerCase()) {
      case 'linkedin':
        return 'bg-blue-100 text-blue-800';
      case 'referral':
        return 'bg-purple-100 text-purple-800';
      case 'job board':
        return 'bg-orange-100 text-orange-800';
      case 'agency':
        return 'bg-teal-100 text-teal-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating?: number) => {
    const r = Math.max(0, Math.min(5, rating || 0));
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < r ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Candidate Management</h1>
          <p className="text-gray-600">Manage candidate pipeline and applications</p>
        </div>

        {user?.company?.name?.trim().toLowerCase() === 'acme global hub pvt ltd' && user?.role === 'recruiter' &&(
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
              <CandidateForm onSubmit={handleAddCandidate} onCancel={() => setShowAddDialog(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-wrap items-center border-b pb-2 justify-between gap-4">
        <div className="flex space-x-6">
          {stages.map((stage) => (
            <button
              key={stage}
              onClick={() => setActiveStage(stage)}
              className={`pt-2 text-md font-medium border-b-2 pb-1 transition-all cursor-pointer capitalize ${
                activeStage === stage
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-blue-600'
              }`}
            >
              {stage}
            </button>
          ))}
        </div>

        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 border rounded-full"
          />
        </div>
      </div>

      {/* Candidate Table */}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="w-full border-separate border-spacing-y-3">
            <TableHeader className="border bg-blue-100 rounded-lg shadow-sm">
              <TableRow>
                <TableHead className="first:pl-18 border-l rounded-l-lg">Candidate</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rating</TableHead>
                {user?.company?.name?.trim().toLowerCase() === 'acme global hub pvt ltd' && <TableHead>Source</TableHead>}
                <TableHead>Applied</TableHead>
                <TableHead className="rounded-r-lg">Recruiter</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {[...Array(7)].map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filteredCandidates.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                    No candidates found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCandidates.map((candidate) => {
                  const stageDisplay = mapStatusToStage(candidate.status);

                  return (
                    <TableRow
                      onClick={() => navigate(`/candidates/${candidate.id}`)}
                      key={candidate.id}
                      className="border border-gray-200 rounded-lg shadow-sm transition-all duration-200 ease-in-out hover:shadow-lg hover:bg-blue-50 hover:-translate-y-[2px] cursor-pointer"
                    >
                      <TableCell className="border-l-[5px] border-blue-800 pl-4 rounded-l-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{(candidate.name || '').split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{candidate.name}</div>

                            {user?.company?.name?.trim().toLowerCase() === 'acme global hub pvt ltd' && (
                              <div className="text-sm text-gray-500 flex items-center space-x-2">
                                <Mail className="h-3 w-3" />
                                <span>{candidate.email}</span>
                              </div>
                            )}

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
                          <div className="text-sm text-gray-500">Req-id: {candidate.requisition_id}</div>
                          <div className="text-sm text-gray-500">{candidate.experience ?? 0} yrs</div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge className={getStageColor(stageDisplay)}>{stageDisplay ?? 'N/A'}</Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center space-x-1">{renderStars(candidate.rating)}</div>
                      </TableCell>

                      {user?.company?.name?.trim().toLowerCase() === 'acme global hub pvt ltd' && (
                        <TableCell>
                          <Badge variant="outline" className={getSourceColor(candidate.source)}>
                            {candidate.source ?? 'N/A'}
                          </Badge>
                        </TableCell>
                      )}

                      <TableCell>
                        <div className="text-sm">
                          <div>{candidate.applied_date ? new Date(candidate.applied_date).toLocaleDateString() : 'N/A'}</div>
                          <div className="text-gray-500">
                            Last: {candidate.last_activity ? new Date(candidate.last_activity).toLocaleDateString() : 'N/A'}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>{candidate.recruiter ?? 'N/A'}</TableCell>
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
