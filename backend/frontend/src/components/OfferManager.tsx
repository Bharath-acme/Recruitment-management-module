import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { 
  Plus, 
  Search, 
  HandHeart, 
  Eye,
  Edit,
  Download,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  DollarSign,
  Calendar1Icon,
  CalendarIcon
} from 'lucide-react';
import { toast } from 'sonner';
import OfferForm from './OfferLetterForm';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Allowance {
  name: string;
  value: number;
}

interface OfferManagerProps {
  selectedCompany: string;
  selectedCountry: string;
}

interface Offer {
  id: string;
  offer_id:string;
  candidateName: string;
  candidateEmail: string;
  position: string;
  requisition_id: string;
  baseSalary: number;
  currency: string;
  allowances: {
    housing: number;
    transport: number;
    mobile: number;
    tickets: number;
  };
  benefits: string[];
  variablePay?: number;
  totalCompensation: number;
  status: string;
  approvalStatus: string;
  expiryDate: string;
  sentDate?: string;
  responseDate?: string;
  createdBy: string;
  createdDate: string;
  approvers: string[];
  base:string;
}

export function OfferManager({ selectedCompany, selectedCountry }: OfferManagerProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);    
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [allowances, setAllowances] = useState<Allowance[]>([
      { name: "Housing", value: 0 },
      { name: "Transport", value: 0 },
    ]);

  const [candidates, setCandidates] = useState<
    { id:string, email: string; name: string; position: string; requisition_id: string }[]
  >([]);

  const [newOffer, setNewOffer] = useState({
    candidateName: '',
    candidateEmail: '',
    candidate_id:'',
    position: '',
    requisition_id: '',
    baseSalary: '',
    currency: 'AED',
    housingAllowance: '',
    transportAllowance: '',
    mobileAllowance: '',
    ticketsAllowance: '',
    benefits: [] as string[],
    variablePay: '',
    expiryDays: 7
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch(`${API_BASE_URL}/candidates`)
    fetch("http://localhost:8000/candidates", {
      headers: { 'Content-Type': 'application/json',
        authorization: `Bearer ${token}`
       }
    })
    .then((res) => res.json())
    .then((data) => setCandidates(data));

    getOffers()
    
  }, [selectedCompany, selectedCountry, statusFilter]);


  const getOffers = async ()=>{
    try{
      const response = await fetch(`${API_BASE_URL}/offers`,
      { headers:{'Content-Type':'application/json',
         Authorization: `Bearer ${token}`
      }
    })
    if (response.ok) {
      const data =  await response.json()
      setOffers(data)
    }
    }
    catch (error){
       console.log('offers are not loading')

    }
  }

  const handleCreateOffer = async () => {
  try {
    const allowancesObject: Record<string, number> = {};
    allowances.forEach(a => {
      if (a.name && a.value !== undefined) {
        allowancesObject[a.name.toLowerCase()] = a.value;
      }
    });

    const payload = {
      app_id: newOffer.requisition_id || '', // adjust if your backend expects int
      candidate_id: newOffer.candidate_id || '',        // update once you have real candidate_id
      grade: newOffer.position || "N/A",               // replace with actual grade if available
      base: parseFloat(newOffer.baseSalary) || 0,
      allowances: allowancesObject,
      benefits: {},                                   // update if you have benefits
      variable_pay: parseFloat(newOffer.variablePay) || 0,
      currency: newOffer.currency,
      expiry_days: newOffer.expiryDays,
      country: selectedCountry || "IN"
    };

    const response = await fetch(`${API_BASE_URL}/offers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json();
      console.error("Offer creation failed:", errData);
      toast.error(`Offer creation failed: ${errData.detail || "Unknown error"}`);
      return;
    }

    const data = await response.json();
    toast.success("Offer created successfully!");

    // close modal and refresh offers
    setShowCreateDialog(false);
    resetForm();
    getOffers();

  } catch (error) {
    console.error("Error creating offer:", error);
    toast.error("Something went wrong while creating offer");
  }
};

 

 
  const resetForm = () => {
    setNewOffer({
    candidateName: '',
    candidateEmail: '',
    candidate_id:'',
    position: '',
    requisition_id: '',
    baseSalary: '',
    currency: 'AED',
    housingAllowance: '',
    transportAllowance: '',
    mobileAllowance: '',
    ticketsAllowance: '',
    benefits: [] as string[],
    variablePay: '',
    expiryDays: 7
  });
  };

  // const filteredOffers = offers.filter(offer =>
  //   offer.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   offer.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   offer.requisition_id.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending approval': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'sent': return 'bg-purple-100 text-purple-800';
      case 'pending response': return 'bg-orange-100 text-orange-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'text-yellow-600';
      case 'approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString()} ${currency}`;
  };

  const isExpiringSoon = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 3 && daysUntilExpiry > 0;
  };


  const addAllowance = () =>
    setAllowances([...allowances, { name: "", value: 0 }]);

  const removeAllowance = (index: number) => {
    setAllowances(allowances.filter((_, i) => i !== index));
  };

  const updateAllowance = (index: number, key: keyof Allowance, value: any) => {
    const updated = [...allowances];
    if (key === "name") {
      updated[index].name = value as string;
    } else if (key === "value") {
      updated[index].value = Number(value);
    }
    setAllowances(updated);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Offer Management</h1>
          <p className="text-gray-600">Create and manage job offers</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Offer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Offer</DialogTitle>
              <DialogDescription>
                Create a comprehensive job offer including compensation package and benefits.
              </DialogDescription>
            </DialogHeader>
            {/* <OfferForm/> */}
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                             
                             <div>
                             <Label htmlFor="candidateEmail">Candidate Email</Label>
                             <Select 
                               value={newOffer.candidateEmail || ''} 
                               onValueChange={(value: any) => {
                                 setNewOffer({ ...newOffer, candidateEmail: value });
                                 const selectedCandidate = candidates.find(c => c.email === value);
                                 if (selectedCandidate) {
                                   setNewOffer({
                                     ...newOffer,
                                     candidateEmail: value,
                                     candidate_id: selectedCandidate.id,
                                     candidateName: selectedCandidate.name,
                                     position: selectedCandidate.position,
                                     requisition_id: selectedCandidate.requisition_id
                                   });
                                 }
                               }}
                             >
                               <SelectTrigger>
                                 <SelectValue placeholder="Select candidate email" />
                               </SelectTrigger>
                               <SelectContent>
                                 {candidates.map((c) => (
                                   <SelectItem key={c.email} value={c.email}>
                                     {c.email}
                                   </SelectItem>
                                 ))}
                               </SelectContent>
                             </Select>
                           </div>
                           <div>
                               <Label htmlFor="candidateName">Candidate Name</Label>
                               <Input
                                 id="candidateName"
                                 value={newOffer.candidateName || ''}
                                 onChange={(e) => setNewOffer({...newOffer, candidateName: e.target.value})}
                                 placeholder="Ahmed Al-Rashid"
                               />
                             </div>
                           </div>

             <div className="grid grid-cols-2 gap-4">
                           <div>
                             <Label htmlFor="position">Position</Label>
                             <Input
                               id="position"
                               value={newOffer.position || ''}
                               onChange={(e) => setNewOffer({...newOffer, position: e.target.value})}
                               placeholder="Senior Software Engineer"
                             />
                           </div>
                           <div>
                             <Label htmlFor="requisitionId">Requisition ID</Label>
                             <Input
                               id="requisitionId"
                               value={newOffer.requisition_id ||''}
                               onChange={(e) => setNewOffer({...newOffer, requisition_id: e.target.value})}
                               placeholder="REQ-2025-001"
                             />
                           </div>
                         </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Compensation Package</h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="baseSalary">Base Salary (Monthly)</Label>
                    <Input
                      id="baseSalary"
                      type="number"
                      value={newOffer.baseSalary}
                      onChange={(e) => setNewOffer({...newOffer, baseSalary: e.target.value})}
                      placeholder="15000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={newOffer.currency} onValueChange={(value) => setNewOffer({...newOffer, currency: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AED">AED</SelectItem>
                        <SelectItem value="SAR">SAR</SelectItem>
                        <SelectItem value="QAR">QAR</SelectItem>
                        <SelectItem value="KWD">KWD</SelectItem>
                        <SelectItem value="BHD">BHD</SelectItem>
                        <SelectItem value="OMR">OMR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* <h4 className="font-medium mb-2">Allowances (Monthly)</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="housingAllowance">Housing Allowance</Label>
                    <Input
                      id="housingAllowance"
                      type="number"
                      value={newOffer.housingAllowance}
                      onChange={(e) => setNewOffer({...newOffer, housingAllowance: e.target.value})}
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="transportAllowance">Transport Allowance</Label>
                    <Input
                      id="transportAllowance"
                      type="number"
                      value={newOffer.transportAllowance}
                      onChange={(e) => setNewOffer({...newOffer, transportAllowance: e.target.value})}
                      placeholder="1500"
                    />
                  </div>
                </div> */}

                <div>
                            <Label className="text-lg">Allowances</Label>
                            {allowances.map((allowance, index) => (
                              <div key={index} className="flex gap-2 items-center mt-2">
                                <Input
                                  placeholder="Name"
                                  value={allowance.name}
                                  onChange={(e) =>
                                    updateAllowance(index, "name", e.target.value)
                                  }
                                />
                                <Input
                                  type="number"
                                  placeholder="Value"
                                  value={allowance.value}
                                  onChange={(e) =>
                                    updateAllowance(index, "value", Number(e.target.value))
                                  }
                                />
                                {/* <Button
                                  type="button"
                                  variant="destructive"
                                  onClick={() => removeAllowance(index)}
                                >
                                  Remove
                                </Button> */}
                                 <XCircle onClick={() => removeAllowance(index)}  className="h-10 w-10 mr-1 cursor-pointer" />
                              </div>
                            ))}
                           
                            <Button type="button" onClick={addAllowance} className="mt-2 mb-3">
                              Add Allowance
                            </Button>
                          </div>

                {/* <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="mobileAllowance">Mobile Allowance</Label>
                    <Input
                      id="mobileAllowance"
                      type="number"
                      value={newOffer.mobileAllowance}
                      onChange={(e) => setNewOffer({...newOffer, mobileAllowance: e.target.value})}
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ticketsAllowance">Annual Tickets Allowance</Label>
                    <Input
                      id="ticketsAllowance"
                      type="number"
                      value={newOffer.ticketsAllowance}
                      onChange={(e) => setNewOffer({...newOffer, ticketsAllowance: e.target.value})}
                      placeholder="10000"
                    />
                  </div>
                </div> */}

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="variablePay">Annual Variable Pay</Label>
                    <Input
                      id="variablePay"
                      type="number"
                      value={newOffer.variablePay}
                      onChange={(e) => setNewOffer({...newOffer, variablePay: e.target.value})}
                      placeholder="15000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiryDays">Offer Validity (Days)</Label>
                    <Input
                      id="expiryDays"
                      type="number"
                      value={newOffer.expiryDays}
                      onChange={(e) => setNewOffer({...newOffer, expiryDays: parseInt(e.target.value) || 7})}
                      min="1"
                      max="30"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button 
                onClick={handleCreateOffer}
                >
                  Create Offer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search offers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="pending">Pending Approval</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidate & Position</TableHead>
                <TableHead>Compensation</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                    <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                  </TableRow>
                ))
              ) : (
                filteredOffers.map((offer) => (
                  <TableRow key={offer.id} className={isExpiringSoon(offer.expiryDate) ? 'bg-orange-50' : ''}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{offer.candidateName}</div>
                        <div className="text-sm text-gray-500">{offer.position}</div>
                        <div className="text-sm text-gray-500">{offer.requisition_id}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />
                          {formatCurrency(offer.totalCompensation, offer.currency)}/mo
                        </div>
                        <div className="text-sm text-gray-500">
                          Base: {formatCurrency(offer.baseSalary, offer.currency)}
                        </div>
                        {offer.variablePay && (
                          <div className="text-sm text-gray-500">
                            Variable: {formatCurrency(offer.variablePay, offer.currency)}/yr
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(offer.status)}>{offer.status}</Badge>
                      {isExpiringSoon(offer.expiryDate) && (
                        <div className="text-xs text-orange-600 mt-1">Expiring soon!</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div>Created: {new Date(offer.createdDate).toLocaleDateString()}</div>
                        {offer.sentDate && (
                          <div>Sent: {new Date(offer.sentDate).toLocaleDateString()}</div>
                        )}
                        <div className="text-red-600">
                          Expires: {new Date(offer.expiryDate).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`flex items-center ${getApprovalStatusColor(offer.approvalStatus)}`}>
                        {offer.approvalStatus === 'Approved' && <CheckCircle2 className="h-4 w-4 mr-1" />}
                        {offer.approvalStatus === 'Pending' && <Clock className="h-4 w-4 mr-1" />}
                        {offer.approvalStatus === 'Rejected' && <XCircle className="h-4 w-4 mr-1" />}
                        <span className="text-sm">{offer.approvalStatus}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {offer.status === 'Draft' && (
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {offer.approvalStatus === 'Approved' && offer.status !== 'Sent' && (
                          <Button size="sm" variant="outline">
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card> */}

       <Card className="mt-6 shadow-md border border-gray-200">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="w-full border-separate border-spacing-y-3">
            <TableHeader className="border bg-blue-100 rounded-lg shadow-sm">
              <TableRow>
                <TableHead className="first:pl-4">Candidate ID</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Base Salary</TableHead>
                <TableHead>Allowances</TableHead>
                <TableHead>Benefits</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead className="rounded-r-lg">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    {Array(8)
                      .fill(0)
                      .map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                        </TableCell>
                      ))}
                  </TableRow>
                ))
              ) : (
                offers.map((offer) => (
                  <TableRow
                    key={offer.offer_id}
                    // onClick={() => navigate(`/offers/${offer.offer_id}`)}
                    className="border border-gray-200 rounded-lg shadow-sm transition-all duration-200 ease-in-out hover:shadow-lg hover:bg-blue-50 hover:-translate-y-[2px] cursor-pointer"
                  >
                    <TableCell className="border-l-[5px] border-blue-800 pl-4 rounded-l-lg">
                      <div>
                        <div className="font-medium"></div>
                        <div className="text-sm text-gray-500">App ID: </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="font-medium"></div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-1 text-gray-700">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span>
                         {offer.base} {offer.currency}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm text-gray-600">
                        Housing: {offer.allowances?.housing || 0} <br />
                        Transport: {offer.allowances?.transport || 0}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm text-gray-600">
                        Medical:  <br />
                        Tickets: 
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge >{offer.status}</Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col text-sm text-gray-600">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {/* {formatDate(offer.expiry_date)} */}
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={(e) => {
                          e.stopPropagation();
                          // navigate(`/offers/${offer.offer_id}`);
                        }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}