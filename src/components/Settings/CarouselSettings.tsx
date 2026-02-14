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

interface CarouselSettingsProps {
  data?: any;
  onChange: (data: any) => void;
  onSave: () => void;
  saving: boolean;
}

export default function CarouselSettings({
  data,
  onChange,
  onSave,
  saving,
}: CarouselSettingsProps) {
  const [formData, setFormData] = useState(data || { status: true, items: [] });
  const [uploading, setUploading] = useState(false);
  const [uploadingForItem, setUploadingForItem] = useState<number | null>(null);

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

  const handleImageUpload = async (file: File, itemIndex: number) => {
    try {
      setUploading(true);
      setUploadingForItem(itemIndex);
      const imageUrl = await uploadImageToCloudinary(file);
      
      const updatedItems = [...(formData.items || [])];
      updatedItems[itemIndex] = { ...updatedItems[itemIndex], image: imageUrl };
      handleChange("items", updatedItems);
      
      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setUploading(false);
      setUploadingForItem(null);
    }
  };

  const addItem = () => {
    const newItem = {
      product_id: Date.now(),
      image: "",
      title: "New Product",
      title_bn: "নতুন পণ্য",
      price: 0,
    };
    handleChange("items", [...(formData.items || []), newItem]);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const updatedItems = [...(formData.items || [])];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    handleChange("items", updatedItems);
  };

  const removeItem = (index: number) => {
    const updatedItems = (formData.items || []).filter(
      (_: any, i: number) => i !== index,
    );
    handleChange("items", updatedItems);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Carousel Settings</CardTitle>
        <Button onClick={onSave} disabled={saving || uploading} className="gap-2">
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
          <Label>Enable Carousel</Label>
        </div>

        {formData.status && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title (English)</Label>
                <Input
                  id="title"
                  value={formData.title || "Featured Products"}
                  onChange={(e) => handleChange("title", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title_bn">Title (Bengali)</Label>
                <Input
                  id="title_bn"
                  value={formData.title_bn || "বিশেষ পণ্য"}
                  onChange={(e) => handleChange("title_bn", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Carousel Type</Label>
                <Select
                  value={formData.type || "product"}
                  onValueChange={(value) => handleChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product">Products</SelectItem>
                    <SelectItem value="category">Categories</SelectItem>
                    <SelectItem value="brand">Brands</SelectItem>
                    <SelectItem value="custom">Custom Items</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slides_to_show">Slides to Show</Label>
                <Input
                  id="slides_to_show"
                  type="number"
                  min="1"
                  max="8"
                  value={formData.slides_to_show || 4}
                  onChange={(e) =>
                    handleChange("slides_to_show", parseInt(e.target.value))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="autoplay">Autoplay</Label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.autoplay || false}
                    onCheckedChange={(checked) =>
                      handleChange("autoplay", checked)
                    }
                  />
                  <span className="text-sm text-gray-500">Auto slide</span>
                </div>
              </div>

              {formData.autoplay && (
                <div className="space-y-2">
                  <Label htmlFor="interval">Interval (ms)</Label>
                  <Input
                    id="interval"
                    type="number"
                    value={formData.interval || 3000}
                    onChange={(e) =>
                      handleChange("interval", parseInt(e.target.value))
                    }
                  />
                </div>
              )}
            </div>

            {/* Items */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Carousel Items</h3>
                <Button onClick={addItem} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" /> Add Item
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(formData.items || []).map((item: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Item {index + 1}</h4>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeItem(index)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {formData.type === "product" && (
                        <div className="space-y-2">
                          <Label>Product ID</Label>
                          <Input
                            type="number"
                            value={item.product_id || ""}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "product_id",
                                parseInt(e.target.value),
                              )
                            }
                          />
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label>Image</Label>
                        <div className="flex gap-2">
                          <Input
                            value={item.image || ""}
                            onChange={(e) =>
                              updateItem(index, "image", e.target.value)
                            }
                            placeholder="/images/product.jpg"
                            className="flex-1"
                          />
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="icon"
                                disabled={uploading && uploadingForItem === index}
                              >
                                <Upload className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Upload Product Image</DialogTitle>
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
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.title} 
                            className="w-full h-24 object-cover rounded border"
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Title (English)</Label>
                        <Input
                          value={item.title || ""}
                          onChange={(e) =>
                            updateItem(index, "title", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Title (Bengali)</Label>
                        <Input
                          value={item.title_bn || ""}
                          onChange={(e) =>
                            updateItem(index, "title_bn", e.target.value)
                          }
                          placeholder="বাংলা টাইটেল"
                        />
                      </div>

                      {formData.type === "product" && (
                        <div className="space-y-2">
                          <Label>Price (BDT)</Label>
                          <Input
                            type="number"
                            value={item.price || 0}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "price",
                                parseInt(e.target.value),
                              )
                            }
                          />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}