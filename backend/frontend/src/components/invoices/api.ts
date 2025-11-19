const API = import.meta.env.VITE_API_BASE_URL;


export const fetchInvoices = async () => {
  const res = await fetch(`${API}/invoices`);
  return res.json();
};

export const createInvoice = async (invoiceData: any) => {
  const res = await fetch(`${API}/invoices/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(invoiceData),
  });
  return res.json(); // returns invoice metadata + pdf_url
};

export const fetchInvoiceById = async (id: string) => {
  const res = await fetch(`${API}/invoices/${id}`);
  return res.json();
};
