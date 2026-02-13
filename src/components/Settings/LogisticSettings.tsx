"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash } from "lucide-react";
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

interface LogisticSettingsProps {
  data?: any;
  onChange: (data: any) => void;
  onSave: () => void;
  saving: boolean;
}

export default function LogisticSettings({
  data,
  onChange,
  onSave,
  saving,
}: LogisticSettingsProps) {
  const [formData, setFormData] = useState(data || { status: true });

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

  const addShippingMethod = () => {
    const newMethod = {
      name: "New Shipping",
      name_bn: "নতুন শিপিং",
      code: "new_shipping",
      price: 100,
      delivery_days: "3-5 days",
      delivery_days_bn: "৩-৫ দিন",
      status: true,
    };
    handleChange("shipping_methods", [
      ...(formData.shipping_methods || []),
      newMethod,
    ]);
  };

  const updateShippingMethod = (index: number, field: string, value: any) => {
    const updated = [...(formData.shipping_methods || [])];
    updated[index] = { ...updated[index], [field]: value };
    handleChange("shipping_methods", updated);
  };

  const removeShippingMethod = (index: number) => {
    const updated = (formData.shipping_methods || []).filter(
      (_: any, i: number) => i !== index,
    );
    handleChange("shipping_methods", updated);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Logistic Settings</CardTitle>
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
          <Label>Enable Logistic System</Label>
        </div>

        {formData.status && (
          <>
            {/* API Provider Settings */}
            <Card className="p-4">
              <h3 className="font-medium mb-4">API Provider</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="api_provider">Provider</Label>
                  <Select
                    value={formData.api_provider || "redx"}
                    onValueChange={(value) =>
                      handleChange("api_provider", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="redx">RedX</SelectItem>
                      <SelectItem value="pathao">Pathao</SelectItem>
                      <SelectItem value="paperfly">Paperfly</SelectItem>
                      <SelectItem value="sundarban">Sundarban</SelectItem>
                      <SelectItem value="custom">Custom API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.api_provider === "custom" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="api_base_url">Base URL</Label>
                      <Input
                        id="api_base_url"
                        value={formData.api_config?.base_url || ""}
                        onChange={(e) => {
                          handleChange("api_config", {
                            ...(formData.api_config || {}),
                            base_url: e.target.value,
                          });
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="api_key">API Key</Label>
                      <Input
                        id="api_key"
                        type="password"
                        value={formData.api_config?.api_key || ""}
                        onChange={(e) => {
                          handleChange("api_config", {
                            ...(formData.api_config || {}),
                            api_key: e.target.value,
                          });
                        }}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="api_secret">API Secret</Label>
                      <Input
                        id="api_secret"
                        type="password"
                        value={formData.api_config?.api_secret || ""}
                        onChange={(e) => {
                          handleChange("api_config", {
                            ...(formData.api_config || {}),
                            api_secret: e.target.value,
                          });
                        }}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.api_config?.test_mode || false}
                        onCheckedChange={(checked) => {
                          handleChange("api_config", {
                            ...(formData.api_config || {}),
                            test_mode: checked,
                          });
                        }}
                      />
                      <Label>Test Mode</Label>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Shipping Methods */}
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Shipping Methods</h3>
                <Button onClick={addShippingMethod} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" /> Add Method
                </Button>
              </div>

              <div className="space-y-4">
                {(formData.shipping_methods || []).map(
                  (method: any, index: number) => (
                    <Card key={index} className="p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">
                          {method.name || `Method ${index + 1}`}
                        </h4>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeShippingMethod(index)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Name (English)</Label>
                          <Input
                            value={method.name || ""}
                            onChange={(e) =>
                              updateShippingMethod(
                                index,
                                "name",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Name (Bengali)</Label>
                          <Input
                            value={method.name_bn || ""}
                            onChange={(e) =>
                              updateShippingMethod(
                                index,
                                "name_bn",
                                e.target.value,
                              )
                            }
                            placeholder="বাংলা নাম"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Code</Label>
                          <Input
                            value={method.code || ""}
                            onChange={(e) =>
                              updateShippingMethod(
                                index,
                                "code",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Price (BDT)</Label>
                          <Input
                            type="number"
                            value={method.price || 0}
                            onChange={(e) =>
                              updateShippingMethod(
                                index,
                                "price",
                                parseFloat(e.target.value),
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Delivery Days (English)</Label>
                          <Input
                            value={method.delivery_days || ""}
                            onChange={(e) =>
                              updateShippingMethod(
                                index,
                                "delivery_days",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Delivery Days (Bengali)</Label>
                          <Input
                            value={method.delivery_days_bn || ""}
                            onChange={(e) =>
                              updateShippingMethod(
                                index,
                                "delivery_days_bn",
                                e.target.value,
                              )
                            }
                            placeholder="বাংলা ডেলিভারি সময়"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={method.status}
                            onCheckedChange={(checked) =>
                              updateShippingMethod(index, "status", checked)
                            }
                          />
                          <Label>Active</Label>
                        </div>
                      </div>
                    </Card>
                  ),
                )}
              </div>
            </Card>

            {/* COD Charges */}
            <Card className="p-4">
              <h3 className="font-medium mb-4">COD Charges</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cod_dhaka">Dhaka City (%)</Label>
                  <Input
                    id="cod_dhaka"
                    type="number"
                    step="0.1"
                    value={formData.cod_charges?.dhaka || 1}
                    onChange={(e) => {
                      handleChange("cod_charges", {
                        ...(formData.cod_charges || {}),
                        dhaka: parseFloat(e.target.value),
                      });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cod_outside">Outside Dhaka (%)</Label>
                  <Input
                    id="cod_outside"
                    type="number"
                    step="0.1"
                    value={formData.cod_charges?.outside_dhaka || 1.5}
                    onChange={(e) => {
                      handleChange("cod_charges", {
                        ...(formData.cod_charges || {}),
                        outside_dhaka: parseFloat(e.target.value),
                      });
                    }}
                  />
                </div>
              </div>
            </Card>

            {/* Tracking Settings */}
            <Card className="p-4">
              <h3 className="font-medium mb-4">Tracking Settings</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.tracking_enabled || false}
                    onCheckedChange={(checked) =>
                      handleChange("tracking_enabled", checked)
                    }
                  />
                  <Label>Enable Order Tracking</Label>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.auto_tracking_update || false}
                    onCheckedChange={(checked) =>
                      handleChange("auto_tracking_update", checked)
                    }
                  />
                  <Label>Auto Tracking Updates</Label>
                </div>
              </div>
            </Card>

            {/* Delivery Areas */}
            <Card className="p-4">
              <h3 className="font-medium mb-4">Delivery Areas</h3>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {[
                    "ঢাকা",
                    "চট্টগ্রাম",
                    "রাজশাহী",
                    "খুলনা",
                    "বরিশাল",
                    "সিলেট",
                    "রংপুর",
                    "ময়মনসিংহ",
                  ].map((area) => (
                    <div
                      key={area}
                      className="flex items-center gap-2 p-2 border rounded"
                    >
                      <Switch
                        checked={(formData.delivery_areas || []).includes(area)}
                        onCheckedChange={(checked) => {
                          const current = formData.delivery_areas || [];
                          const updated = checked
                            ? [...current, area]
                            : current.filter((a: string) => a !== area);
                          handleChange("delivery_areas", updated);
                        }}
                      />
                      <span>{area}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </>
        )}
      </CardContent>
    </Card>
  );
}
