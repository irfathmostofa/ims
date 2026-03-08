"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { apiClient } from "@/hook/apiClient";
import { toast } from "sonner";
import SimpleImageUploader from "@/hook/imageUploader";
import CategoryTree from "@/components/ui/CategoryTree";
import { useNavigate } from "react-router-dom";
import {
  Info,
  Image as ImageIcon,
  Package,
  Search,
} from "lucide-react";
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

type SeoMeta = {
  id?: number;
  entity_type: string;
  entity_id?: number;
  meta_title: string;
  meta_description: string;
  meta_keywords?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  schema_json?: any;
  is_index: boolean;
  is_follow: boolean;
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

  // SEO States
  const [seoMeta, setSeoMeta] = useState<SeoMeta>({
    entity_type: "product",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    canonical_url: "",
    og_title: "",
    og_description: "",
    og_image: "",
    twitter_title: "",
    twitter_description: "",
    twitter_image: "",
    is_index: true,
    is_follow: true,
  });
  const [showSeoModal, setShowSeoModal] = useState(false);
  const [seoLoading, setSeoLoading] = useState(false);
  const [productSlug, setProductSlug] = useState("");

  // Refs to track if SEO has been manually edited
  const hasManuallyEditedTitle = useRef(false);
  const hasManuallyEditedDesc = useRef(false);

  const router = useNavigate();

  // Function to generate slug from product name
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Update slug when name changes (always update slug regardless of manual edits)
  useEffect(() => {
    if (name) {
      const slug = generateSlug(name);
      setProductSlug(slug);
    } else {
      setProductSlug("");
    }
  }, [name]);

  // Update SEO meta when product name changes (only if not manually edited)
  useEffect(() => {
    if (name && !hasManuallyEditedTitle.current) {
      setSeoMeta((prev) => ({
        ...prev,
        meta_title: name,
        og_title: name,
        twitter_title: name,
      }));
    }
  }, [name]);

  // Update SEO meta when description changes (only if not manually edited)
  useEffect(() => {
    if (description && !hasManuallyEditedDesc.current) {
      const truncatedDesc =
        description.length > 160
          ? description.substring(0, 157) + "..."
          : description;

      setSeoMeta((prev) => ({
        ...prev,
        meta_description: truncatedDesc,
        og_description: truncatedDesc,
        twitter_description: truncatedDesc,
      }));
    }
  }, [description]);

  // Reset manual edit flags when modal opens/closes
  useEffect(() => {
    if (!showSeoModal) {
      // When closing modal, check if SEO fields match product fields
      if (seoMeta.meta_title !== name) {
        hasManuallyEditedTitle.current = true;
      }
      if (seoMeta.meta_description !== description) {
        hasManuallyEditedDesc.current = true;
      }
    }
  }, [
    showSeoModal,
    seoMeta.meta_title,
    seoMeta.meta_description,
    name,
    description,
  ]);

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

  // Handle SEO save
  const handleSaveSeo = async () => {
    setSeoLoading(true);
    try {
      // Mark as manually edited
      if (seoMeta.meta_title !== name) {
        hasManuallyEditedTitle.current = true;
      }
      if (seoMeta.meta_description !== description) {
        hasManuallyEditedDesc.current = true;
      }

      setShowSeoModal(false);
      toast.success("SEO data saved successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to save SEO data");
    } finally {
      setSeoLoading(false);
    }
  };

  // Handle reset to product defaults
  const handleResetToDefaults = () => {
    setSeoMeta((prev) => ({
      ...prev,
      meta_title: name || "",
      meta_description: description
        ? description.length > 160
          ? description.substring(0, 157) + "..."
          : description
        : "",
      og_title: name || "",
      og_description: description
        ? description.length > 160
          ? description.substring(0, 157) + "..."
          : description
        : "",
      twitter_title: name || "",
      twitter_description: description
        ? description.length > 160
          ? description.substring(0, 157) + "..."
          : description
        : "",
    }));
    hasManuallyEditedTitle.current = false;
    hasManuallyEditedDesc.current = false;
    toast.success("Reset to product defaults");
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

      // If product created successfully and we have SEO data, save SEO meta
      if (data.data?.id) {
        try {
          await apiClient(`${import.meta.env.VITE_SERVER}/seo/meta`, {
            method: "POST",
            data: {
              ...seoMeta,
              entity_id: data.data.id,
              entity_type: "product",
            },
            tokenType: "jwt",
          });
        } catch (seoError) {
          console.error("Failed to save SEO data:", seoError);
          // Don't block the success message, just log the error
        }
      }

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
              rows={4}
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
              <TabsTrigger value="seo" className="gap-2">
                <Search className="w-4 h-4" />
                SEO
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
                          variant="destructive"
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
                          <div className="mt-1 flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`replaceable-${v.id}`}
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
                            <Label
                              htmlFor={`replaceable-${v.id}`}
                              className="text-sm"
                            >
                              Allow replacement
                            </Label>
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

            {/* SEO Tab */}
            <TabsContent value="seo" className="space-y-4 mt-2">
              <div className="border rounded-lg p-6 bg-white">
                {/* Preview Card */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">
                    Search Engine Preview
                  </h3>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <p className="text-sm text-green-700 mb-1 break-all">
                      {window.location.origin}/product/
                      {productSlug || "product-slug"}
                    </p>
                    <p className="text-lg text-blue-600 font-medium hover:underline cursor-pointer mb-1 break-words">
                      {seoMeta.meta_title || name || "Product Title"}
                    </p>
                    <p className="text-sm text-gray-600 break-words">
                      {seoMeta.meta_description ||
                        description ||
                        "Product description will appear here..."}
                    </p>
                  </div>
                </div>

                {/* SEO Summary */}
                <div className="space-y-4">
                  <button
                    onClick={() => setShowSeoModal(true)}
                    className="w-full px-4 py-2 btn-bw-primary text-white rounded-lg transition-colors"
                  >
                    Edit SEO
                  </button>
                </div>
              </div>
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
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Publishing..." : "Publish Product"}
              </button>
            </div>
          </div>

          {/* Categories */}
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold text-gray-900">
                Categories
                {selectedCategories.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-600">
                    ({selectedCategories.length} selected)
                  </span>
                )}
              </h3>
              <p
                onClick={() => router("/inventory/categories")}
                className="text-sm font-bold cursor-pointer text-blue-600 hover:text-blue-800"
              >
                Add New
              </p>
            </div>

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

      {/* SEO Modal */}
      {showSeoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b sticky top-0 bg-white">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Edit SEO Meta Data</h2>
                <button
                  onClick={() => setShowSeoModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Reset to Defaults Button */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={handleResetToDefaults}
                  className="text-sm"
                >
                  Reset to Product Defaults
                </Button>
              </div>

              {/* Basic SEO */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Basic SEO
                </h3>

                <div>
                  <Label>Meta Title</Label>
                  <Input
                    value={seoMeta.meta_title}
                    onChange={(e) => {
                      setSeoMeta((prev) => ({
                        ...prev,
                        meta_title: e.target.value,
                      }));
                      hasManuallyEditedTitle.current = true;
                    }}
                    placeholder="Enter meta title"
                    maxLength={60}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {seoMeta.meta_title?.length || 0}/60 characters
                    {seoMeta.meta_title !== name && (
                      <span className="ml-2 text-amber-600">(Customized)</span>
                    )}
                  </p>
                </div>

                <div>
                  <Label>Meta Description</Label>
                  <textarea
                    value={seoMeta.meta_description}
                    onChange={(e) => {
                      setSeoMeta((prev) => ({
                        ...prev,
                        meta_description: e.target.value,
                      }));
                      hasManuallyEditedDesc.current = true;
                    }}
                    placeholder="Enter meta description"
                    maxLength={160}
                    rows={3}
                    className="w-full border rounded-md p-3 mt-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {seoMeta.meta_description?.length || 0}/160 characters
                    {seoMeta.meta_description !== description && (
                      <span className="ml-2 text-amber-600">(Customized)</span>
                    )}
                  </p>
                </div>

                <div>
                  <Label>Meta Keywords</Label>
                  <Input
                    value={seoMeta.meta_keywords}
                    onChange={(e) =>
                      setSeoMeta((prev) => ({
                        ...prev,
                        meta_keywords: e.target.value,
                      }))
                    }
                    placeholder="keyword1, keyword2, keyword3"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separate keywords with commas
                  </p>
                </div>

                <div>
                  <Label>Canonical URL</Label>
                  <Input
                    value={seoMeta.canonical_url}
                    onChange={(e) =>
                      setSeoMeta((prev) => ({
                        ...prev,
                        canonical_url: e.target.value,
                      }))
                    }
                    placeholder="https://example.com/canonical-url"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Open Graph (Facebook) */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Open Graph (Facebook)
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>OG Title</Label>
                    <Input
                      value={seoMeta.og_title}
                      onChange={(e) =>
                        setSeoMeta((prev) => ({
                          ...prev,
                          og_title: e.target.value,
                        }))
                      }
                      placeholder="Open Graph title"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>OG Description</Label>
                    <Input
                      value={seoMeta.og_description}
                      onChange={(e) =>
                        setSeoMeta((prev) => ({
                          ...prev,
                          og_description: e.target.value,
                        }))
                      }
                      placeholder="Open Graph description"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>OG Image URL</Label>
                  <Input
                    value={seoMeta.og_image}
                    onChange={(e) =>
                      setSeoMeta((prev) => ({
                        ...prev,
                        og_image: e.target.value,
                      }))
                    }
                    placeholder="https://example.com/image.jpg"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Twitter Card */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Twitter Card
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Twitter Title</Label>
                    <Input
                      value={seoMeta.twitter_title}
                      onChange={(e) =>
                        setSeoMeta((prev) => ({
                          ...prev,
                          twitter_title: e.target.value,
                        }))
                      }
                      placeholder="Twitter title"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Twitter Description</Label>
                    <Input
                      value={seoMeta.twitter_description}
                      onChange={(e) =>
                        setSeoMeta((prev) => ({
                          ...prev,
                          twitter_description: e.target.value,
                        }))
                      }
                      placeholder="Twitter description"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Twitter Image URL</Label>
                  <Input
                    value={seoMeta.twitter_image}
                    onChange={(e) =>
                      setSeoMeta((prev) => ({
                        ...prev,
                        twitter_image: e.target.value,
                      }))
                    }
                    placeholder="https://example.com/twitter-image.jpg"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Indexing Options */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Indexing Options
                </h3>

                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is-index"
                      checked={seoMeta.is_index}
                      onChange={(e) =>
                        setSeoMeta((prev) => ({
                          ...prev,
                          is_index: e.target.checked,
                        }))
                      }
                      className="w-4 h-4"
                    />
                    <Label htmlFor="is-index">
                      Allow search engines to index this page
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is-follow"
                      checked={seoMeta.is_follow}
                      onChange={(e) =>
                        setSeoMeta((prev) => ({
                          ...prev,
                          is_follow: e.target.checked,
                        }))
                      }
                      className="w-4 h-4"
                    />
                    <Label htmlFor="is-follow">Follow links on this page</Label>
                  </div>
                </div>
              </div>

              {/* Schema JSON (Optional advanced field) */}
              <div className="space-y-2">
                <Label>Schema JSON (Advanced)</Label>
                <textarea
                  value={
                    seoMeta.schema_json
                      ? JSON.stringify(seoMeta.schema_json, null, 2)
                      : ""
                  }
                  onChange={(e) => {
                    try {
                      const parsed = e.target.value
                        ? JSON.parse(e.target.value)
                        : null;
                      setSeoMeta((prev) => ({ ...prev, schema_json: parsed }));
                    } catch {
                      // Invalid JSON, don't update
                    }
                  }}
                  placeholder={`{
  "@context": "https://schema.org",
  "@type": "Product"
}`}
                  rows={6}
                  className="w-full border rounded-md p-3 font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  Enter valid JSON-LD schema markup
                </p>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowSeoModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveSeo}
                disabled={seoLoading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {seoLoading ? "Saving..." : "Save SEO Data"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
