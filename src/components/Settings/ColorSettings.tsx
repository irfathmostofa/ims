"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface ColorSettingsProps {
  data?: any;
  onChange: (data: any) => void;
  onSave: () => void;
  saving: boolean;
}

export default function ColorSettings({
  data,
  onChange,
  onSave,
  saving,
}: ColorSettingsProps) {
  const [formData, setFormData] = useState(data || {});

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const handleChange = (field: string, value: string) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const colorGroups = [
    {
      title: "Brand Colors",
      colors: [
        { key: "primary", label: "Primary", default: "#006747" },
        { key: "secondary", label: "Secondary", default: "#DA291C" },
        { key: "accent", label: "Accent", default: "#F68B1E" },
      ],
    },
    {
      title: "Background Colors",
      colors: [
        { key: "background", label: "Background", default: "#FFFFFF" },
        { key: "footer_bg", label: "Footer Background", default: "#1F2937" },
      ],
    },
    {
      title: "Text Colors",
      colors: [
        { key: "text", label: "Text", default: "#1F2937" },
        { key: "heading", label: "Heading", default: "#111827" },
        { key: "link", label: "Link", default: "#006747" },
        { key: "footer_text", label: "Footer Text", default: "#F3F4F6" },
      ],
    },
    {
      title: "Badge Colors",
      colors: [
        { key: "sale_badge", label: "Sale Badge", default: "#DA291C" },
        { key: "new_badge", label: "New Badge", default: "#006747" },
        { key: "discount_badge", label: "Discount Badge", default: "#F68B1E" },
      ],
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Color Settings</CardTitle>
        <Button onClick={onSave} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-8">
          {colorGroups.map((group) => (
            <div key={group.title} className="space-y-4">
              <h3 className="font-medium text-lg">{group.title}</h3>
              <div className="space-y-3">
                {group.colors.map((color) => (
                  <div key={color.key} className="flex items-center gap-4">
                    <div className="flex-1">
                      <Label htmlFor={color.key}>{color.label}</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded border shadow-sm"
                        style={{
                          backgroundColor: formData[color.key] || color.default,
                        }}
                      />
                      <Input
                        id={color.key}
                        type="color"
                        value={formData[color.key] || color.default}
                        onChange={(e) =>
                          handleChange(color.key, e.target.value)
                        }
                        className="w-16 p-1 h-8"
                      />
                      <Input
                        value={formData[color.key] || color.default}
                        onChange={(e) =>
                          handleChange(color.key, e.target.value)
                        }
                        className="w-28"
                        placeholder={color.default}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="mt-8 border-t pt-6">
          <h3 className="font-medium text-lg mb-4">Preview</h3>
          <div
            className="p-6 rounded-lg"
            style={{ backgroundColor: formData.background || "#FFFFFF" }}
          >
            <h4
              className="text-xl font-bold mb-2"
              style={{ color: formData.heading || "#111827" }}
            >
              Sample Heading
            </h4>
            <p style={{ color: formData.text || "#1F2937" }}>
              This is sample text to preview your color scheme.
            </p>
            <div className="flex gap-2 mt-4">
              <span
                className="px-3 py-1 rounded text-white text-sm"
                style={{ backgroundColor: formData.primary || "#006747" }}
              >
                Primary Button
              </span>
              <span
                className="px-3 py-1 rounded text-white text-sm"
                style={{ backgroundColor: formData.secondary || "#DA291C" }}
              >
                Secondary Button
              </span>
              <span
                className="px-3 py-1 rounded text-sm"
                style={{
                  backgroundColor: (formData.sale_badge || "#DA291C") + "20",
                  color: formData.sale_badge || "#DA291C",
                }}
              >
                Sale Badge
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
