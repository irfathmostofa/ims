// src/pages/ThemePage.tsx
import { useEffect, useState } from "react";
import { apiClient } from "@/hook/apiClient";
import { toast } from "sonner";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Plus,
  RefreshCw,
  Layout,
  Palette,
  Eye,
  Settings,
  Sparkles,
  Badge,
  File,
} from "lucide-react";
import ThemeList from "@/components/Theme/ThemeList";
import ThemeEditor from "@/components/Theme/ThemeEditor";
import ThemePreview from "@/components/Theme/ThemePreview";
import ComponentLibrary from "@/components/Theme/ComponentLibrary";

interface Theme {
  id: string;
  name: string;
  slug: string;
  status: "draft" | "published" | "archived";
  is_active: boolean;
  is_default: boolean;
  description?: string;
  global_css?: Record<string, any>;
  global_settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
  published_at?: string;
  created_by?: string;
  sections?: {
    header: any[];
    hero: any[];
    content: any[];
    footer: any[];
  };
}

export default function ThemePage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("themes");
  const [preloading, setPreloading] = useState(false);

  // Fetch all themes
  const fetchThemes = async () => {
    try {
      setLoading(true);
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/theme/themes/list`,
        { method: "GET", tokenType: "jwt" },
      );
      setThemes(response.data || []);

      // Auto-select the first theme if none is selected
      if (!selectedTheme && response.data?.length > 0) {
        setSelectedTheme(response.data[0]);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch themes");
    } finally {
      setLoading(false);
    }
  };

  // Preload sample data
  const preloadSampleData = async () => {
    try {
      setPreloading(true);
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/theme/preload-sample`,
        { method: "POST", tokenType: "jwt" },
      );

      if (response.success) {
        toast.success("Sample theme data loaded successfully");
        fetchThemes();
      } else {
        toast.error("Failed to load sample data");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to load sample data");
    } finally {
      setPreloading(false);
    }
  };

  // Create new theme
  const handleCreateTheme = async () => {
    try {
      const newTheme = {
        name: "New Theme",
        slug: `theme-${Date.now()}`,
        status: "draft" as const,
        is_active: false,
        is_default: false,
        description: "A new theme",
        global_settings: {},
        global_css: {},
      };

      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/theme/themes/create`,
        {
          method: "POST",
          data: newTheme,
          tokenType: "jwt",
        },
      );

      toast.success("Theme created successfully");
      fetchThemes();
      setSelectedTheme(response.data);
      setActiveTab("editor");
    } catch (error: any) {
      toast.error(error.message || "Failed to create theme");
    }
  };

  // Update theme
  const handleUpdateTheme = async (
    themeId: string,
    updates: Partial<Theme>,
  ) => {
    try {
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/theme/themes/update`,
        {
          method: "POST",
          data: { id: themeId, ...updates },
          tokenType: "jwt",
        },
      );

      toast.success("Theme updated successfully");
      fetchThemes();

      if (selectedTheme?.id === themeId) {
        setSelectedTheme(response.data);
      }

      return response.data;
    } catch (error: any) {
      toast.error(error.message || "Failed to update theme");
      throw error;
    }
  };

  // Delete theme
  const handleDeleteTheme = async (themeId: string) => {
    try {
      await apiClient(`${import.meta.env.VITE_SERVER}/theme/themes/delete`, {
        method: "POST",
        data: { id: themeId },
        tokenType: "jwt",
      });

      toast.success("Theme deleted successfully");
      fetchThemes();

      if (selectedTheme?.id === themeId) {
        setSelectedTheme(null);
        setActiveTab("themes");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete theme");
    }
  };

  // Set theme as active
  const handleSetActive = async (themeId: string) => {
    try {
      // First, deactivate all themes
      const updatePromises = themes.map((theme) => {
        if (theme.is_active) {
          return apiClient(
            `${import.meta.env.VITE_SERVER}/theme/themes/update`,
            {
              method: "POST",
              data: { id: theme.id, is_active: false },
              tokenType: "jwt",
            },
          );
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);

      // Then activate the selected theme
      await apiClient(`${import.meta.env.VITE_SERVER}/theme/themes/update`, {
        method: "POST",
        data: {
          id: themeId,
          is_active: true,
          status: "published",
        },
        tokenType: "jwt",
      });

      toast.success("Theme activated successfully");
      fetchThemes();
    } catch (error: any) {
      toast.error(error.message || "Failed to activate theme");
    }
  };

  // Set theme as default
  const handleSetDefault = async (themeId: string) => {
    try {
      // First, remove default from all themes
      const updatePromises = themes.map((theme) => {
        if (theme.is_default) {
          return apiClient(
            `${import.meta.env.VITE_SERVER}/theme/themes/update`,
            {
              method: "POST",
              data: { id: theme.id, is_default: false },
              tokenType: "jwt",
            },
          );
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);

      // Then set the selected theme as default
      await apiClient(`${import.meta.env.VITE_SERVER}/theme/themes/update`, {
        method: "POST",
        data: {
          id: themeId,
          is_default: true,
        },
        tokenType: "jwt",
      });

      toast.success("Theme set as default successfully");
      fetchThemes();
    } catch (error: any) {
      toast.error(error.message || "Failed to set theme as default");
    }
  };

  // Export theme
  const handleExportTheme = async (themeId: string) => {
    try {
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/theme/themes/export`,
        {
          method: "POST",
          data: { id: themeId },
          tokenType: "jwt",
        },
      );

      // Create download link
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `theme-${themeId}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Theme exported successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to export theme");
    }
  };

  // Import theme
  const handleImportTheme = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const themeData = JSON.parse(e.target?.result as string);

          await apiClient(
            `${import.meta.env.VITE_SERVER}/theme/themes/import`,
            {
              method: "POST",
              data: themeData,
              tokenType: "jwt",
            },
          );

          toast.success("Theme imported successfully");
          fetchThemes();
        } catch (error: any) {
          toast.error("Invalid theme file format");
        }
      };
      reader.readAsText(file);
    } catch (error: any) {
      toast.error(error.message || "Failed to import theme");
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const activeTheme = themes.find((theme) => theme.is_active);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Layout className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-gray-900">Theme Manager</h1>
            {activeTheme && (
              <Badge className="ml-2">Active: {activeTheme.name}</Badge>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={fetchThemes} disabled={loading}>
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={preloadSampleData}
              disabled={preloading}
            >
              <Sparkles
                className={`h-4 w-4 mr-2 ${preloading ? "animate-spin" : ""}`}
              />
              {preloading ? "Loading..." : "Load Sample Data"}
            </Button>
            <Button onClick={handleCreateTheme}>
              <Plus className="h-4 w-4 mr-2" />
              New Theme
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full max-w-2xl grid-cols-5">
            <TabsTrigger value="themes" className="flex items-center gap-2">
              <Layout className="h-4 w-4" />
              Themes
            </TabsTrigger>
            <TabsTrigger
              value="editor"
              className="flex items-center gap-2"
              disabled={!selectedTheme}
            >
              <Palette className="h-4 w-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="flex items-center gap-2"
              disabled={!selectedTheme}
            >
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="components" className="flex items-center gap-2">
              <File className="h-4 w-4" />
              Components
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="themes">
            <ThemeList
              themes={themes}
              loading={loading}
              onSelectTheme={(theme) => {
                setSelectedTheme(theme);
                setActiveTab("editor");
              }}
              onSetActive={handleSetActive}
              onSetDefault={handleSetDefault}
              onDeleteTheme={handleDeleteTheme}
              onExportTheme={handleExportTheme}
              onImportTheme={handleImportTheme}
              onEditTheme={(theme) => {
                setSelectedTheme(theme);
                setActiveTab("editor");
              }}
            />
          </TabsContent>

          <TabsContent value="editor">
            {selectedTheme ? (
              <ThemeEditor
                theme={selectedTheme}
                onUpdateTheme={handleUpdateTheme}
              />
            ) : (
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                <Layout className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  No theme selected
                </h3>
                <p className="mt-2 text-gray-500">
                  Select a theme from the list to start editing
                </p>
                <Button onClick={handleCreateTheme} className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Theme
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="preview">
            {selectedTheme ? (
              <ThemePreview theme={selectedTheme} />
            ) : (
              <div className="rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
                <Eye className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  No theme selected
                </h3>
                <p className="mt-2 text-gray-500">
                  Select a theme from the list to preview
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="components">
            <ComponentLibrary />
          </TabsContent>

          <TabsContent value="settings">
            <div className="rounded-lg border bg-white p-6">
              <h2 className="text-lg font-semibold mb-4">Theme Settings</h2>
              <p className="text-gray-600">
                Configure global theme settings and preferences
              </p>
              {/* Add settings form here */}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
