// src/pages/SendMobileMessagePage.tsx
"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Phone, Users, RefreshCw, AlertCircle, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { apiClient } from "@/hook/apiClient";
import { useQuickStore } from "@/store/quickStore";

// Types
interface Campaign {
  id: number;
  campaign_name: string;
  content: string;
  template_name: string;
  message: string;
  category: string;
  created_at: string;
  status?: string;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
}

interface SMSFormData {
  campaignId: number | null;
  customers: Customer[];
  customMessage: string;
  selectedPhones: string[];
  mode: "single" | "bulk";
  category: "general" | "offer" | "warning" | "alert" | "otp";
}

export default function SendMobileMessagePage() {
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Form state
  const [formData, setFormData] = useState<SMSFormData>({
    campaignId: null,
    customers: [],
    customMessage: "",
    selectedPhones: [],
    mode: "single",
    category: "general",
  });

  // Single phone input
  const [singlePhone, setSinglePhone] = useState("");

  // Store hooks
  const { fetchParty, Party } = useQuickStore();

  // Load campaigns and customers on mount
  useEffect(() => {
    fetchCampaigns();
    fetchParty();
  }, []);

  // Fix: Properly handle Party data (Party might be an array directly)
  useEffect(() => {
    if (Party) {
      // Check if Party is an array
      if (Array.isArray(Party)) {
        const formattedCustomers: Customer[] = Party.map((party: any) => ({
          id: party.id,
          name: party.name || "Unnamed Customer",
          phone: party.phone || "",
          email: party.email || "",
        }));
        setCustomers(formattedCustomers);
      }
      // Check if Party has data property that is an array
    }
  }, [Party]);

  // Fetch campaigns
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/marketing/get-marketing-msg`,
        {
          method: "POST",
          tokenType: "jwt",
          data: {
            page: 1,
            limit: 1000,
          },
        },
      );
      if (response.success) {
        setCampaigns(response.data);
        if (response.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            campaignId: response.data[0].id,
            customMessage: response.data[0].message || "",
          }));
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load campaigns");
      console.error("Campaign fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle campaign selection
  const handleCampaignSelect = (campaignId: number) => {
    const selectedCampaign = campaigns.find((c) => c.id === campaignId);
    setFormData((prev) => ({
      ...prev,
      campaignId,
      customMessage: selectedCampaign?.message || prev.customMessage,
    }));
  };

  // Handle customer selection
  const handleCustomerSelect = (customer: Customer) => {
    setFormData((prev) => {
      const exists = prev.customers.some((c) => c.id === customer.id);
      if (exists) {
        return {
          ...prev,
          customers: prev.customers.filter((c) => c.id !== customer.id),
          selectedPhones: prev.selectedPhones.filter(
            (p) => p !== customer.phone,
          ),
        };
      } else {
        return {
          ...prev,
          customers: [...prev.customers, customer],
          selectedPhones: [...prev.selectedPhones, customer.phone],
        };
      }
    });
  };

  // Handle select all customers
  const handleSelectAll = () => {
    if (formData.customers.length === customers.length) {
      setFormData((prev) => ({
        ...prev,
        customers: [],
        selectedPhones: [],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        customers: customers,
        selectedPhones: customers.map((c) => c.phone),
      }));
    }
  };

  // Handle remove customer
  const handleRemoveCustomer = (customerId: number) => {
    setFormData((prev) => {
      const customer = prev.customers.find((c) => c.id === customerId);
      return {
        ...prev,
        customers: prev.customers.filter((c) => c.id !== customerId),
        selectedPhones: customer
          ? prev.selectedPhones.filter((p) => p !== customer.phone)
          : prev.selectedPhones,
      };
    });
  };

  // Handle message change
  const handleMessageChange = (message: string) => {
    setFormData((prev) => ({
      ...prev,
      customMessage: message,
    }));
  };

  // Handle category change
  const handleCategoryChange = (category: SMSFormData["category"]) => {
    setFormData((prev) => ({
      ...prev,
      category,
    }));
  };

  // Handle mode change
  const handleModeChange = (mode: "single" | "bulk") => {
    setFormData((prev) => ({
      ...prev,
      mode,
    }));
  };

  // Format phone number
  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "";
    let cleaned = phone.replace(/\D/g, "");
    if (!cleaned.startsWith("880") && cleaned.length === 10) {
      cleaned = "880" + cleaned;
    }
    return cleaned;
  };

  // Filter customers based on search
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm),
  );

  // Validate form
  const validateForm = (): boolean => {
    if (formData.mode === "single") {
      if (!singlePhone.trim()) {
        toast.error("Please enter a phone number");
        return false;
      }
      const formattedPhone = formatPhoneNumber(singlePhone);
      if (!formattedPhone || formattedPhone.length < 11) {
        toast.error("Please enter a valid phone number");
        return false;
      }
    }

    if (formData.mode === "bulk") {
      if (formData.selectedPhones.length === 0) {
        toast.error("Please select at least one recipient");
        return false;
      }
    }

    if (!formData.customMessage.trim()) {
      toast.error("Message content is required");
      return false;
    }

    if (formData.customMessage.length > 160) {
      toast.error("Message is too long (max 160 characters)");
      return false;
    }

    return true;
  };

  // Send SMS
  const handleSendSMS = async () => {
    if (!validateForm()) return;

    try {
      setSending(true);

      const payload: any = {
        message: formData.customMessage,
        category: formData.category,
        message_id: `sms_${Date.now()}`,
        mode: formData.mode,
      };

      if (formData.mode === "single") {
        payload.phone = formatPhoneNumber(singlePhone);
      } else {
        payload.phones = formData.selectedPhones;
        payload.customers = formData.customers.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
        }));
      }

      if (formData.campaignId) {
        payload.party_id = `campaign_${formData.campaignId}`;
      }

      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/sms/send-sms`,
        {
          method: "POST",
          tokenType: "jwt",
          data: payload,
        },
      );

      if (response.success) {
        toast.success(
          `SMS sent successfully to ${
            response.data?.recipients?.successful ||
            (formData.mode === "single" ? 1 : formData.selectedPhones.length)
          } recipients`,
        );

        setFormData((prev) => ({
          ...prev,
          customers: [],
          selectedPhones: [],
          customMessage: "",
        }));
        setSinglePhone("");
        setShowPreview(false);
      } else {
        throw new Error(response.message || "Failed to send SMS");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send SMS");
    } finally {
      setSending(false);
    }
  };

  // Quick send
  const handleQuickSend = (category: SMSFormData["category"]) => {
    if (!formData.customMessage.trim()) {
      toast.error("Please enter a message first");
      return;
    }

    if (formData.mode === "single" && !singlePhone.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    if (formData.mode === "bulk" && formData.selectedPhones.length === 0) {
      toast.error("Please select recipients");
      return;
    }

    setFormData((prev) => ({ ...prev, category }));
    setShowPreview(true);
  };

  // Character count
  const characterCount = formData.customMessage.length;
  const maxCharacters = 160;

  // Selected campaign
  const selectedCampaign = campaigns.find((c) => c.id === formData.campaignId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Send Mobile SMS</h1>
        <p className="text-gray-500">
          Send SMS messages to customers with campaign templates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Campaign & Message */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Selection */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Select Campaign</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchCampaigns}
                  className="gap-2"
                >
                  <RefreshCw size={16} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaigns.length > 0 ? (
                <>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={formData.campaignId || ""}
                    onChange={(e) =>
                      handleCampaignSelect(Number(e.target.value))
                    }
                  >
                    <option value="" disabled>
                      Select a campaign
                    </option>
                    {campaigns.map((campaign) => (
                      <option key={campaign.id} value={campaign.id}>
                        {campaign.campaign_name} ({campaign.template_name})
                      </option>
                    ))}
                  </select>

                  {selectedCampaign?.message && (
                    <div className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded">
                      "{selectedCampaign.message}"
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-2">No campaigns found</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate("/marketing/create-campaign")}
                  >
                    Create Campaign
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message Editor */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Message Content</CardTitle>
                <div className="text-sm">
                  <span
                    className={
                      characterCount > maxCharacters
                        ? "text-red-500"
                        : "text-gray-500"
                    }
                  >
                    {characterCount}/{maxCharacters}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                className="w-full min-h-[120px] p-3 border rounded-md resize-y"
                value={formData.customMessage}
                onChange={(e) => handleMessageChange(e.target.value)}
                placeholder="Type your message here..."
                maxLength={maxCharacters}
              />

              {/* Category Selection */}
              <div className="flex flex-wrap gap-2">
                {["general", "offer", "warning", "alert", "otp"].map((cat) => (
                  <Badge
                    key={cat}
                    variant={formData.category === cat ? "default" : "outline"}
                    className="cursor-pointer capitalize"
                    onClick={() => handleCategoryChange(cat as any)}
                  >
                    {cat}
                  </Badge>
                ))}
              </div>

              <Separator />

              {/* Send Mode */}
              <div className="flex gap-2">
                <Button
                  variant={formData.mode === "single" ? "default" : "outline"}
                  onClick={() => handleModeChange("single")}
                  className="flex-1 gap-2"
                >
                  <Phone size={16} />
                  Single
                </Button>
                <Button
                  variant={formData.mode === "bulk" ? "default" : "outline"}
                  onClick={() => handleModeChange("bulk")}
                  className="flex-1 gap-2"
                >
                  <Users size={16} />
                  Bulk
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Recipients & Actions */}
        <div className="space-y-6">
          {/* Single Mode */}
          {formData.mode === "single" ? (
            <Card>
              <CardHeader>
                <CardTitle>Single Recipient</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Phone Number *</Label>
                  <Input
                    placeholder="8801XXXXXXXXX"
                    value={singlePhone}
                    onChange={(e) => setSinglePhone(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Bulk Mode - Customer Selection */
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Select Customers</CardTitle>
                  <Button variant="outline" size="sm" onClick={handleSelectAll}>
                    {formData.customers.length === customers.length
                      ? "Deselect All"
                      : "Select All"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />

                {/* Selected Customers Summary */}
                {formData.customers.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-sm font-medium">
                      Selected ({formData.customers.length})
                    </div>
                    <div className="flex flex-wrap gap-2 p-2 border rounded-md max-h-32 overflow-y-auto">
                      {formData.customers.map((customer) => (
                        <div
                          key={customer.id}
                          className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs"
                        >
                          <span>{customer.name}</span>
                          <span className="font-mono">{customer.phone}</span>
                          <button
                            onClick={() => handleRemoveCustomer(customer.id)}
                            className="hover:text-blue-900 ml-1"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Customers Table - Using normal checkboxes */}
                <div className="border rounded-md max-h-80 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-50">
                      <tr>
                        <th className="p-2 text-left w-10">
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            checked={
                              filteredCustomers.length > 0 &&
                              filteredCustomers.every((c) =>
                                formData.customers.some((sc) => sc.id === c.id),
                              )
                            }
                            onChange={handleSelectAll}
                          />
                        </th>
                        <th className="p-2 text-left">Name</th>
                        <th className="p-2 text-left">Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.length > 0 ? (
                        filteredCustomers.map((customer) => (
                          <tr
                            key={customer.id}
                            className={`border-t cursor-pointer hover:bg-gray-50 ${
                              formData.customers.some(
                                (c) => c.id === customer.id,
                              )
                                ? "bg-blue-50"
                                : ""
                            }`}
                            onClick={() => handleCustomerSelect(customer)}
                          >
                            <td className="p-2">
                              <input
                                type="checkbox"
                                className="h-4 w-4"
                                checked={formData.customers.some(
                                  (c) => c.id === customer.id,
                                )}
                                onChange={() => handleCustomerSelect(customer)}
                              />
                            </td>
                            <td className="p-2">{customer.name}</td>
                            <td className="p-2 font-mono">{customer.phone}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
                            className="p-4 text-center text-gray-500"
                          >
                            {searchTerm
                              ? "No customers found"
                              : "No customers available"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Total Selected */}
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <span className="text-sm font-medium">Total Recipients:</span>
                  <Badge>{formData.selectedPhones.length}</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions & Send */}
          <Card>
            <CardHeader>
              <CardTitle>Send</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  className="bg-green-50 text-green-700 hover:bg-green-100"
                  onClick={() => handleQuickSend("offer")}
                  disabled={
                    sending ||
                    (formData.mode === "single" && !singlePhone) ||
                    (formData.mode === "bulk" &&
                      formData.selectedPhones.length === 0)
                  }
                >
                  As Offer
                </Button>
                <Button
                  variant="outline"
                  className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                  onClick={() => handleQuickSend("warning")}
                  disabled={
                    sending ||
                    (formData.mode === "single" && !singlePhone) ||
                    (formData.mode === "bulk" &&
                      formData.selectedPhones.length === 0)
                  }
                >
                  As Warning
                </Button>
                <Button
                  variant="outline"
                  className="bg-red-50 text-red-700 hover:bg-red-100"
                  onClick={() => handleQuickSend("alert")}
                  disabled={
                    sending ||
                    (formData.mode === "single" && !singlePhone) ||
                    (formData.mode === "bulk" &&
                      formData.selectedPhones.length === 0)
                  }
                >
                  As Alert
                </Button>
                <Button
                  variant="outline"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                  onClick={() => handleQuickSend("otp")}
                  disabled={
                    sending ||
                    (formData.mode === "single" && !singlePhone) ||
                    (formData.mode === "bulk" &&
                      formData.selectedPhones.length === 0)
                  }
                >
                  As OTP
                </Button>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => setShowPreview(true)}
                disabled={
                  sending ||
                  !formData.customMessage.trim() ||
                  (formData.mode === "single" && !singlePhone) ||
                  (formData.mode === "bulk" &&
                    formData.selectedPhones.length === 0) ||
                  characterCount > maxCharacters
                }
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={18} className="mr-2" />
                    Send SMS (
                    {formData.mode === "single"
                      ? "1"
                      : formData.selectedPhones.length}
                    )
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle>Preview SMS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="text-xs text-gray-500 mb-1">To:</div>
                  <div className="text-sm">
                    {formData.mode === "single"
                      ? formatPhoneNumber(singlePhone)
                      : `${formData.selectedPhones.length} recipient(s)`}
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-md">
                  <div className="text-xs text-gray-500 mb-1">Message:</div>
                  <div className="text-sm whitespace-pre-wrap">
                    {formData.customMessage}
                  </div>
                  <div className="text-xs text-right text-gray-500 mt-1">
                    {characterCount}/{maxCharacters}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPreview(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSendSMS}
                  disabled={sending}
                >
                  {sending ? "Sending..." : "Confirm Send"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
