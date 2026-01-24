// src/components/theme/GlobalSettingsEditor.tsx
import  { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Save,
  Palette,
  Eye,
  Type,
  Layout,
  Settings,
  Plus,
  Trash2,
} from "lucide-react";

interface GlobalSettingsEditorProps {
  settings: Record<string, any>;
  onSave: (settings: Record<string, any>) => Promise<void> | void;
}

interface ColorValue {
  [key: string]: string;
}

export default function GlobalSettingsEditor({
  settings,
  onSave,
}: GlobalSettingsEditorProps) {
  const [localSettings, setLocalSettings] =
    useState<Record<string, any>>(settings);
  const [saving, setSaving] = useState(false);
  const [newColor, setNewColor] = useState({ name: "", value: "" });

  // Default structure for global settings
  const defaultSettings = {
    typography: {
      fontFamily: {
        heading: "Inter, system-ui, sans-serif",
        body: "Inter, system-ui, sans-serif",
        mono: "JetBrains Mono, monospace",
      },
      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
        "5xl": "3rem",
      },
      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
      },
    },
    colors: {
      primary: {
        50: "#eff6ff",
        100: "#dbeafe",
        200: "#bfdbfe",
        300: "#93c5fd",
        400: "#60a5fa",
        500: "#3b82f6",
        600: "#2563eb",
        700: "#1d4ed8",
        800: "#1e40af",
        900: "#1e3a8a",
      },
      gray: {
        50: "#f9fafb",
        100: "#f3f4f6",
        200: "#e5e7eb",
        300: "#d1d5db",
        400: "#9ca3af",
        500: "#6b7280",
        600: "#4b5563",
        700: "#374151",
        800: "#1f2937",
        900: "#111827",
      },
    },
    layout: {
      container: {
        maxWidth: "1280px",
        padding: {
          sm: "1rem",
          md: "1.5rem",
          lg: "2rem",
        },
      },
      spacing: {
        unit: "0.25rem",
        scale: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64],
      },
    },
    breakpoints: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    effects: {
      borderRadius: {
        none: "0",
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        DEFAULT:
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
        inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
      },
    },
  };

  // Merge with defaults
  const mergedSettings = {
    ...defaultSettings,
    ...localSettings,
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(localSettings);
      toast.success("Global settings saved successfully");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (path: string[], value: any) => {
    setLocalSettings((prev) => {
      const newSettings = { ...prev };
      let current: any = newSettings;

      // Navigate to the correct nested property
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {};
        }
        current = current[path[i]];
      }

      // Set the value
      current[path[path.length - 1]] = value;
      return newSettings;
    });
  };

  const addCustomColor = () => {
    if (!newColor.name || !newColor.value) {
      toast.error("Please provide both name and value for the color");
      return;
    }

    updateSetting(["colors", newColor.name], newColor.value);
    setNewColor({ name: "", value: "" });
    toast.success("Color added successfully");
  };

  const removeCustomColor = (colorName: string) => {
    setLocalSettings((prev) => {
      const newSettings = { ...prev };
      if (newSettings.colors && newSettings.colors[colorName]) {
        delete newSettings.colors[colorName];
      }
      return newSettings;
    });
    toast.success("Color removed successfully");
  };

  const renderTypographySettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-5 w-5" />
          Typography
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="fontFamily-heading">Heading Font Family</Label>
          <Input
            id="fontFamily-heading"
            value={mergedSettings.typography.fontFamily.heading}
            onChange={(e) =>
              updateSetting(
                ["typography", "fontFamily", "heading"],
                e.target.value,
              )
            }
          />
        </div>
        <div>
          <Label htmlFor="fontFamily-body">Body Font Family</Label>
          <Input
            id="fontFamily-body"
            value={mergedSettings.typography.fontFamily.body}
            onChange={(e) =>
              updateSetting(
                ["typography", "fontFamily", "body"],
                e.target.value,
              )
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fontSize-base">Base Font Size</Label>
            <Input
              id="fontSize-base"
              value={mergedSettings.typography.fontSize.base}
              onChange={(e) =>
                updateSetting(
                  ["typography", "fontSize", "base"],
                  e.target.value,
                )
              }
            />
          </div>
          <div>
            <Label htmlFor="fontWeight-normal">Normal Font Weight</Label>
            <Input
              id="fontWeight-normal"
              value={mergedSettings.typography.fontWeight.normal}
              onChange={(e) =>
                updateSetting(
                  ["typography", "fontWeight", "normal"],
                  e.target.value,
                )
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderColorSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Colors
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Color Scale */}
        <div>
          <h3 className="text-sm font-medium mb-3">Primary Color Scale</h3>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(mergedSettings.colors.primary).map(
              ([shade, value]) => (
                <div key={shade} className="space-y-1">
                  <div
                    className="w-full h-10 rounded-md border"
                    style={{ backgroundColor: value as string }}
                  />
                  <div className="text-xs text-center">
                    <div>{shade}</div>
                    <div className="text-gray-500 truncate">
                      {value as string}
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        </div>

        <Separator />

        {/* Custom Colors */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Custom Colors</h3>
            <div className="flex gap-2">
              <Input
                placeholder="Color name"
                value={newColor.name}
                onChange={(e) =>
                  setNewColor({ ...newColor, name: e.target.value })
                }
                className="w-32"
              />
              <div className="flex gap-2">
                <Input
                  placeholder="#hex or rgb()"
                  value={newColor.value}
                  onChange={(e) =>
                    setNewColor({ ...newColor, value: e.target.value })
                  }
                  className="w-32"
                />
                <Button onClick={addCustomColor} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {Object.entries(mergedSettings.colors)
            .filter(([key]) => !["primary", "gray"].includes(key))
            .map(([name, value]) => {
              // Handle both string color values and object color scales
              const colorValue =
                typeof value === "string"
                  ? value
                  : (value as ColorValue)[500] ||
                    (value as ColorValue)[400] ||
                    (Object.values(value as ColorValue)[0] as string);

              return (
                <div
                  key={name}
                  className="flex items-center justify-between p-2 border rounded-md mb-2"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: colorValue }}
                    />
                    <div>
                      <div className="font-medium">{name}</div>
                      <div className="text-sm text-gray-500">
                        {typeof value === "string" ? value : "Color Scale"}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCustomColor(name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
        </div>
      </CardContent>
    </Card>
  );

  const renderLayoutSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layout className="h-5 w-5" />
          Layout
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="container-maxWidth">Container Max Width</Label>
          <Input
            id="container-maxWidth"
            value={mergedSettings.layout.container.maxWidth}
            onChange={(e) =>
              updateSetting(["layout", "container", "maxWidth"], e.target.value)
            }
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="spacing-unit">Spacing Unit</Label>
            <Input
              id="spacing-unit"
              value={mergedSettings.layout.spacing.unit}
              onChange={(e) =>
                updateSetting(["layout", "spacing", "unit"], e.target.value)
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderBreakpointSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Breakpoints
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {Object.entries(mergedSettings.breakpoints).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <Label htmlFor={`breakpoint-${key}`} className="w-16">
              {key}
            </Label>
            <Input
              id={`breakpoint-${key}`}
              value={value as string}
              onChange={(e) =>
                updateSetting(["breakpoints", key], e.target.value)
              }
              className="flex-1"
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderAdvancedSettings = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Advanced Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="custom-settings">Custom Settings (JSON)</Label>
          <Textarea
            id="custom-settings"
            rows={6}
            value={JSON.stringify(localSettings, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setLocalSettings(parsed);
              } catch (error) {
                // Invalid JSON, do nothing
              }
            }}
            className="font-mono text-sm"
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Global Settings</h2>
          <p className="text-gray-600">
            Configure global design tokens and settings for your theme
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className={`h-4 w-4 mr-2 ${saving ? "animate-spin" : ""}`} />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {renderTypographySettings()}
          {renderColorSettings()}
        </div>
        <div className="space-y-6">
          {renderLayoutSettings()}
          {renderBreakpointSettings()}
          {renderAdvancedSettings()}
        </div>
      </div>
    </div>
  );
}
