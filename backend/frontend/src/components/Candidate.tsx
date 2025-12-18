import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// import * as Dialog from '@radix-ui/react-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from "./ui/button";
import { Star, Upload, X } from "lucide-react";
import { Candidate } from './CandidateManager';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import CandidateForm from './CandidateForm';
import { formatDate } from '../utils/Utils';
import { ResumeDialog } from './ResumePreview';
import { Capitalize } from '../utils/Utils';

import { 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  User, 
  TrendingUp,
  FileText,
  Clock,
  DollarSign,
  Building,
  Award,
  Heart,
  Globe,
  Download,
  MessageSquare,
  Activity,
  ThumbsUp,
  AlertCircle
} from "lucide-react";

import { Badge } from "./ui/badge";
import { Avatar } from "./ui/avatar";
import { AvatarImage, AvatarFallback } from "./ui/avatar";

import { Separator } from "./ui/separator";
import { Progress } from "./ui/progress";
import { useAuth } from './AuthProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface CandidateLog {
  id: number;
  candidate_id: string;
  requisition_id?: number;
  action: string;
  details: string;
  timestamp: string;       // ISO string
  username?: string | null; // user who performed the action
}

interface InterviewFeedback {
  id: number;
  interviewer: string;
  date: string;
  stage: string;
  rating: number;
  strengths: string[];
  areasOfImprovement: string[];
  comments: string;
  recommendation: string;
}

export default function CandidateProfile() {

const { id } = useParams<{ id: string }>();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
   const [showAddDialog, setShowAddDialog] = useState(false);
   const [showFeedback, setShowFeedback] = useState(false);
   const [logs, setLogs] = useState<CandidateLog[]>([]);
   const [logsLoading, setLogsLoading] = useState(true);
   const [feedbacks, setFeedbacks] = useState<InterviewFeedback[]>([])
   const { user } = useAuth();
   const [showRejectDialog, setShowRejectDialog] = useState(false);
   const [rejectReason, setRejectReason] = useState("");
  const [candidate, setCandidate] = useState<Candidate | null>(null);

  const navigate = useNavigate();

  const [currentRating, setCurrentRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

 useEffect(() => {
  if (!id) return;

  const fetchCandidate = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/candidates/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 🔒 include token
        },
      });

      if (!res.ok) {
        console.error("Failed to fetch candidate:", res.status);
        setCandidate(null);
        return;
      }

      const data = await res.json();

      // 👇 handle missing (masked) fields gracefully
      const safeData = {
        ...data,
        email: data.email || "Hidden",
        phone: data.phone || "Hidden",
        resume_url: data.resume_url || null,
        source: data.source || "Hidden",
      };

      setCandidate(safeData);
      setCurrentRating(safeData.rating || 0);
    } catch (err) {
      console.error("Error fetching candidate:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchCandidate();
  fetchLogs();
}, [id, token]); // 👈 add token if it’s used inside



  const fetchLogs = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/candidates/${id}/activity-logs`);
      if (!res.ok) throw new Error("Failed to fetch candidate logs");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Error fetching candidate logs:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  
  const handleRatingClick = (value: number) => {
    if (!candidate) return;
    setCurrentRating(value);
    setCandidate({ ...candidate, rating: value });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCandidate({ ...candidate, [name]: value });
  };

  const handleUpdateCandidate = async (updatedData: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/candidates/${candidate.id}`, {
        method: "PUT", // or PATCH depending on your API
        headers: {
          "Content-Type": "application/json",
           authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedData),
      });
      if (response.ok) {
        const updatedCandidate = await response.json();
        toast.success("Candidate updated successfully!");
        setCandidate(updatedCandidate); // update state
        setShowAddDialog(false); // close dialog
        const res = await fetch(`${API_BASE_URL}/candidates/${candidate.id}/activity-logs`);
        setLogs(await res.json());
      } else {
        toast.error("Failed to update candidate");
      }
    } catch (error) {
      console.error("Update candidate error:", error);
      toast.error("Failed to update candidate");
    }
  };

  const updateStatus = async (newStatus: string, reason?: string) => {
  try {
    const payload: any = { status: newStatus };

    if (reason) payload.reject_reason = reason;

    const response = await fetch(`${API_BASE_URL}/candidates/${candidate.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const updatedCandidate = await response.json();
      setCandidate(updatedCandidate);
      toast.success("Status updated");
      fetchLogs();
    } else {
      toast.error("Failed to update status");
    }
  } catch (error) {
    console.error("Status update failed:", error);
    toast.error("Error updating status");
  }
};



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!candidate) return <p>No candidate found</p>;


  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'selected': 'bg-green-100 text-green-700 border-green-200',
      'new': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Rejected': 'bg-red-100 text-red-700 border-red-200',
      "approved" : 'bg-green-100 text-green-700 border-green-400'
    };
    return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStageColor = (stage: string) => {
    const colors: { [key: string]: string } = {
      'Screening': 'bg-blue-100 text-blue-700 border-blue-200',
      'Technical Interview': 'bg-purple-100 text-purple-700 border-purple-200',
      'Final Interview': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'Offer': 'bg-green-100 text-green-700 border-green-200',
    };
    return colors[stage] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const formatDateDisplay = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getRecommendationColor = (recommendation: string) => {
    const colors: { [key: string]: string } = {
      'Move Forward': 'bg-blue-100 text-blue-700 border-blue-200',
      'Highly Recommended': 'bg-green-100 text-green-700 border-green-200',
      'Approve Offer': 'bg-purple-100 text-purple-700 border-purple-200',
      'On Hold': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'Reject': 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[recommendation] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const url = candidate.files.map((resume)=>resume.file_url)

  console.log('url',String(url))

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header Card */}
      <Card className="bg-white shadow-lg border-0">
        <div className="p-8">
          <div className="flex flex-row md:flex-row gap-6">
            {/* Avatar Section */}
            <div className="flex flex-col items-center md:items-start">
              <Avatar style={{height:100, width:100}} className=" border-4 border-blue-100">
                {/* <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${candidate.name}`} /> */}
                <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white text-3xl">
                  {getInitials(candidate.name)}
                </AvatarFallback>
              </Avatar>
              <div className="mt-4 flex gap-2">
              
               {/* {user?.role == 'recruiter' &&   */}
               {user?.company?.name?.trim().toLowerCase() == 'acme global hub' ? <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-blue-50 border-blue-200 hover:bg-blue-100">
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Candidate</DialogTitle>
                    <DialogDescription>Fill candidate details below.</DialogDescription>
                  </DialogHeader>

                  <CandidateForm
                        initialData={candidate} 
                        onSubmit={handleUpdateCandidate}
                          onCancel={() =>  setShowAddDialog(false)}
                      />
                </DialogContent>
              </Dialog>:''}
              {/* // } */}
             {user?.company?.name?.trim().toLowerCase() == 'acme global hub' ? <ResumeDialog resumeUrl={String(url)}/>:''}
              {/* <Button variant="outline" size="sm" className="bg-purple-50 border-purple-200 hover:bg-purple-100">
                <Download className="h-4 w-4 mr-2" />
                Resume
              </Button> */}
              
              </div>
            </div>

            {/* Main Info */}
            <div className="flex-1 ">
              <div className="flex flex-row md:flex-col md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-gray-900 font-medium mb-2">{candidate.name}</h1>
                  <p className="text-gray-600 mb-4">{candidate.position}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={`${getStatusColor(candidate.status? candidate.status:'new')} border`}>
                      {candidate.status? candidate.status:'new'}
                    </Badge>
                    <Badge className={`${getStageColor(candidate.stage? candidate.stage:'Technical Interview')} border`}>
                      {candidate.stage? candidate.stage:'Technical Interview'}
                    </Badge>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                      <Star className="h-3 w-3 mr-1 fill-amber-400 text-amber-400" />
                      {candidate.rating}/5
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-gray-600">
                  { user?.company?.name?.trim().toLowerCase() == 'acme global hub' ? <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <span>{candidate.email}</span>
                  </div>:''}
                 {user?.company?.name?.trim().toLowerCase() == 'acme global hub' ? <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-500" />
                    <span>{candidate.phone}</span>
                  </div>:''}
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <span>{candidate.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-purple-500" />
                      <span>{candidate.experience} years experience</span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                {/* <div className="flex flex-col items-center space-y-6">
                    {(user?.role === 'hiring_manager' || user?.role === 'admin') && (
                    <div className="flex gap-3 mb-8">
          
                      {candidate.status === "approved" && (
                          <Button
                            className="bg-blue-100"
                            variant="outline"
                            // onClick={() => updateApprovalStatus("pending")}
                          >
                            Revoke
                          </Button>
                        )}
          
                    {candidate.status === "new" ? (
                          <>
                            <Button
                              className="bg-green-100"
                              variant="outline"
                              onClick={() => updateStatus("approved")}
                            >
                              Select
                            </Button>
                            <Button
                              className="bg-red-100"
                              variant="outline"
                             onClick={() => setShowRejectDialog(true)}
                            >
                              Reject
                            </Button>
                          </>
                        ) : (
                          <Button variant="outline" className={ candidate.status === "approved" ? "bg-green-500 h-9 px-4 py-2 has-[>svg]:px-3":"bg-red-200 text-black"}>
                            {Capitalize(candidate.status)}
                          </Button>
                        )}
                  
                </div>)}

                <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Reason for Rejection</DialogTitle>
                      <DialogDescription>
                        Please provide the reason for rejecting this candidate..
                      </DialogDescription>
                    </DialogHeader>

                    <textarea
                      className="w-full border rounded-md p-2 mt-3"
                      rows={4}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Enter rejection reason..."
                    />

                    <div className="flex justify-end gap-3 mt-4">
                      <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                        Cancel
                      </Button>

                      <Button
                        className="bg-red-500 text-white"
                        onClick={() => {
                          updateStatus("rejected", rejectReason);
                          setShowRejectDialog(false);
                        }}
                      >
                        Submit
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                  <div className="text-center">
                    <p className="text-gray-600 mb-1">Req_id: {candidate.requisition_id}</p>
                    <p className="text-gray-900"></p>
                   </div>
                </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full bg-white hover:bg-blue-50"
                    onClick={() => setShowFeedback(!showFeedback)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {showFeedback ? 'Hide Feedback' : 'View Feedback'}
                  </Button>
                  
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Feedback Section */}
      
      {showFeedback && (
        <Card className="bg-white shadow-lg border-0">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <h2 className="text-gray-900">Interview Feedback</h2>
            </div>
            
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="all">All Feedback</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
                <TabsTrigger value="hr">HR Round</TabsTrigger>
                <TabsTrigger value="final">Final</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {feedbacks.map((feedback) => (
                  <Card key={feedback.id} className="border border-gray-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-blue-500 text-white">
                                {feedback.interviewer.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-gray-900">{feedback.interviewer}</p>
                              <p className="text-gray-600">{feedback.stage}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < feedback.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-gray-600">{formatDateDisplay(feedback.date)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-4 space-y-4">
                      {/* Strengths */}
                      {feedback.strengths.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <ThumbsUp className="h-4 w-4 text-green-600" />
                            <h3 className="text-gray-900">Strengths</h3>
                          </div>
                          <ul className="space-y-1 ml-6">
                            {feedback.strengths.map((strength, idx) => (
                              <li key={idx} className="text-gray-700 list-disc">{strength}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Areas of Improvement*/} 
                      {feedback.areasOfImprovement.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                            <h3 className="text-gray-900">Areas of Improvement</h3>
                          </div>
                          <ul className="space-y-1 ml-6">
                            {feedback.areasOfImprovement.map((area, idx) => (
                              <li key={idx} className="text-gray-700 list-disc">{area}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Comments */}
                      <div>
                        <h3 className="text-gray-900 mb-2">Overall Comments</h3>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{feedback.comments}</p>
                      </div>

                      {/* Recommendation */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-gray-600">Recommendation:</span>
                        <Badge className={`${getRecommendationColor(feedback.recommendation)} border`}>
                          {feedback.recommendation}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="technical" className="space-y-4">
                {feedbacks
                  .filter((f) => f.stage === "Technical Interview")
                  .map((feedback) => (
                    <Card key={feedback.id} className="border border-gray-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-blue-500 text-white">
                                  {feedback.interviewer.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-gray-900">{feedback.interviewer}</p>
                                <p className="text-gray-600">{feedback.stage}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < feedback.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-gray-600">{formatDateDisplay(feedback.date)}</p>
                          </div>
                        </div>
                      </div>
                      
                      <CardContent className="p-4 space-y-4">
                        {feedback.strengths.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <ThumbsUp className="h-4 w-4 text-green-600" />
                              <h3 className="text-gray-900">Strengths</h3>
                            </div>
                            <ul className="space-y-1 ml-6">
                              {feedback.strengths.map((strength, idx) => (
                                <li key={idx} className="text-gray-700 list-disc">{strength}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {feedback.areasOfImprovement.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="h-4 w-4 text-orange-600" />
                              <h3 className="text-gray-900">Areas of Improvement</h3>
                            </div>
                            <ul className="space-y-1 ml-6">
                              {feedback.areasOfImprovement.map((area, idx) => (
                                <li key={idx} className="text-gray-700 list-disc">{area}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div>
                          <h3 className="text-gray-900 mb-2">Overall Comments</h3>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{feedback.comments}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-gray-600">Recommendation:</span>
                          <Badge className={`${getRecommendationColor(feedback.recommendation)} border`}>
                            {feedback.recommendation}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </TabsContent>

              <TabsContent value="hr" className="space-y-4">
                {feedbacks
                  .filter((f) => f.stage === "HR Round")
                  .map((feedback) => (
                    <Card key={feedback.id} className="border border-gray-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-blue-500 text-white">
                                  {feedback.interviewer.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-gray-900">{feedback.interviewer}</p>
                                <p className="text-gray-600">{feedback.stage}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < feedback.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-gray-600">{formatDateDisplay(feedback.date)}</p>
                          </div>
                        </div>
                      </div>
                      
                      <CardContent className="p-4 space-y-4">
                        {feedback.strengths.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <ThumbsUp className="h-4 w-4 text-green-600" />
                              <h3 className="text-gray-900">Strengths</h3>
                            </div>
                            <ul className="space-y-1 ml-6">
                              {feedback.strengths.map((strength, idx) => (
                                <li key={idx} className="text-gray-700 list-disc">{strength}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {feedback.areasOfImprovement.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="h-4 w-4 text-orange-600" />
                              <h3 className="text-gray-900">Areas of Improvement</h3>
                            </div>
                            <ul className="space-y-1 ml-6">
                              {feedback.areasOfImprovement.map((area, idx) => (
                                <li key={idx} className="text-gray-700 list-disc">{area}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div>
                          <h3 className="text-gray-900 mb-2">Overall Comments</h3>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{feedback.comments}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-gray-600">Recommendation:</span>
                          <Badge className={`${getRecommendationColor(feedback.recommendation)} border`}>
                            {feedback.recommendation}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </TabsContent>

              <TabsContent value="final" className="space-y-4">
                {feedbacks
                  .filter((f) => f.stage === "Final Interview")
                  .map((feedback) => (
                    <Card key={feedback.id} className="border border-gray-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-blue-500 text-white">
                                  {feedback.interviewer.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-gray-900">{feedback.interviewer}</p>
                                <p className="text-gray-600">{feedback.stage}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-4 w-4 ${
                                    i < feedback.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-gray-600">{formatDateDisplay(feedback.date)}</p>
                          </div>
                        </div>
                      </div>
                      
                      <CardContent className="p-4 space-y-4">
                        {feedback.strengths.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <ThumbsUp className="h-4 w-4 text-green-600" />
                              <h3 className="text-gray-900">Strengths</h3>
                            </div>
                            <ul className="space-y-1 ml-6">
                              {feedback.strengths.map((strength, idx) => (
                                <li key={idx} className="text-gray-700 list-disc">{strength}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {feedback.areasOfImprovement.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="h-4 w-4 text-orange-600" />
                              <h3 className="text-gray-900">Areas of Improvement</h3>
                            </div>
                            <ul className="space-y-1 ml-6">
                              {feedback.areasOfImprovement.map((area, idx) => (
                                <li key={idx} className="text-gray-700 list-disc">{area}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div>
                          <h3 className="text-gray-900 mb-2">Overall Comments</h3>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{feedback.comments}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-gray-600">Recommendation:</span>
                          <Badge className={`${getRecommendationColor(feedback.recommendation)} border`}>
                            {feedback.recommendation}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </TabsContent>
            </Tabs>
          </div>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width */}
        <div className="lg:col-span-2 space-y-6">
          {/* Professional Details */}
          <Card className="bg-white shadow-md border-0">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
              <h2 className="text-gray-900 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                Professional Information
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-600 mb-1">Current Company</p>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{candidate.current_company || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Notice Period</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{candidate.notice_period || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Current CTC</p>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <p className="text-gray-900">{candidate.current_ctc || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Expected CTC</p>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <p className="text-gray-900">{candidate.expected_ctc || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Source</p>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-gray-400" />
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {candidate.source}
                    </Badge>
                  </div>
                </div>
                <div>
                  <p className="text-gray-600 mb-1">Recruiter</p>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{candidate.recruiter}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Skills */}
          <Card className="bg-white shadow-md border-0">
        <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
          <h2 className="text-gray-900 flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            Skills & Expertise
          </h2>
        </div>

        <div className="p-6">
          <p className="text-gray-800 text-sm">
            {candidate.skills && candidate.skills.length > 0
              ? candidate.skills.map(s => s.name).join(", ")
              : "No skills added"}
          </p>
        </div>
      </Card>
          {/* <Card className="bg-white shadow-md border-0">
            <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
              <h2 className="text-gray-900 flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                Skills & Expertise
              </h2>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, index) => (
                  <Badge 
                    key={index} 
                    variant="outline" 
                    className="bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border-purple-200 px-3 py-1"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </Card> */}

           {/* Timeline */}
          <Card className="bg-white shadow-md border-0">
            <div className="p-6 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100">
              <h2 className="text-gray-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                Timeline
              </h2>
            </div>
            <div className="p-6  space-y-4 flex flex-row justify-between md:flex-col">
              <div>
                <p className="text-gray-600 mb-1">Applied Date</p>
                <p className="text-gray-900">{formatDate(candidate.applied_date)}</p>
              </div>
              {/* <Separator /> */}
              <div>
                <p className="text-gray-600 mb-1">Last Activity</p>
                <p className="text-gray-900">{formatDate(candidate.last_activity)}</p>
              </div>
              {/* <Separator /> */}
              <div>
                <p className="text-gray-600 mb-1">Days in Pipeline</p>
                <p className="text-gray-900">
                  {Math.floor((new Date(candidate.last_activity).getTime() - new Date(candidate.applied_date).getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            </div>
          </Card>

          {/* Notes */}
          {candidate.notes && (
            <Card className="bg-white shadow-md border-0">
              <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                <h2 className="text-gray-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-amber-600" />
                  Recruiter Notes
                </h2>
              </div>
              <div className="p-6">
                <p className="text-gray-700 leading-relaxed">{candidate.notes}</p>
              </div>
            </Card>
          )}

             {/* <div className="bg-gray-50 p-6 rounded-xl border mb-8">
            <h2 className="text-xl font-semibold mb-4">Activity Log</h2>

            {logsLoading ? (
              <p className="text-gray-500">Loading activity logs...</p>
            ) : logs.length === 0 ? (
              <p className="text-gray-400">No activity logs found.</p>
            ) : (
              <ul className="space-y-3">
                {logs.map((log) => (
                  <li key={log.id} className="border-b-1 border-blue-100 pl-3 pb-2">
                    <div className='flex'>
                    <img src={profileLogo} alt="User Avatar" className="h-8 w-8 rounded-full inline-block mr-3" />
                    <div >
                      <div>
                      <span className="font-medium text-gray-800 mr-4">
                        {log.username}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                      <p className="text-gray-600 text-sm">{log.details}</p>
                      </div>
                    </div>
                    </div>
                    
                  </li>
                ))}
              </ul>
            )}
          </div> */}
        </div>

        {/* Right Column - 1/3 width */}
        <div className="space-y-6">
          {/* Personal Details */}
          <Card className="bg-white shadow-md border-0">
            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100">
              <h2 className="text-gray-900 flex items-center gap-2">
                <User className="h-5 w-5 text-green-600" />
                Personal Details
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-gray-600 mb-1">Date of Birth</p>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-900">{candidate.dob ? formatDate(candidate.dob) : 'N/A'}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-gray-600 mb-1">Marital Status</p>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-900">{candidate.marital_status || 'N/A'}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-gray-600 mb-1">Nationality</p>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <p className="text-gray-900">{candidate.nationality || 'N/A'}</p>
                </div>
              </div>
            </div>
          </Card>

         

          {/* Rating Breakdown */}
          {/* <Card className="bg-white shadow-md border-0">
            <div className="p-6 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100">
              <h2 className="text-gray-900 flex items-center gap-2">
                <Star className="h-5 w-5 text-rose-600" />
                Overall Rating
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-700">Rating Score</span>
                <span className="text-gray-900">{candidate.rating}/5.0</span>
              </div>
              <Progress value={candidate.rating * 20} className="h-3 bg-gray-100">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all rounded-full" 
                  style={{ width: `${candidate.rating * 20}%` }}
                />
              </Progress>
              <div className="mt-4 flex justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-6 w-6 ${
                      star <= candidate.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </Card> */}
        </div>
      </div>
      {user?.company?.name?.trim().toLowerCase() == 'acme global' &&  <Card className="bg-white border border-indigo-100 shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100">
                <CardTitle className="flex items-center gap-2 text-indigo-900">
                  <Activity className="w-5 h-5" />
                  Activity Logs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {logs.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">No activities yet.</p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {logs.map((log, index) => (
                      <li 
                        key={log.id} 
                        className={`p-4 rounded-lg border ${
                          index % 2 === 0 
                            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100' 
                            : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-slate-900 flex items-center gap-2">
                            <User className="w-4 h-4 text-indigo-500" />
                            {log.username}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 ml-6">{log.action}</p>
                        {log.details && (
                          <p className="text-xs text-slate-600 italic ml-6 mt-1 bg-white/50 px-2 py-1 rounded">
                            {log.details}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>}
    </div>
  );
}
