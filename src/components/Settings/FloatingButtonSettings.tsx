"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash, MoveUp, MoveDown, Upload } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { uploadImageToCloudinary } from "@/hook/uploadImageToCloudinary";

interface FloatingButtonSettingsProps {
  data?: any;
  onChange: (data: any) => void;
  onSave: () => void;
  saving: boolean;
}

export default function FloatingButtonSettings({
  data,
  onChange,
  onSave,
  saving,
}: FloatingButtonSettingsProps) {
  const [formData, setFormData] = useState(
    data || {
      status: true,
      position: "right",
      offset_bottom: 20,
      offset_right: 20,
      offset_left: 20,
      z_index: 100,
      buttons: [],
      animation: "pulse",
      mobile_show: true,
      desktop_show: true,
    },
  );
  const [uploading, setUploading] = useState(false);
  const [uploadingForButton, setUploadingForButton] = useState<number | null>(
    null,
  );

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

  const handleImageUpload = async (file: File, buttonIndex: number) => {
    try {
      setUploading(true);
      setUploadingForButton(buttonIndex);
      const imageUrl = await uploadImageToCloudinary(file);

      const updatedButtons = [...(formData.buttons || [])];
      updatedButtons[buttonIndex] = {
        ...updatedButtons[buttonIndex],
        icon: imageUrl,
        icon_type: "custom",
      };
      handleChange("buttons", updatedButtons);

      toast.success("Icon uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload icon");
      console.error(error);
    } finally {
      setUploading(false);
      setUploadingForButton(null);
    }
  };

  const addButton = () => {
    const newButton = {
      id: `button-${Date.now()}`,
      type: "whatsapp",
      label: "WhatsApp",
      label_bn: "হোয়াটসঅ্যাপ",
      icon: "whatsapp",
      icon_type: "fontawesome", // fontawesome, custom
      phone_number: "",
      message: "Hello, I need help",
      url: "",
      color: "#25D366",
      hover_color: "#128C7E",
      text_color: "#FFFFFF",
      size: "md", // sm, md, lg
      shape: "rounded", // circle, rounded, square
      status: true,
      order: (formData.buttons?.length || 0) + 1,
      tooltip: true,
      tooltip_text: "Chat with us",
      tooltip_text_bn: "আমাদের সাথে কথা বলুন",
      open_in_new_tab: true,
      schedule: {
        enabled: false,
        start_time: "09:00",
        end_time: "18:00",
        timezone: "Asia/Dhaka",
      },
    };
    handleChange("buttons", [...(formData.buttons || []), newButton]);
  };

  const updateButton = (index: number, field: string, value: any) => {
    const updatedButtons = [...(formData.buttons || [])];
    updatedButtons[index] = { ...updatedButtons[index], [field]: value };
    handleChange("buttons", updatedButtons);
  };

  const removeButton = (index: number) => {
    const updatedButtons = (formData.buttons || []).filter(
      (_: any, i: number) => i !== index,
    );
    handleChange("buttons", updatedButtons);
  };

  const moveButton = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === formData.buttons.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...formData.buttons];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];

    // Update order
    updated.forEach((btn, idx) => {
      btn.order = idx + 1;
    });

    handleChange("buttons", updated);
  };

  const getButtonFields = (type: string, index: number, button: any) => {
    switch (type) {
      case "whatsapp":
        return (
          <>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={button.phone_number || ""}
                onChange={(e) =>
                  updateButton(index, "phone_number", e.target.value)
                }
                placeholder="+8801XXXXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label>Default Message</Label>
              <Input
                value={button.message || "Hello, I need help"}
                onChange={(e) => updateButton(index, "message", e.target.value)}
                placeholder="Hello, I need help"
              />
            </div>
          </>
        );

      case "messenger":
        return (
          <>
            <div className="space-y-2">
              <Label>Page ID / Username</Label>
              <Input
                value={button.page_id || ""}
                onChange={(e) => updateButton(index, "page_id", e.target.value)}
                placeholder="yourpage"
              />
            </div>
            <div className="space-y-2">
              <Label>App ID (Optional)</Label>
              <Input
                value={button.app_id || ""}
                onChange={(e) => updateButton(index, "app_id", e.target.value)}
              />
            </div>
          </>
        );

      case "telegram":
        return (
          <>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                value={button.username || ""}
                onChange={(e) =>
                  updateButton(index, "username", e.target.value)
                }
                placeholder="@username"
              />
            </div>
            <div className="space-y-2">
              <Label>Bot Token (Optional)</Label>
              <Input
                value={button.bot_token || ""}
                onChange={(e) =>
                  updateButton(index, "bot_token", e.target.value)
                }
                type="password"
              />
            </div>
          </>
        );

      case "phone":
        return (
          <>
            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input
                value={button.phone_number || ""}
                onChange={(e) =>
                  updateButton(index, "phone_number", e.target.value)
                }
                placeholder="+8801XXXXXXXXX"
              />
            </div>
          </>
        );

      case "email":
        return (
          <>
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input
                value={button.email || ""}
                onChange={(e) => updateButton(index, "email", e.target.value)}
                placeholder="info@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={button.subject || "Customer Inquiry"}
                onChange={(e) => updateButton(index, "subject", e.target.value)}
              />
            </div>
          </>
        );

      case "link":
        return (
          <div className="space-y-2">
            <Label>URL</Label>
            <Input
              value={button.url || ""}
              onChange={(e) => updateButton(index, "url", e.target.value)}
              placeholder="https://example.com"
            />
          </div>
        );

      case "custom":
        return (
          <>
            <div className="space-y-2">
              <Label>Action URL / Script</Label>
              <Input
                value={button.url || ""}
                onChange={(e) => updateButton(index, "url", e.target.value)}
                placeholder="https://example.com or javascript:void(0)"
              />
            </div>
            <div className="space-y-2">
              <Label>Custom Code (Optional)</Label>
              <textarea
                value={button.custom_code || ""}
                onChange={(e) =>
                  updateButton(index, "custom_code", e.target.value)
                }
                className="w-full border rounded p-2"
                rows={2}
                placeholder="Custom JavaScript or HTML"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  // Predefined icons for different platforms
  const iconOptions = [
    { value: "whatsapp", label: "WhatsApp" },
    { value: "messenger", label: "Messenger" },
    { value: "telegram", label: "Telegram" },
    { value: "phone", label: "Phone" },
    { value: "email", label: "Email" },
    { value: "facebook", label: "Facebook" },
    { value: "instagram", label: "Instagram" },
    { value: "twitter", label: "Twitter" },
    { value: "linkedin", label: "LinkedIn" },
    { value: "youtube", label: "YouTube" },
    { value: "tiktok", label: "TikTok" },
    { value: "snapchat", label: "Snapchat" },
    { value: "pinterest", label: "Pinterest" },
    { value: "reddit", label: "Reddit" },
    { value: "discord", label: "Discord" },
    { value: "slack", label: "Slack" },
    { value: "github", label: "GitHub" },
    { value: "custom", label: "Custom Icon" },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Floating Buttons Settings</CardTitle>
        <Button
          onClick={onSave}
          disabled={saving || uploading}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General Settings</TabsTrigger>
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          {/* General Settings Tab */}
          <TabsContent value="general" className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.status}
                onCheckedChange={(checked) => handleChange("status", checked)}
              />
              <Label>Enable Floating Buttons</Label>
            </div>

            {formData.status && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Select
                    value={formData.position || "right"}
                    onValueChange={(value) => handleChange("position", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="offset_bottom">Bottom Offset (px)</Label>
                  <Input
                    id="offset_bottom"
                    type="number"
                    value={formData.offset_bottom || 20}
                    onChange={(e) =>
                      handleChange("offset_bottom", parseInt(e.target.value))
                    }
                  />
                </div>

                {formData.position === "right" && (
                  <div className="space-y-2">
                    <Label htmlFor="offset_right">Right Offset (px)</Label>
                    <Input
                      id="offset_right"
                      type="number"
                      value={formData.offset_right || 20}
                      onChange={(e) =>
                        handleChange("offset_right", parseInt(e.target.value))
                      }
                    />
                  </div>
                )}

                {formData.position === "left" && (
                  <div className="space-y-2">
                    <Label htmlFor="offset_left">Left Offset (px)</Label>
                    <Input
                      id="offset_left"
                      type="number"
                      value={formData.offset_left || 20}
                      onChange={(e) =>
                        handleChange("offset_left", parseInt(e.target.value))
                      }
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="z_index">Z-Index</Label>
                  <Input
                    id="z_index"
                    type="number"
                    value={formData.z_index || 100}
                    onChange={(e) =>
                      handleChange("z_index", parseInt(e.target.value))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="animation">Animation</Label>
                  <Select
                    value={formData.animation || "pulse"}
                    onValueChange={(value) => handleChange("animation", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="pulse">Pulse</SelectItem>
                      <SelectItem value="bounce">Bounce</SelectItem>
                      <SelectItem value="shake">Shake</SelectItem>
                      <SelectItem value="wiggle">Wiggle</SelectItem>
                      <SelectItem value="float">Float</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Show on Devices</Label>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.desktop_show}
                        onCheckedChange={(checked) =>
                          handleChange("desktop_show", checked)
                        }
                      />
                      <Label>Desktop</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.mobile_show}
                        onCheckedChange={(checked) =>
                          handleChange("mobile_show", checked)
                        }
                      />
                      <Label>Mobile</Label>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Buttons Tab */}
          <TabsContent value="buttons" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Floating Buttons</h3>
              <Select
                value=""
                onValueChange={(value) => {
                  const newButton = {
                    id: `button-${Date.now()}`,
                    type: value,
                    label: value.charAt(0).toUpperCase() + value.slice(1),
                    label_bn:
                      value === "whatsapp"
                        ? "হোয়াটসঅ্যাপ"
                        : value === "messenger"
                          ? "মেসেঞ্জার"
                          : value === "telegram"
                            ? "টেলিগ্রাম"
                            : "নতুন বাটন",
                    icon: value,
                    icon_type: "fontawesome",
                    color:
                      value === "whatsapp"
                        ? "#25D366"
                        : value === "messenger"
                          ? "#0084FF"
                          : value === "telegram"
                            ? "#0088cc"
                            : value === "phone"
                              ? "#4CAF50"
                              : value === "email"
                                ? "#EA4335"
                                : "#3B82F6",
                    hover_color:
                      value === "whatsapp"
                        ? "#128C7E"
                        : value === "messenger"
                          ? "#0063DB"
                          : value === "telegram"
                            ? "#006699"
                            : "#1E40AF",
                    text_color: "#FFFFFF",
                    size: "md",
                    shape: "rounded",
                    status: true,
                    tooltip: true,
                    tooltip_text: `Chat on ${value}`,
                    tooltip_text_bn:
                      value === "whatsapp"
                        ? "হোয়াটসঅ্যাপে চ্যাট করুন"
                        : value === "messenger"
                          ? "মেসেঞ্জারে চ্যাট করুন"
                          : value === "telegram"
                            ? "টেলিগ্রামে চ্যাট করুন"
                            : "যোগাযোগ করুন",
                    open_in_new_tab: true,
                  };
                  handleChange("buttons", [
                    ...(formData.buttons || []),
                    newButton,
                  ]);
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Add Button" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="messenger">Messenger</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {(formData.buttons || []).map((button: any, index: number) => (
                <Card key={button.id || index} className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">
                        {button.label || `Button ${index + 1}`}
                      </h4>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {button.type}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveButton(index, "up")}
                        disabled={index === 0}
                      >
                        <MoveUp className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => moveButton(index, "down")}
                        disabled={index === formData.buttons.length - 1}
                      >
                        <MoveDown className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeButton(index)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={button.status}
                          onCheckedChange={(checked) =>
                            updateButton(index, "status", checked)
                          }
                        />
                        <span className="text-sm text-gray-500">
                          {button.status ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={button.type || "whatsapp"}
                        onValueChange={(value) => {
                          updateButton(index, "type", value);
                          updateButton(index, "icon", value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="messenger">Messenger</SelectItem>
                          <SelectItem value="telegram">Telegram</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="link">Link</SelectItem>
                          <SelectItem value="custom">Custom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Label (English)</Label>
                      <Input
                        value={button.label || ""}
                        onChange={(e) =>
                          updateButton(index, "label", e.target.value)
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Label (Bengali)</Label>
                      <Input
                        value={button.label_bn || ""}
                        onChange={(e) =>
                          updateButton(index, "label_bn", e.target.value)
                        }
                        placeholder="বাংলা লেবেল"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Icon</Label>
                      <Select
                        value={button.icon_type || "fontawesome"}
                        onValueChange={(value) =>
                          updateButton(index, "icon_type", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fontawesome">
                            Font Awesome
                          </SelectItem>
                          <SelectItem value="custom">Custom Image</SelectItem>
                        </SelectContent>
                      </Select>

                      {button.icon_type === "fontawesome" ? (
                        <Select
                          value={button.icon || "whatsapp"}
                          onValueChange={(value) =>
                            updateButton(index, "icon", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {iconOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex gap-2">
                          <Input
                            value={button.icon || ""}
                            onChange={(e) =>
                              updateButton(index, "icon", e.target.value)
                            }
                            placeholder="Image URL"
                            className="flex-1"
                          />
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                disabled={
                                  uploading && uploadingForButton === index
                                }
                              >
                                <Upload className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Upload Icon</DialogTitle>
                              </DialogHeader>
                              <div className="p-4">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleImageUpload(file, index);
                                    }
                                  }}
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                    </div>

                    {/* Type-specific fields */}
                    {getButtonFields(button.type, index, button)}

                    <div className="space-y-2">
                      <Label>Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={button.color || "#3B82F6"}
                          onChange={(e) =>
                            updateButton(index, "color", e.target.value)
                          }
                          className="w-12 p-1"
                        />
                        <Input
                          value={button.color || "#3B82F6"}
                          onChange={(e) =>
                            updateButton(index, "color", e.target.value)
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Hover Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={button.hover_color || "#1E40AF"}
                          onChange={(e) =>
                            updateButton(index, "hover_color", e.target.value)
                          }
                          className="w-12 p-1"
                        />
                        <Input
                          value={button.hover_color || "#1E40AF"}
                          onChange={(e) =>
                            updateButton(index, "hover_color", e.target.value)
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={button.text_color || "#FFFFFF"}
                          onChange={(e) =>
                            updateButton(index, "text_color", e.target.value)
                          }
                          className="w-12 p-1"
                        />
                        <Input
                          value={button.text_color || "#FFFFFF"}
                          onChange={(e) =>
                            updateButton(index, "text_color", e.target.value)
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Size</Label>
                      <Select
                        value={button.size || "md"}
                        onValueChange={(value) =>
                          updateButton(index, "size", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sm">Small (32px)</SelectItem>
                          <SelectItem value="md">Medium (48px)</SelectItem>
                          <SelectItem value="lg">Large (64px)</SelectItem>
                          <SelectItem value="xl">Extra Large (80px)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Shape</Label>
                      <Select
                        value={button.shape || "rounded"}
                        onValueChange={(value) =>
                          updateButton(index, "shape", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="circle">Circle</SelectItem>
                          <SelectItem value="rounded">Rounded</SelectItem>
                          <SelectItem value="square">Square</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Tooltip</Label>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={button.tooltip}
                          onCheckedChange={(checked) =>
                            updateButton(index, "tooltip", checked)
                          }
                        />
                        <span className="text-sm text-gray-500">
                          Show tooltip on hover
                        </span>
                      </div>
                    </div>

                    {button.tooltip && (
                      <>
                        <div className="space-y-2">
                          <Label>Tooltip Text (English)</Label>
                          <Input
                            value={button.tooltip_text || ""}
                            onChange={(e) =>
                              updateButton(
                                index,
                                "tooltip_text",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Tooltip Text (Bengali)</Label>
                          <Input
                            value={button.tooltip_text_bn || ""}
                            onChange={(e) =>
                              updateButton(
                                index,
                                "tooltip_text_bn",
                                e.target.value,
                              )
                            }
                            placeholder="বাংলা টুলটিপ"
                          />
                        </div>
                      </>
                    )}

                    <div className="space-y-2">
                      <Label>Open in New Tab</Label>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={button.open_in_new_tab}
                          onCheckedChange={(checked) =>
                            updateButton(index, "open_in_new_tab", checked)
                          }
                        />
                        <span className="text-sm text-gray-500">
                          Open link in new tab
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Button Spacing (px)</Label>
                <Input
                  type="number"
                  value={formData.button_spacing || 10}
                  onChange={(e) =>
                    handleChange("button_spacing", parseInt(e.target.value))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Button Direction</Label>
                <Select
                  value={formData.direction || "vertical"}
                  onValueChange={(value) => handleChange("direction", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vertical">Vertical</SelectItem>
                    <SelectItem value="horizontal">Horizontal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={formData.container_bg || "transparent"}
                    onChange={(e) =>
                      handleChange("container_bg", e.target.value)
                    }
                    className="w-12 p-1"
                  />
                  <Input
                    value={formData.container_bg || "transparent"}
                    onChange={(e) =>
                      handleChange("container_bg", e.target.value)
                    }
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Container Padding (px)</Label>
                <Input
                  type="number"
                  value={formData.container_padding || 5}
                  onChange={(e) =>
                    handleChange("container_padding", parseInt(e.target.value))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Border Radius (px)</Label>
                <Input
                  type="number"
                  value={formData.container_radius || 0}
                  onChange={(e) =>
                    handleChange("container_radius", parseInt(e.target.value))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Box Shadow</Label>
                <Select
                  value={formData.box_shadow || "none"}
                  onValueChange={(value) => handleChange("box_shadow", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="sm">Small</SelectItem>
                    <SelectItem value="md">Medium</SelectItem>
                    <SelectItem value="lg">Large</SelectItem>
                    <SelectItem value="xl">Extra Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.schedule_enabled || false}
                onCheckedChange={(checked) =>
                  handleChange("schedule_enabled", checked)
                }
              />
              <Label>Enable Schedule</Label>
            </div>

            {formData.schedule_enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={formData.schedule_start || "09:00"}
                    onChange={(e) =>
                      handleChange("schedule_start", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={formData.schedule_end || "18:00"}
                    onChange={(e) =>
                      handleChange("schedule_end", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Time Zone</Label>
                  <Select
                    value={formData.schedule_timezone || "Asia/Dhaka"}
                    onValueChange={(value) =>
                      handleChange("schedule_timezone", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Dhaka">
                        Asia/Dhaka (BST)
                      </SelectItem>
                      <SelectItem value="Asia/Kolkata">
                        Asia/Kolkata (IST)
                      </SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 col-span-2">
                  <Label>Active Days</Label>
                  <div className="flex gap-4 flex-wrap">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                      (day) => (
                        <div key={day} className="flex items-center gap-2">
                          <Switch
                            checked={
                              formData.active_days?.includes(day) || false
                            }
                            onCheckedChange={(checked) => {
                              const current = formData.active_days || [];
                              const updated = checked
                                ? [...current, day]
                                : current.filter((d: string) => d !== day);
                              handleChange("active_days", updated);
                            }}
                          />
                          <Label>{day}</Label>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-4">
            <Card className="p-6 relative min-h-[400px] bg-gray-50">
              <h3 className="font-medium mb-4">Live Preview</h3>
              <div
                className="absolute"
                style={{
                  bottom: formData.offset_bottom || 20,
                  [formData.position === "right"
                    ? "right"
                    : formData.position === "left"
                      ? "left"
                      : "left"]:
                    formData.position === "right"
                      ? formData.offset_right || 20
                      : formData.position === "left"
                        ? formData.offset_left || 20
                        : "50%",
                  transform:
                    formData.position === "center"
                      ? "translateX(-50%)"
                      : "none",
                  zIndex: formData.z_index || 100,
                }}
              >
                <div
                  className={`flex ${formData.direction === "vertical" ? "flex-col" : "flex-row"} gap-${formData.button_spacing || 2}`}
                  style={{
                    backgroundColor: formData.container_bg || "transparent",
                    padding: formData.container_padding || 5,
                    borderRadius: formData.container_radius || 0,
                  }}
                >
                  {(formData.buttons || [])
                    .filter((b: any) => b.status)
                    .map((button: any, idx: number) => (
                      <div
                        key={idx}
                        className="relative group cursor-pointer transition-all hover:scale-110"
                        style={{
                          animation:
                            formData.animation !== "none"
                              ? `${formData.animation} 2s infinite`
                              : "none",
                        }}
                      >
                        <div
                          className={`flex items-center justify-center transition-colors`}
                          style={{
                            width:
                              button.size === "sm"
                                ? 32
                                : button.size === "md"
                                  ? 48
                                  : button.size === "lg"
                                    ? 64
                                    : 80,
                            height:
                              button.size === "sm"
                                ? 32
                                : button.size === "md"
                                  ? 48
                                  : button.size === "lg"
                                    ? 64
                                    : 80,
                            borderRadius:
                              button.shape === "circle"
                                ? "50%"
                                : button.shape === "rounded"
                                  ? "8px"
                                  : "0",
                            backgroundColor: button.color || "#3B82F6",
                            color: button.text_color || "#FFFFFF",
                            boxShadow:
                              formData.box_shadow === "sm"
                                ? "0 1px 2px 0 rgba(0, 0, 0, 0.05)"
                                : formData.box_shadow === "md"
                                  ? "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                                  : formData.box_shadow === "lg"
                                    ? "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
                                    : formData.box_shadow === "xl"
                                      ? "0 20px 25px -5px rgba(0, 0, 0, 0.1)"
                                      : "none",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              button.hover_color || "#1E40AF";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              button.color || "#3B82F6";
                          }}
                        >
                          {button.icon_type === "fontawesome" ? (
                            <span className="text-xl">
                              {button.icon === "whatsapp" && "📱"}
                              {button.icon === "messenger" && "💬"}
                              {button.icon === "telegram" && "✈️"}
                              {button.icon === "phone" && "📞"}
                              {button.icon === "email" && "✉️"}
                              {button.icon === "facebook" && "f"}
                              {button.icon === "instagram" && "📷"}
                              {button.icon === "twitter" && "🐦"}
                              {button.icon === "linkedin" && "in"}
                              {button.icon === "youtube" && "▶️"}
                              {button.icon === "custom" && "🔗"}
                            </span>
                          ) : (
                            <img
                              src={button.icon}
                              alt={button.label}
                              className="w-6 h-6 object-contain"
                            />
                          )}
                        </div>
                        {button.tooltip && (
                          <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                            {button.tooltip_text || button.label}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
