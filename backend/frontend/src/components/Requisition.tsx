import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import * as Toast from "@radix-ui/react-toast";
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Requisition } from "./RequisitionManager";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { RequisitionForm } from "./RequisitionFrom";    
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Capitalize,formatCurrency,formatDate } from "../utils/Utils";
import PositionForm from "./PositionForm";
import { useAuth } from "./AuthProvider";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Label } from "./ui/label";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;



const getPriorityClass = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "high":
      return "bg-red-100 text-red-800";
    case "medium":
      return "bg-blue-100 text-blue-800";
    case "low":
      return "bg-indigo-100 text-indigo-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case "open":
      return "bg-green-100 text-green-800";
    case "on hold":
      return "bg-yellow-100 text-yellow-800";
    case "closed":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

interface ActivityLog {
  id: number;
  username: string;
  action: string;
  details?: string;
  timestamp: string;
}



export default function RequisitionPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [requisition, setRequisition] = useState<Requisition | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const navigate = useNavigate();
   const [showAddDialog, setShowAddDialog] = useState(false);
   const [openEditForm, setEditForm] = useState(false);
   const [openPositionForm, setOpenPositionForm] = useState(false);
   const [positionData, setPositionData] = useState<any>('');
   const [recruitersTeam, setRecruitersTeam] = useState<any[]>([]);
   const [hiringManagers, setHiringManagers] = useState<any[]>([]);
   const [selectedRecruiter, setSelectedRecruiter] = useState<string>("");
  const [selectedHM, setSelectedHM] = useState<string>("");
  const [logs, setLogs] = useState<ActivityLog[]>([]);

 useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE_URL}/requisitions/${id}`)
      .then((res) => res.json())
      .then((data: Requisition) => {
        setRequisition(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching requisition:", err);
        setLoading(false);
      });

      getTeamData();
      getLogs();
  }, [id]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);
  



 
  const getLogs = async () => {
      const res = await fetch(`${API_BASE_URL}/requisitions/${id}/activity`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setLogs(await res.json());
    };
  const token = localStorage.getItem("token");
  const updateRequisition = async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/requisitions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
       },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      toast.success("Requisition updated!");
      const updatedRequisition = await response.json();
      setRequisition(updatedRequisition);
       setEditForm(false);
    } else {
      toast.error("Failed to update requisition");
    }
  }

  
  

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

    try {
      const hmResponse = await fetch(`${API_BASE_URL}/hiring_managers`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      })
      if (hmResponse.ok) {
        const hmData = await hmResponse.json();
        setHiringManagers(hmData || []);
        console.log("Hiring Managers:", hmData);
      } else {
        console.error("Failed to load hiring managers");
      }
  } catch (error) {
      console.error("Hiring managers load error:", error);
    } 
  };
 
 
 

  if (loading) return <p>Loading...</p>;
  if (!requisition) return <p>No requisition found</p>;

  const handleActionClick = (action: string) => {
    showToast(`${action.charAt(0).toUpperCase() + action.slice(1)} clicked!`);
  };
  const candidateCount = requisition?.candidates?.length ?? 0;
  const positionsCount = requisition?.positions?.length ?? 0;
  const filledCount = ()=>{
    let filled=0;
    requisition?.positions?.forEach((pos:any)=>{
      if(pos.status.toLowerCase()==='closed'){
        filled+=1;
      }
    })
    return filled;
  }


  
  
  const daysOpen = (createdDate: string) => {
    const created = new Date(createdDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };



   const updateApprovalStatus = async (status: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/requisitions/${id}/approval`, {
        method: "PUT",
        headers: { "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
         },
        
        body: JSON.stringify({ approval_status: status }),
      });
      if (response.ok) {
        // Refetch requisition details after update
        const updated = await fetch(`${API_BASE_URL}/requisitions/${id}`);
        const updatedRequisition = await updated.json();
        setRequisition(updatedRequisition);
        toast.success(`Requisition ${status}!`);
      } else {
        toast.error("Failed to update approval status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating approval status");
    }
  };

  // ✅ Function to handle assigning recruiter / hiring manager
const updateAssignments = async (recruiterId: number) => {
  try {
    const updateData = { recruiter_id: recruiterId };

    const response = await fetch(`${API_BASE_URL}/requisitions/${id}/assignTeam`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    const data = await response.json();

    if (response.ok) {
      setRequisition(data);
      toast.success("Recruiter assigned successfully!");
    } else {
      console.error("Backend error:", data);
      toast.error(data.detail || "Failed to update team assignment");
    }
  } catch (error) {
    console.error("Error updating team assignment:", error);
    toast.error("Error updating team assignment");
  }
};

  return (
    <Toast.Provider swipeDirection="right">
      <div className="bg-slate-50 text-slate-800 min-h-screen p-6">
        <header className="mb-4 flex md:flex-row justify-between items-start md:items-center">
          <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <div className="flex gap-4 items-center mb-2">
            <Link to="/requisitions">
            <h1 className="text-blue-300 text-3xl font-bold pl-0 hover:text-blue-900">
              Requisitions |
            </h1>
            </Link>
            <h1 className="text-blue-900 text-3xl font-bold">{requisition.position.charAt(0).toUpperCase() + requisition.position.slice(1)}</h1>
            </div>
            <p className="text-sm text-slate-500">Requisition ID: {requisition.req_id}</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Badge style={{height:25 }} className={getPriorityClass(requisition.priority)}>
              {requisition.priority}
            </Badge>
            <Badge style={{height:25 }} className={getStatusClass(requisition.status)}>
              {requisition.status}
            </Badge>
          </div>
          </div>
         {(user?.role === 'hiring_manager' || user?.role === 'admin') && (
           <div className="flex gap-3 mb-8">

            {requisition.approval_status !== "pending" && (
                <Button
                  className="bg-blue-100"
                  variant="outline"
                   onClick={() => updateApprovalStatus("pending")}
                >
                  Revoke
                </Button>
              )}

           {requisition.approval_status === "pending" ? (
                <>
                  <Button
                    className="bg-green-100"
                    variant="outline"
                    onClick={() => updateApprovalStatus("approved")}
                  >
                    Approve
                  </Button>
                  <Button
                    className="bg-red-100"
                    variant="outline"
                    onClick={() => updateApprovalStatus("rejected")}
                  >
                    Reject
                  </Button>
                </>
              ) : (
                <Button variant="outline" className={ requisition.approval_status === "approved" ? "bg-green-500 h-9 px-4 py-2 has-[>svg]:px-3":"bg-red-200 text-black"}>
                  {Capitalize(requisition.approval_status)}
                </Button>
              )}
              
              

          <Dialog open={openEditForm} onOpenChange={setEditForm} >
        <DialogTrigger asChild>
          <Button>
            ✏️ Edit
          </Button>
        </DialogTrigger>
        <DialogContent  className="max-w-3xl max-h-[80vh] overflow-y-auto" >
          <DialogHeader>
            <DialogTitle>Add New Candidate</DialogTitle>
            <DialogDescription>Fill candidate details below.</DialogDescription>
          </DialogHeader>

            <RequisitionForm
                initialData={requisition} 
                onSubmit={updateRequisition}
                onCancel={() =>  setEditForm(false)}
                />
        </DialogContent>
      </Dialog>
      
        
      </div>)}
        </header>

       <hr style={{width:'100%'}} className="bg-gray-200 mb-4"></hr>
   
        {/* Metrics */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
          <div className="grid grid-cols-4 md:grid-cols-4 gap-4">
            {[
                { label: "Openings", value:requisition?.positions_count },
                { label: "Filled", value: filledCount() },
                { label: "Days Open", value: daysOpen(requisition?.created_date) },
                { label: "Applicants", value:candidateCount },
            ].map((metric) => (
              <Card key={metric.label} className=" bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardContent className="p-4">
                  <p className="text-sm text-slate-500">{metric.label}</p>
                  <p className="text-3xl font-bold">{formatNumber(metric.value)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Details */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-medium text-xl border-b pb-3">Job Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="font-medium">Department</dt>
                  <dd className="text-gray-600">{requisition.department}</dd>
                </div>
                <div>
                  <dt className="font-medium">Location</dt>
                  <dd className="text-gray-600">{requisition.location}</dd>
                </div>
                <div>
                  <dt className="font-medium">Employment Type</dt>
                  <dd className="text-gray-600">{requisition.employment_type}</dd>
                </div>
                <div>
                  <dt className="font-medium">Work Mode</dt>
                  <dd className="text-gray-600">{requisition.work_mode}</dd>
                </div>
                <div>
                  <dt className="font-medium">Grade</dt>
                  <dd className="text-gray-600">{requisition.grade}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-medium">Salary Range</dt>
                  <dd className="text-gray-600">
                    {formatCurrency(requisition.min_salary, requisition.currency)}{" "}
                    - {formatCurrency(requisition.max_salary, requisition.currency)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl border-b pb-3">Hiring Team</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="font-medium">Hiring Manager</dt>
                  {user?.role === "admin" ? (
                    <Select
                      value={selectedHM}
                      onValueChange={(value: string) => setSelectedHM(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select hiring manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {hiringManagers.map((hm) => (
                          <SelectItem key={hm.id} value={hm.id.toString()}>
                            {hm.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <dd className="text-gray-600">{Capitalize(requisition.hiring_manager)}</dd>
                  )}
                </div>
                <div>
                  <dt className="font-medium">Recruiter</dt>
                 {user && (user.role === "admin" || user.role === "hiring_manager") ? (
                      <Select
                        value={
                          selectedRecruiter ||
                          (requisition.recruiter_id ? requisition.recruiter_id.toString() : "")
                        }
                        onValueChange={(value: string) => {
                          // 1️⃣ Update state first
                          setSelectedRecruiter(value);

                          // 2️⃣ Wait for state update using callback or manual param
                          updateAssignments(Number(value)); // ✅ Pass recruiter id directly
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select recruiter" />
                        </SelectTrigger>
                        <SelectContent>
                          {recruitersTeam.map((rec) => (
                            <SelectItem key={rec.id} value={rec.id.toString()}>
                              {rec.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <dd className="text-gray-600">
                        {requisition.recruiter?.name ? Capitalize(requisition.recruiter.name) : ""}
                      </dd>
                    )}

                </div>
              </dl>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-medium text-xl border-b pb-3">Timeline & Status</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="font-medium">Date Created</dt>
                  <dd className="text-gray-600">{formatDate(requisition.created_date)}</dd>
                </div>
                <div>
                  <dt className="font-medium">Target Start Date</dt>
                  <dd className="text-gray-600">{formatDate(requisition.target_startdate)}</dd>
                </div>
                <div>
                  <p className="font-medium">Approval Status</p>
                  <dd className="text-gray-600">{Capitalize(requisition.approval_status)}</dd>
                </div>
                <div>
                  <dt className="font-medium">SLA</dt>
                  <dd className="text-gray-600">{requisition.sla} days</dd>
                </div>
              </dl>
            </CardContent>
          </Card>


           <Card>
            <CardHeader>
              <CardTitle className="text-xl border-b pb-3">Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="font-medium">Skills</dt>
                  <dd className="text-gray-600">{requisition?.skills}</dd>
                </div>
                <div>
                  <dt className="font-medium">Description</dt>
                  <dd className="text-gray-600">{requisition.job_description}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
            <div className="mt-6 bg-gray-50 border rounded-lg p-4">
      <h3 className="font-semibold text-lg mb-2">Activity Logs</h3>
      {logs.length === 0 ? (
        <p className="text-sm text-gray-500">No activities yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {logs.map((log) => (
             <li key={log.id} className=" pl-3 pb-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{log.username}</span>
                <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
              </div>
              <p className="text-sm">{log.action}</p>
              {log.details && <p className="text-xs text-gray-600 italic">{log.details}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
          
        </section>
      </div>

      {/* Radix Toast */}
      <Toast.Root
        open={!!toastMessage}
        onOpenChange={(open) => !open && setToastMessage("")}
        duration={3000}
      >
        <Toast.Title>{toastMessage}</Toast.Title>
      </Toast.Root>
      <Toast.Viewport className="fixed bottom-4 right-4 w-80" />
    </Toast.Provider>
  );
}
