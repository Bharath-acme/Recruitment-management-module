import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
// import * as Dialog from '@radix-ui/react-dialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Card, CardContent } from './ui/card';
import { Button } from "./ui/button";
import { Star, Upload, X } from "lucide-react";
import { Candidate } from './CandidateManager';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import CandidateForm from './CandidateForm';
import { formatDate } from '../utils/Utils';

interface CandidateLog {
  id: number;
  candidate_id: string;
  requisition_id?: number;
  action: string;
  details: string;
  timestamp: string;       // ISO string
  username?: string | null; // user who performed the action
}



export default function CandidateProfile() {
  const { id } = useParams<{ id: string }>();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
   const [showAddDialog, setShowAddDialog] = useState(false);
   const [logs, setLogs] = useState<CandidateLog[]>([]);
   const [logsLoading, setLogsLoading] = useState(true);
  const [candidate, setCandidate] = useState<Candidate>({
    id: '',
    name: '',
    position: '',
    email: '',
    phone: '',
    location: '',
    experience: 0,
    skills: [],
    applied_date: '',
    last_activity: '',
    rating: 0,
    notes: '',
    current_ctc: '',
    expected_ctc: '',
    notice_period: '',
    current_company: '',
    dob: '',
    marital_status: '',
    requisition_id: '',
    stage: '',
    status: '',
    source: '',
    recruiter: ''
  });

  const navigate = useNavigate();

  const [currentRating, setCurrentRating] = useState<number>(candidate.rating);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`http://127.0.0.1:8000/candidates/${id}`)
      .then((res) => res.json())
      .then((data: Candidate) => {
        setCandidate(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching candidate:", err);
        setLoading(false);
      });

      fetchLogs();
  }, [id,]);


  const fetchLogs = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/candidates/${id}/activity-logs`);
      if (!res.ok) throw new Error("Failed to fetch candidate logs");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Error fetching candidate logs:", err);
    } finally {
      setLogsLoading(false);
    }
  };

  
const token = localStorage.getItem('token');
  const handleRatingClick = (value: number) => {
    setCurrentRating(value);
    setCandidate({ ...candidate, rating: value });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCandidate({ ...candidate, [name]: value });
  };

  const handleUpdateCandidate = async (updatedData: any) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/candidates/${candidate.id}`, {
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
        const res = await fetch(`http://127.0.0.1:8000/candidates/${candidate.id}/activity-logs`);
        setLogs(await res.json());
      } else {
        toast.error("Failed to update candidate");
      }
    } catch (error) {
      console.error("Update candidate error:", error);
      toast.error("Failed to update candidate");
    }
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!candidate) return <p>No candidate found</p>;

  return (
    <div className=" min-h-screen p-4 sm:p-6 lg:p-8">
      <div className=" mx-auto max-w-7xl">
        <div className="  p-6 md:p-8 lg:p-10 ">

          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-6 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
                {candidate.name}
              </h1>
              <p className="text-lg text-gray-600 mt-1">{candidate.position}</p>

              {/* Star Rating */}
              <div className="flex gap-1 mt-2" onMouseLeave={() => setCurrentRating(candidate.rating)}>
                {[1, 2, 3, 4, 5].map((starValue) => (
                  <span
                    key={starValue}
                    className={`cursor-pointer text-3xl transition-colors duration-200 ${
                      starValue <= currentRating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    onClick={() => handleRatingClick(starValue)}
                    onMouseEnter={() => setCurrentRating(starValue)}
                  >
                    &#9733;
                  </span>
                ))}
              </div>
            </div>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
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
        </Dialog>

            {/* <Dialog.Root>
              <Dialog.Trigger asChild>
                <button className="mt-4 sm:mt-0 px-6 py-3 bg-blue-600 text-white font-medium rounded-full shadow-md hover:bg-blue-700 transition-colors duration-200">
                  Edit Profile
                </button>
              </Dialog.Trigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
               <CandidateForm
                  initialData={candidate} 
                  onSubmit={handleUpdateCandidate}
                  onCancel={() => navigate("/candidates")}
/>
              </DialogContent>
            </Dialog.Root> */}
          </div>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
          {/* Key Information */}
          <div className="bg-gray-50 p-6 rounded-xl border mb-8">
            <h2 className="text-xl font-semibold mb-4">Key Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <Info label="Email" value={candidate.email} />
              <Info label="Phone" value={candidate.phone} />
              <Info label="Location" value={candidate.location} />
              <Info label="Experience" value={`${candidate.experience} yrs`} />
              <Info label="Skills" value={candidate.skills.join(', ')} />
              <Info label="Applied Date" value={formatDate(candidate.applied_date)} />
              <Info label="Current CTC" value={candidate.current_ctc} />
              <Info label="Expected CTC" value={candidate.expected_ctc} />
              <Info label="Notice Period" value={candidate.notice_period} />
              <Info label="Current Company" value={candidate.current_company} />
              <Info label="DOB" value={candidate.dob} />
              <Info label="Marital Status" value={candidate.marital_status} />
              <Info label="Requisition ID" value={candidate.requisition_id} />
              <Info label="Source" value={candidate.source} />
              <Info label="Recruiter" value={candidate.recruiter} />
              <Info label="Status" value={candidate.status} />
            </div>
          </div>

          {/* Notes & Activity */}
          {/* Activity Log */}
            <div className="bg-gray-50 p-6 rounded-xl border mb-8">
  <h2 className="text-xl font-semibold mb-4">Activity Log</h2>

            {logsLoading ? (
              <p className="text-gray-500">Loading activity logs...</p>
            ) : logs.length === 0 ? (
              <p className="text-gray-400">No activity logs found.</p>
            ) : (
              <ul className="space-y-3">
                {logs.map((log) => (
                  <li key={log.id} className="border-l-4 border-blue-500 pl-3 pb-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-800">
                        {log.username}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{log.details}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>


           </div>
          {/* Resume Section */}

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-semibold mb-2">Resume</h3>
              {resumeFile ? (
                <div className="space-y-4">
                  <iframe src={URL.createObjectURL(resumeFile)} title="Resume Preview" className="w-full h-[600px] border rounded-lg" />
                  <div className="flex justify-between items-center">
                    <span>{resumeFile.name}</span>
                    <Button variant="ghost" size="sm" onClick={() => setResumeFile(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-12 cursor-pointer hover:bg-gray-50">
                  <Upload className="w-6 h-6 text-gray-500 mb-2" />
                  <span className="text-sm text-gray-600">Upload Resume (PDF/DOC)</span>
                  <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFileChange} />
                </label>
              )}
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Reusable Info Row */
function Info({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <p className="font-medium">{label}</p>
      <p className="text-sm text-gray-600">{value || '-'}</p>
    </div>
  );
}
