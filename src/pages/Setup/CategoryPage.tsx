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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCrud } from "@/hook/crudHelper";
import { toast } from "sonner";
import ImageUploader2 from "@/hook/ImageUploader2";

type Category = {
  id: number;
  code: string;
  name: string;
  slug: string;
  parent_id?: number | null;
  children?: Category[];
  image?: string | null;
  status?: string | null;
  created_at: string | null;
  created_by: string | null;
  updated_by: string | null;
  updated_at: string | null;
};

function flattenCategories(
  categories: Category[],
  parentPath = "",
): (Category & { Parent: string })[] {
  let result: (Category & { Parent: string })[] = [];

  for (const cat of categories) {
    const Parent = parentPath ? `${parentPath} > ${cat.name}` : cat.name;
    result.push({ ...cat, Parent });

    if (cat.children && cat.children.length) {
      result = result.concat(flattenCategories(cat.children, Parent));
    }
  }

  return result;
}

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Category>>({});
  const [loading, setLoading] = useState(false);
  const [update, setUpdate] = useState(0);

  const { fetchAll, save, remove } = useCrud<Category>({
    listUrl: `${import.meta.env.VITE_SERVER}/product/get-product-cat`,
    createUrl: `${import.meta.env.VITE_SERVER}/product/create-product-cat`,
    updateUrl: `${import.meta.env.VITE_SERVER}/product/update-product-cat`,
    deleteUrl: `${import.meta.env.VITE_SERVER}/product/delete-product-cat`,
    formatCreate: (data) => ({
      name: data.name,
      slug: data.slug,
      image: data.image,
      parent_id: data.parent_id,
    }),
    formatUpdate: (data) => ({
      code: data.code,
      name: data.name,
      slug: data.slug,
      image: data.image,
      parent_id: data.parent_id,
    }),
  });

  useEffect(() => {
    fetchAll(setCategories, setLoading);
  }, [update]);

  const handleSave = async () => {
    if (!form.name) {
      toast.error("Category name is required");
      return;
    }

    await save(form, form.id);
    setForm({});
    setOpen(false);
    setUpdate((prev) => prev + 1);
  };

  const handleEdit = (c: Category) => {
    setForm(c);
    setOpen(true);
  };

  const handleDelete = async (c: Category) => {
    if (!confirm(`Delete Category "${c.name}"?`)) return;
    await remove(c.id!);
    setUpdate((prev) => prev + 1);
  };

  const handleDialogChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setTimeout(() => setForm({}), 200);
    }
  };

  const flattened = flattenCategories(categories);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Category Management</h1>

        <Dialog open={open} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button className="btn-bw-primary">
              <Plus size={16} className="mr-2" /> Add Category
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {form.id ? "Edit Category" : "Create New Category"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 py-4">
              {/* Category Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Category Name <span className="text-red-500">*</span>
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

              {/* Parent Category */}
              <div className="space-y-2">
                <Label htmlFor="parent" className="text-sm font-medium">
                  Parent Category
                </Label>
                <Select
                  value={form.parent_id?.toString() || "none"} // Change empty string to "none"
                  onValueChange={(value) =>
                    setForm({
                      ...form,
                      parent_id: value === "none" ? null : Number(value), // Handle "none" case
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a parent category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Top Level)</SelectItem>{" "}
                    {/* Use "none" instead of empty string */}
                    {flattened.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.Parent}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category Image */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Category Image</Label>

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
                {form.id ? "Update Category" : "Create Category"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Data Table */}
      <DataTable
        data={flattened}
        label="Category List"
        showColumns={["code", "name", "Parent", "image"]}
        selectable
        rowsPerPage={10}
        loading={loading}
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
