import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button"; // assuming shadcn/ui button
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";

interface Allowance {
  name: string;
  value: number;
}

interface Benefit {
  name: string;
  value: string | number | boolean;
}

const OfferForm: React.FC = () => {
  const [appId, setAppId] = useState<number>(0);
  const [candidateId, setCandidateId] = useState<number>(0);
  const [grade, setGrade] = useState<string>("");
  const [base, setBase] = useState<number>(0);
  const [allowances, setAllowances] = useState<Allowance[]>([
    { name: "housing", value: 0 },
    { name: "transport", value: 0 },
  ]);
  const [benefits, setBenefits] = useState<Benefit[]>([
    { name: "medical", value: false },
    { name: "tickets", value: 0 },
  ]);
  const [variablePay, setVariablePay] = useState<number>(0);
  const [currency, setCurrency] = useState<string>("USD");
  const [expiryDays, setExpiryDays] = useState<number>(14);
  const [country, setCountry] = useState<string>("IN");

  // Handlers for dynamic fields
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

  const addBenefit = () => setBenefits([...benefits, { name: "", value: "" }]);

  const removeBenefit = (index: number) => {
    setBenefits(benefits.filter((_, i) => i !== index));
  };

  const updateBenefit = (index: number, key: keyof Benefit, value: any) => {
    const updated = [...benefits];
    updated[index][key] = value;
    setBenefits(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      app_id: appId,
      candidate_id: candidateId,
      grade,
      base,
      allowances,
      benefits,
      variable_pay: variablePay,
      currency,
      expiry_days: expiryDays,
      country,
    };
    console.log("Form Submitted:", payload);
    // API call here
  };

  return (
    <Card className="max-w-3xl mx-auto p-6 shadow-lg">
      <CardHeader>
        <CardTitle>Create Offer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>App ID</Label>
              <Input
                type="number"
                value={appId}
                onChange={(e) => setAppId(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Candidate ID</Label>
              <Input
                type="number"
                value={candidateId}
                onChange={(e) => setCandidateId(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Grade</Label>
              <Input
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              />
            </div>
            <div>
              <Label>Base Salary</Label>
              <Input
                type="number"
                value={base}
                onChange={(e) => setBase(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Allowances */}
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
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeAllowance(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" onClick={addAllowance} className="mt-2">
              Add Allowance
            </Button>
          </div>

          {/* Benefits */}
          <div>
            <Label className="text-lg">Benefits</Label>
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-2 items-center mt-2">
                <Input
                  placeholder="Name"
                  value={benefit.name}
                  onChange={(e) => updateBenefit(index, "name", e.target.value)}
                />
                <Input
                  placeholder="Value"
                  value={benefit.value as string}
                  onChange={(e) =>
                    updateBenefit(index, "value", e.target.value)
                  }
                />
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeBenefit(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" onClick={addBenefit} className="mt-2">
              Add Benefit
            </Button>
          </div>

          {/* Other Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Variable Pay</Label>
              <Input
                type="number"
                value={variablePay}
                onChange={(e) => setVariablePay(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Currency</Label>
              <Input
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              />
            </div>
            <div>
              <Label>Expiry Days</Label>
              <Input
                type="number"
                value={expiryDays}
                onChange={(e) => setExpiryDays(Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Country</Label>
              <Input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default OfferForm;
