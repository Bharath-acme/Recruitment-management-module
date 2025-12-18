import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from "../ui/dialog";
import InvoiceUploadForm from "./InvoiceForm2";
import { fetchInvoices } from "./api";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "../ui/table";
import { SideDrawer,FullscreenModal } from "./InvoiceDialog";
import { X, Download, FileCheck } from "lucide-react";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const Modal = ({ isOpen, onClose, title, children, downloadUrl, clientName }: any) => {
  if (!isOpen) return null;

  const handleDownload = () => {
    if (!downloadUrl) return;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', (clientName || 'invoice') + '.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200 ring-1 ring-white/20">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="overflow-y-auto p-0 bg-gray-50 flex-1">
          {children}
        </div>
        <div className="p-6 border-t border-gray-100 bg-white rounded-b-2xl flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button variant="primary" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  uom: string;
  taxable_value: number;
  gst: number;
}

export interface Invoice {
  id: number;
  client_address: string;
  place_of_supply: string;
  payment_terms: string;
  service_description: string;
  item_description: string;
  items: InvoiceItem[];
  total_amount: number;
  pdf_url: string;
  created_at: string;
  invoice_number:string;
  company: {
      id: number;
      name: string;
  }
}

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [open, setOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const loadInvoices = async () => {
    try {
      const data = await fetchInvoices(`${API_BASE_URL}/invoices/upload`);
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load invoices", err);
    }
  };

  const handlePreview = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPreviewOpen(true);
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  return (
    <div className="p-6">
      {/* Top Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoice Management</h1>
        
        <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                 
                  Upload Invoice
                </Button>
              </DialogTrigger>

              <DialogContent className="w-full max-w-[95vw] lg:max-w-[85vw] xl:max-w-7xl h-[90vh] overflow-y-auto flex flex-col">
                <InvoiceUploadForm
                  onSuccess={() => {
                    setOpen(false);
                    loadInvoices();
                  }}
                />
              </DialogContent>
            </Dialog>
      </div>

       <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full border-separate border-spacing-y-3">
              <TableHeader className="w-[90vw] bg-blue-100 rounded-lg shadow-sm ">
                <TableRow className="w-[90vw] bg-blue-100 rounded-lg shadow-sm ">
                  {/* <TableHead className="border-l rounded-l-lg">Invoice ID</TableHead>
                  <TableHead>Amount</TableHead> */}
                  <TableHead>Client</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="rounded-r-lg">Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-6 text-center text-gray-500">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((inv) => (
                    <TableRow
                      key={inv.id}
                      className="border border-gray-200 rounded-lg shadow-sm transition-all duration-200 hover:shadow-lg hover:bg-blue-50 hover:-translate-y-[2px]"
                    >
                      {/* <TableCell className="border-l-[5px] border-blue-700 pl-4 rounded-l-lg">
                        {inv.invoice_number}
                      </TableCell>

                      <TableCell className="font-medium">
                        ₹ {inv.total_amount}
                      </TableCell> */}
                      <TableCell className="text-sm">
                         {inv.company?.name}
                      </TableCell>

                      <TableCell className="text-sm">
                        {new Date(inv.created_at).toLocaleString()}
                      </TableCell>

                      <TableCell className="rounded-r-lg">
                        <Button onClick={() => handlePreview(inv)}>Preview</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <Modal 
        isOpen={previewOpen} 
        onClose={() => setPreviewOpen(false)}
        title={selectedInvoice ? `Invoice - ${selectedInvoice.invoice_number}` : 'Invoice Preview'}
        downloadUrl={selectedInvoice?.pdf_url}
        clientName={selectedInvoice?.company?.name}
      >
        <iframe
            src={selectedInvoice?.pdf_url ? `${API_BASE_URL}/${selectedInvoice.pdf_url}` : '/placeholder-invoice.pdf'}
            title="Invoice Preview"
            className="w-full h-[90vh]"
        />
      </Modal>
    </div>
  );
}
