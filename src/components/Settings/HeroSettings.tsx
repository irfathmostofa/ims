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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { uploadImageToCloudinary } from "@/hook/uploadImageToCloudinary";

interface HeroSettingsProps {
  data?: any;
  onChange: (data: any) => void;
  onSave: () => void;
  saving: boolean;
}

export default function HeroSettings({
  data,
  onChange,
  onSave,
  saving,
}: HeroSettingsProps) {
  const [formData, setFormData] = useState(
    data || {
      status: true,
      layout: "slider",
      slides: [], // For standalone slider
      banner: {
        image: "",
        title: "",
        title_bn: "",
        subtitle: "",
        subtitle_bn: "",
        button_text: "Shop Now",
        button_text_bn: "এখনই কিনুন",
        button_link: "/shop",
      },
      split_layout: {
        enabled: false,
        side_menu_position: "left", // left or right
        side_menu_width: 25, // percentage
        // Reuse the same slides array for split layout carousel
        autoplay: true,
        interval: 5000,
      },
    },
  );
  const [uploading, setUploading] = useState(false);
  const [uploadingForSlide, setUploadingForSlide] = useState<number | null>(
    null,
  );
  const [uploadingForBanner, setUploadingForBanner] = useState(false);

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

  const handleSplitLayoutChange = (field: string, value: any) => {
    const updated = {
      ...formData,
      split_layout: {
        ...(formData.split_layout || {}),
        [field]: value,
      },
    };
    setFormData(updated);
    onChange(updated);
  };

  // Image upload handlers
  const handleSlideImageUpload = async (file: File, slideIndex: number) => {
    try {
      setUploading(true);
      setUploadingForSlide(slideIndex);
      const imageUrl = await uploadImageToCloudinary(file);

      const updatedSlides = [...(formData.slides || [])];
      updatedSlides[slideIndex] = {
        ...updatedSlides[slideIndex],
        image: imageUrl,
      };
      handleChange("slides", updatedSlides);

      toast.success("Image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setUploading(false);
      setUploadingForSlide(null);
    }
  };

  const handleBannerImageUpload = async (file: File) => {
    try {
      setUploading(true);
      setUploadingForBanner(true);
      const imageUrl = await uploadImageToCloudinary(file);

      handleChange("banner", {
        ...formData.banner,
        image: imageUrl,
      });

      toast.success("Banner image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload banner image");
      console.error(error);
    } finally {
      setUploading(false);
      setUploadingForBanner(false);
    }
  };

  // Add slide functions
  const addSlide = () => {
    const newSlide = {
      image: "",
      title: "New Slide",
      title_bn: "নতুন স্লাইড",
      subtitle: "Amazing Offer",
      subtitle_bn: "চমৎকার অফার",
      button_text: "Shop Now",
      button_text_bn: "এখনই কিনুন",
      button_link: "/shop",
      text_position: "center",
      text_color: "#FFFFFF",
    };

    handleChange("slides", [...(formData.slides || []), newSlide]);
  };

  const updateSlide = (index: number, field: string, value: any) => {
    const updatedSlides = [...(formData.slides || [])];
    updatedSlides[index] = { ...updatedSlides[index], [field]: value };
    handleChange("slides", updatedSlides);
  };

  const removeSlide = (index: number) => {
    const updatedSlides = (formData.slides || []).filter(
      (_: any, i: number) => i !== index,
    );
    handleChange("slides", updatedSlides);
  };

  // Render slides
  const renderSlides = () => {
    const slides = formData.slides || [];

    if (slides.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No slides added. Click "Add Slide" to create one.
        </div>
      );
    }

    return (
      <Tabs defaultValue="0" className="w-full">
        <TabsList className="flex flex-wrap h-auto">
          {slides.map((_: any, index: number) => (
            <TabsTrigger key={index} value={index.toString()}>
              Slide {index + 1}
            </TabsTrigger>
          ))}
        </TabsList>

        {slides.map((slide: any, index: number) => (
          <TabsContent
            key={index}
            value={index.toString()}
            className="space-y-4"
          >
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium">Slide {index + 1} Settings</h4>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeSlide(index)}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Image */}
                <div className="col-span-2 space-y-2">
                  <Label>Background Image</Label>
                  <div className="flex gap-2">
                    <Input
                      value={slide.image || ""}
                      onChange={(e) =>
                        updateSlide(index, "image", e.target.value)
                      }
                      placeholder="/images/hero.jpg"
                      className="flex-1"
                    />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          disabled={uploading && uploadingForSlide === index}
                        >
                          <Upload className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Upload Image</DialogTitle>
                        </DialogHeader>
                        <div className="p-4">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleSlideImageUpload(file, index);
                              }
                            }}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  {slide.image && (
                    <div
                      className="mt-2 h-32 w-full bg-cover bg-center rounded border"
                      style={{ backgroundImage: `url(${slide.image})` }}
                    />
                  )}
                </div>

                {/* English Content */}
                <div className="space-y-2">
                  <Label>Title (English)</Label>
                  <Input
                    value={slide.title || ""}
                    onChange={(e) =>
                      updateSlide(index, "title", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Title (Bengali)</Label>
                  <Input
                    value={slide.title_bn || ""}
                    onChange={(e) =>
                      updateSlide(index, "title_bn", e.target.value)
                    }
                    placeholder="বাংলা টাইটেল"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subtitle (English)</Label>
                  <Input
                    value={slide.subtitle || ""}
                    onChange={(e) =>
                      updateSlide(index, "subtitle", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Subtitle (Bengali)</Label>
                  <Input
                    value={slide.subtitle_bn || ""}
                    onChange={(e) =>
                      updateSlide(index, "subtitle_bn", e.target.value)
                    }
                    placeholder="বাংলা সাবটাইটেল"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Button Text (English)</Label>
                  <Input
                    value={slide.button_text || ""}
                    onChange={(e) =>
                      updateSlide(index, "button_text", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Button Text (Bengali)</Label>
                  <Input
                    value={slide.button_text_bn || ""}
                    onChange={(e) =>
                      updateSlide(index, "button_text_bn", e.target.value)
                    }
                    placeholder="বাংলা বাটন টেক্সট"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Button Link</Label>
                  <Input
                    value={slide.button_link || ""}
                    onChange={(e) =>
                      updateSlide(index, "button_link", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Text Position</Label>
                  <Select
                    value={slide.text_position || "center"}
                    onValueChange={(value) =>
                      updateSlide(index, "text_position", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={slide.text_color || "#FFFFFF"}
                      onChange={(e) =>
                        updateSlide(index, "text_color", e.target.value)
                      }
                      className="w-12 p-1"
                    />
                    <Input
                      value={slide.text_color || "#FFFFFF"}
                      onChange={(e) =>
                        updateSlide(index, "text_color", e.target.value)
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Hero Section Settings</CardTitle>
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
          <Label>Enable Hero Section</Label>
        </div>

        {formData.status && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="layout">Layout Type</Label>
                <Select
                  value={formData.layout || "slider"}
                  onValueChange={(value) => handleChange("layout", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slider">Full Width Slider</SelectItem>
                    <SelectItem value="single">Single Banner</SelectItem>
                    <SelectItem value="split">
                      Split Layout (Side Menu + Slider)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {formData.layout === "slider" &&
                    "Full width slider with multiple slides"}
                  {formData.layout === "single" &&
                    "Single banner image with content"}
                  {formData.layout === "split" &&
                    "Side menu on left/right with slider on the other side"}
                </p>
              </div>

              {/* Slider controls - shown for both slider and split layouts */}
              {(formData.layout === "slider" ||
                formData.layout === "split") && (
                <>
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
                        value={formData.interval || 5000}
                        onChange={(e) =>
                          handleChange("interval", parseInt(e.target.value))
                        }
                      />
                    </div>
                  )}
                </>
              )}

              {/* Split layout specific controls */}
              {formData.layout === "split" && (
                <>
                  <div className="space-y-2">
                    <Label>Side Menu Position</Label>
                    <Select
                      value={
                        formData.split_layout?.side_menu_position || "left"
                      }
                      onValueChange={(value) =>
                        handleSplitLayoutChange("side_menu_position", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left Side</SelectItem>
                        <SelectItem value="right">Right Side</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Side Menu Width (%)</Label>
                    <Input
                      type="number"
                      min="15"
                      max="40"
                      value={formData.split_layout?.side_menu_width || 25}
                      onChange={(e) =>
                        handleSplitLayoutChange(
                          "side_menu_width",
                          parseInt(e.target.value),
                        )
                      }
                    />
                    <p className="text-xs text-gray-500">
                      Slider will take the remaining{" "}
                      {100 - (formData.split_layout?.side_menu_width || 25)}%
                      width
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Content based on layout */}
            {formData.layout === "slider" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Slider Slides</h3>
                  <Button onClick={addSlide} variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" /> Add Slide
                  </Button>
                </div>
                {renderSlides()}
              </div>
            )}

            {formData.layout === "single" && (
              <div className="space-y-4">
                <h3 className="font-medium">Banner Settings</h3>
                <Card className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label>Banner Image</Label>
                      <div className="flex gap-2">
                        <Input
                          value={formData.banner?.image || ""}
                          onChange={(e) =>
                            handleChange("banner", {
                              ...formData.banner,
                              image: e.target.value,
                            })
                          }
                          placeholder="/images/banner.jpg"
                          className="flex-1"
                        />
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              disabled={uploading && uploadingForBanner}
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
                                    handleBannerImageUpload(file);
                                  }
                                }}
                              />
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                      {formData.banner?.image && (
                        <div
                          className="mt-2 h-40 w-full bg-cover bg-center rounded border"
                          style={{
                            backgroundImage: `url(${formData.banner.image})`,
                          }}
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Title (English)</Label>
                      <Input
                        value={formData.banner?.title || ""}
                        onChange={(e) =>
                          handleChange("banner", {
                            ...formData.banner,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Title (Bengali)</Label>
                      <Input
                        value={formData.banner?.title_bn || ""}
                        onChange={(e) =>
                          handleChange("banner", {
                            ...formData.banner,
                            title_bn: e.target.value,
                          })
                        }
                        placeholder="বাংলা টাইটেল"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Subtitle (English)</Label>
                      <Input
                        value={formData.banner?.subtitle || ""}
                        onChange={(e) =>
                          handleChange("banner", {
                            ...formData.banner,
                            subtitle: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Subtitle (Bengali)</Label>
                      <Input
                        value={formData.banner?.subtitle_bn || ""}
                        onChange={(e) =>
                          handleChange("banner", {
                            ...formData.banner,
                            subtitle_bn: e.target.value,
                          })
                        }
                        placeholder="বাংলা সাবটাইটেল"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Button Text (English)</Label>
                      <Input
                        value={formData.banner?.button_text || "Shop Now"}
                        onChange={(e) =>
                          handleChange("banner", {
                            ...formData.banner,
                            button_text: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Button Text (Bengali)</Label>
                      <Input
                        value={formData.banner?.button_text_bn || "এখনই কিনুন"}
                        onChange={(e) =>
                          handleChange("banner", {
                            ...formData.banner,
                            button_text_bn: e.target.value,
                          })
                        }
                        placeholder="বাংলা বাটন টেক্সট"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Button Link</Label>
                      <Input
                        value={formData.banner?.button_link || "/shop"}
                        onChange={(e) =>
                          handleChange("banner", {
                            ...formData.banner,
                            button_link: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Text Position</Label>
                      <Select
                        value={formData.banner?.text_position || "center"}
                        onValueChange={(value) =>
                          handleChange("banner", {
                            ...formData.banner,
                            text_position: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Text Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.banner?.text_color || "#FFFFFF"}
                          onChange={(e) =>
                            handleChange("banner", {
                              ...formData.banner,
                              text_color: e.target.value,
                            })
                          }
                          className="w-12 p-1"
                        />
                        <Input
                          value={formData.banner?.text_color || "#FFFFFF"}
                          onChange={(e) =>
                            handleChange("banner", {
                              ...formData.banner,
                              text_color: e.target.value,
                            })
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {formData.layout === "split" && (
              <div className="space-y-4">
                {/* Slider Slides - Same component reused */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">
                      Slider Slides (for Split Layout)
                    </h3>
                    <Button onClick={addSlide} variant="outline" size="sm">
                      <Plus className="w-4 h-4 mr-2" /> Add Slide
                    </Button>
                  </div>
                  {renderSlides()}
                </div>
              </div>
            )}

            {/* Preview */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">Preview</h3>

              {formData.layout === "split" ? (
                <div className="border rounded-lg overflow-hidden flex">
                  {/* Side menu preview (mock) */}
                  <div
                    className={`bg-gray-50 p-4 ${formData.split_layout?.side_menu_position === "left" ? "border-r" : "order-last border-l"}`}
                    style={{
                      width: `${formData.split_layout?.side_menu_width || 25}%`,
                    }}
                  >
                    <div className="font-medium mb-2 text-sm">
                      Side Menu Preview
                    </div>
                    <div className="space-y-2">
                      <div className="py-2 px-3 bg-gray-100 rounded text-sm">
                        Category 1
                      </div>
                      <div className="py-2 px-3 bg-gray-100 rounded text-sm">
                        Category 2
                      </div>
                      <div className="py-2 px-3 bg-gray-100 rounded text-sm">
                        Category 3
                      </div>
                    </div>
                  </div>

                  {/* Slider preview */}
                  <div className="flex-1 relative h-48 bg-gray-900">
                    {formData.slides && formData.slides[0] && (
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${formData.slides[0].image})`,
                        }}
                      >
                        <div className="absolute inset-0 bg-black bg-opacity-40" />
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                          <div className="text-white text-center">
                            <h3 className="text-sm font-bold">
                              {formData.slides[0].title || "Slider Title"}
                            </h3>
                            <p className="text-xs mt-1">
                              {formData.slides[0].subtitle || "Slider Subtitle"}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : formData.layout === "slider" ? (
                <div className="relative h-64 bg-gray-900 rounded-lg overflow-hidden">
                  {formData.slides && formData.slides[0] && (
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${formData.slides[0].image})`,
                      }}
                    >
                      <div className="absolute inset-0 bg-black bg-opacity-40" />
                      <div
                        className={`absolute inset-0 flex items-center justify-${formData.slides[0].text_position || "center"} p-8`}
                      >
                        <div className="text-white max-w-xl">
                          <h2 className="text-3xl font-bold mb-2">
                            {formData.slides[0].title || "Sample Title"}
                          </h2>
                          <p className="text-lg mb-4">
                            {formData.slides[0].subtitle || "Sample Subtitle"}
                          </p>
                          <button className="bg-white text-gray-900 px-6 py-2 rounded">
                            {formData.slides[0].button_text || "Shop Now"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative h-64 bg-gray-900 rounded-lg overflow-hidden">
                  {formData.banner?.image && (
                    <div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${formData.banner.image})`,
                      }}
                    >
                      <div className="absolute inset-0 bg-black bg-opacity-40" />
                      <div
                        className={`absolute inset-0 flex items-center justify-${formData.banner?.text_position || "center"} p-8`}
                      >
                        <div className="text-white text-center max-w-xl">
                          <h2 className="text-3xl font-bold mb-2">
                            {formData.banner?.title || "Banner Title"}
                          </h2>
                          <p className="text-lg mb-4">
                            {formData.banner?.subtitle || "Banner Subtitle"}
                          </p>
                          <button className="bg-white text-gray-900 px-6 py-2 rounded">
                            {formData.banner?.button_text || "Shop Now"}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
