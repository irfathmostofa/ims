"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash, Image as ImageIcon } from "lucide-react";
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
    data || { status: true, slides: [] },
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

  const addSlide = () => {
    const newSlide = {
      image: "/images/hero-default.jpg",
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Hero Section Settings</CardTitle>
        <Button onClick={onSave} disabled={saving} className="gap-2">
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
                    <SelectItem value="slider">Slider</SelectItem>
                    <SelectItem value="single">Single Banner</SelectItem>
                    <SelectItem value="split">Split Layout</SelectItem>
                    <SelectItem value="fullscreen">Fullscreen</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.layout === "slider" && (
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
            </div>

            {/* Slides */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Slides</h3>
                <Button onClick={addSlide} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" /> Add Slide
                </Button>
              </div>

              <Tabs defaultValue="0" className="w-full">
                <TabsList className="flex flex-wrap h-auto">
                  {(formData.slides || []).map((_: any, index: number) => (
                    <TabsTrigger key={index} value={index.toString()}>
                      Slide {index + 1}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {(formData.slides || []).map((slide: any, index: number) => (
                  <TabsContent
                    key={index}
                    value={index.toString()}
                    className="space-y-4"
                  >
                    <Card className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">
                          Slide {index + 1} Settings
                        </h4>
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
                            <Button variant="outline" size="icon">
                              <ImageIcon className="w-4 h-4" />
                            </Button>
                          </div>
                          {slide.image && (
                            <div
                              className="mt-2 h-20 w-full bg-cover bg-center rounded border"
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
                              updateSlide(
                                index,
                                "button_text_bn",
                                e.target.value,
                              )
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
            </div>

            {/* Preview */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-4">Preview</h3>
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
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
