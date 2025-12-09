
import React, { useState } from "react";
import {
  Calendar,
  momentLocalizer,
  Views,
} from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { PanelCalendar } from "./ParentForom";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const localizer = momentLocalizer(moment);

interface Props {
  candidate: string;
  panels: string[];
  panelCalendars: PanelCalendar[];
  onSelectSlot: (slot: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function Step2Calendar({
  candidate,
  panelCalendars,
  onSelectSlot,
  onNext,
  onBack
}: Props) {

  const recruiterEmail = panelCalendars[0]?.panelEmail;

  const events =
    panelCalendars[0]?.calendarEvents.map((item) => ({
      title: "Busy",
      start: new Date(item.start),
      end: new Date(item.end),
      allDay: false,
    })) || [];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Step 2: Select Slot</h2>

      <p className="mb-2"><strong>Recruiter:</strong> {recruiterEmail}</p>
      <p className="mb-4"><strong>Candidate:</strong> {candidate}</p>

      <Calendar
        selectable
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView={Views.WEEK}
        style={{ height: 500 }}
        onSelectSlot={(slot) => {
          onSelectSlot(slot);
          alert(`Selected Slot: ${slot.start}`);
        }}
      />

      <div className="flex justify-between mt-4">
        <button onClick={onBack} className="px-4 py-2 rounded border">
          Back
        </button>

        <button onClick={onNext} className="px-4 py-2 rounded bg-blue-600 text-white">
          Next
        </button>
      </div>
    </div>
  );
}



// import { useState } from 'react';
// import { InterviewDetails, ScheduledEvent, PanelMember } from './ParentForom';
// import { Calendar, Clock, User, X, ChevronLeft, ChevronRight } from 'lucide-react';

// interface CalendarEvent {
//   id: string;
//   title: string;
//   start: string;
//   end: string;
//   type: 'busy' | 'available';
// }

// interface TimeSlot {
//   date: string;
//   time: string;
//   dateTime: string;
// }

// // Mock calendar data generator
// const generateMockCalendar = (panelMember: PanelMember): CalendarEvent[] => {
//   const events: CalendarEvent[] = [];
//   const today = new Date();
  
//   // Generate some mock events for the next 30 days
//   for (let i = 0; i < 30; i++) {
//     const date = new Date(today);
//     date.setDate(date.getDate() + i);
//     const dateStr = date.toISOString().split('T')[0];
    
//     // Add 2-4 random busy slots per day
//     const busySlots = Math.floor(Math.random() * 3) + 2;
//     for (let j = 0; j < busySlots; j++) {
//       const startHour = 9 + Math.floor(Math.random() * 7);
//       const startMin = Math.random() > 0.5 ? '00' : '30';
//       events.push({
//         id: `${panelMember.id}-${i}-${j}`,
//         title: 'Busy',
//         start: `${dateStr}T${startHour.toString().padStart(2, '0')}:${startMin}`,
//         end: `${dateStr}T${(startHour + 1).toString().padStart(2, '0')}:${startMin}`,
//         type: 'busy',
//       });
//     }
//   }
  
//   return events;
// };

// interface Props {
//   interviewDetails: InterviewDetails;
//   onNext: (event: ScheduledEvent) => void;
//   onBack: () => void;
//   initialEvent: ScheduledEvent | null;
// }

// export function CalendarSchedulingStep({ interviewDetails, onNext, onBack, initialEvent }: Props) {
//   const [selectedPanelMember, setSelectedPanelMember] = useState<PanelMember | null>(
//     interviewDetails.panelMembers[0] || null
//   );
//   const [calendarEvents, setCalendarEvents] = useState<Record<string, CalendarEvent[]>>(() => {
//     const calendars: Record<string, CalendarEvent[]> = {};
//     interviewDetails.panelMembers.forEach(member => {
//       calendars[member.id] = generateMockCalendar(member);
//     });
//     return calendars;
//   });
  
//   const [weekOffset, setWeekOffset] = useState(0); // Track which week we're viewing
//   const [scheduledEvent, setScheduledEvent] = useState<ScheduledEvent | null>(initialEvent);
//   const [isSelecting, setIsSelecting] = useState(false);
//   const [selectionStart, setSelectionStart] = useState<TimeSlot | null>(null);
//   const [selectionEnd, setSelectionEnd] = useState<TimeSlot | null>(null);

//   const handleMouseDown = (date: string, time: string) => {
//     const dateTime = `${date}T${time}`;
//     if (isTimeSlotBusy(date, time)) {
//       return;
//     }
    
//     setIsSelecting(true);
//     const slot: TimeSlot = { date, time, dateTime };
//     setSelectionStart(slot);
//     setSelectionEnd(slot);
//     setScheduledEvent(null);
//   };

//   const handleMouseEnter = (date: string, time: string) => {
//     if (!isSelecting || !selectionStart) return;
    
//     const dateTime = `${date}T${time}`;
//     const slot: TimeSlot = { date, time, dateTime };
//     setSelectionEnd(slot);
//   };

//   const handleMouseUp = () => {
//     if (isSelecting && selectionStart && selectionEnd) {
//       const start = selectionStart.dateTime <= selectionEnd.dateTime ? selectionStart : selectionEnd;
//       const end = selectionStart.dateTime <= selectionEnd.dateTime ? selectionEnd : selectionStart;
      
//       const endTime = addMinutesToTime(end.time, 30);
      
//       const newEvent: ScheduledEvent = {
//         date: start.date,
//         startTime: start.time,
//         endTime: endTime,
//         title: `${interviewDetails.interviewType} - ${interviewDetails.candidate?.name}`,
//       };
      
//       setScheduledEvent(newEvent);
//       setIsSelecting(false);
//       setSelectionStart(null);
//       setSelectionEnd(null);
//     }
//   };

//   const addMinutesToTime = (time: string, minutes: number): string => {
//     const [hours, mins] = time.split(':').map(Number);
//     const totalMinutes = hours * 60 + mins + minutes;
//     const newHours = Math.floor(totalMinutes / 60);
//     const newMins = totalMinutes % 60;
//     return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
//   };

//   const isSlotInSelection = (date: string, time: string): boolean => {
//     if (!selectionStart || !selectionEnd) return false;
    
//     const dateTime = `${date}T${time}`;
//     const start = selectionStart.dateTime <= selectionEnd.dateTime ? selectionStart : selectionEnd;
//     const end = selectionStart.dateTime <= selectionEnd.dateTime ? selectionEnd : selectionStart;
    
//     return dateTime >= start.dateTime && dateTime <= end.dateTime;
//   };

//   const isSlotInScheduledEvent = (date: string, time: string): boolean => {
//     if (!scheduledEvent) return false;
    
//     const dateTime = `${date}T${time}`;
//     const eventStart = `${scheduledEvent.date}T${scheduledEvent.startTime}`;
//     const eventEnd = `${scheduledEvent.date}T${scheduledEvent.endTime}`;
    
//     return dateTime >= eventStart && dateTime < eventEnd;
//   };

//   const handleClearSelection = () => {
//     setScheduledEvent(null);
//     setSelectionStart(null);
//     setSelectionEnd(null);
//   };

//   const handleNext = () => {
//     if (!scheduledEvent) {
//       alert('Please select an interview time on the calendar');
//       return;
//     }
//     onNext(scheduledEvent);
//   };

//   const getTimeSlots = () => {
//     const slots = [];
//     for (let hour = 9; hour <= 17; hour++) {
//       slots.push(`${hour.toString().padStart(2, '0')}:00`);
//       slots.push(`${hour.toString().padStart(2, '0')}:30`);
//     }
//     return slots;
//   };

//   const get7Days = () => {
//     const days = [];
//     const today = new Date();
//     const startOffset = weekOffset * 7;
    
//     for (let i = startOffset; i < startOffset + 7; i++) {
//       const date = new Date(today);
//       date.setDate(date.getDate() + i);
//       days.push(date);
//     }
//     return days;
//   };

//   const getDateRange = () => {
//     const days = get7Days();
//     if (days.length === 0) return '';
    
//     const firstDay = days[0];
//     const lastDay = days[days.length - 1];
    
//     const firstMonth = firstDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
//     const lastMonth = lastDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    
//     return `${firstMonth} - ${lastMonth}`;
//   };

//   const isTimeSlotBusy = (date: string, time: string): boolean => {
//     if (!selectedPanelMember) return false;
    
//     const events = calendarEvents[selectedPanelMember.id] || [];
//     const dateTime = `${date}T${time}`;
    
//     return events.some(event => {
//       return dateTime >= event.start && dateTime < event.end;
//     });
//   };

//   const isToday = (date: Date): boolean => {
//     const today = new Date();
//     return date.toDateString() === today.toDateString();
//   };

//   const isPastDate = (date: Date): boolean => {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const compareDate = new Date(date);
//     compareDate.setHours(0, 0, 0, 0);
//     return compareDate < today;
//   };

//   const navigateWeek = (direction: number) => {
//     setWeekOffset(weekOffset + direction);
//   };

//   const goToToday = () => {
//     setWeekOffset(0);
//   };

//   return (
//     <div className="space-y-6">
//       {/* Selected Details Summary */}
//       {/* <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <div className="text-sm text-gray-600 mb-1">Candidate</div>
//             <div className="text-gray-900">{interviewDetails.candidate?.name}</div>
//             <div className="text-sm text-gray-500">{interviewDetails.candidate?.email}</div>
//           </div>
//           <div>
//             <div className="text-sm text-gray-600 mb-1">Interview Type</div>
//             <div className="text-gray-900">{interviewDetails.interviewType}</div>
//           </div>
//         </div>
//       </div> */}

//       {/* Interview Panel Tabs */}
//       <div>
//         <label className="block text-gray-700 mb-3">
//           Select panel member to view their calendar
//         </label>
//         <div className="flex flex-wrap gap-2">
//           {interviewDetails.panelMembers.map(member => (
//             <button
//               key={member.id}
//               onClick={() => setSelectedPanelMember(member)}
//               className={`px-4 py-2 rounded-lg border-2 transition-all ${
//                 selectedPanelMember?.id === member.id
//                   ? 'bg-blue-600 text-white border-blue-600 shadow-md'
//                   : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:shadow'
//               }`}
//             >
//               <div className="flex items-center gap-2">
//                 <User className="w-4 h-4" />
//                 <div className="text-left">
//                   <div>{member.name}</div>
//                   {/* <div className="text-xs opacity-80">{member.role}</div> */}
//                 </div>
//               </div>
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Calendar View */}
//       {selectedPanelMember && (
//         <div className="border border-gray-300 rounded-lg bg-white shadow-lg h-100 overflow-y-scroll">
//           {/* Calendar Header */}
//           <div className="bg-white border-b border-gray-200 px-6 py-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h3 className="text-gray-900">{selectedPanelMember.name}'s Calendar</h3>
//                 <p className="text-sm text-gray-500">{getDateRange()}</p>
//               </div>
//               <div className="flex items-center gap-3">
//                 <button
//                   onClick={() => navigateWeek(-1)}
//                   className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
//                   title="Previous week"
//                 >
//                   <ChevronLeft className="w-5 h-5 text-gray-600" />
//                 </button>
//                 <button
//                   onClick={goToToday}
//                   className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   Today
//                 </button>
//                 <button
//                   onClick={() => navigateWeek(1)}
//                   className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
//                   title="Next week"
//                 >
//                   <ChevronRight className="w-5 h-5 text-gray-600" />
//                 </button>
//                 <div className="flex items-center gap-2 ml-2 text-sm text-gray-600">
//                   <Calendar className="w-4 h-4" />
//                   <span>Click and drag to select</span>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Calendar Grid */}
//           <div className="overflow-x-auto bg-gray-50">
//             <div className="min-w-[900px]">
//               {/* Days Header */}
//               <div className="grid grid-cols-8 bg-white border-b border-gray-300 sticky top-0 z-10">
//                 <div className="px-4 py-3 text-sm text-gray-500 border-r border-gray-200">
//                   Time
//                 </div>
//                 {get7Days().map((date, idx) => {
//                   const today = isToday(date);
//                   const past = isPastDate(date);
                  
//                   return (
//                     <div
//                       key={idx}
//                       className={`px-2 py-3 text-center border-r border-gray-200 ${
//                         past ? 'bg-gray-100' : today ? 'bg-blue-50' : 'bg-white'
//                       }`}
//                     >
//                       <div className={`text-xs uppercase tracking-wide ${
//                         today ? 'text-blue-600' : past ? 'text-gray-400' : 'text-gray-500'
//                       }`}>
//                         {date.toLocaleDateString('en-US', { weekday: 'short' })}
//                       </div>
//                       <div className={`mt-1 ${
//                         today 
//                           ? 'inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full' 
//                           : past
//                           ? 'text-gray-400'
//                           : 'text-gray-900'
//                       }`}>
//                         {date.getDate()}
//                       </div>
//                       <div className="text-xs text-gray-400 mt-0.5">
//                         {date.toLocaleDateString('en-US', { month: 'short' })}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Time Slots Grid */}
//               <div className="bg-white" onMouseUp={handleMouseUp} onMouseLeave={() => setIsSelecting(false)}>
//                 {getTimeSlots().map((time, timeIdx) => (
//                   <div
//                     key={time}
//                     className={`grid grid-cols-8 border-b border-gray-200 ${
//                       timeIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
//                     }`}
//                   >
//                     {/* Time Label */}
//                     <div className="px-4 py-3 text-sm text-gray-600 border-r border-gray-200 bg-white">
//                       {time}
//                     </div>
                    
//                     {/* Day Slots */}
//                     {get7Days().map((date, dayIdx) => {
//                       const dateStr = date.toISOString().split('T')[0];
//                       const isBusy = isTimeSlotBusy(dateStr, time);
//                       const isInSelection = isSlotInSelection(dateStr, time);
//                       const isInScheduled = isSlotInScheduledEvent(dateStr, time);
//                       const past = isPastDate(date);
                      
//                       return (
//                         <div
//                           key={dayIdx}
//                           onMouseDown={() => !past && handleMouseDown(dateStr, time)}
//                           onMouseEnter={() => !past && handleMouseEnter(dateStr, time)}
//                           className={`px-2 py-3 border-r border-gray-200 transition-colors relative ${
//                             past
//                               ? 'bg-gray-100 cursor-not-allowed'
//                               : isBusy
//                               ? 'bg-red-100/70 cursor-not-allowed'
//                               : isInScheduled
//                               ? 'bg-blue-600 cursor-pointer'
//                               : isInSelection
//                               ? 'bg-blue-400 cursor-pointer'
//                               : 'hover:bg-blue-50 cursor-pointer'
//                           }`}
//                         >
//                           {isBusy && !past && (
//                             <div className="absolute inset-0 flex items-center justify-center">
//                               {/* <div className="bg-red-200 border-l-4 border-red-500 px-2 py-0.5 text-xs text-red-700 rounded-r shadow-sm">
//                                 Busy
//                               </div> */}
//                             </div>
//                           )}
//                           {isInScheduled && (
//                             <div className="absolute inset-0 flex items-center justify-center">
//                               <div className="text-xs text-white">
//                                 Interview
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       );
//                     })}
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Calendar Footer with Legend */}
//           <div className="bg-gray-50 border-t border-gray-200 px-6 py-3">
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-6 text-sm">
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 bg-white border border-gray-300 rounded"></div>
//                   <span className="text-gray-600">Available</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 bg-red-100/70 border border-red-300 rounded"></div>
//                   <span className="text-gray-600">Busy</span>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <div className="w-4 h-4 bg-blue-600 rounded"></div>
//                   <span className="text-gray-600">Selected</span>
//                 </div>
//               </div>
//               <div className="text-xs text-gray-500">
//                 Showing week {weekOffset + 1} • Business hours: 9:00 AM - 6:00 PM
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Scheduled Event Display */}
//       {scheduledEvent && (
//         <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4 shadow-md">
//           <div className="flex items-start gap-3">
//             <Clock className="w-5 h-5 text-green-600 mt-0.5" />
//             <div className="flex-1">
//               <h4 className="text-green-900 mb-1">Interview Scheduled</h4>
//               <p className="text-sm text-green-700">
//                 <strong>Date:</strong> {new Date(scheduledEvent.date).toLocaleDateString('en-US', { 
//                   weekday: 'long', 
//                   year: 'numeric', 
//                   month: 'long', 
//                   day: 'numeric' 
//                 })}
//               </p>
//               <p className="text-sm text-green-700">
//                 <strong>Time:</strong> {scheduledEvent.startTime} - {scheduledEvent.endTime}
//               </p>
//               <p className="text-sm text-green-700">
//                 <strong>Panel:</strong> {selectedPanelMember?.name}
//               </p>
//             </div>
//             <button
//               onClick={handleClearSelection}
//               className="text-green-700 hover:text-green-800 hover:bg-green-100 p-1 rounded"
//               title="Clear selection"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Navigation Buttons */}
//       <div className="flex justify-between pt-4 border-t border-gray-200">
//         <button
//           onClick={onBack}
//           className="px-6 py-2 bg-white text-gray-700 border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all"
//         >
//           Back
//         </button>
//         <button
//           onClick={handleNext}
//           className="px-6 py-2 bg-blue-600 text-white border-2 border-blue-600 rounded-lg hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
//         >
//           Next
//         </button>
//       </div>
//     </div>
//   );
// }
