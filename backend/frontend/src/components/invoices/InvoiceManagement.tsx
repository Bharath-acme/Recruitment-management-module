import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from "../ui/dialog";
import InvoiceForm from "./InvoiceForm";
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
}

export default function InvoiceManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [open, setOpen] = useState(false);

  const loadInvoices = async () => {
    try {
      const data = await fetchInvoices();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load invoices", err);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  return (
    <div className="p-6">
      {/* Top Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Invoice Management</h1>
        
        {/* <Button onClick={() => setOpen(true)}>
                 
                  Raise Invoice
                </Button>

       <SideDrawer open={open} onClose={() => setOpen(false)}>
        <InvoiceForm
          onSuccess={() => {
            setOpen(false);
            loadInvoices();
          }}
        />
      </SideDrawer> */}

        {/* <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                 
                  Raise Invoice
                </Button>
              </DialogTrigger>

              <DialogContent className="w-full max-w-[95vw] lg:max-w-[85vw] xl:max-w-7xl h-[90vh] overflow-y-auto flex flex-col">
                <InvoiceForm
                  onSuccess={() => {
                    setOpen(false);
                    loadInvoices();
                    
                  }}
                />
              </DialogContent>
            </Dialog> */}
      </div>

      {/* Responsive Table */}
       <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table className="w-full border-separate border-spacing-y-3">
              {/* Header */}
              <TableHeader className="bg-blue-100 rounded-lg shadow-sm">
                <TableRow>
                  <TableHead className="border-l rounded-l-lg">Invoice ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="rounded-r-lg">Action</TableHead>
                </TableRow>
              </TableHeader>

              {/* Body */}
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-6 text-center text-gray-500">
                      No invoices found
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((inv) => (
                    <TableRow
                      key={inv.id}
                      className="border border-gray-200 rounded-lg shadow-sm transition-all duration-200 hover:shadow-lg hover:bg-blue-50 hover:-translate-y-[2px]"
                    >
                      <TableCell className="border-l-[5px] border-blue-700 pl-4 rounded-l-lg">
                        {inv.invoice_number}
                      </TableCell>

                      <TableCell className="font-medium">
                        ₹ {inv.total_amount}
                      </TableCell>
                      <TableCell className="text-sm">
                         {inv.client_address && inv.client_address.length > 40 
                          ? inv.client_address.slice(0, 40) + "..." 
                          : inv.client_address}

                      </TableCell>

                      <TableCell className="text-sm">
                        {new Date(inv.created_at).toLocaleString()}
                      </TableCell>

                      <TableCell className="rounded-r-lg">
                        <Link
                          to={`/invoices/${inv.id}`}
                          className="text-blue-600 underline"
                        >
                          View Details
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile View – Card List */}
      {/* <div className="space-y-4 md:hidden">
        {invoices.map((inv) => (
          <div
            key={inv.id}
            className="border p-4 rounded-lg shadow-sm bg-white"
          >
            <div className="font-semibold">
              Invoice #{inv.id}
            </div>

            <div className="text-sm text-gray-600 mt-1">
              Amount: ₹ {inv.total_amount}
            </div>

            <div className="text-sm text-gray-500">
              {new Date(inv.created_at).toLocaleString()}
            </div>

            <Link
              to={`/invoices/${inv.id}`}
              className="text-blue-600 underline text-sm mt-2 block"
            >
              View Details
            </Link>
          </div>
        ))}

        {invoices.length === 0 && (
          <p className="text-center text-gray-500">
            No invoices found.
          </p>
        )}
      </div> */}
    </div>
  );
}
