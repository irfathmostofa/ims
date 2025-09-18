"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";

type User = { name: string; email: string; role: string; branch: string };
type Props = {
  onNext: (data: User[]) => void;
  onBack: () => void;
  defaultValues?: User[];
};

export default function UserForm({ onNext, onBack, defaultValues }: Props) {
  const [users, setUsers] = useState<User[]>([
    { name: "", email: "", role: "", branch: "" },
  ]);

  useEffect(() => {
    if (defaultValues?.length) setUsers(defaultValues);
  }, [defaultValues]);

  const updateUser = (index: number, field: keyof User, value: string) => {
    const newUsers = [...users];
    newUsers[index][field] = value;
    setUsers(newUsers);
  };

  const addUser = () =>
    setUsers([...users, { name: "", email: "", role: "", branch: "" }]);

  return (
    <div className="space-y-4">
      {users.map((user, index) => (
        <div key={index} className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Full Name"
            value={user.name}
            onChange={(e) => updateUser(index, "name", e.target.value)}
          />
          <Input
            placeholder="Email"
            value={user.email}
            onChange={(e) => updateUser(index, "email", e.target.value)}
          />

          <Select
            value={user.role}
            onValueChange={(val) => updateUser(index, "role", val)}
          >
            <SelectTrigger>Role</SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
              <SelectItem value="Cashier">Cashier</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={user.branch}
            onValueChange={(val) => updateUser(index, "branch", val)}
          >
            <SelectTrigger>Branch</SelectTrigger>
            <SelectContent>
              <SelectItem value="HQ">HQ</SelectItem>
              <SelectItem value="Branch 1">Branch 1</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ))}

      <Button variant="outline" onClick={addUser} className="w-full">
        + Add User
      </Button>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack} className="btn-bw-primary">
          Back
        </Button>
        <Button onClick={() => onNext(users)} className="btn-bw-primary">
          Next
        </Button>
      </div>
    </div>
  );
}
