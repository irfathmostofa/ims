"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Branch = {
  id?: number;
  company_id: number;
  name: string;
  type: string;
  address: string;
  phone: string;
};

type Props = {
  company_id: number; // ✅ number, not string
  onNext?: (data: Branch[]) => void;
  onBack?: () => void;
  defaultValues?: Branch[];
};

export default function BranchForm({
  company_id,
  onNext,
  onBack,
  defaultValues,
}: Props) {
  const [branches, setBranches] = useState<Branch[]>([
    { company_id, name: "", type: "", address: "", phone: "" },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (defaultValues?.length) {
      // ✅ inject companyId
      setBranches(defaultValues.map((b) => ({ ...b, company_id })));
    }
  }, [defaultValues, company_id]);

  const updateBranch = (
    index: number,
    field: "name" | "type" | "address" | "phone",
    value: string
  ) => {
    const newBranches = [...branches];
    newBranches[index][field] = value;
    setBranches(newBranches);
  };

  const addBranch = () =>
    setBranches([
      ...branches,
      { company_id, name: "", type: "", address: "", phone: "" },
    ]);

  const saveAndNext = async () => {
    setLoading(true);
    try {
      // Save each branch individually (since backend expects one object)
      const savedBranches: Branch[] = [];
      for (const branch of branches) {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/setup/create-branch`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(branch),
          }
        );

        if (!res.ok) throw new Error("Failed to save branch");
        const response = await res.json();
        savedBranches.push(response.data);
      }

      setBranches(savedBranches);
      if (onNext) onNext(savedBranches);
    } catch (err) {
      console.error(err);
      alert("Error saving branches");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {branches.map((branch, index) => (
        <div key={index} className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Branch Name"
            value={branch.name}
            onChange={(e) => updateBranch(index, "name", e.target.value)}
          />
          <Input
            placeholder="Type"
            value={branch.type}
            onChange={(e) => updateBranch(index, "type", e.target.value)}
          />
          <Input
            placeholder="Phone"
            value={branch.phone}
            onChange={(e) => updateBranch(index, "phone", e.target.value)}
          />
          <Input
            placeholder="Address"
            value={branch.address}
            onChange={(e) => updateBranch(index, "address", e.target.value)}
          />
        </div>
      ))}

      <Button variant="outline" onClick={addBranch} className="w-full">
        + Add Branch
      </Button>

      <div className="flex justify-between">
        {onBack && (
          <Button
            variant="secondary"
            onClick={onBack}
            className="btn-bw-primary"
          >
            Back
          </Button>
        )}
        <Button
          onClick={saveAndNext}
          disabled={loading}
          className="btn-bw-primary"
        >
          {loading ? "Saving..." : "Save & Next"}
        </Button>
      </div>
    </div>
  );
}
