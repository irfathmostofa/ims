// src/components/theme/ThemeEditor.tsx
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  Eye,
  Layout,
  Palette,
  Type,
  Code,
  Settings,
  Globe,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { apiClient } from "@/hook/apiClient";
import ThemeSectionManager from "./ThemeSectionManager";
import GlobalSettingsEditor from "./GlobalSettingsEditor";
import CSSEditor from "./CSSEditor";

interface ThemeEditorProps {
  theme: any;
  onUpdateTheme: (themeId: string, updates: any) => Promise<any>;
}

export default function ThemeEditor({
  theme,
  onUpdateTheme,
}: ThemeEditorProps) {
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [componentTypes, setComponentTypes] = useState<any[]>([]);
  const [componentVariants, setComponentVariants] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    status: "draft",
    is_default: false,
    global_css: {},
    global_settings: {},
  });

  // Initialize form data from theme
  useEffect(() => {
    setFormData({
      name: theme.name || "",
      slug: theme.slug || "",
      description: theme.description || "",
      status: theme.status || "draft",
      is_default: theme.is_default || false,
      global_css: theme.global_css || {},
      global_settings: theme.global_settings || {},
    });
  }, [theme]);

  // Fetch component types and variants
  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const [typesRes, variantsRes] = await Promise.all([
          apiClient(
            `${import.meta.env.VITE_SERVER}/theme/component-types/list`,
            {
              method: "GET",
              tokenType: "jwt",
            },
          ),
          apiClient(
            `${import.meta.env.VITE_SERVER}/theme/component-variants/list`,
            {
              method: "GET",
              tokenType: "jwt",
            },
          ),
        ]);

        setComponentTypes(typesRes.data || []);
        setComponentVariants(variantsRes.data || []);
      } catch (error) {
        console.error("Failed to fetch components:", error);
      }
    };

    fetchComponents();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    try {
      setSaving(true);

      // Basic validation
      if (!formData.name.trim()) {
        toast.error("Theme name is required");
        return;
      }

      if (!formData.slug.trim()) {
        toast.error("Theme slug is required");
        return;
      }

      if (!/^[a-z0-9-]+$/.test(formData.slug)) {
        toast.error("Slug must be lowercase with hyphens only");
        return;
      }

      await onUpdateTheme(theme.id, formData);
      toast.success("Theme saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save theme");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      await onUpdateTheme(theme.id, {
        ...formData,
        status: "published",
      });
      setFormData((prev) => ({ ...prev, status: "published" }));
      toast.success("Theme published successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to publish theme");
    }
  };

  const handleUnpublish = async () => {
    try {
      await onUpdateTheme(theme.id, {
        ...formData,
        status: "draft",
      });
      setFormData((prev) => ({ ...prev, status: "draft" }));
      toast.success("Theme unpublished successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to unpublish theme");
    }
  };

  const handleSetActive = async () => {
    try {
      await onUpdateTheme(theme.id, {
        ...formData,
        is_active: true,
      });
      toast.success("Theme activated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to activate theme");
    }
  };

  const handleSetDefault = async () => {
    try {
      await onUpdateTheme(theme.id, {
        ...formData,
        is_default: true,
      });
      toast.success("Theme set as default successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to set theme as default");
    }
  };

  const handleSaveDraft = async () => {
    await handleSubmit();
  };

  const handleDuplicate = async () => {
    try {
      const duplicateData = {
        ...formData,
        name: `${formData.name} (Copy)`,
        slug: `${formData.slug}-copy-${Date.now()}`,
        is_active: false,
        is_default: false,
        status: "draft",
      };

      await apiClient(`${import.meta.env.VITE_SERVER}/theme/themes/create`, {
        method: "POST",
        data: duplicateData,
        tokenType: "jwt",
      });

      toast.success("Theme duplicated successfully");
      // Refresh the page or navigate to the new theme
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Failed to duplicate theme");
    }
  };

  const renderStatusBadge = () => {
    switch (theme.status) {
      case "published":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle className="w-3 h-3 mr-1" />
            Published
          </Badge>
        );
      case "draft":
        return (
          <Badge variant="outline" className="text-gray-600">
            Draft
          </Badge>
        );
      case "archived":
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Palette className="h-6 w-6" />
              {theme.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-sm text-gray-500">/{theme.slug}</code>
              {renderStatusBadge()}
              {theme.is_active && (
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                  Active
                </Badge>
              )}
              {theme.is_default && (
                <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                  Default
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => window.open(`/preview/${theme.slug}`, "_blank")}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" onClick={handleDuplicate}>
            Duplicate
          </Button>
          {theme.status === "published" ? (
            <Button variant="outline" onClick={handleUnpublish}>
              <XCircle className="h-4 w-4 mr-2" />
              Unpublish
            </Button>
          ) : (
            <Button onClick={handlePublish} variant="default">
              <CheckCircle className="h-4 w-4 mr-2" />
              Publish
            </Button>
          )}
          <Button onClick={handleSaveDraft} disabled={saving}>
            <Save className={`h-4 w-4 mr-2 ${saving ? "animate-spin" : ""}`} />
            {saving ? "Saving..." : "Save Draft"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Left sidebar - Navigation */}
        <div className="col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("general")}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                    activeTab === "general"
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  General Settings
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("sections")}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                    activeTab === "sections"
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Layout className="h-4 w-4" />
                  Sections
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("global")}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                    activeTab === "global"
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Globe className="h-4 w-4" />
                  Global Settings
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("typography")}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                    activeTab === "typography"
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Type className="h-4 w-4" />
                  Typography
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("css")}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors ${
                    activeTab === "css"
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Code className="h-4 w-4" />
                  Custom CSS
                </button>
              </nav>
            </CardContent>
          </Card>

          {/* Theme Status */}
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Theme Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  {renderStatusBadge()}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active</span>
                  <Switch
                    checked={theme.is_active}
                    disabled
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Default</span>
                  <Switch
                    checked={theme.is_default}
                    disabled
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
                <div className="pt-3 space-y-2">
                  {!theme.is_active && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={handleSetActive}
                    >
                      Set as Active
                    </Button>
                  )}
                  {!theme.is_default && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={handleSetDefault}
                    >
                      Set as Default
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Theme Info */}
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">
                Theme Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Created:</span>
                <span className="ml-2">
                  {new Date(theme.created_at).toLocaleDateString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Updated:</span>
                <span className="ml-2">
                  {new Date(theme.updated_at).toLocaleDateString()}
                </span>
              </div>
              {theme.published_at && (
                <div>
                  <span className="text-gray-600">Published:</span>
                  <span className="ml-2">
                    {new Date(theme.published_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              {theme.created_by && (
                <div>
                  <span className="text-gray-600">Author:</span>
                  <span className="ml-2">{theme.created_by}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main content area */}
        <div className="col-span-3">
          <form onSubmit={handleSubmit} className="space-y-6">
            {activeTab === "general" && (
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Configure basic theme properties
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Theme Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter theme name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        name="slug"
                        value={formData.slug}
                        onChange={handleInputChange}
                        placeholder="theme-slug-name"
                        required
                      />
                      <p className="text-sm text-gray-500">
                        URL-friendly identifier (lowercase with hyphens)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Describe your theme..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) =>
                        handleSelectChange("status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_default"
                        checked={formData.is_default}
                        onCheckedChange={(checked) =>
                          handleSwitchChange("is_default", checked)
                        }
                      />
                      <Label htmlFor="is_default">Set as default theme</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "sections" && (
              <ThemeSectionManager
                themeId={theme.id}
                sections={theme.sections}
                componentVariants={componentVariants}
                componentTypes={componentTypes}
              />
            )}

            {activeTab === "global" && (
              <GlobalSettingsEditor
                settings={theme.global_settings || {}}
                onSave={(settings) =>
                  onUpdateTheme(theme.id, { global_settings: settings })
                }
              />
            )}

            {activeTab === "css" && (
              <CSSEditor
                css={theme.global_css || {}}
                onSave={(css) => onUpdateTheme(theme.id, { global_css: css })}
              />
            )}

            {/* Save button for general tab */}
            {activeTab === "general" && (
              <div className="flex justify-end">
                <Button type="submit" disabled={saving} className="btn-bw-primary">
                  <Save
                    className={`h-4 w-4 mr-2 ${saving ? "animate-spin" : ""}`}
                  />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
