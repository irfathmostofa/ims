"use client";

import { useState, useEffect } from "react";
import { Plus, Save, Trash } from "lucide-react";
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

interface ProductCardSettingsProps {
  data?: any;
  onChange: (data: any) => void;
  onSave: () => void;
  saving: boolean;
}

export default function ProductCardSettings({
  data,
  onChange,
  onSave,
  saving,
}: ProductCardSettingsProps) {
  const [formData, setFormData] = useState(data || {});

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

  const addSelectOption = () => {
    const newOption = {
      label: "New View",
      label_bn: "নতুন ভিউ",
      value: "new",
      icon: "grid",
    };
    handleChange("select_options", [
      ...(formData.select_options || []),
      newOption,
    ]);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Product Card Settings</CardTitle>
        <Button onClick={onSave} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Layout Options */}
          <div className="space-y-4">
            <h3 className="font-medium">Layout Options</h3>

            <div className="space-y-2">
              <Label htmlFor="layout">Card Layout</Label>
              <Select
                value={formData.layout || "default"}
                onValueChange={(value) => handleChange("layout", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="hover-effect">Hover Effect</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_aspect_ratio">Image Aspect Ratio</Label>
              <Select
                value={formData.image_aspect_ratio || "square"}
                onValueChange={(value) =>
                  handleChange("image_aspect_ratio", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Square (1:1)</SelectItem>
                  <SelectItem value="portrait">Portrait (3:4)</SelectItem>
                  <SelectItem value="landscape">Landscape (4:3)</SelectItem>
                  <SelectItem value="wide">Wide (16:9)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hover_animation">Hover Animation</Label>
              <Select
                value={formData.hover_animation || "zoom"}
                onValueChange={(value) =>
                  handleChange("hover_animation", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zoom">Zoom</SelectItem>
                  <SelectItem value="fade">Fade</SelectItem>
                  <SelectItem value="slide">Slide</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="button_style">Button Style</Label>
              <Select
                value={formData.button_style || "icon"}
                onValueChange={(value) => handleChange("button_style", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="icon">Icon Only</SelectItem>
                  <SelectItem value="text">Text Only</SelectItem>
                  <SelectItem value="outline">Outline</SelectItem>
                  <SelectItem value="solid">Solid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price_position">Price Position</Label>
              <Select
                value={formData.price_position || "below_title"}
                onValueChange={(value) => handleChange("price_position", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="below_title">Below Title</SelectItem>
                  <SelectItem value="above_title">Above Title</SelectItem>
                  <SelectItem value="after_image">After Image</SelectItem>
                  <SelectItem value="bottom">Bottom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Elements to Show */}
          <div className="space-y-4">
            <h3 className="font-medium">Elements to Show</h3>

            <div className="space-y-3">
              {[
                { key: "show_title", label: "Show Title" },
                { key: "show_price", label: "Show Price" },
                { key: "show_rating", label: "Show Rating" },
                { key: "show_add_to_cart", label: "Show Add to Cart" },
                { key: "show_wishlist", label: "Show Wishlist" },
                { key: "show_compare", label: "Show Compare" },
                { key: "show_sale_badge", label: "Show Sale Badge" },
                { key: "show_new_badge", label: "Show New Badge" },
                { key: "quick_view", label: "Quick View" },
              ].map((item) => (
                <div
                  key={item.key}
                  className="flex items-center justify-between"
                >
                  <Label htmlFor={item.key}>{item.label}</Label>
                  <Switch
                    id={item.key}
                    checked={formData[item.key] || false}
                    onCheckedChange={(checked) =>
                      handleChange(item.key, checked)
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Badge Settings */}
        <div className="border-t pt-4">
          <h3 className="font-medium mb-4">Badge Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="badge_text">Sale Badge Text (English)</Label>
              <Input
                id="badge_text"
                value={formData.badge_text || "Sale"}
                onChange={(e) => handleChange("badge_text", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="badge_text_bn">Sale Badge Text (Bengali)</Label>
              <Input
                id="badge_text_bn"
                value={formData.badge_text_bn || "ছাড়"}
                onChange={(e) => handleChange("badge_text_bn", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_badge_text">New Badge Text (English)</Label>
              <Input
                id="new_badge_text"
                value={formData.new_badge_text || "New"}
                onChange={(e) => handleChange("new_badge_text", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new_badge_text_bn">
                New Badge Text (Bengali)
              </Label>
              <Input
                id="new_badge_text_bn"
                value={formData.new_badge_text_bn || "নতুন"}
                onChange={(e) =>
                  handleChange("new_badge_text_bn", e.target.value)
                }
              />
            </div>
          </div>
        </div>

        {/* View Options */}
        <div className="border-t pt-4">
          <h3 className="font-medium mb-4">View Options</h3>
          <div className="space-y-2">
            {(formData.select_options || []).map(
              (option: any, index: number) => (
                <div key={index} className="flex gap-2 items-center">
                  <Input
                    value={option.label || ""}
                    onChange={(e) => {
                      const updated = [...(formData.select_options || [])];
                      updated[index] = { ...option, label: e.target.value };
                      handleChange("select_options", updated);
                    }}
                    placeholder="Label (English)"
                    className="flex-1"
                  />
                  <Input
                    value={option.label_bn || ""}
                    onChange={(e) => {
                      const updated = [...(formData.select_options || [])];
                      updated[index] = { ...option, label_bn: e.target.value };
                      handleChange("select_options", updated);
                    }}
                    placeholder="বাংলা লেবেল"
                    className="flex-1"
                  />
                  <Input
                    value={option.value || ""}
                    onChange={(e) => {
                      const updated = [...(formData.select_options || [])];
                      updated[index] = { ...option, value: e.target.value };
                      handleChange("select_options", updated);
                    }}
                    placeholder="Value"
                    className="w-32"
                  />
                  <Input
                    value={option.icon || ""}
                    onChange={(e) => {
                      const updated = [...(formData.select_options || [])];
                      updated[index] = { ...option, icon: e.target.value };
                      handleChange("select_options", updated);
                    }}
                    placeholder="Icon"
                    className="w-24"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const updated = (formData.select_options || []).filter(
                        (_: any, i: number) => i !== index,
                      );
                      handleChange("select_options", updated);
                    }}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              ),
            )}
            <Button onClick={addSelectOption} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" /> Add View Option
            </Button>
          </div>
        </div>

        {/* Preview */}
        <div className="border-t pt-4">
          <h3 className="font-medium mb-4">Preview</h3>
          <div className="border rounded-lg p-4 max-w-xs mx-auto">
            <div className="relative">
              <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>
              {formData.show_sale_badge && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  {formData.badge_text_bn || "ছাড়"}
                </span>
              )}
              {formData.show_new_badge && !formData.show_sale_badge && (
                <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                  {formData.new_badge_text_bn || "নতুন"}
                </span>
              )}
            </div>
            {formData.show_title && (
              <h4 className="font-medium mb-1">প্রোডাক্ট নাম</h4>
            )}
            {formData.show_price && (
              <div className="text-lg font-bold text-gray-900 mb-2">
                ৳ ১,২০০
              </div>
            )}
            {formData.show_rating && (
              <div className="flex items-center gap-1 mb-2">
                <span className="text-yellow-400">★★★★★</span>
                <span className="text-sm text-gray-500">(১০)</span>
              </div>
            )}
            {formData.show_add_to_cart && (
              <button className="w-full bg-blue-600 text-white py-2 rounded text-sm">
                কার্টে যোগ করুন
              </button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
