import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import * as Toast from "@radix-ui/react-toast";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Requisition } from "./RequisitionManager";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { RequisitionForm } from "./RequisitionFrom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "./ui/dialog";
import { Capitalize, formatCurrency, formatDate } from "../utils/Utils";
import PositionForm from "./PositionForm";
import { useAuth } from "./AuthProvider";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "./ui/select";
import { Label } from "./ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
import {
  Building2,
  MapPin,
  Briefcase,
  Home,
  GraduationCap,
  DollarSign,
  User,
  Users,
  Calendar,
  Clock,
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Target,
  Activity,
  Edit,
  CheckCheck,
  Ban,
  UserPlus,
  ArrowLeft
} from "lucide-react";

const capitalize = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const getPriorityClass = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "high":
      return "bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 border-rose-200";
    case "medium":
      return "bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 border-blue-200";
    case "low":
      return "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border-indigo-200";
    default:
      return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200";
  }
};

const getStatusClass = (status: string) => {
  switch (status.toLowerCase()) {
    case "open":
      return "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200";
    case "on hold":
      return "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200";
    case "closed":
      return "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-200";
    default:
      return "bg-gradient-to-r from-gray-100 to-slate-100 text-gray-700 border-gray-200";
  }
};

interface ActivityLog {
  id: number;
  username: string;
  action: string;
  details?: string;
  timestamp: string;
}

export default function RquisitionPage2() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [requisition, setRequisition] = useState<Requisition | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState("");
  const navigate = useNavigate();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [openEditForm, setEditForm] = useState(false);
  const [openPositionForm, setOpenPositionForm] = useState(false);
  const [positionData, setPositionData] = useState<any>("");
  const [recruitersTeam, setRecruitersTeam] = useState<any[]>([]);
  const [hiringManagers, setHiringManagers] = useState<any[]>([]);
  const [selectedRecruiter, setSelectedRecruiter] = useState<string>("");
  const [selectedHM, setSelectedHM] = useState<string>("");
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [showApplicants, setShowApplicants] = useState(false);

  const token = localStorage.getItem("token");

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const getLogs = async () => {
    if (!id) return;
    const res = await fetch(`${API_BASE_URL}/requisitions/${id}/activity`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) setLogs(await res.json());
  };

  const updateRequisition = async (data: any) => {
    if (!id) return;
    const response = await fetch(`${API_BASE_URL}/requisitions/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    if (response.ok) {
      toast.success("Requisition updated!");
      const updatedRequisition = await response.json();
      setRequisition(updatedRequisition);
      setEditForm(false);
    } else {
      toast.error("Failed to update requisition");
    }
  };

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
      });
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

  const candidateCount = requisition?.candidates?.length ?? 0;
  const positionsCount = requisition?.positions?.length ?? 0;

  const filledCount = () => {
    let filled = 0;
    requisition?.positions?.forEach((pos: any) => {
      if (pos.status?.toLowerCase() === "closed") {
        filled += 1;
      }
    });
    return filled;
  };

  const daysOpen = (createdDate: string) => {
    if (!createdDate) return 0;
    const created = new Date(createdDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const updateApprovalStatus = async (status: string) => {
    if (!id) return;
    try {
      const response = await fetch(
        `${API_BASE_URL}/requisitions/${id}/approval`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ approval_status: status })
        }
      );
      if (response.ok) {
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

  const updateAssignments = async (recruiterId: number) => {
    if (!id) return;
    try {
      const updateData = { recruiter_id: recruiterId };

      const response = await fetch(
        `${API_BASE_URL}/requisitions/${id}/assignTeam`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(updateData)
        }
      );

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

  const formatNumber = (value: number) =>
    new Intl.NumberFormat("en-US").format(value || 0);

  return (
    <>
      <div className="min-h-screen ml-2 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-4 flex md:flex-row justify-between items-start md:items-center">
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <div className="flex gap-4 items-center mb-2">
                  <Link to="/requisitions">
                    <h1 className="text-blue-300 text-3xl font-bold pl-0 hover:text-blue-900">
                      Requisitions |
                    </h1>
                  </Link>
                  <h1 className="text-blue-900 text-3xl font-bold">
                    {requisition.position &&
                      requisition.position.charAt(0).toUpperCase() +
                        requisition.position.slice(1)}
                  </h1>
                </div>
                <p className="text-sm text-slate-500 flex ">
                  <FileText className="w-4 h-4 mr-2" />
                  Requisition ID:
                  <span className="font-medium text-slate-700 ml-2">
                    {requisition.req_id}
                  </span>
                </p>
                {user?.company?.name?.trim().toLowerCase() === 'acme global hub pvt ltd' && <p className="text-sm text-slate-500 flex mt-2 ">
                  <Building2 className="w-5 h-5 mr-1 " />
                  Company: 
                  <span className="font-medium text-slate-700 ml-2">
                    {requisition.company?.name}
                  </span>
                </p>}
              </div>
              <div className="flex gap-2 mt-4 md:mt-0">
                <Badge
                  style={{ height: 25 }}
                  className={getPriorityClass(requisition.priority)}
                >
                  {requisition.priority}
                </Badge>
                <Badge
                  style={{ height: 25 }}
                  className={getStatusClass(requisition.status)}
                >
                  {requisition.status}
                </Badge>
              </div>
            </div>

            {(user?.role === "hiring_manager" || user?.role === "admin") &&(user.company?.name?.trim().toLowerCase() === "acme global hub pvt ltd")&& (
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
                  <Button
                    variant="outline"
                    className={
                      requisition.approval_status === "approved"
                        ? "bg-green-500 h-9 px-4 py-2 has-[>svg]:px-3"
                        : "bg-red-200 text-black"
                    }
                  >
                    {Capitalize(requisition.approval_status)}
                  </Button>
                )}

              {requisition.approval_status ==='pending' && <Dialog open={openEditForm} onOpenChange={setEditForm}>
                  <DialogTrigger asChild>
                    <Button>✏️ Edit</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Edit Requisition</DialogTitle>
                      <DialogDescription>
                        Update requisition details below.
                      </DialogDescription>
                    </DialogHeader>

                    <RequisitionForm
                      initialData={requisition}
                      onSubmit={updateRequisition}
                      onCancel={() => setEditForm(false)}
                    />
                  </DialogContent>
                </Dialog>}
              </div>
            )}
          </header>

          <hr
            style={{ width: "100%" }}
            className="bg-gray-200 mb-4"
          ></hr>

          {/* Metrics */}
          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Key Metrics</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Openings",
                  value: requisition?.positions_count,
                  icon: Target,
                  borderColor: "border-violet-200"
                },
                {
                  label: "Filled",
                  value: filledCount(),
                  icon: CheckCircle2,
                  borderColor: "border-emerald-200"
                },
                {
                  label: "Days Open",
                  value: daysOpen(requisition?.created_date),
                  icon: Clock,
                  borderColor: "border-amber-200"
                },
                {
                  label: "Applicants",
                  value: candidateCount,
                  icon: Users,
                  borderColor: "border-blue-200",
                  clickable: true
                }
              ].map((metric) => {
                const Icon = metric.icon;
                return (
                  <Card
                    key={metric.label}
                    onClick={() =>
                      metric.clickable &&
                      setShowApplicants((prev) => !prev)
                    }
                    className={`border ${metric.borderColor} shadow-sm transition-shadow ${
                      metric.clickable
                        ? "cursor-pointer hover:shadow-md"
                        : ""
                    }`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-slate-600">
                          {metric.label}
                        </p>
                        <Icon className="w-5 h-5 text-slate-600" />
                      </div>
                      <p className="text-slate-900 text-2xl font-semibold">
                        {formatNumber(metric.value as number)}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {showApplicants && (
              <div className="mt-4 bg-white absolute right-10 border border-blue-100 rounded-lg max-h-100 overflow-auto shadow-sm p-5 transition-all duration-300 ease-in-out">
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-blue-900">
                  <Users className="w-5 h-5" /> Applicants List
                </h3>

                {requisition?.candidates?.length ? (
                  <ul className="divide-y divide-gray-200">
                    {requisition.candidates.map((cand: any) => {
                      const userEmail = user?.email || "";
                      const isAcmeUser =
                        userEmail.endsWith("@acmeglobal.tech");

                      const maskedEmail = cand.email
                        ? isAcmeUser
                          ? cand.email
                          : cand.email.replace(
                              /(?<=.).(?=[^@]*?@)/g,
                              "*"
                            )
                        : "N/A";

                      return (
                        <li
                          key={cand.id}
                          className="py-3 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              <Avatar className="w-10 h-10">
                                {cand.profile_image ? (
                                  <AvatarImage
                                    src={cand.profile_image}
                                    alt={cand.name}
                                  />
                                ) : (
                                  <AvatarFallback>
                                    {cand.name
                                      ?.split(" ")
                                      .map((n: string) => n[0])
                                      .join("")
                                      .toUpperCase()}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                            </div>

                            <div>
                              <p className="font-medium text-slate-900">
                                {cand.name}
                              </p>
                              <div className="text-xs text-slate-600 mt-1">
                                <p>
                                  {cand.position || "Role N/A"}{" "}
                                  {cand.current_company && (
                                    <span className="text-slate-400">
                                      {" "}
                                      @ {cand.current_company}
                                    </span>
                                  )}
                                </p>
                                {cand.experience && (
                                  <p>{cand.experience} years experience</p>
                                )}
                              </div>
                            </div>
                          </div>

                          <Badge
                            className={
                              cand.status?.toLowerCase() === "selected"
                                ? "bg-green-100 text-green-700"
                                : cand.status?.toLowerCase() ===
                                  "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }
                          >
                            {Capitalize(cand.status || "N/A")}
                          </Badge>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    No applicants found.
                  </p>
                )}
              </div>
            )}
          </section>

          {/* Details */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Job Information */}
            <Card className="bg-white border border-blue-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <Briefcase className="w-5 h-5" />
                  Job Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <dl className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-indigo-500 mt-0.5" />
                    <div>
                      <dt className="text-sm text-slate-500 mb-1">
                        Department
                      </dt>
                      <dd className="text-slate-900">
                        {requisition.department?.name ?? "-"}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-rose-500 mt-0.5" />
                    <div>
                      <dt className="text-sm text-slate-500 mb-1">
                        Location
                      </dt>
                      <dd className="text-slate-900">
                        {requisition.location?.name ?? "-"}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <dt className="text-sm text-slate-500 mb-1">
                        Employment Type
                      </dt>
                      <dd className="text-slate-900">
                        {Capitalize(requisition.employment_type)}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Home className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <dt className="text-sm text-slate-500 mb-1">
                        Work Mode
                      </dt>
                      <dd className="text-slate-900">
                        {Capitalize(requisition.work_mode)}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <GraduationCap className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <dt className="text-sm text-slate-500 mb-1">
                        Grade
                      </dt>
                      <dd className="text-slate-900">
                        {requisition.grade ?? "-"}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 col-span-2">
                    <DollarSign className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <div>
                      <dt className="text-sm text-slate-500 mb-1">
                        Salary Range
                      </dt>
                      <dd className="text-slate-900">
                        {formatCurrency(
                          requisition.min_salary ?? 0,
                          requisition.currency || "AED"
                        )}{" "}
                        -{" "}
                        {formatCurrency(
                          requisition.max_salary ?? 0,
                          requisition.currency || "AED"
                        )}
                      </dd>
                    </div>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Hiring Team */}
            <Card className="bg-white border border-purple-100 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50  border-b border-purple-100">
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <Users className="w-5 h-5" />
                  Hiring Team
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <dl className="grid grid-cols-2 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-5 h-5 text-indigo-500 mt-2" />
                      <dt className="font-medium">Hiring Manager</dt>
                    </div>
                    {user?.role === "admin" ? (
                      <Select
                        value={selectedHM}
                        onValueChange={(value: string) =>
                          setSelectedHM(value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select hiring manager" />
                        </SelectTrigger>
                        <SelectContent>
                          {hiringManagers.map((hm) => (
                            <SelectItem
                              key={hm.id}
                              value={hm.id.toString()}
                            >
                              {hm.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="text-gray-600 text-center w-40">
                        {Capitalize(requisition.hiring_manager)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <UserPlus className="w-5 h-5 text-purple-500 mt-2" />
                      <dt className="font-medium">Recruiter</dt>
                    </div>
                    {user &&
                    (user.role === "admin" ||
                      user.role === "hiring_manager") ? (
                      <Select
                        value={
                          selectedRecruiter ||
                          (requisition.recruiter_id
                            ? requisition.recruiter_id.toString()
                            : "")
                        }
                        onValueChange={(value: string) => {
                          setSelectedRecruiter(value);
                          updateAssignments(Number(value));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select recruiter" />
                        </SelectTrigger>
                        <SelectContent>
                          {recruitersTeam.map((rec) => (
                            <SelectItem
                              key={rec.id}
                              value={rec.id.toString()}
                            >
                              {rec.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <dd className="text-gray-600">
                        {requisition.recruiter?.name
                          ? Capitalize(requisition.recruiter.name)
                          : ""}
                      </dd>
                    )}
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Timeline & Status */}
            <Card className="bg-white border border-emerald-100 shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-emerald-100">
                <CardTitle className="flex items-center gap-2 text-emerald-900">
                  <Clock className="w-5 h-5" />
                  Timeline & Status
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <dt className="text-sm text-slate-500 mb-1">
                        Date Created
                      </dt>
                      <dd className="text-slate-900">
                        {formatDate(requisition.created_date)}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-purple-500 mt-0.5" />
                    <div>
                      <dt className="text-sm text-slate-500 mb-1">
                        Target Start Date
                      </dt>
                      <dd className="text-slate-900">
                        {formatDate(requisition.target_startdate)}
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <div>
                      <dt className="text-sm text-slate-500 mb-1">
                        Approval Status
                      </dt>
                      <dd className="text-slate-900">
                        <Badge
                          className={
                            requisition.approval_status === "approved"
                              ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200"
                              : requisition.approval_status ===
                                "rejected"
                              ? "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-red-200"
                              : "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200"
                          }
                        >
                          {capitalize(requisition.approval_status)}
                        </Badge>
                      </dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-orange-500 mt-0.5" />
                    <div>
                      <dt className="text-sm text-slate-500 mb-1">
                        SLA
                      </dt>
                      <dd className="text-slate-900">
                        {requisition.sla ?? "-"}{" "}
                        {requisition.sla ? "days" : ""}
                      </dd>
                    </div>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Job Description & Skills */}
            <Card className="bg-white border border-amber-100 shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100">
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <FileText className="w-5 h-5" />
                  Job Description
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <dt className="text-sm text-slate-500 mb-2 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-indigo-500" />
                      Skills Required
                    </dt>
                    <dd className="text-slate-900 bg-indigo-50 px-4 py-3 rounded-lg border border-indigo-100">
                      {requisition.skills && requisition.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {requisition.skills.map((skill) => (
                            <span
                              key={skill.id}
                              className="inline-flex items-center rounded-full bg-white border border-indigo-200 px-3 py-1 text-xs font-medium text-indigo-700 shadow-sm"
                            >
                              {skill.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 text-sm">
                          No skills specified.
                        </span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm text-slate-500 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      Description
                    </dt>
                    <dd className="text-slate-900 bg-blue-50 px-4 py-3 rounded-lg border border-blue-100">
                      {requisition.job_description || "-"}
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Activity Logs */}
            <Card className="bg-white border border-indigo-100 shadow-sm hover:shadow-md transition-shadow lg:col-span-2">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100">
                <CardTitle className="flex items-center gap-2 text-indigo-900">
                  <Activity className="w-5 h-5" />
                  Activity Logs
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {logs.length === 0 ? (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">
                      No activities yet.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {logs.map((log, index) => (
                      <li
                        key={log.id}
                        className={`p-4 rounded-lg border ${
                          index % 2 === 0
                            ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100"
                            : "bg-gradient-to-r from-purple-50 to-pink-50 border-purple-100"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-slate-900 flex items-center gap-2">
                            <User className="w-4 h-4 text-indigo-500" />
                            {log.username}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(
                              log.timestamp
                            ).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 ml-6">
                          {log.action}
                        </p>
                        {log.details && (
                          <p className="text-xs text-slate-600 italic ml-6 mt-1 bg-white/50 px-2 py-1 rounded">
                            {log.details}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </>
  );
}
