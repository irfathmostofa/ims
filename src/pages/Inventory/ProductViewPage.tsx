"use client";

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Barcode from "react-barcode";
import { printView } from "@/components/utils/print";
import { toast } from "sonner";
import { apiClient } from "@/hook/apiClient";
import Loader from "@/components/utils/loader";
import {
  Package,
  Image as ImageIcon,
  Printer,
  Pencil,
  ChevronLeft,
  Star,
  Tag,
  Layers,
  DollarSign,
  BarChart2,
  Hash,
  Info,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ChevronDown,
} from "lucide-react";

function StatCard({
  icon,
  label,
  value,
  sub,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 border ${accent ? "bg-gray-900 border-gray-900" : "bg-white border-gray-200"}`}
    >
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${accent ? "bg-white/10" : "bg-gray-100"}`}
      >
        <span className={accent ? "text-white" : "text-gray-600"}>{icon}</span>
      </div>
      <p
        className={`text-xs font-medium mb-0.5 ${accent ? "text-gray-400" : "text-gray-400"}`}
      >
        {label}
      </p>
      <p
        className={`text-xl font-bold leading-tight ${accent ? "text-white" : "text-gray-900"}`}
      >
        {value}
      </p>
      {sub && (
        <p
          className={`text-xs mt-0.5 ${accent ? "text-gray-400" : "text-gray-500"}`}
        >
          {sub}
        </p>
      )}
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
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-gray-100">
      <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center text-white flex-shrink-0">
        {icon}
      </div>
      <h2 className="font-bold text-gray-900 text-base flex-1">{title}</h2>
      {badge}
    </div>
  );
}

export default function ProductViewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [copies, setCopies] = useState(20);
  const [loading, setLoading] = useState(false);
  const [expandedVariant, setExpandedVariant] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await apiClient(
        `${import.meta.env.VITE_SERVER}/product/products/${id}`,
        { method: "GET", tokenType: "jwt" },
      );
      if (data.data) setProduct(data.data);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch product details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  if (loading) return <Loader />;

  if (!product)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">No product found</p>
          <button
            onClick={() => router(-1)}
            className="mt-3 text-sm text-blue-600 hover:underline"
          >
            Go back
          </button>
        </div>
      </div>
    );

  const isActive = product.status === "A";
  const margin =
    product.cost_price && product.selling_price
      ? (
          ((product.selling_price - product.cost_price) /
            product.selling_price) *
          100
        ).toFixed(1)
      : null;
  const totalBarcodes =
    product.variants?.reduce(
      (acc: number, v: any) => acc + (v.barcodes?.length || 0),
      0,
    ) || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Sticky top bar ─────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 shadow-sm">
        <div className="max-w-full mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => router(-1)}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 flex-shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-gray-900 truncate leading-tight">
                {product.name}
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">
                {product.categories?.[0]?.name && (
                  <span>{product.categories[0].name} · </span>
                )}
                {product.uom_name} ({product.uom_symbol})
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              to={`/inventory/products/${product.id}/edit`}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-semibold transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Edit</span>
            </Link>
            <button
              onClick={() => setTimeout(() => printView("barcodeArea"), 300)}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print Barcodes</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* ── Stats ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            accent
            icon={<DollarSign className="w-4 h-4" />}
            label="Selling Price"
            value={`$${product.selling_price}`}
            sub={`Cost: $${product.cost_price}`}
          />
          <StatCard
            icon={<TrendingUp className="w-4 h-4" />}
            label="Margin"
            value={margin ? `${margin}%` : "—"}
            sub="Gross margin"
          />
          <StatCard
            icon={<Layers className="w-4 h-4" />}
            label="Total Stock"
            value={`${product.total_stock || 0}`}
            sub="units available"
          />
          <StatCard
            icon={<Package className="w-4 h-4" />}
            label="Variants"
            value={product.variants?.length || 0}
            sub={`${totalBarcodes} barcodes`}
          />
        </div>

        {/* ── Product details ────────────────────────────── */}
        <Card>
          <SectionHeader
            icon={<Info className="w-4 h-4" />}
            title="Product Details"
            badge={
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}
              >
                {isActive ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                {isActive ? "Active" : "Inactive"}
              </span>
            }
          />
          <div className="p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                label: "Product Code",
                value: product.code,
                icon: <Hash className="w-3.5 h-3.5" />,
              },
              {
                label: "Unit of Measure",
                value: `${product.uom_name} (${product.uom_symbol})`,
                icon: <BarChart2 className="w-3.5 h-3.5" />,
              },
              {
                label: "Regular Price",
                value: `$${product.regular_price || product.selling_price}`,
                icon: <Tag className="w-3.5 h-3.5" />,
              },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 text-gray-400 mb-1.5">
                  {icon}
                  <span className="text-xs font-medium">{label}</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">{value}</p>
              </div>
            ))}

            {product.categories?.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3.5">
                <div className="flex items-center gap-1.5 text-gray-400 mb-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Categories</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {product.categories.map((cat: any, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-white border border-gray-200 rounded-full text-xs text-gray-700 font-medium"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.description && (
              <div className="bg-gray-50 rounded-xl p-3.5 sm:col-span-2 lg:col-span-3">
                <div className="flex items-center gap-1.5 text-gray-400 mb-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Description</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* ── Variants ───────────────────────────────────── */}
        <Card>
          <SectionHeader
            icon={<Package className="w-4 h-4" />}
            title="Variants"
            badge={
              <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                {product.variants?.length || 0}
              </span>
            }
          />
          <div className="p-4">
            {!product.variants?.length ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                  <Package className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400 font-medium">
                  No variants available
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {product.variants.map((variant: any, vIdx: number) => {
                  const isExpanded = expandedVariant === vIdx;
                  const variantActive = variant.status === "A";
                  const primaryImg = variant.images?.find(
                    (img: any) => img.is_primary,
                  );

                  return (
                    <div
                      key={variant.id}
                      className={`border rounded-2xl overflow-hidden transition-all ${isExpanded ? "border-gray-300 shadow-sm" : "border-gray-100"}`}
                    >
                      {/* Header row */}
                      <div
                        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors select-none"
                        onClick={() =>
                          setExpandedVariant(isExpanded ? null : vIdx)
                        }
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {primaryImg?.url ? (
                            <img
                              src={primaryImg.url}
                              alt={variant.name}
                              className="w-10 h-10 rounded-xl object-cover border border-gray-100 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <ImageIcon className="w-4 h-4 text-gray-300" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {variant.name || `Variant #${variant.id}`}
                            </p>
                            <p className="text-xs text-gray-400">
                              {variant.code} · Stock: {variant.stock || 0}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          {variant.additional_price > 0 && (
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full hidden sm:inline">
                              +${variant.additional_price}
                            </span>
                          )}
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${variantActive ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500"}`}
                          >
                            {variantActive ? "Active" : "Inactive"}
                          </span>
                          <ChevronDown
                            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                          />
                        </div>
                      </div>

                      {/* Expanded */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 p-4 space-y-4 bg-gray-50/50">
                          {/* Images */}
                          {variant.images?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <ImageIcon className="w-3 h-3" />
                                Images ({variant.images.length})
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {variant.images.map((img: any, i: number) => (
                                  <div
                                    key={i}
                                    className={`relative rounded-xl overflow-hidden border-2 ${img.is_primary ? "border-gray-900 ring-2 ring-gray-900/20" : "border-gray-100"}`}
                                  >
                                    <img
                                      src={img.url}
                                      alt={img.alt_text || `Image ${i + 1}`}
                                      className="h-20 w-20 object-cover"
                                    />
                                    {img.is_primary && (
                                      <div className="absolute top-1 left-1">
                                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Barcodes */}
                          {variant.barcodes?.length > 0 && (
                            <div>
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                <Hash className="w-3 h-3" />
                                Barcodes ({variant.barcodes.length})
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {variant.barcodes.map((b: any, i: number) => (
                                  <div
                                    key={i}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono ${b.is_primary ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-200"}`}
                                  >
                                    {b.barcode}
                                    {b.is_primary && (
                                      <span className="text-[10px] font-sans font-semibold opacity-60">
                                        PRIMARY
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Meta */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {[
                              {
                                label: "Additional Price",
                                value:
                                  variant.additional_price > 0
                                    ? `+$${variant.additional_price}`
                                    : "—",
                              },
                              {
                                label: "Weight",
                                value: variant.weight
                                  ? `${variant.weight} ${variant.weight_unit || "kg"}`
                                  : "—",
                              },
                              { label: "SKU", value: variant.sku || "—" },
                              {
                                label: "Replaceable",
                                value: variant.is_replaceable ? "Yes" : "No",
                              },
                              { label: "Variant ID", value: `#${variant.id}` },
                            ].map(({ label, value }) => (
                              <div
                                key={label}
                                className="bg-white rounded-xl p-3 border border-gray-100"
                              >
                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                                  {label}
                                </p>
                                <p className="text-sm font-semibold text-gray-800">
                                  {value}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {/* ── Barcode print setup ────────────────────────── */}
        <Card>
          <SectionHeader
            icon={<Printer className="w-4 h-4" />}
            title="Barcode Print Setup"
          />
          <div className="p-5 space-y-4">
            <p className="text-sm text-gray-500">
              Configure copies per barcode and preview before printing.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end pt-2 border-t border-gray-100">
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-gray-700">
                  Copies per Barcode
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCopies((c) => Math.max(1, c - 1))}
                    className="w-9 h-9 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    value={copies}
                    onChange={(e) =>
                      setCopies(Math.max(1, Number(e.target.value)))
                    }
                    className="w-20 text-center border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-gray-200"
                  />
                  <button
                    onClick={() => setCopies((c) => c + 1)}
                    className="w-9 h-9 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors font-bold text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                onClick={() => setTimeout(() => printView("barcodeArea"), 300)}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-bold transition-colors sm:ml-auto"
              >
                <Printer className="w-4 h-4" />
                Print All Barcodes
              </button>
            </div>

            {/* Preview */}
            {totalBarcodes > 0 && (
              <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Preview (first barcode per variant)
                </p>
                <div className="flex flex-wrap gap-3 max-h-48 overflow-y-auto">
                  {product.variants?.map((v: any) =>
                    v.barcodes?.slice(0, 1).map((b: any, i: number) => (
                      <div
                        key={`${v.id}-${i}`}
                        className="bg-white rounded-xl border border-gray-200 p-2 flex flex-col items-center"
                      >
                        <Barcode
                          value={b.barcode}
                          height={45}
                          width={1.1}
                          fontSize={10}
                          margin={0}
                        />
                        <p className="text-[10px] text-gray-500 mt-1 truncate max-w-[90px] text-center">
                          {v.name}
                        </p>
                      </div>
                    )),
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ── Hidden print area ─────────────────────────────── */}
      <div id="barcodeArea" className="hidden print_section print:block">
        <div className="p-4">
          <div className="text-center mb-6 border-b pb-3">
            <h1 className="text-2xl font-bold">
              {product.name} — Barcode Sheet
            </h1>
            <p className="text-sm text-gray-600">
              Printed on {new Date().toLocaleString()}
            </p>
          </div>
          {product.variants?.length > 0 ? (
            product.variants.map((variant: any) => (
              <div key={variant.id} className="mb-10 break-inside-avoid">
                <h2 className="text-sm font-semibold mb-2">
                  Variant: {variant.name || `#${variant.id}`}
                </h2>
                <div className="grid grid-cols-5 gap-4 justify-items-center">
                  {variant.barcodes?.length > 0 ? (
                    variant.barcodes.map((b: any) =>
                      [...Array(copies)].map((_, idx) => (
                        <div
                          key={`${b.id}-${idx}`}
                          className="label-card flex flex-col items-center justify-center text-center"
                        >
                          <Barcode
                            value={b.barcode}
                            height={60}
                            width={1.2}
                            fontSize={12}
                            margin={0}
                          />
                          <p className="text-xs font-medium mt-1 truncate w-full">
                            {variant.name?.length > 18
                              ? variant.name.slice(0, 18) + "…"
                              : variant.name}
                          </p>
                        </div>
                      )),
                    )
                  ) : (
                    <p className="text-gray-500 text-sm col-span-full">
                      No barcodes for this variant
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center">No variants available</p>
          )}
        </div>
      </div>
    </div>
  );
}
