import React, { useState } from "react";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./ui/select";

type PositionFormData = {
  requisition_id: number;
  positionName: string;
  skills: string[];
  position_Desc: string;
  status: string;
};

interface PositionFormProps {
  requisition_id: number;
  onSubmit: (data: PositionFormData) => void;
  onCancel: () => void;
}

const PositionForm: React.FC<PositionFormProps> = ({
  requisition_id,
  onSubmit,
  onCancel,
}) => {
  const [positionName, setPositionName] = useState("");
  const [skills, setSkills] = useState(""); // keep as string
  const [position_Desc, setposition_Desc] = useState("");
  const [status, setStatus] = useState("open");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const skillArray = skills
      .split(",") // split by comma
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const finalData: PositionFormData = {
      requisition_id,
      positionName,
      skills: skillArray,
      position_Desc,
      status,
    };

    onSubmit(finalData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-6 space-y-4"
    >
      <h2 className="text-xl font-semibold">Create Position</h2>

      {/* Position Name */}
      <div>
        <label className="block text-sm font-medium mb-1">Position Name</label>
        <Input
          placeholder="Enter position name"
          value={positionName}
          onChange={(e) => setPositionName(e.target.value)}
          required
        />
      </div>

      {/* Skills */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Skills <span className="text-gray-500">(comma separated)</span>
        </label>
        <Input
          placeholder="e.g. React, Node.js, SQL"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Status</label>
        <Select value={status} onValueChange={(value:any) => setStatus(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Job Description */}
      <div>
        <label className="block text-sm font-medium mb-1">Job Description</label>
        <Textarea
          placeholder="Enter job description"
          value={position_Desc}
          onChange={(e) => setposition_Desc(e.target.value)}
          required
        />
      </div>

      {/* Status */}
      

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Position</Button>
      </div>
    </form>
  );
};

export default PositionForm;
