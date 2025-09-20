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
import * as XLSX from "xlsx";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

const demoCategories = ["Beverages", "Snacks", "Dairy", "Bakery", "Fruits"];
const demoUnits = ["Piece", "Pack", "Kg", "Bottle", "Carton", "Loaf"];

type Variation = {
  id: number;
  name?: string;
  price?: number;
  stock?: number;
  images?: File[];
  primary?: boolean;
};

type Product = {
  id: number;
  name: string;
  category?: string;
  unit?: string;
  price?: number;
  stock?: number;
  barcode?: string;
  images?: File[];
  variations?: Variation[];
};

export default function ProductAddPage() {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [unit, setUnit] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [barcode, setBarcode] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [showVariations, setShowVariations] = useState(false);

  const [bulkProducts, setBulkProducts] = useState<Product[]>([]);
  const [bulkErrors, setBulkErrors] = useState<string[]>([]);

  // --- Handle Image Upload ---
  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    variationId?: number
  ) => {
    const filesArray = e.target.files ? Array.from(e.target.files) : [];
    if (variationId) {
      setVariations((prev) =>
        prev.map((v) =>
          v.id === variationId ? { ...v, images: filesArray } : v
        )
      );
    } else {
      setImages(filesArray);
    }
  };

  // --- Bulk Upload ---
  const handleBulkUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(sheet);

      const parsed: Product[] = [];
      const errors: string[] = [];

      json.forEach((row, idx) => {
        const rowNumber = idx + 2;
        const pName = row["name"]?.trim();
        const pCategory = row["category"]?.trim();
        const pUnit = row["unit"]?.trim();
        const pPrice = Number(row["price"]);
        const pStock = Number(row["stock"]);
        const pBarcode = row["barcode"]?.trim();

        if (!pName) errors.push(`Row ${rowNumber}: Missing product name`);

        parsed.push({
          id: Date.now() + idx,
          name: pName,
          category: pCategory,
          unit: pUnit,
          price: !isNaN(pPrice) ? pPrice : undefined,
          stock: !isNaN(pStock) ? pStock : undefined,
          barcode: pBarcode,
        });
      });

      setBulkProducts(parsed);
      setBulkErrors(errors);
    };

    reader.readAsArrayBuffer(file);
  };

  // --- Variation Handlers ---
  const addVariation = () => {
    setVariations((prev) => [
      ...prev,
      { id: Date.now(), primary: prev.length === 0 },
    ]);
  };

  const removeVariation = (id: number) => {
    setVariations((prev) => prev.filter((v) => v.id !== id));
  };

  const togglePrimary = (id: number) => {
    setVariations((prev) => prev.map((v) => ({ ...v, primary: v.id === id })));
  };

  const handleSaveProduct = () => {
    const product: Product = {
      id: Date.now(),
      name,
      category,
      unit,
      price: price === "" ? undefined : Number(price),
      stock: stock === "" ? undefined : Number(stock),
      barcode,
      images,
      variations,
    };
    console.log("Saved Product:", product);
    alert("Product saved!");
  };

  return (
    <div className="p-6 max-w-full mx-auto space-y-6">
      <div className="flex items-center justify-between">
        {" "}
        <h1 className="text-2xl font-bold text-bw-900">Add New Product</h1>
        {/* Bulk Upload Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="btn-bw-primary">Bulk Upload (Excel/CSV)</Button>
          </DialogTrigger>
          <DialogContent className="bg-amber-50">
            <Input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={(e) =>
                e.target.files && handleBulkUpload(e.target.files[0])
              }
            />
            {bulkErrors.length > 0 && (
              <div className="text-red-500 mt-2">
                {bulkErrors.map((err, i) => (
                  <p key={i}>{err}</p>
                ))}
              </div>
            )}
            {bulkProducts.length > 0 && (
              <div className="mt-2">
                <h2 className="font-semibold">Preview</h2>
                <ul className="list-disc list-inside text-sm">
                  {bulkProducts.slice(0, 5).map((p) => (
                    <li key={p.id}>
                      {p.name} ({p.category})
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={() => alert("Verify complete!")}>Verify</Button>
              <Button onClick={() => alert("Uploaded products added!")}>
                Upload
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Product Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="name">Product Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <Label>Category</Label>
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

        <div className="space-y-1">
          <Label>Unit</Label>
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

        <div className="space-y-1">
          <Label>Price ($)</Label>
          <Input
            type="number"
            value={price}
            onChange={(e) =>
              setPrice(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </div>

        <div className="space-y-1">
          <Label>Stock</Label>
          <Input
            type="number"
            value={stock}
            onChange={(e) =>
              setStock(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
        </div>

        <div className="space-y-1">
          <Label>Barcode</Label>
          <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} />
        </div>

        <div className="md:col-span-2 space-y-1">
          <Label>Images</Label>
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

      {/* Variations */}
      <div className="space-y-2 mt-4">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showVariations}
            onChange={(e) => setShowVariations(e.target.checked)}
            className="h-4 w-4 accent-green-500"
            id="enable-variations"
          />
          <label htmlFor="enable-variations">Enable Variations</label>
        </div>

        {showVariations && (
          <div className="space-y-3 border rounded p-3 bg-gray-50">
            {variations.map((v, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end"
              >
                <Input
                  placeholder="Variation Name"
                  value={v.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setVariations((prev) =>
                      prev.map((x) => (x.id === v.id ? { ...x, name } : x))
                    );
                  }}
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={v.price}
                  onChange={(e) => {
                    const price =
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value);
                    setVariations((prev) =>
                      prev.map((x) => (x.id === v.id ? { ...x, price } : x))
                    );
                  }}
                />
                <Input
                  type="number"
                  placeholder="Stock"
                  value={v.stock}
                  onChange={(e) => {
                    const stock =
                      e.target.value === ""
                        ? undefined
                        : Number(e.target.value);
                    setVariations((prev) =>
                      prev.map((x) => (x.id === v.id ? { ...x, stock } : x))
                    );
                  }}
                />
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, v.id)}
                />
                <div className="flex items-center gap-2">
                  <label>Primary</label>
                  <Switch
                    checked={v.primary}
                    onCheckedChange={() => togglePrimary(v.id)}
                  />
                </div>
                <Button
                  variant="destructive"
                  onClick={() => removeVariation(v.id)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button onClick={addVariation}>Add Variation</Button>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSaveProduct}>Save Product</Button>
      </div>
    </div>
  );
}
