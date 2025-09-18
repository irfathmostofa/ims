"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Branch = { name: string; address: string };
type Props = {
  onNext: (data: Branch[]) => void;
  onBack: () => void;
  defaultValues?: Branch[];
};

export default function BranchForm({ onNext, onBack, defaultValues }: Props) {
  const [branches, setBranches] = useState<Branch[]>([
    { name: "", address: "" },
  ]);

  useEffect(() => {
    if (defaultValues?.length) setBranches(defaultValues);
  }, [defaultValues]);

  const updateBranch = (index: number, field: keyof Branch, value: string) => {
    const newBranches = [...branches];
    newBranches[index][field] = value;
    setBranches(newBranches);
  };

  const addBranch = () => setBranches([...branches, { name: "", address: "" }]);

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
        <Button variant="secondary" onClick={onBack} className="btn-bw-primary">
          Back
        </Button>
        <Button onClick={() => onNext(branches)} className="btn-bw-primary">
          Next
        </Button>
      </div>
    </div>
  );
}
