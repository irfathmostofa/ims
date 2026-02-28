"use client";

import { useState, useEffect } from "react";
import { Save, Trash, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { toast } from "sonner";

interface PaymentSettingsProps {
  data?: any;
  onChange: (data: any) => void;
  onSave: () => void;
  saving: boolean;
}

export default function PaymentSettings({
  data,
  onChange,
  onSave,
  saving,
}: PaymentSettingsProps) {
  const [formData, setFormData] = useState(data || {});
  const [showApiKeys, setShowApiKeys] = useState<{ [key: string]: boolean }>(
    {},
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

  const toggleApiKeyVisibility = (gatewayIndex: number, field: string) => {
    const key = `gateway-${gatewayIndex}-${field}`;
    setShowApiKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Online Payment Gateway Functions
  // const addGateway = () => {
  //   const newGateway = {
  //     id: `gateway-${Date.now()}`,
  //     name: "SSLCommerz",
  //     status: true,
  //     environment: "sandbox", // sandbox or live
  //     store_id: "",
  //     store_password: "",
  //     api_key: "",
  //     api_secret: "",
  //     merchant_id: "",
  //     sandbox_url: "https://sandbox.sslcommerz.com",
  //     live_url: "https://secure.sslcommerz.com",
  //     success_url: "/payment/success",
  //     fail_url: "/payment/fail",
  //     cancel_url: "/payment/cancel",
  //     ipn_url: "/payment/ipn",
  //   };
  //   handleChange("online_payment", {
  //     ...(formData.online_payment || { status: true, gateways: [] }),
  //     gateways: [...(formData.online_payment?.gateways || []), newGateway],
  //   });
  // };

  const updateGateway = (index: number, field: string, value: any) => {
    const updated = { ...formData };
    if (!updated.online_payment)
      updated.online_payment = { status: true, gateways: [] };
    updated.online_payment.gateways[index] = {
      ...updated.online_payment.gateways[index],
      [field]: value,
    };
    setFormData(updated);
    onChange(updated);
  };

  const removeGateway = (index: number) => {
    const updated = { ...formData };
    updated.online_payment.gateways = updated.online_payment.gateways.filter(
      (_: any, i: number) => i !== index,
    );
    setFormData(updated);
    onChange(updated);
  };

  const getGatewayFields = (gateway: any, index: number) => {
    const gatewayName = gateway.name?.toLowerCase() || "";

    if (gatewayName.includes("ssl")) {
      return (
        <>
          <div className="space-y-2">
            <Label>Environment</Label>
            <Select
              value={gateway.environment || "sandbox"}
              onValueChange={(value) =>
                updateGateway(index, "environment", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">Sandbox (Test)</SelectItem>
                <SelectItem value="live">Live (Production)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Store ID</Label>
            <Input
              value={gateway.store_id || ""}
              onChange={(e) => updateGateway(index, "store_id", e.target.value)}
              placeholder="testbox"
            />
          </div>

          <div className="space-y-2">
            <Label>Store Password</Label>
            <div className="flex gap-2">
              <Input
                type={
                  showApiKeys[`gateway-${index}-password`] ? "text" : "password"
                }
                value={gateway.store_password || ""}
                onChange={(e) =>
                  updateGateway(index, "store_password", e.target.value)
                }
                placeholder="qwerty123"
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleApiKeyVisibility(index, "password")}
              >
                {showApiKeys[`gateway-${index}-password`] ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Sandbox URL</Label>
            <Input
              value={gateway.sandbox_url || "https://sandbox.sslcommerz.com"}
              onChange={(e) =>
                updateGateway(index, "sandbox_url", e.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Live URL</Label>
            <Input
              value={gateway.live_url || "https://secure.sslcommerz.com"}
              onChange={(e) => updateGateway(index, "live_url", e.target.value)}
            />
          </div>
        </>
      );
    }

    if (gatewayName.includes("port") || gatewayName.includes("portwallet")) {
      return (
        <>
          <div className="space-y-2">
            <Label>Environment</Label>
            <Select
              value={gateway.environment || "sandbox"}
              onValueChange={(value) =>
                updateGateway(index, "environment", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">Sandbox (Test)</SelectItem>
                <SelectItem value="live">Live (Production)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="flex gap-2">
              <Input
                type={
                  showApiKeys[`gateway-${index}-api_key`] ? "text" : "password"
                }
                value={gateway.api_key || ""}
                onChange={(e) =>
                  updateGateway(index, "api_key", e.target.value)
                }
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleApiKeyVisibility(index, "api_key")}
              >
                {showApiKeys[`gateway-${index}-api_key`] ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>API Secret</Label>
            <div className="flex gap-2">
              <Input
                type={
                  showApiKeys[`gateway-${index}-api_secret`]
                    ? "text"
                    : "password"
                }
                value={gateway.api_secret || ""}
                onChange={(e) =>
                  updateGateway(index, "api_secret", e.target.value)
                }
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleApiKeyVisibility(index, "api_secret")}
              >
                {showApiKeys[`gateway-${index}-api_secret`] ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </>
      );
    }

    if (gatewayName.includes("shurjo") || gatewayName.includes("shurjopay")) {
      return (
        <>
          <div className="space-y-2">
            <Label>Environment</Label>
            <Select
              value={gateway.environment || "sandbox"}
              onValueChange={(value) =>
                updateGateway(index, "environment", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">Sandbox (Test)</SelectItem>
                <SelectItem value="live">Live (Production)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Merchant ID</Label>
            <Input
              value={gateway.merchant_id || ""}
              onChange={(e) =>
                updateGateway(index, "merchant_id", e.target.value)
              }
            />
          </div>

          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="flex gap-2">
              <Input
                type={
                  showApiKeys[`gateway-${index}-api_key`] ? "text" : "password"
                }
                value={gateway.api_key || ""}
                onChange={(e) =>
                  updateGateway(index, "api_key", e.target.value)
                }
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleApiKeyVisibility(index, "api_key")}
              >
                {showApiKeys[`gateway-${index}-api_key`] ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>API Secret</Label>
            <div className="flex gap-2">
              <Input
                type={
                  showApiKeys[`gateway-${index}-api_secret`]
                    ? "text"
                    : "password"
                }
                value={gateway.api_secret || ""}
                onChange={(e) =>
                  updateGateway(index, "api_secret", e.target.value)
                }
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleApiKeyVisibility(index, "api_secret")}
              >
                {showApiKeys[`gateway-${index}-api_secret`] ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </>
      );
    }

    if (gatewayName.includes("aamarpay")) {
      return (
        <>
          <div className="space-y-2">
            <Label>Environment</Label>
            <Select
              value={gateway.environment || "sandbox"}
              onValueChange={(value) =>
                updateGateway(index, "environment", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sandbox">Sandbox (Test)</SelectItem>
                <SelectItem value="live">Live (Production)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Store ID</Label>
            <Input
              value={gateway.store_id || ""}
              onChange={(e) => updateGateway(index, "store_id", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Signature Key</Label>
            <div className="flex gap-2">
              <Input
                type={
                  showApiKeys[`gateway-${index}-signature`]
                    ? "text"
                    : "password"
                }
                value={gateway.signature_key || ""}
                onChange={(e) =>
                  updateGateway(index, "signature_key", e.target.value)
                }
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => toggleApiKeyVisibility(index, "signature")}
              >
                {showApiKeys[`gateway-${index}-signature`] ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>API URL</Label>
            <Input
              value={gateway.api_url || "https://sandbox.aamarpay.com"}
              onChange={(e) => updateGateway(index, "api_url", e.target.value)}
            />
          </div>
        </>
      );
    }

    // Default fields for custom gateways
    return (
      <>
        <div className="space-y-2">
          <Label>API URL</Label>
          <Input
            value={gateway.api_url || ""}
            onChange={(e) => updateGateway(index, "api_url", e.target.value)}
            placeholder="https://api.gateway.com/v1"
          />
        </div>

        <div className="space-y-2">
          <Label>API Key</Label>
          <div className="flex gap-2">
            <Input
              type={
                showApiKeys[`gateway-${index}-api_key`] ? "text" : "password"
              }
              value={gateway.api_key || ""}
              onChange={(e) => updateGateway(index, "api_key", e.target.value)}
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => toggleApiKeyVisibility(index, "api_key")}
            >
              {showApiKeys[`gateway-${index}-api_key`] ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>API Secret</Label>
          <div className="flex gap-2">
            <Input
              type={
                showApiKeys[`gateway-${index}-api_secret`] ? "text" : "password"
              }
              value={gateway.api_secret || ""}
              onChange={(e) =>
                updateGateway(index, "api_secret", e.target.value)
              }
              className="flex-1"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => toggleApiKeyVisibility(index, "api_secret")}
            >
              {showApiKeys[`gateway-${index}-api_secret`] ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Payment Settings</CardTitle>
        <Button onClick={onSave} disabled={saving} className="gap-2 btn-bw-primary">
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cod" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="cod">Cash on Delivery</TabsTrigger>
            <TabsTrigger value="online">Online Payment</TabsTrigger>
          </TabsList>

          {/* Cash on Delivery Tab */}
          <TabsContent value="cod" className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.cash_on_delivery?.status || false}
                onCheckedChange={(checked) => {
                  handleChange("cash_on_delivery", {
                    ...(formData.cash_on_delivery || {}),
                    status: checked,
                  });
                }}
              />
              <Label>Enable Cash on Delivery</Label>
            </div>

            {formData.cash_on_delivery?.status && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cod_min">Minimum Amount (BDT)</Label>
                  <Input
                    id="cod_min"
                    type="number"
                    min="0"
                    value={formData.cash_on_delivery?.min_amount || 50}
                    onChange={(e) => {
                      handleChange("cash_on_delivery", {
                        ...formData.cash_on_delivery,
                        min_amount: parseInt(e.target.value) || 0,
                      });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cod_max">Maximum Amount (BDT)</Label>
                  <Input
                    id="cod_max"
                    type="number"
                    min="0"
                    value={formData.cash_on_delivery?.max_amount || 50000}
                    onChange={(e) => {
                      handleChange("cash_on_delivery", {
                        ...formData.cash_on_delivery,
                        max_amount: parseInt(e.target.value) || 0,
                      });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cod_charge">Additional Charge (BDT)</Label>
                  <Input
                    id="cod_charge"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.cash_on_delivery?.additional_charge || 0}
                    onChange={(e) => {
                      handleChange("cash_on_delivery", {
                        ...formData.cash_on_delivery,
                        additional_charge: parseFloat(e.target.value) || 0,
                      });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cod_note_en">Note (English)</Label>
                  <Input
                    id="cod_note_en"
                    value={
                      formData.cash_on_delivery?.note ||
                      "Pay with cash when you receive your order"
                    }
                    onChange={(e) => {
                      handleChange("cash_on_delivery", {
                        ...formData.cash_on_delivery,
                        note: e.target.value,
                      });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cod_note_bn">Note (Bengali)</Label>
                  <Input
                    id="cod_note_bn"
                    value={
                      formData.cash_on_delivery?.note_bn ||
                      "অর্ডার গ্রহণের সময় নগদ টাকা পরিশোধ করুন"
                    }
                    onChange={(e) => {
                      handleChange("cash_on_delivery", {
                        ...formData.cash_on_delivery,
                        note_bn: e.target.value,
                      });
                    }}
                  />
                </div>
              </div>
            )}
          </TabsContent>

          {/* Online Payment Tab */}
          <TabsContent value="online" className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.online_payment?.status || false}
                onCheckedChange={(checked) => {
                  handleChange("online_payment", {
                    ...(formData.online_payment || { gateways: [] }),
                    status: checked,
                  });
                }}
              />
              <Label>Enable Online Payment</Label>
            </div>

            {formData.online_payment?.status && (
              <div className="space-y-4">
                {/* Default Settings */}
                <Card className="p-4">
                  <h4 className="font-medium mb-4">Default Settings</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="success_url">Success URL</Label>
                      <Input
                        id="success_url"
                        value={
                          formData.online_payment?.success_url ||
                          "/payment/success"
                        }
                        onChange={(e) => {
                          handleChange("online_payment", {
                            ...formData.online_payment,
                            success_url: e.target.value,
                          });
                        }}
                        placeholder="/payment/success"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fail_url">Fail URL</Label>
                      <Input
                        id="fail_url"
                        value={
                          formData.online_payment?.fail_url || "/payment/fail"
                        }
                        onChange={(e) => {
                          handleChange("online_payment", {
                            ...formData.online_payment,
                            fail_url: e.target.value,
                          });
                        }}
                        placeholder="/payment/fail"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cancel_url">Cancel URL</Label>
                      <Input
                        id="cancel_url"
                        value={
                          formData.online_payment?.cancel_url ||
                          "/payment/cancel"
                        }
                        onChange={(e) => {
                          handleChange("online_payment", {
                            ...formData.online_payment,
                            cancel_url: e.target.value,
                          });
                        }}
                        placeholder="/payment/cancel"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ipn_url">IPN URL</Label>
                      <Input
                        id="ipn_url"
                        value={
                          formData.online_payment?.ipn_url || "/payment/ipn"
                        }
                        onChange={(e) => {
                          handleChange("online_payment", {
                            ...formData.online_payment,
                            ipn_url: e.target.value,
                          });
                        }}
                        placeholder="/payment/ipn"
                      />
                    </div>
                  </div>
                </Card>

                {/* Payment Gateways */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Payment Gateways</h4>
                    <Select
                      value=""
                      onValueChange={(value) => {
                        const newGateway = {
                          id: `gateway-${Date.now()}`,
                          name: value,
                          status: true,
                          environment: "sandbox",
                        };
                        handleChange("online_payment", {
                          ...formData.online_payment,
                          gateways: [
                            ...(formData.online_payment?.gateways || []),
                            newGateway,
                          ],
                        });
                      }}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Add Gateway" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SSLCommerz">SSLCommerz</SelectItem>
                        <SelectItem value="PortWallet">PortWallet</SelectItem>
                        <SelectItem value="ShurjoPay">ShurjoPay</SelectItem>
                        <SelectItem value="aamarpay">aamarpay</SelectItem>
                        <SelectItem value="Custom">Custom Gateway</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(formData.online_payment?.gateways || []).map(
                    (gateway: any, index: number) => (
                      <Card key={gateway.id || index} className="p-4">
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{gateway.name}</h4>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                gateway.environment === "live"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {gateway.environment === "live"
                                ? "Live"
                                : "Sandbox"}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Switch
                              checked={gateway.status}
                              onCheckedChange={(checked) =>
                                updateGateway(index, "status", checked)
                              }
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeGateway(index)}
                            >
                              <Trash className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Gateway Name (editable) */}
                          <div className="space-y-2 col-span-2">
                            <Label>Gateway Name</Label>
                            <Input
                              value={gateway.name || ""}
                              onChange={(e) =>
                                updateGateway(index, "name", e.target.value)
                              }
                              placeholder="Gateway Name"
                            />
                          </div>

                          {/* Gateway-specific fields */}
                          {getGatewayFields(gateway, index)}
                        </div>
                      </Card>
                    ),
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
