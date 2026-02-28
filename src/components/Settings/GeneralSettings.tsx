"use client";

import { useState, useEffect } from "react";
import { RefreshCw, Save } from "lucide-react";
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
import { toast } from "sonner";

interface GeneralSettingsProps {
  data?: any;
  onChange: (data: any) => void;
  onSave: () => void;
  saving: boolean;
}

export default function GeneralSettings({
  data,
  onChange,
  onSave,
  saving,
}: GeneralSettingsProps) {
  const [formData, setFormData] = useState<any>(null);
  // Update local state when prop data changes
  useEffect(() => {
    if (data && Object.keys(data).length > 0) {
      // Use the real data when available
      setFormData(data);
    } else {
      // Only set defaults when there's no data at all
      setFormData({
        site_title: "",
        site_tagline: "",
        admin_email: "",
        language: "bn",
        timezone: "Asia/Dhaka",
        date_format: "d/m/Y",
        time_format: "h:i A",
        currency: "BDT",
        currency_symbol: "৳",
        currency_position: "left",
        thousand_separator: ",",
        decimal_separator: ".",
        number_of_decimals: 2,
        site_visibility: "live",
        coming_soon_message: "শীঘ্রই আসছি!",
        maintenance_message: "সাইটটি সংস্কার করা হচ্ছে।",
      });
    }
  }, [data]);

  // Don't render until we have formData
  if (!formData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleChange = (field: string, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const handleSave = () => {
    if (!formData.site_title) {
      toast.error("Site title is required");
      return;
    }
    onSave();
  };

  const languages = [
    { value: "bn", label: "Bengali" },
    { value: "en", label: "English" },
  ];

  const timezones = [
    { value: "Asia/Dhaka", label: "Asia/Dhaka (BST)" },
    { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
  ];

  const currencies = [
    { value: "BDT", label: "BDT (৳)" },
    { value: "USD", label: "USD ($)" },
  ];

  // Date format options
  const dateFormats = [
    { value: "d/m/Y", label: "DD/MM/YYYY (25/12/2024)" },
    { value: "m/d/Y", label: "MM/DD/YYYY (12/25/2024)" },
    { value: "Y-m-d", label: "YYYY-MM-DD (2024-12-25)" },
    { value: "d M Y", label: "DD Mon YYYY (25 Dec 2024)" },
    { value: "M d, Y", label: "Mon DD, YYYY (Dec 25, 2024)" },
    { value: "l, d M Y", label: "Day, DD Mon YYYY (Wednesday, 25 Dec 2024)" },
  ];

  // Time format options
  const timeFormats = [
    { value: "h:i A", label: "12-hour (02:30 PM)" },
    { value: "H:i", label: "24-hour (14:30)" },
    { value: "h:i:s A", label: "12-hour with seconds (02:30:45 PM)" },
    { value: "H:i:s", label: "24-hour with seconds (14:30:45)" },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>General Settings</CardTitle>
        <Button onClick={handleSave} disabled={saving} className="gap-2 btn-bw-primary">
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Site Information */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Site Information</h3>

            <div className="space-y-2">
              <Label htmlFor="site_title">Site Title *</Label>
              <Input
                id="site_title"
                value={formData.site_title || ""}
                onChange={(e) => handleChange("site_title", e.target.value)}
                placeholder="Enter site title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="site_tagline">Site Tagline</Label>
              <Input
                id="site_tagline"
                value={formData.site_tagline || ""}
                onChange={(e) => handleChange("site_tagline", e.target.value)}
                placeholder="Enter site tagline"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin_email">Admin Email</Label>
              <Input
                id="admin_email"
                type="email"
                value={formData.admin_email || ""}
                onChange={(e) => handleChange("admin_email", e.target.value)}
                placeholder="admin@example.com"
              />
            </div>
          </div>

          {/* Localization */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Localization</h3>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={formData.language || "bn"}
                onValueChange={(value) => handleChange("language", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={formData.timezone || "Asia/Dhaka"}
                onValueChange={(value) => handleChange("timezone", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency || "BDT"}
                onValueChange={(value) => handleChange("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((cur) => (
                    <SelectItem key={cur.value} value={cur.value}>
                      {cur.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date Format */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Date Format</h3>

            <div className="space-y-2">
              <Label htmlFor="date_format">Date Format</Label>
              <Select
                value={formData.date_format || "d/m/Y"}
                onValueChange={(value) => handleChange("date_format", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  {dateFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Choose how dates should be displayed
              </p>
            </div>
          </div>

          {/* Time Format */}
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Time Format</h3>

            <div className="space-y-2">
              <Label htmlFor="time_format">Time Format</Label>
              <Select
                value={formData.time_format || "h:i A"}
                onValueChange={(value) => handleChange("time_format", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time format" />
                </SelectTrigger>
                <SelectContent>
                  {timeFormats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Choose how times should be displayed
              </p>
            </div>
          </div>

          {/* Site Status */}
          <div className="space-y-4 col-span-2">
            <h3 className="font-medium text-lg">Site Status</h3>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="site_visibility">Site Visibility</Label>
                  <Select
                    value={formData.site_visibility || "live"}
                    onValueChange={(value) =>
                      handleChange("site_visibility", value)
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="coming_soon">Coming Soon</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.site_visibility === "coming_soon" && (
                  <div className="space-y-2">
                    <Label htmlFor="coming_soon_message">
                      Coming Soon Message
                    </Label>
                    <Input
                      id="coming_soon_message"
                      value={formData.coming_soon_message || "শীঘ্রই আসছি!"}
                      onChange={(e) =>
                        handleChange("coming_soon_message", e.target.value)
                      }
                    />
                  </div>
                )}

                {formData.site_visibility === "maintenance" && (
                  <div className="space-y-2">
                    <Label htmlFor="maintenance_message">
                      Maintenance Message
                    </Label>
                    <Input
                      id="maintenance_message"
                      value={
                        formData.maintenance_message ||
                        "সাইটটি সংস্কার করা হচ্ছে।"
                      }
                      onChange={(e) =>
                        handleChange("maintenance_message", e.target.value)
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Currency Formatting */}
        <div className="border-t pt-4">
          <h3 className="font-medium text-lg mb-4">Currency Formatting</h3>
          <div className="grid grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency_symbol">Symbol</Label>
              <Input
                id="currency_symbol"
                value={formData.currency_symbol || "৳"}
                onChange={(e) =>
                  handleChange("currency_symbol", e.target.value)
                }
                placeholder="৳"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency_position">Position</Label>
              <Select
                value={formData.currency_position || "left"}
                onValueChange={(value) =>
                  handleChange("currency_position", value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left (৳100)</SelectItem>
                  <SelectItem value="right">Right (100৳)</SelectItem>
                  <SelectItem value="left_space">
                    Left with space (৳ 100)
                  </SelectItem>
                  <SelectItem value="right_space">
                    Right with space (100 ৳)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="thousand_separator">Thousand Separator</Label>
              <Input
                id="thousand_separator"
                value={formData.thousand_separator || ","}
                onChange={(e) =>
                  handleChange("thousand_separator", e.target.value)
                }
                placeholder=","
                maxLength={1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="decimal_separator">Decimal Separator</Label>
              <Input
                id="decimal_separator"
                value={formData.decimal_separator || "."}
                onChange={(e) =>
                  handleChange("decimal_separator", e.target.value)
                }
                placeholder="."
                maxLength={1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="number_of_decimals">Decimal Places</Label>
              <Input
                id="number_of_decimals"
                type="number"
                min="0"
                max="4"
                value={formData.number_of_decimals || 2}
                onChange={(e) =>
                  handleChange("number_of_decimals", parseInt(e.target.value))
                }
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Preview</h4>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Price:</span>{" "}
              {formData.currency_position === "left"
                ? formData.currency_symbol
                : ""}
              {formData.currency_position === "left_space"
                ? `${formData.currency_symbol} `
                : ""}
              1{formData.thousand_separator || ","}000
              {formData.decimal_separator || "."}00
              {formData.currency_position === "right"
                ? formData.currency_symbol
                : ""}
              {formData.currency_position === "right_space"
                ? ` ${formData.currency_symbol}`
                : ""}
            </p>
            <p className="text-sm">
              <span className="font-medium">Date:</span>{" "}
              {new Date().toLocaleDateString("bn-BD")}
            </p>
            <p className="text-sm">
              <span className="font-medium">Time:</span>{" "}
              {new Date().toLocaleTimeString("bn-BD")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
