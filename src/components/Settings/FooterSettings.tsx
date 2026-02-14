"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash, Upload } from "lucide-react";
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
import { toast } from "sonner";
import { uploadImageToCloudinary } from "@/hook/uploadImageToCloudinary";

interface FooterSettingsProps {
  data?: any;
  onChange: (data: any) => void;
  onSave: () => void;
  saving: boolean;
}

export default function FooterSettings({
  data,
  onChange,
  onSave,
  saving,
}: FooterSettingsProps) {
  const [formData, setFormData] = useState(data || { status: true, boxes: [] });
  const [uploading, setUploading] = useState(false);
  const [uploadingForBox, setUploadingForBox] = useState<{
    boxIndex: number;
    field: string;
  } | null>(null);

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

  const handleCopyrightChange = (field: string, value: any) => {
    const updated = {
      ...formData,
      copyright: {
        ...(formData.copyright || {}),
        [field]: value,
      },
    };
    setFormData(updated);
    onChange(updated);
  };

  const handleImageUpload = async (
    file: File,
    boxIndex: number,
    field: string,
  ) => {
    try {
      setUploading(true);
      setUploadingForBox({ boxIndex, field });
      const imageUrl = await uploadImageToCloudinary(file);

      const updatedBoxes = [...(formData.boxes || [])];
      updatedBoxes[boxIndex] = { ...updatedBoxes[boxIndex], [field]: imageUrl };
      handleChange("boxes", updatedBoxes);

      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setUploading(false);
      setUploadingForBox(null);
    }
  };

  const addBox = () => {
    // Limit to 4 boxes
    if ((formData.boxes || []).length >= 4) {
      toast.error("Maximum 4 boxes allowed");
      return;
    }

    const newBox = {
      id: `box-${Date.now()}`,
      type: "about",
      title: "New Box",
      title_bn: "নতুন বক্স",
      status: true,
    };
    handleChange("boxes", [...(formData.boxes || []), newBox]);
  };

  const updateBox = (index: number, field: string, value: any) => {
    const updatedBoxes = [...(formData.boxes || [])];
    updatedBoxes[index] = { ...updatedBoxes[index], [field]: value };
    handleChange("boxes", updatedBoxes);
  };

  const removeBox = (index: number) => {
    const updatedBoxes = (formData.boxes || []).filter(
      (_: any, i: number) => i !== index,
    );
    handleChange("boxes", updatedBoxes);
  };

  const addSocialItem = (boxIndex: number) => {
    const newSocial = {
      platform: "facebook",
      url: "https://facebook.com/",
      icon: "facebook",
    };
    const updatedBoxes = [...(formData.boxes || [])];
    updatedBoxes[boxIndex].items = [
      ...(updatedBoxes[boxIndex].items || []),
      newSocial,
    ];
    handleChange("boxes", updatedBoxes);
  };

  const updateSocialItem = (
    boxIndex: number,
    itemIndex: number,
    field: string,
    value: any,
  ) => {
    const updatedBoxes = [...(formData.boxes || [])];
    updatedBoxes[boxIndex].items[itemIndex] = {
      ...updatedBoxes[boxIndex].items[itemIndex],
      [field]: value,
    };
    handleChange("boxes", updatedBoxes);
  };

  const removeSocialItem = (boxIndex: number, itemIndex: number) => {
    const updatedBoxes = [...(formData.boxes || [])];
    updatedBoxes[boxIndex].items = updatedBoxes[boxIndex].items.filter(
      (_: any, i: number) => i !== itemIndex,
    );
    handleChange("boxes", updatedBoxes);
  };

  const addMenuItem = (boxIndex: number) => {
    const newItem = {
      label: "New Link",
      label_bn: "নতুন লিংক",
      link: "/",
    };
    const updatedBoxes = [...(formData.boxes || [])];
    updatedBoxes[boxIndex].items = [
      ...(updatedBoxes[boxIndex].items || []),
      newItem,
    ];
    handleChange("boxes", updatedBoxes);
  };

  const updateMenuItem = (
    boxIndex: number,
    itemIndex: number,
    field: string,
    value: any,
  ) => {
    const updatedBoxes = [...(formData.boxes || [])];
    updatedBoxes[boxIndex].items[itemIndex] = {
      ...updatedBoxes[boxIndex].items[itemIndex],
      [field]: value,
    };
    handleChange("boxes", updatedBoxes);
  };

  const removeMenuItem = (boxIndex: number, itemIndex: number) => {
    const updatedBoxes = [...(formData.boxes || [])];
    updatedBoxes[boxIndex].items = updatedBoxes[boxIndex].items.filter(
      (_: any, i: number) => i !== itemIndex,
    );
    handleChange("boxes", updatedBoxes);
  };

  const addPaymentMethod = () => {
    const newMethod = {
      name: "New Method",
      icon: "card",
      status: true,
    };
    handleChange("payment_methods", {
      ...(formData.payment_methods || {}),
      methods: [...(formData.payment_methods?.methods || []), newMethod],
    });
  };

  const boxCount = formData.boxes?.length || 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Footer Settings</CardTitle>
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
        <div className="flex items-center gap-2">
          <Switch
            checked={formData.status}
            onCheckedChange={(checked) => handleChange("status", checked)}
          />
          <Label>Enable Footer</Label>
        </div>

        {formData.status && (
          <>
            {/* Copyright Section */}
            <Card className="p-4">
              <h3 className="font-medium mb-4">Copyright Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="copyright_text">
                    Copyright Text (English)
                  </Label>
                  <Input
                    id="copyright_text"
                    value={
                      formData.copyright?.text ||
                      "© {year} ShopBD. All rights reserved."
                    }
                    onChange={(e) =>
                      handleCopyrightChange("text", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="copyright_text_bn">
                    Copyright Text (Bengali)
                  </Label>
                  <Input
                    id="copyright_text_bn"
                    value={
                      formData.copyright?.text_bn ||
                      "© {year} ShopBD. সর্বস্বত্ব সংরক্ষিত।"
                    }
                    onChange={(e) =>
                      handleCopyrightChange("text_bn", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="copyright_link">Copyright Link</Label>
                  <Input
                    id="copyright_link"
                    value={formData.copyright?.link || "/terms"}
                    onChange={(e) =>
                      handleCopyrightChange("link", e.target.value)
                    }
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.copyright?.show_year || false}
                    onCheckedChange={(checked) =>
                      handleCopyrightChange("show_year", checked)
                    }
                  />
                  <Label>Show Dynamic Year</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.copyright?.status || false}
                    onCheckedChange={(checked) =>
                      handleCopyrightChange("status", checked)
                    }
                  />
                  <Label>Enable Copyright</Label>
                </div>
              </div>
            </Card>

            {/* Footer Boxes */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Footer Boxes</h3>
                  <p className="text-sm text-gray-500">
                    {boxCount}/4 boxes used
                  </p>
                </div>
                <Button
                  onClick={addBox}
                  variant="outline"
                  size="sm"
                  disabled={boxCount >= 4}
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Box
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(formData.boxes || []).map((box: any, boxIndex: number) => (
                  <Card key={box.id || boxIndex} className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Box {boxIndex + 1}</h4>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeBox(boxIndex)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={box.status}
                          onCheckedChange={(checked) =>
                            updateBox(boxIndex, "status", checked)
                          }
                        />
                        <Label>Enable Box</Label>
                      </div>

                      <div className="space-y-2">
                        <Label>Box Type</Label>
                        <Select
                          value={box.type || "about"}
                          onValueChange={(value) =>
                            updateBox(boxIndex, "type", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="about">About</SelectItem>
                            <SelectItem value="menu">Menu</SelectItem>
                            <SelectItem value="social">Social Links</SelectItem>
                            <SelectItem value="contact">
                              Contact Info
                            </SelectItem>
                            <SelectItem value="newsletter">
                              Newsletter
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Title (English)</Label>
                        <Input
                          value={box.title || ""}
                          onChange={(e) =>
                            updateBox(boxIndex, "title", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Title (Bengali)</Label>
                        <Input
                          value={box.title_bn || ""}
                          onChange={(e) =>
                            updateBox(boxIndex, "title_bn", e.target.value)
                          }
                          placeholder="বাংলা টাইটেল"
                        />
                      </div>

                      {/* Type-specific fields */}
                      {box.type === "about" && (
                        <>
                          <div className="space-y-2">
                            <Label>Logo URL</Label>
                            <div className="flex gap-2">
                              <Input
                                value={box.logo || ""}
                                onChange={(e) =>
                                  updateBox(boxIndex, "logo", e.target.value)
                                }
                                placeholder="/images/logo.png"
                                className="flex-1"
                              />
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    disabled={
                                      uploading &&
                                      uploadingForBox?.boxIndex === boxIndex &&
                                      uploadingForBox?.field === "logo"
                                    }
                                  >
                                    <Upload className="w-4 h-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Upload Logo</DialogTitle>
                                  </DialogHeader>
                                  <div className="p-4">
                                    <Input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          handleImageUpload(
                                            file,
                                            boxIndex,
                                            "logo",
                                          );
                                        }
                                      }}
                                    />
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                            {box.logo && (
                              <img
                                src={box.logo}
                                alt="Logo"
                                className="mt-2 h-16 object-contain border rounded"
                              />
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label>Description (English)</Label>
                            <Input
                              value={box.description || ""}
                              onChange={(e) =>
                                updateBox(
                                  boxIndex,
                                  "description",
                                  e.target.value,
                                )
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Description (Bengali)</Label>
                            <Input
                              value={box.description_bn || ""}
                              onChange={(e) =>
                                updateBox(
                                  boxIndex,
                                  "description_bn",
                                  e.target.value,
                                )
                              }
                              placeholder="বাংলা বিবরণ"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Content (English)</Label>
                            <textarea
                              value={box.content || ""}
                              onChange={(e) =>
                                updateBox(boxIndex, "content", e.target.value)
                              }
                              className="w-full border rounded p-2"
                              rows={3}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Content (Bengali)</Label>
                            <textarea
                              value={box.content_bn || ""}
                              onChange={(e) =>
                                updateBox(
                                  boxIndex,
                                  "content_bn",
                                  e.target.value,
                                )
                              }
                              className="w-full border rounded p-2"
                              rows={3}
                              placeholder="বাংলা কন্টেন্ট"
                            />
                          </div>
                        </>
                      )}

                      {box.type === "menu" && (
                        <>
                          <div className="space-y-2">
                            <Label>Menu ID</Label>
                            <Input
                              value={box.menu_id || ""}
                              onChange={(e) =>
                                updateBox(boxIndex, "menu_id", e.target.value)
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Menu Items</Label>
                            {(box.items || []).map(
                              (item: any, itemIndex: number) => (
                                <div key={itemIndex} className="flex gap-2">
                                  <Input
                                    value={item.label || ""}
                                    onChange={(e) =>
                                      updateMenuItem(
                                        boxIndex,
                                        itemIndex,
                                        "label",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="English"
                                    className="flex-1"
                                  />
                                  <Input
                                    value={item.label_bn || ""}
                                    onChange={(e) =>
                                      updateMenuItem(
                                        boxIndex,
                                        itemIndex,
                                        "label_bn",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="বাংলা"
                                    className="flex-1"
                                  />
                                  <Input
                                    value={item.link || ""}
                                    onChange={(e) =>
                                      updateMenuItem(
                                        boxIndex,
                                        itemIndex,
                                        "link",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="/link"
                                    className="w-24"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      removeMenuItem(boxIndex, itemIndex)
                                    }
                                  >
                                    <Trash className="w-4 h-4" />
                                  </Button>
                                </div>
                              ),
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addMenuItem(boxIndex)}
                            >
                              <Plus className="w-4 h-4 mr-2" /> Add Item
                            </Button>
                          </div>
                        </>
                      )}

                      {box.type === "social" && (
                        <>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={box.show_labels || false}
                              onCheckedChange={(checked) =>
                                updateBox(boxIndex, "show_labels", checked)
                              }
                            />
                            <Label>Show Labels</Label>
                          </div>

                          <div className="space-y-2">
                            <Label>Icon Style</Label>
                            <Select
                              value={box.icon_style || "rounded"}
                              onValueChange={(value) =>
                                updateBox(boxIndex, "icon_style", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="rounded">Rounded</SelectItem>
                                <SelectItem value="circle">Circle</SelectItem>
                                <SelectItem value="square">Square</SelectItem>
                                <SelectItem value="plain">Plain</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label>Social Links</Label>
                            {(box.items || []).map(
                              (item: any, itemIndex: number) => (
                                <div key={itemIndex} className="flex gap-2">
                                  <Select
                                    value={item.platform || "facebook"}
                                    onValueChange={(value) =>
                                      updateSocialItem(
                                        boxIndex,
                                        itemIndex,
                                        "platform",
                                        value,
                                      )
                                    }
                                  >
                                    <SelectTrigger className="w-32">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="facebook">
                                        Facebook
                                      </SelectItem>
                                      <SelectItem value="instagram">
                                        Instagram
                                      </SelectItem>
                                      <SelectItem value="twitter">
                                        Twitter
                                      </SelectItem>
                                      <SelectItem value="youtube">
                                        YouTube
                                      </SelectItem>
                                      <SelectItem value="linkedin">
                                        LinkedIn
                                      </SelectItem>
                                      <SelectItem value="whatsapp">
                                        WhatsApp
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Input
                                    value={item.url || ""}
                                    onChange={(e) =>
                                      updateSocialItem(
                                        boxIndex,
                                        itemIndex,
                                        "url",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="URL"
                                    className="flex-1"
                                  />
                                  <Input
                                    value={item.followers || ""}
                                    onChange={(e) =>
                                      updateSocialItem(
                                        boxIndex,
                                        itemIndex,
                                        "followers",
                                        e.target.value,
                                      )
                                    }
                                    placeholder="Followers"
                                    className="w-20"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      removeSocialItem(boxIndex, itemIndex)
                                    }
                                  >
                                    <Trash className="w-4 h-4" />
                                  </Button>
                                </div>
                              ),
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addSocialItem(boxIndex)}
                            >
                              <Plus className="w-4 h-4 mr-2" /> Add Social
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Payment Methods */}
            <Card className="p-4">
              <h3 className="font-medium mb-4">Payment Methods</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.payment_methods?.status || false}
                    onCheckedChange={(checked) => {
                      handleChange("payment_methods", {
                        ...(formData.payment_methods || {}),
                        status: checked,
                      });
                    }}
                  />
                  <Label>Show Payment Methods</Label>
                </div>

                <div className="space-y-2">
                  <Label>Title (English)</Label>
                  <Input
                    value={
                      formData.payment_methods?.title || "Our Payment Options"
                    }
                    onChange={(e) => {
                      handleChange("payment_methods", {
                        ...(formData.payment_methods || {}),
                        title: e.target.value,
                      });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Title (Bengali)</Label>
                  <Input
                    value={
                      formData.payment_methods?.title_bn ||
                      "আমাদের পেমেন্ট অপশন"
                    }
                    onChange={(e) => {
                      handleChange("payment_methods", {
                        ...(formData.payment_methods || {}),
                        title_bn: e.target.value,
                      });
                    }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2">
                  {(formData.payment_methods?.methods || []).map(
                    (method: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 border rounded"
                      >
                        <Switch
                          checked={method.status}
                          onCheckedChange={(checked) => {
                            const updated = [
                              ...(formData.payment_methods?.methods || []),
                            ];
                            updated[index] = { ...method, status: checked };
                            handleChange("payment_methods", {
                              ...(formData.payment_methods || {}),
                              methods: updated,
                            });
                          }}
                        />
                        <Input
                          value={method.name || ""}
                          onChange={(e) => {
                            const updated = [
                              ...(formData.payment_methods?.methods || []),
                            ];
                            updated[index] = {
                              ...method,
                              name: e.target.value,
                            };
                            handleChange("payment_methods", {
                              ...(formData.payment_methods || {}),
                              methods: updated,
                            });
                          }}
                          placeholder="Name"
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const updated = (
                              formData.payment_methods?.methods || []
                            ).filter((_: any, i: number) => i !== index);
                            handleChange("payment_methods", {
                              ...(formData.payment_methods || {}),
                              methods: updated,
                            });
                          }}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    ),
                  )}
                  <Button
                    variant="outline"
                    onClick={addPaymentMethod}
                    className="col-span-3"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Payment Method
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}
      </CardContent>
    </Card>
  );
}
