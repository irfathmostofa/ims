"use client";

import { Input } from "@/components/ui/input";
import { Info, ImageIcon, Plus, Trash2, Star } from "lucide-react";
import SimpleImageUploader from "@/hook/imageUploader";

export interface ProductVariation {
  id?: number;
  name?: string;
  additional_price?: number;
  weight?: number;
  weight_unit?: string;
  is_replaceable?: boolean;
  sku?: string;
  images?: ProductImage[];
  barcodes?: any[];
}

export interface ProductImage {
  id?: number;
  url: string;
  alt_text: string;
  is_primary: boolean;
}

interface ProductVariationsProps {
  variations: ProductVariation[];
  onVariationsChange: (variations: ProductVariation[]) => void;
  isEdit?: boolean;
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

export default function ProductVariations({
  variations,
  onVariationsChange,
  isEdit = false,
}: ProductVariationsProps) {
  const addVariation = () => {
    onVariationsChange([
      ...variations,
      {
        name: "",
        additional_price: 0,
        weight: 0,
        weight_unit: "kg",
        is_replaceable: false,
        sku: "",
        images: [],
      },
    ]);
  };

  const removeVariation = (index: number) => {
    onVariationsChange(variations.filter((_, i) => i !== index));
  };

  const updateVariation = (index: number, field: string, value: any) => {
    onVariationsChange(
      variations.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    );
  };

  const handleAddImage = (varIndex: number, url: string) => {
    onVariationsChange(
      variations.map((v, i) =>
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
  };

  const handleRemoveImage = (varIndex: number, imgIndex: number) => {
    onVariationsChange(
      variations.map((v, i) =>
        i === varIndex
          ? { ...v, images: v.images?.filter((_, idx) => idx !== imgIndex) }
          : v,
      ),
    );
  };

  const handleMakePrimary = (varIndex: number, imgIndex: number) => {
    onVariationsChange(
      variations.map((v, i) =>
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
  };

  return (
    <div className="space-y-4">
      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3">
        <Info className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 leading-relaxed">
          <span className="font-semibold">Variations</span> let you offer
          different sizes, colors, or styles. If you skip this, a default
          variant is created automatically.
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
              key={vIndex}
              className="border border-gray-200 rounded-2xl overflow-hidden"
            >
              {/* Variation header */}
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
                  {isEdit && v.id && (
                    <span className="text-[10px] font-mono bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded">
                      ID:{v.id}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removeVariation(vIndex)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Remove variation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* Basic fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Variation Name">
                    <Input
                      placeholder="e.g. Small, Red, 500ml"
                      value={v.name ?? ""}
                      onChange={(e) =>
                        updateVariation(vIndex, "name", e.target.value)
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
                        updateVariation(
                          vIndex,
                          "additional_price",
                          e.target.value === "" ? 0 : Number(e.target.value),
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
                      onChange={(url: string) => handleAddImage(vIndex, url)}
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
                      {v.images.map((img, imgIdx) => (
                        <div
                          key={imgIdx}
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
                              onClick={() => handleRemoveImage(vIndex, imgIdx)}
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
    </div>
  );
}
