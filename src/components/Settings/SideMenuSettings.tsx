"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash, ChevronRight } from "lucide-react";
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

interface SideMenuSettingsProps {
  data?: any;
  onChange: (data: any) => void;
  onSave: () => void;
  saving: boolean;
}

export default function SideMenuSettings({
  data,
  onChange,
  onSave,
  saving,
}: SideMenuSettingsProps) {
  const [formData, setFormData] = useState(data || { status: true, items: [] });

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const handleChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const addCategory = () => {
    const newCategory = {
      label: "New Category",
      label_bn: "নতুন বিভাগ",
      link: "/category",
      icon: "folder",
      children: [],
    };
    handleChange("items", [...(formData.items || []), newCategory]);
  };

  const updateCategory = (index: number, field: string, value: any) => {
    const updatedItems = [...(formData.items || [])];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    handleChange("items", updatedItems);
  };

  const removeCategory = (index: number) => {
    const updatedItems = (formData.items || []).filter(
      (_: any, i: number) => i !== index,
    );
    handleChange("items", updatedItems);
  };

  const addSubCategory = (parentIndex: number) => {
    const updatedItems = [...(formData.items || [])];
    const newSub = {
      label: "New Subcategory",
      label_bn: "নতুন উপবিভাগ",
      link: "/subcategory",
    };
    updatedItems[parentIndex].children = [
      ...(updatedItems[parentIndex].children || []),
      newSub,
    ];
    handleChange("items", updatedItems);
  };

  const updateSubCategory = (
    parentIndex: number,
    subIndex: number,
    field: string,
    value: any,
  ) => {
    const updatedItems = [...(formData.items || [])];
    updatedItems[parentIndex].children[subIndex] = {
      ...updatedItems[parentIndex].children[subIndex],
      [field]: value,
    };
    handleChange("items", updatedItems);
  };

  const removeSubCategory = (parentIndex: number, subIndex: number) => {
    const updatedItems = [...(formData.items || [])];
    updatedItems[parentIndex].children = updatedItems[
      parentIndex
    ].children.filter((_: any, i: number) => i !== subIndex);
    handleChange("items", updatedItems);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Side Menu Settings</CardTitle>
        <Button
          onClick={onSave}
          disabled={saving}
          className="gap-2 btn-bw-primary"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.status}
            onCheckedChange={(checked) => handleChange("status", checked)}
          />
          <Label>Enable Side Menu</Label>
        </div>

        {formData.status && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Menu Position</Label>
                <Select
                  value={formData.position || "left"}
                  onValueChange={(value) => handleChange("position", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Left Side</SelectItem>
                    <SelectItem value="right">Right Side</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Menu Title (English)</Label>
                <Input
                  id="title"
                  value={formData.title || "Categories"}
                  onChange={(e) => handleChange("title", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title_bn">Menu Title (Bengali)</Label>
                <Input
                  id="title_bn"
                  value={formData.title_bn || "বিভাগ সমূহ"}
                  onChange={(e) => handleChange("title_bn", e.target.value)}
                />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Categories</h3>
                <Button onClick={addCategory} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" /> Add Category
                </Button>
              </div>

              <div className="space-y-4">
                {(formData.items || []).map(
                  (category: any, catIndex: number) => (
                    <Card key={catIndex} className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">Category {catIndex + 1}</h4>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => removeCategory(catIndex)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label>Label (English)</Label>
                          <Input
                            value={category.label || ""}
                            onChange={(e) =>
                              updateCategory(catIndex, "label", e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Label (Bengali)</Label>
                          <Input
                            value={category.label_bn || ""}
                            onChange={(e) =>
                              updateCategory(
                                catIndex,
                                "label_bn",
                                e.target.value,
                              )
                            }
                            placeholder="বাংলা লেবেল"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Link</Label>
                          <Input
                            value={category.link || ""}
                            onChange={(e) =>
                              updateCategory(catIndex, "link", e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Icon</Label>
                          <Input
                            value={category.icon || ""}
                            onChange={(e) =>
                              updateCategory(catIndex, "icon", e.target.value)
                            }
                            placeholder="Icon name"
                          />
                        </div>
                      </div>

                      {/* Subcategories */}
                      <div className="ml-6 space-y-3">
                        <div className="flex justify-between items-center">
                          <h5 className="text-sm font-medium">Subcategories</h5>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addSubCategory(catIndex)}
                          >
                            <Plus className="w-4 h-4 mr-1" /> Add Sub
                          </Button>
                        </div>

                        {(category.children || []).map(
                          (sub: any, subIndex: number) => (
                            <div
                              key={subIndex}
                              className="flex gap-2 items-center"
                            >
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                              <Input
                                value={sub.label || ""}
                                onChange={(e) =>
                                  updateSubCategory(
                                    catIndex,
                                    subIndex,
                                    "label",
                                    e.target.value,
                                  )
                                }
                                placeholder="English"
                                className="flex-1"
                              />
                              <Input
                                value={sub.label_bn || ""}
                                onChange={(e) =>
                                  updateSubCategory(
                                    catIndex,
                                    subIndex,
                                    "label_bn",
                                    e.target.value,
                                  )
                                }
                                placeholder="বাংলা"
                                className="flex-1"
                              />
                              <Input
                                value={sub.link || ""}
                                onChange={(e) =>
                                  updateSubCategory(
                                    catIndex,
                                    subIndex,
                                    "link",
                                    e.target.value,
                                  )
                                }
                                placeholder="/link"
                                className="w-32"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  removeSubCategory(catIndex, subIndex)
                                }
                              >
                                <Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          ),
                        )}
                      </div>
                    </Card>
                  ),
                )}
              </div>
            </div>

            {/* Preview */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">Preview</h3>
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 p-3 border-b">
                  <span className="font-medium">
                    {formData.title_bn || formData.title || "Categories"}
                  </span>
                </div>
                <div className="p-2">
                  {(formData.items || [])
                    .slice(0, 3)
                    .map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className="py-2 px-3 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <div className="flex items-center justify-between">
                          <span>{item.label_bn || item.label}</span>
                          {item.children?.length > 0 && (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
