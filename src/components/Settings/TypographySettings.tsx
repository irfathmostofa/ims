"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TypographySettingsProps {
  data?: any;
  onChange: (data: any) => void;
  onSave: () => void;
  saving: boolean;
}

export default function TypographySettings({
  data,
  onChange,
  onSave,
  saving,
}: TypographySettingsProps) {
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

  const fontFamilies = [
    { value: "Hind Siliguri, sans-serif", label: "Hind Siliguri (Bengali)" },
    { value: "Noto Sans Bengali, sans-serif", label: "Noto Sans Bengali" },
    { value: "Inter, sans-serif", label: "Inter (English)" },
    { value: "Poppins, sans-serif", label: "Poppins" },
    { value: "Roboto, sans-serif", label: "Roboto" },
    { value: "Open Sans, sans-serif", label: "Open Sans" },
  ];

  const fontSizeOptions = ["12px", "14px", "16px", "18px", "20px", "24px"];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Typography Settings</CardTitle>
        <Button onClick={onSave} disabled={saving} className="gap-2 btn-bw-primary">
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Main Fonts */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Main Fonts</h3>

            <div className="space-y-2">
              <Label htmlFor="font_family">Primary Font</Label>
              <Select
                value={formData.font_family || "Hind Siliguri, sans-serif"}
                onValueChange={(value) => handleChange("font_family", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="heading_font">Heading Font</Label>
              <Select
                value={formData.heading_font || "Poppins, sans-serif"}
                onValueChange={(value) => handleChange("heading_font", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select heading font" />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      {font.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bangla_font">Bengali Font</Label>
              <Select
                value={formData.bangla_font || "Hind Siliguri"}
                onValueChange={(value) => handleChange("bangla_font", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Bengali font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hind Siliguri">Hind Siliguri</SelectItem>
                  <SelectItem value="Noto Sans Bengali">
                    Noto Sans Bengali
                  </SelectItem>
                  <SelectItem value="SolaimanLipi">SolaimanLipi</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="english_font">English Font</Label>
              <Select
                value={formData.english_font || "Inter"}
                onValueChange={(value) => handleChange("english_font", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select English font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Inter">Inter</SelectItem>
                  <SelectItem value="Poppins">Poppins</SelectItem>
                  <SelectItem value="Roboto">Roboto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Font Sizes */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Font Sizes</h3>

            <div className="space-y-2">
              <Label htmlFor="base_font_size">Base Font Size</Label>
              <Select
                value={formData.base_font_size || "16px"}
                onValueChange={(value) => handleChange("base_font_size", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {fontSizeOptions.map((size) => (
                    <SelectItem key={size} value={size}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="h1_size">H1 Size</Label>
              <Input
                id="h1_size"
                value={formData.h1_size || "36px"}
                onChange={(e) => handleChange("h1_size", e.target.value)}
                placeholder="36px"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="h2_size">H2 Size</Label>
              <Input
                id="h2_size"
                value={formData.h2_size || "30px"}
                onChange={(e) => handleChange("h2_size", e.target.value)}
                placeholder="30px"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="h3_size">H3 Size</Label>
              <Input
                id="h3_size"
                value={formData.h3_size || "24px"}
                onChange={(e) => handleChange("h3_size", e.target.value)}
                placeholder="24px"
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="border-t pt-6">
          <h3 className="font-medium text-lg mb-4">Preview</h3>
          <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
            <div
              style={{
                fontFamily: formData.font_family || "Hind Siliguri, sans-serif",
              }}
            >
              <h1
                style={{
                  fontFamily: formData.heading_font || "Poppins, sans-serif",
                  fontSize: formData.h1_size || "36px",
                }}
              >
                এইচ১ হেডিং - বাংলা টেক্সট
              </h1>
              <h2
                style={{
                  fontFamily: formData.heading_font || "Poppins, sans-serif",
                  fontSize: formData.h2_size || "30px",
                }}
              >
                এইচ২ হেডিং - সাব টাইটেল
              </h2>
              <p style={{ fontSize: formData.base_font_size || "16px" }}>
                এটি একটি সাধারণ প্যারাগ্রাফ টেক্সট। বাংলাদেশের অনলাইন শপিং এর
                জন্য টাইপোগ্রাফি সেটিংস। This is a sample paragraph text in
                English.
              </p>
              <div className="flex gap-4 mt-2">
                <span className="font-bold">Bold text</span>
                <span className="italic">Italic text</span>
                <span className="underline">Underlined text</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
