
import React, { useState,useEffect } from "react";
import Step1Basic from "./InterviewBasic";
import Step2Calendar from "./Interviewschedule";
import Step3Email from "./InterviewMail";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface PanelCalendar {
  panelEmail: string;
  calendarEvents: any[];
}

export default function InterviewScheduler() {
  const [step, setStep] = useState(1);

  const [interviewType, setInterviewType] = useState("");
  const [candidate, setCandidate] = useState("");
  const [candidates, setCandidates] = useState<
    { id:string, email: string; name: string; position: string; requisition_id: string }[]
  >([]);
  const [panels, setPanels] = useState<string[]>([]);

  const [panelCalendars, setPanelCalendars] = useState<PanelCalendar[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);

  const [emailBody, setEmailBody] = useState("");

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch(`${API_BASE_URL}/candidates`)
    fetch("http://localhost:8000/candidates", {
        headers: { 'Content-Type': 'application/json',
          authorization: `Bearer ${token}`
         }
      })
      .then((res) => res.json())
      .then((data) => setCandidates(data));
  
     
  }, []);

  const goNext = () => setStep(step + 1);
  const goBack = () => setStep(step - 1);

  return (
    <div className="p-6 border rounded-lg bg-white max-w-4xl mx-auto">
      {step === 1 && (
        <Step1Basic
          interviewType={interviewType}
          setInterviewType={setInterviewType}
          candidate={candidate}
          candidates={candidates}
          setCandidate={setCandidate}
          panels={panels}
          setPanels={setPanels}
          onNext={(calendars) => {
            setPanelCalendars(calendars);
            goNext();
          }}
        />
      )}

      {step === 2 && (
        <Step2Calendar
          candidate={candidate}
          panels={panels}
          panelCalendars={panelCalendars}
          onSelectSlot={(slot) => setSelectedSlot(slot)}
          onNext={goNext}
          onBack={goBack}
        />
      )}

      {step === 3 && (
        <Step3Email
          candidate={candidate}
          panels={panels}
          selectedSlot={selectedSlot}
          emailBody={emailBody}
          setEmailBody={setEmailBody}
          onBack={goBack}
        />
      )}
    </div>
  );
}




// import { useState } from 'react';
// import { InterviewDetailsStep } from './InterviewBasic';
// import { CalendarSchedulingStep } from './Interviewschedule';
// import { EmailCompositionStep } from './InterviewMail';

// export interface Candidate {
//   id: string;
//   name: string;
//   email: string;
// }

// export interface PanelMember {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
// }

// export interface InterviewDetails {
//   interviewType: string;
//   candidate: Candidate | null;
//   panelMembers: PanelMember[];
// }

// export interface ScheduledEvent {
//   date: string;
//   startTime: string;
//   endTime: string;
//   title: string;
// }

// export default function InterviewScheduler() {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [interviewDetails, setInterviewDetails] = useState<InterviewDetails>({
//     interviewType: '',
//     candidate: null,
//     panelMembers: [],
//   });
//   const [scheduledEvent, setScheduledEvent] = useState<ScheduledEvent | null>(null);

//   const handleStep1Complete = (details: InterviewDetails) => {
//     setInterviewDetails(details);
//     setCurrentStep(2);
//   };

//   const handleStep2Complete = (event: ScheduledEvent) => {
//     setScheduledEvent(event);
//     setCurrentStep(3);
//   };

//   const handleFinalSubmit = (emailContent: string) => {
//     console.log('Sending interview invitation...');
//     console.log('Interview Details:', interviewDetails);
//     console.log('Scheduled Event:', scheduledEvent);
//     console.log('Email Content:', emailContent);
    
//     // Simulate sending email
//     alert('Interview invitation sent successfully!');
    
//     // Reset form
//     setCurrentStep(1);
//     setInterviewDetails({
//       interviewType: '',
//       candidate: null,
//       panelMembers: [],
//     });
//     setScheduledEvent(null);
//   };

//   const handleBack = () => {
//     if (currentStep > 1) {
//       setCurrentStep(currentStep - 1);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50  px-4">
//       <div className=" mx-auto">
//         <div className="bg-white rounded-lg shadow-md border border-gray-200">
//           {/* Header */}
//           <div className="border-b border-gray-200 px-6 py-2">
//             <h1 className="text-gray-900">Interview Scheduling Form</h1>
            
//             {/* Progress Steps */}
//             <div className="flex items-center mt-6 gap-4">
//               <div className="flex items-center gap-2">
//                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
//                   currentStep === 1 ? 'bg-blue-600 text-white' : currentStep > 1 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
//                 }`}>
//                   1
//                 </div>
//                 <span className={currentStep === 1 ? 'text-blue-600' : currentStep > 1 ? 'text-green-600' : 'text-gray-500'}>
//                   Interview Details
//                 </span>
//               </div>
              
//               <div className="flex-1 h-px bg-gray-300" />
              
//               <div className="flex items-center gap-2">
//                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
//                   currentStep === 2 ? 'bg-blue-600 text-white' : currentStep > 2 ? 'bg-green-600 text-white' : 'bg-gray-300 text-gray-600'
//                 }`}>
//                   2
//                 </div>
//                 <span className={currentStep === 2 ? 'text-blue-600' : currentStep > 2 ? 'text-green-600' : 'text-gray-500'}>
//                   Schedule Time
//                 </span>
//               </div>
              
//               <div className="flex-1 h-px bg-gray-300" />
              
//               <div className="flex items-center gap-2">
//                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
//                   currentStep === 3 ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
//                 }`}>
//                   3
//                 </div>
//                 <span className={currentStep === 3 ? 'text-blue-600' : 'text-gray-500'}>
//                   Send Invitation
//                 </span>
//               </div>
//             </div>
//           </div>

//           {/* Form Content */}
//           <div className="px-6 py-6">
//             {currentStep === 1 && (
//               <InterviewDetailsStep onNext={handleStep1Complete} initialData={interviewDetails} />
//             )}
            
//             {currentStep === 2 && (
//               <CalendarSchedulingStep
//                 interviewDetails={interviewDetails}
//                 onNext={handleStep2Complete}
//                 onBack={handleBack}
//                 initialEvent={scheduledEvent}
//               />
//             )}
            
//             {currentStep === 3 && (
//               <EmailCompositionStep
//                 interviewDetails={interviewDetails}
//                 scheduledEvent={scheduledEvent}
//                 onSubmit={handleFinalSubmit}
//                 onBack={handleBack}
//               />
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

