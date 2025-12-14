// OfferForm.tsx
import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "./ui/select";
import { XCircle } from "lucide-react";

type Candidate = {
  id: string;
  name: string;
  email?: string | null;
  position?: string;
  requisition_id?: number | string;
};

export default function OfferForm({
  candidates,
  onSubmit,
  onCancel,
}: {
  candidates: Candidate[];
  onSubmit: (data: any) => void;
  onCancel?: () => void;
}) {
  const [candidateKey, setCandidateKey] = useState("");

  const [grade, setGrade] = useState("");
  const [base, setBase] = useState("");
  const [variablePay, setVariablePay] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [expiryDays, setExpiryDays] = useState(14);

  const [allowances, setAllowances] = useState([
    { name: "Food", value: "0" },
    { name: "Transport", value: "0" },
  ]);

  const [benefits, setBenefits] = useState([
    { name: "Medical Insurance", value: "Provided" },
    { name: "Annual Leave", value: "30 days" },
  ]);

  const selectedCandidate = candidates.find(
    (c) => (c.email ?? `no-email-${c.id}`) === candidateKey
  );

  const handleSelectCandidate = (key: string) => {
    setCandidateKey(key);
    const cand = candidates.find((c) => (c.email ?? `no-email-${c.id}`) === key);

    if (cand) {
      setGrade(cand.position ?? "");
    }
  };

  // Dynamic Allowances
  const addAllowance = () =>
    setAllowances([...allowances, { name: "", value: "0" }]);

  const updateAllowance = (i: number, field: "name" | "value", value: string) => {
    const copy = [...allowances];
    copy[i][field] = value;
    setAllowances(copy);
  };

  const deleteAllowance = (i: number) =>
    setAllowances(allowances.filter((_, idx) => idx !== i));

  // Dynamic Benefits
  const addBenefit = () =>
    setBenefits([...benefits, { name: "", value: "" }]);

  const updateBenefit = (i: number, field: "name" | "value", value: string) => {
    const copy = [...benefits];
    copy[i][field] = value;
    setBenefits(copy);
  };

  const deleteBenefit = (i: number) =>
    setBenefits(benefits.filter((_, idx) => idx !== i));

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (!selectedCandidate) {
      alert("Select a candidate");
      return;
    }

    const allowancesObj: any = {};
    allowances.forEach((a) => {
      if (a.name) allowancesObj[a.name.toLowerCase()] = Number(a.value) || 0;
    });

    const benefitsObj: any = {};
    benefits.forEach((b) => {
      if (b.name) benefitsObj[b.name.toLowerCase()] = b.value;
    });

    const payload = {
      app_id: selectedCandidate.requisition_id,
      candidate_id: selectedCandidate.id,
      grade,
      base: Number(base),
      allowances: allowancesObj,
      benefits: benefitsObj,
      variable_pay: Number(variablePay),
      currency,
      expiry_days: expiryDays,
    };

    onSubmit(payload);
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* Candidate Selector */}
      <div>
        <Label>Candidate</Label>
        <Select value={candidateKey} onValueChange={handleSelectCandidate}>
          <SelectTrigger>
            <SelectValue placeholder="Select candidate" />
          </SelectTrigger>
          <SelectContent>
            {candidates.map((c) => {
              const key = c.email ?? `no-email-${c.id}`;
              return (
                <SelectItem key={key} value={key}>
                  {c.email ? `${c.email} — ${c.name}` : `${c.name} (No Email)`} — Req{" "}
                  {c.requisition_id}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Grade */}
      <div>
        <Label>Grade</Label>
        <Input
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          placeholder="Enter grade"
        />
      </div>

      {/* Base Salary */}
      <div>
        <Label>Base Salary</Label>
        <Input value={base} onChange={(e) => setBase(e.target.value)} />
      </div>

      {/* Variable Pay */}
      <div>
        <Label>Variable Pay</Label>
        <Input
          value={variablePay}
          onChange={(e) => setVariablePay(e.target.value)}
        />
      </div>

      {/* Currency */}
      <div>
        <Label>Currency</Label>
        <Select value={currency} onValueChange={setCurrency}>
          <SelectTrigger>
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INR">INR</SelectItem>
            <SelectItem value="USD">USD</SelectItem>
            <SelectItem value="AED">AED</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Expiry Days */}
      <div>
        <Label>Offer Validity (days)</Label>
        <Input
          type="number"
          value={expiryDays}
          onChange={(e) => setExpiryDays(Number(e.target.value))}
        />
      </div>

      {/* Dynamic Allowances */}
      <div>
        <Label>Allowances</Label>
        {allowances.map((a, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <Input
              value={a.name}
              onChange={(e) => updateAllowance(i, "name", e.target.value)}
              placeholder="Allowance Name"
            />
            <Input
              value={a.value}
              onChange={(e) => updateAllowance(i, "value", e.target.value)}
              placeholder="Value"
            />
            <XCircle onClick={() => deleteAllowance(i)} className="cursor-pointer" />
          </div>
        ))}
        <Button type="button" onClick={addAllowance}>
          Add Allowance
        </Button>
      </div>

      {/* Dynamic Benefits */}
      <div>
        <Label>Benefits</Label>
        {benefits.map((b, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <Input
              value={b.name}
              onChange={(e) => updateBenefit(i, "name", e.target.value)}
              placeholder="Benefit Name"
            />
            <Input
              value={b.value}
              onChange={(e) => updateBenefit(i, "value", e.target.value)}
              placeholder="Description"
            />
            <XCircle onClick={() => deleteBenefit(i)} className="cursor-pointer" />
          </div>
        ))}
        <Button type="button" onClick={addBenefit}>
          Add Benefit
        </Button>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit">Create Offer</Button>
      </div>
    </form>
  );
}
