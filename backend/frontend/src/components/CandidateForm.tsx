// CandidateForm.tsx
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useAuth } from "./AuthProvider";

interface CandidateFormProps {
  initialData?: any; // Candidate data (for edit)
  onSubmit: (data: any) => void; // Callback to parent
  onCancel?: () => void;
}

export default function CandidateForm({ initialData, onSubmit, onCancel }: CandidateFormProps) {
    const { user } = useAuth();
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
  });

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
      <Label htmlFor="position">Position Applied For</Label>
      <Input
        id="position"
        placeholder="Enter applied position"
        value={formData.position}
        onChange={e => handleChange("position", e.target.value)}
      />
    </div>
    <div>
      <Label htmlFor="requisitionId">Requisition ID</Label>
      <Input
        id="requisitionId"
        placeholder="Enter requisition ID (e.g., REQ-2025-001)"
        value={formData.requisition_id}
        onChange={e => handleChange("requisition_id", e.target.value)}
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
    <Label htmlFor="skills">Skills (comma-separated)</Label>
    <Input
      id="skills"
      placeholder="e.g., React, Node.js, Python"
      value={formData.skills}
      onChange={e => handleChange("skills", e.target.value)}
    />
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
