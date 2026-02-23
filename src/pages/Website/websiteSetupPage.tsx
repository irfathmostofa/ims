"use client";

import { useState, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCrud } from "@/hook/crudHelper";
import GeneralSettings from "@/components/Settings/GeneralSettings";
import ColorSettings from "@/components/Settings/ColorSettings";
import TypographySettings from "@/components/Settings/TypographySettings";
import HeaderSettings from "@/components/Settings/HeaderSettings";
import HeroSettings from "@/components/Settings/HeroSettings";
import SideMenuSettings from "@/components/Settings/SideMenuSettings";
import CarouselSettings from "@/components/Settings/CarouselSettings";
import BannerSettings from "@/components/Settings/BannerSettings";
import SectionsSettings from "@/components/Settings/SectionsSettings";
import ProductSettings from "@/components/Settings/ProductSettings";
import ProductCardSettings from "@/components/Settings/ProductCardSettings";
import FooterSettings from "@/components/Settings/FooterSettings";
import PaymentSettings from "@/components/Settings/PaymentSettings";
import FloatingButtonSettings from "@/components/Settings/FloatingButtonSettings";

type SetupData = {
  id?: number;
  code?: string;
  key_name: string;
  value: string;
  group_name?: string;
  status?: string;
  created_by_name?: string;
  created_by?: string;
  updated_by_name?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
};

export default function WebsiteSetupPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [records, setRecords] = useState<SetupData[]>([]);
  const [configData, setConfigData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // CRUD hook for setup data
  const { fetchAll, save } = useCrud<SetupData>({
    listUrl: `${import.meta.env.VITE_SERVER}/setup/get-setup-data`,
    createUrl: `${import.meta.env.VITE_SERVER}/setup/create-setup`,
    updateUrl: `${import.meta.env.VITE_SERVER}/setup/update-setup-data`,
    deleteUrl: `${import.meta.env.VITE_SERVER}/setup/delete-setup-data`,
    formatCreate: (data) => ({
      key_name: data.key_name,
      value: JSON.stringify(data.value),
      group_name: data.group_name,
      code: data.code || "WEBSITE",
      status: data.status || "A",
    }),
    formatUpdate: (data) => ({
      id: data.id,
      key_name: data.key_name,
      value: JSON.stringify(data.value),
      group_name: data.group_name,
      code: data.code,
      status: data.status,
    }),
  });

  // Load configuration data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      await fetchAll(setRecords, setLoading);
    } catch (error) {
      console.error("Error loading config:", error);
      toast.error("Failed to load configuration");
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  // Transform records when they change
  useEffect(() => {
    if (records && records.length > 0) {
      const structured: any = {};

      records.forEach((item: SetupData) => {
        try {
          // Parse the value if it's a string
          const parsedValue =
            typeof item.value === "string"
              ? JSON.parse(item.value)
              : item.value;

          // Use key_name as the section identifier
          structured[item.key_name] = {
            id: item.id,
            value: parsedValue,
            status: item.status,
            code: item.code,
            group_name: item.group_name,
          };
        } catch (e) {
          console.error("Error parsing value for", item.key_name, e);
        }
      });

      setConfigData(structured);
      console.log("Structured data:", structured);
    }
  }, [records]);

  // Handle section data change
  const handleSectionChange = (section: string, data: any) => {
    setConfigData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        value: data,
      },
    }));
  };

  // Save section data
  const handleSaveSection = async (section: string) => {
    const sectionData = configData[section];

    setSaving(true);
    try {
      if (!sectionData || !sectionData.id) {
        // Create new record
        const newData = {
          key_name: section,
          value: sectionData?.value || getDefaultConfig(section),
          group_name: getGroupName(section),
          code: "WEBSITE",
          status: "A",
        };

        await save(newData);
        toast.success(`${section} settings saved successfully`);
      } else {
        // Update existing record
        const updateData = {
          id: sectionData.id,
          key_name: section,
          value: sectionData.value,
          group_name: sectionData.group_name,
          code: sectionData.code,
          status: sectionData.status || "A",
        };

        await save(updateData, sectionData.id);
        toast.success(`${section} settings updated successfully`);
      }

      // Refresh data
      await fetchAll(setRecords, setLoading);
    } catch (error) {
      console.error("Error saving section:", error);
      toast.error(`Failed to save ${section} settings`);
    } finally {
      setSaving(false);
    }
  };

  // Helper to get default config based on section
  const getDefaultConfig = (section: string) => {
    const defaults: any = {
      general: {
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
      },
      colors: {
        primary: "#006747",
        secondary: "#DA291C",
        accent: "#F68B1E",
        background: "#FFFFFF",
        text: "#1F2937",
        heading: "#111827",
        link: "#006747",
        footer_bg: "#1F2937",
        footer_text: "#F3F4F6",
        sale_badge: "#DA291C",
        new_badge: "#006747",
        discount_badge: "#F68B1E",
      },
      // ... other defaults
    };
    return defaults[section] || {};
  };

  // Helper to get group name
  const getGroupName = (section: string): string => {
    const groups: any = {
      general: "Website General",
      typography: "Website Design",
      colors: "Website Design",
      header_section: "Website Layout",
      hero_section: "Website Layout",
      sidemenu: "Website Layout",
      carousal: "Website Layout",
      banner: "Website Layout",
      sections: "Website Layout",
      footer_section: "Website Layout",
      product_section: "E-commerce",
      product_card: "E-commerce",
      payment: "E-commerce",
    };
    return groups[section] || "Website Configuration";
  };

  if (initialLoad && loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Website Configuration</h1>
        <Button
          onClick={() => fetchAll(setRecords, setLoading)}
          variant="outline"
          className="gap-2"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex flex-wrap h-auto p-1 bg-gray-100 rounded-lg">
          <TabsTrigger value="general" className="px-4 py-2">
            General
          </TabsTrigger>
          <TabsTrigger value="colors" className="px-4 py-2">
            Colors
          </TabsTrigger>
          <TabsTrigger value="typography" className="px-4 py-2">
            Typography
          </TabsTrigger>
          <TabsTrigger value="header" className="px-4 py-2">
            Header
          </TabsTrigger>
          <TabsTrigger value="hero" className="px-4 py-2">
            Hero
          </TabsTrigger>
          <TabsTrigger value="sidemenu" className="px-4 py-2">
            Side Menu
          </TabsTrigger>
          <TabsTrigger value="carousel" className="px-4 py-2">
            Carousel
          </TabsTrigger>
          <TabsTrigger value="banner" className="px-4 py-2">
            Banner
          </TabsTrigger>
          <TabsTrigger value="sections" className="px-4 py-2">
            Sections
          </TabsTrigger>
          <TabsTrigger value="product" className="px-4 py-2">
            Product
          </TabsTrigger>
          <TabsTrigger value="productcard" className="px-4 py-2">
            Product Card
          </TabsTrigger>
          <TabsTrigger value="footer" className="px-4 py-2">
            Footer
          </TabsTrigger>
          <TabsTrigger value="floating" className="px-4 py-2">
            Floating Button
          </TabsTrigger>
          <TabsTrigger value="payment" className="px-4 py-2">
            Payment
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="general">
            <GeneralSettings
              data={configData.general?.value}
              onChange={(data) => handleSectionChange("general", data)}
              onSave={() => handleSaveSection("general")}
              saving={saving}
            />
          </TabsContent>

          <TabsContent value="colors">
            <ColorSettings
              data={configData.colors?.value}
              onChange={(data) => handleSectionChange("colors", data)}
              onSave={() => handleSaveSection("colors")}
              saving={saving}
            />
          </TabsContent>

          <TabsContent value="typography">
            <TypographySettings
              data={configData.typography?.value}
              onChange={(data) => handleSectionChange("typography", data)}
              onSave={() => handleSaveSection("typography")}
              saving={saving}
            />
          </TabsContent>

          <TabsContent value="header">
            <HeaderSettings
              data={configData.header_section?.value}
              onChange={(data) => handleSectionChange("header_section", data)}
              onSave={() => handleSaveSection("header_section")}
              saving={saving}
            />
          </TabsContent>

          <TabsContent value="hero">
            <HeroSettings
              data={configData.hero_section?.value}
              onChange={(data) => handleSectionChange("hero_section", data)}
              onSave={() => handleSaveSection("hero_section")}
              saving={saving}
            />
          </TabsContent>

          <TabsContent value="sidemenu">
            <SideMenuSettings
              data={configData.sidemenu?.value}
              onChange={(data) => handleSectionChange("sidemenu", data)}
              onSave={() => handleSaveSection("sidemenu")}
              saving={saving}
            />
          </TabsContent>

          <TabsContent value="carousel">
            <CarouselSettings
              data={configData.carousal?.value}
              onChange={(data) => handleSectionChange("carousal", data)}
              onSave={() => handleSaveSection("carousal")}
              saving={saving}
            />
          </TabsContent>

          <TabsContent value="banner">
            <BannerSettings
              data={configData.banner?.value}
              onChange={(data) => handleSectionChange("banner", data)}
              onSave={() => handleSaveSection("banner")}
              saving={saving}
            />
          </TabsContent>

          <TabsContent value="sections">
            <SectionsSettings
              data={configData.sections?.value}
              onChange={(data) => handleSectionChange("sections", data)}
              onSave={() => handleSaveSection("sections")}
              saving={saving}
            />
          </TabsContent>

          <TabsContent value="product">
            <ProductSettings
              data={configData.product_section?.value}
              onChange={(data) => handleSectionChange("product_section", data)}
              onSave={() => handleSaveSection("product_section")}
              saving={saving}
            />
          </TabsContent>

          <TabsContent value="productcard">
            <ProductCardSettings
              data={configData.product_card?.value}
              onChange={(data) => handleSectionChange("product_card", data)}
              onSave={() => handleSaveSection("product_card")}
              saving={saving}
            />
          </TabsContent>

          <TabsContent value="footer">
            <FooterSettings
              data={configData.footer_section?.value}
              onChange={(data) => handleSectionChange("footer_section", data)}
              onSave={() => handleSaveSection("footer_section")}
              saving={saving}
            />
          </TabsContent>
          <TabsContent value="floating">
            <FloatingButtonSettings
              data={configData.floating_buttons?.value}
              onChange={(data) => handleSectionChange("floating_buttons", data)}
              onSave={() => handleSaveSection("floating_buttons")}
              saving={saving}
            />
          </TabsContent>

          <TabsContent value="payment">
            <PaymentSettings
              data={configData.payment?.value}
              onChange={(data) => handleSectionChange("payment", data)}
              onSave={() => handleSaveSection("payment")}
              saving={saving}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
