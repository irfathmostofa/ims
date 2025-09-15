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

type Company = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  website?: string;
  tagline?: string;
  currency?: string;
  logoUrl?: string;
};

export default function CompanyPage() {
  const [companies, setCompanies] = useState<Company[]>([
    {
      id: 1,
      name: "My Company",
      email: "info@mycompany.com",
      phone: "123456789",
      address: "123 Main St",
      taxId: "TAX-001",
      website: "https://mycompany.com",
      tagline: "We deliver excellence",
      currency: "USD",
      logoUrl: "",
    },
  ]);

  const [form, setForm] = useState<Partial<Company>>({});
  const [open, setOpen] = useState(false);

  // ✅ Handle Logo Upload
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setForm({ ...form, logoUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  // ✅ Add / Update Company
  const handleSave = () => {
    if (!form.name) {
      alert("Company name is required");
      return;
    }

    if (form.id) {
      setCompanies((prev) =>
        prev.map((c) => (c.id === form.id ? { ...c, ...form } : c))
      );
    } else {
      const newId = companies.length
        ? Math.max(...companies.map((c) => c.id)) + 1
        : 1;
      setCompanies((prev) => [...prev, { ...form, id: newId } as Company]);
    }

    setForm({});
    setOpen(false);
  };

  // ✅ Edit Company
  const handleEdit = (c: Company) => {
    setForm(c);
    setOpen(true);
  };

  // ✅ Delete Company
  const handleDelete = (c: Company) => {
    if (!confirm(`Delete company "${c.name}"?`)) return;
    setCompanies((prev) => prev.filter((company) => company.id !== c.id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Company</h1>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2 btn-bw-primary">
              <Plus size={18} /> Add Company
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md bg-amber-50">
            <DialogHeader>
              <DialogTitle>
                {form.id ? "Edit Company" : "Add Company"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 mt-2">
              <input
                type="text"
                placeholder="Company Name"
                className="border px-3 py-2 rounded w-full"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <input
                type="email"
                placeholder="Email"
                className="border px-3 py-2 rounded w-full"
                value={form.email || ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />

              <input
                type="text"
                placeholder="Phone"
                className="border px-3 py-2 rounded w-full"
                value={form.phone || ""}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />

              <input
                type="text"
                placeholder="Address"
                className="border px-3 py-2 rounded w-full"
                value={form.address || ""}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />

              <input
                type="text"
                placeholder="Tax ID"
                className="border px-3 py-2 rounded w-full"
                value={form.taxId || ""}
                onChange={(e) => setForm({ ...form, taxId: e.target.value })}
              />

              <input
                type="text"
                placeholder="Website"
                className="border px-3 py-2 rounded w-full"
                value={form.website || ""}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />

              <input
                type="text"
                placeholder="Tagline"
                className="border px-3 py-2 rounded w-full"
                value={form.tagline || ""}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
              />

              <input
                type="text"
                placeholder="Currency"
                className="border px-3 py-2 rounded w-full"
                value={form.currency || ""}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
              />

              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Logo</label>
                {form.logoUrl && (
                  <img
                    src={form.logoUrl}
                    alt="Logo"
                    className="w-24 h-24 object-contain mb-2"
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                />
              </div>

              <Button className="w-full btn-bw-primary" onClick={handleSave}>
                {form.id ? "Update" : "Add Company"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ✅ Data Table */}
      <DataTable
        data={companies}
        label="Company List"
        hiddenColumns={["id", "logoUrl"]}
        selectable
        rowsPerPage={10}
        actions={[
          {
            label: <Pen size={16} />,
            onClick: (row) => handleEdit(row),
          },
          {
            label: <Trash size={16} />,
            onClick: (row) => handleDelete(row),
          },
        ]}
      />
    </div>
  );
}
