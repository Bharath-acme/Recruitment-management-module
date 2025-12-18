import React, { useEffect, useState } from "react";
import { FileText, Upload } from "lucide-react";
import { Button } from "../ui/button";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Company {
  id: number;
  name: string;
}

interface Props {
  onSuccess: () => void;
}

export default function InvoiceUploadForm({ onSuccess }: Props) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [clientCompany, setClientCompany] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
   const token = localStorage.getItem("token");

  useEffect(() => {
    const loadCompanies = async () => {
       try {
        const res = await axios.get(`${API_BASE_URL}/companies`, {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ FIX
          },
        });
        setCompanies(res.data.items ?? res.data); // safe fallback
      } catch (err) {
        setError("Unauthorized or failed to load companies");
      }
    };
    loadCompanies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientCompany || !file) {
      setError("Client company and invoice PDF are required");
      return;
    }

    const formData = new FormData();
    formData.append("client_company", clientCompany);
    formData.append("file", file);

    try {
      setLoading(true);
      await axios.post(`${API_BASE_URL}/invoices/upload`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
         },
      });
      onSuccess();
    } catch {
      setError("Invoice upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white w-full max-w-xl mx-auto rounded-xl shadow-lg"
    >
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-6 py-4 rounded-t-xl text-white flex items-center gap-3">
        <FileText className="w-6 h-6" />
        <h2 className="text-xl">Upload Invoice</h2>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm mb-2">
            Client Company <span className="text-red-500">*</span>
          </label>
          <select
            className="w-full border px-4 py-2 rounded-lg"
            value={clientCompany}
            onChange={(e) => setClientCompany(e.target.value)}
          >
            <option value="">Select company</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-2">
            Invoice PDF <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept="application/pdf"
            className="w-full border px-4 py-2 rounded-lg"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          <Upload className="w-4 h-4 mr-2" />
          {loading ? "Uploading..." : "Upload Invoice"}
        </Button>
      </div>
    </form>
  );
}
