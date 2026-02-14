"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash, MoveUp, MoveDown, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuickStore } from "@/store/quickStore";

import { toast } from "sonner";
import { uploadImageToCloudinary } from "@/hook/uploadImageToCloudinary";

interface SectionsSettingsProps {
  data?: any;
  onChange: (data: any) => void;
  onSave: () => void;
  saving: boolean;
}

interface Category {
  id: number;
  name: string;
  parent_id?: number | null;
  children?: Category[];
}

export default function SectionsSettings({
  data,
  onChange,
  onSave,
  saving,
}: SectionsSettingsProps) {
  const [formData, setFormData] = useState(data || []);
  const [uploading, setUploading] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);

  const { fetchCategories, categories } = useQuickStore();

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
    fetchCategories();
  }, [data]);

  const handleChange = (sections: any[]) => {
    setFormData(sections);
    onChange(sections);
  };

  const addSection = () => {
    const newSection = {
      id: `section-${Date.now()}`,
      type: "featured_products",
      title: "New Section",
      title_bn: "নতুন সেকশন",
      status: true,
      layout: "grid",
      columns: 4,
      categoryids: [], // Initialize empty array for categories
    };
    handleChange([...formData, newSection]);
  };

  const updateSection = (index: number, field: string, value: any) => {
    const updated = [...formData];
    updated[index] = { ...updated[index], [field]: value };
    handleChange(updated);
  };

  const removeSection = (index: number) => {
    const updated = formData.filter((_: any, i: number) => i !== index);
    handleChange(updated);
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === formData.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...formData];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    handleChange(updated);
  };

  const handleImageUpload = async (
    file: File,
    sectionIndex: number,
    field: string,
    brandIndex?: number,
  ) => {
    try {
      setUploading(true);
      const imageUrl = await uploadImageToCloudinary(file);

      if (brandIndex !== undefined) {
        // Update brand logo
        const updated = [...formData];
        const brands = [...(updated[sectionIndex].brands || [])];
        brands[brandIndex] = { ...brands[brandIndex], logo: imageUrl };
        updated[sectionIndex] = { ...updated[sectionIndex], brands };
        handleChange(updated);
      } else {
        // Update section field (like banner_image)
        updateSection(sectionIndex, field, imageUrl);
      }

      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const toggleCategory = (sectionIndex: number, categoryId: number) => {
    const section = formData[sectionIndex];
    const currentIds = section.categoryids || [];

    const newIds = currentIds.includes(categoryId)
      ? currentIds.filter((id: number) => id !== categoryId)
      : [...currentIds, categoryId];

    updateSection(sectionIndex, "categoryids", newIds);
  };

  const toggleExpand = (categoryId: number) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  const renderCategoryTree = (
    categories: Category[],
    sectionIndex: number,
    level: number = 0,
  ) => {
    return categories.map((category) => (
      <div key={category.id} className="space-y-1">
        <div
          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
          style={{ marginLeft: `${level * 20}px` }}
        >
          {category.children && category.children.length > 0 && (
            <button
              type="button"
              onClick={() => toggleExpand(category.id)}
              className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
            >
              {expandedCategories.includes(category.id) ? "▼" : "▶"}
            </button>
          )}
          <input
            type="checkbox"
            checked={
              formData[sectionIndex]?.categoryids?.includes(category.id) ||
              false
            }
            onChange={() => toggleCategory(sectionIndex, category.id)}
            className="rounded border-gray-300 w-4 h-4"
          />
          <span className="text-sm font-medium">{category.name}</span>
          <span className="text-xs text-gray-500">(ID: {category.id})</span>
        </div>

        {category.children &&
          category.children.length > 0 &&
          expandedCategories.includes(category.id) && (
            <div className="ml-4">
              {renderCategoryTree(category.children, sectionIndex, level + 1)}
            </div>
          )}
      </div>
    ));
  };

  const getSelectedCategoriesText = (section: any) => {
    if (!section.categoryids || section.categoryids.length === 0) {
      return "No categories selected";
    }

    const findCategoryName = (id: number): string => {
      for (const cat of categories) {
        if (cat.id === id) return cat.name;
        if (cat.children) {
          const child = cat.children.find((c: Category) => c.id === id);
          if (child) return `${cat.name} → ${child.name}`;
        }
      }
      return id.toString();
    };

    const names = section.categoryids.map((id: number) => findCategoryName(id));
    return names.join(", ");
  };

  const getSectionFields = (type: string, index: number, section: any) => {
    switch (type) {
      case "featured_products":
        return (
          <>
            <div className="space-y-2 col-span-2">
              <Label>Select Categories (Multiple)</Label>
              <div className="border rounded-lg p-4 max-h-80 overflow-y-auto bg-white">
                {categories.length > 0 ? (
                  renderCategoryTree(categories, index)
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Loading categories...
                  </p>
                )}
              </div>
              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                <span className="font-medium">Selected: </span>
                {getSelectedCategoriesText(section)}
              </div>
            </div>
          </>
        );

      case "category_grid":
        return (
          <>
            <div className="space-y-2 col-span-2">
              <Label>Select Categories (Multiple)</Label>
              <div className="border rounded-lg p-4 max-h-80 overflow-y-auto bg-white">
                {categories.length > 0 ? (
                  renderCategoryTree(categories, index)
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    Loading categories...
                  </p>
                )}
              </div>
              <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                <span className="font-medium">Selected: </span>
                {getSelectedCategoriesText(section)}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Grid Columns</Label>
              <Select
                value={section.grid_columns?.toString() || "4"}
                onValueChange={(value) =>
                  updateSection(index, "grid_columns", parseInt(value))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 Columns</SelectItem>
                  <SelectItem value="3">3 Columns</SelectItem>
                  <SelectItem value="4">4 Columns</SelectItem>
                  <SelectItem value="5">5 Columns</SelectItem>
                  <SelectItem value="6">6 Columns</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        );

      case "banner":
        return (
          <div className="space-y-4 col-span-2">
            <div className="space-y-2">
              <Label>Banner Image</Label>
              <div className="flex gap-2">
                <Input
                  value={section.banner_image || ""}
                  onChange={(e) =>
                    updateSection(index, "banner_image", e.target.value)
                  }
                  placeholder="Image URL"
                  className="flex-1"
                />
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" disabled={uploading}>
                      <Upload className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3/12">
                    <DialogHeader>
                      <DialogTitle>Upload Banner Image</DialogTitle>
                    </DialogHeader>
                    <div className="p-4">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleImageUpload(file, index, "banner_image");
                          }
                        }}
                      />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              {section.banner_image && (
                <div className="relative w-full h-32 border rounded overflow-hidden">
                  <img
                    src={section.banner_image}
                    alt="Banner"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Banner Link</Label>
              <Input
                value={section.banner_link || ""}
                onChange={(e) =>
                  updateSection(index, "banner_link", e.target.value)
                }
                placeholder="/category/sale"
              />
            </div>
          </div>
        );

      case "featured_brands":
        return (
          <div className="space-y-4 col-span-2">
            <Label>Brands</Label>
            {(section.brands || []).map((brand: any, brandIndex: number) => (
              <div
                key={brandIndex}
                className="flex gap-2 items-start border p-3 rounded"
              >
                <div className="flex-1 space-y-2">
                  <Input
                    value={brand.name || ""}
                    onChange={(e) => {
                      const newBrands = [...(section.brands || [])];
                      newBrands[brandIndex] = {
                        ...brand,
                        name: e.target.value,
                      };
                      updateSection(index, "brands", newBrands);
                    }}
                    placeholder="Brand name"
                  />

                  <div className="flex gap-2">
                    <Input
                      value={brand.logo || ""}
                      onChange={(e) => {
                        const newBrands = [...(section.brands || [])];
                        newBrands[brandIndex] = {
                          ...brand,
                          logo: e.target.value,
                        };
                        updateSection(index, "brands", newBrands);
                      }}
                      placeholder="Logo URL"
                      className="flex-1"
                    />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={uploading}
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Upload Brand Logo</DialogTitle>
                        </DialogHeader>
                        <div className="p-4">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleImageUpload(
                                  file,
                                  index,
                                  "brands",
                                  brandIndex,
                                );
                              }
                            }}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {brand.logo && (
                    <div className="w-16 h-16 border rounded overflow-hidden">
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newBrands = (section.brands || []).filter(
                      (_: any, i: number) => i !== brandIndex,
                    );
                    updateSection(index, "brands", newBrands);
                  }}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newBrands = [
                  ...(section.brands || []),
                  { name: "", logo: "" },
                ];
                updateSection(index, "brands", newBrands);
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Brand
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Sections Settings</CardTitle>
        <Button
          onClick={onSave}
          disabled={saving || uploading}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Page Sections</h3>
          <Button onClick={addSection} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" /> Add Section
          </Button>
        </div>

        <div className="space-y-4">
          {formData.map((section: any, index: number) => (
            <Card key={section.id || index} className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">
                    {section.title || `Section ${index + 1}`}
                  </h4>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {section.type}
                  </span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveSection(index, "up")}
                    disabled={index === 0}
                  >
                    <MoveUp className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => moveSection(index, "down")}
                    disabled={index === formData.length - 1}
                  >
                    <MoveDown className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeSection(index)}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Section Type</Label>
                  <Select
                    value={section.type || "featured_products"}
                    onValueChange={(value) =>
                      updateSection(index, "type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured_products">
                        Featured Products
                      </SelectItem>
                      <SelectItem value="category_grid">
                        Category Grid
                      </SelectItem>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="featured_brands">
                        Featured Brands
                      </SelectItem>
                      <SelectItem value="recent_products">
                        Recent Products
                      </SelectItem>
                      <SelectItem value="best_sellers">Best Sellers</SelectItem>
                      <SelectItem value="custom_html">Custom HTML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={section.status}
                      onCheckedChange={(checked) =>
                        updateSection(index, "status", checked)
                      }
                    />
                    <span className="text-sm text-gray-500">
                      {section.status ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Title (English)</Label>
                  <Input
                    value={section.title || ""}
                    onChange={(e) =>
                      updateSection(index, "title", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Title (Bengali)</Label>
                  <Input
                    value={section.title_bn || ""}
                    onChange={(e) =>
                      updateSection(index, "title_bn", e.target.value)
                    }
                    placeholder="বাংলা টাইটেল"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Layout</Label>
                  <Select
                    value={section.layout || "grid"}
                    onValueChange={(value) =>
                      updateSection(index, "layout", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="slider">Slider</SelectItem>
                      <SelectItem value="list">List</SelectItem>
                      <SelectItem value="masonry">Masonry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Columns</Label>
                  <Select
                    value={section.columns?.toString() || "4"}
                    onValueChange={(value) =>
                      updateSection(index, "columns", parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Columns</SelectItem>
                      <SelectItem value="3">3 Columns</SelectItem>
                      <SelectItem value="4">4 Columns</SelectItem>
                      <SelectItem value="5">5 Columns</SelectItem>
                      <SelectItem value="6">6 Columns</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {getSectionFields(section.type, index, section)}
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
