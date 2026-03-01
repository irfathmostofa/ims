"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { apiClient } from "@/hook/apiClient";
import SimpleImageUploader from "@/hook/imageUploader";
import CategoryTree from "@/components/ui/CategoryTree";
import { useNavigate, useParams } from "react-router-dom";
import { Trash2, Info } from "lucide-react";

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
};

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

export default function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const router = useNavigate();

  const [loading, setLoading] = useState(false);
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

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);
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

      const product = productRes.data;
      setName(product.name);
      setDescription(product.description || "");
      setCostPrice(product.cost_price);
      setSellingPrice(product.selling_price);
      setRegularPrice(product.regular_price);
      setSelectedUom(product.uom_id);
      setSelectedCategories(product.categories?.map((c: any) => c.id) || []);

      // Map variants with their images and barcodes
      setVariations(
        product.variants?.map((v: any) => ({
          id: v.id,
          name: v.name,
          additional_price: v.additional_price || 0,
          images: v.images || [],
          barcodes: v.barcodes || [],
        })) || [],
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to load product details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const toggleCategory = (catId: number) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId],
    );
  };

  const addVariation = () =>
    setVariations((prev) => [
      ...prev,
      { name: "", additional_price: 0, images: [], barcodes: [] },
    ]);

  const removeVariation = (index: number) =>
    setVariations((prev) => prev.filter((_, i) => i !== index));

  // Image handlers for specific variant
  const handleAddImageToVariant = (varIndex: number, url: string) => {
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
  };

  const handleRemoveImage = (varIndex: number, imgIndex: number) => {
    setVariations((prev) =>
      prev.map((v, i) =>
        i === varIndex
          ? {
              ...v,
              images: v.images?.filter((_, idx) => idx !== imgIndex),
            }
          : v,
      ),
    );
  };

  const handleMakePrimary = (varIndex: number, imgIndex: number) => {
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
  };

  // Validation
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

  // Update product
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
        toast.success("Product updated successfully! 🎉");
        router("/inventory/products");
      } else {
        toast.error(res.message || "Failed to update product");
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error updating product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-gray-600 mt-1">
          Update product details and variants
        </p>
      </div>

      <div className="flex gap-6">
        {/* LEFT */}
        <div className="flex-1 space-y-6">
          <div>
            <Label className="text-base font-semibold mb-2">
              Product Name *
            </Label>
            <Input
              placeholder="Product name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-lg"
            />
          </div>

          <div>
            <Label className="text-base font-semibold mb-2">Description</Label>
            <textarea
              placeholder="Write product description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded-md p-3 h-32 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Tabs defaultValue="general" className="mt-6">
            <TabsList className="rounded-lg p-1 bg-gray-100">
              <TabsTrigger value="general">General Info</TabsTrigger>
              <TabsTrigger value="variations">Variations & Images</TabsTrigger>
            </TabsList>

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
                    className="w-full border rounded-md p-2 mt-1 focus:ring-2 focus:ring-blue-500"
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

            <TabsContent value="variations" className="space-y-4 mt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 mb-4">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Managing Variants</p>
                  <p>
                    Each variant can have its own images and pricing. Images are
                    unique to each variant.
                  </p>
                </div>
              </div>

              {variations.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <p className="text-gray-600 mb-4">No variations yet</p>
                  <Button
                    onClick={addVariation}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Add First Variation
                  </Button>
                </div>
              ) : (
                <>
                  {variations.map((v, vIndex) => (
                    <div
                      key={vIndex}
                      className="p-4 border rounded-lg bg-white shadow-sm space-y-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">
                          Variation #{vIndex + 1}
                          {v.id && (
                            <span className="text-sm text-gray-500 ml-2">
                              (ID: {v.id})
                            </span>
                          )}
                        </h4>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => removeVariation(vIndex)}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Variation Name</Label>
                          <Input
                            placeholder="e.g., Small, Red, 500ml"
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
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-sm font-semibold">
                            Images for this variation ({v.images?.length || 0})
                          </Label>
                          <SimpleImageUploader
                            onChange={(url: string) =>
                              handleAddImageToVariant(vIndex, url)
                            }
                          />
                        </div>

                        {!v.images || v.images.length === 0 ? (
                          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                            <p className="text-sm text-gray-600">
                              No images for this variant
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-4 gap-3">
                            {v.images.map((img, imgIdx) => (
                              <div
                                key={imgIdx}
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

                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col gap-1 items-center justify-center transition-opacity">
                                  <button
                                    onClick={() =>
                                      handleRemoveImage(vIndex, imgIdx)
                                    }
                                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded"
                                  >
                                    Remove
                                  </button>
                                  {!img.is_primary && (
                                    <button
                                      onClick={() =>
                                        handleMakePrimary(vIndex, imgIdx)
                                      }
                                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded"
                                    >
                                      Set Primary
                                    </button>
                                  )}
                                </div>

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
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <h3 className="font-semibold mb-3 text-gray-900">Update Product</h3>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => router("/inventory/products")}
              >
                Cancel
              </Button>
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="px-4 py-2 bw-primary rounded-lg disabled:opacity-50"
              >
                {loading ? "Updating..." : "Update Product"}
              </button>
            </div>
          </div>

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

          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <Label className="font-semibold">Unit of Measure (UOM) *</Label>
            <select
              className="w-full border rounded-md p-2 mt-2 focus:ring-2 focus:ring-blue-500"
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
