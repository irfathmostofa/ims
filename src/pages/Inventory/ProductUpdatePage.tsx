"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { apiClient } from "@/hook/apiClient";
import { toast } from "sonner";

type Category = {
  id: number;
  name: string;
  is_primary: boolean;
};

type Variant = {
  id: number;
  code: string;
  name: string;
  additional_price: string;
};

type ProductImage = {
  id: number;
  url: string;
  alt_text?: string;
  is_primary: boolean;
};

type Barcode = {
  id: number;
  barcode: string;
  type: string;
  is_primary: boolean;
};

type Product = {
  id: number;
  code: string;
  name: string;
  description: string;
  cost_price: string;
  selling_price: string;
  uom_id: number;
  uom_name: string;
  uom_symbol: string;
  categories: Category[];
  variants: Variant[];
  images: ProductImage[];
  barcodes: { variant_id: number; barcodes: Barcode[] }[];
};

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>({});
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiClient(
        `${import.meta.env.VITE_SERVER}/product/products/${id}`,
        { method: "GET", tokenType: "jwt" }
      );

      if (res.data) {
        setProduct(res.data);
        setForm(res.data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to fetch product details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (field: keyof Product, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();

      // append simple fields
      formData.append("name", form?.name || "");
      formData.append("description", form?.description || "");
      formData.append("cost_price", form?.cost_price || "");
      formData.append("selling_price", form?.selling_price || "");
      formData.append("uom_id", String(form?.uom_id || ""));

      // append categories
      if (form.categories) {
        form.categories.forEach((cat, idx) => {
          formData.append(`categories[${idx}][id]`, String(cat.id));
          formData.append(
            `categories[${idx}][is_primary]`,
            String(cat.is_primary)
          );
        });
      }

      // append variants
      if (form.variants) {
        form.variants.forEach((variant, idx) => {
          formData.append(`variants[${idx}][id]`, String(variant.id));
          formData.append(`variants[${idx}][name]`, variant.name);
          formData.append(
            `variants[${idx}][additional_price]`,
            variant.additional_price
          );
        });
      }

      // append barcodes
      if (form.barcodes) {
        form.barcodes.forEach((group, gIdx) => {
          group.barcodes.forEach((barcode, bIdx) => {
            formData.append(
              `barcodes[${gIdx}][barcodes][${bIdx}][id]`,
              String(barcode.id)
            );
            formData.append(
              `barcodes[${gIdx}][barcodes][${bIdx}][barcode]`,
              barcode.barcode
            );
            formData.append(
              `barcodes[${gIdx}][barcodes][${bIdx}][type]`,
              barcode.type
            );
          });
        });
      }

      // append images
      images.forEach((file) => {
        formData.append("images", file);
      });

      const res = await apiClient(
        `${import.meta.env.VITE_SERVER}/product/products/${id}`,
        {
          method: "PUT",
          tokenType: "jwt",
          data: formData,
        }
      );

      if (res.success) {
        toast.success("Product updated successfully!");
        navigate("/products");
      } else {
        toast.error(res.message || "Update failed");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Something went wrong during update");
    } finally {
      setLoading(false);
    }
  };

  if (!product)
    return <p className="p-6 text-center">Product not found or loading...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Product Name</Label>
                <Input
                  value={form.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>Cost Price</Label>
                <Input
                  type="number"
                  value={form.cost_price || ""}
                  onChange={(e) => handleChange("cost_price", e.target.value)}
                />
              </div>

              <div>
                <Label>Selling Price</Label>
                <Input
                  type="number"
                  value={form.selling_price || ""}
                  onChange={(e) =>
                    handleChange("selling_price", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Unit</Label>
                <Input value={form.uom_name || ""} disabled />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>

            {/* Categories */}
            <div>
              <Label>Categories</Label>
              <div className="flex gap-2 flex-wrap">
                {form.categories?.map((cat) => (
                  <span
                    key={cat.id}
                    className="px-3 py-1 bg-gray-100 rounded text-sm"
                  >
                    {cat.name} {cat.is_primary && "(Primary)"}
                  </span>
                ))}
              </div>
            </div>

            {/* Variants */}
            <div>
              <Label>Variants</Label>
              <div className="space-y-2">
                {form.variants?.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex gap-4 items-center border p-2 rounded"
                  >
                    <Input
                      value={variant.name}
                      onChange={(e) => {
                        const updated = form.variants?.map((v) =>
                          v.id === variant.id
                            ? { ...v, name: e.target.value }
                            : v
                        );
                        handleChange("variants", updated);
                      }}
                    />
                    <Input
                      type="number"
                      value={variant.additional_price}
                      onChange={(e) => {
                        const updated = form.variants?.map((v) =>
                          v.id === variant.id
                            ? { ...v, additional_price: e.target.value }
                            : v
                        );
                        handleChange("variants", updated);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Barcodes */}
            <div>
              <Label>Barcodes</Label>
              {form.barcodes?.map((group) => (
                <div key={group.variant_id} className="space-y-2">
                  <p className="text-sm font-semibold">
                    Variant ID: {group.variant_id}
                  </p>
                  {group.barcodes.map((barcode) => (
                    <div
                      key={barcode.id}
                      className="flex gap-2 items-center border p-2 rounded"
                    >
                      <Input value={barcode.barcode} readOnly />
                      <span className="text-xs">{barcode.type}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Images */}
            <div>
              <Label>Product Images</Label>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
              />
              <div className="flex gap-2 mt-2 flex-wrap">
                {form.images?.map((img) => (
                  <img
                    key={img.id}
                    src={img.url}
                    alt={img.alt_text || "Product Image"}
                    className="h-20 w-20 object-cover border rounded"
                  />
                ))}
                {images.map((file, idx) => (
                  <img
                    key={idx}
                    src={URL.createObjectURL(file)}
                    alt={`New ${idx}`}
                    className="h-20 w-20 object-cover border rounded"
                  />
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Product"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
