import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import { Separator } from "./ui/separator";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  Video,
  Mail,
  Building2,
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Save,
  Edit2,
  Share2,
  FileText,
  MessagesSquare,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner@2.0.3";

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || "http://localhost:8000";

interface Interview {
  id: string;
  candidate_id: string;
  requisition_id: string;
  interview_type: string;
  mode: string;
  datetime: string;
  duration: number;
  location: string;
  interviewers: string[];
  status: string;
  feedback?: string;
  score?: number;
  notes?: string;
  candidate: { 
    id: string; 
    name: string; 
    email: string; 
    position: string; 
    requisition_id: string;
    phone?: string;
  };
  requisition: { 
    id: string; 
    position: string;
    department?: string;
  };
}

interface ScorecardData {
  technical_score: number;
  behavioral_score: number;
  cultural_score: number;
  technical_comments: string;
  behavioral_comments: string;
  cultural_comments: string;
  overall_recommendation: string;
  overall_comments: string;
}

export function InterviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Scorecard State
  const [scorecard, setScorecard] = useState<ScorecardData>({
    technical_score: 0,
    behavioral_score: 0,
    cultural_score: 0,
    technical_comments: "",
    behavioral_comments: "",
    cultural_comments: "",
    overall_recommendation: "",
    overall_comments: "",
  });

  // Fetch interview data
  useEffect(() => {
    if (!id) return;
    
    const fetchInterview = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/interviews/${id}`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setInterview(data);
        } else {
          console.error('Failed to fetch interview');
          setInterview(null);
          toast.error("Failed to load interview details");
        }
      } catch (error) {
        console.error('Interview fetch error:', error);
        setInterview(null);
        toast.error("Error loading interview details");
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [id]);

  // Helper Functions
  const formatDate = (dt: string) => {
    return new Date(dt).toLocaleDateString("en-US", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dt: string) => {
    return new Date(dt).toLocaleTimeString("en-US", { 
      hour: "2-digit", 
      minute: "2-digit",
      hour12: true 
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return { 
          bg: "bg-green-50", 
          text: "text-green-700", 
          border: "border-green-200",
          icon: CheckCircle2,
          iconColor: "text-green-600"
        };
      case "scheduled":
        return { 
          bg: "bg-blue-50", 
          text: "text-blue-700", 
          border: "border-blue-200",
          icon: CalendarIcon,
          iconColor: "text-blue-600"
        };
      case "cancelled":
        return { 
          bg: "bg-red-50", 
          text: "text-red-700", 
          border: "border-red-200",
          icon: XCircle,
          iconColor: "text-red-600"
        };
      default:
        return { 
          bg: "bg-yellow-50", 
          text: "text-yellow-700", 
          border: "border-yellow-200",
          icon: AlertCircle,
          iconColor: "text-yellow-600"
        };
    }
  };

  const handleScoreChange = (field: keyof ScorecardData, value: string | number) => {
    setScorecard(prev => ({ ...prev, [field]: value }));
  };

  const validateScorecard = (): boolean => {
    if (scorecard.technical_score < 1 || scorecard.technical_score > 10) {
      toast.error("Technical score must be between 1 and 10");
      return false;
    }
    if (scorecard.behavioral_score < 1 || scorecard.behavioral_score > 10) {
      toast.error("Behavioral score must be between 1 and 10");
      return false;
    }
    if (scorecard.cultural_score < 1 || scorecard.cultural_score > 10) {
      toast.error("Cultural fit score must be between 1 and 10");
      return false;
    }
    if (!scorecard.overall_recommendation) {
      toast.error("Please select an overall recommendation");
      return false;
    }
    return true;
  };

  const handleSubmitScorecard = async () => {
    if (!validateScorecard()) return;

    setSubmitting(true);
    try {
      // TODO: Replace with actual API endpoint when available
      const response = await fetch(`${API_BASE_URL}/interviews/${id}/scorecard`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(scorecard)
      });

      if (response.ok) {
        toast.success("Scorecard submitted successfully!");
        setIsEditing(false);
      } else {
        toast.error("Failed to submit scorecard");
      }
    } catch (error) {
      console.error('Scorecard submission error:', error);
      toast.error("Error submitting scorecard");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    // Save to local storage or state
    localStorage.setItem(`scorecard_draft_${id}`, JSON.stringify(scorecard));
    toast.success("Draft saved locally");
  };

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem(`scorecard_draft_${id}`);
    if (draft) {
      try {
        setScorecard(JSON.parse(draft));
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading interview details...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-gray-900 mb-2">Interview Not Found</h3>
              <p className="text-gray-600 text-sm">The interview you're looking for doesn't exist or has been removed.</p>
            </div>
            <Button onClick={() => navigate(-1)} variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusConfig = getStatusConfig(interview.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        
        {/* Header with Back Button */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Interviews
          </Button>
        </div>

        {/* Main Interview Header Card */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              
              {/* Left: Candidate Info */}
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl">
                      {interview.candidate.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl text-gray-900 mb-1 truncate">
                      {interview.candidate.name}
                    </h1>
                    <p className="text-gray-600 mb-3">
                      {interview.requisition.position}
                    </p>
                  </div>
                </div>
              </div>

              {/* Right: Status and Quick Info */}
              <div className="lg:text-right space-y-3">
                <Badge className={`${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border px-3 py-1.5 gap-2`}>
                  <StatusIcon className={`w-4 h-4 ${statusConfig.iconColor}`} />
                  {interview.status}
                </Badge>


                {interview.location && interview.location.startsWith("http") && (
                  <Button variant="default" size="sm" className="w-full lg:w-auto gap-2" asChild>
                    <a href={interview.location} target="_blank" rel="noopener noreferrer">
                      <Video className="w-4 h-4" />
                      Join Meeting
                    </a>
                  </Button>
                )}
              </div>
            </div>

            <Separator className="my-6" />

            {/* Quick Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Interview Type</p>
                <Badge variant="outline" className="capitalize">
                  {interview.interview_type}
                </Badge>
              </div>
              
              <div>
                <p className="text-gray-500 mb-1">Mode</p>
                <div className="flex items-center gap-2">
                  {interview.mode === "Video Call" || interview.mode === "video" ? (
                    <Video className="w-4 h-4 text-blue-600" />
                  ) : (
                    <MapPin className="w-4 h-4 text-green-600" />
                  )}
                  <span className="text-gray-900">{interview.mode}</span>
                </div>
              </div>
              
              <div>
                <p className="text-gray-500 mb-1">Requisition ID</p>
                <p className="text-gray-900">{interview.requisition_id}</p>
              </div>
              
              <div>
                <p className="text-gray-500 mb-1">Department</p>
                <p className="text-gray-900">{interview.requisition.department || 'Engineering'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Section */}
<<<<<<< HEAD
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 shadow-sm">
=======
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 sha">
>>>>>>> a5888acac09cf0a12d7e98944f7d6e1d7c0daa79
           <TabsList className=" border rounded-lg flex space-x-4 p-2">
           <TabsTrigger
      value="overview"
      className={`px-4 py-2 rounded-md font-medium transition-all duration-200 
        cursor-pointer 
        ${activeTab === "overview" 
          ? "bg-blue-600  shadow-md" 
          : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}
    >
      Overview
    </TabsTrigger>

    <TabsTrigger
      value="scorecard"
      className={`px-4 py-2 rounded-md font-medium transition-all duration-200 
        cursor-pointer 
        ${activeTab === "scorecard" 
          ? "bg-blue-600  shadow-md" 
          : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}
    >
      Submit Scorecard
    </TabsTrigger>

    <TabsTrigger
      value="notes"
      className={`px-4 py-2 rounded-md font-medium transition-all duration-200 
        cursor-pointer 
        ${activeTab === "notes" 
          ? "bg-blue-600 shadow-md" 
          : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}
    >
      Notes & Actions
    </TabsTrigger>
  </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Interview Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    Interview Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-500">Location/Meeting Link</Label>
                    <p className="text-gray-900 mt-1">{interview.location}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label className="text-gray-500">Scheduled Date & Time</Label>
                    <p className="text-gray-900 mt-1">
                      {formatDate(interview.datetime)}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {formatTime(interview.datetime)} ({interview.duration} minutes)
                    </p>
                  </div>
                  
                  {interview.notes && (
                    <>
                      <Separator />
                      <div>
                        <Label className="text-gray-500">Additional Notes</Label>
                        <p className="text-gray-900 mt-1">{interview.notes}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Interview Panel */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-600" />
                    Interview Panel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {interview.interviewers && interview.interviewers.length > 0 ? (
                    <div className="space-y-3">
                      {interview.interviewers.map((interviewer, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm">
                              {interviewer.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-gray-900">{interviewer}</p>
                            <p className="text-sm text-gray-500">
                              {interviewer.toLowerCase().replace(/\s+/g, ".")}@company.com
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <User className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                      <p>No interviewers assigned yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Scorecard Tab */}
          <TabsContent value="scorecard" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Interview Evaluation Scorecard</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Evaluate the candidate's performance across key competencies
                    </p>
                  </div>
                  {!isEditing && (
                    <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2">
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* Technical Skills */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Technical Skills</Label>
                    <span className="text-sm text-gray-500">1-10 scale</span>
                  </div>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={scorecard.technical_score || ''}
                    onChange={(e) => handleScoreChange('technical_score', parseInt(e.target.value) || 0)}
                    disabled={!isEditing}
                    placeholder="Enter score (1-10)"
                    className="max-w-xs"
                  />
                  <Textarea
                    placeholder="Provide detailed feedback on technical competency, problem-solving, and domain knowledge..."
                    value={scorecard.technical_comments}
                    onChange={(e) => handleScoreChange('technical_comments', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>

                <Separator />

                {/* Behavioral Competencies */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Behavioral Competencies</Label>
                    <span className="text-sm text-gray-500">1-10 scale</span>
                  </div>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={scorecard.behavioral_score || ''}
                    onChange={(e) => handleScoreChange('behavioral_score', parseInt(e.target.value) || 0)}
                    disabled={!isEditing}
                    placeholder="Enter score (1-10)"
                    className="max-w-xs"
                  />
                  <Textarea
                    placeholder="Assess communication, teamwork, leadership, and soft skills..."
                    value={scorecard.behavioral_comments}
                    onChange={(e) => handleScoreChange('behavioral_comments', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>

                <Separator />

                {/* Cultural Fit */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Cultural Fit</Label>
                    <span className="text-sm text-gray-500">1-10 scale</span>
                  </div>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={scorecard.cultural_score || ''}
                    onChange={(e) => handleScoreChange('cultural_score', parseInt(e.target.value) || 0)}
                    disabled={!isEditing}
                    placeholder="Enter score (1-10)"
                    className="max-w-xs"
                  />
                  <Textarea
                    placeholder="Evaluate alignment with company values, work style, and team dynamics..."
                    value={scorecard.cultural_comments}
                    onChange={(e) => handleScoreChange('cultural_comments', e.target.value)}
                    disabled={!isEditing}
                    rows={3}
                  />
                </div>

                <Separator />

                {/* Overall Recommendation */}
                <div className="space-y-3">
                  <Label className="text-base">Overall Recommendation</Label>
                  <select
                    value={scorecard.overall_recommendation}
                    onChange={(e) => handleScoreChange('overall_recommendation', e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">Select recommendation</option>
                    <option value="strong_hire">Strong Hire</option>
                    <option value="hire">Hire</option>
                    <option value="maybe">Maybe</option>
                    <option value="no_hire">No Hire</option>
                  </select>
                  
                  <Textarea
                    placeholder="Provide overall assessment and final thoughts..."
                    value={scorecard.overall_comments}
                    onChange={(e) => handleScoreChange('overall_comments', e.target.value)}
                    disabled={!isEditing}
                    rows={4}
                  />
                </div>

                {isEditing && (
                  <div className="flex gap-3 pt-4">
                    <Button 
                      onClick={handleSubmitScorecard} 
                      disabled={submitting}
                      className="gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {submitting ? 'Submitting...' : 'Submit Scorecard'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleSaveDraft}
                      className="gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Save Draft
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scoring Guidelines */}
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base">Scoring Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p><strong>9-10:</strong> Exceptional - Exceeds all expectations</p>
                <p><strong>7-8:</strong> Strong - Meets and exceeds most expectations</p>
                <p><strong>5-6:</strong> Adequate - Meets basic expectations</p>
                <p><strong>3-4:</strong> Below Average - Concerns about key competencies</p>
                <p><strong>1-2:</strong> Poor - Does not meet requirements</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes & Actions Tab */}
          <TabsContent value="notes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessagesSquare className="w-5 h-5 text-blue-600" />
                  Interview Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add private notes about this interview..."
                  rows={6}
                  className="resize-none"
                />
                <div className="flex gap-2 mt-4">
                  <Button className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Notes
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Actions to manage this interview
                  </AlertDescription>
                </Alert>
                
                <div className="grid gap-3">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Reschedule Interview
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Share2 className="w-4 h-4" />
                    Share with Team
                  </Button>
                  <Button variant="outline" className="w-full justify-start gap-2 text-red-600 border-red-200 hover:bg-red-50">
                    <XCircle className="w-4 h-4" />
                    Cancel Interview
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

<<<<<<< HEAD
export default InterviewDetail;
=======
export default InterviewDetail;
>>>>>>> a5888acac09cf0a12d7e98944f7d6e1d7c0daa79
