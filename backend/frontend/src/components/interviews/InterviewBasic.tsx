
import axios from "axios";
import React, { useState } from "react";
import { PanelCalendar } from "./ParentForom";
import { useAuth } from "../AuthProvider";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Props {
  interviewType: string;
  setInterviewType: (v: string) => void;
  candidate: string;
  setCandidate: (v: string) => void;
  panels: string[];
  setPanels: (v: string[]) => void;
  onNext: (calendars: PanelCalendar[]) => void;
  candidates:string[];
}

export default function Step1Basic({
  interviewType,
  setInterviewType,
  candidate,
  setCandidate,
  panels,
  setPanels,
  onNext,
  candidates
}: Props) {
  const [loading, setLoading] = useState(false);
  const {user} = useAuth()

  const handleNext = async () => {
    setLoading(true);

      const res = await axios.post(`${API_BASE_URL}/interviews/free-busy`, {
        recruiter_email: "B.kumar@aiatacme.com",
        start: "2025-12-01T00:00:00",
        end: "2025-12-31T23:59:59"
      });

    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Step 1: Interview Details</h2>

      <label>Interview Type</label>
      <select
        className="border p-2 w-full mb-4"
        value={interviewType}
        onChange={(e) => setInterviewType(e.target.value)}
      >
        <option value="">Select Interview Type</option>
        <option value="Technical">Technical</option>
        <option value="HR">HR</option>
        <option value="Manager">Manager Round</option>
      </select>

      <label>Select Candidate</label>
      <select
        className="border p-2 w-full mb-4"
        value={candidate}
        onChange={(e) => setCandidate(e.target.value)}
      >
       {candidates&&candidates.map((cand)=><option value={cand.email}>{cand.name}</option>) }
      </select>

      <label>Select Interview Panel</label>
      <select
        className="border p-2 w-full mb-4"
        multiple
        value={panels}
        onChange={(e) =>
          setPanels(Array.from(e.target.selectedOptions, (o) => o.value))
        }
      >
        <option value="">Bharath</option>
        <option value="panel2@example.com">Panel 2</option>
        <option value="panel3@example.com">Panel 3</option>
      </select>

      <button
        onClick={handleNext}
        className="bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? "Fetching Calendars..." : "Next"}
      </button>
    </div>
  );
}




// import { useState } from 'react';
// import { Candidate, PanelMember, InterviewDetails } from './ParentForom';

// // Mock data
// const MOCK_CANDIDATES: Candidate[] = [
//   { id: '1', name: 'John Smith', email: 'john.smith@example.com' },
//   { id: '2', name: 'Sarah Johnson', email: 'sarah.johnson@example.com' },
//   { id: '3', name: 'Michael Brown', email: 'michael.brown@example.com' },
//   { id: '4', name: 'Emily Davis', email: 'emily.davis@example.com' },
// ];

// const MOCK_PANEL_MEMBERS: PanelMember[] = [
//   { id: '1', name: 'David Wilson', email: 'david.wilson@company.com', role: 'Senior Engineer' },
//   { id: '2', name: 'Jennifer Garcia', email: 'jennifer.garcia@company.com', role: 'Tech Lead' },
//   { id: '3', name: 'Robert Martinez', email: 'robert.martinez@company.com', role: 'Engineering Manager' },
//   { id: '4', name: 'Lisa Anderson', email: 'lisa.anderson@company.com', role: 'HR Manager' },
//   { id: '5', name: 'James Taylor', email: 'james.taylor@company.com', role: 'Product Manager' },
// ];

// const INTERVIEW_TYPES = [
//   'Technical Round',
//   'HR Round',
//   'Managerial Round',
//   'System Design',
//   'Coding Assessment',
//   'Cultural Fit',
// ];

// interface Props {
//   onNext: (details: InterviewDetails) => void;
//   initialData: InterviewDetails;
// }

// export function InterviewDetailsStep({ onNext, initialData }: Props) {
//   const [interviewType, setInterviewType] = useState(initialData.interviewType);
//   const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(initialData.candidate);
//   const [selectedPanelMembers, setSelectedPanelMembers] = useState<PanelMember[]>(initialData.panelMembers);

//   const handlePanelMemberToggle = (member: PanelMember) => {
//     const isSelected = selectedPanelMembers.some(m => m.id === member.id);
//     if (isSelected) {
//       setSelectedPanelMembers(selectedPanelMembers.filter(m => m.id !== member.id));
//     } else {
//       setSelectedPanelMembers([...selectedPanelMembers, member]);
//     }
//   };

//   const handleNext = () => {
//     if (!interviewType || !selectedCandidate || selectedPanelMembers.length === 0) {
//       alert('Please fill in all fields');
//       return;
//     }

//     onNext({
//       interviewType,
//       candidate: selectedCandidate,
//       panelMembers: selectedPanelMembers,
//     });
//   };

//   return (
//     <div className="space-y-6">
//       <div>
//         <label className="block text-gray-700 mb-2">
//           Interview Type <span className="text-red-500">*</span>
//         </label>
//         <select
//           value={interviewType}
//           onChange={(e) => setInterviewType(e.target.value)}
//           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//         >
//           <option value="">Select interview type...</option>
//           {INTERVIEW_TYPES.map(type => (
//             <option key={type} value={type}>{type}</option>
//           ))}
//         </select>
//       </div>

//       <div>
//         <label className="block text-gray-700 mb-2">
//           Select Candidate <span className="text-red-500">*</span>
//         </label>
//         <select
//           value={selectedCandidate?.id || ''}
//           onChange={(e) => {
//             const candidate = MOCK_CANDIDATES.find(c => c.id === e.target.value);
//             setSelectedCandidate(candidate || null);
//           }}
//           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//         >
//           <option value="">Select a candidate...</option>
//           {MOCK_CANDIDATES.map(candidate => (
//             <option key={candidate.id} value={candidate.id}>
//               {candidate.name} ({candidate.email})
//             </option>
//           ))}
//         </select>
//       </div>

//       <div>
//         <label className="block text-gray-700 mb-2">
//           Select Interview Panel <span className="text-red-500">*</span>
//         </label>
//         <div className="border border-gray-300 rounded-md p-3 bg-white max-h-60 overflow-y-auto">
//           {MOCK_PANEL_MEMBERS.map(member => (
//             <label
//               key={member.id}
//               className="flex items-center gap-3 py-2 px-2 hover:bg-gray-50 rounded cursor-pointer"
//             >
//               <input
//                 type="checkbox"
//                 checked={selectedPanelMembers.some(m => m.id === member.id)}
//                 onChange={() => handlePanelMemberToggle(member)}
//                 className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//               />
//               <div className="flex-1">
//                 <div className="text-gray-900">{member.name}</div>
//                 <div className="text-gray-500 text-sm">{member.role} • {member.email}</div>
//               </div>
//             </label>
//           ))}
//         </div>
//         {selectedPanelMembers.length > 0 && (
//           <div className="mt-2 text-sm text-gray-600">
//             {selectedPanelMembers.length} panel member(s) selected
//           </div>
//         )}
//       </div>

//       <div className="flex justify-end pt-4 border-t border-gray-200">
//         <button
//           onClick={handleNext}
//           className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// }
