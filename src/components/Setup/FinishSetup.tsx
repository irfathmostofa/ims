"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

type Props = { data: any; onBack: () => void };

export default function FinishSetup({ data, onBack }: Props) {
  const router = useNavigate();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Review Setup</h2>

      {/* Company Card */}
      <Card>
        <CardHeader>
          <CardTitle>Company</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <b>Name:</b> {data.company?.name || "N/A"}
          </p>
          <p>
            <b>Address:</b> {data.company?.address || "N/A"}
          </p>
          <p>
            <b>Email:</b> {data.company?.email || "N/A"}
          </p>
          <p>
            <b>Currency:</b> {data.company?.currency || "N/A"}
          </p>
        </CardContent>
      </Card>

      {/* Branches Card */}
      <Card>
        <CardHeader>
          <CardTitle>Branches</CardTitle>
        </CardHeader>
        <CardContent>
          {data.branches?.length ? (
            data.branches.map((b: any, i: number) => (
              <p key={i}>
                {b.name || "N/A"} – {b.address || "N/A"}
              </p>
            ))
          ) : (
            <p>No branches added</p>
          )}
        </CardContent>
      </Card>

      {/* Roles Card */}
      <Card>
        <CardHeader>
          <CardTitle>Roles</CardTitle>
        </CardHeader>
        <CardContent>
          {data.roles?.length ? (
            data.roles.map((r: any, i: number) => (
              <p key={i}>{r.name || "N/A"}</p>
            ))
          ) : (
            <p>No roles added</p>
          )}
        </CardContent>
      </Card>

      {/* Users Card */}
      <Card>
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent>
          {data.users?.length ? (
            data.users.map((u: any, i: number) => (
              <p key={i}>
                {u.username || "N/A"} ({u.phone || "N/A"}) –{" "}
                {u.role_name || "N/A"} @ {u.branch_name || "N/A"}
              </p>
            ))
          ) : (
            <p>No users added</p>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack} className="btn-bw-primary">
          Back
        </Button>
        <Button
          onClick={() => {
            router("/");
          }}
          className="btn-bw-primary"
        >
          Finish Setup
        </Button>
      </div>
    </div>
  );
}
