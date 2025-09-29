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
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface OfferManagerProps {
  selectedCompany: string;
  selectedCountry: string;
}

interface Offer {
  id: string;
  candidateName: string;
  candidateEmail: string;
  position: string;
  requisitionId: string;
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
}

export function OfferManager({ selectedCompany, selectedCountry }: OfferManagerProps) {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);    
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const [newOffer, setNewOffer] = useState({
    candidateName: '',
    candidateEmail: '',
    position: '',
    requisitionId: '',
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

  useEffect(() => {
    loadDemoData();
  }, [selectedCompany, selectedCountry, statusFilter]);

 
  //   setLoading(true);
  //   try {
  //     const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-66aec17b/offers?status=${statusFilter}`, {
  //       headers: {
  //         'Authorization': `Bearer ${publicAnonKey}`,
  //         'Content-Type': 'application/json'
  //       }
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       setOffers(data.offers || []);
  //     } else {
  //       loadDemoData();
  //     }
  //   } catch (error) {
  //     console.error('Offers load error:', error);
  //     loadDemoData();
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const loadDemoData = () => {
    setOffers([
      {
        id: 'OFF-001',
        candidateName: 'Ahmed Al-Rashid',
        candidateEmail: 'ahmed.rashid@email.com',
        position: 'Senior Software Engineer',
        requisitionId: 'REQ-2025-001',
        baseSalary: 18000,
        currency: 'AED',
        allowances: {
          housing: 5000,
          transport: 1500,
          mobile: 500,
          tickets: 10000
        },
        benefits: ['Medical Insurance', 'Life Insurance', 'Annual Leave 30 days'],
        variablePay: 15000,
        totalCompensation: 50000,
        status: 'Pending Response',
        approvalStatus: 'Approved',
        expiryDate: '2025-09-06',
        sentDate: '2025-08-30',
        createdBy: 'Sarah Johnson',
        createdDate: '2025-08-29',
        approvers: ['HR Manager', 'Finance Controller']
      },
      {
        id: 'OFF-002',
        candidateName: 'Fatima Al-Zahra',
        candidateEmail: 'fatima.zahra@email.com',
        position: 'Product Manager',
        requisitionId: 'REQ-2025-002',
        baseSalary: 22000,
        currency: 'SAR',
        allowances: {
          housing: 6000,
          transport: 2000,
          mobile: 500,
          tickets: 12000
        },
        benefits: ['Medical Insurance', 'Life Insurance', 'Annual Leave 30 days', 'Education Allowance'],
        variablePay: 20000,
        totalCompensation: 62500,
        status: 'Accepted',
        approvalStatus: 'Approved',
        expiryDate: '2025-09-10',
        sentDate: '2025-08-28',
        responseDate: '2025-08-30',
        createdBy: 'Mike Chen',
        createdDate: '2025-08-27',
        approvers: ['HR Manager', 'Finance Controller', 'Department Head']
      }
    ]);
  };

 
  const resetForm = () => {
    setNewOffer({
      candidateName: '',
      candidateEmail: '',
      position: '',
      requisitionId: '',
      baseSalary: '',
      currency: 'AED',
      housingAllowance: '',
      transportAllowance: '',
      mobileAllowance: '',
      ticketsAllowance: '',
      benefits: [],
      variablePay: '',
      expiryDays: 7
    });
  };

  const filteredOffers = offers.filter(offer =>
    offer.candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.requisitionId.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="candidateName">Candidate Name</Label>
                  <Input
                    id="candidateName"
                    value={newOffer.candidateName}
                    onChange={(e) => setNewOffer({...newOffer, candidateName: e.target.value})}
                    placeholder="Ahmed Al-Rashid"
                  />
                </div>
                <div>
                  <Label htmlFor="candidateEmail">Candidate Email</Label>
                  <Input
                    id="candidateEmail"
                    type="email"
                    value={newOffer.candidateEmail}
                    onChange={(e) => setNewOffer({...newOffer, candidateEmail: e.target.value})}
                    placeholder="ahmed@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={newOffer.position}
                    onChange={(e) => setNewOffer({...newOffer, position: e.target.value})}
                    placeholder="Senior Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="requisitionId">Requisition ID</Label>
                  <Input
                    id="requisitionId"
                    value={newOffer.requisitionId}
                    onChange={(e) => setNewOffer({...newOffer, requisitionId: e.target.value})}
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

                <h4 className="font-medium mb-2">Allowances (Monthly)</h4>
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
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
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
                </div>

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
                // onClick={handleCreateOffer}
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

      <Card>
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
                        <div className="text-sm text-gray-500">{offer.requisitionId}</div>
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
      </Card>
    </div>
  );
}