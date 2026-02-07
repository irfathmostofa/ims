// src/components/theme/ThemeSectionManager.tsx
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiClient } from "@/hook/apiClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DragDropContext,
  type DropResult,
  Draggable,
  Droppable,
} from "@hello-pangea/dnd";
import {
  Plus,
  GripVertical,
  EyeOff,
  Trash2,
  Settings,
  Copy,
  Layout,
  ChevronRight,
  Star,
  Zap,
  Grid3x3,
  Megaphone,
  Award,
  Sliders,
  Palette,
  Save,
  X,
  ChevronDown,
  Loader2,
  Globe,
  Smartphone,
  Tablet,
  Monitor,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ThemeSectionManagerProps {
  themeId: string;
  sections: any;
  componentVariants: any[];
  componentTypes: any[];
  onSectionsUpdated?: () => void;
}

interface ThemeSection {
  id: string;
  theme_id: string;
  component_variant_id: string;
  name: string;
  section_key: string;
  order_index: number;
  position: string;
  is_visible: boolean;
  config_data?: Record<string, any>;
  css_overrides?: Record<string, any>;
  seo_settings?: Record<string, any>;
  responsive_config?: Record<string, any>;
  animation_settings?: Record<string, any>;
  component?: {
    variant_id: string;
    variant_name: string;
    component_path: string;
    default_config: Record<string, any>;
    css_template: string;
  };
}

interface ThemeSections {
  header: ThemeSection[];
  hero: ThemeSection[];
  content: ThemeSection[];
  footer: ThemeSection[];
}

// Define config schemas for each component variant
const componentConfigSchemas: Record<string, any> = {
  // Header variants
  "header-v1": {
    fields: [
      {
        name: "logo",
        label: "Logo URL",
        type: "text",
        placeholder: "/logo.svg",
        default: "/logo.svg",
      },
      {
        name: "navigation",
        label: "Navigation Items",
        type: "array",
        placeholder: "Home, Shop, Categories, Deals",
        default: ["Home", "Shop", "Categories", "Deals"],
      },
      {
        name: "search_enabled",
        label: "Enable Search",
        type: "boolean",
        default: true,
      },
      {
        name: "sticky_header",
        label: "Sticky Header",
        type: "boolean",
        default: true,
      },
      {
        name: "cta_button",
        label: "CTA Button Text",
        type: "text",
        placeholder: "Contact Us",
        default: "Contact Us",
      },
    ],
  },
  "header-v2": {
    fields: [
      {
        name: "logo",
        label: "Logo URL",
        type: "text",
        default: "/logo.svg",
      },
      {
        name: "mega_menu",
        label: "Enable Mega Menu",
        type: "boolean",
        default: true,
      },
      {
        name: "search_placeholder",
        label: "Search Placeholder",
        type: "text",
        default: "Search products...",
      },
    ],
  },
  "header-top-bar": {
    fields: [
      {
        name: "message",
        label: "Announcement Message",
        type: "text",
        default: "Free shipping on orders over $50!",
      },
      {
        name: "bg_color",
        label: "Background Color",
        type: "color",
        default: "#3b82f6",
      },
      {
        name: "text_color",
        label: "Text Color",
        type: "color",
        default: "#ffffff",
      },
    ],
  },

  // Hero variants
  "hero-v1": {
    fields: [
      {
        name: "title",
        label: "Title",
        type: "text",
        default: "Summer Sale Up to 70% Off",
      },
      {
        name: "subtitle",
        label: "Subtitle",
        type: "text",
        default: "Shop the latest trends",
      },
      {
        name: "button_text",
        label: "Button Text",
        type: "text",
        default: "Shop Now",
      },
      {
        name: "background_image",
        label: "Background Image URL",
        type: "text",
        default: "/hero-bg.jpg",
      },
      {
        name: "overlay_opacity",
        label: "Overlay Opacity",
        type: "number",
        min: 0,
        max: 1,
        step: 0.1,
        default: 0.3,
      },
    ],
  },
  "hero-v2": {
    fields: [
      {
        name: "title",
        label: "Title",
        type: "text",
        default: "Welcome to Our Store",
      },
      {
        name: "sidebar_visible",
        label: "Show Sidebar",
        type: "boolean",
        default: true,
      },
      {
        name: "banner_count",
        label: "Number of Banners",
        type: "number",
        min: 1,
        max: 5,
        default: 3,
      },
    ],
  },

  // Content variants
  "featured-categories": {
    fields: [
      {
        name: "title",
        label: "Section Title",
        type: "text",
        default: "Shop by Category",
      },
      {
        name: "categories",
        label: "Categories",
        type: "array",
        default: ["Electronics", "Fashion", "Home", "Beauty"],
      },
      {
        name: "layout",
        label: "Layout",
        type: "select",
        options: [
          { value: "grid-3", label: "3 Column Grid" },
          { value: "grid-4", label: "4 Column Grid" },
          { value: "grid-5", label: "5 Column Grid" },
          { value: "carousel", label: "Carousel" },
        ],
        default: "grid-4",
      },
      {
        name: "show_count",
        label: "Show Product Count",
        type: "boolean",
        default: true,
      },
    ],
  },
  "today-deal": {
    fields: [
      {
        name: "title",
        label: "Section Title",
        type: "text",
        default: "Today's Best Deals",
      },
      {
        name: "show_timer",
        label: "Show Countdown Timer",
        type: "boolean",
        default: true,
      },
      {
        name: "end_time",
        label: "End Time",
        type: "datetime-local",
        default: "2024-12-31T23:59:59",
      },
      {
        name: "products_count",
        label: "Number of Products",
        type: "number",
        min: 1,
        max: 20,
        default: 8,
      },
      {
        name: "background_color",
        label: "Background Color",
        type: "color",
        default: "#fef3c7",
      },
    ],
  },
  "promo-banner": {
    fields: [
      {
        name: "title",
        label: "Title",
        type: "text",
        default: "Free Shipping Worldwide",
      },
      {
        name: "subtitle",
        label: "Subtitle",
        type: "text",
        default: "On orders over $50",
      },
      {
        name: "button_text",
        label: "Button Text",
        type: "text",
        default: "Learn More",
      },
      {
        name: "button_link",
        label: "Button Link",
        type: "text",
        default: "/shipping-info",
      },
      {
        name: "background",
        label: "Background Type",
        type: "select",
        options: [
          { value: "solid", label: "Solid Color" },
          { value: "gradient", label: "Gradient" },
          { value: "image", label: "Image" },
        ],
        default: "gradient",
      },
      {
        name: "background_color",
        label: "Background Color",
        type: "color",
        default: "#3b82f6",
      },
    ],
  },
  "brand-logos": {
    fields: [
      {
        name: "title",
        label: "Section Title",
        type: "text",
        default: "Trusted Brands",
      },
      {
        name: "brands",
        label: "Brand Names",
        type: "array",
        default: ["Brand 1", "Brand 2", "Brand 3", "Brand 4"],
      },
      {
        name: "layout",
        label: "Layout",
        type: "select",
        options: [
          { value: "carousel", label: "Carousel" },
          { value: "grid", label: "Grid" },
        ],
        default: "carousel",
      },
      {
        name: "autoplay",
        label: "Auto Play",
        type: "boolean",
        default: true,
      },
      {
        name: "autoplay_speed",
        label: "Auto Play Speed (ms)",
        type: "number",
        min: 1000,
        max: 10000,
        default: 3000,
      },
    ],
  },

  // Footer variants
  "footer-v1": {
    fields: [
      {
        name: "columns",
        label: "Number of Columns",
        type: "number",
        min: 1,
        max: 6,
        default: 4,
      },
      {
        name: "show_newsletter",
        label: "Show Newsletter Signup",
        type: "boolean",
        default: true,
      },
      {
        name: "social_links",
        label: "Show Social Links",
        type: "boolean",
        default: true,
      },
      {
        name: "copyright_text",
        label: "Copyright Text",
        type: "text",
        default: "© 2024 YourStore. All rights reserved.",
      },
    ],
  },
  "footer-bottom": {
    fields: [
      {
        name: "copyright",
        label: "Copyright Text",
        type: "text",
        default: "© 2024 YourStore. All rights reserved.",
      },
      {
        name: "show_payment_methods",
        label: "Show Payment Methods",
        type: "boolean",
        default: true,
      },
      {
        name: "payment_methods",
        label: "Payment Methods",
        type: "array",
        default: ["Visa", "MasterCard", "PayPal", "Apple Pay"],
      },
      {
        name: "bg_color",
        label: "Background Color",
        type: "color",
        default: "#1f2937",
      },
      {
        name: "text_color",
        label: "Text Color",
        type: "color",
        default: "#ffffff",
      },
    ],
  },
};

// Helper function to get config schema for a variant
const getConfigSchema = (variantId: string) => {
  return componentConfigSchemas[variantId] || { fields: [] };
};

// Config editor modal component
interface ConfigEditorModalProps {
  section: ThemeSection;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (config: Record<string, any>) => Promise<void>;
}

const ConfigEditorModal: React.FC<ConfigEditorModalProps> = ({
  section,
  open,
  onOpenChange,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [configData, setConfigData] = useState<Record<string, any>>(
    section.config_data || {},
  );
  const [cssOverrides, setCssOverrides] = useState<Record<string, any>>(
    section.css_overrides || {},
  );
  const [seoSettings, setSeoSettings] = useState<Record<string, any>>(
    section.seo_settings || {},
  );
  const [animationSettings, setAnimationSettings] = useState<
    Record<string, any>
  >(section.animation_settings || {});
  const [responsiveConfig, setResponsiveConfig] = useState<Record<string, any>>(
    section.responsive_config || {},
  );
  const [activeTab, setActiveTab] = useState("config");
  const [activeDevice, setActiveDevice] = useState<
    "mobile" | "tablet" | "desktop"
  >("desktop");
  const schema = getConfigSchema(section.component_variant_id);

  // Initialize config data with defaults
  useEffect(() => {
    if (schema.fields.length > 0 && open) {
      const defaultConfig = { ...configData };
      schema.fields.forEach((field: any) => {
        if (
          defaultConfig[field.name] === undefined &&
          field.default !== undefined
        ) {
          defaultConfig[field.name] = field.default;
        }
      });
      setConfigData(defaultConfig);
    }
  }, [schema, section.component_variant_id, open]);

  const handleFieldChange = (fieldName: string, value: any) => {
    setConfigData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleCssOverrideChange = (key: string, value: any) => {
    setCssOverrides((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleResponsiveConfigChange = (
    device: string,
    key: string,
    value: any,
  ) => {
    setResponsiveConfig((prev) => ({
      ...prev,
      [device]: {
        ...prev[device],
        [key]: value,
      },
    }));
  };

  const renderField = (field: any) => {
    const value =
      configData[field.name] !== undefined
        ? configData[field.name]
        : field.default;

    switch (field.type) {
      case "text":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              value={value || ""}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        );

      case "textarea":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Textarea
              id={field.name}
              value={value || ""}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={3}
            />
          </div>
        );

      case "number":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              type="number"
              value={value || ""}
              onChange={(e) =>
                handleFieldChange(field.name, parseFloat(e.target.value))
              }
              min={field.min}
              max={field.max}
              step={field.step || 1}
            />
          </div>
        );

      case "boolean":
        return (
          <div key={field.name} className="flex items-center justify-between">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Switch
              id={field.name}
              checked={!!value}
              onCheckedChange={(checked) =>
                handleFieldChange(field.name, checked)
              }
            />
          </div>
        );

      case "select":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Select
              value={value || field.default || ""}
              onValueChange={(val) => handleFieldChange(field.name, val)}
            >
              <SelectTrigger id={field.name}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option: any) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "color":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-md border"
                style={{ backgroundColor: value || field.default }}
              />
              <Input
                id={field.name}
                value={value || ""}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>
        );

      case "array":
        return (
          <div key={field.name} className="space-y-2">
            <Label>{field.label}</Label>
            <div className="space-y-2">
              {Array.isArray(value) &&
                value.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newArray = [...value];
                        newArray[index] = e.target.value;
                        handleFieldChange(field.name, newArray);
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const newArray = value.filter((_, i) => i !== index);
                        handleFieldChange(field.name, newArray);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const newArray = [...(value || []), ""];
                  handleFieldChange(field.name, newArray);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
          </div>
        );

      case "datetime-local":
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>{field.label}</Label>
            <Input
              id={field.name}
              type="datetime-local"
              value={value || ""}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await onSave({
        config_data: configData,
        css_overrides: cssOverrides,
        seo_settings: seoSettings,
        animation_settings: animationSettings,
        responsive_config: responsiveConfig,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save config:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configure {section.name}</DialogTitle>
          <DialogDescription>
            Edit configuration for{" "}
            {/* {getVariantDisplayName(section.component_variant_id)} */}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="config">
              <Settings className="h-4 w-4 mr-2" />
              Config
            </TabsTrigger>
            <TabsTrigger value="css">
              <Palette className="h-4 w-4 mr-2" />
              CSS
            </TabsTrigger>
            <TabsTrigger value="responsive">
              <Monitor className="h-4 w-4 mr-2" />
              Responsive
            </TabsTrigger>
            <TabsTrigger value="advanced">
              <Sliders className="h-4 w-4 mr-2" />
              Advanced
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schema.fields.map(renderField)}
            </div>
            {schema.fields.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Sliders className="h-12 w-12 mx-auto mb-2" />
                <p>No configuration options available for this component</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="css" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div>
                <Label>Custom CSS Classes</Label>
                <Input
                  value={cssOverrides?.classes || ""}
                  placeholder="custom-class-1 custom-class-2"
                  onChange={(e) =>
                    handleCssOverrideChange("classes", e.target.value)
                  }
                />
              </div>
              <div>
                <Label>Inline CSS</Label>
                <Textarea
                  value={cssOverrides?.inline || ""}
                  onChange={(e) =>
                    handleCssOverrideChange("inline", e.target.value)
                  }
                  placeholder=".custom-selector { color: red; }"
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>
              <div>
                <Label>Custom Styles (JSON)</Label>
                <Textarea
                  value={
                    cssOverrides?.styles
                      ? JSON.stringify(cssOverrides.styles, null, 2)
                      : ""
                  }
                  onChange={(e) => {
                    try {
                      const styles = e.target.value
                        ? JSON.parse(e.target.value)
                        : {};
                      handleCssOverrideChange("styles", styles);
                    } catch (error) {
                      // Invalid JSON, ignore
                    }
                  }}
                  placeholder='{"color": "#000", "backgroundColor": "#fff"}'
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="responsive" className="space-y-4 mt-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Button
                type="button"
                variant={activeDevice === "mobile" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveDevice("mobile")}
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile
              </Button>
              <Button
                type="button"
                variant={activeDevice === "tablet" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveDevice("tablet")}
              >
                <Tablet className="h-4 w-4 mr-2" />
                Tablet
              </Button>
              <Button
                type="button"
                variant={activeDevice === "desktop" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveDevice("desktop")}
              >
                <Monitor className="h-4 w-4 mr-2" />
                Desktop
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Visible on {activeDevice}</Label>
                  <Switch
                    checked={responsiveConfig[activeDevice]?.visible ?? true}
                    onCheckedChange={(checked) =>
                      handleResponsiveConfigChange(
                        activeDevice,
                        "visible",
                        checked,
                      )
                    }
                  />
                </div>
                <div>
                  <Label>Order on {activeDevice}</Label>
                  <Input
                    type="number"
                    value={
                      responsiveConfig[activeDevice]?.order_index ??
                      section.order_index
                    }
                    onChange={(e) =>
                      handleResponsiveConfigChange(
                        activeDevice,
                        "order_index",
                        parseInt(e.target.value) || 0,
                      )
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Custom CSS for {activeDevice}</Label>
                <Textarea
                  value={responsiveConfig[activeDevice]?.css || ""}
                  onChange={(e) =>
                    handleResponsiveConfigChange(
                      activeDevice,
                      "css",
                      e.target.value,
                    )
                  }
                  placeholder={`@media (max-width: ${activeDevice === "mobile" ? "768px" : activeDevice === "tablet" ? "1024px" : "1200px"}) { ... }`}
                  rows={3}
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            <Collapsible className="border rounded-lg">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4">
                <span className="font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  SEO Settings
                </span>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 pt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Meta Title</Label>
                    <Input
                      value={seoSettings?.title || ""}
                      onChange={(e) =>
                        setSeoSettings((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Meta Description</Label>
                    <Textarea
                      value={seoSettings?.description || ""}
                      onChange={(e) =>
                        setSeoSettings((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      rows={2}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Meta Keywords</Label>
                    <Input
                      value={seoSettings?.keywords || ""}
                      onChange={(e) =>
                        setSeoSettings((prev) => ({
                          ...prev,
                          keywords: e.target.value,
                        }))
                      }
                      placeholder="keyword1, keyword2, keyword3"
                    />
                  </div>
                  <div>
                    <Label>Canonical URL</Label>
                    <Input
                      value={seoSettings?.canonical || ""}
                      onChange={(e) =>
                        setSeoSettings((prev) => ({
                          ...prev,
                          canonical: e.target.value,
                        }))
                      }
                      placeholder="https://example.com/page"
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible className="border rounded-lg">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4">
                <span className="font-medium flex items-center gap-2">
                  <Sliders className="h-4 w-4" />
                  Animation Settings
                </span>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 pt-0 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Animation Type</Label>
                    <Select
                      value={animationSettings?.type || "none"}
                      onValueChange={(value) =>
                        setAnimationSettings((prev) => ({
                          ...prev,
                          type: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Animation</SelectItem>
                        <SelectItem value="fade">Fade In</SelectItem>
                        <SelectItem value="slide-up">Slide Up</SelectItem>
                        <SelectItem value="slide-down">Slide Down</SelectItem>
                        <SelectItem value="zoom-in">Zoom In</SelectItem>
                        <SelectItem value="bounce">Bounce</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Animation Duration (ms)</Label>
                    <Input
                      type="number"
                      value={animationSettings?.duration || 500}
                      onChange={(e) =>
                        setAnimationSettings((prev) => ({
                          ...prev,
                          duration: parseInt(e.target.value),
                        }))
                      }
                      min="0"
                      max="5000"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Animation Delay (ms)</Label>
                    <Input
                      type="number"
                      value={animationSettings?.delay || 0}
                      onChange={(e) =>
                        setAnimationSettings((prev) => ({
                          ...prev,
                          delay: parseInt(e.target.value),
                        }))
                      }
                      min="0"
                      max="5000"
                    />
                  </div>
                  <div>
                    <Label>Animation Easing</Label>
                    <Select
                      value={animationSettings?.easing || "ease"}
                      onValueChange={(value) =>
                        setAnimationSettings((prev) => ({
                          ...prev,
                          easing: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="linear">Linear</SelectItem>
                        <SelectItem value="ease">Ease</SelectItem>
                        <SelectItem value="ease-in">Ease In</SelectItem>
                        <SelectItem value="ease-out">Ease Out</SelectItem>
                        <SelectItem value="ease-in-out">Ease In Out</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Define component variants for each section type
const componentVariantsByType = {
  header: [
    {
      id: "header-v1",
      variant_name: "header_v1",
      display_name: "Header V1 - Classic",
      description: "Classic header with logo, navigation and search",
      icon: "layout",
      category: "header",
      recommended: true,
    },
    {
      id: "header-v2",
      variant_name: "header_v2",
      display_name: "Header V2 - Modern",
      description: "Modern header with mega menu and sticky behavior",
      icon: "layout",
      category: "header",
    },
    {
      id: "header-v3",
      variant_name: "header_v3",
      display_name: "Header V3 - Minimal",
      description: "Minimal header with clean design",
      icon: "layout",
      category: "header",
    },
    {
      id: "header-top-bar",
      variant_name: "header_top_bar",
      display_name: "Top Bar",
      description: "Top announcement bar with important messages",
      icon: "bar-chart-2",
      category: "header",
    },
  ],
  hero: [
    {
      id: "hero-v1",
      variant_name: "hero_v1",
      display_name: "Hero V1 - Full Width",
      description: "Full width hero with background image and CTA",
      icon: "image",
      category: "hero",
      recommended: true,
    },
    {
      id: "hero-v2",
      variant_name: "hero_v2",
      display_name: "Hero V2 - Sidebar Layout",
      description: "Hero with sidebar navigation and main banner",
      icon: "sidebar",
      category: "hero",
    },
    {
      id: "hero-v3",
      variant_name: "hero_v3",
      display_name: "Hero V3 - Carousel",
      description: "Hero with multiple slide carousel",
      icon: "slides",
      category: "hero",
    },
    {
      id: "hero-video",
      variant_name: "hero_video",
      display_name: "Video Hero",
      description: "Hero section with background video",
      icon: "video",
      category: "hero",
    },
  ],
  content: [
    {
      id: "featured-categories",
      variant_name: "featured_categories",
      display_name: "Featured Categories",
      description: "Display featured categories in grid layout",
      icon: <Grid3x3 className="h-4 w-4" />,
      category: "category",
      tags: ["grid", "category"],
    },
    {
      id: "best-deals",
      variant_name: "best_deals",
      display_name: "Best Deals",
      description: "Show best deals categorized by type",
      icon: <Star className="h-4 w-4" />,
      category: "deal",
      tags: ["deal", "offer"],
    },
    {
      id: "today-deal",
      variant_name: "today_deal",
      display_name: "Today's Deal",
      description: "Display today's special deals with timer",
      icon: <Zap className="h-4 w-4" />,
      category: "deal",
      tags: ["flash", "timer", "limited"],
    },
    {
      id: "product-grid",
      variant_name: "product_grid",
      display_name: "Product Grid",
      description: "Grid layout for displaying all products",
      icon: <Grid3x3 className="h-4 w-4" />,
      category: "product",
      tags: ["grid", "products"],
    },
    {
      id: "promo-banner",
      variant_name: "promo_banner",
      display_name: "Promotional Banner",
      description: "Promotional banner with call-to-action",
      icon: <Megaphone className="h-4 w-4" />,
      category: "banner",
      tags: ["promo", "banner", "cta"],
    },
    {
      id: "brand-logos",
      variant_name: "brand_logos",
      display_name: "Brand Logos",
      description: "Display brand logos in carousel or grid",
      icon: <Award className="h-4 w-4" />,
      category: "brand",
      tags: ["brand", "logo", "trust"],
    },
    {
      id: "featured-products",
      variant_name: "featured_products",
      display_name: "Featured Products",
      description: "Showcase featured or best selling products",
      icon: <Star className="h-4 w-4" />,
      category: "product",
      tags: ["featured", "products"],
    },
    {
      id: "testimonials",
      variant_name: "testimonials",
      display_name: "Testimonials",
      description: "Customer testimonials and reviews",
      icon: "message-circle",
      category: "content",
      tags: ["reviews", "testimonials"],
    },
  ],
  footer: [
    {
      id: "footer-v1",
      variant_name: "footer_v1",
      display_name: "Footer V1 - 4 Column",
      description: "Standard footer with 4 columns",
      icon: "columns",
      category: "footer",
      recommended: true,
    },
    {
      id: "footer-v2",
      variant_name: "footer_v2",
      display_name: "Footer V2 - 3 Column",
      description: "Footer with 3 columns and newsletter",
      icon: "columns",
      category: "footer",
    },
    {
      id: "footer-v3",
      variant_name: "footer_v3",
      display_name: "Footer V3 - Minimal",
      description: "Minimal footer with essential links",
      icon: "columns",
      category: "footer",
    },
    {
      id: "footer-bottom",
      variant_name: "footer_bottom",
      display_name: "Footer Bottom Bar",
      description: "Bottom bar with copyright and payment methods",
      icon: "credit-card",
      category: "footer",
    },
  ],
};

// Mock sections data for testing
const mockSectionsData: ThemeSections = {
  header: [
    {
      id: "header-section-1",
      theme_id: "509dc841-01a4-4a70-8f79-166c42e15607",
      component_variant_id: "header-v1",
      name: "Main Header",
      section_key: "header_main",
      order_index: 1,
      position: "HEADER",
      is_visible: true,
      config_data: {
        logo: "/logo.svg",
        navigation: ["Home", "Shop", "Categories", "Deals"],
        search_enabled: true,
      },
    },
  ],
  hero: [
    {
      id: "hero-section-1",
      theme_id: "509dc841-01a4-4a70-8f79-166c42e15607",
      component_variant_id: "hero-v1",
      name: "Main Hero",
      section_key: "hero_main",
      order_index: 1,
      position: "HERO",
      is_visible: true,
      config_data: {
        title: "Summer Sale Up to 70% Off",
        subtitle: "Shop the latest trends",
        button_text: "Shop Now",
        background_image: "/hero-bg.jpg",
      },
    },
  ],
  content: [
    {
      id: "content-section-1",
      theme_id: "509dc841-01a4-4a70-8f79-166c42e15607",
      component_variant_id: "featured-categories",
      name: "Featured Categories",
      section_key: "featured_categories",
      order_index: 1,
      position: "CONTENT",
      is_visible: true,
      config_data: {
        title: "Shop by Category",
        categories: ["Electronics", "Fashion", "Home", "Beauty"],
        layout: "grid-4",
      },
    },
    {
      id: "content-section-2",
      theme_id: "509dc841-01a4-4a70-8f79-166c42e15607",
      component_variant_id: "today-deal",
      name: "Today's Deal",
      section_key: "todays_deal",
      order_index: 2,
      position: "CONTENT",
      is_visible: true,
      config_data: {
        title: "Today's Best Deals",
        show_timer: true,
        end_time: "2024-12-31T23:59:59",
        products: ["product-1", "product-2", "product-3"],
      },
    },
    {
      id: "content-section-3",
      theme_id: "509dc841-01a4-4a70-8f79-166c42e15607",
      component_variant_id: "promo-banner",
      name: "Promotional Banner",
      section_key: "promo_banner",
      order_index: 3,
      position: "CONTENT",
      is_visible: true,
      config_data: {
        title: "Free Shipping Worldwide",
        subtitle: "On orders over $50",
        button_text: "Learn More",
        background: "gradient",
      },
    },
    {
      id: "content-section-4",
      theme_id: "509dc841-01a4-4a70-8f79-166c42e15607",
      component_variant_id: "brand-logos",
      name: "Brand Logos",
      section_key: "brand_logos",
      order_index: 4,
      position: "CONTENT",
      is_visible: true,
      config_data: {
        title: "Trusted Brands",
        brands: ["Brand 1", "Brand 2", "Brand 3", "Brand 4"],
        layout: "carousel",
      },
    },
  ],
  footer: [
    {
      id: "footer-section-1",
      theme_id: "509dc841-01a4-4a70-8f79-166c42e15607",
      component_variant_id: "footer-v1",
      name: "Main Footer",
      section_key: "footer_main",
      order_index: 1,
      position: "FOOTER",
      is_visible: true,
      config_data: {
        columns: 4,
        show_newsletter: true,
        social_links: true,
      },
    },
    {
      id: "footer-section-2",
      theme_id: "509dc841-01a4-4a70-8f79-166c42e15607",
      component_variant_id: "footer-bottom",
      name: "Footer Bottom",
      section_key: "footer_bottom",
      order_index: 2,
      position: "FOOTER",
      is_visible: true,
      config_data: {
        copyright: "© 2024 YourStore. All rights reserved.",
        show_payment_methods: true,
      },
    },
  ],
};

const positionOptions = [
  {
    value: "header",
    label: "Header Sections",
    icon: <Layout className="h-4 w-4" />,
  },
  { value: "hero", label: "Hero Sections", icon: <Star className="h-4 w-4" /> },
  {
    value: "content",
    label: "Content Sections",
    icon: <Grid3x3 className="h-4 w-4" />,
  },
  {
    value: "footer",
    label: "Footer Sections",
    icon: <Layout className="h-4 w-4" />,
  },
];

// API Service functions
const ThemeSectionService = {
  // Get sections for theme
  async getSections(themeId: string): Promise<ThemeSections> {
    try {
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/theme/theme-sections/list?theme_id=${themeId}`,
        {
          method: "GET",
          tokenType: "jwt",
        },
      );

      // Transform API response to our format
      const sections: ThemeSection[] = response.data || [];
      const groupedSections: ThemeSections = {
        header: [],
        hero: [],
        content: [],
        footer: [],
      };

      sections.forEach((section) => {
        const position = section.position.toLowerCase();
        if (position in groupedSections) {
          groupedSections[position as keyof ThemeSections].push(section);
        }
      });

      return groupedSections;
    } catch (error) {
      console.error("Failed to fetch sections:", error);
      throw error;
    }
  },

  // Create new section
  async createSection(
    sectionData: Partial<ThemeSection>,
  ): Promise<ThemeSection> {
    try {
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/theme/theme-sections/create`,
        {
          method: "POST",
          data: sectionData,
          tokenType: "jwt",
        },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to create section:", error);
      throw error;
    }
  },

  // Update section
  async updateSection(
    sectionId: string,
    updates: Partial<ThemeSection>,
  ): Promise<ThemeSection> {
    try {
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/theme/theme-sections/update`,
        {
          method: "POST",
          data: { id: sectionId, ...updates },
          tokenType: "jwt",
        },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to update section:", error);
      throw error;
    }
  },

  // Delete section
  async deleteSection(sectionId: string): Promise<void> {
    try {
      await apiClient(
        `${import.meta.env.VITE_SERVER}/theme/theme-sections/delete`,
        {
          method: "POST",
          data: { id: sectionId },
          tokenType: "jwt",
        },
      );
    } catch (error) {
      console.error("Failed to delete section:", error);
      throw error;
    }
  },

  // Reorder sections
  async reorderSections(
    sections: Array<{ id: string; order_index: number }>,
  ): Promise<void> {
    try {
      await apiClient(
        `${import.meta.env.VITE_SERVER}/theme/theme-sections/reorder`,
        {
          method: "POST",
          data: { sections },
          tokenType: "jwt",
        },
      );
    } catch (error) {
      console.error("Failed to reorder sections:", error);
      throw error;
    }
  },

  // Duplicate section
  async duplicateSection(sectionId: string): Promise<ThemeSection> {
    try {
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/theme/theme-sections/duplicate`,
        {
          method: "POST",
          data: { section_id: sectionId },
          tokenType: "jwt",
        },
      );
      return response.data;
    } catch (error) {
      console.error("Failed to duplicate section:", error);
      throw error;
    }
  },
};

export default function ThemeSectionManager({
  themeId,
  sections,
  onSectionsUpdated,
}: ThemeSectionManagerProps) {
  const [loading, setLoading] = useState(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<ThemeSection | null>(
    null,
  );
  const [selectedSectionType, setSelectedSectionType] = useState<
    "header" | "hero" | "content" | "footer"
  >("content");
  const [newSectionData, setNewSectionData] = useState({
    name: "",
    component_variant_id: "",
    position: "CONTENT",
    section_key: "",
    order_index: 0,
    config_data: {},
  });
  const [themeSections, setThemeSections] = useState<ThemeSections>({
    header: [],
    hero: [],
    content: [],
    footer: [],
  });

  // Get component variants for the selected section type
  const getComponentVariantsForType = (type: string) => {
    return (
      componentVariantsByType[type as keyof typeof componentVariantsByType] ||
      []
    );
  };

  // Get section type label with icon
  const getSectionTypeLabel = (type: string) => {
    const labels: Record<string, { label: string; icon: React.ReactNode }> = {
      header: {
        label: "Header Sections",
        icon: <Layout className="h-4 w-4" />,
      },
      hero: { label: "Hero Sections", icon: <Star className="h-4 w-4" /> },
      content: {
        label: "Content Sections",
        icon: <Grid3x3 className="h-4 w-4" />,
      },
      footer: {
        label: "Footer Sections",
        icon: <Layout className="h-4 w-4" />,
      },
    };
    return labels[type] || { label: type, icon: null };
  };

  // Get variant display name
  const getVariantDisplayName = (variantId: string) => {
    const allVariants = Object.values(componentVariantsByType).flat();
    const variant = allVariants.find((v) => v.id === variantId);
    return variant?.display_name || variantId;
  };

  // Get variant description
  const getVariantDescription = (variantId: string) => {
    const allVariants = Object.values(componentVariantsByType).flat();
    const variant = allVariants.find((v) => v.id === variantId);
    return variant?.description || "";
  };

  // Initialize sections
  useEffect(() => {
    const loadSections = async () => {
      if (themeId) {
        try {
          setLoading(true);
          const sections = await ThemeSectionService.getSections(themeId);
          setThemeSections(sections);
        } catch (error) {
          toast.error("Failed to load sections");
          // Fallback to mock data or provided sections
          if (
            sections &&
            (sections.header || sections.content || sections.footer)
          ) {
            setThemeSections({
              header: sections.header || [],
              hero: sections.hero || [],
              content: sections.content || [],
              footer: sections.footer || [],
            });
          } else {
            setThemeSections(mockSectionsData);
          }
        } finally {
          setLoading(false);
        }
      }
    };

    loadSections();
  }, [themeId, sections]);

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const sourceType = result.source.droppableId as keyof ThemeSections;
    const destType = result.destination.droppableId as keyof ThemeSections;
    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;

    // Reorder within same section type
    if (sourceType === destType) {
      const items = Array.from(themeSections[sourceType]);
      const [reorderedItem] = items.splice(sourceIndex, 1);
      items.splice(destIndex, 0, reorderedItem);

      // Update order indexes
      const updates = items.map((item: ThemeSection, index: number) => ({
        id: item.id,
        order_index: index,
      }));

      try {
        setLoading(true);
        await ThemeSectionService.reorderSections(updates);

        // Update local state
        setThemeSections((prev) => ({
          ...prev,
          [sourceType]: items,
        }));

        toast.success("Section order updated");
        onSectionsUpdated?.();
      } catch (error) {
        toast.error("Failed to update section order");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddSection = async () => {
    try {
      setLoading(true);

      // Map position based on selected type
      const positionMap: Record<string, string> = {
        header: "HEADER",
        hero: "HERO",
        content: "CONTENT",
        footer: "FOOTER",
      };

      const sectionData = {
        theme_id: themeId,
        component_variant_id: newSectionData.component_variant_id,
        name: newSectionData.name,
        section_key:
          newSectionData.section_key ||
          newSectionData.name.toLowerCase().replace(/\s+/g, "-"),
        position: positionMap[selectedSectionType],
        order_index: themeSections[selectedSectionType].length,
        config_data: newSectionData.config_data || {},
        css_overrides: {},
        seo_settings: {},
        responsive_config: {},
        animation_settings: {},
        is_visible: true,
      };

      // Create section via API
      const newSection = await ThemeSectionService.createSection(sectionData);

      // Add to local state
      setThemeSections((prev) => ({
        ...prev,
        [selectedSectionType]: [...prev[selectedSectionType], newSection],
      }));

      toast.success("Section added successfully");
      setSectionDialogOpen(false);
      setNewSectionData({
        name: "",
        component_variant_id: "",
        position: "CONTENT",
        section_key: "",
        order_index: 0,
        config_data: {},
      });

      onSectionsUpdated?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to add section");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSection = async (
    sectionId: string,
    updates: Partial<ThemeSection>,
  ) => {
    try {
      setLoading(true);

      // Update via API
      const updatedSection = await ThemeSectionService.updateSection(
        sectionId,
        updates,
      );

      // Update local state
      const updatedSections = { ...themeSections };
      let updated = false;

      Object.keys(updatedSections).forEach((key) => {
        const sectionType = key as keyof ThemeSections;
        const index = updatedSections[sectionType].findIndex(
          (s) => s.id === sectionId,
        );
        if (index !== -1) {
          updatedSections[sectionType][index] = {
            ...updatedSections[sectionType][index],
            ...updatedSection,
          };
          updated = true;
        }
      });

      if (updated) {
        setThemeSections(updatedSections);
        toast.success("Section updated");
        onSectionsUpdated?.();
      }
    } catch (error) {
      toast.error("Failed to update section");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;

    try {
      setLoading(true);

      // Delete via API
      await ThemeSectionService.deleteSection(sectionId);

      // Remove from local state
      const updatedSections = { ...themeSections };
      let deleted = false;

      Object.keys(updatedSections).forEach((key) => {
        const sectionType = key as keyof ThemeSections;
        const originalLength = updatedSections[sectionType].length;
        updatedSections[sectionType] = updatedSections[sectionType].filter(
          (s) => s.id !== sectionId,
        );
        if (updatedSections[sectionType].length !== originalLength) {
          deleted = true;
        }
      });

      if (deleted) {
        setThemeSections(updatedSections);
        toast.success("Section deleted");
        onSectionsUpdated?.();
      }
    } catch (error) {
      toast.error("Failed to delete section");
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateSection = async (section: ThemeSection) => {
    try {
      setLoading(true);

      // Duplicate via API
      const duplicatedSection = await ThemeSectionService.duplicateSection(
        section.id,
      );

      // Add to local state
      const positionKey = section.position.toLowerCase() as keyof ThemeSections;
      setThemeSections((prev) => ({
        ...prev,
        [positionKey]: [...prev[positionKey], duplicatedSection],
      }));

      toast.success("Section duplicated successfully");
      onSectionsUpdated?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to duplicate section");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveConfig = async (
    sectionId: string,
    config: Record<string, any>,
  ) => {
    await handleUpdateSection(sectionId, config);
  };

  // Open config editor
  const handleOpenConfigEditor = (section: ThemeSection) => {
    setSelectedSection(section);
    setConfigDialogOpen(true);
  };

  const renderSectionList = (type: keyof ThemeSections, title: string) => {
    const typeLabel = getSectionTypeLabel(type);

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {typeLabel.icon}
            {title}
          </CardTitle>
          <Badge variant="outline">{themeSections[type].length} sections</Badge>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : themeSections[type].length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <Layout className="mx-auto h-10 w-10 text-gray-400" />
              <h3 className="mt-4 text-sm font-semibold text-gray-900">
                No {title.toLowerCase()} sections
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Add sections to build your {title.toLowerCase()}
              </p>
            </div>
          ) : (
            <Droppable droppableId={type}>
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  <Accordion type="multiple" className="space-y-2">
                    {themeSections[type].map(
                      (section: ThemeSection, index: number) => (
                        <Draggable
                          key={section.id}
                          draggableId={section.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                            >
                              <AccordionItem
                                value={section.id}
                                className="border rounded-lg"
                              >
                                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                  <div className="flex items-center gap-3">
                                    <div {...provided.dragHandleProps}>
                                      <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                                    </div>
                                    <div className="flex-1 text-left">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">
                                          {section.name}
                                        </span>
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {getVariantDisplayName(
                                            section.component_variant_id,
                                          )}
                                        </Badge>
                                        {!section.is_visible && (
                                          <Badge
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            <EyeOff className="w-3 h-3 mr-1" />
                                            Hidden
                                          </Badge>
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-500 flex items-center gap-1">
                                        <span>{section.section_key}</span>
                                        <ChevronRight className="w-3 h-3" />
                                        <span className="text-xs">
                                          {getVariantDescription(
                                            section.component_variant_id,
                                          )}
                                        </span>
                                      </p>
                                    </div>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-4">
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label htmlFor={`name-${section.id}`}>
                                          Name
                                        </Label>
                                        <Input
                                          id={`name-${section.id}`}
                                          value={section.name}
                                          onChange={(e) =>
                                            handleUpdateSection(section.id, {
                                              name: e.target.value,
                                            })
                                          }
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor={`key-${section.id}`}>
                                          Key
                                        </Label>
                                        <Input
                                          id={`key-${section.id}`}
                                          value={section.section_key}
                                          onChange={(e) =>
                                            handleUpdateSection(section.id, {
                                              section_key: e.target.value,
                                            })
                                          }
                                        />
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>Component Variant</Label>
                                        <Select
                                          value={section.component_variant_id}
                                          onValueChange={(value) =>
                                            handleUpdateSection(section.id, {
                                              component_variant_id: value,
                                            })
                                          }
                                        >
                                          <SelectTrigger>
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {getComponentVariantsForType(
                                              type,
                                            ).map((variant) => (
                                              <SelectItem
                                                key={variant.id}
                                                value={variant.id}
                                              >
                                                <div className="flex flex-col">
                                                  <span>
                                                    {variant.display_name}
                                                  </span>
                                                  <span className="text-xs text-gray-500">
                                                    {variant.description}
                                                  </span>
                                                </div>
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <Label>Order Index</Label>
                                        <Input
                                          type="number"
                                          value={section.order_index}
                                          onChange={(e) =>
                                            handleUpdateSection(section.id, {
                                              order_index:
                                                parseInt(e.target.value) || 0,
                                            })
                                          }
                                        />
                                      </div>
                                    </div>

                                    {/* Config Preview */}
                                    {section.config_data &&
                                      Object.keys(section.config_data).length >
                                        0 && (
                                        <Collapsible>
                                          <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <Settings className="h-4 w-4" />
                                            Current Configuration
                                            <ChevronDown className="h-4 w-4 ml-auto" />
                                          </CollapsibleTrigger>
                                          <CollapsibleContent className="mt-2 space-y-1">
                                            {Object.entries(
                                              section.config_data,
                                            ).map(([key, value]) => (
                                              <div
                                                key={key}
                                                className="flex items-center text-sm"
                                              >
                                                <span className="text-gray-500 w-32 truncate">
                                                  {key}:
                                                </span>
                                                <span className="font-medium ml-2">
                                                  {typeof value === "string"
                                                    ? value
                                                    : JSON.stringify(value)}
                                                </span>
                                              </div>
                                            ))}
                                          </CollapsibleContent>
                                        </Collapsible>
                                      )}

                                    <Separator />

                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <Switch
                                          checked={section.is_visible}
                                          onCheckedChange={(checked) =>
                                            handleUpdateSection(section.id, {
                                              is_visible: checked,
                                            })
                                          }
                                        />
                                        <Label>Visible on site</Label>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            handleDuplicateSection(section)
                                          }
                                          disabled={loading}
                                        >
                                          <Copy className="h-4 w-4 mr-1" />
                                          Duplicate
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            handleOpenConfigEditor(section)
                                          }
                                          disabled={loading}
                                        >
                                          <Settings className="h-4 w-4 mr-1" />
                                          Configure
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() =>
                                            handleDeleteSection(section.id)
                                          }
                                          disabled={loading}
                                        >
                                          <Trash2 className="h-4 w-4 mr-1" />
                                          Delete
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </div>
                          )}
                        </Draggable>
                      ),
                    )}
                    {provided.placeholder}
                  </Accordion>
                </div>
              )}
            </Droppable>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Theme Sections</h2>
          <p className="text-gray-600">
            Manage the layout and content sections of your theme
          </p>
        </div>
        <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Section</DialogTitle>
              <DialogDescription>
                Configure a new section for your theme
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div>
                <Label>Section Type</Label>
                <Select
                  value={selectedSectionType}
                  onValueChange={(value: any) => {
                    setSelectedSectionType(value);
                    setNewSectionData((prev) => ({
                      ...prev,
                      component_variant_id: "",
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section type" />
                  </SelectTrigger>
                  <SelectContent>
                    {positionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          {option.icon}
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Component Variant</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {getComponentVariantsForType(selectedSectionType).map(
                    (variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        className={`p-4 border rounded-lg text-left transition-all hover:border-primary hover:bg-primary/5 ${
                          newSectionData.component_variant_id === variant.id
                            ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                            : "border-gray-200"
                        }`}
                        onClick={() =>
                          setNewSectionData({
                            ...newSectionData,
                            component_variant_id: variant.id,
                            name: variant.display_name,
                            section_key: variant.variant_name,
                          })
                        }
                        disabled={loading}
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-md">
                            {typeof variant.icon === "string" ? (
                              <Layout className="h-4 w-4 text-primary" />
                            ) : (
                              variant.icon
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">
                              {variant.display_name}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {variant.description}
                            </p>
                          </div>
                        </div>
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Section Name</Label>
                  <Input
                    value={newSectionData.name}
                    onChange={(e) =>
                      setNewSectionData({
                        ...newSectionData,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter section name"
                    disabled={loading}
                  />
                </div>

                <div>
                  <Label>Section Key</Label>
                  <Input
                    value={newSectionData.section_key}
                    onChange={(e) =>
                      setNewSectionData({
                        ...newSectionData,
                        section_key: e.target.value,
                      })
                    }
                    placeholder="section-key-name"
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Unique identifier for this section
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSectionDialogOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddSection}
                  disabled={
                    loading ||
                    !newSectionData.name ||
                    !newSectionData.component_variant_id
                  }
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Section"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid gap-6">
          {renderSectionList("header", "Header Sections")}
          {renderSectionList("hero", "Hero Sections")}
          {renderSectionList("content", "Content Sections")}
          {renderSectionList("footer", "Footer Sections")}
        </div>
      </DragDropContext>

      {selectedSection && (
        <ConfigEditorModal
          section={selectedSection}
          open={configDialogOpen}
          onOpenChange={setConfigDialogOpen}
          onSave={(config) => handleSaveConfig(selectedSection.id, config)}
        />
      )}
    </div>
  );
}
