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

interface BannerSettingsProps {
  data?: any;
  onChange: (data: any) => void;
  onSave: () => void;
  saving: boolean;
}

export default function BannerSettings({
  data,
  onChange,
  onSave,
  saving,
}: BannerSettingsProps) {
  const [formData, setFormData] = useState(
    data || { status: true, banners: [] },
  );
  const [uploading, setUploading] = useState(false);
  const [uploadingForBanner, setUploadingForBanner] = useState<number | null>(
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

  const handleImageUpload = async (file: File, bannerIndex: number) => {
    try {
      setUploading(true);
      setUploadingForBanner(bannerIndex);
      const imageUrl = await uploadImageToCloudinary(file);

      const updatedBanners = [...(formData.banners || [])];
      updatedBanners[bannerIndex] = {
        ...updatedBanners[bannerIndex],
        image: imageUrl,
      };
      handleChange("banners", updatedBanners);

      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setUploading(false);
      setUploadingForBanner(null);
    }
  };

  const addBanner = () => {
    const newBanner = {
      image: "",
      title: "New Banner",
      title_bn: "নতুন ব্যানার",
      link: "/category",
      size: "half",
    };
    handleChange("banners", [...(formData.banners || []), newBanner]);
  };

  const updateBanner = (index: number, field: string, value: any) => {
    const updatedBanners = [...(formData.banners || [])];
    updatedBanners[index] = { ...updatedBanners[index], [field]: value };
    handleChange("banners", updatedBanners);
  };

  const removeBanner = (index: number) => {
    const updatedBanners = (formData.banners || []).filter(
      (_: any, i: number) => i !== index,
    );
    handleChange("banners", updatedBanners);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Banner Settings</CardTitle>
        <Button
          onClick={onSave}
          disabled={saving || uploading}
          className="gap-2 btn-bw-primary"
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
          <Label>Enable Banner Section</Label>
        </div>

        {formData.status && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="layout">Layout</Label>
                <Select
                  value={formData.layout || "grid-2"}
                  onValueChange={(value) => handleChange("layout", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid-2">2 Columns Grid</SelectItem>
                    <SelectItem value="grid-3">3 Columns Grid</SelectItem>
                    <SelectItem value="grid-4">4 Columns Grid</SelectItem>
                    <SelectItem value="single">Single Banner</SelectItem>
                    <SelectItem value="stacked">Stacked Layout</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Banners */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Banners</h3>
                <Button onClick={addBanner} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" /> Add Banner
                </Button>
              </div>

              <div
                className={`grid ${
                  formData.layout === "grid-2"
                    ? "grid-cols-2"
                    : formData.layout === "grid-3"
                      ? "grid-cols-3"
                      : formData.layout === "grid-4"
                        ? "grid-cols-4"
                        : "grid-cols-1"
                } gap-4`}
              >
                {(formData.banners || []).map((banner: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Banner {index + 1}</h4>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeBanner(index)}
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label>Banner Image</Label>
                        <div className="flex gap-2">
                          <Input
                            value={banner.image || ""}
                            onChange={(e) =>
                              updateBanner(index, "image", e.target.value)
                            }
                            placeholder="/images/banner.jpg"
                            className="flex-1"
                          />
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                disabled={
                                  uploading && uploadingForBanner === index
                                }
                              >
                                <Upload className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Upload Banner Image</DialogTitle>
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
                        {banner.image && (
                          <div
                            className="mt-2 h-24 w-full bg-cover bg-center rounded border"
                            style={{ backgroundImage: `url(${banner.image})` }}
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Title (English)</Label>
                        <Input
                          value={banner.title || ""}
                          onChange={(e) =>
                            updateBanner(index, "title", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Title (Bengali)</Label>
                        <Input
                          value={banner.title_bn || ""}
                          onChange={(e) =>
                            updateBanner(index, "title_bn", e.target.value)
                          }
                          placeholder="বাংলা টাইটেল"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Subtitle (English)</Label>
                        <Input
                          value={banner.subtitle || ""}
                          onChange={(e) =>
                            updateBanner(index, "subtitle", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Subtitle (Bengali)</Label>
                        <Input
                          value={banner.subtitle_bn || ""}
                          onChange={(e) =>
                            updateBanner(index, "subtitle_bn", e.target.value)
                          }
                          placeholder="বাংলা সাবটাইটেল"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Link URL</Label>
                        <Input
                          value={banner.link || ""}
                          onChange={(e) =>
                            updateBanner(index, "link", e.target.value)
                          }
                          placeholder="/category"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Button Text (English)</Label>
                        <Input
                          value={banner.button_text || "Shop Now"}
                          onChange={(e) =>
                            updateBanner(index, "button_text", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Button Text (Bengali)</Label>
                        <Input
                          value={banner.button_text_bn || "এখনই কিনুন"}
                          onChange={(e) =>
                            updateBanner(
                              index,
                              "button_text_bn",
                              e.target.value,
                            )
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Size</Label>
                        <Select
                          value={banner.size || "half"}
                          onValueChange={(value) =>
                            updateBanner(index, "size", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full">Full Width</SelectItem>
                            <SelectItem value="half">Half Width</SelectItem>
                            <SelectItem value="third">One Third</SelectItem>
                            <SelectItem value="quarter">One Quarter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
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
