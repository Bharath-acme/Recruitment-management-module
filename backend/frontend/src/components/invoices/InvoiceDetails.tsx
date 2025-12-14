import React, { useEffect, useState } from "react";
import { fetchInvoiceById } from "./api";
import { useParams } from "react-router-dom";

export default function InvoiceDetails() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInvoiceById(id)
      .then((data) => setInvoice(data))
      .catch(() => setError("Failed to load invoice"));
  }, [id]);

  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!invoice) return <div className="p-6">Loading...</div>;

  const API = import.meta.env.VITE_API_BASE_URL;

  // 🔥 NEW PDF URL (dynamic)
 const pdfUrl = `${API}/invoices/${id}?preview=true`;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Invoice #{invoice.invoice_number}</h1>

      {/* Basic Invoice Info */}
      <div className="border p-4 rounded space-y-1">
        <p><b>To:</b> {invoice.client_address}</p>
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
