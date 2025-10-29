import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { useAuth } from "./AuthProvider";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface CandidateFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
}

export default function CandidateForm({
  initialData,
  onSubmit,
  onCancel,
}: CandidateFormProps) {
  const { user } = useAuth();
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const isEditMode = Boolean(initialData); // ✅ Detect edit mode

  const [formData, setFormData] = useState(() => ({
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
    recruiter: initialData?.recruiter || user?.name || "",
    resume: initialData?.resume || null,
    nationality: initialData?.nationality || "",
  }));

  // 🔹 Load requisitions
  useEffect(() => {
    (async () => {
      try {
        const approvalStatus =
          user?.role === "admin" || user?.role === "hiring_manager"
            ? "all"
            : "approved";

        const res = await fetch(
          `${API_BASE_URL}/requisitions/req?approval_status=${approvalStatus}&user_id=${user?.id}&role=${user?.role}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();
        setRequisitions(data);
      } catch (err) {
        console.error("Error fetching requisitions:", err);
      }
    })();
  }, [user]);

  // 🔹 Handle resume upload (only parse if not in edit mode)
  const handleResumeUpload = async (file: File) => {
    setFormData((prev) => ({ ...prev, resume: file }));

    if (isEditMode) return; // ✅ Skip parsing when editing

    const uploadData = new FormData();
    uploadData.append("file", file);

    try {
      const res = await fetch(`${API_BASE_URL}/candidates/parse-resume`, {
        method: "POST",
        body: uploadData,
      });
      const data = await res.json();

      if (data) {
        setFormData((prev) => ({
          ...prev,
          name: data.name || prev.name,
          email: data.email || prev.email,
          phone: data.phone || prev.phone,
          skills: data.skills || prev.skills,
        }));
      }
    } catch (error) {
      console.error("Resume parsing failed:", error);
    }
  };

  const handleChange = (field: string, value: any) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skillsArray = formData.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    onSubmit({ ...formData, skills: skillsArray });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Full Name"
          id="name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />
        <FormInput
          label="Email"
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Phone"
          id="phone"
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
        />
        <FormInput
          label="Location"
          id="location"
          value={formData.location}
          onChange={(e) => handleChange("location", e.target.value)}
        />
      </div>

      {/* Requisition */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Requisition ID</Label>
          <Select
            value={formData.requisition_id}
            onValueChange={(val) => {
              handleChange("requisition_id", val);
              const selectedReq = requisitions.find((r) => r.id === val);
              if (selectedReq)
                handleChange("position", selectedReq.position || "");
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

        <FormInput
          label="Position Applied For"
          id="position"
          value={formData.position}
          onChange={(e) => handleChange("position", e.target.value)}
        />
      </div>

      {/* Experience & Source */}
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Years of Experience"
          id="experience"
          value={formData.experience}
          onChange={(e) => handleChange("experience", e.target.value)}
        />

        <div>
          <Label>Source</Label>
          <Select
            value={formData.source}
            onValueChange={(val) => handleChange("source", val)}
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

      {/* CTC */}
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Current CTC"
          id="currentCTC"
          value={formData.current_ctc}
          onChange={(e) => handleChange("current_ctc", e.target.value)}
        />
        <FormInput
          label="Expected CTC"
          id="expectedCTC"
          value={formData.expected_ctc}
          onChange={(e) => handleChange("expected_ctc", e.target.value)}
        />
      </div>

      {/* Notice & Company */}
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Notice Period"
          id="noticePeriod"
          value={formData.notice_period}
          onChange={(e) => handleChange("notice_period", e.target.value)}
        />
        <FormInput
          label="Current Company"
          id="currentCompany"
          value={formData.current_company}
          onChange={(e) => handleChange("current_company", e.target.value)}
        />
      </div>

      {/* DOB & Marital Status */}
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          label="Date of Birth"
          id="dob"
          type="date"
          value={formData.dob}
          onChange={(e) => handleChange("dob", e.target.value)}
        />
        <FormInput
          label="Marital Status"
          id="maritalStatus"
          value={formData.marital_status}
          onChange={(e) => handleChange("marital_status", e.target.value)}
        />
      </div>

      <FormInput
        label="Nationality"
        id="nationality"
        value={formData.nationality}
        onChange={(e) => handleChange("nationality", e.target.value)}
      />

      {/* Skills */}
      <FormInput
        label="Skills (comma-separated)"
        id="skills"
        value={formData.skills}
        placeholder="e.g., React, Node.js, Python"
        onChange={(e) => handleChange("skills", e.target.value)}
      />

      {/* Resume Upload */}
      <div>
        <Label htmlFor="resume">Upload Resume</Label>
        {!formData.resume ? (
          <Input
            id="resume"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => {
              if (e.target.files?.[0]) handleResumeUpload(e.target.files[0]);
            }}
          />
        ) : (
          <div className="relative mt-2 w-fit border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 shadow-sm flex items-center">
            <span className="text-sm text-gray-700 truncate max-w-[180px]">
              {formData.resume.name}
            </span>
            <button
              type="button"
              onClick={() => handleChange("resume", null)}
              className="ml-3 text-red-500 hover:text-red-700"
            >
              ✖
            </button>
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">
          {isEditMode ? "Update Candidate" : "Add Candidate"}
        </Button>
      </div>
    </form>
  );
}

// 🔹 Reusable small input component
function FormInput({
  label,
  id,
  type = "text",
  value,
  placeholder,
  onChange,
}: {
  label: string;
  id: string;
  type?: string;
  value: any;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}
