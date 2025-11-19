import React, { useEffect, useState } from "react";
import { fetchInvoiceById } from "./api";
import { useParams } from "react-router-dom";


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
  to_address: string;
  place_of_supply: string;
  payment_terms: string;
  service_description: string;
  item_description: string;
  items: InvoiceItem[];
  total_amount: number;
  pdf_url: string;
  created_at: string;
}

export default function InvoiceDetails() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvoiceById(id)
      .then((data) => setInvoice(data))
      .catch((err) => setError("Failed to load invoice"));
  }, [id]);

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!invoice) return <div className="p-6">Loading...</div>;

  // Build full PDF URL (very important!)
  const API = import.meta.env.VITE_API_BASE_URL;
  const pdfUrl = `${API}${invoice.pdf_url}`;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Invoice #{invoice.id}</h1>

      {/* Basic Invoice Info */}
      <div className="border p-4 rounded space-y-1">
        <p><b>To:</b> {invoice.to_address}</p>
        <p><b>Place of Supply:</b> {invoice.place_of_supply}</p>
        <p><b>Payment Terms:</b> {invoice.payment_terms}</p>
      </div>

      {/* Items Table */}
      <h2 className="font-bold mt-6 mb-2">Items</h2>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Description</th>
            <th className="border p-2">Qty</th>
            <th className="border p-2">Unit Price</th>
            <th className="border p-2">GST</th>
            <th className="border p-2">Taxable</th>
          </tr>
        </thead>

        <tbody>
          {invoice.items.map((item) => (
            <tr key={item.id}>
              <td className="border p-2">{item.description}</td>
              <td className="border p-2">{item.quantity}</td>
              <td className="border p-2">{item.unit_price}</td>
              <td className="border p-2">{item.gst}%</td>
              <td className="border p-2">{item.taxable_value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PDF Preview */}
      <h2 className="font-bold mt-6 mb-2">PDF Preview</h2>

      <iframe
        src={pdfUrl}
        width="100%"
        height="600px"
        title="Invoice PDF"
        className="border rounded"
      ></iframe>
    </div>
  );
}
