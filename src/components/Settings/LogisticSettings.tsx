"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash, Eye, EyeOff } from "lucide-react";
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
  const [formData, setFormData] = useState(
    data || {
      status: true,
      default_provider: "pathao",
      webhook_url: "",
      order_status_webhook: true,
      tracking_webhook: true,
      providers: {
        pathao: {
          status: false,
          environment: "sandbox",
          client_id: "",
          client_secret: "",
          username: "",
          password: "",
          store_id: "",
          store_name: "",
          webhook_secret_token: "",
          delivery_types: [
            { id: 48, name: "Normal Delivery", name_bn: "নরমাল ডেলিভারি" },
            {
              id: 12,
              name: "On Demand Delivery",
              name_bn: "অন ডিমান্ড ডেলিভারি",
            },
          ],
          item_types: [
            { id: 1, name: "Document", name_bn: "ডকুমেন্ট" },
            { id: 2, name: "Parcel", name_bn: "পার্সেল" },
          ],
          default_delivery_type: 48,
          default_item_type: 2,
        },
        redx: {
          status: false,
          environment: "sandbox",
          access_token: "",
          base_url: "https://openapi.redx.com.bd/v1",
          sandbox_url: "https://sandbox.redx.com.bd/v1",
          store_id: "",
          store_name: "",
          webhook_secret: "",
        },
        steadfast: {
          status: false,
          environment: "sandbox",
          api_key: "",
          api_secret: "",
          base_url: "https://portal.steadfast.com.bd/api/v1",
          sandbox_url: "https://sandbox.steadfast.com.bd/api/v1",
          webhook_bearer_token: "",
          webhook_url: "",
        },
      },
      shipping_methods: [
        {
          id: "standard",
          name: "Standard Delivery",
          name_bn: "স্ট্যান্ডার্ড ডেলিভারি",
          provider: "pathao",
          price: 100,
          estimated_days: "3-5",
          estimated_days_bn: "৩-৫ দিন",
          status: true,
        },
      ],
      cod_charges: {
        enable_cod: true,
        dhaka: 1.0,
        outside_dhaka: 1.5,
      },
      pickup_locations: [
        {
          id: "main-warehouse",
          name: "Main Warehouse",
          name_bn: "মূল গুদাম",
          address: "123 Business Street, Dhaka",
          address_bn: "123 ব্যবসা রাস্তা, ঢাকা",
          phone: "+880123456789",
          email: "pickup@example.com",
          contact_person: "John Doe",
          city: "Dhaka",
          state: "Dhaka Division",
          postal_code: "1206",
          latitude: "23.8103",
          longitude: "90.4125",
          opening_time: "09:00",
          closing_time: "18:00",
          working_days: "Monday - Friday",
          notes: "Main pickup point for all orders",
          status: true,
          pickup_type: "standard",
        },
      ],
      tracking: {
        enable_tracking: true,
        tracking_page_url: "/track-order",
        auto_update: true,
        customer_notification: true,
        sms_notification: false,
        email_notification: true,
      },
    },
  );

  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

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

  const handleProviderChange = (
    provider: string,
    field: string,
    value: any,
  ) => {
    const updated = {
      ...formData,
      providers: {
        ...formData.providers,
        [provider]: {
          ...formData.providers?.[provider],
          [field]: value,
        },
      },
    };
    setFormData(updated);
    onChange(updated);
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const addShippingMethod = () => {
    const newMethod = {
      id: `method-${Date.now()}`,
      name: "New Shipping Method",
      name_bn: "নতুন শিপিং পদ্ধতি",
      provider: "pathao",
      price: 100,
      estimated_days: "3-5",
      estimated_days_bn: "৩-৫ দিন",
      status: true,
    };
    handleChange("shipping_methods", [
      ...(formData.shipping_methods || []),
      newMethod,
    ]);
  };

  const updateShippingMethod = (index: number, field: string, value: any) => {
    const updated = { ...formData };
    updated.shipping_methods[index] = {
      ...updated.shipping_methods[index],
      [field]: value,
    };
    setFormData(updated);
    onChange(updated);
  };

  const removeShippingMethod = (index: number) => {
    const updated = { ...formData };
    updated.shipping_methods = updated.shipping_methods.filter(
      (_: any, i: number) => i !== index,
    );
    setFormData(updated);
    onChange(updated);
  };

  // Pickup Location Handlers
  const addPickupLocation = () => {
    const newLocation = {
      id: `location-${Date.now()}`,
      name: "New Pickup Location",
      name_bn: "নতুন পিকআপ লোকেশন",
      address: "",
      address_bn: "",
      phone: "",
      email: "",
      contact_person: "",
      city: "",
      state: "",
      postal_code: "",
      latitude: "",
      longitude: "",
      opening_time: "09:00",
      closing_time: "18:00",
      working_days: "Monday - Friday",
      notes: "",
      status: true,
      pickup_type: "standard",
    };
    handleChange("pickup_locations", [
      ...(formData.pickup_locations || []),
      newLocation,
    ]);
  };

  const updatePickupLocation = (index: number, field: string, value: any) => {
    const updated = { ...formData };
    if (!updated.pickup_locations) {
      updated.pickup_locations = [];
    }
    updated.pickup_locations[index] = {
      ...updated.pickup_locations[index],
      [field]: value,
    };
    setFormData(updated);
    onChange(updated);
  };

  const removePickupLocation = (index: number) => {
    const updated = { ...formData };
    updated.pickup_locations = updated.pickup_locations.filter(
      (_: any, i: number) => i !== index,
    );
    setFormData(updated);
    onChange(updated);
  };

  const toggleLocationStatus = (index: number) => {
    const updated = { ...formData };
    updated.pickup_locations[index] = {
      ...updated.pickup_locations[index],
      status: !updated.pickup_locations[index].status,
    };
    setFormData(updated);
    onChange(updated);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Logistic & Delivery Settings</CardTitle>
        <Button
          onClick={onSave}
          disabled={saving}
          className="gap-2 btn-bw-primary"
        >
          <Save className="w-4 h-4 " />
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
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="mb-4 flex flex-wrap">
              <TabsTrigger value="general">General Settings</TabsTrigger>
              <TabsTrigger value="pathao">Pathao</TabsTrigger>
              <TabsTrigger value="redx">Redx</TabsTrigger>
              <TabsTrigger value="steadfast">Steadfast</TabsTrigger>
              <TabsTrigger value="shipping">Shipping Methods</TabsTrigger>
              <TabsTrigger value="cod">COD Charges</TabsTrigger>
              <TabsTrigger value="pickup">Pick Up</TabsTrigger>
              <TabsTrigger value="tracking">Tracking</TabsTrigger>
            </TabsList>

            {/* General Settings Tab */}
            <TabsContent value="general" className="space-y-4">
              <Card className="p-4">
                <h3 className="font-medium mb-4">General Configuration</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="default_provider">Default Provider</Label>
                    <Select
                      value={formData.default_provider || "pathao"}
                      onValueChange={(value) =>
                        handleChange("default_provider", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pathao">Pathao</SelectItem>
                        <SelectItem value="redx">Redx</SelectItem>
                        <SelectItem value="steadfast">Steadfast</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhook_url">Webhook URL</Label>
                    <Input
                      id="webhook_url"
                      value={formData.webhook_url || ""}
                      onChange={(e) =>
                        handleChange("webhook_url", e.target.value)
                      }
                      placeholder="https://yourdomain.com/api/webhook/delivery"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Webhook Events</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.order_status_webhook}
                        onCheckedChange={(checked) =>
                          handleChange("order_status_webhook", checked)
                        }
                      />
                      <Label>Order Status Updates</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.tracking_webhook}
                        onCheckedChange={(checked) =>
                          handleChange("tracking_webhook", checked)
                        }
                      />
                      <Label>Tracking Updates</Label>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Pathao Tab */}
            <TabsContent value="pathao" className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Pathao Configuration</h3>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.providers?.pathao?.status || false}
                      onCheckedChange={(checked) =>
                        handleProviderChange("pathao", "status", checked)
                      }
                    />
                    <Label>Enable Pathao</Label>
                  </div>
                </div>

                {formData.providers?.pathao?.status && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Environment</Label>
                        <Select
                          value={
                            formData.providers?.pathao?.environment || "sandbox"
                          }
                          onValueChange={(value) =>
                            handleProviderChange("pathao", "environment", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sandbox">
                              Sandbox (Test)
                            </SelectItem>
                            <SelectItem value="live">
                              Live (Production)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pathao_client_id">Client ID</Label>
                        <Input
                          id="pathao_client_id"
                          value={formData.providers?.pathao?.client_id || ""}
                          onChange={(e) =>
                            handleProviderChange(
                              "pathao",
                              "client_id",
                              e.target.value,
                            )
                          }
                          placeholder="Your Pathao Client ID"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pathao_client_secret">
                          Client Secret
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="pathao_client_secret"
                            type={
                              showSecrets["pathao_secret"] ? "text" : "password"
                            }
                            value={
                              formData.providers?.pathao?.client_secret || ""
                            }
                            onChange={(e) =>
                              handleProviderChange(
                                "pathao",
                                "client_secret",
                                e.target.value,
                              )
                            }
                            placeholder="Your Pathao Client Secret"
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              toggleSecretVisibility("pathao_secret")
                            }
                          >
                            {showSecrets["pathao_secret"] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pathao_username">
                          Username (Email)
                        </Label>
                        <Input
                          id="pathao_username"
                          type="email"
                          value={formData.providers?.pathao?.username || ""}
                          onChange={(e) =>
                            handleProviderChange(
                              "pathao",
                              "username",
                              e.target.value,
                            )
                          }
                          placeholder="merchant@example.com"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pathao_password">Password</Label>
                        <div className="flex gap-2">
                          <Input
                            id="pathao_password"
                            type={
                              showSecrets["pathao_password"]
                                ? "text"
                                : "password"
                            }
                            value={formData.providers?.pathao?.password || ""}
                            onChange={(e) =>
                              handleProviderChange(
                                "pathao",
                                "password",
                                e.target.value,
                              )
                            }
                            placeholder="Your Pathao Password"
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              toggleSecretVisibility("pathao_password")
                            }
                          >
                            {showSecrets["pathao_password"] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pathao_store_id">Store ID</Label>
                        <Input
                          id="pathao_store_id"
                          type="number"
                          value={formData.providers?.pathao?.store_id || ""}
                          onChange={(e) =>
                            handleProviderChange(
                              "pathao",
                              "store_id",
                              parseInt(e.target.value),
                            )
                          }
                          placeholder="148430"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pathao_store_name">Store Name</Label>
                        <Input
                          id="pathao_store_name"
                          value={formData.providers?.pathao?.store_name || ""}
                          onChange={(e) =>
                            handleProviderChange(
                              "pathao",
                              "store_name",
                              e.target.value,
                            )
                          }
                          placeholder="My Store"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="pathao_webhook_token">
                          Webhook Secret Token
                        </Label>
                        <Input
                          id="pathao_webhook_token"
                          type={
                            showSecrets["pathao_webhook"] ? "text" : "password"
                          }
                          value={
                            formData.providers?.pathao?.webhook_secret_token ||
                            ""
                          }
                          onChange={(e) =>
                            handleProviderChange(
                              "pathao",
                              "webhook_secret_token",
                              e.target.value,
                            )
                          }
                          placeholder="Your Webhook Secret"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Default Delivery Type</Label>
                        <Select
                          value={
                            formData.providers?.pathao?.default_delivery_type?.toString() ||
                            "48"
                          }
                          onValueChange={(value) =>
                            handleProviderChange(
                              "pathao",
                              "default_delivery_type",
                              parseInt(value),
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="48">
                              Normal Delivery (48)
                            </SelectItem>
                            <SelectItem value="12">
                              On Demand Delivery (12)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Default Item Type</Label>
                        <Select
                          value={
                            formData.providers?.pathao?.default_item_type?.toString() ||
                            "2"
                          }
                          onValueChange={(value) =>
                            handleProviderChange(
                              "pathao",
                              "default_item_type",
                              parseInt(value),
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Document (1)</SelectItem>
                            <SelectItem value="2">Parcel (2)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">API Endpoints</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Base URL:</span>
                          <p className="font-mono">
                            {formData.providers?.pathao?.environment === "live"
                              ? "https://api-hermes.pathao.com"
                              : "https://api-hermes.pathao.com/sandbox"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Token URL:</span>
                          <p className="font-mono">
                            /aladdin/api/v1/issue-token
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Redx Tab */}
            <TabsContent value="redx" className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Redx Configuration</h3>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.providers?.redx?.status || false}
                      onCheckedChange={(checked) =>
                        handleProviderChange("redx", "status", checked)
                      }
                    />
                    <Label>Enable Redx</Label>
                  </div>
                </div>

                {formData.providers?.redx?.status && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Environment</Label>
                        <Select
                          value={
                            formData.providers?.redx?.environment || "sandbox"
                          }
                          onValueChange={(value) =>
                            handleProviderChange("redx", "environment", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sandbox">
                              Sandbox (Test)
                            </SelectItem>
                            <SelectItem value="live">
                              Live (Production)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="redx_access_token">Access Token</Label>
                        <div className="flex gap-2">
                          <Input
                            id="redx_access_token"
                            type={
                              showSecrets["redx_token"] ? "text" : "password"
                            }
                            value={formData.providers?.redx?.access_token || ""}
                            onChange={(e) =>
                              handleProviderChange(
                                "redx",
                                "access_token",
                                e.target.value,
                              )
                            }
                            placeholder="Your Redx Access Token"
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => toggleSecretVisibility("redx_token")}
                          >
                            {showSecrets["redx_token"] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="redx_base_url">Base URL</Label>
                        <Input
                          id="redx_base_url"
                          value={formData.providers?.redx?.base_url || ""}
                          onChange={(e) =>
                            handleProviderChange(
                              "redx",
                              "base_url",
                              e.target.value,
                            )
                          }
                          placeholder="https://openapi.redx.com.bd/v1"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="redx_sandbox_url">Sandbox URL</Label>
                        <Input
                          id="redx_sandbox_url"
                          value={formData.providers?.redx?.sandbox_url || ""}
                          onChange={(e) =>
                            handleProviderChange(
                              "redx",
                              "sandbox_url",
                              e.target.value,
                            )
                          }
                          placeholder="https://sandbox.redx.com.bd/v1"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="redx_store_id">Store ID</Label>
                        <Input
                          id="redx_store_id"
                          value={formData.providers?.redx?.store_id || ""}
                          onChange={(e) =>
                            handleProviderChange(
                              "redx",
                              "store_id",
                              e.target.value,
                            )
                          }
                          placeholder="Your Store ID"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="redx_store_name">Store Name</Label>
                        <Input
                          id="redx_store_name"
                          value={formData.providers?.redx?.store_name || ""}
                          onChange={(e) =>
                            handleProviderChange(
                              "redx",
                              "store_name",
                              e.target.value,
                            )
                          }
                          placeholder="My Store"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="redx_webhook_secret">
                          Webhook Secret
                        </Label>
                        <Input
                          id="redx_webhook_secret"
                          type={
                            showSecrets["redx_webhook"] ? "text" : "password"
                          }
                          value={formData.providers?.redx?.webhook_secret || ""}
                          onChange={(e) =>
                            handleProviderChange(
                              "redx",
                              "webhook_secret",
                              e.target.value,
                            )
                          }
                          placeholder="Webhook Secret"
                        />
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">API Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Area API:</span>
                          <p className="font-mono">/area</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Store API:</span>
                          <p className="font-mono">/store</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Order API:</span>
                          <p className="font-mono">/order</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Tracking:</span>
                          <p className="font-mono">
                            /order/track/{"{tracking_id}"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Steadfast Tab */}
            <TabsContent value="steadfast" className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Steadfast Configuration</h3>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.providers?.steadfast?.status || false}
                      onCheckedChange={(checked) =>
                        handleProviderChange("steadfast", "status", checked)
                      }
                    />
                    <Label>Enable Steadfast</Label>
                  </div>
                </div>

                {formData.providers?.steadfast?.status && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Environment</Label>
                        <Select
                          value={
                            formData.providers?.steadfast?.environment ||
                            "sandbox"
                          }
                          onValueChange={(value) =>
                            handleProviderChange(
                              "steadfast",
                              "environment",
                              value,
                            )
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sandbox">
                              Sandbox (Test)
                            </SelectItem>
                            <SelectItem value="live">
                              Live (Production)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="steadfast_api_key">API Key</Label>
                        <div className="flex gap-2">
                          <Input
                            id="steadfast_api_key"
                            type={
                              showSecrets["steadfast_key"] ? "text" : "password"
                            }
                            value={formData.providers?.steadfast?.api_key || ""}
                            onChange={(e) =>
                              handleProviderChange(
                                "steadfast",
                                "api_key",
                                e.target.value,
                              )
                            }
                            placeholder="Your Steadfast API Key"
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              toggleSecretVisibility("steadfast_key")
                            }
                          >
                            {showSecrets["steadfast_key"] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="steadfast_api_secret">API Secret</Label>
                        <div className="flex gap-2">
                          <Input
                            id="steadfast_api_secret"
                            type={
                              showSecrets["steadfast_secret"]
                                ? "text"
                                : "password"
                            }
                            value={
                              formData.providers?.steadfast?.api_secret || ""
                            }
                            onChange={(e) =>
                              handleProviderChange(
                                "steadfast",
                                "api_secret",
                                e.target.value,
                              )
                            }
                            placeholder="Your Steadfast API Secret"
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              toggleSecretVisibility("steadfast_secret")
                            }
                          >
                            {showSecrets["steadfast_secret"] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="steadfast_base_url">Base URL</Label>
                        <Input
                          id="steadfast_base_url"
                          value={formData.providers?.steadfast?.base_url || ""}
                          onChange={(e) =>
                            handleProviderChange(
                              "steadfast",
                              "base_url",
                              e.target.value,
                            )
                          }
                          placeholder="https://portal.steadfast.com.bd/api/v1"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="steadfast_sandbox_url">
                          Sandbox URL
                        </Label>
                        <Input
                          id="steadfast_sandbox_url"
                          value={
                            formData.providers?.steadfast?.sandbox_url || ""
                          }
                          onChange={(e) =>
                            handleProviderChange(
                              "steadfast",
                              "sandbox_url",
                              e.target.value,
                            )
                          }
                          placeholder="https://sandbox.steadfast.com.bd/api/v1"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="steadfast_webhook_token">
                          Webhook Bearer Token
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="steadfast_webhook_token"
                            type={
                              showSecrets["steadfast_webhook"]
                                ? "text"
                                : "password"
                            }
                            value={
                              formData.providers?.steadfast
                                ?.webhook_bearer_token || ""
                            }
                            onChange={(e) =>
                              handleProviderChange(
                                "steadfast",
                                "webhook_bearer_token",
                                e.target.value,
                              )
                            }
                            placeholder="Your Webhook Token"
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              toggleSecretVisibility("steadfast_webhook")
                            }
                          >
                            {showSecrets["steadfast_webhook"] ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="steadfast_webhook_url">
                          Webhook URL
                        </Label>
                        <Input
                          id="steadfast_webhook_url"
                          value={
                            formData.providers?.steadfast?.webhook_url || ""
                          }
                          onChange={(e) =>
                            handleProviderChange(
                              "steadfast",
                              "webhook_url",
                              e.target.value,
                            )
                          }
                          placeholder="https://yourdomain.com/api/webhook/steadfast"
                        />
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">API Endpoints</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Create Order:</span>
                          <p className="font-mono">/create_order</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Bulk Order:</span>
                          <p className="font-mono">/create_order/bulk</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Balance:</span>
                          <p className="font-mono">/get_balance</p>
                        </div>
                        <div>
                          <span className="text-gray-500">
                            Status by Tracking:
                          </span>
                          <p className="font-mono">
                            /status_by_trackingcode/{"{code}"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Shipping Methods Tab */}
            <TabsContent value="shipping" className="space-y-4">
              <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Shipping Methods</h3>
                  <Button
                    onClick={addShippingMethod}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Method
                  </Button>
                </div>

                <div className="space-y-4">
                  {(formData.shipping_methods || []).map(
                    (method: any, index: number) => (
                      <Card
                        key={method.id || index}
                        className="p-4 border-l-4 border-l-blue-500"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium">
                            {method.name || `Method ${index + 1}`}
                          </h4>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => removeShippingMethod(index)}
                          >
                            <Trash className="w-4 h-4 " />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Method Name (English)</Label>
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
                            <Label>Method Name (Bengali)</Label>
                            <Input
                              value={method.name_bn || ""}
                              onChange={(e) =>
                                updateShippingMethod(
                                  index,
                                  "name_bn",
                                  e.target.value,
                                )
                              }
                              placeholder="পদ্ধতির নাম"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Provider</Label>
                            <Select
                              value={method.provider || "pathao"}
                              onValueChange={(value) =>
                                updateShippingMethod(index, "provider", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pathao">Pathao</SelectItem>
                                <SelectItem value="redx">Redx</SelectItem>
                                <SelectItem value="steadfast">
                                  Steadfast
                                </SelectItem>
                              </SelectContent>
                            </Select>
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
                            <Label>Est. Days (English)</Label>
                            <Input
                              value={method.estimated_days || "3-5"}
                              onChange={(e) =>
                                updateShippingMethod(
                                  index,
                                  "estimated_days",
                                  e.target.value,
                                )
                              }
                              placeholder="3-5"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Est. Days (Bengali)</Label>
                            <Input
                              value={method.estimated_days_bn || "৩-৫ দিন"}
                              onChange={(e) =>
                                updateShippingMethod(
                                  index,
                                  "estimated_days_bn",
                                  e.target.value,
                                )
                              }
                              placeholder="৩-৫ দিন"
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
            </TabsContent>

            {/* COD Charges Tab */}
            <TabsContent value="cod" className="space-y-4">
              <Card className="p-4">
                <h3 className="font-medium mb-4">Cash on Delivery Charges</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.cod_charges?.enable_cod || false}
                        onCheckedChange={(checked) =>
                          handleChange("cod_charges", {
                            ...formData.cod_charges,
                            enable_cod: checked,
                          })
                        }
                      />
                      <Label>Enable Cash on Delivery</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cod_dhaka">Dhaka City (%)</Label>
                    <Input
                      id="cod_dhaka"
                      type="number"
                      step="0.1"
                      value={formData.cod_charges?.dhaka || 1.0}
                      onChange={(e) =>
                        handleChange("cod_charges", {
                          ...formData.cod_charges,
                          dhaka: parseFloat(e.target.value),
                        })
                      }
                    />
                    <p className="text-xs text-gray-500">
                      Percentage charged on COD orders in Dhaka
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cod_outside">Outside Dhaka (%)</Label>
                    <Input
                      id="cod_outside"
                      type="number"
                      step="0.1"
                      value={formData.cod_charges?.outside_dhaka || 1.5}
                      onChange={(e) =>
                        handleChange("cod_charges", {
                          ...formData.cod_charges,
                          outside_dhaka: parseFloat(e.target.value),
                        })
                      }
                    />
                    <p className="text-xs text-gray-500">
                      Percentage charged on COD orders outside Dhaka
                    </p>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Pickup Locations Tab */}
            <TabsContent value="pickup" className="space-y-4">
              <Card className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium">Pickup Locations</h3>
                  <Button
                    onClick={addPickupLocation}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Location
                  </Button>
                </div>

                <div className="space-y-4">
                  {(formData.pickup_locations || []).map(
                    (location: any, index: number) => (
                      <Card
                        key={location.id || index}
                        className="p-4 border-l-4 border-l-green-500"
                      >
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="font-medium">
                            {location.name || `Location ${index + 1}`}
                          </h4>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleLocationStatus(index)}
                            >
                              {location.status ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <EyeOff className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => removePickupLocation(index)}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Location Name</Label>
                            <Input
                              value={location.name || ""}
                              onChange={(e) =>
                                updatePickupLocation(
                                  index,
                                  "name",
                                  e.target.value,
                                )
                              }
                              placeholder="e.g., Main Warehouse"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Location Name (Bengali)</Label>
                            <Input
                              value={location.name_bn || ""}
                              onChange={(e) =>
                                updatePickupLocation(
                                  index,
                                  "name_bn",
                                  e.target.value,
                                )
                              }
                              placeholder="যেমন, মেইন গুদাম"
                            />
                          </div>

                          <div className="space-y-2 col-span-2">
                            <Label>Address</Label>
                            <Input
                              value={location.address || ""}
                              onChange={(e) =>
                                updatePickupLocation(
                                  index,
                                  "address",
                                  e.target.value,
                                )
                              }
                              placeholder="123 Business Street, Dhaka"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Address (Bengali)</Label>
                            <Input
                              value={location.address_bn || ""}
                              onChange={(e) =>
                                updatePickupLocation(
                                  index,
                                  "address_bn",
                                  e.target.value,
                                )
                              }
                              placeholder="বাংলায় ঠিকানা"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input
                              value={location.phone || ""}
                              onChange={(e) =>
                                updatePickupLocation(
                                  index,
                                  "phone",
                                  e.target.value,
                                )
                              }
                              placeholder="+880123456789"
                              type="tel"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                              value={location.email || ""}
                              onChange={(e) =>
                                updatePickupLocation(
                                  index,
                                  "email",
                                  e.target.value,
                                )
                              }
                              placeholder="pickup@example.com"
                              type="email"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Contact Person</Label>
                            <Input
                              value={location.contact_person || ""}
                              onChange={(e) =>
                                updatePickupLocation(
                                  index,
                                  "contact_person",
                                  e.target.value,
                                )
                              }
                              placeholder="John Doe"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>City</Label>
                            <Input
                              value={location.city || ""}
                              onChange={(e) =>
                                updatePickupLocation(
                                  index,
                                  "city",
                                  e.target.value,
                                )
                              }
                              placeholder="Dhaka"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>State/Division</Label>
                            <Input
                              value={location.state || ""}
                              onChange={(e) =>
                                updatePickupLocation(
                                  index,
                                  "state",
                                  e.target.value,
                                )
                              }
                              placeholder="Dhaka Division"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Postal Code</Label>
                            <Input
                              value={location.postal_code || ""}
                              onChange={(e) =>
                                updatePickupLocation(
                                  index,
                                  "postal_code",
                                  e.target.value,
                                )
                              }
                              placeholder="1206"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Latitude</Label>
                            <Input
                              value={location.latitude || ""}
                              onChange={(e) =>
                                updatePickupLocation(
                                  index,
                                  "latitude",
                                  e.target.value,
                                )
                              }
                              placeholder="23.8103"
                              type="number"
                              step="0.0001"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Longitude</Label>
                            <Input
                              value={location.longitude || ""}
                              onChange={(e) =>
                                updatePickupLocation(
                                  index,
                                  "longitude",
                                  e.target.value,
                                )
                              }
                              placeholder="90.4125"
                              type="number"
                              step="0.0001"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Opening Time</Label>
                            <Input
                              value={location.opening_time || ""}
                              onChange={(e) =>
                                updatePickupLocation(
                                  index,
                                  "opening_time",
                                  e.target.value,
                                )
                              }
                              placeholder="09:00 AM"
                              type="time"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Closing Time</Label>
                            <Input
                              value={location.closing_time || ""}
                              onChange={(e) =>
                                updatePickupLocation(
                                  index,
                                  "closing_time",
                                  e.target.value,
                                )
                              }
                              placeholder="06:00 PM"
                              type="time"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Working Days</Label>
                            <Input
                              value={location.working_days || ""}
                              onChange={(e) =>
                                updatePickupLocation(
                                  index,
                                  "working_days",
                                  e.target.value,
                                )
                              }
                              placeholder="Monday - Friday"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Notes</Label>
                            <Input
                              value={location.notes || ""}
                              onChange={(e) =>
                                updatePickupLocation(
                                  index,
                                  "notes",
                                  e.target.value,
                                )
                              }
                              placeholder="Additional instructions or notes"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <Switch
                              checked={location.status || true}
                              onCheckedChange={(checked) =>
                                updatePickupLocation(index, "status", checked)
                              }
                            />
                            <Label>Active</Label>
                          </div>

                          <div className="space-y-2">
                            <Label>Pickup Type</Label>
                            <Select
                              value={location.pickup_type || "standard"}
                              onValueChange={(value) =>
                                updatePickupLocation(
                                  index,
                                  "pickup_type",
                                  value,
                                )
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="standard">
                                  Standard
                                </SelectItem>
                                <SelectItem value="express">Express</SelectItem>
                                <SelectItem value="overnight">
                                  Overnight
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </Card>
                    ),
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Tracking Tab */}
            <TabsContent value="tracking" className="space-y-4">
              <Card className="p-4">
                <h3 className="font-medium mb-4">Tracking Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.tracking?.enable_tracking || false}
                        onCheckedChange={(checked) =>
                          handleChange("tracking", {
                            ...formData.tracking,
                            enable_tracking: checked,
                          })
                        }
                      />
                      <Label>Enable Order Tracking</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tracking_page_url">Tracking Page URL</Label>
                    <Input
                      id="tracking_page_url"
                      value={formData.tracking?.tracking_page_url || ""}
                      onChange={(e) =>
                        handleChange("tracking", {
                          ...formData.tracking,
                          tracking_page_url: e.target.value,
                        })
                      }
                      placeholder="/track-order"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.tracking?.auto_update || false}
                        onCheckedChange={(checked) =>
                          handleChange("tracking", {
                            ...formData.tracking,
                            auto_update: checked,
                          })
                        }
                      />
                      <Label>Auto Update Tracking Status</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={
                          formData.tracking?.customer_notification || false
                        }
                        onCheckedChange={(checked) =>
                          handleChange("tracking", {
                            ...formData.tracking,
                            customer_notification: checked,
                          })
                        }
                      />
                      <Label>Notify Customers on Status Change</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.tracking?.sms_notification || false}
                        onCheckedChange={(checked) =>
                          handleChange("tracking", {
                            ...formData.tracking,
                            sms_notification: checked,
                          })
                        }
                      />
                      <Label>SMS Notifications</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={formData.tracking?.email_notification || false}
                        onCheckedChange={(checked) =>
                          handleChange("tracking", {
                            ...formData.tracking,
                            email_notification: checked,
                          })
                        }
                      />
                      <Label>Email Notifications</Label>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
