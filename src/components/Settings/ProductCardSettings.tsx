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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  // WhatsApp Settings
  const handleWhatsAppChange = (field: string, value: any) => {
    const updated = {
      ...formData,
      whatsapp: {
        ...(formData.whatsapp || {}),
        [field]: value,
      },
    };
    setFormData(updated);
    onChange(updated);
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
        <Tabs defaultValue="layout" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="view-options">View Options</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp Settings</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* Layout Tab */}
          <TabsContent value="layout" className="space-y-4">
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
              </div>

              {/* Elements to Show */}
              <div className="space-y-4">
                <h3 className="font-medium">Elements to Show</h3>

                <div className="space-y-3">
                  {[
                    { key: "show_title", label: "Show Title" },
                    { key: "show_price", label: "Show Price" },
                    { key: "show_rating", label: "Show Rating" },
                    { key: "show_sku", label: "Show SKU" },
                    { key: "show_stock", label: "Show Stock Status" },
                    { key: "show_brand", label: "Show Brand" },
                    { key: "show_category", label: "Show Category" },
                    {
                      key: "show_short_description",
                      label: "Show Short Description",
                    },
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
          </TabsContent>

          {/* Buttons Tab */}
          <TabsContent value="buttons" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Button Types */}
              <div className="space-y-4">
                <h3 className="font-medium">Button Types</h3>

                {[
                  { key: "show_add_to_cart", label: "Add to Cart" },
                  { key: "show_buy_now", label: "Buy Now" },
                  {
                    key: "show_inquiry",
                    label: "Product Inquiry (Email/Form)",
                  },
                  {
                    key: "show_contact_whatsapp",
                    label: "Contact to Buy (WhatsApp)",
                  },
                  { key: "show_wishlist", label: "Wishlist" },
                  { key: "show_compare", label: "Compare" },
                  { key: "show_quick_view", label: "Quick View" },
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

              {/* Button Settings */}
              <div className="space-y-4">
                <h3 className="font-medium">Button Settings</h3>

                <div className="space-y-2">
                  <Label htmlFor="button_style">Button Style</Label>
                  <Select
                    value={formData.button_style || "icon"}
                    onValueChange={(value) =>
                      handleChange("button_style", value)
                    }
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
                  <Label htmlFor="button_size">Button Size</Label>
                  <Select
                    value={formData.button_size || "md"}
                    onValueChange={(value) =>
                      handleChange("button_size", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sm">Small</SelectItem>
                      <SelectItem value="md">Medium</SelectItem>
                      <SelectItem value="lg">Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="button_position">Button Position</Label>
                  <Select
                    value={formData.button_position || "bottom"}
                    onValueChange={(value) =>
                      handleChange("button_position", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom">Bottom of Card</SelectItem>
                      <SelectItem value="after_image">After Image</SelectItem>
                      <SelectItem value="hover">Show on Hover</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primary_button">Primary Button</Label>
                  <Select
                    value={formData.primary_button || "add_to_cart"}
                    onValueChange={(value) =>
                      handleChange("primary_button", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add_to_cart">Add to Cart</SelectItem>
                      <SelectItem value="buy_now">Buy Now</SelectItem>
                      <SelectItem value="inquiry">Product Inquiry</SelectItem>
                      <SelectItem value="whatsapp">
                        Contact on WhatsApp
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500">
                    Select which button appears as primary (if multiple are
                    enabled)
                  </p>
                </div>
              </div>
            </div>

            {/* Button Labels */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">Button Labels</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Add to Cart (English)</Label>
                  <Input
                    value={formData.add_to_cart_text || "Add to Cart"}
                    onChange={(e) =>
                      handleChange("add_to_cart_text", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Add to Cart (Bengali)</Label>
                  <Input
                    value={formData.add_to_cart_text_bn || "কার্টে যোগ করুন"}
                    onChange={(e) =>
                      handleChange("add_to_cart_text_bn", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Buy Now (English)</Label>
                  <Input
                    value={formData.buy_now_text || "Buy Now"}
                    onChange={(e) =>
                      handleChange("buy_now_text", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Buy Now (Bengali)</Label>
                  <Input
                    value={formData.buy_now_text_bn || "এখনই কিনুন"}
                    onChange={(e) =>
                      handleChange("buy_now_text_bn", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Product Inquiry (English)</Label>
                  <Input
                    value={formData.inquiry_text || "Inquiry"}
                    onChange={(e) =>
                      handleChange("inquiry_text", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Product Inquiry (Bengali)</Label>
                  <Input
                    value={formData.inquiry_text_bn || "অনুসন্ধান"}
                    onChange={(e) =>
                      handleChange("inquiry_text_bn", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contact on WhatsApp (English)</Label>
                  <Input
                    value={formData.whatsapp_text || "Contact to Buy"}
                    onChange={(e) =>
                      handleChange("whatsapp_text", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact on WhatsApp (Bengali)</Label>
                  <Input
                    value={formData.whatsapp_text_bn || "কিনতে যোগাযোগ করুন"}
                    onChange={(e) =>
                      handleChange("whatsapp_text_bn", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Badge Types */}
              <div className="space-y-4">
                <h3 className="font-medium">Badge Types</h3>

                {[
                  { key: "show_sale_badge", label: "Show Sale Badge" },
                  { key: "show_new_badge", label: "Show New Badge" },
                  { key: "show_discount_badge", label: "Show Discount Badge" },
                  { key: "show_featured_badge", label: "Show Featured Badge" },
                  {
                    key: "show_bestseller_badge",
                    label: "Show Bestseller Badge",
                  },
                  {
                    key: "show_out_of_stock_badge",
                    label: "Show Out of Stock Badge",
                  },
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

              {/* Badge Settings */}
              <div className="space-y-4">
                <h3 className="font-medium">Badge Settings</h3>

                <div className="space-y-2">
                  <Label htmlFor="badge_position">Badge Position</Label>
                  <Select
                    value={formData.badge_position || "top-left"}
                    onValueChange={(value) =>
                      handleChange("badge_position", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top-left">Top Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Badge Text Settings */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">Badge Text Settings</h3>
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
                  <Label htmlFor="badge_text_bn">
                    Sale Badge Text (Bengali)
                  </Label>
                  <Input
                    id="badge_text_bn"
                    value={formData.badge_text_bn || "ছাড়"}
                    onChange={(e) =>
                      handleChange("badge_text_bn", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_badge_text">
                    New Badge Text (English)
                  </Label>
                  <Input
                    id="new_badge_text"
                    value={formData.new_badge_text || "New"}
                    onChange={(e) =>
                      handleChange("new_badge_text", e.target.value)
                    }
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

                <div className="space-y-2">
                  <Label htmlFor="discount_badge_text">
                    Discount Badge Format
                  </Label>
                  <Input
                    id="discount_badge_text"
                    value={formData.discount_badge_text || "-{percentage}%"}
                    onChange={(e) =>
                      handleChange("discount_badge_text", e.target.value)
                    }
                  />
                  <p className="text-xs text-gray-500">
                    Use {"{percentage}"} to show discount percentage
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount_badge_text_bn">
                    Discount Badge Format (Bengali)
                  </Label>
                  <Input
                    id="discount_badge_text_bn"
                    value={
                      formData.discount_badge_text_bn || "{percentage}% ছাড়"
                    }
                    onChange={(e) =>
                      handleChange("discount_badge_text_bn", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* View Options Tab */}
          <TabsContent value="view-options" className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">View Options</h3>
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
                        updated[index] = {
                          ...option,
                          label_bn: e.target.value,
                        };
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

            <div className="space-y-2 mt-4">
              <Label>Default View</Label>
              <Select
                value={formData.default_view || "grid"}
                onValueChange={(value) => handleChange("default_view", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid View</SelectItem>
                  <SelectItem value="list">List View</SelectItem>
                  <SelectItem value="compact">Compact View</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          {/* WhatsApp Settings Tab */}
          <TabsContent value="whatsapp" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-medium">WhatsApp Configuration</h3>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp_number">
                    Default WhatsApp Number
                  </Label>
                  <Input
                    id="whatsapp_number"
                    value={formData.whatsapp?.number || ""}
                    onChange={(e) =>
                      handleWhatsAppChange("number", e.target.value)
                    }
                    placeholder="+8801XXXXXXXXX"
                  />
                  <p className="text-xs text-gray-500">
                    This will be used if product doesn't have specific seller
                    number
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp_message">
                    Default Message Template
                  </Label>
                  <Input
                    id="whatsapp_message"
                    value={
                      formData.whatsapp?.message ||
                      "Hello, I'm interested in {product_name} (SKU: {sku})"
                    }
                    onChange={(e) =>
                      handleWhatsAppChange("message", e.target.value)
                    }
                  />
                  <p className="text-xs text-gray-500">
                    Use {"{product_name}"}, {"{sku}"}, {"{price}"} as variables
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp_message_bn">
                    Message Template (Bengali)
                  </Label>
                  <Input
                    id="whatsapp_message_bn"
                    value={
                      formData.whatsapp?.message_bn ||
                      "আমি {product_name} পণ্যটি সম্পর্কে জানতে চাই (SKU: {sku})"
                    }
                    onChange={(e) =>
                      handleWhatsAppChange("message_bn", e.target.value)
                    }
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.whatsapp?.show_seller_number || false}
                    onCheckedChange={(checked) =>
                      handleWhatsAppChange("show_seller_number", checked)
                    }
                  />
                  <Label>Show Seller's WhatsApp Number (if available)</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.whatsapp?.open_in_new_tab || true}
                    onCheckedChange={(checked) =>
                      handleWhatsAppChange("open_in_new_tab", checked)
                    }
                  />
                  <Label>Open WhatsApp in New Tab</Label>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">Button Appearance</h3>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp_button_color">Button Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.whatsapp?.button_color || "#25D366"}
                      onChange={(e) =>
                        handleWhatsAppChange("button_color", e.target.value)
                      }
                      className="w-12 p-1"
                    />
                    <Input
                      value={formData.whatsapp?.button_color || "#25D366"}
                      onChange={(e) =>
                        handleWhatsAppChange("button_color", e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp_button_text">
                    Button Text (English)
                  </Label>
                  <Input
                    id="whatsapp_button_text"
                    value={
                      formData.whatsapp?.button_text || "Contact on WhatsApp"
                    }
                    onChange={(e) =>
                      handleWhatsAppChange("button_text", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp_button_text_bn">
                    Button Text (Bengali)
                  </Label>
                  <Input
                    id="whatsapp_button_text_bn"
                    value={
                      formData.whatsapp?.button_text_bn ||
                      "হোয়াটসঅ্যাপে যোগাযোগ"
                    }
                    onChange={(e) =>
                      handleWhatsAppChange("button_text_bn", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp_icon">Icon</Label>
                  <Select
                    value={formData.whatsapp?.icon || "whatsapp"}
                    onValueChange={(value) =>
                      handleWhatsAppChange("icon", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="whatsapp">WhatsApp Icon</SelectItem>
                      <SelectItem value="message">Message Icon</SelectItem>
                      <SelectItem value="chat">Chat Icon</SelectItem>
                      <SelectItem value="phone">Phone Icon</SelectItem>
                      <SelectItem value="none">No Icon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2">WhatsApp Button Preview</h3>
              <button
                className="px-4 py-2 rounded text-white flex items-center gap-2"
                style={{
                  backgroundColor: formData.whatsapp?.button_color || "#25D366",
                }}
              >
                {formData.whatsapp?.icon === "whatsapp" && "📱"}
                {formData.whatsapp?.icon === "message" && "💬"}
                {formData.whatsapp?.icon === "chat" && "🗨️"}
                {formData.whatsapp?.icon === "phone" && "📞"}
                <span>
                  {formData.whatsapp?.button_text_bn || "হোয়াটসঅ্যাপে যোগাযোগ"}
                </span>
              </button>
            </div>
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-4">
            <h3 className="font-medium mb-4">Product Card Preview</h3>
            <div className="border rounded-lg p-4 max-w-xs mx-auto">
              <div className="relative">
                <div className="aspect-square bg-gray-200 rounded-lg mb-3"></div>

                {/* Badges Preview */}
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
                {formData.show_discount_badge && (
                  <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                    -20%
                  </span>
                )}
              </div>

              {/* Product Info */}
              {formData.show_title && (
                <h4 className="font-medium mb-1">স্যামসাং গ্যালাক্সি S23</h4>
              )}

              {formData.show_sku && (
                <p className="text-xs text-gray-500 mb-1">SKU: SM-S23-001</p>
              )}

              {formData.show_brand && (
                <p className="text-xs text-gray-500 mb-1">ব্র্যান্ড: Samsung</p>
              )}

              {formData.show_rating && (
                <div className="flex items-center gap-1 mb-2">
                  <span className="text-yellow-400">★★★★★</span>
                  <span className="text-sm text-gray-500">(১০)</span>
                </div>
              )}

              {formData.show_price && (
                <div className="text-lg font-bold text-gray-900 mb-2">
                  ৳ ১,২০,০০০
                </div>
              )}

              {formData.show_short_description && (
                <p className="text-sm text-gray-600 mb-3">
                  5G, 256GB, 8GB RAM, 50MP ক্যামেরা
                </p>
              )}

              {/* Buttons Preview */}
              <div className="flex gap-2 mt-3">
                {formData.show_add_to_cart &&
                  formData.primary_button === "add_to_cart" && (
                    <button className="flex-1 bg-blue-600 text-white py-2 rounded text-sm">
                      {formData.add_to_cart_text_bn || "কার্টে যোগ করুন"}
                    </button>
                  )}

                {formData.show_buy_now &&
                  formData.primary_button === "buy_now" && (
                    <button className="flex-1 bg-green-600 text-white py-2 rounded text-sm">
                      {formData.buy_now_text_bn || "এখনই কিনুন"}
                    </button>
                  )}

                {formData.show_contact_whatsapp &&
                  formData.primary_button === "whatsapp" && (
                    <button
                      className="flex-1 text-white py-2 rounded text-sm flex items-center justify-center gap-1"
                      style={{
                        backgroundColor:
                          formData.whatsapp?.button_color || "#25D366",
                      }}
                    >
                      {formData.whatsapp?.icon === "whatsapp" && "📱"}
                      {formData.whatsapp?.button_text_bn ||
                        "হোয়াটসঅ্যাপে যোগাযোগ"}
                    </button>
                  )}

                {formData.show_inquiry &&
                  formData.primary_button === "inquiry" && (
                    <button className="flex-1 bg-purple-600 text-white py-2 rounded text-sm">
                      {formData.inquiry_text_bn || "অনুসন্ধান"}
                    </button>
                  )}
              </div>

              {/* Secondary Buttons */}
              <div className="flex gap-2 mt-2">
                {formData.show_wishlist && (
                  <button className="flex-1 border border-gray-300 py-2 rounded text-sm">
                    ♥
                  </button>
                )}
                {formData.show_compare && (
                  <button className="flex-1 border border-gray-300 py-2 rounded text-sm">
                    ⇄
                  </button>
                )}
                {formData.show_quick_view && (
                  <button className="flex-1 border border-gray-300 py-2 rounded text-sm">
                    👁️
                  </button>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
