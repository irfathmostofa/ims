// src/pages/Marketing/SendMessagePage.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, Plus, Trash, Upload } from "lucide-react";
import { DataTable } from "@/components/ui/dataTable";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { apiClient } from "@/hook/apiClient";

// Customer type (if you have customers in your system)
interface Customer {
  id: number;
  name: string;
  phone: string;
}

export default function SendMessagePage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<any>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = useState<Customer[]>([]);

  // Send mode: 'single' or 'bulk'
  const [sendMode, setSendMode] = useState<"single" | "bulk">("single");

  // Single mode fields
  const [singlePhone, setSinglePhone] = useState("");

  // Bulk mode fields
  const [bulkPhones, setBulkPhones] = useState<string[]>([]);
  const [newPhone, setNewPhone] = useState("");

  // Common fields
  const [partyId, setPartyId] = useState("");

  // Load message details
  useEffect(() => {
    fetchMessage();
    // Optional: Fetch customers if you have a customer list
    // fetchCustomers();
  }, []);

  const fetchMessage = async () => {
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

      if (response.success && response.data?.data?.length > 0) {
        setMessage(response.data.data[0]);

        if (response.data.data[0].status !== "active") {
          toast.error(
            "This message is not active. Only active messages can be sent.",
          );
          navigate("/send-sms");
        }
      } else {
        toast.error("Message not found");
        navigate("/send-sms");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load message");
      navigate("/send-sms");
    } finally {
      setLoading(false);
    }
  };

  // Optional: Fetch customers from your system
  const fetchCustomers = async () => {
    try {
      // Replace with your actual customer API endpoint
      const response = await apiClient(
        `${import.meta.env.VITE_SERVER}/party/get-party`,
        {
          method: "POST",
          tokenType: "jwt",
          data: { type: "CUSTOMER" },
        },
      );

      if (response.success && response.data?.data) {
        setCustomers(response.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch customers:", err);
    }
  };

  // Add phone to bulk list
  const handleAddPhone = () => {
    if (!newPhone.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    const phoneRegex = /^[0-9+\s\-()]{10,}$/;
    if (!phoneRegex.test(newPhone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    if (bulkPhones.includes(newPhone)) {
      toast.error("Phone number already added");
      return;
    }

    setBulkPhones([...bulkPhones, newPhone]);
    setNewPhone("");
  };

  const handleRemovePhone = (index: number) => {
    setBulkPhones(bulkPhones.filter((_, i) => i !== index));
  };

  // Handle file upload for bulk numbers
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const lines = content
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line && /^[0-9+\s\-()]{10,}$/.test(line));

        if (lines.length > 0) {
          setBulkPhones([...new Set([...bulkPhones, ...lines])]); // Remove duplicates
          toast.success(`Added ${lines.length} phone numbers`);
        } else {
          toast.error("No valid phone numbers found in file");
        }
      } catch (error) {
        toast.error("Failed to parse file");
      }
    };
    reader.readAsText(file);
  };

  // Handle customer selection
  const handleCustomerSelect = (customer: Customer) => {
    if (selectedCustomers.find((c) => c.id === customer.id)) {
      // Remove if already selected
      setSelectedCustomers(
        selectedCustomers.filter((c) => c.id !== customer.id),
      );
    } else {
      // Add to selected
      setSelectedCustomers([...selectedCustomers, customer]);
    }
  };

  // Handle send message
  const handleSend = async () => {
    // Validation
    if (sendMode === "single" && !singlePhone.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    if (sendMode === "bulk" && bulkPhones.length === 0) {
      toast.error("Please add at least one phone number");
      return;
    }

    // Prepare payload based on mode
    const payload: any = {
      mode: sendMode,
    };

    if (sendMode === "single") {
      payload.phone = singlePhone;
    } else {
      payload.phones = bulkPhones;
    }

    if (partyId) {
      payload.party_id = partyId;
    }

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

        // Optionally navigate to history
        // navigate(`/marketing/history/${id}`);
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
          <p className="mt-4 text-gray-600">Loading message details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/marketing")}
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Send Message</h1>
            <p className="text-gray-600">Campaign: {message?.campaign_name}</p>
          </div>
        </div>
        <Badge variant={message?.status === "active" ? "default" : "secondary"}>
          {message?.status?.toUpperCase() || "DRAFT"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Message Preview */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Message Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-500 text-sm">Code</Label>
                <p className="font-medium">{message?.code}</p>
              </div>

              <div>
                <Label className="text-gray-500 text-sm">Title</Label>
                <p className="font-medium">{message?.title}</p>
              </div>

              <div>
                <Label className="text-gray-500 text-sm">Template</Label>
                <p className="font-medium">
                  {message?.template_name || "Not specified"}
                </p>
              </div>

              <div>
                <Label className="text-gray-500 text-sm">Created</Label>
                <p className="font-medium">
                  {formatDate(message?.created_at || "")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Message Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-gray-50 min-h-[100px]">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {message?.content}
                </p>
              </div>

              {message?.content?.includes("{{") && (
                <div className="mt-4">
                  <Label className="text-gray-500 text-sm">
                    Variables Detected
                  </Label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {Array.from(
                      new Set(message.content.match(/\{\{([^}]+)\}\}/g) || []),
                    ).map((variable, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="bg-blue-50"
                      >
                        0
                      </Badge>
                    ))}
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
                    Single Number
                  </Button>
                  <Button
                    variant={sendMode === "bulk" ? "default" : "outline"}
                    onClick={() => setSendMode("bulk")}
                    className="flex-1"
                  >
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
                      placeholder="+1234567890"
                      value={singlePhone}
                      onChange={(e) => setSinglePhone(e.target.value)}
                    />
                    <p className="text-sm text-gray-500">
                      Enter phone number with country code
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
                        placeholder="+1234567890"
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

                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label>Or Upload File</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept=".txt,.csv"
                        onChange={handleFileUpload}
                        className="cursor-pointer"
                      />
                      <Upload size={18} className="text-gray-500" />
                    </div>
                    <p className="text-sm text-gray-500">
                      Upload .txt or .csv file with one phone number per line
                    </p>
                  </div>

                  {/* Phone Numbers List */}
                  {bulkPhones.length > 0 && (
                    <div className="space-y-2">
                      <Label>Phone Numbers ({bulkPhones.length})</Label>
                      <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                        {bulkPhones.map((phone, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between py-2 border-b last:border-b-0"
                          >
                            <span className="text-sm font-mono">{phone}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemovePhone(index)}
                            >
                              <Trash size={14} className="text-red-500" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Party ID (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="party_id">Party ID (Optional)</Label>
                <Input
                  id="party_id"
                  placeholder="Enter party/customer ID"
                  value={partyId}
                  onChange={(e) => setPartyId(e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Link this message to a specific customer record
                </p>
              </div>

              {/* Send Button */}
              <div className="pt-4 border-t">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleSend}
                  disabled={sending || message?.status !== "active"}
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

                {message?.status !== "active" && (
                  <p className="text-center text-sm text-red-500 mt-2">
                    Only active messages can be sent. Please activate this
                    message first.
                  </p>
                )}

                {sendMode === "bulk" && bulkPhones.length > 0 && (
                  <p className="text-center text-sm text-gray-500 mt-2">
                    This will send the message to {bulkPhones.length}{" "}
                    recipient(s)
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Optional: Customer Selection Card */}
          {customers.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Select Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-60 overflow-y-auto">
                  <DataTable
                    data={customers}
                    label="Customers"
                    showColumns={["name", "phone"]}
                    loading={false}
                    rowsPerPage={5}
                    selectable
                   
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips Card */}
          <Card>
            <CardHeader>
              <CardTitle>Tips for Sending</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 mr-2"></div>
                  <span>
                    Make sure the WhatsApp template name matches exactly with
                    your Business account
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 mr-2"></div>
                  <span>
                    Phone numbers must include country code (e.g., +91 for
                    India)
                  </span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 mr-2"></div>
                  <span>Test with a single number before sending in bulk</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 mr-2"></div>
                  <span>
                    Bulk sending may take time depending on the number of
                    recipients
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
