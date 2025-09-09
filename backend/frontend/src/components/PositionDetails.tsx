"use client";

import * as React from "react";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Pencil, MoreVertical, User } from "lucide-react";

interface Candidate {
  id: string;
  name: string;
  stage: string;
}

interface PositionDetails {
  name: string;
  exp: string;
  techStack: string;
  budget: string;
  priority: "High" | "Medium" | "Low";
  department: string;
  hiringManager: string;
  status: "Active" | "Closed" | "On Hold";
  candidatesCount: number;
  jd: string;
  candidates: Candidate[];
}

export default function PositionPage() {
  const [position, setPosition] = useState<PositionDetails>({
    name: "Frontend Developer",
    exp: "3-5 years",
    techStack: "React, TypeScript, Tailwind, Redux",
    budget: "$60k - $80k",
    priority: "High",
    department: "Engineering",
    hiringManager: "Jane Smith",
    status: "Active",
    candidatesCount: 4,
    jd: "We are looking for a skilled frontend developer...",
    candidates: [
      { id: "1", name: "John Doe", stage: "Interview" },
      { id: "2", name: "Alice Brown", stage: "Screening" },
      { id: "3", name: "Sam Lee", stage: "Offer" },
      { id: "4", name: "Emily Clark", stage: "Applied" },
    ],
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{position.name}</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Position</DialogTitle>
            </DialogHeader>
            {/* TODO: Add form fields to edit position details */}
            <div className="space-y-3">
              <input
                type="text"
                defaultValue={position.name}
                className="w-full border p-2 rounded"
              />
              <Button>Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Position Details */}
      <Card>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          <Detail label="Experience" value={position.exp} />
          <Detail label="Tech Stack" value={position.techStack} />
          <Detail label="Budget" value={position.budget} />
          <Detail label="Priority" value={position.priority} />
          <Detail label="Department" value={position.department} />
          <Detail label="Hiring Manager" value={position.hiringManager} />
          <Detail label="Status" value={position.status} />
          <Detail
            label="Candidates"
            value={position.candidatesCount.toString()}
          />
          <Detail label="Job Description" value={position.jd} full />
        </CardContent>
      </Card>

      {/* Candidates List */}
      <Card>
        <CardHeader>
          <CardTitle>Candidates</CardTitle>
        </CardHeader>
        <CardContent>
          {position.candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="flex justify-between items-center p-2 border-b last:border-none"
            >
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-500" />
                <span>{candidate.name}</span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-white border rounded shadow p-1">
                  <DropdownMenuItem className="p-2 hover:bg-gray-100">
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-2 hover:bg-gray-100">
                    Move Stage
                  </DropdownMenuItem>
                  <DropdownMenuItem className="p-2 hover:bg-gray-100">
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Detail({
  label,
  value,
  full,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-base font-medium">{value}</p>
    </div>
  );
}
