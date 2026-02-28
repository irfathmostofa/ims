// src/pages/Marketing/SendMessagePage.tsx
"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Plus, X, Users, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { apiClient } from "@/hook/apiClient";
import { useQuickStore } from "@/store/quickStore";

// Customer type
interface Customer {
  id: number;
  name: string;
  phone: string;
}

// Campaign/Marketing Message type
interface Campaign {
  id: number;
  title: string;
  content: string;
  status: string;
  created_at: string;
  template_name?: string;
  variables?: string[];
}

export default function SendMessagePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(
    null,
  );
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);
  const { fetchParty, Party } = useQuickStore();

  // Send mode: 'single' or 'bulk'
  const [sendMode, setSendMode] = useState<"single" | "bulk">("single");

  // Single mode fields
  const [singlePhone, setSinglePhone] = useState("");

  // Bulk mode fields
  const [bulkPhones, setBulkPhones] = useState<string[]>([]);
  const [newPhone, setNewPhone] = useState("");

  // Common fields
  const [partyId, setPartyId] = useState("");

  // Load campaigns and customers
  useEffect(() => {
    fetchCampaigns();
    fetchParty({ type: "CUSTOMER", limit: 100000000 });
  }, []);

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
          setSelectedCampaign(response.data[0]);
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load campaigns");
      navigate("/send-sms");
    } finally {
      setLoading(false);
    }
  };

  // Handle campaign selection
  const handleCampaignSelect = (campaignId: string) => {
    const campaign = campaigns.find((c) => c.id.toString() === campaignId);
    if (campaign) {
      setSelectedCampaign(campaign);
    }
  };

  // Extract variables from message content
  const extractVariables = (content: string) => {
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = content.match(regex);
    return matches ? [...new Set(matches)] : [];
  };

  // Add phone to bulk list
  const handleAddPhone = () => {
    if (!newPhone.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    // Clean phone number (remove spaces, dashes, parentheses)
    const cleanedPhone = newPhone.replace(/[\s\-()]/g, "");

    const phoneRegex = /^[0-9+]{10,}$/;
    if (!phoneRegex.test(cleanedPhone)) {
      toast.error("Please enter a valid phone number (min 10 digits)");
      return;
    }

    if (bulkPhones.includes(cleanedPhone)) {
      toast.error("Phone number already added");
      return;
    }

    setBulkPhones([...bulkPhones, cleanedPhone]);
    setNewPhone("");
  };

  // const handleRemovePhone = (index: number) => {
  //   setBulkPhones(bulkPhones.filter((_, i) => i !== index));
  // };

  // Remove phone chip
  const handleRemovePhoneChip = (phoneToRemove: string) => {
    setBulkPhones(bulkPhones.filter((phone) => phone !== phoneToRemove));
  };

  // Handle customer selection
  const handleCustomerSelect = (customer: Customer) => {
    if (selectedCustomers.find((c) => c.id === customer.id)) {
      // Remove if already selected
      setSelectedCustomers(
        selectedCustomers.filter((c) => c.id !== customer.id),
      );
      // Also remove from bulk phones if exists
      setBulkPhones(bulkPhones.filter((phone) => phone !== customer.phone));
    } else {
      // Add to selected
      setSelectedCustomers([...selectedCustomers, customer]);
      // Also add to bulk phones if not already there
      if (!bulkPhones.includes(customer.phone)) {
        setBulkPhones([...bulkPhones, customer.phone]);
      }
    }
  };

  // Add all customers to bulk list
  const handleAddAllCustomers = () => {
    if (!Party || Party.length === 0) {
      toast.error("No customers available");
      return;
    }

    const allCustomerPhones = Party.map((customer) => customer.phone);
    const uniqueNewPhones = allCustomerPhones.filter(
      (phone) => !bulkPhones.includes(phone),
    );

    if (uniqueNewPhones.length === 0) {
      toast.info("All customers are already added");
      return;
    }

    setBulkPhones([...bulkPhones, ...uniqueNewPhones]);
    setSelectedCustomers([...Party]); // Select all customers
    toast.success(`Added ${uniqueNewPhones.length} customer(s) to recipients`);
  };

  // Clear all selected customers
  const handleClearAllCustomers = () => {
    // Remove all customer phones from bulk list
    const customerPhones = selectedCustomers.map((c) => c.phone);
    setBulkPhones(
      bulkPhones.filter((phone) => !customerPhones.includes(phone)),
    );
    setSelectedCustomers([]);
    toast.info("Cleared all selected customers");
  };

  // Handle send message
  const handleSend = async () => {
    if (!selectedCampaign) {
      toast.error("Please select a campaign");
      return;
    }

    // Combine bulk phones and selected customer phones
    let allPhones = [...bulkPhones];

    // Add phones from selected customers that aren't already in bulkPhones
    selectedCustomers.forEach((customer) => {
      if (!allPhones.includes(customer.phone)) {
        allPhones.push(customer.phone);
      }
    });

    // Remove duplicates
    allPhones = [...new Set(allPhones)];

    // Validation
    if (sendMode === "single" && !singlePhone.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    if (sendMode === "bulk" && allPhones.length === 0) {
      toast.error("Please add at least one phone number");
      return;
    }

    // Prepare payload based on mode
    const payload: any = {
      mode: sendMode,
      message_id: selectedCampaign.id,
    };

    if (sendMode === "single") {
      payload.phone = singlePhone;
    } else {
      payload.phones = allPhones;
    }

    if (partyId) {
      payload.party_id = partyId;
    }

    console.log(
      "Sending to phones:",
      sendMode === "bulk" ? allPhones : singlePhone,
    );
    console.log(
      "Total recipients:",
      sendMode === "bulk" ? allPhones.length : 1,
    );

    try {
      setSending(true);
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/marketing/send-msg`,
        {
          method: "POST",
          tokenType: "jwt",
          data: payload,
        },
      );
      console.log(response);
      if (response.success) {
        toast.success(
          `Message sent successfully! ` +
            `Sent: ${response.summary?.successful || 0}, ` +
            `Failed: ${response.summary?.failed || 0}`,
        );

        // Reset form
        setSinglePhone("");
        setBulkPhones([]);
        setNewPhone("");
        setPartyId("");
        setSelectedCustomers([]);
      } else {
        throw new Error(response.message || "Failed to send message");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Campaign Selection and Preview */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Campaign</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="campaign-select">Choose a Campaign</Label>
                <select
                  id="campaign-select"
                  className="w-full p-2 border rounded-md"
                  value={selectedCampaign?.id || ""}
                  onChange={(e) => handleCampaignSelect(e.target.value)}
                >
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.title} ({campaign.status})
                    </option>
                  ))}
                </select>
              </div>

              {selectedCampaign && (
                <div className="space-y-3 pt-4 border-t">
                  <div>
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="mt-1">
                      <Badge
                        variant={
                          selectedCampaign.status === "active"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {selectedCampaign.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm text-gray-600">
                      {formatDate(selectedCampaign.created_at)}
                    </p>
                  </div>
                  {selectedCampaign.template_name && (
                    <div>
                      <Label className="text-sm font-medium">
                        Template Name
                      </Label>
                      <p className="text-sm text-gray-600 font-mono">
                        {selectedCampaign.template_name}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Message Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-gray-50 min-h-[150px]">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedCampaign?.content || "Select a campaign to preview"}
                </p>
              </div>

              {selectedCampaign?.content && (
                <div className="mt-4">
                  <Label className="text-gray-500 text-sm">
                    Variables Detected
                  </Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {extractVariables(selectedCampaign.content).map(
                      (variable, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-blue-50"
                        >
                          {variable}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Send Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Send Mode Selection */}
              <div className="space-y-4">
                <Label>Select Send Mode</Label>
                <div className="flex gap-2">
                  <Button
                    variant={sendMode === "single" ? "default" : "outline"}
                    onClick={() => setSendMode("single")}
                    className="flex-1"
                  >
                    <Phone size={16} className="mr-2" />
                    Single Number
                  </Button>
                  <Button
                    variant={sendMode === "bulk" ? "default" : "outline"}
                    onClick={() => setSendMode("bulk")}
                    className="flex-1"
                  >
                    <Users size={16} className="mr-2" />
                    Multiple Numbers
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Single Mode Form */}
              {sendMode === "single" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      placeholder="+919876543210"
                      value={singlePhone}
                      onChange={(e) => setSinglePhone(e.target.value)}
                    />
                    <p className="text-sm text-gray-500">
                      Enter phone number with country code (e.g., +91 for India)
                    </p>
                  </div>
                </div>
              )}

              {/* Bulk Mode Form */}
              {sendMode === "bulk" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Add Phone Numbers</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="+919876543210"
                        value={newPhone}
                        onChange={(e) => setNewPhone(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddPhone();
                          }
                        }}
                      />
                      <Button onClick={handleAddPhone}>
                        <Plus size={18} />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      Enter phone number and press Add or Enter
                    </p>
                  </div>

                  {/* Phone Numbers Chips */}
                  {bulkPhones.length > 0 && (
                    <div className="space-y-2">
                      <Label>Phone Numbers ({bulkPhones.length})</Label>
                      <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-gray-50">
                        {bulkPhones.map((phone, index) => (
                          <div
                            key={index}
                            className="inline-flex items-center gap-2 bg-white border rounded-full px-3 py-1 text-sm"
                          >
                            <span>{phone}</span>
                            <button
                              type="button"
                              onClick={() => handleRemovePhoneChip(phone)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Send Button */}
              <div className="pt-4">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSend}
                  disabled={
                    sending ||
                    !selectedCampaign ||
                    selectedCampaign?.status !== "active" ||
                    (sendMode === "single" && !singlePhone) ||
                    (sendMode === "bulk" &&
                      bulkPhones.length === 0 &&
                      selectedCustomers.length === 0)
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
                      Send Message
                    </>
                  )}
                </Button>

                {selectedCampaign?.status !== "active" && (
                  <p className="text-center text-sm text-red-500 mt-2">
                    Only active campaigns can be sent. Please select an active
                    campaign.
                  </p>
                )}

                {sendMode === "bulk" && (
                  <p className="text-center text-sm text-gray-500 mt-2">
                    {selectedCustomers.length > 0 && bulkPhones.length > 0
                      ? `This will send the message to ${selectedCustomers.length} selected customer(s) and ${bulkPhones.length} additional phone number(s)`
                      : selectedCustomers.length > 0
                        ? `This will send the message to ${selectedCustomers.length} selected customer(s)`
                        : bulkPhones.length > 0
                          ? `This will send the message to ${bulkPhones.length} recipient(s)`
                          : "Add phone numbers or select customers to send messages"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Customer Selection Card */}
          {Party && Party.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Select Customers</CardTitle>
                {sendMode === "bulk" && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddAllCustomers}
                      disabled={selectedCustomers.length === Party.length}
                    >
                      <Users size={14} className="mr-1" />
                      Select All
                    </Button>
                    {selectedCustomers.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearAllCustomers}
                      >
                        <X size={14} className="mr-1" />
                        Clear All
                      </Button>
                    )}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-gray-50">
                      <tr>
                        <th className="text-left p-2 border-b">Select</th>
                        <th className="text-left p-2 border-b">Name</th>
                        <th className="text-left p-2 border-b">Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Party.map((customer) => (
                        <tr
                          key={customer.id}
                          className={`hover:bg-gray-50 cursor-pointer ${
                            selectedCustomers.some((c) => c.id === customer.id)
                              ? "bg-blue-50"
                              : ""
                          }`}
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          <td className="p-2 border-b">
                            <input
                              type="checkbox"
                              checked={selectedCustomers.some(
                                (c) => c.id === customer.id,
                              )}
                              onChange={() => handleCustomerSelect(customer)}
                              className="h-4 w-4"
                            />
                          </td>
                          <td className="p-2 border-b">{customer.name}</td>
                          <td className="p-2 border-b">{customer.phone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {selectedCustomers.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <Label className="text-sm font-medium">
                      Selected Customers ({selectedCustomers.length})
                    </Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1 text-sm"
                        >
                          <span>
                            {customer.name} ({customer.phone})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCustomerSelect(customer)}
                            className="text-blue-400 hover:text-blue-600"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      These customers' phone numbers are automatically added to
                      the recipients list.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
