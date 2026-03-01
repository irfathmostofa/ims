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
import { Info, Image as ImageIcon, Package } from "lucide-react";
import CustomInput from "@/components/ui/custom/customInput";
import CustomSelect from "@/components/ui/custom/customSelect";

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
  weight?: number;
  weight_unit?: string;
  is_replaceable?: boolean;
  sku?: string;
  images?: ProductImage[];
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
  const [regularPrice, setRegularPrice] = useState<number | "">("");
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [uoms, setUoms] = useState<UOM[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedUom, setSelectedUom] = useState<number | "">("");

  const [variations, setVariations] = useState<Variation[]>([]);
  const router = useNavigate();

  // Fetch categories & uoms
  const fetchData = async () => {
    try {
      const datauom = await apiClient(
        `${import.meta.env.VITE_SERVER}/product/get-uom`,
        { method: "GET", tokenType: "jwt" },
      );
      const datacat = await apiClient(
        `${import.meta.env.VITE_SERVER}/product/get-product-cat`,
        { method: "GET", tokenType: "jwt" },
      );
      setUoms(datauom.data);
      setCategories(datacat.data);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to fetch product setup data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const toggleCategory = (catId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId],
    );
  };

  const addVariation = () =>
    setVariations((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        additional_price: 0,
        weight: 0,
        weight_unit: "kg",
        is_replaceable: false,
        sku: "",
        images: [],
      },
    ]);

  const removeVariation = (id: number) =>
    setVariations((prev) => prev.filter((v) => v.id !== id));

  // Handle image upload for specific variation
  const handleAddImageToVariation = (varId: number, url: string) => {
    setVariations((prev) =>
      prev.map((v) =>
        v.id === varId
          ? {
              ...v,
              images: [
                ...(v.images || []),
                {
                  url,
                  alt_text: `${v.name || "Variant"} Image ${
                    (v.images?.length || 0) + 1
                  }`,
                  is_primary: (v.images?.length || 0) === 0,
                },
              ],
            }
          : v,
      ),
    );
  };

  // Remove image from variation
  const handleRemoveImage = (varId: number, imgIndex: number) => {
    setVariations((prev) =>
      prev.map((v) =>
        v.id === varId
          ? {
              ...v,
              images: v.images?.filter((_, idx) => idx !== imgIndex),
            }
          : v,
      ),
    );
  };

  // Make image primary for variation
  const handleMakePrimary = (varId: number, imgIndex: number) => {
    setVariations((prev) =>
      prev.map((v) =>
        v.id === varId
          ? {
              ...v,
              images: v.images?.map((img, idx) => ({
                ...img,
                is_primary: idx === imgIndex,
              })),
            }
          : v,
      ),
    );
  };

  // Validation
  const validateForm = () => {
    if (!name.trim()) {
      toast.error("Please enter a product name");
      return false;
    }
    if (!selectedUom) {
      toast.error("Please select a unit of measure (UOM)");
      return false;
    }
    if (costPrice === "" || costPrice <= 0) {
      toast.error("Please enter a valid cost price");
      return false;
    }
    if (sellingPrice === "" || sellingPrice <= 0) {
      toast.error("Please enter a valid selling price");
      return false;
    }
    if (selectedCategories.length === 0) {
      toast.error("Please select at least one category");
      return false;
    }
    return true;
  };

  // publish
  const handlePublish = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Prepare variants data
      const variantsData = variations.map((v) => ({
        name: v.name || name, // Use product name if variant name is empty
        additional_price: v.additional_price ?? 0,
        weight: v.weight ?? 0,
        weight_unit: v.weight_unit || "kg",
        is_replaceable: v.is_replaceable || false,
        sku: v.sku || "",
        images: (v.images || []).map((img) => ({
          url: img.url,
          alt_text: img.alt_text || "Product Image",
          is_primary: img.is_primary,
        })),
      }));

      const product = {
        uom_id: selectedUom,
        name,
        description,
        cost_price: costPrice,
        selling_price: sellingPrice,
        regular_price: regularPrice || sellingPrice,
        categories: selectedCategories.map((id, index) => ({
          id,
          is_primary: index === 0,
        })),
        variants: variantsData,
      };

      const data = await apiClient(
        `${import.meta.env.VITE_SERVER}/product/products`,
        { method: "POST", data: product, tokenType: "jwt" },
      );

      toast.success(data.message || "Product published successfully! 🎉");
      router("/inventory/products");
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.message || "Failed to publish product. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-600 mt-1">
          Create a new product with variants and images
        </p>
      </div>

      <div className="flex gap-6">
        {/* LEFT */}
        <div className="flex-1 space-y-6">
          {/* Title */}
          <div>
            <Label className="text-base font-semibold mb-2">
              Product Name *
            </Label>
            <Input
              placeholder="Enter product name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-lg"
            />
          </div>

          {/* Description */}
          <div>
            <Label className="text-base font-semibold mb-2">Description</Label>
            <textarea
              placeholder="Write a detailed product description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-md p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Tabs */}
          <Tabs defaultValue="general" className="mt-2">
            <TabsList className="rounded-lg p-1 bg-gray-100">
              <TabsTrigger value="general" className="gap-2">
                <Package className="w-4 h-4" />
                General Info
              </TabsTrigger>
              <TabsTrigger value="variations" className="gap-2">
                <ImageIcon className="w-4 h-4" />
                Variations & Images
              </TabsTrigger>
            </TabsList>

            {/* General */}
            <TabsContent value="general" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Cost Price * ($)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={costPrice}
                    onChange={(e) =>
                      setCostPrice(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Selling Price * ($)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={sellingPrice}
                    onChange={(e) =>
                      setSellingPrice(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Regular Price ($)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={regularPrice}
                    onChange={(e) =>
                      setRegularPrice(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Unit of Measure (UOM) *</Label>
                  <select
                    className="w-full border rounded-md p-2 mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={selectedUom}
                    onChange={(e) =>
                      setSelectedUom(
                        e.target.value ? Number(e.target.value) : "",
                      )
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
            </TabsContent>

            {/* Variations */}
            <TabsContent value="variations" className="space-y-4 mt-2">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 mb-4">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">About Variations</p>
                  <p className="text-xs">
                    If you don't add variations, a default variant will be
                    created automatically. Each variation can have its own
                    images and additional price.
                  </p>
                </div>
              </div>

              {variations.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-4">No variations yet</p>
                  <Button onClick={addVariation} className="btn-bw-primary">
                    Add First Variation
                  </Button>
                </div>
              ) : (
                <>
                  {variations.map((v, vIndex) => (
                    <div
                      key={v.id}
                      className="p-4 border rounded-lg bg-white shadow-sm space-y-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">
                          Variation #{vIndex + 1}
                        </h4>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => removeVariation(v.id)}
                        >
                          Remove
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-3 items-center">
                        <div>
                          <Label>Variation Name</Label>
                          <Input
                            placeholder="e.g., Small, Red, 500ml"
                            value={v.name ?? ""}
                            onChange={(e) =>
                              setVariations((prev) =>
                                prev.map((x) =>
                                  x.id === v.id
                                    ? { ...x, name: e.target.value }
                                    : x,
                                ),
                              )
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label>Additional Price ($)</Label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={v.additional_price ?? ""}
                            onChange={(e) =>
                              setVariations((prev) =>
                                prev.map((x) =>
                                  x.id === v.id
                                    ? {
                                        ...x,
                                        additional_price: Number(
                                          e.target.value,
                                        ),
                                      }
                                    : x,
                                ),
                              )
                            }
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <CustomInput
                            label="Weight"
                            type="number"
                            placeholder="0.00"
                            value={v.weight ?? ""}
                            onChange={(e) =>
                              setVariations((prev) =>
                                prev.map((x) =>
                                  x.id === v.id
                                    ? {
                                        ...x,
                                        weight: Number(e.target.value),
                                      }
                                    : x,
                                ),
                              )
                            }
                          />
                        </div>
                        <div>
                          <CustomSelect
                            label="Weight Unit"
                            options={[
                              { value: "kg", label: "Kilogram (kg)" },
                              { value: "g", label: "Gram (g)" },
                              { value: "lb", label: "Pound (lb)" },
                              { value: "oz", label: "Ounce (oz)" },
                            ]}
                            value={v.weight_unit ?? ""}
                            onChange={(value) =>
                              setVariations((prev) =>
                                prev.map((x) =>
                                  x.id === v.id
                                    ? { ...x, weight_unit: String(value) }
                                    : x,
                                ),
                              )
                            }
                          />
                        </div>
                        <div>
                          <CustomInput
                            label="SKU"
                            placeholder="Enter SKU"
                            value={v.sku ?? ""}
                            onChange={(e) =>
                              setVariations((prev) =>
                                prev.map((x) =>
                                  x.id === v.id
                                    ? { ...x, sku: e.target.value }
                                    : x,
                                ),
                              )
                            }
                          />
                        </div>
                        <div>
                          <div className="mt-1">
                            <input
                              type="checkbox"
                              checked={v.is_replaceable || false}
                              onChange={(e) =>
                                setVariations((prev) =>
                                  prev.map((x) =>
                                    x.id === v.id
                                      ? {
                                          ...x,
                                          is_replaceable: e.target.checked,
                                        }
                                      : x,
                                  ),
                                )
                              }
                              className="mr-2"
                            />
                            <span>Allow this variation to be replaceable</span>
                          </div>
                        </div>
                      </div>

                      {/* Images for this variation */}
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-sm font-semibold">
                            Images for this variation
                          </Label>
                          <SimpleImageUploader
                            onChange={(url: string) =>
                              handleAddImageToVariation(v.id, url)
                            }
                          />
                        </div>

                        {!v.images || v.images.length === 0 ? (
                          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                            <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600">
                              No images yet
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-4 gap-3">
                            {v.images.map((img, i) => (
                              <div
                                key={i}
                                className={`relative group rounded-lg overflow-hidden border-2 ${
                                  img.is_primary
                                    ? "ring-2 ring-blue-500 border-blue-500"
                                    : "border-gray-200"
                                }`}
                              >
                                <img
                                  src={img.url}
                                  alt={img.alt_text}
                                  className="h-24 w-full object-cover"
                                />

                                {/* Overlay actions */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col gap-1 items-center justify-center transition-opacity">
                                  <button
                                    onClick={() => handleRemoveImage(v.id, i)}
                                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded"
                                  >
                                    Remove
                                  </button>
                                  {!img.is_primary && (
                                    <button
                                      onClick={() => handleMakePrimary(v.id, i)}
                                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded"
                                    >
                                      Set Primary
                                    </button>
                                  )}
                                </div>

                                {/* Primary badge */}
                                {img.is_primary && (
                                  <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                                    Primary
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <Button
                    onClick={addVariation}
                    variant="outline"
                    className="w-full border-dashed border-2"
                  >
                    + Add Another Variation
                  </Button>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* RIGHT */}
        <div className="w-80 space-y-4">
          {/* Publish */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h3 className="font-semibold mb-3 text-gray-900">
              Publish Product
            </h3>

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
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h3 className="font-semibold mb-3 text-gray-900">
              Categories *
              {selectedCategories.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-600">
                  ({selectedCategories.length} selected)
                </span>
              )}
            </h3>
            <div className="overflow-auto max-h-96 border rounded p-2">
              <CategoryTree
                categories={categories}
                selectedCategories={selectedCategories}
                toggleCategory={toggleCategory}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
