"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Role = {
  id?: number; // server-generated ID
  name: string;
  description: string;
};

type Props = {
  onNext?: (data: Role[]) => void;
  onBack?: () => void;
  defaultValues?: Role[];
};

export default function RoleForm({ onNext, onBack, defaultValues }: Props) {
  const [roles, setRoles] = useState<Role[]>([{ name: "", description: "" }]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (defaultValues?.length) setRoles(defaultValues);
  }, [defaultValues]);

  // Fix for TS 'never' error
  const updateRole = (
    index: number,
    field: "name" | "description",
    value: string
  ) => {
    const newRoles = [...roles];
    newRoles[index][field] = value;
    setRoles(newRoles);
  };

  const addRole = () => setRoles([...roles, { name: "", description: "" }]);
  console.log(roles);
  const saveAndNext = async () => {
    setLoading(true);
    try {
      // Save each role individually (or backend can support bulk)
      const savedRoles: Role[] = [];
      for (const role of roles) {
        const res = await fetch(`${import.meta.env.VITE_SERVER}/setup/roles`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(role),
        });

        if (!res.ok) throw new Error("Failed to save role");
        const response = await res.json();
        savedRoles.push(response.data);
      }

      setRoles(savedRoles);

      if (onNext) onNext(savedRoles);
    } catch (err) {
      console.error(err);
      alert("Error saving roles");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {roles.map((role, index) => (
        <div key={index} className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Role Name"
            value={role.name}
            onChange={(e) => updateRole(index, "name", e.target.value)}
          />
          <Input
            placeholder="Description"
            value={role.description}
            onChange={(e) => updateRole(index, "description", e.target.value)}
          />
        </div>
      ))}

      <Button variant="outline" onClick={addRole} className="w-full">
        + Add Role
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
