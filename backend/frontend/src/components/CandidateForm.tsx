// CandidateForm.tsx
import { useState,useEffect, use } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useAuth } from "./AuthProvider";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface CandidateFormProps {
  initialData?: any; // Candidate data (for edit)
  onSubmit: (data: any) => void; // Callback to parent
  onCancel?: () => void;
}

export default function CandidateForm({ initialData, onSubmit, onCancel }: CandidateFormProps) {
    const { user } = useAuth();
    const [requisitions, setRequisitions] = useState<Array<any>>([]);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    location: initialData?.location || "",
    position: initialData?.position || "",
    requisition_id: initialData?.requisition_id || "",
    experience: initialData?.experience || "",
    skills: initialData?.skills ? initialData.skills.join(", ") : "",
    source: initialData?.source || "direct",
    current_ctc: initialData?.current_ctc || "",
    expected_ctc: initialData?.expected_ctc || "",
    notice_period: initialData?.notice_period || "",
    current_company: initialData?.current_company || "",
    dob: initialData?.dob || "",
    marital_status: initialData?.marital_status || "",
    recruiter: initialData?.recruiter || user?.name ,
    resume : initialData?.resume || null,
    nationality: initialData?.nationality || "",
  });

  useEffect(() => {
     load_requisitions();
  }, []);

   const queryvalues = () => {
    if (user?.role === 'admin' || user?.role === 'hiring_manager') {
      return 'all';
    } else {
      return 'approved';
    }
 }
   
  const load_requisitions = async () => { 
    const approvalStatus = queryvalues();
    try {
      const response = await fetch(`${API_BASE_URL}/requisitions/req?approval_status=${approvalStatus}&user_id=${user?.id}&role=${user?.role}`, {
        headers: {  
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setRequisitions(data);
      // Process requisitions data as needed
    } catch (error) {
      console.error('Error fetching requisitions:', error);
    } 
  };

   const handleResumeUpload = (file: File) => {
    setFormData(prev => ({ ...prev, resume: file }));
  };
 

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      skills: formData.skills.split(",").map((s: string) => s.trim()).filter((s: any) => s),
    });
  };

  return (
    <div className="space-y-4">
  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="name">Full Name</Label>
      <Input
        id="name"
        placeholder="Enter full name"
        value={formData.name}
        onChange={e => handleChange("name", e.target.value)}
      />
    </div>
    <div>
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        placeholder="Enter email address"
        value={formData.email}
        onChange={e => handleChange("email", e.target.value)}
      />
    </div>
  </div>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="phone">Phone</Label>
      <Input
        id="phone"
        placeholder="Enter phone number"
        value={formData.phone}
        onChange={e => handleChange("phone", e.target.value)}
      />
    </div>
    <div>
      <Label htmlFor="location">Location</Label>
      <Input
        id="location"
        placeholder="Enter location"
        value={formData.location}
        onChange={e => handleChange("location", e.target.value)}
      />
    </div>
  </div>

  <div className="grid grid-cols-2 gap-4">
   
    <div>
      <Label htmlFor="requisitionId">Requisition ID</Label>

          <Select
              value={formData.requisition_id}
              onValueChange={(val: any) => {
                handleChange("requisition_id", val);
                const selectedReq = requisitions.find((req) => req.id === val);
                if (selectedReq) {
                  handleChange("position", selectedReq.position || "");
                }
              }}
            >
          <SelectTrigger>
            <SelectValue placeholder="Select Requisition ID" />
          </SelectTrigger>
          <SelectContent>
            {requisitions.map((req) => (
              <SelectItem key={req.id} value={req.id}>
                {req.req_id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

    </div>

     <div>
      <Label htmlFor="position">Position Applied For</Label>
      <Input
        id="position"
        placeholder="Enter applied position"
        value={formData.position}
        onChange={e => handleChange("position", e.target.value)}
      />
    </div>
  </div>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="experience">Years of Experience</Label>
      <Input
        id="experience"
        placeholder="Enter total years of experience"
        value={formData.experience}
        onChange={e => handleChange("experience", e.target.value)}
      />
    </div>
    <div>
      <Label htmlFor="source">Source</Label>
      <Select
        value={formData.source}
        onValueChange={(val: any) => handleChange("source", val)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select source" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="direct">Direct</SelectItem>
          <SelectItem value="linkedin">LinkedIn</SelectItem>
          <SelectItem value="job-board">Job Board</SelectItem>
          <SelectItem value="referral">Referral</SelectItem>
          <SelectItem value="agency">Agency</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="currentCTC">Current CTC</Label>
      <Input
        id="currentCTC"
        placeholder="Enter current CTC"
        value={formData.current_ctc}
        onChange={e => handleChange("current_ctc", e.target.value)}
      />
    </div>
    <div>
      <Label htmlFor="expectedCTC">Expected CTC</Label>
      <Input
        id="expectedCTC"
        placeholder="Enter expected CTC"
        value={formData.expected_ctc}
        onChange={e => handleChange("expected_ctc", e.target.value)}
      />
    </div>
  </div>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="noticePeriod">Notice Period</Label>
      <Input
        id="noticePeriod"
        placeholder="Enter notice period"
        value={formData.notice_period}
        onChange={e => handleChange("notice_period", e.target.value)}
      />
    </div>
    <div>
      <Label htmlFor="currentCompany">Current Company</Label>
      <Input
        id="currentCompany"
        placeholder="Enter current company"
        value={formData.current_company}
        onChange={e => handleChange("current_company", e.target.value)}
      />
    </div>
  </div>

  <div className="grid grid-cols-2 gap-4">
    <div>
      <Label htmlFor="dob">DOB</Label>
      <Input
        id="dob"
        type="date"
        placeholder="Select date of birth"
        value={formData.dob}
        onChange={e => handleChange("dob", e.target.value)}
      />
    </div>
    <div>
      <Label htmlFor="maritalStatus">Marital Status</Label>
      <Input
        id="maritalStatus"
        placeholder="Enter marital status"
        value={formData.marital_status}
        onChange={e => handleChange("marital_status", e.target.value)}
      />
    </div>
  </div>

  <div>
      <Label htmlFor="nationality">Nationality</Label>
      <Input
        id="nationality"
        value={formData.nationality}
        onChange={(e) => handleChange("nationality", e.target.value)}
        placeholder="Enter your Nationality"
        />
    </div>

  <div>
    <Label htmlFor="skills">Skills (comma-separated)</Label>
    <Input
      id="skills"
      placeholder="e.g., React, Node.js, Python"
      value={formData.skills}
      onChange={e => handleChange("skills", e.target.value)}
    />
  </div>

  <div>
     <Label htmlFor="resume">Upload Resume</Label>
      {!formData.resume && (
        <Input
          id="resume"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleResumeUpload(e.target.files[0]);
            }
          }}
          className="mt-1"
        />
      )}

     {formData.resume && (
        <div className="relative mt-2 w-40 h-15 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 shadow">
          <span className="text-sm text-gray-700 px-2 text-center truncate w-40">
            {formData.resume.name.length > 20
              ? formData.resume.name.substring(0, 15) +
                "..." +
                formData.resume.name.split(".").pop()
              : formData.resume.name}
          </span>
          <button
            type="button"
            onClick={() => handleChange("resume", null)}
            className="absolute -top-2 -right-2 w-5 h-5  flex items-center justify-center text-white rounded full text-xs font-bold shadow-md hover:bg-purple-700 focus:outline-none cursor-pointer"
          >
            Γ£û
         </button>
       </div>
      )}
  </div>

  <div className="flex justify-end space-x-2">
    {onCancel && (
      <Button variant="outline" onClick={onCancel}>
        Cancel
      </Button>
    )}
    <Button onClick={handleSubmit}>
      {initialData ? "Update Candidate" : "Add Candidate"}
    </Button>
  </div>
  </div>
  );
}
