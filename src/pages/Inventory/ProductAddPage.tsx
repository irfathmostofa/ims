"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/hook/apiClient";
import { toast } from "sonner";
import SimpleImageUploader from "@/hook/imageUploader";
import CategoryTree from "@/components/ui/CategoryTree";
import { useNavigate } from "react-router-dom";

type Category = {
  id: number;
  code: string;
  name: string;
  parent_id?: number | null;
  image?: string | null;
  status?: string | null;
};

type UOM = {
  id: number;
  code: string;
  name: string;
  symbol: string;
  description: string;
  created_by: string;
  created_at: string;
  updated_by: string;
  updated_at: string;
};

type Variation = {
  id: number;
  name?: string;
  additional_price?: number;
  primary?: boolean;
};

type ProductImage = {
  url: string;
  alt_text: string;
  is_primary: boolean;
};

export default function ProductAddPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [costPrice, setCostPrice] = useState<number | "">("");
  const [sellingPrice, setSellingPrice] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [uoms, setUoms] = useState<UOM[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedUom, setSelectedUom] = useState<number | "">("");

  const [variations, setVariations] = useState<Variation[]>([]);

  const [images, setImages] = useState<ProductImage[]>([]);
  const router = useNavigate();
  // ✅ Fetch categories & uoms
  const fetchData = async () => {
    try {
      const datauom = await apiClient(
        `${import.meta.env.VITE_SERVER}/product/get-uom`,
        { method: "GET", tokenType: "jwt" }
      );
      const datacat = await apiClient(
        `${import.meta.env.VITE_SERVER}/product/get-product-cat`,
        { method: "GET", tokenType: "jwt" }
      );
      setUoms(datauom.data);
      setCategories(datacat.data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to fetch product setup data");
    } finally {
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ toggle categories
  const toggleCategory = (catId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  // ✅ variations
  const addVariation = () =>
    setVariations((prev) => [...prev, { id: Date.now() }]);

  const removeVariation = (id: number) =>
    setVariations((prev) => prev.filter((v) => v.id !== id));

  // ✅ barcodes

  // ✅ images
  const handleAddImage = (url: string) => {
    setImages((prev) => [
      ...prev,
      {
        url,
        alt_text: `Product Image ${prev.length + 1}`,
        is_primary: prev.length === 0,
      },
    ]);
  };

  // ✅ publish
  const handlePublish = async () => {
    setLoading(true); // start loader
    try {
      const product = {
        uom_id: selectedUom,
        name,
        description,
        cost_price: costPrice,
        selling_price: sellingPrice,
        categories: selectedCategories.map((id, index) => ({
          id,
          is_primary: index === 0,
        })),
        variants: variations.map((v) => ({
          name: v.name,
          additional_price: v.additional_price ?? 0,
        })),

        images: images.map((img, index) => ({
          url: img.url || img,
          alt_text: img.alt_text || "Product Image",
          is_primary: index === 0,
        })),
      };

      const data = await apiClient(
        `${import.meta.env.VITE_SERVER}/product/products`,
        { method: "POST", data: product, tokenType: "jwt" }
      );

      toast.success(data.message || "Product Published Successfully");
      router("/inventory/products");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || " Failed to publish product");
    } finally {
      setLoading(false); // stop loader
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-bw-900">Add New Product</h1>

      <div className="flex gap-6">
        {/* LEFT */}
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

          {/* Tabs */}
          <Tabs defaultValue="general" className="mt-6">
            <TabsList className="rounded-lg p-1">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="variations">Variations</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
            </TabsList>

            {/* General */}
            <TabsContent value="general" className="space-y-4 mt-4 flex gap-2 ">
              <div>
                <Label>Cost Price ($)</Label>
                <Input
                  type="number"
                  value={costPrice}
                  onChange={(e) =>
                    setCostPrice(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                />
              </div>
              <div>
                <Label>Selling Price ($)</Label>
                <Input
                  type="number"
                  value={sellingPrice}
                  onChange={(e) =>
                    setSellingPrice(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                />
              </div>
            </TabsContent>

            {/* Variations */}
            <TabsContent value="images" className="space-y-4 mt-4">
              <div className="border rounded-md p-4">
                <h3 className="font-semibold mb-2">Product Images</h3>
                {/* Uploader */}{" "}
                <SimpleImageUploader onChange={handleAddImage} />
                {/* Thumbnails */}
                <div className="grid grid-cols-4 gap-3 mt-4 ">
                  {images.map((img, i) => (
                    <div
                      key={i}
                      className={`relative group rounded-md overflow-hidden border ${
                        img.is_primary ? "ring-2 ring-blue-500" : ""
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.alt_text}
                        className="h-24 w-full object-cover"
                      />

                      {/* Overlay actions */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex gap-2 items-center justify-center transition">
                        <button
                          onClick={() =>
                            setImages((prev) =>
                              prev.filter((_, idx) => idx !== i)
                            )
                          }
                          className="px-2 py-1 bg-red-500 text-white text-xs rounded"
                        >
                          Remove
                        </button>
                        {!img.is_primary && (
                          <button
                            onClick={() =>
                              setImages((prev) =>
                                prev.map((x, idx) => ({
                                  ...x,
                                  is_primary: idx === i,
                                }))
                              )
                            }
                            className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
                          >
                            Make Primary
                          </button>
                        )}
                      </div>

                      {/* Primary badge */}
                      {img.is_primary && (
                        <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                          Primary
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="variations" className="space-y-4 mt-4">
              {variations.map((v) => (
                <div
                  key={v.id}
                  className="p-3 border rounded-md grid grid-cols-3 gap-2"
                >
                  <Input
                    placeholder="Variation Name"
                    value={v.name ?? ""}
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
                    placeholder="Additional Price"
                    value={v.additional_price ?? ""}
                    onChange={(e) =>
                      setVariations((prev) =>
                        prev.map((x) =>
                          x.id === v.id
                            ? {
                                ...x,
                                additional_price: Number(e.target.value),
                              }
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
              <Button onClick={addVariation} className="bw-primary">
                Add Variation
              </Button>
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT */}
        <div className="w-80 space-y-4">
          {/* Publish */}
          <div className="border rounded-md p-4 bg-gray-50">
            <h3 className="font-semibold mb-2">Publish</h3>
            <div className="flex justify-between">
              <Button variant="outline">Save Draft</Button>
              <button
                onClick={handlePublish}
                disabled={loading}
                className="px-4 py-2 bw-primary rounded-lg disabled:opacity-50"
              >
                {loading ? "Publishing..." : "Publish Product"}
              </button>
            </div>
          </div>

          {/* Categories */}
          {/* Categories */}
          <div className="border rounded-md p-2 bg-white">
            <h3 className="font-semibold mb-2">Categories</h3>
            <div className="overflow-auto max-h-72">
              <CategoryTree
                categories={categories}
                selectedCategories={selectedCategories}
                toggleCategory={toggleCategory}
              />
            </div>
          </div>

          <div className="border rounded-md p-2">
            <Label>UOM</Label>
            <select
              className="w-full border rounded-md p-2"
              value={selectedUom}
              onChange={(e) =>
                setSelectedUom(e.target.value ? Number(e.target.value) : "")
              }
            >
              <option value="">-- Select UOM --</option>
              {uoms?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
