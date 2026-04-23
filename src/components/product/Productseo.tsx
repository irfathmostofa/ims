"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Globe,
  Eye,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  X,
  Facebook,
  Twitter,
} from "lucide-react";

export interface SeoMeta {
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
}

interface ProductSEOProps {
  seoMeta: SeoMeta;
  description: string;
  productName: string;
  productSlug: string;
  onSeoChange: (seoMeta: SeoMeta) => void;
  onReset: () => void;
  onSave: () => Promise<void>;
  isLoading?: boolean;
  isSaved?: boolean;
}

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

interface SEOModalProps {
  isOpen: boolean;
  onClose: () => void;
  seoMeta: SeoMeta;
  onSeoChange: (seoMeta: SeoMeta) => void;
  onReset: () => void;
  onSave: () => Promise<void>;
  isLoading?: boolean;
  isSaved?: boolean;
}

export function SEOModal({
  isOpen,
  onClose,
  seoMeta,
  onSeoChange,
  onReset,
  onSave,
}: SEOModalProps) {
  const [seoLoading, setSeoLoading] = useState(false);

  const handleSave = async () => {
    setSeoLoading(true);
    try {
      await onSave();
      onClose();
    } finally {
      setSeoLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:rounded-2xl sm:max-w-3xl max-h-[95dvh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-gray-900">SEO Settings</h2>
            <p className="text-xs text-gray-400">
              Optimize how this product appears in search engines
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onReset}
              className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
              title="Reset to product defaults"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
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
                hint={`${seoMeta.meta_title?.length || 0}/60`}
              >
                <Input
                  value={seoMeta.meta_title}
                  onChange={(e) =>
                    onSeoChange({
                      ...seoMeta,
                      meta_title: e.target.value,
                    })
                  }
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
                  onChange={(e) =>
                    onSeoChange({
                      ...seoMeta,
                      meta_description: e.target.value,
                    })
                  }
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
                      onSeoChange({
                        ...seoMeta,
                        meta_keywords: e.target.value,
                      })
                    }
                    placeholder="keyword1, keyword2"
                    className="h-10 rounded-xl border-gray-200"
                  />
                </Field>
                <Field label="Canonical URL">
                  <Input
                    value={seoMeta.canonical_url}
                    onChange={(e) =>
                      onSeoChange({
                        ...seoMeta,
                        canonical_url: e.target.value,
                      })
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
                    onSeoChange({
                      ...seoMeta,
                      og_title: e.target.value,
                    })
                  }
                  placeholder="Open Graph title"
                  className="h-10 rounded-xl border-gray-200"
                />
              </Field>
              <Field label="OG Description">
                <Input
                  value={seoMeta.og_description}
                  onChange={(e) =>
                    onSeoChange({
                      ...seoMeta,
                      og_description: e.target.value,
                    })
                  }
                  placeholder="Open Graph description"
                  className="h-10 rounded-xl border-gray-200"
                />
              </Field>
              <Field label="OG Image URL" hint="Recommended: 1200×630px">
                <Input
                  value={seoMeta.og_image}
                  onChange={(e) =>
                    onSeoChange({
                      ...seoMeta,
                      og_image: e.target.value,
                    })
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
                    onSeoChange({
                      ...seoMeta,
                      twitter_title: e.target.value,
                    })
                  }
                  placeholder="Twitter title"
                  className="h-10 rounded-xl border-gray-200"
                />
              </Field>
              <Field label="Twitter Description">
                <Input
                  value={seoMeta.twitter_description}
                  onChange={(e) =>
                    onSeoChange({
                      ...seoMeta,
                      twitter_description: e.target.value,
                    })
                  }
                  placeholder="Twitter description"
                  className="h-10 rounded-xl border-gray-200"
                />
              </Field>
              <Field label="Twitter Image URL">
                <Input
                  value={seoMeta.twitter_image}
                  onChange={(e) =>
                    onSeoChange({
                      ...seoMeta,
                      twitter_image: e.target.value,
                    })
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
                      onSeoChange({
                        ...seoMeta,
                        [item.key]: e.target.checked,
                      })
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
                    onSeoChange({
                      ...seoMeta,
                      schema_json: parsed,
                    });
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
            onClick={onReset}
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
              onClick={onClose}
            >
              Cancel
            </Button>
            <button
              onClick={handleSave}
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
  );
}

export default function ProductSEO({
  seoMeta,
  description,
  productName,
  productSlug,
  onSeoChange,
  onReset,
  onSave,
  isLoading = false,
  isSaved = false,
}: ProductSEOProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-4">
      {/* Live search preview */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3 flex items-center gap-1.5">
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
            {seoMeta.meta_title || productName || "Product Title"}
          </p>
          <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
            {seoMeta.meta_description ||
              description.replace(/<[^>]*>/g, "") ||
              "Your product description will appear here in search results…"}
          </p>
        </div>
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
        {isSaved && seoMeta.id && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600">
            <CheckCircle2 className="w-3 h-3" />
            Saved (ID: {seoMeta.id})
          </span>
        )}
      </div>

      {/* Advanced button */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full py-2.5 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <Globe className="w-4 h-4" />
        Advanced SEO (OG, Twitter, Schema, Indexing)
      </button>

      {/* SEO Modal */}
      <SEOModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        seoMeta={seoMeta}
        onSeoChange={onSeoChange}
        onReset={onReset}
        onSave={onSave}
        isLoading={isLoading}
        isSaved={isSaved}
      />
    </div>
  );
}
