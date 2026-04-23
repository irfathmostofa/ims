"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { apiClient } from "@/hook/apiClient";
import { Button } from "@/components/ui/button";
import { Save, ChevronLeft, Loader2 } from "lucide-react";
import type { Category } from "@/components/product/Productcategories";
import type { ProductVariation } from "@/components/product/Productvariations";
import type { SeoMeta } from "@/components/product/Productseo";
import ProductBasicInfo from "@/components/product/Productbasicinfo";
import ProductPricing from "@/components/product/Productpricing";
import ProductUOM from "@/components/product/Productuom";
import ProductVariations from "@/components/product/Productvariations";
import ProductSEO from "@/components/product/Productseo";
import ProductCategories from "@/components/product/Productcategories";
import Productbrand, { type Brand } from "@/components/product/Productbrand";

interface UOM {
  id: number;
  code: string;
  name: string;
  symbol: string;
}

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useNavigate();

  // Basic Info
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Pricing
  const [costPrice, setCostPrice] = useState<number | "">("");
  const [sellingPrice, setSellingPrice] = useState<number | "">("");
  const [regularPrice, setRegularPrice] = useState<number | "">("");

  // Setup Data
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [uoms, setUoms] = useState<UOM[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [selectedUom, setSelectedUom] = useState<number | "">("");
  const [selectedBrand, setSelectedBrand] = useState<number | null>(null);
  // Variations
  const [variations, setVariations] = useState<ProductVariation[]>([]);

  // SEO
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

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const hasManuallyEditedTitle = useRef(false);
  const hasManuallyEditedDesc = useRef(false);

  // Fetch page data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setPageLoading(true);
        const [uomRes, catRes, brandRes, productRes] = await Promise.all([
          apiClient(`${import.meta.env.VITE_SERVER}/product/get-uom`, {
            method: "GET",
            tokenType: "jwt",
          }),
          apiClient(`${import.meta.env.VITE_SERVER}/product/get-product-cat`, {
            method: "GET",
            tokenType: "jwt",
          }),
          apiClient(`${import.meta.env.VITE_SERVER}/product/get-brand`, {
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
        setBrands(brandRes.data);

        const p = productRes.data;
        setName(p.name);
        setDescription(p.description || "");
        setCostPrice(p.cost_price);
        setSellingPrice(p.selling_price);
        setRegularPrice(p.regular_price);
        setSelectedUom(p.uom_id);

        // FIX: Handle brand_id properly
        const brandId = p.brand_id && p.brand_id !== 0 ? p.brand_id : null;
        setSelectedBrand(brandId);

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

        // Fetch SEO data...
        // ... rest of your SEO code
      } catch (err: any) {
        toast.error(err.message || "Failed to load product");
      } finally {
        setPageLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const productSlug = name ? generateSlug(name) : "";

  // Auto-sync SEO with product name (unless user customized it)
  useEffect(() => {
    if (name && !hasManuallyEditedTitle.current)
      setSeoMeta((prev) => ({
        ...prev,
        meta_title: prev.meta_title || name,
        og_title: prev.og_title || name,
        twitter_title: prev.twitter_title || name,
      }));
  }, [name]);

  // Auto-sync SEO with description (unless user customized it)
  useEffect(() => {
    if (description && !hasManuallyEditedDesc.current) {
      const plainText = description.replace(/<[^>]*>/g, "").trim();
      const truncated =
        plainText.length > 160
          ? plainText.substring(0, 157) + "..."
          : plainText;
      setSeoMeta((prev) => ({
        ...prev,
        meta_description: prev.meta_description || truncated,
        og_description: prev.og_description || truncated,
        twitter_description: prev.twitter_description || truncated,
      }));
    }
  }, [description]);

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
      const variantsData = variations.map((v) => ({
        id: v.id,
        name: v.name || name,
        additional_price: v.additional_price ?? 0,
        images: (v.images || []).map((img) => ({
          id: img.id,
          url: img.url,
          alt_text: img.alt_text || "Product Image",
          is_primary: img.is_primary,
        })),
        barcodes: (v.barcodes || []).map((b: any) => ({
          id: b.id,
          barcode: b.barcode,
          type: b.type || "EAN13",
          is_primary: b.is_primary,
        })),
      }));

      const product = {
        uom_id: selectedUom,
        name,
        description,
        brand_id: selectedBrand,
        cost_price: costPrice,
        selling_price: sellingPrice,
        regular_price: regularPrice || sellingPrice,
        categories: selectedCategories.map((catId, index) => ({
          id: catId,
          is_primary: index === 0,
        })),
        variants: variantsData,
      };

      const res = await apiClient(
        `${import.meta.env.VITE_SERVER}/product/update-products/${id}`,
        { method: "POST", data: product, tokenType: "jwt" },
      );

      if (res.success) {
        // Save SEO
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

  const handleSaveSeo = async () => {
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
    toast.success("SEO data saved");
  };

  const handleResetSeo = () => {
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
    hasManuallyEditedTitle.current = false;
    hasManuallyEditedDesc.current = false;
    toast.success("Reset to product defaults");
  };

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
          {/* LEFT COLUMN */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Basic Info */}
            <ProductBasicInfo
              name={name}
              description={description}
              onNameChange={setName}
              onDescriptionChange={setDescription}
            />

            {/* General Settings */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 space-y-5">
              {/* Pricing */}
              <ProductPricing
                costPrice={costPrice}
                sellingPrice={sellingPrice}
                regularPrice={regularPrice}
                onCostPriceChange={setCostPrice}
                onSellingPriceChange={setSellingPrice}
                onRegularPriceChange={setRegularPrice}
              />

              <hr className="border-gray-100" />

              {/* UOM */}
              <ProductUOM
                uoms={uoms}
                selectedUom={selectedUom}
                onUomChange={setSelectedUom}
              />
            </div>

            {/* Variations - Note: isEdit={true} shows variant IDs */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
              <ProductVariations
                variations={variations}
                onVariationsChange={setVariations}
                isEdit={true}
              />
            </div>

            {/* SEO */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
              <ProductSEO
                seoMeta={seoMeta}
                description={description}
                productName={name}
                productSlug={productSlug}
                onSeoChange={setSeoMeta}
                onReset={handleResetSeo}
                onSave={handleSaveSeo}
                isSaved={seoMeta.id !== undefined}
              />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="xl:w-72 space-y-4 flex-shrink-0">
            {/* Save Changes Card */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-4">
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

            {/* Categories */}
            <ProductCategories
              categories={categories}
              selectedCategories={selectedCategories}
              onCategoriesChange={setSelectedCategories}
              onNavigateToCreate={() => router("/inventory/categories")}
            />
            <Productbrand
              brands={brands}
              selectedBrandId={selectedBrand}
              onBrandSelect={setSelectedBrand}
              onNavigateToCreate={() => router("/inventory/brand")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
