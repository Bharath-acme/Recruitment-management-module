"use client";

import React, { useState } from "react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Star, Upload, X ,Plus} from "lucide-react";


import { Card, CardHeader, CardTitle, CardContent } from './ui/card';



import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';

export default function CandidateProfile() {
  const [rating, setRating] = useState<number>(4);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
   const [newCandidate, setNewCandidate] = useState({
      name: '',
      email: '',
      phone: '',
      location: '',
      position: '',
      requisitionId: '',
      experience: '',
      skills: '',
      source: 'direct'
    });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setResumeFile(e.target.files[0]);
    }
  };
  const handleAddCandidate = async () => {

  }

  return (
    <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* LEFT SECTION */}
      <Card style ={{background:'none',  border:'none'}} className="lg:col-span-1">
        <CardContent  className="p-6 space-y-6 ">
            <div style={{display:'flex',gap:20,alignItems:'center'}}>
            <div style={{borderWidth:'2px',height:100,width:100,borderRadius:50}}></div>
          <div>
            <h2 className="text-2xl font-bold">John Doe</h2>
            <p className="text-gray-600">Senior React Developer</p>
             <div className="flex items-center mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-6 h-6 cursor-pointer ${
                    rating >= star ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>
          </div>

          <div className="space-y-2">
            <p><span className="font-semibold">Email:</span> john.doe@email.com</p>
            <p><span className="font-semibold">Mobile:</span> +971 123 4567</p>
            <p><span className="font-semibold">Experience:</span> 6 Years</p>
            {/* <p><span className="font-semibold">Role:</span> Frontend Developer</p> */}
            <p><span className="font-semibold">Skills:</span> React, TypeScript, Redux, Node.js</p>
            <p><span className="font-semibold">Address:</span> Dubai, UAE</p>
            <p><span className="font-semibold">Source:</span> LinkedIn</p>
            <p><span className="font-semibold">Recruiter:</span> Jane Smith</p>
            <p><span className='font-semibold'>Interview: </span><span>Scheduled on sep 3</span></p>
            <p><span className="font-semibold">Offer: </span><span>Pending..</span></p>
          </div>

          {/* Rating with stars */}
          {/* <div>
            <span className="font-semibold">Rating:</span>
           
          </div> */}

          {/* Edit Profile */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
                Edit Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Candidate  Details</DialogTitle>
              <DialogDescription>
                Edit a candidate to the system by filling in their details below.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newCandidate.name}
                    onChange={(e) => setNewCandidate({...newCandidate, name: e.target.value})}
                    placeholder="Ahmed Al-Rashid"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCandidate.email}
                    onChange={(e) => setNewCandidate({...newCandidate, email: e.target.value})}
                    placeholder="ahmed@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newCandidate.phone}
                    onChange={(e) => setNewCandidate({...newCandidate, phone: e.target.value})}
                    placeholder="+971-50-123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newCandidate.location}
                    onChange={(e) => setNewCandidate({...newCandidate, location: e.target.value})}
                    placeholder="Dubai, UAE"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position">Position Applied For</Label>
                  <Input
                    id="position"
                    value={newCandidate.position}
                    onChange={(e) => setNewCandidate({...newCandidate, position: e.target.value})}
                    placeholder="Senior Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    value={newCandidate.experience}
                    onChange={(e) => setNewCandidate({...newCandidate, experience: e.target.value})}
                    placeholder="5 years"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="requisitionId">Requisition ID</Label>
                  <Input
                    id="requisitionId"
                    value={newCandidate.requisitionId}
                    onChange={(e) => setNewCandidate({...newCandidate, requisitionId: e.target.value})}
                    placeholder="REQ-2025-001"
                  />
                </div>
                <div>
                  <Label htmlFor="source">Source</Label>
                  <Select value={newCandidate.source} onValueChange={(value) => setNewCandidate({...newCandidate, source: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">Direct Application</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="job-board">Job Board</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="agency">Agency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  value={newCandidate.skills}
                  onChange={(e) => setNewCandidate({...newCandidate, skills: e.target.value})}
                  placeholder="React, Node.js, Python, AWS"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCandidate}>
                  Save
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        </CardContent>
      </Card>

      {/* RIGHT SECTION */}
      <Card className="lg:col-span-2">
        <CardContent className="p-6 space-y-4">
          <h3 className="font-semibold mb-2">Resume</h3>

          {resumeFile ? (
            <div className="space-y-4">
              {/* Resume Preview */}
              <iframe
                src={URL.createObjectURL(resumeFile)}
                title="Resume Preview"
                className="w-full h-[600px] border rounded-lg"
              />
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
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
