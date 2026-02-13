"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash } from "lucide-react";
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
} from "../ui/select";

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

  const addMobileProvider = () => {
    const newProvider = {
      name: "New Provider",
      status: true,
      merchant_number: "",
      account_type: "Merchant",
      charge: 0,
    };
    handleChange("mobile_banking", {
      ...(formData.mobile_banking || {}),
      providers: [...(formData.mobile_banking?.providers || []), newProvider],
    });
  };

  const updateMobileProvider = (index: number, field: string, value: any) => {
    const updated = { ...formData };
    updated.mobile_banking.providers[index] = {
      ...updated.mobile_banking.providers[index],
      [field]: value,
    };
    setFormData(updated);
    onChange(updated);
  };

  const removeMobileProvider = (index: number) => {
    const updated = { ...formData };
    updated.mobile_banking.providers = updated.mobile_banking.providers.filter(
      (_: any, i: number) => i !== index,
    );
    setFormData(updated);
    onChange(updated);
  };

  const addGateway = () => {
    const newGateway = {
      name: "New Gateway",
      status: true,
      test_mode: false,
    };
    handleChange("online_payment", {
      ...(formData.online_payment || {}),
      gateways: [...(formData.online_payment?.gateways || []), newGateway],
    });
  };

  const updateGateway = (index: number, field: string, value: any) => {
    const updated = { ...formData };
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

  const addBank = () => {
    const newBank = {
      name: "New Bank",
      account_name: "",
      account_number: "",
      branch: "",
      routing_number: "",
    };
    handleChange("bank_transfer", {
      ...(formData.bank_transfer || {}),
      banks: [...(formData.bank_transfer?.banks || []), newBank],
    });
  };

  const updateBank = (index: number, field: string, value: any) => {
    const updated = { ...formData };
    updated.bank_transfer.banks[index] = {
      ...updated.bank_transfer.banks[index],
      [field]: value,
    };
    setFormData(updated);
    onChange(updated);
  };

  const removeBank = (index: number) => {
    const updated = { ...formData };
    updated.bank_transfer.banks = updated.bank_transfer.banks.filter(
      (_: any, i: number) => i !== index,
    );
    setFormData(updated);
    onChange(updated);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Payment Settings</CardTitle>
        <Button onClick={onSave} disabled={saving} className="gap-2">
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cod" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="cod">Cash on Delivery</TabsTrigger>
            <TabsTrigger value="mobile">Mobile Banking</TabsTrigger>
            <TabsTrigger value="online">Online Payment</TabsTrigger>
            <TabsTrigger value="bank">Bank Transfer</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
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
                    value={formData.cash_on_delivery?.min_amount || 50}
                    onChange={(e) => {
                      handleChange("cash_on_delivery", {
                        ...formData.cash_on_delivery,
                        min_amount: parseInt(e.target.value),
                      });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cod_max">Maximum Amount (BDT)</Label>
                  <Input
                    id="cod_max"
                    type="number"
                    value={formData.cash_on_delivery?.max_amount || 50000}
                    onChange={(e) => {
                      handleChange("cash_on_delivery", {
                        ...formData.cash_on_delivery,
                        max_amount: parseInt(e.target.value),
                      });
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cod_charge">Additional Charge (BDT)</Label>
                  <Input
                    id="cod_charge"
                    type="number"
                    value={formData.cash_on_delivery?.additional_charge || 0}
                    onChange={(e) => {
                      handleChange("cash_on_delivery", {
                        ...formData.cash_on_delivery,
                        additional_charge: parseInt(e.target.value),
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
                      "Pay cash at your doorstep"
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
                      "হোম ডেলিভারিতে নগদ টাকা পরিশোধ করুন"
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

          {/* Mobile Banking Tab */}
          <TabsContent value="mobile" className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.mobile_banking?.status || false}
                onCheckedChange={(checked) => {
                  handleChange("mobile_banking", {
                    ...(formData.mobile_banking || {}),
                    status: checked,
                  });
                }}
              />
              <Label>Enable Mobile Banking</Label>
            </div>

            {formData.mobile_banking?.status && (
              <div className="space-y-4">
                {(formData.mobile_banking?.providers || []).map(
                  (provider: any, index: number) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">
                          {provider.name || `Provider ${index + 1}`}
                        </h4>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeMobileProvider(index)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Provider Name</Label>
                          <Input
                            value={provider.name || ""}
                            onChange={(e) =>
                              updateMobileProvider(
                                index,
                                "name",
                                e.target.value,
                              )
                            }
                            placeholder="bKash, Nagad, Rocket"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={provider.status}
                            onCheckedChange={(checked) =>
                              updateMobileProvider(index, "status", checked)
                            }
                          />
                          <Label>Active</Label>
                        </div>

                        <div className="space-y-2">
                          <Label>Merchant Number</Label>
                          <Input
                            value={provider.merchant_number || ""}
                            onChange={(e) =>
                              updateMobileProvider(
                                index,
                                "merchant_number",
                                e.target.value,
                              )
                            }
                            placeholder="017xxxxxxxx"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Account Type</Label>
                          <Input
                            value={provider.account_type || "Merchant"}
                            onChange={(e) =>
                              updateMobileProvider(
                                index,
                                "account_type",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Charge (%)</Label>
                          <Input
                            type="number"
                            value={provider.charge || 0}
                            onChange={(e) =>
                              updateMobileProvider(
                                index,
                                "charge",
                                parseFloat(e.target.value),
                              )
                            }
                          />
                        </div>

                        <div className="col-span-2 space-y-2">
                          <Label>Instructions (English)</Label>
                          <textarea
                            value={provider.instructions || ""}
                            onChange={(e) =>
                              updateMobileProvider(
                                index,
                                "instructions",
                                e.target.value,
                              )
                            }
                            className="w-full border rounded p-2"
                            rows={2}
                          />
                        </div>

                        <div className="col-span-2 space-y-2">
                          <Label>Instructions (Bengali)</Label>
                          <textarea
                            value={provider.instructions_bn || ""}
                            onChange={(e) =>
                              updateMobileProvider(
                                index,
                                "instructions_bn",
                                e.target.value,
                              )
                            }
                            className="w-full border rounded p-2"
                            rows={2}
                            placeholder="বাংলা নির্দেশনা"
                          />
                        </div>
                      </div>
                    </Card>
                  ),
                )}

                <Button onClick={addMobileProvider} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" /> Add Mobile Banking Provider
                </Button>
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
                    ...(formData.online_payment || {}),
                    status: checked,
                  });
                }}
              />
              <Label>Enable Online Payment</Label>
            </div>

            {formData.online_payment?.status && (
              <div className="space-y-4">
                {(formData.online_payment?.gateways || []).map(
                  (gateway: any, index: number) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">
                          {gateway.name || `Gateway ${index + 1}`}
                        </h4>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeGateway(index)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Gateway Name</Label>
                          <Input
                            value={gateway.name || ""}
                            onChange={(e) =>
                              updateGateway(index, "name", e.target.value)
                            }
                            placeholder="SSLCommerz, PortWallet, ShurjoPay"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={gateway.status}
                            onCheckedChange={(checked) =>
                              updateGateway(index, "status", checked)
                            }
                          />
                          <Label>Active</Label>
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={gateway.test_mode || false}
                            onCheckedChange={(checked) =>
                              updateGateway(index, "test_mode", checked)
                            }
                          />
                          <Label>Test Mode</Label>
                        </div>

                        {gateway.name?.toLowerCase().includes("ssl") && (
                          <>
                            <div className="space-y-2">
                              <Label>Store ID</Label>
                              <Input
                                value={gateway.store_id || ""}
                                onChange={(e) =>
                                  updateGateway(
                                    index,
                                    "store_id",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Store Password</Label>
                              <Input
                                type="password"
                                value={gateway.store_password || ""}
                                onChange={(e) =>
                                  updateGateway(
                                    index,
                                    "store_password",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </>
                        )}

                        {gateway.name?.toLowerCase().includes("port") && (
                          <>
                            <div className="space-y-2">
                              <Label>API Key</Label>
                              <Input
                                value={gateway.api_key || ""}
                                onChange={(e) =>
                                  updateGateway(
                                    index,
                                    "api_key",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>API Secret</Label>
                              <Input
                                type="password"
                                value={gateway.api_secret || ""}
                                onChange={(e) =>
                                  updateGateway(
                                    index,
                                    "api_secret",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </>
                        )}

                        {gateway.name?.toLowerCase().includes("shurjo") && (
                          <>
                            <div className="space-y-2">
                              <Label>Merchant ID</Label>
                              <Input
                                value={gateway.merchant_id || ""}
                                onChange={(e) =>
                                  updateGateway(
                                    index,
                                    "merchant_id",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>API Key</Label>
                              <Input
                                value={gateway.api_key || ""}
                                onChange={(e) =>
                                  updateGateway(
                                    index,
                                    "api_key",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </Card>
                  ),
                )}

                <Button onClick={addGateway} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" /> Add Payment Gateway
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Bank Transfer Tab */}
          <TabsContent value="bank" className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.bank_transfer?.status || false}
                onCheckedChange={(checked) => {
                  handleChange("bank_transfer", {
                    ...(formData.bank_transfer || {}),
                    status: checked,
                  });
                }}
              />
              <Label>Enable Bank Transfer</Label>
            </div>

            {formData.bank_transfer?.status && (
              <div className="space-y-4">
                {(formData.bank_transfer?.banks || []).map(
                  (bank: any, index: number) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">
                          {bank.name || `Bank ${index + 1}`}
                        </h4>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeBank(index)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Bank Name</Label>
                          <Input
                            value={bank.name || ""}
                            onChange={(e) =>
                              updateBank(index, "name", e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Account Name</Label>
                          <Input
                            value={bank.account_name || ""}
                            onChange={(e) =>
                              updateBank(index, "account_name", e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Account Number</Label>
                          <Input
                            value={bank.account_number || ""}
                            onChange={(e) =>
                              updateBank(
                                index,
                                "account_number",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Branch</Label>
                          <Input
                            value={bank.branch || ""}
                            onChange={(e) =>
                              updateBank(index, "branch", e.target.value)
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Routing Number</Label>
                          <Input
                            value={bank.routing_number || ""}
                            onChange={(e) =>
                              updateBank(
                                index,
                                "routing_number",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                    </Card>
                  ),
                )}

                <Button onClick={addBank} variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" /> Add Bank
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.enable_review?.status || false}
                onCheckedChange={(checked) => {
                  handleChange("enable_review", {
                    ...(formData.enable_review || {}),
                    status: checked,
                  });
                }}
              />
              <Label>Enable Product Reviews</Label>
            </div>

            {formData.enable_review?.status && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Require Login</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.enable_review?.require_login || false}
                      onCheckedChange={(checked) => {
                        handleChange("enable_review", {
                          ...formData.enable_review,
                          require_login: checked,
                        });
                      }}
                    />
                    <span className="text-sm text-gray-500">
                      Users must login to review
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Moderate Reviews</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={
                        formData.enable_review?.moderate_reviews || false
                      }
                      onCheckedChange={(checked) => {
                        handleChange("enable_review", {
                          ...formData.enable_review,
                          moderate_reviews: checked,
                        });
                      }}
                    />
                    <span className="text-sm text-gray-500">
                      Reviews need approval
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Allow Images</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={formData.enable_review?.allow_images || false}
                      onCheckedChange={(checked) => {
                        handleChange("enable_review", {
                          ...formData.enable_review,
                          allow_images: checked,
                        });
                      }}
                    />
                    <span className="text-sm text-gray-500">
                      Users can upload images
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Rating Range</Label>
                  <Select
                    value={
                      formData.enable_review?.rating_range?.toString() || "5"
                    }
                    onValueChange={(value) => {
                      handleChange("enable_review", {
                        ...formData.enable_review,
                        rating_range: parseInt(value),
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5-Star Rating</SelectItem>
                      <SelectItem value="10">10-Star Rating</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
