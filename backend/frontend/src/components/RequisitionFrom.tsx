import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { useAuth } from "./AuthProvider";
import { SkillsInput } from './SkillsInput'; // Corrected Import
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface RequisitionFormProps {
  initialData?: any; // pass requisition when editing
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export function RequisitionForm({ initialData, onSubmit, onCancel }: RequisitionFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    position: initialData?.position || "",
    department_id: initialData?.department_id || null,
    location_id: initialData?.location_id || null,
    employment_type: initialData?.employment_type || "full-time",
    work_mode: initialData?.work_mode || "onsite",
    grade: initialData?.grade || "",
    min_salary: initialData?.min_salary || "",
    max_salary: initialData?.max_salary || "",
    currency: initialData?.currency || "AED",
    priority: initialData?.priority || "medium",
    positions_count: initialData?.positions_count || null,
    job_description: initialData?.job_description || "",
    skills: initialData?.skills?.map((s: any) => s.name) || [], // Skills as an array of strings
    hiring_manager: initialData?.hiring_manager || user?.name,
    target_startdate: initialData?.target_startdate || "",
    created_date: "",
    recruiter_id: initialData?.recruiter?.id || "", // ✅ store recruiter_id
    // recruiter: initialData?.recruiter.name || null, // for display only
    jd_file: initialData?.jd_file || null,
    company_id:initialData?.company_id || null
  });

  const [recruitersTeam, setRecruitersTeam] = useState<any[]>([]);
  const [departments, setDepartments] = useState<{ id: number; name: string; }[]>([]);
  const [locations, setLocations] = useState<{ id: number; name: string; }[]>([]);

  console.log("user in requisition", user?.company)

  useEffect(() => {
  if (user?.company?.id) {
    setFormData(prev => ({
      ...prev,
      company_id: user?.company?.id
    }));
  }
}, [user]);


  useEffect(() => {
  if (initialData) {
    setFormData(prev => ({
      ...prev,
      ...initialData,
      skills: initialData?.skills?.map((s: any) => s.name) || [], // Ensure skills are mapped for initialData
      recruiter_id: initialData.recruiter?.id || "",
      company_id: initialData.company_id || prev.company_id
    }));
  }
}, [initialData]);
  useEffect(() => {
    getTeamData();
    fetchDepartments();
    fetchLocations();
  }, []);

  const token = localStorage.getItem("token");

  const fetchLocations = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/list/locations`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLocations(data || []);
      } else {
        console.error("Failed to load locations");
      }
    } catch (error) {
      console.error("Locations load error:", error);
    }
  };

  const fetchDepartments = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/list/departments`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDepartments(data || []);
      } else {
        console.error("Failed to load departments");
      }
    } catch (error) {
      console.error("Departments load error:", error);
    }
  };

  const getTeamData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/recruiter_team`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRecruitersTeam(data || []);
        console.log("Recruiters:", data);
      } else {
        console.error("Failed to load recruiters");
      }
    } catch (error) {
      console.error("Recruiters load error:", error);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData); // ✅ send recruiter_id to backend

    console.log(formData)
  };

  return (
    <div className="space-y-4">
      {/* Position + Department */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="position">Position Title</Label>
          <Input
            id="position"
            value={formData.position}
            onChange={(e) => handleChange("position", e.target.value)}
            placeholder="e.g. Senior Software Engineer"
          />
        </div>
        <div>
          <Label htmlFor="department">Department</Label>
          <Select
            value={String(formData.department_id || '')}
            onValueChange={(value: string) => handleChange("department_id", parseInt(value, 10))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={String(dept.id)}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Location + Grade */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="location">Location</Label>
          <Select
            value={String(formData.location_id || '')}
            onValueChange={(value: string) => handleChange("location_id", parseInt(value, 10))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc) => (
                <SelectItem key={loc.id} value={String(loc.id)}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="grade">Grade</Label>
          <Select
            value={formData.grade}
            onValueChange={(value: any) => handleChange("grade", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Junior">Junior</SelectItem>
              <SelectItem value="Mid">Mid Level</SelectItem>
              <SelectItem value="Senior">Senior</SelectItem>
              <SelectItem value="Lead">Lead</SelectItem>
              <SelectItem value="Principal">Principal</SelectItem>
              <SelectItem value="Director">Director</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Employment Type, Work Mode, Priority */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Employment Type</Label>
          <Select
            value={formData.employment_type}
            onValueChange={(value: any) => handleChange("employment_type", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full-time">Full-Time</SelectItem>
              <SelectItem value="part-time">Part-Time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Work Mode</Label>
          <Select
            value={formData.work_mode ||''}
            onValueChange={(value: any) => handleChange("work_mode", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="onsite">Onsite</SelectItem>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Priority</Label>
          <Select
            value={formData.priority ||''}
            onValueChange={(value: any) => handleChange("priority", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Salary + Currency */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Min Salary</Label>
          <Input
            type="text"
            value={formData.min_salary||""}
            onChange={(e) => handleChange("min_salary", e.target.value)}
            placeholder="15000"
          />
        </div>
        <div>
          <Label>Max Salary</Label>
          <Input
            type="text"
            value={formData.max_salary||""}
            onChange={(e) => handleChange("max_salary", e.target.value)}
            placeholder="20000"
          />
        </div>
        <div>
          <Label>Currency</Label>
          <Select
            value={formData.currency}
            onValueChange={(value: any) => handleChange("currency", value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AED">AED</SelectItem>
              <SelectItem value="SAR">SAR</SelectItem>
              <SelectItem value="QAR">QAR</SelectItem>
              <SelectItem value="KWD">KWD</SelectItem>
              <SelectItem value="BHD">BHD</SelectItem>
              <SelectItem value="OMR">OMR</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="INR">INR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Openings + Start Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Number of Openings</Label>
          <Input
            type="number"
            value={formData.positions_count || ""}
            onChange={(e) => handleChange("positions_count", parseInt(e.target.value) || null)}
          />
        </div>
        <div>
          <Label>Target Start Date</Label>
          <Input
            type="date"
            value={formData.target_startdate||''}
            onChange={(e) => handleChange("target_startdate", e.target.value)}
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <Label>Job Description</Label>
        <Textarea
          value={formData.job_description ||''}
          onChange={(e) => handleChange("job_description", e.target.value)}
          placeholder="Describe the role and responsibilities..."
        />
      </div>


          {/* JD  Upload */}
    {/* <div>
      <Label htmlFor="resume">Upload JD File</Label>
      {!formData.jd_file && (
        <Input
          id="jd_file"
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleChange("jd_file", e.target.files[0]);
            }
          }}
          className="mt-1"
        />
      )}
    
     
      {formData.jd_file && (
        <div className="relative mt-2 w-40 h-15 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 shadow">
          <span className="text-sm text-gray-700 px-2 text-center truncate w-40">
            {formData.jd_file.name.length > 20
              ? formData.jd_file.name.substring(0, 15) +
                "..." +
                formData.jd_file.name.split(".").pop()
              : formData.jd_file.name}
          </span>
          <button
            type="button"
            onClick={() => handleChange("jd_file", null)}
            className="absolute -top-2 -right-2 w-5 h-5  flex items-center justify-center text-white rounded full text-xs font-bold shadow-md hover:bg-purple-700 focus:outline-none cursor-pointer"
          >
            ✖
          </button>
        </div>
      )}
    </div> */}
    
      {/* Skills Input */}
      <div>
        <Label>Required Skills</Label>
        <SkillsInput
          initialSkills={formData.skills}
          onSkillsChange={(skills) => handleChange("skills", skills)}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          {initialData ? "Update Requisition" : "Create Requisition"}
        </Button>
      </div>
    </div>
  );
}
