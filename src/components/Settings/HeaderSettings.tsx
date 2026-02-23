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

interface HeaderSettingsProps {
  data?: any;
  onChange: (data: any) => void;
  onSave: () => void;
  saving: boolean;
}

export default function HeaderSettings({
  data,
  onChange,
  onSave,
  saving,
}: HeaderSettingsProps) {
  const [formData, setFormData] = useState(data || {});
  const [uploading, setUploading] = useState(false);

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

  const handleHeaderTopChange = (field: string, value: any) => {
    const updated = {
      ...formData,
      header_top: {
        ...(formData.header_top || {}),
        [field]: value,
      },
    };
    setFormData(updated);
    onChange(updated);
  };

  const handleHeaderTopContentChange = (
    position: string,
    field: string,
    value: any,
  ) => {
    const updated = {
      ...formData,
      header_top: {
        ...(formData.header_top || {}),
        content: {
          ...(formData.header_top?.content || {}),
          [position]: {
            ...(formData.header_top?.content?.[position] || {}),
            [field]: value,
          },
        },
      },
    };
    setFormData(updated);
    onChange(updated);
  };

  const handleHeaderMainChange = (field: string, value: any) => {
    const updated = {
      ...formData,
      header_main: {
        ...(formData.header_main || {}),
        [field]: value,
      },
    };
    setFormData(updated);
    onChange(updated);
  };

  const handleLogoUpload = async (file: File) => {
    try {
      setUploading(true);
      const imageUrl = await uploadImageToCloudinary(file);

      const updated = {
        ...formData,
        header_main: {
          ...formData.header_main,
          content: {
            ...formData.header_main?.content,
            logo: {
              ...formData.header_main?.content?.logo,
              src: imageUrl,
              status: true, // Auto-enable logo when uploaded
            },
          },
        },
      };
      setFormData(updated);
      onChange(updated);
      toast.success("Logo uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload logo");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const addHeaderTopItem = (position: string) => {
    const currentItems = formData.header_top?.content?.[position]?.items || [];
    const newItem =
      position === "right"
        ? { text: "New Button", link: "/", variant: "text" }
        : { text: "New Item", link: "/", icon: "tag" };

    handleHeaderTopContentChange(position, "items", [...currentItems, newItem]);
  };

  const removeHeaderTopItem = (position: string, index: number) => {
    const currentItems = formData.header_top?.content?.[position]?.items || [];
    const updatedItems = currentItems.filter(
      (_: any, i: number) => i !== index,
    );
    handleHeaderTopContentChange(position, "items", updatedItems);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Header Settings</CardTitle>
        <Button
          onClick={onSave}
          disabled={saving || uploading}
          className="gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="header_top" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="header_top">Header Top</TabsTrigger>
            <TabsTrigger value="header_main">Header Main</TabsTrigger>
            <TabsTrigger value="header_bottom">Header Bottom</TabsTrigger>
            <TabsTrigger value="mobile">Mobile Menu</TabsTrigger>
          </TabsList>

          {/* Header Top Tab */}
          <TabsContent value="header_top" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.header_top?.status || false}
                  onCheckedChange={(checked) =>
                    handleHeaderTopChange("status", checked)
                  }
                />
                <Label>Enable Header Top</Label>
              </div>
              <Select
                value={formData.header_top?.layout || "grid-cols-3"}
                onValueChange={(value) =>
                  handleHeaderTopChange("layout", value)
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Layout" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid-cols-3">3 Columns</SelectItem>
                  <SelectItem value="grid-cols-2">2 Columns</SelectItem>
                  <SelectItem value="flex-between">Flex Between</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {["left", "center", "right"].map((position) => (
              <Card key={position} className="p-4">
                <h4 className="font-medium mb-4 capitalize">
                  {position} Section
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={
                        formData.header_top?.content?.[position]?.status ||
                        false
                      }
                      onCheckedChange={(checked) =>
                        handleHeaderTopContentChange(
                          position,
                          "status",
                          checked,
                        )
                      }
                    />
                    <Label>Enable</Label>
                  </div>

                  <Select
                    value={
                      formData.header_top?.content?.[position]?.type ||
                      "news_ticker"
                    }
                    onValueChange={(value) =>
                      handleHeaderTopContentChange(position, "type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Content Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="news_ticker">News Ticker</SelectItem>
                      <SelectItem value="slide_news">Slide News</SelectItem>
                      <SelectItem value="buttons">Buttons</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="space-y-2">
                    <Label>Items</Label>
                    {(
                      formData.header_top?.content?.[position]?.items || []
                    ).map((item: any, index: number) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Input
                          value={item.text || item}
                          onChange={(e) => {
                            const newItems = [
                              ...(formData.header_top?.content?.[position]
                                ?.items || []),
                            ];
                            if (typeof item === "string") {
                              newItems[index] = e.target.value;
                            } else {
                              newItems[index] = {
                                ...item,
                                text: e.target.value,
                              };
                            }
                            handleHeaderTopContentChange(
                              position,
                              "items",
                              newItems,
                            );
                          }}
                          placeholder="Item text"
                          className="flex-1"
                        />
                        {item.link !== undefined && (
                          <Input
                            value={item.link || ""}
                            onChange={(e) => {
                              const newItems = [
                                ...(formData.header_top?.content?.[position]
                                  ?.items || []),
                              ];
                              newItems[index] = {
                                ...item,
                                link: e.target.value,
                              };
                              handleHeaderTopContentChange(
                                position,
                                "items",
                                newItems,
                              );
                            }}
                            placeholder="Link"
                            className="w-32"
                          />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeHeaderTopItem(position, index)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addHeaderTopItem(position)}
                      className="mt-2"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Item
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Header Main Tab */}
          <TabsContent value="header_main" className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Switch
                checked={formData.header_main?.status || false}
                onCheckedChange={(checked) =>
                  handleHeaderMainChange("status", checked)
                }
              />
              <Label>Enable Header Main</Label>
            </div>

            {formData.header_main?.status && (
              <>
                {/* Site Title Section */}
                <Card className="p-4">
                  <h4 className="font-medium mb-4">Site Title Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={
                          formData.header_main?.site_title?.status || false
                        }
                        onCheckedChange={(checked) =>
                          handleHeaderMainChange("site_title", {
                            ...(formData.header_main?.site_title || {}),
                            status: checked,
                          })
                        }
                      />
                      <Label>Show Site Title</Label>
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label>Site Title (English)</Label>
                      <Input
                        value={formData.header_main?.site_title?.text || ""}
                        onChange={(e) =>
                          handleHeaderMainChange("site_title", {
                            ...(formData.header_main?.site_title || {}),
                            text: e.target.value,
                          })
                        }
                        placeholder="My Store"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Site Title (Bengali)</Label>
                      <Input
                        value={formData.header_main?.site_title?.text_bn || ""}
                        onChange={(e) =>
                          handleHeaderMainChange("site_title", {
                            ...(formData.header_main?.site_title || {}),
                            text_bn: e.target.value,
                          })
                        }
                        placeholder="আমার দোকান"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Title Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={
                            formData.header_main?.site_title?.color || "#000000"
                          }
                          onChange={(e) =>
                            handleHeaderMainChange("site_title", {
                              ...(formData.header_main?.site_title || {}),
                              color: e.target.value,
                            })
                          }
                          className="w-12 p-1"
                        />
                        <Input
                          value={
                            formData.header_main?.site_title?.color || "#000000"
                          }
                          onChange={(e) =>
                            handleHeaderMainChange("site_title", {
                              ...(formData.header_main?.site_title || {}),
                              color: e.target.value,
                            })
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Font Size (px)</Label>
                      <Input
                        type="number"
                        value={
                          formData.header_main?.site_title?.font_size || 24
                        }
                        onChange={(e) =>
                          handleHeaderMainChange("site_title", {
                            ...(formData.header_main?.site_title || {}),
                            font_size: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </Card>

                {/* Logo Settings */}
                <Card className="p-4">
                  <h4 className="font-medium mb-4">Logo Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Switch
                        checked={
                          formData.header_main?.content?.logo?.status || false
                        }
                        onCheckedChange={(checked) => {
                          const updated = {
                            ...formData,
                            header_main: {
                              ...formData.header_main,
                              content: {
                                ...formData.header_main?.content,
                                logo: {
                                  ...formData.header_main?.content?.logo,
                                  status: checked,
                                },
                              },
                            },
                          };
                          setFormData(updated);
                          onChange(updated);
                        }}
                      />
                      <Label>Show Logo</Label>
                    </div>

                    {formData.header_main?.content?.logo?.status && (
                      <>
                        <div>
                          <Label htmlFor="logo_src">Logo URL</Label>
                          <div className="flex gap-2">
                            <Input
                              id="logo_src"
                              value={
                                formData.header_main?.content?.logo?.src || ""
                              }
                              onChange={(e) => {
                                const updated = {
                                  ...formData,
                                  header_main: {
                                    ...formData.header_main,
                                    content: {
                                      ...formData.header_main?.content,
                                      logo: {
                                        ...formData.header_main?.content?.logo,
                                        src: e.target.value,
                                      },
                                    },
                                  },
                                };
                                setFormData(updated);
                                onChange(updated);
                              }}
                              placeholder="/images/logo.png"
                              className="flex-1"
                            />
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  disabled={uploading}
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
                                        handleLogoUpload(file);
                                      }
                                    }}
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                          {formData.header_main?.content?.logo?.src && (
                            <div className="mt-2 p-2 border rounded">
                              <img
                                src={formData.header_main.content.logo.src}
                                alt="Logo preview"
                                className="max-h-16 object-contain"
                              />
                            </div>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label htmlFor="logo_width">Width (px)</Label>
                            <Input
                              id="logo_width"
                              type="number"
                              value={
                                formData.header_main?.content?.logo?.width ||
                                150
                              }
                              onChange={(e) => {
                                const updated = {
                                  ...formData,
                                  header_main: {
                                    ...formData.header_main,
                                    content: {
                                      ...formData.header_main?.content,
                                      logo: {
                                        ...formData.header_main?.content?.logo,
                                        width: parseInt(e.target.value),
                                      },
                                    },
                                  },
                                };
                                setFormData(updated);
                                onChange(updated);
                              }}
                            />
                          </div>
                          <div>
                            <Label htmlFor="logo_height">Height (px)</Label>
                            <Input
                              id="logo_height"
                              type="number"
                              value={
                                formData.header_main?.content?.logo?.height ||
                                50
                              }
                              onChange={(e) => {
                                const updated = {
                                  ...formData,
                                  header_main: {
                                    ...formData.header_main,
                                    content: {
                                      ...formData.header_main?.content,
                                      logo: {
                                        ...formData.header_main?.content?.logo,
                                        height: parseInt(e.target.value),
                                      },
                                    },
                                  },
                                };
                                setFormData(updated);
                                onChange(updated);
                              }}
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </Card>

                {/* Search Settings */}
                <Card className="p-4">
                  <h4 className="font-medium mb-4">Search Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={
                          formData.header_main?.content?.search?.status || false
                        }
                        onCheckedChange={(checked) => {
                          const updated = {
                            ...formData,
                            header_main: {
                              ...formData.header_main,
                              content: {
                                ...formData.header_main?.content,
                                search: {
                                  ...formData.header_main?.content?.search,
                                  status: checked,
                                },
                              },
                            },
                          };
                          setFormData(updated);
                          onChange(updated);
                        }}
                      />
                      <Label>Enable Search</Label>
                    </div>

                    {formData.header_main?.content?.search?.status && (
                      <>
                        <div>
                          <Label htmlFor="search_placeholder">
                            Placeholder
                          </Label>
                          <Input
                            id="search_placeholder"
                            value={
                              formData.header_main?.content?.search
                                ?.placeholder || "পণ্য খুঁজুন..."
                            }
                            onChange={(e) => {
                              const updated = {
                                ...formData,
                                header_main: {
                                  ...formData.header_main,
                                  content: {
                                    ...formData.header_main?.content,
                                    search: {
                                      ...formData.header_main?.content?.search,
                                      placeholder: e.target.value,
                                    },
                                  },
                                },
                              };
                              setFormData(updated);
                              onChange(updated);
                            }}
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={
                              formData.header_main?.content?.search
                                ?.suggestions || false
                            }
                            onCheckedChange={(checked) => {
                              const updated = {
                                ...formData,
                                header_main: {
                                  ...formData.header_main,
                                  content: {
                                    ...formData.header_main?.content,
                                    search: {
                                      ...formData.header_main?.content?.search,
                                      suggestions: checked,
                                    },
                                  },
                                },
                              };
                              setFormData(updated);
                              onChange(updated);
                            }}
                          />
                          <Label>Show Suggestions</Label>
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={
                              formData.header_main?.content?.search
                                ?.categories || false
                            }
                            onCheckedChange={(checked) => {
                              const updated = {
                                ...formData,
                                header_main: {
                                  ...formData.header_main,
                                  content: {
                                    ...formData.header_main?.content,
                                    search: {
                                      ...formData.header_main?.content?.search,
                                      categories: checked,
                                    },
                                  },
                                },
                              };
                              setFormData(updated);
                              onChange(updated);
                            }}
                          />
                          <Label>Search in Categories</Label>
                        </div>
                      </>
                    )}
                  </div>
                </Card>

                {/* Menu Items */}
                <Card className="p-4">
                  <h4 className="font-medium mb-4">Main Menu</h4>
                  <div className="space-y-2">
                    {(formData.header_main?.content?.menu?.items || []).map(
                      (item: any, index: number) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={item.label || ""}
                            onChange={(e) => {
                              const newItems = [
                                ...(formData.header_main?.content?.menu
                                  ?.items || []),
                              ];
                              newItems[index] = {
                                ...item,
                                label: e.target.value,
                              };
                              const updated = {
                                ...formData,
                                header_main: {
                                  ...formData.header_main,
                                  content: {
                                    ...formData.header_main?.content,
                                    menu: {
                                      ...formData.header_main?.content?.menu,
                                      items: newItems,
                                    },
                                  },
                                },
                              };
                              setFormData(updated);
                              onChange(updated);
                            }}
                            placeholder="Label"
                          />
                          <Input
                            value={item.link || ""}
                            onChange={(e) => {
                              const newItems = [
                                ...(formData.header_main?.content?.menu
                                  ?.items || []),
                              ];
                              newItems[index] = {
                                ...item,
                                link: e.target.value,
                              };
                              const updated = {
                                ...formData,
                                header_main: {
                                  ...formData.header_main,
                                  content: {
                                    ...formData.header_main?.content,
                                    menu: {
                                      ...formData.header_main?.content?.menu,
                                      items: newItems,
                                    },
                                  },
                                },
                              };
                              setFormData(updated);
                              onChange(updated);
                            }}
                            placeholder="/link"
                            className="w-40"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newItems = (
                                formData.header_main?.content?.menu?.items || []
                              ).filter((_: any, i: number) => i !== index);
                              const updated = {
                                ...formData,
                                header_main: {
                                  ...formData.header_main,
                                  content: {
                                    ...formData.header_main?.content,
                                    menu: {
                                      ...formData.header_main?.content?.menu,
                                      items: newItems,
                                    },
                                  },
                                },
                              };
                              setFormData(updated);
                              onChange(updated);
                            }}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      ),
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newItems = [
                          ...(formData.header_main?.content?.menu?.items || []),
                          { label: "New Menu", link: "/" },
                        ];
                        const updated = {
                          ...formData,
                          header_main: {
                            ...formData.header_main,
                            content: {
                              ...formData.header_main?.content,
                              menu: {
                                ...formData.header_main?.content?.menu,
                                items: newItems,
                              },
                            },
                          },
                        };
                        setFormData(updated);
                        onChange(updated);
                      }}
                      className="mt-2"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Add Menu Item
                    </Button>
                  </div>
                </Card>

                {/* Action Buttons */}
                <Card className="p-4">
                  <h4 className="font-medium mb-4">Action Buttons</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {["cart", "wishlist", "account"].map((btn) => (
                      <div key={btn} className="space-y-2 p-3 border rounded">
                        <div className="flex items-center justify-between">
                          <Label className="capitalize">{btn}</Label>
                          <Switch
                            checked={
                              formData.header_main?.content?.action_buttons?.[
                                btn
                              ]?.status || false
                            }
                            onCheckedChange={(checked) => {
                              const updated = {
                                ...formData,
                                header_main: {
                                  ...formData.header_main,
                                  content: {
                                    ...formData.header_main?.content,
                                    action_buttons: {
                                      ...formData.header_main?.content
                                        ?.action_buttons,
                                      [btn]: {
                                        ...formData.header_main?.content
                                          ?.action_buttons?.[btn],
                                        status: checked,
                                      },
                                    },
                                  },
                                },
                              };
                              setFormData(updated);
                              onChange(updated);
                            }}
                          />
                        </div>
                        <Input
                          value={
                            formData.header_main?.content?.action_buttons?.[btn]
                              ?.icon || btn
                          }
                          onChange={(e) => {
                            const updated = {
                              ...formData,
                              header_main: {
                                ...formData.header_main,
                                content: {
                                  ...formData.header_main?.content,
                                  action_buttons: {
                                    ...formData.header_main?.content
                                      ?.action_buttons,
                                    [btn]: {
                                      ...formData.header_main?.content
                                        ?.action_buttons?.[btn],
                                      icon: e.target.value,
                                    },
                                  },
                                },
                              },
                            };
                            setFormData(updated);
                            onChange(updated);
                          }}
                          placeholder="Icon name"
                        />
                      </div>
                    ))}
                  </div>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Header Bottom Tab */}
          <TabsContent value="header_bottom" className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.header_bottom?.status || false}
                onCheckedChange={(checked) =>
                  handleChange("header_bottom", {
                    ...formData.header_bottom,
                    status: checked,
                  })
                }
              />
              <Label>Enable Header Bottom</Label>
            </div>

            {formData.header_bottom?.status && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bottom_type">Type</Label>
                  <Select
                    value={formData.header_bottom?.type || "selected_menu"}
                    onValueChange={(value) =>
                      handleChange("header_bottom", {
                        ...formData.header_bottom,
                        type: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="selected_menu">
                        Selected Menu
                      </SelectItem>
                      <SelectItem value="custom_menu">Custom Menu</SelectItem>
                      <SelectItem value="categories">Categories</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="menu_id">Menu ID</Label>
                  <Input
                    id="menu_id"
                    value={formData.header_bottom?.menu_id || "main-menu"}
                    onChange={(e) =>
                      handleChange("header_bottom", {
                        ...formData.header_bottom,
                        menu_id: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.header_bottom?.sticky || false}
                    onCheckedChange={(checked) =>
                      handleChange("header_bottom", {
                        ...formData.header_bottom,
                        sticky: checked,
                      })
                    }
                  />
                  <Label>Sticky Header</Label>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Mobile Menu Tab */}
          <TabsContent value="mobile" className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.header_bottom?.mobile_menu?.status || false}
                onCheckedChange={(checked) => {
                  const updated = {
                    ...formData,
                    header_bottom: {
                      ...formData.header_bottom,
                      mobile_menu: {
                        ...formData.header_bottom?.mobile_menu,
                        status: checked,
                      },
                    },
                  };
                  setFormData(updated);
                  onChange(updated);
                }}
              />
              <Label>Enable Mobile Menu</Label>
            </div>

            {formData.header_bottom?.mobile_menu?.status && (
              <div className="space-y-2">
                <Label htmlFor="toggle_icon">Toggle Icon</Label>
                <Input
                  id="toggle_icon"
                  value={
                    formData.header_bottom?.mobile_menu?.toggle_icon || "bars"
                  }
                  onChange={(e) => {
                    const updated = {
                      ...formData,
                      header_bottom: {
                        ...formData.header_bottom,
                        mobile_menu: {
                          ...formData.header_bottom?.mobile_menu,
                          toggle_icon: e.target.value,
                        },
                      },
                    };
                    setFormData(updated);
                    onChange(updated);
                  }}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
