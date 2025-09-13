"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { products as demoProducts } from "@/data/dummyProducts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Product = {
  id: number;
  name: string;
  category: string;
  unit?: string;
  price: number;
  stock: number;
  barcode: string;
  images?: string[];
  brand?: string;
  branch?: string;
  details?: string;
};

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<Partial<Product>>({});
  const [images, setImages] = useState<File[]>([]);

  // Load product
  useEffect(() => {
    if (!id) return;
    const prod = demoProducts.find((p) => p.id === Number(id)) || null;
    if (prod) {
      setProduct(prod);
      setForm(prod);
    }
  }, [id]);

  const handleChange = (field: keyof Product, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updated Product:", form, "New Images:", images);
    navigate("/products"); // redirect back to product list
  };

  if (!product)
    return <p className="p-6 text-center">Product not found or loading...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Edit Product</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input
                value={form.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={form.category || ""}
                onChange={(e) => handleChange("category", e.target.value)}
                required
              />
            </div>

            {/* Brand */}
            <div className="space-y-2">
              <Label>Brand</Label>
              <Input
                value={form.brand || ""}
                onChange={(e) => handleChange("brand", e.target.value)}
              />
            </div>

            {/* Branch */}
            <div className="space-y-2">
              <Label>Branch</Label>
              <Input
                value={form.branch || ""}
                onChange={(e) => handleChange("branch", e.target.value)}
              />
            </div>

            {/* Unit */}
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input
                value={form.unit || ""}
                onChange={(e) => handleChange("unit", e.target.value)}
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                type="number"
                value={form.price || 0}
                onChange={(e) => handleChange("price", Number(e.target.value))}
              />
            </div>

            {/* Stock */}
            <div className="space-y-2">
              <Label>Stock</Label>
              <Input
                type="number"
                value={form.stock || 0}
                onChange={(e) => handleChange("stock", Number(e.target.value))}
              />
            </div>

            {/* Barcode */}
            <div className="space-y-2">
              <Label>Barcode</Label>
              <Input
                value={form.barcode || ""}
                onChange={(e) => handleChange("barcode", e.target.value)}
                required
              />
            </div>

            {/* Details */}
            <div className="space-y-2">
              <Label>Details</Label>
              <Textarea
                value={form.details || ""}
                onChange={(e) => handleChange("details", e.target.value)}
              />
            </div>

            {/* Images */}
            <div className="space-y-2">
              <Label>Product Images</Label>
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
              />
              <div className="flex gap-2 mt-2 flex-wrap">
                {form.images &&
                  form.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Existing ${idx}`}
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

            {/* Submit */}
            <div className="pt-4">
              <Button type="submit">Update Product</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
