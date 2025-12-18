import React, { useEffect, useState } from "react";
import {
  Calendar,
  ChevronRight,
  Plus,
  X,
  Mail,
  CheckCircle,
  Edit3,
  ChevronDown,
} from "lucide-react";
import { Button } from "./ui/button";
import { useAuth } from "./AuthProvider";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const TIME_SLOTS = [
  "09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30",
  "15:00","15:30","16:00","16:30","17:00"
];

interface Candidate {
  id: string;
  name: string;
  email: string;
  requisition_id: string;
  position: string;
  company_id: number;
}

export default function InterviewScheduler({
  onSuccess,
}: {
  onSuccess: () => void;
}) {
  const token = localStorage.getItem("token");
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [busySlots, setBusySlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [interviewersList, setInterviewersList] = useState<any[]>([]);

  const [form, setForm] = useState({
    candidate_id: "",
    candidate_name: "",
    candidate_email: "",
    requisition_id: "",
    interview_type: "technical",
    mode: "video",
    date: new Date(),
    duration: 60,
    interviewers: [] as string[],
    emailBody: "",
  });

  /* ---------------- Load Data ---------------- */
  useEffect(() => {
    fetch(`${API_BASE_URL}/candidates`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setCandidates)
      .catch(() => toast.error("Failed to load candidates"));

    const fetchInterviewers = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/interviewers`, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            setInterviewersList(data);
        } catch {
            toast.error("Failed to load interviewers");
        }
    };
    fetchInterviewers();
  }, []);

  /* ---------------- Fetch Free/Busy ---------------- */
  const fetchBusySlots = async (date: Date) => {
    try {
      const start = new Date(date);
      start.setHours(9, 0, 0, 0);
      const end = new Date(date);
      end.setHours(18, 0, 0, 0);

      const res = await fetch(`${API_BASE_URL}/interviews/free-busy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ start, end }),
      });

      const data = await res.json();
      setBusySlots(
        data.map((b: any) =>
          new Date(b.start).toISOString().substring(11, 16)
        )
      );
    } catch {
      toast.error("Failed to load calendar");
    }
  };

  useEffect(() => {
    fetchBusySlots(form.date);
  }, [form.date]);

  /* ---------------- Step 1 → Create Interview ---------------- */
  const createInterview = async () => {
    if (!selectedSlot || !form.candidate_id) {
      toast.error("Select candidate & time slot");
      return;
    }

    setLoading(true);

    try {
      const [h, m] = selectedSlot.split(":");
      const start = new Date(form.date);
      start.setHours(Number(h), Number(m));

      const end = new Date(start.getTime() + form.duration * 60000);

      const payload = {
        candidate_id: form.candidate_id,
        requisition_id: Number(form.requisition_id),
        interview_type: form.interview_type,
        mode: form.mode,
        start,
        end,
        interviewers: form.interviewers,
      };

      const res = await fetch(`${API_BASE_URL}/interviews/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error();

      setForm(prev => ({
        ...prev,
        emailBody: `Hello ${form.candidate_name},

Your interview has been scheduled.

🗓 Date: ${start.toDateString()}
⏰ Time: ${selectedSlot}
💻 Mode: ${form.mode}

Meeting link will be shared shortly.

Regards,
Recruitment Team`,
      }));

      setStep(2);
    } catch {
      toast.error("Failed to schedule interview");
    } finally {
      setLoading(false);
    }
  };

  const handleInterviewerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    let newInterviewers;
    if (checked) {
        newInterviewers = [...form.interviewers, value];
    } else {
        newInterviewers = form.interviewers.filter(i => i !== value);
    }
    setForm({ ...form, interviewers: newInterviewers });
  }

  /* ---------------- Final Submit ---------------- */
  const finish = () => {
    toast.success("Interview scheduled successfully");
    onSuccess();
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="animate-fadeIn">
      {step === 1 && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">Interview Details</h3>

              {/* Candidate */}
              <div>
                <label className="text-xs font-bold">Candidate</label>
                <select
                  className="w-full border rounded-lg px-3 py-2"
                  onChange={(e) => {
                    const c = candidates.find(
                      c => c.id === e.target.value
                    );
                    if (!c) return;
                    setForm({
                      ...form,
                      candidate_id: c.id,
                      candidate_name: c.name,
                      candidate_email: c.email,
                      requisition_id: c.requisition_id,
                    });
                  }}
                >
                  <option value="">Select Candidate</option>
                  {candidates.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Interview Type */}
              <div>
                <label className="text-xs font-bold">Interview Type</label>
                <select
                  value={form.interview_type}
                  onChange={(e) =>
                    setForm({ ...form, interview_type: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="screening">Screening</option>
                  <option value="technical">Technical</option>
                  <option value="behavioral">Behavioral</option>
                  <option value="final">Final</option>
                </select>
              </div>

              {/* Mode */}
              <div>
                <label className="text-xs font-bold">Mode</label>
                <select
                  value={form.mode}
                  onChange={(e) =>
                    setForm({ ...form, mode: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="video">Video</option>
                  <option value="phone">Phone</option>
                  <option value="in-person">In Person</option>
                </select>
              </div>

              {/* Interview Panel */}
              <div>
                <label className="text-xs font-bold">Interview Panel</label>
                <div className="flex flex-wrap gap-2 border rounded-lg p-2">
                    {interviewersList.map(interviewer => (
                        <div key={interviewer.id} className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id={`interviewer-${interviewer.id}`}
                                value={interviewer.name}
                                checked={form.interviewers.includes(interviewer.name)}
                                onChange={handleInterviewerChange}
                            />
                            <label htmlFor={`interviewer-${interviewer.id}`}>{interviewer.name}</label>
                        </div>
                    ))}
                </div>
              </div>

            </div>

            {/* RIGHT */}
            <div className="border rounded-xl p-4">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Calendar size={18} /> Select Time
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {TIME_SLOTS.map(slot => (
                  <button
                    key={slot}
                    disabled={busySlots.includes(slot)}
                    onClick={() => setSelectedSlot(slot)}
                    className={`py-2 rounded text-sm border
                      ${
                        busySlots.includes(slot)
                          ? "bg-red-50 text-red-300"
                          : selectedSlot === slot
                          ? "bg-indigo-600 text-white"
                          : "bg-white hover:border-indigo-400"
                      }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-6">
            <Button onClick={createInterview} disabled={loading}>
              {loading ? "Scheduling..." : "Schedule Interview"}
              <ChevronRight className="ml-2" size={18} />
            </Button>
          </div>
        </>
      )}

      {step === 2 && (
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="text-green-600" />
            <h3 className="font-bold">Review Email</h3>
          </div>

          <textarea
            value={form.emailBody}
            onChange={(e) =>
              setForm({ ...form, emailBody: e.target.value })
            }
            className="w-full h-48 border rounded-lg p-4 font-mono"
          />

          <div className="flex justify-between mt-4">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button onClick={finish}>
              Send & Finish <Mail className="ml-2" size={18} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
