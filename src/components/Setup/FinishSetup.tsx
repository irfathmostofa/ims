"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = { data: any; onBack: () => void };

export default function FinishSetup({ data, onBack }: Props) {
  const handleSubmit = async () => {
    await fetch("/api/setup/initiate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    window.location.href = "/";
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Review Setup</h2>

      <Card>
        <CardHeader>
          <CardTitle>Company</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <b>Name:</b> {data.company?.name}
          </p>
          <p>
            <b>Address:</b> {data.company?.address}
          </p>
          <p>
            <b>Email:</b> {data.company?.email}
          </p>
          <p>
            <b>Currency:</b> {data.company?.currency}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branches</CardTitle>
        </CardHeader>
        <CardContent>
          {data.branches?.map((b: any, i: number) => (
            <p key={i}>
              {b.name} – {b.address}
            </p>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
        </CardHeader>
        <CardContent>
          {data.roles?.map((r: any, i: number) => (
            <p key={i}>{r.name}</p>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {data.users?.map((u: any, i: number) => (
            <p key={i}>
              {u.name} ({u.email}) – {u.role} @ {u.branch}
            </p>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack} className="btn-bw-primary">
          Back
        </Button>
        <Button onClick={handleSubmit} className="btn-bw-primary">
          Finish Setup
        </Button>
      </div>
    </div>
  );
}
