"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { apiClient } from "@/hook/apiClient";
import SimpleImageUploader from "@/hook/imageUploader";
import CategoryTree from "@/components/ui/CategoryTree";
import { useNavigate, useParams } from "react-router-dom";
import {
  Trash2,
  Info,
  Search,
  ChevronLeft,
  Star,
  Plus,
  X,
  Eye,
  RotateCcw,
  Globe,
  Twitter,
  Facebook,
  FileText,
  Package,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Save,
  Loader2,
} from "lucide-react";

type Category = {
  id: number;
  code: string;
  name: string;
  parent_id?: number | null;
  image?: string | null;
  status?: string | null;
};
type UOM = { id: number; code: string; name: string; symbol: string };
type ProductImage = {
  id?: number;
  url: string;
  alt_text: string;
  is_primary: boolean;
};
type Barcode = {
  id?: number;
  barcode: string;
  type?: string;
  is_primary: boolean;
};
type Variation = {
  id?: number;
  name?: string;
  additional_price?: number;
  images?: ProductImage[];
  barcodes?: Barcode[];
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

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-2xl shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center text-white flex-shrink-0">
          {icon}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useNavigate();

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uoms, setUoms] = useState<UOM[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedUom, setSelectedUom] = useState<number | "">("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [costPrice, setCostPrice] = useState<number | "">("");
  const [sellingPrice, setSellingPrice] = useState<number | "">("");
  const [regularPrice, setRegularPrice] = useState<number | "">("");
  const [variations, setVariations] = useState<Variation[]>([]);
  const [seoMeta, setSeoMeta] = useState<SeoMeta>({
    entity_type: "product",
    entity_id: id ? parseInt(id) : undefined,
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
  const hasManuallyEditedTitle = useRef(false);
  const hasManuallyEditedDesc = useRef(false);

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  useEffect(() => {
    setProductSlug(name ? generateSlug(name) : "");
  }, [name]);

  useEffect(() => {
    if (name && !hasManuallyEditedTitle.current)
      setSeoMeta((prev) => ({
        ...prev,
        meta_title: prev.meta_title || name,
        og_title: prev.og_title || name,
        twitter_title: prev.twitter_title || name,
      }));
  }, [name]);

  useEffect(() => {
    if (description && !hasManuallyEditedDesc.current) {
      const t =
        description.length > 160
          ? description.substring(0, 157) + "..."
          : description;
      setSeoMeta((prev) => ({
        ...prev,
        meta_description: prev.meta_description || t,
        og_description: prev.og_description || t,
        twitter_description: prev.twitter_description || t,
      }));
    }
  }, [description]);

  const fetchSeoData = async (productId: number) => {
    try {
      const r = await apiClient(
        `${import.meta.env.VITE_SERVER}/seo/meta/entity/product/${productId}`,
        { method: "GET", tokenType: "jwt" },
      );
      if (r.data) {
        setSeoMeta(r.data);
        if (r.data.meta_title && r.data.meta_title !== name)
          hasManuallyEditedTitle.current = true;
        if (r.data.meta_description && r.data.meta_description !== description)
          hasManuallyEditedDesc.current = true;
      }
    } catch {
      /* 404 expected */
    }
  };

  const fetchData = async () => {
    try {
      setPageLoading(true);
      const [uomRes, catRes, productRes] = await Promise.all([
        apiClient(`${import.meta.env.VITE_SERVER}/product/get-uom`, {
          method: "GET",
          tokenType: "jwt",
        }),
        apiClient(`${import.meta.env.VITE_SERVER}/product/get-product-cat`, {
          method: "GET",
          tokenType: "jwt",
        }),
        apiClient(`${import.meta.env.VITE_SERVER}/product/products/${id}`, {
          method: "GET",
          tokenType: "jwt",
        }),
      ]);
      setUoms(uomRes.data);
      setCategories(catRes.data);
      const p = productRes.data;
      setName(p.name);
      setDescription(p.description || "");
      setCostPrice(p.cost_price);
      setSellingPrice(p.selling_price);
      setRegularPrice(p.regular_price);
      setSelectedUom(p.uom_id);
      setSelectedCategories(p.categories?.map((c: any) => c.id) || []);
      setVariations(
        p.variants?.map((v: any) => ({
          id: v.id,
          name: v.name,
          additional_price: v.additional_price || 0,
          images: v.images || [],
          barcodes: v.barcodes || [],
        })) || [],
      );
      if (p.id) await fetchSeoData(p.id);
    } catch (err: any) {
      toast.error(err.message || "Failed to load product");
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const toggleCategory = (catId: number) =>
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId],
    );

  const addVariation = () =>
    setVariations((prev) => [
      ...prev,
      { name: "", additional_price: 0, images: [], barcodes: [] },
    ]);
  const removeVariation = (index: number) =>
    setVariations((prev) => prev.filter((_, i) => i !== index));

  const handleAddImage = (varIndex: number, url: string) =>
    setVariations((prev) =>
      prev.map((v, i) =>
        i === varIndex
          ? {
              ...v,
              images: [
                ...(v.images || []),
                {
                  url,
                  alt_text: `${v.name || "Variant"} Image`,
                  is_primary: (v.images?.length || 0) === 0,
                },
              ],
            }
          : v,
      ),
    );

  const handleRemoveImage = (varIndex: number, imgIndex: number) =>
    setVariations((prev) =>
      prev.map((v, i) =>
        i === varIndex
          ? { ...v, images: v.images?.filter((_, idx) => idx !== imgIndex) }
          : v,
      ),
    );

  const handleMakePrimary = (varIndex: number, imgIndex: number) =>
    setVariations((prev) =>
      prev.map((v, i) =>
        i === varIndex
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

  const handleSaveSeo = async () => {
    setSeoLoading(true);
    try {
      if (seoMeta.meta_title !== name) hasManuallyEditedTitle.current = true;
      if (seoMeta.meta_description !== description)
        hasManuallyEditedDesc.current = true;
      const seoData = {
        ...seoMeta,
        entity_id: parseInt(id!),
        entity_type: "product",
      };
      const response = seoMeta.id
        ? await apiClient(
            `${import.meta.env.VITE_SERVER}/seo/meta/${seoMeta.id}`,
            { method: "PUT", data: seoData, tokenType: "jwt" },
          )
        : await apiClient(`${import.meta.env.VITE_SERVER}/seo/meta`, {
            method: "POST",
            data: seoData,
            tokenType: "jwt",
          });
      if (response.data?.id)
        setSeoMeta((prev) => ({ ...prev, id: response.data.id }));
      setShowSeoModal(false);
      toast.success("SEO data saved");
    } catch (error: any) {
      toast.error(error.message || "Failed to save SEO data");
    } finally {
      setSeoLoading(false);
    }
  };

  const handleResetToDefaults = () => {
    const t =
      description.length > 160
        ? description.substring(0, 157) + "..."
        : description;
    setSeoMeta((prev) => ({
      ...prev,
      meta_title: name || "",
      meta_description: t,
      og_title: name || "",
      og_description: t,
      twitter_title: name || "",
      twitter_description: t,
    }));
    hasManuallyEditedTitle.current = false;
    hasManuallyEditedDesc.current = false;
    toast.success("Reset to product defaults");
  };

  const validateForm = () => {
    if (!name.trim()) {
      toast.error("Please enter a product name");
      return false;
    }
    if (!selectedUom) {
      toast.error("Please select a UOM");
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
    return true;
  };

  const handleUpdate = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const updatedProduct = {
        uom_id: selectedUom,
        name,
        description,
        cost_price: costPrice,
        selling_price: sellingPrice,
        regular_price: regularPrice || sellingPrice,
        categories: selectedCategories.map((catId, index) => ({
          id: catId,
          is_primary: index === 0,
        })),
        variants: variations.map((v) => ({
          id: v.id,
          name: v.name || name,
          additional_price: v.additional_price ?? 0,
          images: (v.images || []).map((img) => ({
            id: img.id,
            url: img.url,
            alt_text: img.alt_text || "Product Image",
            is_primary: img.is_primary,
          })),
          barcodes: (v.barcodes || []).map((b) => ({
            id: b.id,
            barcode: b.barcode,
            type: b.type || "EAN13",
            is_primary: b.is_primary,
          })),
        })),
      };
      const res = await apiClient(
        `${import.meta.env.VITE_SERVER}/product/update-products/${id}`,
        { method: "POST", data: updatedProduct, tokenType: "jwt" },
      );
      if (res.success) {
        try {
          const seoData = {
            ...seoMeta,
            entity_id: parseInt(id!),
            entity_type: "product",
          };
          seoMeta.id
            ? await apiClient(
                `${import.meta.env.VITE_SERVER}/seo/meta/${seoMeta.id}`,
                { method: "PUT", data: seoData, tokenType: "jwt" },
              )
            : await apiClient(`${import.meta.env.VITE_SERVER}/seo/meta`, {
                method: "POST",
                data: seoData,
                tokenType: "jwt",
              });
        } catch {
          /* non-blocking */
        }
        toast.success("Product updated! 🎉");
        router("/inventory/products");
      } else {
        toast.error(res.message || "Failed to update product");
      }
    } catch (err: any) {
      toast.error(err.message || "Error updating product");
    } finally {
      setLoading(false);
    }
  };

  const margin =
    costPrice && sellingPrice && Number(costPrice) > 0
      ? (
          ((Number(sellingPrice) - Number(costPrice)) / Number(sellingPrice)) *
          100
        ).toFixed(1)
      : null;

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-medium">Loading product…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router(-1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">
              Edit Product
            </h1>
            <p className="text-xs text-gray-400 hidden sm:block truncate max-w-xs">
              {name || "Loading…"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router("/inventory/products")}
            className="hidden sm:flex text-xs border-gray-300 text-gray-600"
          >
            Cancel
          </Button>
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Updating…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Update
              </>
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-full mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* LEFT */}
          <div className="flex-1 min-w-0 space-y-5">
            <Card>
              <SectionHeader
                icon={<FileText className="w-4 h-4" />}
                title="Product Information"
                subtitle="Name and description shown to customers"
              />
              <div className="p-5 space-y-4">
                <Field label="Product Name" required>
                  <Input
                    placeholder="e.g. Premium Cotton T-Shirt"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 rounded-xl border-gray-200 focus:border-gray-400 text-base"
                  />
                  {productSlug && (
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      /product/
                      <span className="text-gray-600 font-mono">
                        {productSlug}
                      </span>
                    </p>
                  )}
                </Field>
                <Field label="Description">
                  <textarea
                    placeholder="Write a detailed description…"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none transition-shadow"
                    rows={5}
                  />
                  <p className="text-xs text-gray-400">
                    {description.length} characters
                  </p>
                </Field>
              </div>
            </Card>

            <Card>
              <Tabs defaultValue="general">
                <div className="px-5 pt-4">
                  <TabsList className="w-full sm:w-auto rounded-xl bg-gray-100 p-1 gap-1 flex flex-wrap sm:flex-nowrap">
                    <TabsTrigger
                      value="general"
                      className="flex-1 sm:flex-none rounded-lg text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm gap-1.5 py-1.5"
                    >
                      <Package className="w-3.5 h-3.5" />
                      General
                    </TabsTrigger>
                    <TabsTrigger
                      value="variations"
                      className="flex-1 sm:flex-none rounded-lg text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm gap-1.5 py-1.5"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      Variations
                      {variations.length > 0 && (
                        <span className="ml-1 w-4 h-4 rounded-full bg-gray-900 text-white text-[10px] flex items-center justify-center">
                          {variations.length}
                        </span>
                      )}
                    </TabsTrigger>
                    <TabsTrigger
                      value="seo"
                      className="flex-1 sm:flex-none rounded-lg text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm gap-1.5 py-1.5"
                    >
                      <Search className="w-3.5 h-3.5" />
                      SEO
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* General */}
                <TabsContent value="general" className="p-5 space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                      Pricing
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        {
                          label: "Cost Price",
                          required: true,
                          value: costPrice,
                          setter: setCostPrice,
                        },
                        {
                          label: "Selling Price",
                          required: true,
                          value: sellingPrice,
                          setter: setSellingPrice,
                        },
                        {
                          label: "Regular Price",
                          hint: "Strike-through / compare price",
                          value: regularPrice,
                          setter: setRegularPrice,
                        },
                      ].map(({ label, required, hint, value, setter }) => (
                        <Field
                          key={label}
                          label={label}
                          required={required}
                          hint={hint}
                        >
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                              $
                            </span>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={value}
                              onChange={(e) =>
                                setter(
                                  e.target.value === ""
                                    ? ""
                                    : Number(e.target.value),
                                )
                              }
                              className="pl-7 h-11 rounded-xl border-gray-200"
                            />
                          </div>
                        </Field>
                      ))}
                    </div>
                    {margin !== null && (
                      <div
                        className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${Number(margin) >= 20 ? "bg-emerald-50 text-emerald-700" : Number(margin) >= 0 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700"}`}
                      >
                        {Number(margin) >= 0 ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        Margin: {margin}%
                      </div>
                    )}
                  </div>
                  <hr className="border-gray-100" />
                  <Field label="Unit of Measure (UOM)" required>
                    <select
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
                      value={selectedUom}
                      onChange={(e) =>
                        setSelectedUom(
                          e.target.value ? Number(e.target.value) : "",
                        )
                      }
                    >
                      <option value="">— Select UOM —</option>
                      {uoms?.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.symbol})
                        </option>
                      ))}
                    </select>
                  </Field>
                </TabsContent>

                {/* Variations */}
                <TabsContent value="variations" className="p-5 space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                    <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700 leading-relaxed">
                      <span className="font-semibold">Managing Variants</span> —
                      each variant has its own images and pricing. Existing
                      variant IDs are preserved on update.
                    </p>
                  </div>

                  {variations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 border-2 border-dashed border-gray-200 rounded-2xl text-center">
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        No variations
                      </p>
                      <p className="text-xs text-gray-400 mb-4">
                        Add variations like Size, Color, etc.
                      </p>
                      <button
                        onClick={addVariation}
                        className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Variation
                      </button>
                    </div>
                  ) : (
                    <>
                      {variations.map((v, vIndex) => (
                        <div
                          key={vIndex}
                          className="border border-gray-200 rounded-2xl overflow-hidden"
                        >
                          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-gray-800">
                                Variation #{vIndex + 1}
                              </span>
                              {v.name && (
                                <span className="text-sm font-normal text-gray-400">
                                  — {v.name}
                                </span>
                              )}
                              {v.id && (
                                <span className="text-[10px] font-mono bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">
                                  ID:{v.id}
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => removeVariation(vIndex)}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <Field label="Variation Name">
                                <Input
                                  placeholder="e.g. Small, Red, 500ml"
                                  value={v.name ?? ""}
                                  onChange={(e) =>
                                    setVariations((prev) =>
                                      prev.map((x, i) =>
                                        i === vIndex
                                          ? { ...x, name: e.target.value }
                                          : x,
                                      ),
                                    )
                                  }
                                  className="h-10 rounded-xl border-gray-200"
                                />
                              </Field>
                              <Field label="Additional Price ($)">
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  value={v.additional_price ?? ""}
                                  onChange={(e) =>
                                    setVariations((prev) =>
                                      prev.map((x, i) =>
                                        i === vIndex
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
                                  className="h-10 rounded-xl border-gray-200"
                                />
                              </Field>
                            </div>
                            {/* Images */}
                            <div className="pt-2 border-t border-gray-100">
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Images ({v.images?.length || 0})
                                </p>
                                <SimpleImageUploader
                                  onChange={(url: string) =>
                                    handleAddImage(vIndex, url)
                                  }
                                />
                              </div>
                              {!v.images || v.images.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                                  <ImageIcon className="w-5 h-5 text-gray-300 mb-1" />
                                  <p className="text-xs text-gray-400">
                                    No images uploaded
                                  </p>
                                </div>
                              ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                  {v.images.map((img, imgIdx) => (
                                    <div
                                      key={imgIdx}
                                      className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all ${img.is_primary ? "border-gray-900 ring-2 ring-gray-900/20" : "border-gray-100 hover:border-gray-300"}`}
                                    >
                                      <img
                                        src={img.url}
                                        alt={img.alt_text}
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity p-1">
                                        <button
                                          onClick={() =>
                                            handleRemoveImage(vIndex, imgIdx)
                                          }
                                          className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-[10px] rounded-lg w-full"
                                        >
                                          Remove
                                        </button>
                                        {!img.is_primary && (
                                          <button
                                            onClick={() =>
                                              handleMakePrimary(vIndex, imgIdx)
                                            }
                                            className="px-2 py-1 bg-white text-gray-900 text-[10px] rounded-lg w-full font-semibold"
                                          >
                                            Primary
                                          </button>
                                        )}
                                      </div>
                                      {img.is_primary && (
                                        <div className="absolute top-1 left-1">
                                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        onClick={addVariation}
                        className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-sm text-gray-500 font-medium hover:border-gray-400 hover:text-gray-700 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Another Variation
                      </button>
                    </>
                  )}
                </TabsContent>

                {/* SEO */}
                <TabsContent value="seo" className="p-5 space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
                      <Eye className="w-3 h-3" />
                      Search Result Preview
                    </p>
                    <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 space-y-1">
                      <p className="text-xs text-emerald-600 font-mono break-all">
                        {typeof window !== "undefined"
                          ? window.location.origin
                          : "https://yoursite.com"}
                        /product/{productSlug || "product-slug"}
                      </p>
                      <p className="text-base text-blue-700 font-semibold hover:underline cursor-pointer">
                        {seoMeta.meta_title || name || "Product Title"}
                      </p>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {seoMeta.meta_description ||
                          description ||
                          "Your product description will appear here…"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Title", ok: !!seoMeta.meta_title },
                      { label: "Description", ok: !!seoMeta.meta_description },
                      { label: "Keywords", ok: !!seoMeta.meta_keywords },
                      { label: "OG Tags", ok: !!seoMeta.og_title },
                    ].map(({ label, ok }) => (
                      <span
                        key={label}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${ok ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-400"}`}
                      >
                        {ok ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <AlertCircle className="w-3 h-3" />
                        )}
                        {label}
                      </span>
                    ))}
                    {seoMeta.id && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
                        <CheckCircle2 className="w-3 h-3" />
                        Saved (ID: {seoMeta.id})
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setShowSeoModal(true)}
                    className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Edit Full SEO Settings
                  </button>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* RIGHT */}
          <div className="xl:w-72 space-y-4 flex-shrink-0">
            <Card>
              <SectionHeader
                icon={<Save className="w-4 h-4" />}
                title="Save Changes"
                subtitle="Update product details"
              />
              <div className="p-4 space-y-3">
                <div className="text-xs text-gray-500 space-y-1.5">
                  {[
                    { label: "Name", ok: !!name },
                    { label: "UOM", ok: !!selectedUom },
                    { label: "Pricing", ok: !!(costPrice && sellingPrice) },
                    {
                      label: "Category",
                      ok: selectedCategories.length > 0,
                      count: selectedCategories.length,
                    },
                  ].map(({ label, ok, count }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between"
                    >
                      <span>{label}</span>
                      <span
                        className={`font-medium ${ok ? "text-emerald-600" : "text-gray-300"}`}
                      >
                        {ok ? (count ? `✓ (${count})` : "✓") : "—"}
                      </span>
                    </div>
                  ))}
                </div>
                <hr className="border-gray-100" />
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Updating…
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Update Product
                    </>
                  )}
                </button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl border-gray-200 text-gray-500 text-xs"
                  onClick={() => router("/inventory/products")}
                >
                  Cancel
                </Button>
              </div>
            </Card>

            <Card>
              <SectionHeader
                icon={<Package className="w-4 h-4" />}
                title="Categories"
                subtitle={
                  selectedCategories.length > 0
                    ? `${selectedCategories.length} selected`
                    : "None selected"
                }
                action={
                  <button
                    onClick={() => router("/inventory/categories")}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    + New
                  </button>
                }
              />
              <div className="p-3">
                <div className="overflow-auto max-h-80 border border-gray-100 rounded-xl p-2">
                  <CategoryTree
                    categories={categories}
                    selectedCategories={selectedCategories}
                    toggleCategory={toggleCategory}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* SEO Modal */}
      {showSeoModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => setShowSeoModal(false)}
        >
          <div
            className="bg-white w-full sm:rounded-2xl sm:max-w-3xl max-h-[95dvh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  SEO Settings
                </h2>
                <p className="text-xs text-gray-400">
                  Optimize how this product appears in search results
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetToDefaults}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                  title="Reset to defaults"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowSeoModal(false)}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-6 space-y-6">
              {/* Basic SEO */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Basic SEO
                  </h3>
                </div>
                <div className="space-y-4">
                  <Field
                    label="Meta Title"
                    hint={`${seoMeta.meta_title?.length || 0}/60 — ${seoMeta.meta_title !== name ? "⚠ Customized" : "Synced with name"}`}
                  >
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
                      className="h-10 rounded-xl border-gray-200"
                    />
                  </Field>
                  <Field
                    label="Meta Description"
                    hint={`${seoMeta.meta_description?.length || 0}/160 characters`}
                  >
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
                      className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none"
                    />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Meta Keywords" hint="Comma-separated">
                      <Input
                        value={seoMeta.meta_keywords}
                        onChange={(e) =>
                          setSeoMeta((prev) => ({
                            ...prev,
                            meta_keywords: e.target.value,
                          }))
                        }
                        placeholder="keyword1, keyword2"
                        className="h-10 rounded-xl border-gray-200"
                      />
                    </Field>
                    <Field label="Canonical URL">
                      <Input
                        value={seoMeta.canonical_url}
                        onChange={(e) =>
                          setSeoMeta((prev) => ({
                            ...prev,
                            canonical_url: e.target.value,
                          }))
                        }
                        placeholder="https://…"
                        className="h-10 rounded-xl border-gray-200"
                      />
                    </Field>
                  </div>
                </div>
              </div>
              <hr className="border-gray-100" />

              {/* OG */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Facebook className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Open Graph
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="OG Title">
                    <Input
                      value={seoMeta.og_title}
                      onChange={(e) =>
                        setSeoMeta((prev) => ({
                          ...prev,
                          og_title: e.target.value,
                        }))
                      }
                      placeholder="Open Graph title"
                      className="h-10 rounded-xl border-gray-200"
                    />
                  </Field>
                  <Field label="OG Description">
                    <Input
                      value={seoMeta.og_description}
                      onChange={(e) =>
                        setSeoMeta((prev) => ({
                          ...prev,
                          og_description: e.target.value,
                        }))
                      }
                      placeholder="Open Graph description"
                      className="h-10 rounded-xl border-gray-200"
                    />
                  </Field>
                  <Field label="OG Image URL" hint="Recommended: 1200×630px">
                    <Input
                      value={seoMeta.og_image}
                      onChange={(e) =>
                        setSeoMeta((prev) => ({
                          ...prev,
                          og_image: e.target.value,
                        }))
                      }
                      placeholder="https://…/image.jpg"
                      className="h-10 rounded-xl border-gray-200"
                    />
                  </Field>
                </div>
              </div>
              <hr className="border-gray-100" />

              {/* Twitter */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Twitter className="w-4 h-4 text-gray-400" />
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
                    Twitter Card
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Twitter Title">
                    <Input
                      value={seoMeta.twitter_title}
                      onChange={(e) =>
                        setSeoMeta((prev) => ({
                          ...prev,
                          twitter_title: e.target.value,
                        }))
                      }
                      placeholder="Twitter title"
                      className="h-10 rounded-xl border-gray-200"
                    />
                  </Field>
                  <Field label="Twitter Description">
                    <Input
                      value={seoMeta.twitter_description}
                      onChange={(e) =>
                        setSeoMeta((prev) => ({
                          ...prev,
                          twitter_description: e.target.value,
                        }))
                      }
                      placeholder="Twitter description"
                      className="h-10 rounded-xl border-gray-200"
                    />
                  </Field>
                  <Field label="Twitter Image URL">
                    <Input
                      value={seoMeta.twitter_image}
                      onChange={(e) =>
                        setSeoMeta((prev) => ({
                          ...prev,
                          twitter_image: e.target.value,
                        }))
                      }
                      placeholder="https://…/image.jpg"
                      className="h-10 rounded-xl border-gray-200"
                    />
                  </Field>
                </div>
              </div>
              <hr className="border-gray-100" />

              {/* Indexing */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4">
                  Indexing
                </h3>
                <div className="flex flex-col sm:flex-row gap-4">
                  {[
                    {
                      key: "is_index" as const,
                      label: "Index this page",
                      sublabel: "Allow search engines to crawl",
                      value: seoMeta.is_index,
                    },
                    {
                      key: "is_follow" as const,
                      label: "Follow links",
                      sublabel: "Pass PageRank to linked pages",
                      value: seoMeta.is_follow,
                    },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className={`flex-1 flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${item.value ? "border-gray-900 bg-gray-50" : "border-gray-100 hover:border-gray-200"}`}
                    >
                      <input
                        type="checkbox"
                        checked={item.value}
                        onChange={(e) =>
                          setSeoMeta((prev) => ({
                            ...prev,
                            [item.key]: e.target.checked,
                          }))
                        }
                        className="mt-0.5 w-4 h-4 rounded"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-400">{item.sublabel}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Schema */}
              <Field
                label="Schema JSON (Advanced)"
                hint="Enter valid JSON-LD structured data"
              >
                <textarea
                  value={
                    seoMeta.schema_json
                      ? JSON.stringify(seoMeta.schema_json, null, 2)
                      : ""
                  }
                  onChange={(e) => {
                    try {
                      setSeoMeta((prev) => ({
                        ...prev,
                        schema_json: e.target.value
                          ? JSON.parse(e.target.value)
                          : null,
                      }));
                    } catch {}
                  }}
                  placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "Product"\n}`}
                  rows={5}
                  className="w-full border border-gray-200 rounded-xl p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none"
                />
              </Field>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
              <button
                onClick={handleResetToDefaults}
                className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to defaults
              </button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-gray-200"
                  onClick={() => setShowSeoModal(false)}
                >
                  Cancel
                </Button>
                <button
                  onClick={handleSaveSeo}
                  disabled={seoLoading}
                  className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {seoLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      {seoMeta.id ? "Update SEO" : "Save SEO"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
