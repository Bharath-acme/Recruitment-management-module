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

 useEffect(() => {
    if (!id) return;
    fetch(`http://127.0.0.1:8000/requisitions/${id}`)
      .then((res) => res.json())
      .then((data: Requisition) => {
        setRequisition(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching requisition:", err);
        setLoading(false);
      });
  }, [id]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);
 
  const updateRequisition = async (data: any) => {
  const response = await fetch(`http://127.0.0.1:8000/requisitions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
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
 
  const createPosition = async (data: any) => {
    try {
          const response = await fetch(`http://127.0.0.1:8000/positions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          });

          if (response.ok) {
            const newPosition = await response.json();
            toast.success("Position added successfully!");
            setPositionData(newPosition);
            console.log("New Position:", newPosition);
            setOpenPositionForm(false);
          } else {
            toast.error("Failed to add position");
          }
        } catch (err) {
          console.error("Error adding position:", err);
          toast.error("Error while adding position");
        }
      }

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

  return (
    <Toast.Provider swipeDirection="right">
      <div className="bg-slate-50 text-slate-800 min-h-screen p-6">
        <header className="mb-8 flex md:flex-row justify-between items-start md:items-center">
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
            <p className="text-sm text-slate-500">ID: {requisition.req_id}</p>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Badge className={getPriorityClass(requisition.priority)}>
              {requisition.priority}
            </Badge>
            <Badge className={getStatusClass(requisition.status)}>
              {requisition.status}
            </Badge>
          </div>
          </div>
         {(user?.role === 'hiring_manager' || user?.role === 'admin') && (
           <div className="flex gap-3 mb-8">

          <Dialog open={openEditForm} onOpenChange={setEditForm} >
        <DialogTrigger asChild>
          <Button>
            ✏️ Edit
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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

        {/* Action buttons */}
       

        {/* Metrics */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { label: "Openings", value:positionsCount },
                { label: "Filled", value: filledCount() },
                { label: "Days Open", value: daysOpen(requisition?.created_date) },
                { label: "Applicants", value:candidateCount },
            ].map((metric) => (
              <Card key={metric.label}>
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
              <CardTitle className="font-medium text-xl">Job Information</CardTitle>
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
              <CardTitle className="text-xl">Hiring Team</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                <div>
                  <dt className="font-medium">Hiring Manager</dt>
                  <dd className="text-gray-600">{Capitalize(requisition.hiring_manager)}</dd>
                </div>
                <div>
                  <dt className="font-medium">Recruiter</dt>
                  <dd className="text-gray-600">{requisition.recruiter_id ? Capitalize(requisition.recruiter.name):''}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

<Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="font-medium text-xl">Timeline & Status</CardTitle>
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
                  <dd className="text-gray-600">{requisition.approval_status}</dd>
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
              <CardTitle className="text-xl">Job Description</CardTitle>
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
