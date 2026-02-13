"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash, MoveUp, MoveDown } from "lucide-react";
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

interface SectionsSettingsProps {
  data?: any;
  onChange: (data: any) => void;
  onSave: () => void;
  saving: boolean;
}

export default function SectionsSettings({
  data,
  onChange,
  onSave,
  saving,
}: SectionsSettingsProps) {
  const [formData, setFormData] = useState(data || []);

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

  const getSectionFields = (type: string, index: number, section: any) => {
    switch (type) {
      case "featured_products":
        return (
          <>
            <div className="space-y-2">
              <Label>Category IDs (comma separated)</Label>
              <Input
                value={section.categoryids?.join(", ") || ""}
                onChange={(e) => {
                  const ids = e.target.value
                    .split(",")
                    .map((id) => parseInt(id.trim()))
                    .filter((id) => !isNaN(id));
                  updateSection(index, "categoryids", ids);
                }}
                placeholder="1, 2, 3, 4"
              />
            </div>
          </>
        );

      case "category_grid":
        return (
          <>
            <div className="space-y-2">
              <Label>Category IDs (comma separated)</Label>
              <Input
                value={section.categoryids?.join(", ") || ""}
                onChange={(e) => {
                  const ids = e.target.value
                    .split(",")
                    .map((id) => parseInt(id.trim()))
                    .filter((id) => !isNaN(id));
                  updateSection(index, "categoryids", ids);
                }}
                placeholder="1, 2, 3, 4"
              />
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
          <div className="space-y-2">
            <Label>Banner ID</Label>
            <Input
              value={section.banner_id || ""}
              onChange={(e) =>
                updateSection(index, "banner_id", e.target.value)
              }
            />
          </div>
        );

      case "featured_brands":
        return (
          <div className="space-y-4">
            <Label>Brands</Label>
            {(section.brands || []).map((brand: any, brandIndex: number) => (
              <div key={brandIndex} className="flex gap-2">
                <Input
                  value={brand.name || ""}
                  onChange={(e) => {
                    const newBrands = [...(section.brands || [])];
                    newBrands[brandIndex] = { ...brand, name: e.target.value };
                    updateSection(index, "brands", newBrands);
                  }}
                  placeholder="Brand name"
                />
                <Input
                  value={brand.logo || ""}
                  onChange={(e) => {
                    const newBrands = [...(section.brands || [])];
                    newBrands[brandIndex] = { ...brand, logo: e.target.value };
                    updateSection(index, "brands", newBrands);
                  }}
                  placeholder="/brands/logo.png"
                />
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
        <Button onClick={onSave} disabled={saving} className="gap-2">
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
