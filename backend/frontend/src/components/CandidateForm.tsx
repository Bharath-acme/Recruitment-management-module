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
  const [skillsList, setSkillsList] = useState<any[]>([]); // 🌟 NEW


  const [formData, setFormData] = useState(() => ({
    name: initialData?.name || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    location: initialData?.location || "",
    position: initialData?.position || "",
    requisition_id: initialData?.requisition_id || null,
    experience: initialData?.experience || "",
    skills: initialData?.skills?.map((s: any) => s.name) || [], // ARRAY OF STRINGS
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
    status:initialData?.status || 'new',
    company_id: initialData?.company_id || null
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

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/skills`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setSkillsList(data); // [{id,name}]
        }
      } catch (err) {
        console.error("Error fetching skills:", err);
      }
    })();
  }, []);

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
          skills: data.skills || prev.skills, // Data.skills should be an array already
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

  const fd = new FormData();

  Object.entries(formData).forEach(([key, value]) => {
    
    // 1. Handle Skills (Array)
    if (key === "skills") {
      // Ensure value is an array
      if (Array.isArray(value)) {
        value.forEach((skill: string) => fd.append("skills", skill));
      }
    } 
    // 2. Handle Resume
    else if (key === "resume") {
      if (value instanceof File) {
        // User selected a NEW file
        fd.append("resume", value);
      } else if (typeof value === "string" && value !== "") {
        // User kept the OLD file
        fd.append("resume_path", value); 
      }
    } 
    // 3. Handle Regular Fields (checking for null/undefined)
    else {
      if (value !== null && value !== undefined) {
        fd.append(key, value.toString());
      }
    }
  });

  // Debug: Log entries to see what is being sent
  // for (let pair of fd.entries()) {
  //   console.log(pair[0] + ', ' + pair[1]);
  // }

<<<<<<< HEAD
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

<<<<<<< HEAD
>>>>>>> e561f9799a65bfecdaaa04822805a896b14baa17
   const handleResumeUpload = (file: File) => {
=======
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

    const handleResumeUpload = async (file: File) => {
>>>>>>> Stashed changes
    setFormData(prev => ({ ...prev, resume: file }));
=======
    const handleResumeUpload = async (file: File) => {
  setFormData(prev => ({ ...prev, resume: file }));
>>>>>>> a5888acac09cf0a12d7e98944f7d6e1d7c0daa79

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch("http://127.0.0.1:8000/candidates/parse-resume", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();

    if (data) {
      setFormData(prev => ({
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
<<<<<<< HEAD
 
=======

>>>>>>> a5888acac09cf0a12d7e98944f7d6e1d7c0daa79

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
=======
  onSubmit(fd);   // ⬅️ SEND FORMDATA, NOT JSON
};
>>>>>>> de4702b9d975366e6415d4b2c5e4682832599e1a

  return (
    <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
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
                handleChange("company_id",selectedReq.company_id)
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
       
       <div>
        <Label>Skills</Label>

        {/* Selected Skill Chips */}
       

        {/* Multi-select dropdown */}
        <Select
          onValueChange={(value) => {
            if (!formData.skills.includes(value)) {
              handleChange("skills", [...formData.skills, value]);
            }
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select skills" />
          </SelectTrigger>
          <SelectContent>
            {skillsList.map((skill) => (
              <SelectItem key={skill.id} value={skill.name}>
                {skill.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

         <div className="flex flex-wrap gap-2 mt-2">
          {formData.skills.length > 0 ? (
            formData.skills.map((skill) => (
              <div
                key={skill}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
              >
                {skill}
                <button
                  type="button"
                  onClick={() =>
                    handleChange(
                      "skills",
                      formData.skills.filter((s) => s !== skill)
                    )
                  }
                  className="text-red-500 font-bold"
                >
                  ✕
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No skills selected</p>
          )}
        </div>
      </div>
      

      {/* Resume Upload */}
     <div>
  <Label htmlFor="resume">Upload Resume</Label>

  {/* Case 1: No resume OR resume is a string path */}
  {(!formData.resume || typeof formData.resume === "string") ? (
    <>
      {/* Show input to upload new file */}
      <Input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={(e) => {
          if (e.target.files?.[0]) handleResumeUpload(e.target.files[0]);
        }}
      />

      {/* Optional: show existing resume link */}
      {typeof formData.resume === "string" && (
        <a
          href={`${API_BASE_URL}/${formData.resume}`}
          target="_blank"
          className="text-blue-500 underline text-sm"
        >
          View existing resume
        </a>
      )}
    </>
  ) : (
    // Case 2: Resume is a File object
    <div className="relative mt-2 border px-4 py-2 rounded-lg bg-gray-50 shadow-sm flex items-center">
      <span className="text-sm truncate max-w-[180px]">
        {formData.resume.name}
      </span>
      <button
        className="ml-3 text-red-600"
        type="button"
        onClick={() => handleChange("resume", null)}
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
