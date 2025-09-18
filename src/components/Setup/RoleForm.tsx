"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Role = { name: string };
type Props = {
  onNext: (data: Role[]) => void;
  onBack: () => void;
  defaultValues?: Role[];
};

export default function RoleForm({ onNext, onBack, defaultValues }: Props) {
  const [roles, setRoles] = useState<Role[]>([{ name: "" }]);

  useEffect(() => {
    if (defaultValues?.length) setRoles(defaultValues);
  }, [defaultValues]);

  const updateRole = (index: number, value: string) => {
    const newRoles = [...roles];
    newRoles[index].name = value;
    setRoles(newRoles);
  };

  const addRole = () => setRoles([...roles, { name: "" }]);

  return (
    <div className="space-y-4">
      {roles.map((role, index) => (
        <Input
          key={index}
          placeholder="Role Name"
          value={role.name}
          onChange={(e) => updateRole(index, e.target.value)}
        />
      ))}

      <Button variant="outline" onClick={addRole} className="w-full">
        + Add Role
      </Button>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack} className="btn-bw-primary">
          Back
        </Button>
        <Button onClick={() => onNext(roles)} className="btn-bw-primary">
          Next
        </Button>
      </div>
    </div>
  );
}
