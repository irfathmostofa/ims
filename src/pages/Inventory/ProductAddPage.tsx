"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Variation = {
  id: number;
  name?: string;
  price?: number;
  stock?: number;
  images?: File[];
  primary?: boolean;
};

const demoCategories = [
  "Beverages",
  "Snacks",
  "Dairy",
  "Bakery",
  "Fruits",
  "Vegetables",
];

export default function ProductAddPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [stock, setStock] = useState<number | "">("");
  const [barcode, setBarcode] = useState("");
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const addVariation = () =>
    setVariations((prev) => [
      ...prev,
      { id: Date.now(), primary: prev.length === 0 },
    ]);

  const removeVariation = (id: number) =>
    setVariations((prev) => prev.filter((v) => v.id !== id));

  const handlePublish = () => {
    const product = {
      name,
      description,
      price,
      stock,
      barcode,
      categories: selectedCategories,
      featuredImage,
      gallery,
      variations,
    };
    console.log("Published Product:", product);
    alert("Product Published!");
  };

  return (
    <div className="p-6">
      {/* Page Title */}
      <h1 className="text-3xl font-bold mb-6 text-bw-900">Add New Product</h1>

      <div className="flex gap-6">
        {/* LEFT SIDE - Main Form */}
        <div className="flex-1 space-y-6">
          {/* Title */}
          <Input
            placeholder="Product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="text-2xl font-semibold"
          />

          {/* Description */}
          <textarea
            placeholder="Write product description here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded-md p-2 h-32"
          />

          {/* Product Data Tabs */}
          <Tabs defaultValue="general" className="mt-6">
            <TabsList className="bg-gray-100 rounded-lg p-1">
              <TabsTrigger
                value="general"
                className="px-4 py-2 rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                General
              </TabsTrigger>
              <TabsTrigger
                value="inventory"
                className="px-4 py-2 rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Inventory
              </TabsTrigger>
              <TabsTrigger
                value="variations"
                className="px-4 py-2 rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Variations
              </TabsTrigger>
              <TabsTrigger
                value="advanced"
                className="px-4 py-2 rounded-md data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              >
                Advanced
              </TabsTrigger>
            </TabsList>

            {/* General */}
            <TabsContent value="general" className="space-y-4 mt-4">
              <div className=" flex flex-col gap-2">
                <div>
                  <Label>Regular Price ($)</Label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) =>
                      setPrice(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Sale Price ($)</Label>
                  <Input
                    type="number"
                    value={price}
                    onChange={(e) =>
                      setPrice(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                  />
                </div>
              </div>
            </TabsContent>

            {/* Inventory */}
            <TabsContent value="inventory" className="space-y-4 mt-4">
              <div>
                <Label>Stock Quantity</Label>
                <Input
                  type="number"
                  value={stock}
                  onChange={(e) =>
                    setStock(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                />
              </div>
              <div>
                <Label>Barcode/SKU</Label>
                <Input
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                />
              </div>
            </TabsContent>

            {/* Variations */}
            <TabsContent value="variations" className="space-y-4 mt-4">
              {variations.map((v) => (
                <div
                  key={v.id}
                  className="p-3 border rounded-md grid grid-cols-3 gap-2"
                >
                  <Input
                    placeholder="Variation Name"
                    value={v.name}
                    onChange={(e) =>
                      setVariations((prev) =>
                        prev.map((x) =>
                          x.id === v.id ? { ...x, name: e.target.value } : x
                        )
                      )
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Price"
                    value={v.price ?? ""}
                    onChange={(e) =>
                      setVariations((prev) =>
                        prev.map((x) =>
                          x.id === v.id
                            ? { ...x, price: Number(e.target.value) }
                            : x
                        )
                      )
                    }
                  />
                  <Button
                    variant="destructive"
                    onClick={() => removeVariation(v.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button onClick={addVariation}>Add Variation</Button>
            </TabsContent>

            {/* Advanced */}
            <TabsContent value="advanced" className="space-y-4 mt-4">
              <div className="flex items-center gap-2">
                <Label>Enable Reviews</Label>
                <Switch />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT SIDE - Sidebar Meta Boxes */}
        <div className="w-80 space-y-6">
          {/* Publish Box */}
          <div className="border rounded-md p-4 bg-gray-50">
            <h3 className="font-semibold mb-2">Publish</h3>
            <div className="flex justify-between">
              <Button variant="outline">Save Draft</Button>
              <Button
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={handlePublish}
              >
                Publish
              </Button>
            </div>
          </div>

          {/* Categories Box */}
          <div className="border rounded-md p-4">
            <h3 className="font-semibold mb-2">Categories</h3>
            <div className="space-y-1">
              {demoCategories.map((cat) => (
                <label key={cat} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          {/* Featured Image */}
          <div className="border rounded-md p-4">
            <h3 className="font-semibold mb-2">Product Image</h3>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setFeaturedImage(e.target.files?.[0] || null)}
            />
            {featuredImage && (
              <img
                src={URL.createObjectURL(featuredImage)}
                className="mt-2 w-full h-40 object-cover rounded-md"
              />
            )}
          </div>

          {/* Gallery */}
          <div className="border rounded-md p-4">
            <h3 className="font-semibold mb-2">Product Gallery</h3>
            <Input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                setGallery(e.target.files ? Array.from(e.target.files) : [])
              }
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {gallery.map((img, i) => (
                <img
                  key={i}
                  src={URL.createObjectURL(img)}
                  className="h-16 w-16 object-cover rounded-md"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
