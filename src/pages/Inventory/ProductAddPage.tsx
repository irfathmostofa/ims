"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiClient } from "@/hook/apiClient";
import { toast } from "sonner";
import SimpleImageUploader from "@/hook/imageUploader";
import CategoryTree from "@/components/ui/CategoryTree";
import { useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import {
  Info,
  Image as ImageIcon,
  Package,
  Search,
  ChevronLeft,
  Star,
  Trash2,
  Plus,
  X,
  Eye,
  RotateCcw,
  Globe,
  Twitter,
  Facebook,
  FileText,
  CheckCircle2,
  AlertCircle,
  Bold,
  Italic,
  List,
  ListOrdered,
  Link as LinkIcon,
} from "lucide-react";
import CustomInput from "@/components/ui/custom/customInput";
import CustomSelect from "@/components/ui/custom/customSelect";

// Editor styles
const editorStyles = `
  .editor-image {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1rem 0;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  
  .editor-image:hover {
    opacity: 0.8;
  }
  
  .tiptap-editor img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 1rem 0;
  }
`;

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

// ─── TipTap Editor Toolbar Component ───────────────────────────────────────
function EditorToolbar({
  editor,
  onAddImage,
}: {
  editor: any;
  onAddImage: () => void;
}) {
  if (!editor) return null;

  return (
    <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-xl flex-wrap">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded-lg transition-colors ${
          editor.isActive("bold")
            ? "bg-gray-900 text-white"
            : "hover:bg-gray-200 text-gray-600"
        }`}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded-lg transition-colors ${
          editor.isActive("italic")
            ? "bg-gray-900 text-white"
            : "hover:bg-gray-200 text-gray-600"
        }`}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded-lg transition-colors ${
          editor.isActive("bulletList")
            ? "bg-gray-900 text-white"
            : "hover:bg-gray-200 text-gray-600"
        }`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded-lg transition-colors ${
          editor.isActive("orderedList")
            ? "bg-gray-900 text-white"
            : "hover:bg-gray-200 text-gray-600"
        }`}
        title="Ordered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <div className="w-px h-6 bg-gray-300 mx-1" />
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded-lg transition-colors ${
          editor.isActive("blockquote")
            ? "bg-gray-900 text-white"
            : "hover:bg-gray-200 text-gray-600"
        }`}
        title="Quote"
      >
        <span className="text-sm font-bold">"</span>
      </button>
      <button
        onClick={onAddImage}
        className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
        title="Insert Image"
      >
        <ImageIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().clearNodes().run()}
        className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
        title="Clear Formatting"
      >
        <RotateCcw className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Small reusable field wrapper ───────────────────────────────────────────
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

// ─── Section card ────────────────────────────────────────────────────────────
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

// ─── Section header inside card ──────────────────────────────────────────────
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

  const [titleCustomized, setTitleCustomized] = useState(false);
  const [descCustomized, setDescCustomized] = useState(false);

  const router = useNavigate();

  // TipTap Editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      Image.configure({
        inline: false,
        HTMLAttributes: {
          class: "editor-image",
        },
      }),
    ],
    content: description,
    onUpdate: ({ editor }) => {
      setDescription(editor.getHTML());
    },
  });

  const addImage = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      editor?.chain().focus().setImage({ src: url }).run();
    }
  };

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  // Keep slug in sync with name
  useEffect(() => {
    setProductSlug(name ? generateSlug(name) : "");
  }, [name]);

  // Auto-sync title — unless user customized it
  useEffect(() => {
    if (!titleCustomized) {
      setSeoMeta((prev) => ({
        ...prev,
        meta_title: name,
        og_title: name,
        twitter_title: name,
      }));
    }
  }, [name, titleCustomized]);

  // Auto-sync description — unless user customized it
  useEffect(() => {
    if (!descCustomized) {
      const plainText = description.replace(/<[^>]*>/g, "").trim();
      const truncated =
        plainText.length > 160
          ? plainText.substring(0, 157) + "..."
          : plainText;
      setSeoMeta((prev) => ({
        ...prev,
        meta_description: truncated,
        og_description: truncated,
        twitter_description: truncated,
      }));
    }
  }, [description, descCustomized]);

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
                  alt_text: `${v.name || "Variant"} Image ${(v.images?.length || 0) + 1}`,
                  is_primary: (v.images?.length || 0) === 0,
                },
              ],
            }
          : v,
      ),
    );
  };

  const handleRemoveImage = (varId: number, imgIndex: number) => {
    setVariations((prev) =>
      prev.map((v) =>
        v.id === varId
          ? { ...v, images: v.images?.filter((_, idx) => idx !== imgIndex) }
          : v,
      ),
    );
  };

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

  const handleSaveSeo = async () => {
    setSeoLoading(true);
    try {
      const plainText = description.replace(/<[^>]*>/g, "").trim();
      if (seoMeta.meta_title !== name) setTitleCustomized(true);
      if (seoMeta.meta_description !== plainText) setDescCustomized(true);
      setShowSeoModal(false);
      toast.success("SEO data saved");
    } catch (error: any) {
      toast.error(error.message || "Failed to save SEO data");
    } finally {
      setSeoLoading(false);
    }
  };

  const handleResetToDefaults = () => {
    const plainText = description.replace(/<[^>]*>/g, "").trim();
    const truncated =
      plainText.length > 160 ? plainText.substring(0, 157) + "..." : plainText;
    setSeoMeta((prev) => ({
      ...prev,
      meta_title: name || "",
      meta_description: truncated,
      og_title: name || "",
      og_description: truncated,
      twitter_title: name || "",
      twitter_description: truncated,
    }));
    setTitleCustomized(false);
    setDescCustomized(false);
    toast.success("Reset to product defaults");
  };

  const validateForm = () => {
    if (!name.trim()) {
      toast.error("Please enter a product name");
      return false;
    }
    if (!selectedUom) {
      toast.error("Please select a unit of measure");
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

  const handlePublish = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const variantsData = variations.map((v) => ({
        name: v.name || name,
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

      try {
        await apiClient(`${import.meta.env.VITE_SERVER}/seo/meta`, {
          method: "POST",
          data: { ...seoMeta, entity_id: data.data.id, entity_type: "product" },
          tokenType: "jwt",
        });
      } catch (seoError) {
        console.error("Failed to save SEO data:", seoError);
      }

      toast.success(data.message || "Product published! 🎉");
      router("/inventory/products");
    } catch (error: any) {
      toast.error(error.message || "Failed to publish product.");
    } finally {
      setLoading(false);
    }
  };

  // Profit margin calc
  const margin =
    costPrice && sellingPrice && Number(costPrice) > 0
      ? (
          ((Number(sellingPrice) - Number(costPrice)) / Number(sellingPrice)) *
          100
        ).toFixed(1)
      : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{editorStyles}</style>
      {/* Top bar */}
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
              Add New Product
            </h1>
            <p className="text-xs text-gray-400 hidden sm:block">
              Fill in the details below to create your product
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex text-xs border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            Save Draft
          </Button>
          <button
            onClick={handlePublish}
            disabled={loading}
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Publish
              </>
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-full mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col xl:flex-row gap-6">
          {/* ── LEFT COLUMN ───────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Basic info */}
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
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <EditorToolbar editor={editor} onAddImage={addImage} />
                    <EditorContent
                      editor={editor}
                      className="prose prose-sm max-w-none tiptap-editor bg-white"
                      style={{
                        fontSize: "14px",
                        lineHeight: "1.5",
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    {description.replace(/<[^>]*>/g, "").length} characters
                  </p>
                </Field>
              </div>
            </Card>

            {/* Tabs */}
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

                {/* ── General ── */}
                <TabsContent value="general" className="p-5 space-y-5">
                  {/* Pricing */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                      Pricing
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Field label="Cost Price" required>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                            $
                          </span>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={costPrice}
                            onChange={(e) =>
                              setCostPrice(
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                              )
                            }
                            className="pl-7 h-11 rounded-xl border-gray-200"
                          />
                        </div>
                      </Field>
                      <Field label="Selling Price" required>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                            $
                          </span>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={sellingPrice}
                            onChange={(e) =>
                              setSellingPrice(
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                              )
                            }
                            className="pl-7 h-11 rounded-xl border-gray-200"
                          />
                        </div>
                      </Field>
                      <Field
                        label="Regular Price"
                        hint="Strike-through / compare price"
                      >
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                            $
                          </span>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={regularPrice}
                            onChange={(e) =>
                              setRegularPrice(
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                              )
                            }
                            className="pl-7 h-11 rounded-xl border-gray-200"
                          />
                        </div>
                      </Field>
                    </div>

                    {/* Margin pill */}
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

                  {/* UOM */}
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

                {/* ── Variations ── */}
                <TabsContent value="variations" className="p-5 space-y-4">
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
                    <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 leading-relaxed">
                      <span className="font-semibold">Variations</span> let you
                      offer different sizes, colors, or styles. If you skip
                      this, a default variant is created automatically.
                    </p>
                  </div>

                  {variations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-14 border-2 border-dashed border-gray-200 rounded-2xl text-center">
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                        <ImageIcon className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">
                        No variations yet
                      </p>
                      <p className="text-xs text-gray-400 mb-4">
                        Add variations like Size, Color, etc.
                      </p>
                      <button
                        onClick={addVariation}
                        className="px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add First Variation
                      </button>
                    </div>
                  ) : (
                    <>
                      {variations.map((v, vIndex) => (
                        <div
                          key={v.id}
                          className="border border-gray-200 rounded-2xl overflow-hidden"
                        >
                          {/* Variation header */}
                          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100">
                            <span className="text-sm font-bold text-gray-800">
                              Variation #{vIndex + 1}
                              {v.name && (
                                <span className="ml-2 font-normal text-gray-500">
                                  — {v.name}
                                </span>
                              )}
                            </span>
                            <button
                              onClick={() => removeVariation(v.id)}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                              title="Remove variation"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="p-4 space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              <Field label="Variation Name">
                                <Input
                                  placeholder="e.g. Small, Red, 500ml"
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
                                  className="h-10 rounded-xl border-gray-200"
                                />
                              </Field>
                              <CustomInput
                                label="Weight"
                                type="number"
                                placeholder="0.00"
                                value={v.weight ?? ""}
                                onChange={(e: any) =>
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
                              <CustomSelect
                                label="Weight Unit"
                                options={[
                                  { value: "kg", label: "Kilogram (kg)" },
                                  { value: "g", label: "Gram (g)" },
                                  { value: "lb", label: "Pound (lb)" },
                                  { value: "oz", label: "Ounce (oz)" },
                                ]}
                                value={v.weight_unit ?? ""}
                                onChange={(value: any) =>
                                  setVariations((prev) =>
                                    prev.map((x) =>
                                      x.id === v.id
                                        ? { ...x, weight_unit: String(value) }
                                        : x,
                                    ),
                                  )
                                }
                              />
                              <CustomInput
                                label="SKU"
                                placeholder="e.g. PROD-001-S"
                                value={v.sku ?? ""}
                                onChange={(e: any) =>
                                  setVariations((prev) =>
                                    prev.map((x) =>
                                      x.id === v.id
                                        ? { ...x, sku: e.target.value }
                                        : x,
                                    ),
                                  )
                                }
                              />
                              <Field label="Replacement">
                                <label className="flex items-center gap-2.5 cursor-pointer h-10">
                                  <div className="relative">
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
                                                  is_replaceable:
                                                    e.target.checked,
                                                }
                                              : x,
                                          ),
                                        )
                                      }
                                      className="sr-only"
                                    />
                                    <div
                                      className={`w-9 h-5 rounded-full transition-colors ${v.is_replaceable ? "bg-gray-900" : "bg-gray-200"}`}
                                    >
                                      <div
                                        className={`w-3.5 h-3.5 bg-white rounded-full shadow transition-transform mt-0.75 mx-0.75 translate-y-[3px] ${v.is_replaceable ? "translate-x-4" : "translate-x-0.5"}`}
                                      />
                                    </div>
                                  </div>
                                  <span className="text-sm text-gray-600">
                                    Allow replacement
                                  </span>
                                </label>
                              </Field>
                            </div>

                            {/* Images */}
                            <div className="pt-2 border-t border-gray-100">
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Images
                                </p>
                                <SimpleImageUploader
                                  onChange={(url: string) =>
                                    handleAddImageToVariation(v.id, url)
                                  }
                                />
                              </div>

                              {!v.images || v.images.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 text-center">
                                  <ImageIcon className="w-5 h-5 text-gray-300 mb-1" />
                                  <p className="text-xs text-gray-400">
                                    No images uploaded
                                  </p>
                                </div>
                              ) : (
                                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                                  {v.images.map((img, i) => (
                                    <div
                                      key={i}
                                      className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                                        img.is_primary
                                          ? "border-gray-900 ring-2 ring-gray-900/20"
                                          : "border-gray-100 hover:border-gray-300"
                                      }`}
                                    >
                                      <img
                                        src={img.url}
                                        alt={img.alt_text}
                                        className="w-full h-full object-cover"
                                      />
                                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity p-1">
                                        <button
                                          onClick={() =>
                                            handleRemoveImage(v.id, i)
                                          }
                                          className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-[10px] rounded-lg w-full"
                                        >
                                          Remove
                                        </button>
                                        {!img.is_primary && (
                                          <button
                                            onClick={() =>
                                              handleMakePrimary(v.id, i)
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

                {/* ── SEO ── */}
                <TabsContent value="seo" className="p-5 space-y-5">
                  {/* Live search preview */}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2 flex items-center gap-1.5">
                      <Eye className="w-3 h-3" /> Live Search Preview
                    </p>
                    <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 space-y-1">
                      <p className="text-xs text-emerald-600 font-mono break-all">
                        {typeof window !== "undefined"
                          ? window.location.origin
                          : "https://yoursite.com"}
                        /product/
                        <span className="text-emerald-700">
                          {productSlug || "product-slug"}
                        </span>
                      </p>
                      <p className="text-base text-blue-700 font-semibold hover:underline cursor-pointer leading-snug">
                        {seoMeta.meta_title || name || "Product Title"}
                      </p>
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                        {seoMeta.meta_description ||
                          description.replace(/<[^>]*>/g, "") ||
                          "Your product description will appear here in search results…"}
                      </p>
                    </div>
                  </div>

                  {/* Inline SEO fields */}
                  <div className="space-y-4">
                    {/* Meta title */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-gray-700">
                          Meta Title
                        </label>
                        {titleCustomized ? (
                          <button
                            type="button"
                            onClick={() => {
                              setSeoMeta((prev) => ({
                                ...prev,
                                meta_title: name,
                                og_title: name,
                                twitter_title: name,
                              }));
                              setTitleCustomized(false);
                            }}
                            className="text-[11px] text-amber-600 hover:text-amber-800 flex items-center gap-1 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" /> Sync with name
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Synced with
                            name
                          </span>
                        )}
                      </div>
                      <Input
                        value={seoMeta.meta_title}
                        onChange={(e) => {
                          setSeoMeta((prev) => ({
                            ...prev,
                            meta_title: e.target.value,
                          }));
                          setTitleCustomized(true);
                        }}
                        placeholder="Enter meta title (max 60 chars)"
                        maxLength={60}
                        className="h-10 rounded-xl border-gray-200"
                      />
                      <p className="text-xs text-gray-400 text-right">
                        {seoMeta.meta_title?.length || 0}/60
                      </p>
                    </div>

                    {/* Meta description */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-gray-700">
                          Meta Description
                        </label>
                        {descCustomized ? (
                          <button
                            type="button"
                            onClick={() => {
                              const plainText = description
                                .replace(/<[^>]*>/g, "")
                                .trim();
                              const truncated =
                                plainText.length > 160
                                  ? plainText.substring(0, 157) + "..."
                                  : plainText;
                              setSeoMeta((prev) => ({
                                ...prev,
                                meta_description: truncated,
                                og_description: truncated,
                                twitter_description: truncated,
                              }));
                              setDescCustomized(false);
                            }}
                            className="text-[11px] text-amber-600 hover:text-amber-800 flex items-center gap-1 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" /> Sync with
                            description
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Synced with
                            description
                          </span>
                        )}
                      </div>
                      <textarea
                        value={seoMeta.meta_description}
                        onChange={(e) => {
                          setSeoMeta((prev) => ({
                            ...prev,
                            meta_description: e.target.value,
                          }));
                          setDescCustomized(true);
                        }}
                        placeholder="Enter meta description (max 160 chars)"
                        maxLength={160}
                        rows={3}
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none"
                      />
                      <p
                        className={`text-xs text-right ${(seoMeta.meta_description?.length || 0) > 150 ? "text-amber-500" : "text-gray-400"}`}
                      >
                        {seoMeta.meta_description?.length || 0}/160
                      </p>
                    </div>

                    {/* Keywords */}
                    <Field
                      label="Meta Keywords"
                      hint="Comma-separated — e.g. cotton shirt, casual wear"
                    >
                      <Input
                        value={seoMeta.meta_keywords}
                        onChange={(e) =>
                          setSeoMeta((prev) => ({
                            ...prev,
                            meta_keywords: e.target.value,
                          }))
                        }
                        placeholder="keyword1, keyword2, keyword3"
                        className="h-10 rounded-xl border-gray-200"
                      />
                    </Field>
                  </div>

                  {/* Score chips */}
                  <div className="flex flex-wrap gap-2 pt-1">
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
                  </div>

                  {/* Advanced button */}
                  <button
                    onClick={() => setShowSeoModal(true)}
                    className="w-full py-2.5 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Globe className="w-4 h-4" />
                    Advanced SEO (OG, Twitter, Schema, Indexing)
                  </button>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* ── RIGHT COLUMN ──────────────────────────── */}
          <div className="xl:w-72 space-y-4 flex-shrink-0">
            {/* Publish card */}
            <Card>
              <SectionHeader
                icon={<CheckCircle2 className="w-4 h-4" />}
                title="Publish"
                subtitle="Make product live"
              />
              <div className="p-4 space-y-3">
                <div className="text-xs text-gray-500 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span>Name</span>
                    <span
                      className={`font-medium ${name ? "text-emerald-600" : "text-gray-300"}`}
                    >
                      {name ? "✓" : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>UOM</span>
                    <span
                      className={`font-medium ${selectedUom ? "text-emerald-600" : "text-gray-300"}`}
                    >
                      {selectedUom ? "✓" : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Category</span>
                    <span
                      className={`font-medium ${selectedCategories.length > 0 ? "text-emerald-600" : "text-gray-300"}`}
                    >
                      {selectedCategories.length > 0
                        ? `✓ (${selectedCategories.length})`
                        : "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pricing</span>
                    <span
                      className={`font-medium ${costPrice && sellingPrice ? "text-emerald-600" : "text-gray-300"}`}
                    >
                      {costPrice && sellingPrice ? "✓" : "—"}
                    </span>
                  </div>
                </div>

                <hr className="border-gray-100" />

                <button
                  onClick={handlePublish}
                  disabled={loading}
                  className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Publishing…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Publish Product
                    </>
                  )}
                </button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl border-gray-200 text-gray-500 text-xs"
                >
                  Save as Draft
                </Button>
              </div>
            </Card>

            {/* Categories card */}
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

      {/* ── SEO Modal ─────────────────────────────────── */}
      {showSeoModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
          onClick={() => setShowSeoModal(false)}
        >
          <div
            className="bg-white w-full sm:rounded-2xl sm:max-w-3xl max-h-[95dvh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  SEO Settings
                </h2>
                <p className="text-xs text-gray-400">
                  Optimize how this product appears in search engines
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetToDefaults}
                  className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                  title="Reset to product defaults"
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

            {/* Modal body */}
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
                        setTitleCustomized(true);
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
                        setDescCustomized(true);
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

              {/* Open Graph */}
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
                      id: "is_index",
                      label: "Index this page",
                      sublabel: "Allow search engines to crawl",
                      value: seoMeta.is_index,
                      key: "is_index" as const,
                    },
                    {
                      id: "is_follow",
                      label: "Follow links",
                      sublabel: "Pass PageRank to linked pages",
                      value: seoMeta.is_follow,
                      key: "is_follow" as const,
                    },
                  ].map((item) => (
                    <label
                      key={item.id}
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
              <div>
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
                        const parsed = e.target.value
                          ? JSON.parse(e.target.value)
                          : null;
                        setSeoMeta((prev) => ({
                          ...prev,
                          schema_json: parsed,
                        }));
                      } catch {
                        // Invalid JSON
                      }
                    }}
                    placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "Product"\n}`}
                    rows={5}
                    className="w-full border border-gray-200 rounded-xl p-3 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-gray-200 resize-none"
                  />
                </Field>
              </div>
            </div>

            {/* Modal footer */}
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
                      Save SEO
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
