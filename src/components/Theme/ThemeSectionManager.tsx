// src/components/theme/ThemeSectionManager.tsx
import  { useState, useEffect } from "react";
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

interface ThemeSectionManagerProps {
  themeId: string;
  sections: any;
  componentVariants: any[];
  componentTypes: any[];
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
  //   created_at: string;
  //   updated_at: string;
}

interface ThemeSections {
  header: ThemeSection[];
  hero: ThemeSection[];
  content: ThemeSection[];
  footer: ThemeSection[];
}

// Mock sections data for testing
const mockSectionsData: ThemeSections = {
  header: [
    {
      id: "de73c717-99a9-46c3-86a4-7e0b401edbe0",
      theme_id: "509dc841-01a4-4a70-8f79-166c42e15607",
      component_variant_id: "bd48ef22-864c-4d9a-ad6d-11fc4259b972",
      name: "Top Bar",
      section_key: "header_top",
      order_index: 1,
      position: "HEADER",
      is_visible: true,
      config_data: {
        show_announcement: true,
        announcement_text: "🔥 Free Shipping on Orders Over $50",
        background_color: "#111827",
      },
      component: {
        variant_id: "bd48ef22-864c-4d9a-ad6d-11fc4259b972",
        variant_name: "header_top_bar",
        component_path: "components/header/HeaderTopBar",
        default_config: {},
        css_template: "",
      },
    },
    {
      id: "10efd9f9-c768-4f4e-8ef9-c28daae64669",
      theme_id: "509dc841-01a4-4a70-8f79-166c42e15607",
      component_variant_id: "0e673efc-f356-4349-ba0a-0c7026ddd399",
      name: "Main Header",
      section_key: "header_main",
      order_index: 2,
      position: "HEADER",
      is_visible: true,
      config_data: {
        logo: "/logo.svg",
        search_enabled: true,
      },
      component: {
        variant_id: "0e673efc-f356-4349-ba0a-0c7026ddd399",
        variant_name: "header_main_v2",
        component_path: "components/header/HeaderMain",
        default_config: {},
        css_template: "",
      },
    },
  ],
  hero: [
    {
      id: "30fce40e-17dd-4b32-9fd6-d8608e398899",
      theme_id: "509dc841-01a4-4a70-8f79-166c42e15607",
      component_variant_id: "89cbcf75-288c-4a75-80c9-34f32e02bc50",
      name: "Hero Banner",
      section_key: "hero_banner",
      order_index: 1,
      position: "HERO",
      is_visible: true,
      config_data: {
        title: "Summer Sale Up to 70% Off",
        subtitle: "Latest Fashion Trends",
        button_text: "Shop Now",
      },
      component: {
        variant_id: "89cbcf75-288c-4a75-80c9-34f32e02bc50",
        variant_name: "hero_sidebar_carousel",
        component_path: "components/hero/HeroWithSidebar",
        default_config: {},
        css_template: "",
      },
    },
  ],
  content: [
    {
      id: "9724b0ea-c002-4552-9465-8a229f244b12",
      theme_id: "509dc841-01a4-4a70-8f79-166c42e15607",
      component_variant_id: "eb251ede-fb0d-4f9d-9c14-85551a07f201",
      name: "Featured Categories",
      section_key: "featured_categories",
      order_index: 1,
      position: "CONTENT",
      is_visible: true,
      config_data: {
        title: "Shop by Category",
        layout: "grid-6",
      },
      component: {
        variant_id: "eb251ede-fb0d-4f9d-9c14-85551a07f201",
        variant_name: "category_grid",
        component_path: "components/category/CategoryGrid",
        default_config: {},
        css_template: "",
      },
    },
    {
      id: "8c4bad86-32cb-4ace-b1fb-fa3eb0512a47",
      theme_id: "509dc841-01a4-4a70-8f79-166c42e15607",
      component_variant_id: "40351800-3ad7-470e-8a2b-226312b2b572",
      name: "Featured Products",
      section_key: "featured_products",
      order_index: 2,
      position: "CONTENT",
      is_visible: true,
      config_data: {
        title: "Featured Products",
        layout: "grid-5",
      },
      component: {
        variant_id: "40351800-3ad7-470e-8a2b-226312b2b572",
        variant_name: "product_grid",
        component_path: "components/product/ProductGrid",
        default_config: {},
        css_template: "",
      },
    },
  ],
  footer: [
    {
      id: "7963aa01-a809-4f78-8528-63ef29800d50",
      theme_id: "509dc841-01a4-4a70-8f79-166c42e15607",
      component_variant_id: "25493108-b270-4c54-a30d-500ee202139c",
      name: "Main Footer",
      section_key: "footer_main",
      order_index: 1,
      position: "FOOTER",
      is_visible: true,
      config_data: {
        layout: "4-column",
        background_color: "#111827",
      },
      component: {
        variant_id: "25493108-b270-4c54-a30d-500ee202139c",
        variant_name: "footer_4_column",
        component_path: "components/footer/FooterMain",
        default_config: {},
        css_template: "",
      },
    },
  ],
};

export default function ThemeSectionManager({
  themeId,
  sections,
  componentVariants,
  componentTypes,
}: ThemeSectionManagerProps) {
  const [loading, setLoading] = useState(false);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
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

  console.log("ThemeSectionManager Props:", {
    themeId,
    sections,
    componentVariantsCount: componentVariants?.length,
    componentTypesCount: componentTypes?.length,
  });

  // Use mock component variants if none provided
  const availableComponentVariants =
    componentVariants && componentVariants.length > 0
      ? componentVariants
      : [
          {
            id: "bd48ef22-864c-4d9a-ad6d-11fc4259b972",
            component_type_id: "c0b1e2d3-a456-7890-b123-c456def78901",
            component_type: { display_name: "Header Top Bar" },
            variant_name: "header_top_bar",
            display_name: "Top Bar with Announcement",
            description: "A top bar with announcement message",
            component_path: "components/header/HeaderTopBar",
            config_schema: {},
            default_config: {},
            css_template: {},
            version: "1.0.0",
            is_active: true,
            sort_order: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "0e673efc-f356-4349-ba0a-0c7026ddd399",
            component_type_id: "c0b1e2d3-a456-7890-b123-c456def78902",
            component_type: { display_name: "Main Header" },
            variant_name: "header_main_v2",
            display_name: "Main Header V2",
            description: "Main header with logo, search, and navigation",
            component_path: "components/header/HeaderMain",
            config_schema: {},
            default_config: {},
            css_template: {},
            version: "1.0.0",
            is_active: true,
            sort_order: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "d39a36d7-3872-4977-a9dc-c46f558e7ac4",
            component_type_id: "c0b1e2d3-a456-7890-b123-c456def78903",
            component_type: { display_name: "Navigation Menu" },
            variant_name: "mega_menu",
            display_name: "Mega Menu",
            description: "Mega menu with dropdown categories",
            component_path: "components/navigation/MegaMenu",
            config_schema: {},
            default_config: {},
            css_template: {},
            version: "1.0.0",
            is_active: true,
            sort_order: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "89cbcf75-288c-4a75-80c9-34f32e02bc50",
            component_type_id: "c0b1e2d3-a456-7890-b123-c456def78904",
            component_type: { display_name: "Hero Section" },
            variant_name: "hero_sidebar_carousel",
            display_name: "Hero with Sidebar & Carousel",
            description: "Hero section with sidebar and image carousel",
            component_path: "components/hero/HeroWithSidebar",
            config_schema: {},
            default_config: {},
            css_template: {},
            version: "1.0.0",
            is_active: true,
            sort_order: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "eb251ede-fb0d-4f9d-9c14-85551a07f201",
            component_type_id: "c0b1e2d3-a456-7890-b123-c456def78905",
            component_type: { display_name: "Category Grid" },
            variant_name: "category_grid",
            display_name: "Category Grid",
            description: "Grid layout for displaying categories",
            component_path: "components/category/CategoryGrid",
            config_schema: {},
            default_config: {},
            css_template: {},
            version: "1.0.0",
            is_active: true,
            sort_order: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "40351800-3ad7-470e-8a2b-226312b2b572",
            component_type_id: "c0b1e2d3-a456-7890-b123-c456def78906",
            component_type: { display_name: "Product Grid" },
            variant_name: "product_grid",
            display_name: "Product Grid",
            description: "Grid layout for displaying products",
            component_path: "components/product/ProductGrid",
            config_schema: {},
            default_config: {},
            css_template: {},
            version: "1.0.0",
            is_active: true,
            sort_order: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "25493108-b270-4c54-a30d-500ee202139c",
            component_type_id: "c0b1e2d3-a456-7890-b123-c456def78911",
            component_type: { display_name: "Main Footer" },
            variant_name: "footer_4_column",
            display_name: "4-Column Footer",
            description: "Footer with 4 columns layout",
            component_path: "components/footer/FooterMain",
            config_schema: {},
            default_config: {},
            css_template: {},
            version: "1.0.0",
            is_active: true,
            sort_order: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: "g1h2i3j4-k5l6-7890-mnop-qrstuvwxyz01",
            component_type_id: "c0b1e2d3-a456-7890-b123-c456def78912",
            component_type: { display_name: "Footer Bottom" },
            variant_name: "footer_bottom_bar",
            display_name: "Footer Bottom Bar",
            description: "Bottom bar of the footer",
            component_path: "components/footer/FooterBottom",
            config_schema: {},
            default_config: {},
            css_template: {},
            version: "1.0.0",
            is_active: true,
            sort_order: 1,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ];

  // Initialize sections from props or use mock data
  useEffect(() => {
    if (sections && (sections.header || sections.content || sections.footer)) {
      console.log("Initializing with provided sections:", sections);
      setThemeSections({
        header: sections.header || [],
        hero: sections.hero || [],
        content: sections.content || [],
        footer: sections.footer || [],
      });
    } else {
      console.log("Using mock sections data");
      // Use mock data for testing
      setThemeSections(mockSectionsData);
    }
  }, [sections]);

  console.log("Current themeSections:", themeSections);

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
        await Promise.all(
          updates.map((update) =>
            apiClient(
              `${import.meta.env.VITE_SERVER}/theme/theme-sections/update`,
              {
                method: "POST",
                data: update,
                tokenType: "jwt",
              },
            ),
          ),
        );
        toast.success("Section order updated");
        // Update local state
        setThemeSections((prev) => ({
          ...prev,
          [sourceType]: items,
        }));
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
        config_data: {},
        css_overrides: {},
        seo_settings: {},
        responsive_config: {},
        animation_settings: {},
        is_visible: true,
      };

      // For now, add to local state
      const newSection: ThemeSection = {
        id: `mock-${Date.now()}`,
        ...sectionData,
      };

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
    } catch (error: any) {
      toast.error(error.message || "Failed to add section");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSection = async (sectionId: string, updates: any) => {
    try {
      // Find and update section in local state
      let updated = false;
      const updatedSections = { ...themeSections };

      Object.keys(updatedSections).forEach((key) => {
        const sectionType = key as keyof ThemeSections;
        const index = updatedSections[sectionType].findIndex(
          (s) => s.id === sectionId,
        );
        if (index !== -1) {
          updatedSections[sectionType][index] = {
            ...updatedSections[sectionType][index],
            ...updates,
            updated_at: new Date().toISOString(),
          };
          updated = true;
        }
      });

      if (updated) {
        setThemeSections(updatedSections);
        toast.success("Section updated");
      }
    } catch (error) {
      toast.error("Failed to update section");
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;

    try {
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
      }
    } catch (error) {
      toast.error("Failed to delete section");
    }
  };

  const handleDuplicateSection = async (section: ThemeSection) => {
    try {
      const duplicateData = {
        theme_id: themeId,
        component_variant_id: section.component_variant_id,
        name: `${section.name} (Copy)`,
        section_key: `${section.section_key}-copy`,
        position: section.position,
        order_index:
          themeSections[section.position.toLowerCase() as keyof ThemeSections]
            .length,
        config_data: section.config_data || {},
        css_overrides: section.css_overrides || {},
        seo_settings: section.seo_settings || {},
        responsive_config: section.responsive_config || {},
        animation_settings: section.animation_settings || {},
        is_visible: section.is_visible,
      };

      const newSection: ThemeSection = {
        id: `mock-duplicate-${Date.now()}`,
        ...duplicateData,
      };

      const positionKey = section.position.toLowerCase() as keyof ThemeSections;
      setThemeSections((prev) => ({
        ...prev,
        [positionKey]: [...prev[positionKey], newSection],
      }));

      toast.success("Section duplicated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to duplicate section");
    }
  };

  const getComponentVariantName = (variantId: string) => {
    const variant = availableComponentVariants.find((v) => v.id === variantId);
    return variant?.variant_name || variant?.display_name || "Unknown";
  };

  const getComponentTypeName = (variantId: string) => {
    const variant = availableComponentVariants.find((v) => v.id === variantId);
    return variant?.component_type?.display_name || "Unknown";
  };

  const renderSectionList = (type: keyof ThemeSections, title: string) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        <Badge variant="outline">{themeSections[type].length} sections</Badge>
      </CardHeader>
      <CardContent>
        {themeSections[type].length === 0 ? (
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
          <Accordion type="multiple" className="space-y-2">
            {themeSections[type].map((section: ThemeSection) => (
              <AccordionItem
                key={section.id}
                value={section.id}
                className="border rounded-lg"
              >
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center gap-3">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{section.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {getComponentVariantName(
                            section.component_variant_id,
                          )}
                        </Badge>
                        {!section.is_visible && (
                          <Badge variant="secondary" className="text-xs">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Hidden
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <span>{section.section_key}</span>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-xs">
                          {getComponentTypeName(section.component_variant_id)}
                        </span>
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`name-${section.id}`}>Name</Label>
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
                        <Label htmlFor={`key-${section.id}`}>Key</Label>
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
                            {availableComponentVariants.map((variant) => (
                              <SelectItem key={variant.id} value={variant.id}>
                                {variant.variant_name} (
                                {variant.component_type?.display_name ||
                                  variant.display_name}
                                )
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
                              order_index: parseInt(e.target.value) || 0,
                            })
                          }
                        />
                      </div>
                    </div>

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
                          onClick={() => handleDuplicateSection(section)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Duplicate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Open config editor dialog
                            toast.info("Config editor coming soon...");
                          }}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSection(section.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );

  const positionOptions = [
    { value: "header", label: "Header Sections" },
    { value: "hero", label: "Hero Sections" },
    { value: "content", label: "Content Sections" },
    { value: "footer", label: "Footer Sections" },
  ];

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
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Section</DialogTitle>
              <DialogDescription>
                Configure a new section for your theme
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Section Type</Label>
                <Select
                  value={selectedSectionType}
                  onValueChange={(value: any) => setSelectedSectionType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {positionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Component Variant</Label>
                <Select
                  value={newSectionData.component_variant_id}
                  onValueChange={(value) =>
                    setNewSectionData({
                      ...newSectionData,
                      component_variant_id: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select component variant" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableComponentVariants.length > 0 ? (
                      availableComponentVariants.map((variant) => (
                        <SelectItem key={variant.id} value={variant.id}>
                          {variant.variant_name} (
                          {variant.component_type?.display_name ||
                            variant.display_name}
                          )
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="" disabled>
                        No component variants available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

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
                />
                <p className="text-xs text-gray-500 mt-1">
                  Unique identifier for this section
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setSectionDialogOpen(false)}
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
                  {loading ? "Adding..." : "Add Section"}
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
    </div>
  );
}
