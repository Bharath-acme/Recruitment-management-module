
import axios from "axios";
import React, { useState } from "react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Props {
  candidate: string;
  panels: string[];
  selectedSlot: any;
  emailBody: string;
  setEmailBody: (v: string) => void;
  onBack: () => void;
}

export default function Step3Email({
  candidate,
  panels,
  selectedSlot,
  emailBody,
  setEmailBody,
  onBack
}: Props) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);

    await axios.post("/api/interviews/send-mail", {
      candidate,
      panels,
      slot: selectedSlot,
      body: emailBody
    });

    alert("Interview Scheduled Successfully!");
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Step 3: Email Content</h2>

      <textarea
        className="border p-2 w-full h-40 mb-4"
        placeholder="Write email content here..."
        value={emailBody}
        onChange={(e) => setEmailBody(e.target.value)}
      />

      <div className="flex justify-between">
        <button onClick={onBack} className="px-4 py-2 border rounded">
          Back
        </button>

        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-green-600 text-white rounded"
          disabled={loading}
        >
          {loading ? "Sending..." : "Submit"}
        </button>
      </div>
    </div>
  );
}




// import { useState } from 'react';
// import { InterviewDetails, ScheduledEvent } from './ParentForom';
// import { Mail, Send } from 'lucide-react';

// interface Props {
//   interviewDetails: InterviewDetails;
//   scheduledEvent: ScheduledEvent | null;
//   onSubmit: (emailContent: string) => void;
//   onBack: () => void;
// }

// export function EmailCompositionStep({ interviewDetails, scheduledEvent, onSubmit, onBack }: Props) {
//   const generateDefaultEmailContent = () => {
//     const candidate = interviewDetails.candidate;
//     const panelNames = interviewDetails.panelMembers.map(p => p.name).join(', ');
//     const date = scheduledEvent 
//       ? new Date(scheduledEvent.date).toLocaleDateString('en-US', { 
//           weekday: 'long', 
//           year: 'numeric', 
//           month: 'long', 
//           day: 'numeric' 
//         })
//       : '';
    
//     return `Dear ${candidate?.name || 'Candidate'},

// We are pleased to invite you to an interview for the position you have applied for.

// Interview Details:
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// • Interview Type: ${interviewDetails.interviewType}
// • Date: ${date}
// • Time: ${scheduledEvent?.startTime || ''} - ${scheduledEvent?.endTime || ''}
// • Interview Panel: ${panelNames}

// Please confirm your availability by replying to this email at your earliest convenience.

// If you have any questions or need to reschedule, please don't hesitate to reach out.

// We look forward to speaking with you!

// Best regards,
// HR Team`;
//   };

//   const [emailSubject, setEmailSubject] = useState(
//     `Interview Invitation - ${interviewDetails.interviewType}`
//   );
//   const [emailContent, setEmailContent] = useState(generateDefaultEmailContent());

//   const handleSubmit = () => {
//     if (!emailContent.trim()) {
//       alert('Please enter email content');
//       return;
//     }
//     onSubmit(emailContent);
//   };

//   return (
//     <div className="space-y-6">
//       {/* Summary */}
//       <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
//         <div className="flex items-start gap-3">
//           <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
//           <div className="flex-1">
//             <h3 className="text-blue-900 mb-2">Interview Invitation Summary</h3>
//             <div className="grid grid-cols-2 gap-4 text-sm">
//               <div>
//                 <span className="text-blue-700">Candidate:</span>
//                 <div className="text-blue-900">{interviewDetails.candidate?.name}</div>
//               </div>
//               <div>
//                 <span className="text-blue-700">Interview Type:</span>
//                 <div className="text-blue-900">{interviewDetails.interviewType}</div>
//               </div>
//               <div>
//                 <span className="text-blue-700">Date:</span>
//                 <div className="text-blue-900">
//                   {scheduledEvent 
//                     ? new Date(scheduledEvent.date).toLocaleDateString('en-US', { 
//                         year: 'numeric', 
//                         month: 'long', 
//                         day: 'numeric' 
//                       })
//                     : 'Not scheduled'}
//                 </div>
//               </div>
//               <div>
//                 <span className="text-blue-700">Time:</span>
//                 <div className="text-blue-900">
//                   {scheduledEvent 
//                     ? `${scheduledEvent.startTime} - ${scheduledEvent.endTime}`
//                     : 'Not scheduled'}
//                 </div>
//               </div>
//             </div>
//             <div className="mt-3 pt-3 border-t border-blue-200">
//               <span className="text-blue-700">Panel Members:</span>
//               <div className="text-blue-900 mt-1">
//                 {interviewDetails.panelMembers.map((member, idx) => (
//                   <div key={member.id} className="text-sm">
//                     {idx + 1}. {member.name} - {member.role}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Email Editor */}
//       <div className="border border-gray-300 rounded-md bg-white">
//         <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
//           <h3 className="text-gray-900">Email Invitation</h3>
//         </div>
        
//         <div className="p-4 space-y-4">
//           {/* Recipients */}
//           <div>
//             <label className="block text-sm text-gray-700 mb-1">To:</label>
//             <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
//               {interviewDetails.candidate?.email}
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm text-gray-700 mb-1">CC:</label>
//             <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700">
//               {interviewDetails.panelMembers.map(m => m.email).join('; ')}
//             </div>
//           </div>

//           {/* Subject */}
//           <div>
//             <label className="block text-sm text-gray-700 mb-1">Subject:</label>
//             <input
//               type="text"
//               value={emailSubject}
//               onChange={(e) => setEmailSubject(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           {/* Email Body */}
//           <div>
//             <label className="block text-sm text-gray-700 mb-1">Message:</label>
//             <textarea
//               value={emailContent}
//               onChange={(e) => setEmailContent(e.target.value)}
//               rows={16}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
//             />
//           </div>

//           {/* Character Count */}
//           <div className="text-sm text-gray-500 text-right">
//             {emailContent.length} characters
//           </div>
//         </div>
//       </div>

//       {/* Navigation Buttons */}
//       <div className="flex justify-between pt-4 border-t border-gray-200">
//         <button
//           onClick={onBack}
//           className="px-6 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
//         >
//           Back
//         </button>
//         <button
//           onClick={handleSubmit}
//           className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
//         >
//           <div className="flex items-center gap-2">
//             <Send className="w-4 h-4" />
//             <span>Send Invitation</span>
//           </div>
//         </button>
//       </div>
//     </div>
//   );
// }