import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "./AuthProvider";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function RequisitionForm({ initialData, onSubmit, onCancel }) {
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [skillsList, setSkillsList] = useState([]);
  const [recruitersTeam, setRecruitersTeam] = useState([]);

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
    skills: initialData?.skills?.map((s) => s.name) || [], // ARRAY OF STRINGS
    hiring_manager: initialData?.hiring_manager || user?.name,
    target_startdate: initialData?.target_startdate || "",
    recruiter_id: initialData?.recruiter?.id || "",
    company_id: initialData?.company_id || user?.company?.id || null,
  });

  /* ------------------- FETCH DATA ------------------- */

  const fetchSkills = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/skills`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setSkillsList(await res.json());
    } catch (err) {
      console.error("Skills load error:", err);
    }
  };

  const fetchDepartments = async () => {
    const res = await fetch(`${API_BASE_URL}/list/departments`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setDepartments(await res.json());
  };

  const fetchLocations = async () => {
    const res = await fetch(`${API_BASE_URL}/list/locations`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setLocations(await res.json());
  };

  const getRecruiters = async () => {
    const res = await fetch(`${API_BASE_URL}/recruiter_team`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setRecruitersTeam(await res.json());
  };

  useEffect(() => {
    fetchSkills();
    fetchDepartments();
    fetchLocations();
    getRecruiters();
  }, []);

  /* ------------------- FORM HANDLERS ------------------- */

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Final data:", formData);
    onSubmit(formData);
  };

  /* ------------------- UI ------------------- */

  return (
    <div className="space-y-4">

      {/* Position + Department */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Position Title</Label>
          <Input
            value={formData.position}
            onChange={(e) => handleChange("position", e.target.value)}
            placeholder="e.g. Senior Software Engineer"
          />
        </div>

        <div>
          <Label>Department</Label>
          <Select
            value={String(formData.department_id || "")}
            onValueChange={(v) => handleChange("department_id", parseInt(v))}
          >
            <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
            <SelectContent>
              {departments.map((d) => (
                <SelectItem key={d.id} value={String(d.id)}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Location + Grade */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Location</Label>
          <Select
            value={String(formData.location_id || "")}
            onValueChange={(v) => handleChange("location_id", parseInt(v))}
          >
            <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
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
          <Label>Grade</Label>
          <Select
            value={formData.grade}
            onValueChange={(v) => handleChange("grade", v)}
          >
            <SelectTrigger><SelectValue placeholder="Select grade" /></SelectTrigger>
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

      {/* Employment Type + Work Mode + Priority */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Employment Type</Label>
          <Select
            value={formData.employment_type}
            onValueChange={(v) => handleChange("employment_type", v)}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
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
            value={formData.work_mode}
            onValueChange={(v) => handleChange("work_mode", v)}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
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
            value={formData.priority}
            onValueChange={(v) => handleChange("priority", v)}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Salary */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Min Salary</Label>
          <Input
            value={formData.min_salary}
            onChange={(e) => handleChange("min_salary", e.target.value)}
          />
        </div>
        <div>
          <Label>Max Salary</Label>
          <Input
            value={formData.max_salary}
            onChange={(e) => handleChange("max_salary", e.target.value)}
          />
        </div>
        <div>
          <Label>Currency</Label>
          <Select
            value={formData.currency}
            onValueChange={(v) => handleChange("currency", v)}
          >
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="AED">AED</SelectItem>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="INR">INR</SelectItem>
              <SelectItem value="SAR">SAR</SelectItem>
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
            onChange={(e) =>
              handleChange("positions_count", parseInt(e.target.value))
            }
          />
        </div>

        <div>
          <Label>Target Start Date</Label>
          <Input
            type="date"
            value={formData.target_startdate}
            onChange={(e) => handleChange("target_startdate", e.target.value)}
          />
        </div>
      </div>

      {/* Job Description */}
      <div>
        <Label>Job Description</Label>
        <Textarea
          value={formData.job_description}
          onChange={(e) =>
            handleChange("job_description", e.target.value)
          }
        />
      </div>

      {/* ---------------- SKILLS DROPDOWN ---------------- */}
      <div>
        <Label>Required Skills</Label>

        {/* Selected Skills as Chips */}
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.skills.length > 0 ? (
            formData.skills.map((skill) => (
              <div
                key={skill}
                className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
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

        {/* Dropdown (Multi-Select Logic) */}
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
      </div>

      {/* Submit Buttons */}
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
