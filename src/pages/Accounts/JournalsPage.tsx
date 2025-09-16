"use client";

import { useState } from "react";
import { Pen, Plus, Trash } from "lucide-react";
import { DataTable } from "@/components/ui/dataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type Account = {
  id: number;
  name: string;
  type: string;
};

type JournalLine = {
  accountId: number;
  accountName?: string;
  debit: number;
  credit: number;
};

type JournalEntry = {
  id: number;
  date: string;
  reference?: string;
  description?: string;
  lines: JournalLine[];
};

// ✅ Dummy COA accounts
const accounts: Account[] = [
  { id: 1, name: "Cash", type: "Asset" },
  { id: 2, name: "Bank", type: "Asset" },
  { id: 3, name: "Sales", type: "Income" },
  { id: 4, name: "Expense", type: "Expense" },
];

export default function JournalsPage() {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<JournalEntry>>({ lines: [] });

  // ✅ Add a new line
  const addLine = () => {
    setForm((prev) => ({
      ...prev,
      lines: [...(prev.lines || []), { accountId: 0, debit: 0, credit: 0 }],
    }));
  };

  // ✅ Update line
  const updateLine = (
    index: number,
    field: "accountId" | "debit" | "credit",
    value: any
  ) => {
    setForm((prev) => {
      const lines = [...(prev.lines || [])];
      lines[index] = { ...lines[index], [field]: value };
      if (field === "accountId") {
        const account = accounts.find((a) => a.id === value);
        lines[index].accountName = account?.name;
      }
      return { ...prev, lines };
    });
  };

  // ✅ Remove line
  const removeLine = (index: number) => {
    setForm((prev) => ({
      ...prev,
      lines: (prev.lines || []).filter((_, i) => i !== index),
    }));
  };

  // ✅ Save journal entry
  const handleSave = () => {
    if (!form.date || !(form.lines && form.lines.length)) {
      alert("Date and at least one line are required");
      return;
    }

    const totalDebit = form.lines!.reduce((sum, l) => sum + (l.debit || 0), 0);
    const totalCredit = form.lines!.reduce(
      (sum, l) => sum + (l.credit || 0),
      0
    );

    if (totalDebit !== totalCredit) {
      alert("Total debit must equal total credit");
      return;
    }

    if (form.id) {
      setJournals((prev) =>
        prev.map((j) =>
          j.id === form.id ? ({ ...j, ...form } as JournalEntry) : j
        )
      );
    } else {
      const newId = journals.length
        ? Math.max(...journals.map((j) => j.id)) + 1
        : 1;
      setJournals((prev) => [...prev, { ...form, id: newId } as JournalEntry]);
    }

    setForm({ lines: [] });
    setOpen(false);
  };

  // ✅ Edit journal
  const handleEdit = (j: JournalEntry) => {
    setForm(j);
    setOpen(true);
  };

  // ✅ Delete journal
  const handleDelete = (j: JournalEntry) => {
    if (!confirm(`Delete journal on "${j.date}"?`)) return;
    setJournals((prev) => prev.filter((je) => je.id !== j.id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Journal Entries</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 btn-bw-primary">
              <Plus size={18} /> Add Journal
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-2xl bg-amber-50">
            <DialogHeader>
              <DialogTitle>
                {form.id ? "Edit Journal" : "Add Journal"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <input
                type="date"
                className="border px-3 py-2 rounded w-full"
                value={form.date || ""}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
              <input
                type="text"
                placeholder="Reference"
                className="border px-3 py-2 rounded w-full"
                value={form.reference || ""}
                onChange={(e) =>
                  setForm({ ...form, reference: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Description"
                className="border px-3 py-2 rounded w-full"
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              {/* ✅ Lines */}
              <div className="space-y-2 border p-2 rounded">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Journal Lines</span>
                  <Button size="sm" onClick={addLine}>
                    + Add Line
                  </Button>
                </div>

                {(form.lines || []).map((line, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <select
                      className="border px-2 py-1 rounded flex-1"
                      value={line.accountId}
                      onChange={(e) =>
                        updateLine(i, "accountId", Number(e.target.value))
                      }
                    >
                      <option value={0}>Select Account</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Debit"
                      className="border px-2 py-1 rounded w-24"
                      value={line.debit}
                      onChange={(e) =>
                        updateLine(i, "debit", Number(e.target.value))
                      }
                    />
                    <input
                      type="number"
                      placeholder="Credit"
                      className="border px-2 py-1 rounded w-24"
                      value={line.credit}
                      onChange={(e) =>
                        updateLine(i, "credit", Number(e.target.value))
                      }
                    />
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => removeLine(i)}
                    >
                      x
                    </Button>
                  </div>
                ))}
              </div>

              <Button className="w-full btn-bw-primary" onClick={handleSave}>
                {form.id ? "Update Journal" : "Add Journal"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ✅ Journal Entries Table */}
      <DataTable
        data={journals.map((j) => ({
          id: j.id,
          date: j.date,
          reference: j.reference,
          description: j.description,
          totalDebit: j.lines.reduce((sum, l) => sum + l.debit, 0),
          totalCredit: j.lines.reduce((sum, l) => sum + l.credit, 0),
        }))}
        label="Journal Entries"
        hiddenColumns={["id"]}
        selectable
        rowsPerPage={10}
        actions={[
          {
            label: <Pen size={16} />,
            onClick: (row) =>
              handleEdit(journals.find((j) => j.id === row.id)!),
          },
          {
            label: <Trash size={16} />,
            onClick: (row) =>
              handleDelete(journals.find((j) => j.id === row.id)!),
          },
        ]}
      />
    </div>
  );
}
