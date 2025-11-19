import React, { useState } from "react";
import { Plus, Trash2, GripVertical, Calculator, FileText } from "lucide-react";
import { Button } from "../ui/button";
import { createInvoice } from "./api";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  uom: string;
  taxable_value: number;
  gst: number;
}

interface InvoiceFormProps {
  onSuccess: () => void;
}

export default function InvoiceForm({ onSuccess }: InvoiceFormProps) {
  const [form, setForm] = useState({
    to_address: "",
    place_of_supply: "",
    payment_terms: "Net 30",
    service_description: "",
    item_description: "",
    items: [
      {
        id: Date.now().toString(),
        description: "",
        quantity: 1,
        unit_price: 0,
        uom: "Nos",
        taxable_value: 0,
        gst: 0,
      },
    ] as InvoiceItem[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateItem = (id: string, key: keyof InvoiceItem, value: any) => {
    setForm((prev) => {
      const items = prev.items.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [key]: value };
          if (key === "quantity" || key === "unit_price") {
            updated.taxable_value = updated.quantity * updated.unit_price;
          }
          return updated;
        }
        return item;
      });
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          id: Date.now().toString(),
          description: "",
          quantity: 1,
          unit_price: 0,
          uom: "Nos",
          taxable_value: 0,
          gst: 0,
        },
      ],
    }));
  };

  const removeItem = (id: string) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.length > 1 ? prev.items.filter((i) => i.id !== id) : prev.items,
    }));
  };

  // Calculate totals
  const subtotal = form.items.reduce((sum, item) => sum + item.taxable_value, 0);
  const totalTax = form.items.reduce(
    (sum, item) => sum + (item.taxable_value * item.gst) / 100,
    0
  );
  const totalAmount = subtotal + totalTax;

  // Get tax breakdown by rate
  const taxBreakdown = form.items.reduce((acc, item) => {
    if (item.gst > 0 && item.taxable_value > 0) {
      const taxAmount = (item.taxable_value * item.gst) / 100;
      const key = `${item.gst}%`;
      acc[key] = (acc[key] || 0) + taxAmount;
    }
    return acc;
  }, {} as Record<string, number>);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.to_address.trim()) {
      newErrors.to_address = "Address is required";
    }
    
    if (!form.place_of_supply.trim()) {
      newErrors.place_of_supply = "Place of supply is required";
    }
    
    form.items.forEach((item, idx) => {
      if (!item.description.trim()) {
        newErrors[`item_${idx}_desc`] = "Description required";
      }
      if (item.quantity <= 0) {
        newErrors[`item_${idx}_qty`] = "Quantity must be > 0";
      }
      if (item.unit_price < 0) {
        newErrors[`item_${idx}_price`] = "Price must be >= 0";
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    const payload = {
      ...form,
      total_amount: totalAmount,
      items: form.items.map(({ id, ...rest }) => rest),
    };

    await createInvoice(payload);
    onSuccess();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white w-full max-w-7xl mx-auto rounded-xl shadow-lg mb-20"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-800 to-blue-900 px-8 py-3 rounded-t-xl">
        <div className="flex items-center gap-3 text-white">
          <FileText className="w-8 h-8" />
          <div>
            <h2 className="text-2xl">New Invoice</h2>
            <p className="text-blue-100 text-sm mt-1">Fill in the details below to create a new invoice</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Invoice Details Section */}
        <div className="border-b pb-6">
          <h3 className="text-lg mb-4 text-gray-800 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-600 rounded"></span>
            Invoice Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Bill To Address <span className="text-red-500">*</span>
              </label>
              <textarea
                className={`w-full border ${errors.to_address ? 'border-red-500' : 'border-gray-300'} p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                rows={3}
                placeholder="Enter customer address..."
                value={form.to_address}
                onChange={(e) => {
                  setForm({ ...form, to_address: e.target.value });
                  if (errors.to_address) setErrors({ ...errors, to_address: '' });
                }}
              />
              {errors.to_address && (
                <p className="text-red-500 text-xs mt-1">{errors.to_address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Service Description
              </label>
              <textarea
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                rows={3}
                placeholder="Describe the services provided..."
                value={form.service_description}
                onChange={(e) => setForm({ ...form, service_description: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Place of Supply <span className="text-red-500">*</span>
              </label>
              <input
                className={`w-full border ${errors.place_of_supply ? 'border-red-500' : 'border-gray-300'} px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
                placeholder="e.g., New Delhi, India"
                value={form.place_of_supply}
                onChange={(e) => {
                  setForm({ ...form, place_of_supply: e.target.value });
                  if (errors.place_of_supply) setErrors({ ...errors, place_of_supply: '' });
                }}
              />
              {errors.place_of_supply && (
                <p className="text-red-500 text-xs mt-1">{errors.place_of_supply}</p>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Payment Terms
              </label>
              <select
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                value={form.payment_terms}
                onChange={(e) => setForm({ ...form, payment_terms: e.target.value })}
              >
                <option value="Net 15">Net 15</option>
                <option value="Net 30">Net 30</option>
                <option value="Net 60">Net 60</option>
                <option value="Due on Receipt">Due on Receipt</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="border-b pb-6">
          <h3 className="text-lg mb-4 text-gray-800 flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-600 rounded"></span>
            Line Items
          </h3>

          <div className="bg-gray-50 rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-7 gap-15 bg-gray-700 text-white pl-15 py-3 text-sm">
              {/* <div className="w-8 bg-red-300">S.NO</div> */}
              <div className="text-center" >Description</div>
              <div >Quantity</div>
              <div >UoM</div>
              <div >Unit Price</div>
              <div className="text-center" >GST %</div>
              <div className="text-center">Amount</div>
              {/* <div></div> */}
            </div>

            {/* Item Rows */}
            <div className="divide-y divide-gray-200">
              {form.items.map((item, index) => (
                <div
                  key={item.id}
                  className="grid  md:grid-cols-[40px_2fr_100px_120px_140px_120px_140px_40px] gap-3 md:gap-4 p-4 bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="hidden md:flex items-center">
                    <GripVertical className="text-gray-400 w-5 h-5 cursor-move" />
                  </div>

                  <div>
                    <label className="md:hidden text-xs text-gray-600 mb-1 block">Description</label>
                    <input
                      className={`w-full border ${errors[`item_${index}_desc`] ? 'border-red-500' : 'border-gray-300'} px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                      placeholder="Item description"
                      value={item.description}
                      onChange={(e) => {
                        updateItem(item.id, "description", e.target.value);
                        if (errors[`item_${index}_desc`]) {
                          const newErrors = { ...errors };
                          delete newErrors[`item_${index}_desc`];
                          setErrors(newErrors);
                        }
                      }}
                    />
                    {errors[`item_${index}_desc`] && (
                      <p className="text-red-500 text-xs mt-1">{errors[`item_${index}_desc`]}</p>
                    )}
                  </div>

                  <div>
                    <label className="md:hidden text-xs text-gray-600 mb-1 block">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value) || 1)}
                    />
                  </div>

                  <div>
                    <label className="md:hidden text-xs text-gray-600 mb-1 block">Unit of Measure</label>
                    <select
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={item.uom}
                      onChange={(e) => updateItem(item.id, "uom", e.target.value)}
                    >
                      <option value="Nos">Nos</option>
                      <option value="Hrs">Hrs</option>
                      <option value="Days">Days</option>
                      <option value="Units">Units</option>
                      <option value="Pcs">Pcs</option>
                      <option value="Kg">Kg</option>
                      <option value="Ltr">Ltr</option>
                    </select>
                  </div>

                  <div>
                    <label className="md:hidden text-xs text-gray-600 mb-1 block">Unit Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">₹</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="w-full border border-gray-300 pl-7 pr-3 py-2 rounded-lg text-right text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={item.unit_price}
                        onChange={(e) => updateItem(item.id, "unit_price", Number(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="md:hidden text-xs text-gray-600 mb-1 block">GST</label>
                    <select
                      className="w-full border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={item.gst}
                      onChange={(e) => updateItem(item.id, "gst", Number(e.target.value))}
                    >
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="12">12%</option>
                      <option value="18">18%</option>
                      <option value="28">28%</option>
                    </select>
                  </div>

                  <div>
                    <label className="md:hidden text-xs text-gray-600 mb-1 block">Amount</label>
                    <div className="px-3 py-2 bg-gray-100 rounded-lg text-right text-sm text-gray-700">
                      ₹ {item.taxable_value.toFixed(2)}
                    </div>
                  </div>

                  <div className="flex items-center justify-end md:justify-center">
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all"
                      disabled={form.items.length === 1}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Item Button */}
            <div className="p-4 bg-gray-100">
              <Button type="button" variant="outline" onClick={addItem} className="w-full md:w-auto">
                <Plus className="w-4 h-4 mr-2" />
                Add Line Item
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              rows={6}
              placeholder="Any additional information or special terms..."
              value={form.item_description}
              onChange={(e) => setForm({ ...form, item_description: e.target.value })}
            />
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-4 text-gray-700">
              <Calculator className="w-5 h-5" />
              <h4>Invoice Summary</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span>₹ {subtotal.toFixed(2)}</span>
              </div>

              {Object.entries(taxBreakdown).map(([rate, amount]) => (
                <div key={rate} className="flex justify-between text-gray-600 text-sm">
                  <span>GST {rate}:</span>
                  <span>₹ {amount.toFixed(2)}</span>
                </div>
              ))}

              <div className="flex justify-between text-gray-700 pt-2 border-t border-gray-300">
                <span>Total Tax:</span>
                <span>₹ {totalTax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-xl pt-3 border-t-2 border-gray-400 text-blue-700">
                <span>Total Amount:</span>
                <span>₹ {totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
          <Button type="button" variant="outline" className="flex-1 sm:flex-none">
            Cancel
          </Button>
          <Button type="submit" className="flex-1 sm:flex-none sm:ml-auto">
            <FileText className="w-4 h-4 mr-2" />
            Generate Invoice
          </Button>
        </div>
      </div>
    </form>
  );
}
