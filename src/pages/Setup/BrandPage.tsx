"use client";

import { useEffect, useState } from "react";
import { Pen, Trash, Plus } from "lucide-react";
import { DataTable } from "@/components/ui/dataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useCrud } from "@/hook/crudHelper";
import { toast } from "sonner";
import ImageUploader2 from "@/hook/ImageUploader2";
import { formatDate } from "@/components/utils/formatter";

type Brand = {
  id: number;
  code: string;
  name: string;
  slug: string;
  image?: string | null;
  status?: string | null;
  created_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  updated_at: string | null;
};

export default function BrandPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Brand>>({});
  const [loading, setLoading] = useState(false);
  const [update, setUpdate] = useState(0);

  const { fetchAll, save, remove } = useCrud<Brand>({
    listUrl: `${import.meta.env.VITE_SERVER}/product/get-brand`,
    createUrl: `${import.meta.env.VITE_SERVER}/product/create-brand`,
    updateUrl: `${import.meta.env.VITE_SERVER}/product/update-brand`,
    deleteUrl: `${import.meta.env.VITE_SERVER}/product/delete-brand`,
    formatCreate: (data) => ({
      name: data.name,
      slug: data.slug,
      image: data.image,
    }),
    formatUpdate: (data) => ({
      code: data.code,
      name: data.name,
      slug: data.slug,
      image: data.image,
    }),
  });

  useEffect(() => {
    fetchAll(setBrands, setLoading);
  }, [update]);

  const handleSave = async () => {
    if (!form.name) {
      toast.error("Brand name is required");
      return;
    }

    await save(form, form.id);
    setForm({});
    setOpen(false);
    setUpdate((prev) => prev + 1);
  };

  const handleEdit = (c: Brand) => {
    setForm(c);
    setOpen(true);
  };

  const handleDelete = async (c: Brand) => {
    if (!confirm(`Delete Brand "${c.name}"?`)) return;
    await remove(c.id!);
    setUpdate((prev) => prev + 1);
  };

  const handleDialogChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setTimeout(() => setForm({}), 200);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Brand Management</h1>

        <Dialog open={open} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button className="btn-bw-primary">
              <Plus size={16} className="mr-2" /> Add Brand
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {form.id ? "Edit Brand" : "Create New Brand"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 py-4">
              {/* Brand Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Brand Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Electronics, Clothing, Books"
                  value={form.name || ""}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full"
                />
              </div>

              {/* Slug */}
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-sm font-medium">
                  Slug (URL-friendly name)
                </Label>
                <Input
                  id="slug"
                  placeholder="e.g., electronics-clothing-books"
                  value={form.slug || ""}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Auto-generated from name if left empty
                </p>
              </div>

              {/* Brand Image */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Brand Image</Label>

                {/* Single ImageUploader component that handles everything */}
                <ImageUploader2
                  initialImage={form.image}
                  onUploadComplete={(url) => {
                    setForm({ ...form, image: url });
                  }}
                  onRemove={() => {
                    setForm({ ...form, image: null });
                  }}
                  showPreview={true}
                  buttonText="Choose Image"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="btn-bw-primary"
                disabled={!form.name}
              >
                {form.id ? "Update Brand" : "Create Brand"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Data Table */}
      <DataTable
        data={brands}
        label="Brand List"
        showColumns={[
          { key: "code", label: "ID" },
          { key: "name", label: "Name" },
          { key: "slug", label: "Slug" },
          { key: "image", label: "Image" },
          { key: "created_at", label: "Created At" },
        ]}
        selectable
        rowsPerPage={1000}
        loading={loading}
        columnFormats={{
          created_at: (val) => formatDate(val),
        }}
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
