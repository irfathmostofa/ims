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
import { toast } from "sonner";

type User = {
  id?: number;
  branch_id: string;
  role_id: string;
  username: string;
  phone: string;
  address: string;
  password_hash: string;
};

type Props = {
  branches: { id: number; name: string }[];
  roles: { id: number; name: string }[];
  onNext?: (data: User[]) => void;
  onBack?: () => void;
  defaultValues?: User[];
};

export default function UserForm({
  branches,
  roles,
  onNext,
  onBack,
  defaultValues,
}: Props) {
  const [users, setUsers] = useState<User[]>([
    {
      branch_id: "",
      role_id: "",
      username: "",
      phone: "",
      address: "",
      password_hash: "",
    },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (defaultValues?.length) setUsers(defaultValues);
  }, [defaultValues]);

  const updateUser = (index: number, field: keyof User, value: string) => {
    const newUsers = [...users];
    newUsers[index] = { ...newUsers[index], [field]: value };
    setUsers(newUsers);
  };

  const addUser = () =>
    setUsers([
      ...users,
      {
        branch_id: "",
        role_id: "",
        username: "",
        phone: "",
        address: "",
        password_hash: "",
      },
    ]);
  console.log(users);
  const saveAndNext = async () => {
    for (const user of users) {
      if (!user.username || !user.phone || !user.role_id || !user.branch_id) {
        toast.error("Please fill all required fields for each user.");
        return;
      }
    }

    setLoading(true);
    try {
      const savedUsers: User[] = [];
      for (const user of users) {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER}/users/create-user`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
          }
        );

        if (!res.ok) throw new Error("Failed to save user");
        const response = await res.json();
        savedUsers.push(response.data);
      }
      setUsers(savedUsers);
      onNext?.(savedUsers);
    } catch (err) {
      console.error("Error saving users:", err);
      alert("Error saving users");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {users.map((user, index) => (
        <div key={index} className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Full Name"
            value={user.username}
            onChange={(e) => updateUser(index, "username", e.target.value)}
          />
          <Input
            placeholder="Phone"
            value={user.phone}
            onChange={(e) => updateUser(index, "phone", e.target.value)}
          />
          <Input
            placeholder="Address"
            value={user.address}
            onChange={(e) => updateUser(index, "address", e.target.value)}
          />
          <Input
            placeholder="Password"
            type="password"
            value={user.password_hash}
            onChange={(e) => updateUser(index, "password_hash", e.target.value)}
          />

          <Select
            value={user.role_id}
            onValueChange={(val) => updateUser(index, "role_id", val)}
          >
            <SelectTrigger>Role</SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.id} value={role.id.toString()}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={user.branch_id}
            onValueChange={(val) => updateUser(index, "branch_id", val)}
          >
            <SelectTrigger>Branch</SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id.toString()}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}

      <Button variant="outline" onClick={addUser} className="w-full">
        + Add User
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
