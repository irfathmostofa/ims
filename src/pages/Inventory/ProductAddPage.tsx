"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const demoCategories = ["Beverages", "Snacks", "Dairy", "Bakery", "Fruits"];
const demoUnits = ["Piece", "Pack", "Kg", "Bottle", "Carton", "Loaf"];

export default function ProductAddPage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [barcode, setBarcode] = useState("");
  const [images, setImages] = useState<File[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);
    setImages(filesArray);
  };

  const handleSave = () => {
    if (
      !name ||
      !category ||
      !unit ||
      price === "" ||
      stock === "" ||
      !barcode
    ) {
      alert("Please fill all required fields (including barcode).");
      return;
    }

    const newProduct = {
      id: Date.now(),
      name,
      category,
      unit,
      price: Number(price),
      stock: Number(stock),
      barcode,
      images,
    };

    console.log("Product Saved:", newProduct);
    alert("Product added successfully!");

    // Reset form
    setName("");
    setCategory("");
    setUnit("");
    setPrice("");
    setStock("");
    setBarcode("");
    setImages([]);
  };

  return (
    <div className="p-6 max-w-full mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-bw-900">Add New Product</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Product Name */}
        <div className="space-y-1">
          <Label htmlFor="name">Product Name *</Label>
          <Input
            id="name"
            placeholder="Enter product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="space-y-1">
          <Label>Category *</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {demoCategories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Unit */}
        <div className="space-y-1">
          <Label>Unit / UOM *</Label>
          <Select value={unit} onValueChange={setUnit}>
            <SelectTrigger>
              <SelectValue placeholder="Select Unit" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {demoUnits.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Price */}
        <div className="space-y-1">
          <Label htmlFor="price">Price ($) *</Label>
          <Input
            type="number"
            id="price"
            placeholder="Enter price"
            value={price}
            onChange={(e) =>
              setPrice(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </div>

        {/* Stock */}
        <div className="space-y-1">
          <Label htmlFor="stock">Stock Quantity *</Label>
          <Input
            type="number"
            id="stock"
            placeholder="Enter stock quantity"
            value={stock}
            onChange={(e) =>
              setStock(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </div>

        {/* Barcode */}
        <div className="space-y-1">
          <Label htmlFor="barcode">Barcode *</Label>
          <Input
            id="barcode"
            placeholder="Enter barcode"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
          />
        </div>

        {/* Images */}
        <div className="md:col-span-2 space-y-1">
          <Label>Product Images</Label>
          <Input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
          />
          {images.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {images.map((img, idx) => (
                <img
                  key={idx}
                  src={URL.createObjectURL(img)}
                  alt={img.name}
                  className="h-24 w-24 object-cover rounded-md border"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSave}>Save Product</Button>
      </div>
    </div>
  );
}
