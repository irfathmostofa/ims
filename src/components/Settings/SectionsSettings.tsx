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
  const [uploadingForBanner, setUploadingForBanner] = useState<{
    sectionIndex: number;
    bannerIndex: number;
  } | null>(null);
  const [uploadingForBrand, setUploadingForBrand] = useState<{
    sectionIndex: number;
    brandIndex: number;
  } | null>(null);

  const { fetchCategories, categories } = useQuickStore();
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
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
      categoryids: [],
      bg_color: "#FFFFFF",
      text_color: "#000000",
      padding: "p-6",
      margin: "mb-8",
      border_radius: "rounded-lg",
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

  // Banner Image Upload
  const handleBannerImageUpload = async (
    file: File,
    sectionIndex: number,
    bannerIndex: number,
  ) => {
    try {
      setUploading(true);
      setUploadingForBanner({ sectionIndex, bannerIndex });
      const imageUrl = await uploadImageToCloudinary(file);

      const updated = [...formData];
      const banners = [...(updated[sectionIndex].banners || [])];
      banners[bannerIndex] = { ...banners[bannerIndex], image: imageUrl };
      updated[sectionIndex] = { ...updated[sectionIndex], banners };
      handleChange(updated);

      toast.success("Banner image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload banner image");
      console.error(error);
    } finally {
      setUploading(false);
      setUploadingForBanner(null);
    }
  };

  // Brand Logo Upload
  const handleBrandLogoUpload = async (
    file: File,
    sectionIndex: number,
    brandIndex: number,
  ) => {
    try {
      setUploading(true);
      setUploadingForBrand({ sectionIndex, brandIndex });
      const imageUrl = await uploadImageToCloudinary(file);

      const updated = [...formData];
      const brands = [...(updated[sectionIndex].brands || [])];
      brands[brandIndex] = { ...brands[brandIndex], logo: imageUrl };
      updated[sectionIndex] = { ...updated[sectionIndex], brands };
      handleChange(updated);

      toast.success("Brand logo uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload brand logo");
      console.error(error);
    } finally {
      setUploading(false);
      setUploadingForBrand(null);
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

  // Banner fields component
  const renderBannerFields = (section: any, index: number) => {
    return (
      <div className="space-y-4 col-span-2">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Banners</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newBanner = {
                image: "",
                title: "New Banner",
                title_bn: "নতুন ব্যানার",
                subtitle: "",
                subtitle_bn: "",
                button_text: "Shop Now",
                button_text_bn: "এখনই কিনুন",
                link: "/category",
                size: "half",
                text_position: "center",
                text_color: "#FFFFFF",
                overlay_opacity: 40,
              };
              const updated = [...formData];
              updated[index].banners = [
                ...(updated[index].banners || []),
                newBanner,
              ];
              handleChange(updated);
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Banner
          </Button>
        </div>

        <div className="space-y-4">
          {(section.banners || []).map((banner: any, bannerIndex: number) => (
            <Card
              key={bannerIndex}
              className="p-4 border-l-4 border-l-blue-500"
            >
              <div className="flex justify-between items-center mb-4">
                <h5 className="font-medium">Banner {bannerIndex + 1}</h5>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const updated = [...formData];
                    updated[index].banners = (
                      updated[index].banners || []
                    ).filter((_: any, i: number) => i !== bannerIndex);
                    handleChange(updated);
                  }}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Image */}
                <div className="col-span-2 space-y-2">
                  <Label>Banner Image</Label>
                  <div className="flex gap-2">
                    <Input
                      value={banner.image || ""}
                      onChange={(e) => {
                        const updated = [...formData];
                        updated[index].banners[bannerIndex].image =
                          e.target.value;
                        handleChange(updated);
                      }}
                      placeholder="/images/banner.jpg"
                      className="flex-1"
                    />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={
                            uploading &&
                            uploadingForBanner?.sectionIndex === index &&
                            uploadingForBanner?.bannerIndex === bannerIndex
                          }
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
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
                                handleBannerImageUpload(
                                  file,
                                  index,
                                  bannerIndex,
                                );
                              }
                            }}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {banner.image && (
                    <div className="relative w-full h-32 border rounded overflow-hidden">
                      <img
                        src={banner.image}
                        alt="Banner"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Titles */}
                <div className="space-y-2">
                  <Label>Title (English)</Label>
                  <Input
                    value={banner.title || ""}
                    onChange={(e) => {
                      const updated = [...formData];
                      updated[index].banners[bannerIndex].title =
                        e.target.value;
                      handleChange(updated);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Title (Bengali)</Label>
                  <Input
                    value={banner.title_bn || ""}
                    onChange={(e) => {
                      const updated = [...formData];
                      updated[index].banners[bannerIndex].title_bn =
                        e.target.value;
                      handleChange(updated);
                    }}
                    placeholder="বাংলা টাইটেল"
                  />
                </div>

                {/* Subtitles */}
                <div className="space-y-2">
                  <Label>Subtitle (English)</Label>
                  <Input
                    value={banner.subtitle || ""}
                    onChange={(e) => {
                      const updated = [...formData];
                      updated[index].banners[bannerIndex].subtitle =
                        e.target.value;
                      handleChange(updated);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subtitle (Bengali)</Label>
                  <Input
                    value={banner.subtitle_bn || ""}
                    onChange={(e) => {
                      const updated = [...formData];
                      updated[index].banners[bannerIndex].subtitle_bn =
                        e.target.value;
                      handleChange(updated);
                    }}
                    placeholder="বাংলা সাবটাইটেল"
                  />
                </div>

                {/* Button Settings */}
                <div className="space-y-2">
                  <Label>Button Text (English)</Label>
                  <Input
                    value={banner.button_text || "Shop Now"}
                    onChange={(e) => {
                      const updated = [...formData];
                      updated[index].banners[bannerIndex].button_text =
                        e.target.value;
                      handleChange(updated);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Button Text (Bengali)</Label>
                  <Input
                    value={banner.button_text_bn || "এখনই কিনুন"}
                    onChange={(e) => {
                      const updated = [...formData];
                      updated[index].banners[bannerIndex].button_text_bn =
                        e.target.value;
                      handleChange(updated);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Button Link</Label>
                  <Input
                    value={banner.link || ""}
                    onChange={(e) => {
                      const updated = [...formData];
                      updated[index].banners[bannerIndex].link = e.target.value;
                      handleChange(updated);
                    }}
                    placeholder="/category/sale"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Button Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={banner.button_color || "#3B82F6"}
                      onChange={(e) => {
                        const updated = [...formData];
                        updated[index].banners[bannerIndex].button_color =
                          e.target.value;
                        handleChange(updated);
                      }}
                      className="w-12 p-1"
                    />
                    <Input
                      value={banner.button_color || "#3B82F6"}
                      onChange={(e) => {
                        const updated = [...formData];
                        updated[index].banners[bannerIndex].button_color =
                          e.target.value;
                        handleChange(updated);
                      }}
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Display Settings */}
                <div className="space-y-2">
                  <Label>Size</Label>
                  <Select
                    value={banner.size || "half"}
                    onValueChange={(value) => {
                      const updated = [...formData];
                      updated[index].banners[bannerIndex].size = value;
                      handleChange(updated);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Width</SelectItem>
                      <SelectItem value="half">Half Width</SelectItem>
                      <SelectItem value="third">One Third</SelectItem>
                      <SelectItem value="quarter">One Quarter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Text Position</Label>
                  <Select
                    value={banner.text_position || "center"}
                    onValueChange={(value) => {
                      const updated = [...formData];
                      updated[index].banners[bannerIndex].text_position = value;
                      handleChange(updated);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={banner.text_color || "#FFFFFF"}
                      onChange={(e) => {
                        const updated = [...formData];
                        updated[index].banners[bannerIndex].text_color =
                          e.target.value;
                        handleChange(updated);
                      }}
                      className="w-12 p-1"
                    />
                    <Input
                      value={banner.text_color || "#FFFFFF"}
                      onChange={(e) => {
                        const updated = [...formData];
                        updated[index].banners[bannerIndex].text_color =
                          e.target.value;
                        handleChange(updated);
                      }}
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Overlay Opacity (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={banner.overlay_opacity || 40}
                    onChange={(e) => {
                      const updated = [...formData];
                      updated[index].banners[bannerIndex].overlay_opacity =
                        parseInt(e.target.value);
                      handleChange(updated);
                    }}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={banner.show_button || true}
                    onCheckedChange={(checked) => {
                      const updated = [...formData];
                      updated[index].banners[bannerIndex].show_button = checked;
                      handleChange(updated);
                    }}
                  />
                  <Label>Show Button</Label>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  // Featured Brands fields
  const renderBrandFields = (section: any, index: number) => {
    return (
      <div className="space-y-4 col-span-2">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Brands</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const updated = [...formData];
              updated[index].brands = [
                ...(updated[index].brands || []),
                { name: "", name_bn: "", logo: "", link: "" },
              ];
              handleChange(updated);
            }}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Brand
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {(section.brands || []).map((brand: any, brandIndex: number) => (
            <Card key={brandIndex} className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h5 className="font-medium">Brand {brandIndex + 1}</h5>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const updated = [...formData];
                    updated[index].brands = (
                      updated[index].brands || []
                    ).filter((_: any, i: number) => i !== brandIndex);
                    handleChange(updated);
                  }}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>Brand Name (English)</Label>
                  <Input
                    value={brand.name || ""}
                    onChange={(e) => {
                      const updated = [...formData];
                      updated[index].brands[brandIndex].name = e.target.value;
                      handleChange(updated);
                    }}
                    placeholder="Brand name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Brand Name (Bengali)</Label>
                  <Input
                    value={brand.name_bn || ""}
                    onChange={(e) => {
                      const updated = [...formData];
                      updated[index].brands[brandIndex].name_bn =
                        e.target.value;
                      handleChange(updated);
                    }}
                    placeholder="ব্র্যান্ডের নাম"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex gap-2">
                    <Input
                      value={brand.logo || ""}
                      onChange={(e) => {
                        const updated = [...formData];
                        updated[index].brands[brandIndex].logo = e.target.value;
                        handleChange(updated);
                      }}
                      placeholder="Logo URL"
                      className="flex-1"
                    />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={
                            uploading &&
                            uploadingForBrand?.sectionIndex === index &&
                            uploadingForBrand?.brandIndex === brandIndex
                          }
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
                                handleBrandLogoUpload(file, index, brandIndex);
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

                <div className="space-y-2">
                  <Label>Brand Link</Label>
                  <Input
                    value={brand.link || ""}
                    onChange={(e) => {
                      const updated = [...formData];
                      updated[index].brands[brandIndex].link = e.target.value;
                      handleChange(updated);
                    }}
                    placeholder="/brand/nike"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
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

            <div className="space-y-2">
              <Label>Products Per Page</Label>
              <Input
                type="number"
                value={section.products_per_page || 12}
                onChange={(e) =>
                  updateSection(
                    index,
                    "products_per_page",
                    parseInt(e.target.value),
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select
                value={section.sort_by || "newest"}
                onValueChange={(value) =>
                  updateSection(index, "sort_by", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="price_low">Price: Low to High</SelectItem>
                  <SelectItem value="price_high">Price: High to Low</SelectItem>
                  <SelectItem value="popular">Most Popular</SelectItem>
                </SelectContent>
              </Select>
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

            <div className="space-y-2">
              <Label>Show Category Images</Label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={section.show_images || false}
                  onCheckedChange={(checked) =>
                    updateSection(index, "show_images", checked)
                  }
                />
                <span className="text-sm text-gray-500">
                  Display category images
                </span>
              </div>
            </div>
          </>
        );

      case "banner":
        return renderBannerFields(section, index);

      case "featured_brands":
        return renderBrandFields(section, index);

      case "recent_products":
        return (
          <>
            <div className="space-y-2">
              <Label>Products Count</Label>
              <Input
                type="number"
                value={section.products_count || 8}
                onChange={(e) =>
                  updateSection(
                    index,
                    "products_count",
                    parseInt(e.target.value),
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Days to consider</Label>
              <Input
                type="number"
                value={section.days || 30}
                onChange={(e) =>
                  updateSection(index, "days", parseInt(e.target.value))
                }
                placeholder="Show products from last X days"
              />
            </div>
          </>
        );

      case "best_sellers":
        return (
          <>
            <div className="space-y-2">
              <Label>Products Count</Label>
              <Input
                type="number"
                value={section.products_count || 8}
                onChange={(e) =>
                  updateSection(
                    index,
                    "products_count",
                    parseInt(e.target.value),
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Sort By</Label>
              <Select
                value={section.sort_by || "sales"}
                onValueChange={(value) =>
                  updateSection(index, "sort_by", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Most Sold</SelectItem>
                  <SelectItem value="revenue">Highest Revenue</SelectItem>
                  <SelectItem value="rating">Top Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
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

                {/* Background Settings */}
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={section.bg_color || "#FFFFFF"}
                      onChange={(e) =>
                        updateSection(index, "bg_color", e.target.value)
                      }
                      className="w-12 p-1"
                    />
                    <Input
                      value={section.bg_color || "#FFFFFF"}
                      onChange={(e) =>
                        updateSection(index, "bg_color", e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={section.text_color || "#000000"}
                      onChange={(e) =>
                        updateSection(index, "text_color", e.target.value)
                      }
                      className="w-12 p-1"
                    />
                    <Input
                      value={section.text_color || "#000000"}
                      onChange={(e) =>
                        updateSection(index, "text_color", e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Padding</Label>
                  <Select
                    value={section.padding || "p-6"}
                    onValueChange={(value) =>
                      updateSection(index, "padding", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="p-0">None</SelectItem>
                      <SelectItem value="p-2">Small</SelectItem>
                      <SelectItem value="p-4">Medium</SelectItem>
                      <SelectItem value="p-6">Large</SelectItem>
                      <SelectItem value="p-8">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Margin Bottom</Label>
                  <Select
                    value={section.margin || "mb-8"}
                    onValueChange={(value) =>
                      updateSection(index, "margin", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mb-0">None</SelectItem>
                      <SelectItem value="mb-2">Small</SelectItem>
                      <SelectItem value="mb-4">Medium</SelectItem>
                      <SelectItem value="mb-8">Large</SelectItem>
                      <SelectItem value="mb-12">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Border Radius</Label>
                  <Select
                    value={section.border_radius || "rounded-lg"}
                    onValueChange={(value) =>
                      updateSection(index, "border_radius", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rounded-none">None</SelectItem>
                      <SelectItem value="rounded">Small</SelectItem>
                      <SelectItem value="rounded-lg">Medium</SelectItem>
                      <SelectItem value="rounded-xl">Large</SelectItem>
                      <SelectItem value="rounded-full">Full</SelectItem>
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
