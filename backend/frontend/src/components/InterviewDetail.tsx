import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  User,
  MapPin,
  Video,
  Mail,
  Building2,
  Users,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Globe,
  AlertCircle,
  FileText,
  Download,
  Eye,
  Send,
  ExternalLink,
  ClipboardList,
  AlertTriangle,
  Save,
  Star,
  TrendingUp,
  TrendingDown,
  ThumbsUp,
  ThumbsDown,
  BarChart3,
  Timer,
} from "lucide-react";
import { motion } from "framer-motion";

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
  candidate: { id: string; name: string; email: string; position: string; requisition_id: string };
  requisition: { id: string; position: string };
}

interface ScoreData {
  technical: number;
  behavioral: number;
  culture: number;
  technicalComments: string;
  behavioralComments: string;
  cultureComments: string;
}

export function InterviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Panel Scheduling State
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [panelMembers, setPanelMembers] = useState<string[]>([]);
  const [availabilityData, setAvailabilityData] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  // Candidate Scheduling State
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [timezone, setTimezone] = useState("America/New_York");
  const [rescheduleReason, setRescheduleReason] = useState("");
  const [showReschedule, setShowReschedule] = useState(false);
  const [showCancel, setShowCancel] = useState(false);

  // Interview Kits State
  const [distributedTo, setDistributedTo] = useState<string[]>([]);

  // Scorecard State
  const [scores, setScores] = useState<ScoreData>({
    technical: 5,
    behavioral: 5,
    culture: 5,
    technicalComments: "",
    behavioralComments: "",
    cultureComments: "",
  });
  const [showWarnings, setShowWarnings] = useState({
    technical: false,
    behavioral: false,
    culture: false,
  });

  // Decision Workspace State
  const [decisionNotes, setDecisionNotes] = useState("");

  // Mock Data
  const availablePanelMembers = [
    { id: "1", name: "Sarah Chen", role: "Senior Engineer", availability: "High" },
    { id: "2", name: "Michael Rodriguez", role: "Tech Lead", availability: "Medium" },
    { id: "3", name: "Priya Sharma", role: "Engineering Manager", availability: "Low" },
    { id: "4", name: "James Wilson", role: "Senior Developer", availability: "High" },
    { id: "5", name: "Emma Thompson", role: "Product Manager", availability: "Medium" },
  ];

  {/*const timeSlots = [
    { time: "09:00 AM", available: true, conflicts: 0 },
    { time: "10:00 AM", available: true, conflicts: 1 },
    { time: "11:00 AM", available: false, conflicts: 3 },
    { time: "02:00 PM", available: true, conflicts: 0 },
    { time: "03:00 PM", available: true, conflicts: 1 },
    { time: "04:00 PM", available: true, conflicts: 0 },
  ];

  const availableSlots = [
    { id: "1", date: "2025-10-28", time: "09:00 AM", timezone: "EST", available: true },
    { id: "2", date: "2025-10-28", time: "02:00 PM", timezone: "EST", available: true },
    { id: "3", date: "2025-10-28", time: "04:00 PM", timezone: "EST", available: true },
    { id: "4", date: "2025-10-29", time: "10:00 AM", timezone: "EST", available: true },
    { id: "5", date: "2025-10-29", time: "03:00 PM", timezone: "EST", available: true },
    { id: "6", date: "2025-10-30", time: "11:00 AM", timezone: "EST", available: false },
  ];

  const timezones = [
    { value: "America/New_York", label: "Eastern Time (EST)" },
    { value: "America/Chicago", label: "Central Time (CST)" },
    { value: "America/Denver", label: "Mountain Time (MST)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PST)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "Asia/Kolkata", label: "India (IST)" },
    { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  ]; */}

  const kitDocuments = [
    {
      id: "1",
      type: "Job Description",
      name: "Senior_Software_Engineer_JD.pdf",
      size: "245 KB",
      lastUpdated: "Oct 15, 2025",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      id: "2",
      type: "Candidate Resume",
      name: "Candidate_Resume.pdf",
      size: "328 KB",
      lastUpdated: "Oct 20, 2025",
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    
  ];

  const feedbackData = [
    {
      interviewer: "Sarah Chen",
      role: "Senior Engineer",
      technical: 8,
      behavioral: 7,
      culture: 9,
      comments: "Strong technical skills, excellent problem-solving approach",
      recommendation: "Strong Hire",
    },
    {
      interviewer: "Michael Rodriguez",
      role: "Tech Lead",
      technical: 9,
      behavioral: 8,
      culture: 8,
      comments: "Impressive system design knowledge and communication skills",
      recommendation: "Hire",
    },
    {
      interviewer: "Priya Sharma",
      role: "Engineering Manager",
      technical: 7,
      behavioral: 9,
      culture: 9,
      comments: "Great cultural fit, strong leadership potential",
      recommendation: "Hire",
    },
     {
      interviewer: "Ankit Sharma",
      role: "Engineering Manager",
      technical: 7,
      behavioral: 9,
      culture: 5,
      comments: "Great cultural fit, strong leadership potential",
      recommendation: "Hire",
    },
  ];

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
          console.log("Fetched interview:", data);
        } else {
          console.error('Failed to fetch interview');
          setInterview(null);
        }
      } catch (error) {
        console.error('Interview fetch error:', error);
        setInterview(null);
      } finally {
        setLoading(false);
      }
    };

    fetchInterview();
  }, [id]);

  // Helper Functions
  const formatDate = (dt: string) =>
    new Date(dt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const formatTime = (dt: string) =>
    new Date(dt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-700 border-green-200";
      case "scheduled":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
  };

  // Panel Scheduling Functions
  {/*const checkAvailability = () => {
    setIsChecking(true);
    setTimeout(() => {
      setAvailabilityData({
        date: selectedDate,
        panelMembers: panelMembers,
        availableSlots: timeSlots.filter((slot) => slot.available),
      });
      setIsChecking(false);
    }, 1500);
  }; */}

  const togglePanelMember = (memberId: string) => {
    setPanelMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  // Candidate Scheduling Functions
  const handleSchedule = () => {
    alert(`Interview scheduled for slot ${selectedSlot} in ${timezone} timezone`);
  };

  const handleReschedule = () => {
    if (!rescheduleReason.trim()) {
      alert("Please provide a reason for rescheduling");
      return;
    }
    alert("Reschedule request submitted successfully");
    setShowReschedule(false);
    setRescheduleReason("");
  };

  const handleCancel = () => {
    alert("Interview cancelled successfully");
    setShowCancel(false);
  };

  // Interview Kits Functions
  const distributeKit = (member: string) => {
    setDistributedTo((prev) =>
      prev.includes(member) ? prev.filter((m) => m !== member) : [...prev, member]
    );
  };

  const distributeToAll = () => {
    if (interview) {
      const members = interview.interviewers || [];
      if (distributedTo.length === members.length) {
        setDistributedTo([]);
      } else {
        setDistributedTo(members);
      }
    }
  };

  // Scorecard Functions
  const handleScoreChange = (category: "technical" | "behavioral" | "culture", value: number[]) => {
    const newScore = value[0];
    setScores((prev) => ({ ...prev, [category]: newScore }));
    const isExtreme = newScore <= 2 || newScore >= 9;
    setShowWarnings((prev) => ({ ...prev, [category]: isExtreme }));
  };

  const handleCommentsChange = (field: keyof ScoreData, value: string) => {
    setScores((prev) => ({ ...prev, [field]: value }));
  };

  const validateAndSave = () => {
    const warnings = [];
    if ((scores.technical <= 2 || scores.technical >= 9) && !scores.technicalComments.trim()) {
      warnings.push("Technical");
    }
    if ((scores.behavioral <= 2 || scores.behavioral >= 9) && !scores.behavioralComments.trim()) {
      warnings.push("Behavioral");
    }
    if ((scores.culture <= 2 || scores.culture >= 9) && !scores.cultureComments.trim()) {
      warnings.push("Culture");
    }

    if (warnings.length > 0) {
      alert(`Please provide comments for extreme scores in: ${warnings.join(", ")}`);
      return;
    }
    alert("Scorecard saved successfully!");
  };

  const getScoreColor = (score: number) => {
    if (score <= 3) return "text-red-600";
    if (score <= 5) return "text-orange-600";
    if (score <= 7) return "text-yellow-600";
    return "text-green-600";
  };

  const getScoreLabel = (score: number) => {
    if (score <= 2) return "Poor";
    if (score <= 4) return "Below Average";
    if (score <= 6) return "Average";
    if (score <= 8) return "Good";
    return "Excellent";
  };

  // Decision Workspace Functions
  const weights = { technical: 0.5, behavioral: 0.3, culture: 0.2 };

  const calculateWeightedScore = () => {
    const totals = feedbackData.reduce(
      (acc, feedback) => {
        acc.technical += feedback.technical;
        acc.behavioral += feedback.behavioral;
        acc.culture += feedback.culture;
        return acc;
      },
      { technical: 0, behavioral: 0, culture: 0 }
    );

    const count = feedbackData.length;
    const avgTechnical = totals.technical / count;
    const avgBehavioral = totals.behavioral / count;
    const avgCulture = totals.culture / count;

    const weightedScore =
      avgTechnical * weights.technical +
      avgBehavioral * weights.behavioral +
      avgCulture * weights.culture;

    return {
      technical: avgTechnical,
      behavioral: avgBehavioral,
      culture: avgCulture,
      overall: weightedScore,
    };
  };

  const overallScores = calculateWeightedScore();

  const getRecommendation = (score: number) => {
    if (score >= 8.5) return { text: "Strong Hire", color: "green", icon: ThumbsUp };
    if (score >= 7.5) return { text: "Hire", color: "blue", icon: CheckCircle2 };
    if (score >= 6.5) return { text: "Second Round", color: "yellow", icon: AlertCircle };
    if (score >= 5.5) return { text: "Hold", color: "orange", icon: TrendingDown };
    return { text: "No Hire", color: "red", icon: ThumbsDown };
  };

  const recommendation = getRecommendation(overallScores.overall);

  

  // Render Score Section
  const renderScoreSection = (
    title: string,
    category: "technical" | "behavioral" | "culture",
    description: string,
    criteria: string[]
  ) => {
    const score = scores[category];
    const commentsField = `${category}Comments` as keyof ScoreData;
    const showWarning = showWarnings[category] && !scores[commentsField].trim();

    return (
  <Card className="border-l-4 border-l-blue-600">
    <CardHeader>
      <CardTitle className="flex items-center justify-between">
        <span>{title}</span>
        <div className="flex items-center gap-2">
          <span className={`text-3xl ${getScoreColor(score)}`}>{score}</span>
          <span className="text-sm text-gray-500">/ 10</span>
        </div>
      </CardTitle>
      <p className="text-sm text-gray-600">{description}</p>
    </CardHeader>

    <CardContent className="space-y-4">
      {/* ✅ Replace Slider with Numeric Input */}
      <div className="space-y-2">
        <div className="flex justify-between items-center mb-2">
          <Label>Rating (1–10)</Label>
          <Badge variant="outline" className={getScoreColor(score)}>
            {getScoreLabel(score)}
          </Badge>
        </div>

        <Input
          type="number"
          min={1}
          max={10}
          value={score}
          onChange={(e) =>
            handleScoreChange(category, [parseInt(e.target.value) ])
          }
          className="w-24 border-gray-300"
          placeholder="1–10"
        />
      </div>

      {/*<div className="bg-gray-50 rounded-lg p-3">
        <p className="text-sm text-gray-900 mb-2">Assessment Criteria:</p>
        <ul className="text-sm text-gray-600 space-y-1">
          {criteria.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <Star className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>*/}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Comments & Observations</Label>
          {(score <= 2 || score >= 9) && (
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              Required for extreme scores
            </Badge>
          )}
        </div>

        <Textarea
          placeholder={`Provide detailed feedback on ${title.toLowerCase()}...`}
          value={scores[commentsField]}
          onChange={(e) => handleCommentsChange(commentsField, e.target.value)}
          rows={4}
          className={showWarning ? "border-red-500 focus:ring-red-500" : ""}
        />
      </div>

      {showWarning && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <Alert className="bg-orange-50 border-orange-200">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Mandatory Comment Required:</strong> You've given an extreme score
              ({score}/10). Please provide detailed justification for this rating.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}
    </CardContent>
  </Card>
);

  }; 

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading interview details...</p>
        </div>
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <User className="w-8 h-8 text-red-600" />
            </div>
            <h3>Interview Not Found</h3>
            <p className="text-muted-foreground">The interview you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-between"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover:bg-white/50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Interviews
          </Button>
        </motion.div>

        {/* Interview Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
  <CardContent className="p-8 space-y-8">
    
    {/* Header Section */}
    <div className="flex flex-col md:flex-row md:justify-between gap-6 border-b pb-6">
      
      {/* Left Section - Candidate Info */}
      <div className="flex items-start gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center shadow-inner">
          <User className="w-8 h-8 text-white" />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold text-gray-900 leading-tight">
            {interview.candidate?.name}
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-gray-600">
            <Building2 className="w-4 h-4" />
            <span>{interview.requisition?.position}</span>
          </div>

          {/* Schedule Details (Left aligned under name) */}
          <div className="flex flex-wrap items-center gap-3 mt-3 text-gray-700">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-gray-500" />
              <span>{formatDate(interview.datetime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span>{formatTime(interview.datetime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-gray-500" />
              <span>{interview.duration} min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Status & Meeting */}
      <div className="flex flex-col items-end gap-3">
        <Badge className={`${getStatusColor(interview.status)} text-sm py-2 px-4`}>
          {interview.status}
        </Badge>
        {interview.location && interview.location.startsWith("http") && (
          <Button variant="outline" className="flex items-center gap-2" asChild>
            <a href={interview.location} target="_blank" rel="noopener noreferrer">
              <Video className="w-4 h-4" />
              Join Meeting
            </a>
          </Button>
        )}
      </div>
    </div>

    {/* Lower Details Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3  text-gray-700">
      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-500">Interview Type</p>
        <Badge variant="outline" className="capitalize w-fit px-3 py-1.5">
          {interview.interview_type}
        </Badge>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-500">Mode</p>
        <div className="flex items-center gap-2 text-gray-900">
          {interview.mode === "Video Call" || interview.mode === "video" ? (
            <Video className="w-4 h-4 text-blue-600" />
          ) : (
            <MapPin className="w-4 h-4 text-green-600" />
          )}
          <span className="capitalize">{interview.mode}</span>
        </div>
      </div>
    </div>
  </CardContent>
</Card>

        </motion.div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 bg-white/80 backdrop-blur p-1 h-auto">
              <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Overview
              </TabsTrigger>
              <TabsTrigger value="scheduling" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Panel Scheduling
              </TabsTrigger>
             {/* <TabsTrigger value="candidate" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Candidate Portal
              </TabsTrigger>*/}
              <TabsTrigger value="kits" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Interview Kits
              </TabsTrigger>
              <TabsTrigger value="evaluation" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Evaluation
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle>Interview Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Location</p>
                        <p className="text-gray-900">{interview.location}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Requisition ID</p>
                        <p className="text-gray-900">{interview.requisition_id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Interview Date</p>
                        <p className="text-gray-900">{formatDate(interview.datetime)}</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Interviewers</p>
                        <div className="flex flex-wrap gap-2">
                          {interview.interviewers && interview.interviewers.length > 0 ? (
                            interview.interviewers.map((interviewer: string, idx: number) => (
                              <Badge key={idx} variant="secondary">
                                {interviewer}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-gray-500">No interviewers assigned</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Panel Scheduling Tab */}
            <TabsContent value="scheduling">
              <div className="space-y-6">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Panel Creation & Availability Lookup
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <Label>Select Panel Members</Label>
                      <div className="grid md:grid-cols-2 gap-3">
                        {availablePanelMembers.map((member) => (
                          <motion.div
                            key={member.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Card
                              className={`cursor-pointer transition-all ${
                                panelMembers.includes(member.id)
                                  ? "border-blue-600 bg-blue-50"
                                  : "border-gray-200 hover:border-blue-300"
                              }`}
                              onClick={() => togglePanelMember(member.id)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="text-gray-900">{member.name}</p>
                                    <p className="text-sm text-gray-500">{member.role}</p>
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                    {panelMembers.includes(member.id) && (
                                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                                    )}
                                    <Badge
                                      variant="outline"
                                      className={
                                        member.availability === "High"
                                          ? "bg-green-50 text-green-700 border-green-200"
                                          : member.availability === "Medium"
                                          ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                          : "bg-red-50 text-red-700 border-red-200"
                                      }
                                    >
                                      {member.availability}
                                    </Badge>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Select Interview Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {selectedDate ? (
                                selectedDate.toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label>Interview Duration</Label>
                        <Select defaultValue="60">
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30">30 minutes</SelectItem>
                            <SelectItem value="45">45 minutes</SelectItem>
                            <SelectItem value="60">60 minutes</SelectItem>
                            <SelectItem value="90">90 minutes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <CalendarIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-gray-900 mb-1">Calendar Integration</p>
                          <p className="text-sm text-gray-600">
                            Connect to Outlook, Google Calendar, or Microsoft Teams to automatically check
                            panel member availability and avoid scheduling conflicts.
                          </p>
                          <div className="flex gap-2 mt-3">
                            <Button size="sm" variant="outline" className="gap-2">
                              <CalendarIcon className="w-4 h-4" />
                              Connect Outlook
                            </Button>
                            <Button size="sm" variant="outline" className="gap-2">
                              <CalendarIcon className="w-4 h-4" />
                              Connect Google
                            </Button>
                            <Button size="sm" variant="outline" className="gap-2">
                              <CalendarIcon className="w-4 h-4" />
                              Connect Teams
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/*<Button
                      onClick={checkAvailability}
                      disabled={!selectedDate || panelMembers.length === 0 || isChecking}
                      className="w-full gap-2"
                    >
                      {isChecking ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Checking Availability...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          Check Panel Availability
                        </>
                      )}
                    </Button>*/}
                  </CardContent>
                </Card>

                {availabilityData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-green-600" />
                          Available Time Slots
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-3 gap-3">
                          {timeSlots.map((slot, idx) => (
                            <motion.div
                              key={idx}
                              whileHover={slot.available ? { scale: 1.05 } : {}}
                              whileTap={slot.available ? { scale: 0.95 } : {}}
                            >
                              <Card
                                className={`cursor-pointer transition-all ${
                                  slot.available
                                    ? "border-green-300 bg-green-50 hover:bg-green-100"
                                    : "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                                }`}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Clock className={`w-4 h-4 ${slot.available ? "text-green-600" : "text-gray-400"}`} />
                                      <span className="text-gray-900">{slot.time}</span>
                                    </div>
                                    {slot.available ? (
                                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    ) : (
                                      <XCircle className="w-5 h-5 text-red-600" />
                                    )}
                                  </div>
                                  {slot.conflicts > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      {slot.conflicts} conflict{slot.conflicts > 1 ? "s" : ""}
                                    </p>
                                  )}
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>
            </TabsContent>

            {/* Candidate Scheduling Tab */}
           {/*
            <TabsContent value="candidate">
              <div className="space-y-6">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-600" />
                      Timezone Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Label>Select Your Timezone</Label>
                      <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          {timezones.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-gray-500">
                        All times will be displayed in your selected timezone
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-purple-600" />
                      Select Interview Slot
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Choose from available time slots below. Your selection will be confirmed via email.
                      </AlertDescription>
                    </Alert>

                    <div className="grid md:grid-cols-2 gap-3">
                      {availableSlots.map((slot) => (
                        <motion.div
                          key={slot.id}
                          whileHover={slot.available ? { scale: 1.02 } : {}}
                          whileTap={slot.available ? { scale: 0.98 } : {}}
                        >
                          <Card
                            className={`cursor-pointer transition-all ${
                              selectedSlot === slot.id
                                ? "border-purple-600 bg-purple-50"
                                : slot.available
                                ? "border-gray-200 hover:border-purple-300"
                                : "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                            }`}
                            onClick={() => slot.available && setSelectedSlot(slot.id)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <CalendarIcon className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-900">
                                      {new Date(slot.date).toLocaleDateString("en-US", {
                                        weekday: "short",
                                        month: "short",
                                        day: "numeric",
                                      })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-900">{slot.time}</span>
                                  </div>
                                  <Badge variant="outline" className="mt-2">
                                    {slot.timezone}
                                  </Badge>
                                </div>
                                {selectedSlot === slot.id && (
                                  <CheckCircle2 className="w-5 h-5 text-purple-600" />
                                )}
                                {!slot.available && (
                                  <XCircle className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>

                    <Button
                      onClick={handleSchedule}
                      disabled={!selectedSlot}
                      className="w-full gap-2 bg-purple-600 hover:bg-purple-700"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm Interview Schedule
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-orange-600" />
                      Reschedule or Cancel Interview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert className="bg-yellow-50 border-yellow-200">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        <strong>Cancellation Policy:</strong> Please provide at least 24 hours notice for
                        rescheduling or cancellation. Late cancellations may affect your application status.
                      </AlertDescription>
                    </Alert>

                    {!showReschedule && !showCancel && (
                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1 gap-2"
                          onClick={() => setShowReschedule(true)}
                        >
                          <RefreshCw className="w-4 h-4" />
                          Request Reschedule
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 gap-2 text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => setShowCancel(true)}
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel Interview
                        </Button>
                      </div>
                    )}

                    {showReschedule && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-3"
                      >
                        <div className="space-y-2">
                          <Label>Reason for Rescheduling</Label>
                          <Textarea
                            placeholder="Please explain why you need to reschedule..."
                            value={rescheduleReason}
                            onChange={(e) => setRescheduleReason(e.target.value)}
                            rows={3}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={handleReschedule} className="gap-2">
                            <CheckCircle2 className="w-4 h-4" />
                            Submit Request
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowReschedule(false);
                              setRescheduleReason("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {showCancel && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-3"
                      >
                        <Alert className="bg-red-50 border-red-200">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-800">
                            Are you sure you want to cancel this interview? This action cannot be undone and
                            may affect your application process.
                          </AlertDescription>
                        </Alert>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleCancel}
                            variant="destructive"
                            className="gap-2"
                          >
                            <XCircle className="w-4 h-4" />
                            Confirm Cancellation
                          </Button>
                          <Button variant="outline" onClick={() => setShowCancel(false)}>
                            Keep Interview
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent> */}

            {/* Interview Kits Tab */}
            <TabsContent value="kits">
              <div className="space-y-6">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        Interview Kit Documents
                      </CardTitle>
                      <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Download All
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {kitDocuments.map((doc) => (
                        <motion.div
                          key={doc.id}
                          whileHover={{ scale: 1.02 }}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card className="border-gray-200 hover:border-blue-300 transition-all">
                            <CardContent className="p-4">
                              <div className="flex items-start gap-3">
                                <div className={`w-12 h-12 ${doc.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                  <doc.icon className={`w-6 h-6 ${doc.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-500">{doc.type}</p>
                                  <p className="text-gray-900 truncate mb-1">{doc.name}</p>
                                  <div className="flex items-center gap-3 text-xs text-gray-500">
                                    <span>{doc.size}</span>
                                    <span>•</span>
                                    <span>{doc.lastUpdated}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-3">
                                <Button size="sm" variant="outline" className="flex-1 gap-1">
                                  <Eye className="w-3 h-3" />
                                  View
                                </Button>
                                <Button size="sm" variant="outline" className="flex-1 gap-1">
                                  <Download className="w-3 h-3" />
                                  Download
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Send className="w-5 h-5 text-purple-600" />
                        Distribute to Panel Members
                      </CardTitle>
                      <Button
                        onClick={distributeToAll}
                        variant={distributedTo.length === interview.interviewers?.length ? "secondary" : "default"}
                        className="gap-2"
                      >
                        {distributedTo.length === interview.interviewers?.length ? (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            All Distributed
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            Distribute to All
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <FileText className="h-4 w-4" />
                      <AlertDescription>
                        Interview kits will be sent via email and will include all scorecards, candidate
                        resume, and job description.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-3">
                      {interview.interviewers?.map((member, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <Card
                            className={`transition-all ${
                              distributedTo.includes(member)
                                ? "border-green-300 bg-green-50"
                                : "border-gray-200"
                            }`}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white">
                                      {member.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="text-gray-900">
                                      {member}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {member.toLowerCase().replace(/\s+/g, ".")}@company.com
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {distributedTo.includes(member) && (
                                    <Badge className="bg-green-100 text-green-700 border-green-200">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Sent
                                    </Badge>
                                  )}
                                  <Button
                                    onClick={() => distributeKit(member)}
                                    variant={distributedTo.includes(member) ? "outline" : "default"}
                                    size="sm"
                                    className="gap-2"
                                  >
                                    {distributedTo.includes(member) ? (
                                      <>
                                        <CheckCircle2 className="w-3 h-3" />
                                        Resend
                                      </>
                                    ) : (
                                      <>
                                        <Send className="w-3 h-3" />
                                        Send Kit
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                
              </div>
            </TabsContent>

            {/* Evaluation Tab */}
            <TabsContent value="evaluation">
              <div className="space-y-6">
                {/* Scorecard Section */}
                <Card className="shadow-lg border-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <ClipboardList className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="mb-1">Structured Interview Scorecard</h3>
                        <p className="text-sm text-white/90">
                          Evaluate the candidate across three key dimensions using calibrated scales.
                          Extreme scores require mandatory comments to ensure fair assessment.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {renderScoreSection(
                  "Technical Skills",
                  "technical",
                  "Evaluate technical competency, problem-solving ability, and domain knowledge",
                  [
                    "Problem-solving approach and methodology",
                    
                  ]
                )}

                {renderScoreSection(
                  "Behavioral Competencies",
                  "behavioral",
                  "Assess communication, teamwork, leadership, and soft skills",
                  [
                    "Communication clarity and effectiveness",
                   
                  ]
                )}

                {renderScoreSection(
                  "Cultural Fit",
                  "culture",
                  "Determine alignment with company values, work style, and team dynamics",
                  [
                    "Alignment with company values and mission",
                   
                  ]
                )}

                <div className="flex justify-end gap-3">
                  <Button variant="outline" className="gap-2">
                    Save as Draft
                  </Button>
                  <Button onClick={validateAndSave} className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Save className="w-4 h-4" />
                    Submit Scorecard
                  </Button>
                </div>

                {/* Decision Workspace Section */}
                <Card className="shadow-lg border-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-white/80 mb-1">Overall Weighted Score</p>
                        <div className="flex items-baseline gap-2">
                          <h1 className="text-white">{overallScores.overall.toFixed(1)}</h1>
                          <span className="text-2xl text-white/80">/ 10</span>
                        </div>
                        <p className="text-sm text-white/90 mt-2">
                          Based on {feedbackData.length} interviewer evaluations
                        </p>
                      </div>
                      <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                        <BarChart3 className="w-16 h-16" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Score Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900">Technical Skills</span>
                            <Badge variant="outline" className="text-xs">
                              Weight: {weights.technical * 100}%
                            </Badge>
                          </div>
                          <span className="text-gray-900">{overallScores.technical.toFixed(1)} / 10</span>
                        </div>
                        <Progress value={overallScores.technical * 10} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900">Behavioral</span>
                            <Badge variant="outline" className="text-xs">
                              Weight: {weights.behavioral * 100}%
                            </Badge>
                          </div>
                          <span className="text-gray-900">{overallScores.behavioral.toFixed(1)} / 10</span>
                        </div>
                        <Progress value={overallScores.behavioral * 10} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-900">Cultural Fit</span>
                            <Badge variant="outline" className="text-xs">
                              Weight: {weights.culture * 100}%
                            </Badge>
                          </div>
                          <span className="text-gray-900">{overallScores.culture.toFixed(1)} / 10</span>
                        </div>
                        <Progress value={overallScores.culture * 10} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

               {/* <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Interviewer Feedback</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {feedbackData.map((feedback, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className="border-l-4 border-l-blue-600">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-gray-900">{feedback.interviewer}</p>
                                <p className="text-sm text-gray-500">{feedback.role}</p>
                              </div>
                              <Badge
                                variant="outline"
                                className={
                                  feedback.recommendation === "Strong Hire"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                }
                              >
                                {feedback.recommendation}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{feedback.comments}</p>
                            <div className="flex gap-4 text-sm">
                              <span className="text-gray-600">
                                Tech: <span className="text-gray-900">{feedback.technical}/10</span>
                              </span>
                              <span className="text-gray-600">
                                Behavioral: <span className="text-gray-900">{feedback.behavioral}/10</span>
                              </span>
                              <span className="text-gray-600">
                                Culture: <span className="text-gray-900">{feedback.culture}/10</span>
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card> */}

                <Card
                  className={`shadow-lg border-0 bg-gradient-to-r ${
                    recommendation.color === "green"
                      ? "from-green-600 to-emerald-600"
                      : recommendation.color === "blue"
                      ? "from-blue-600 to-cyan-600"
                      : recommendation.color === "yellow"
                      ? "from-yellow-600 to-orange-500"
                      : "from-red-600 to-rose-600"
                  } text-white`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                        <recommendation.icon className="w-8 h-8" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white/80 mb-1">Decision Recommendation</p>
                        <h2 className="text-white mb-2">{recommendation.text}</h2>
                        <p className="text-sm text-white/90">
                          Based on calibrated scoring from {feedbackData.length} interviewers
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              {/*  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      Recommended Next Steps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-3">
                      {nextSteps.map((step, idx) => (
                        <motion.li
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-start gap-3"
                        >
                          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <p className="text-gray-900 flex-1">{step}</p>
                        </motion.li>
                      ))}
                    </ol>
                  </CardContent>
                </Card> */}

                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur">
                  <CardHeader>
                    <CardTitle>Final Decision Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Textarea
                        placeholder="Add any additional notes or considerations for the final decision..."
                        value={decisionNotes}
                        onChange={(e) => setDecisionNotes(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button variant="outline" className="flex-1">
                        Save Notes
                      </Button>
                      <Button className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700">
                        <CheckCircle2 className="w-4 h-4" />
                        Finalize Decision
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

export default InterviewDetail;
