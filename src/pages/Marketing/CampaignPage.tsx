// src/pages/Marketing/MarketingList.tsx
"use client";

import { useState, useEffect } from "react";
import { Pen, Trash, Plus, Info } from "lucide-react";
import { DataTable } from "@/components/ui/dataTable";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCrud } from "@/hook/crudHelper";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// src/types/marketing.ts
interface MarketingMessage {
  id: number;
  code: string;
  campaign_name: string;
  title: string;
  content: string;
  template_name?: string;
  status: "draft" | "active" | "archived";
  created_at: string;
  created_by: number;
  user_name?: string;
}

export default function CampaignPage() {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] =
    useState<MarketingMessage | null>(null);
  const [form, setForm] = useState<Partial<MarketingMessage>>({
    status: "draft", // Set default status
  });
  const [update, setUpdate] = useState(0);

  // CRUD hook for Marketing Messages
  const { fetchAll, save, remove } = useCrud<MarketingMessage>({
    listUrl: `${import.meta.env.VITE_SERVER}/marketing/get-marketing-msg`,
    listMethod: "POST",
    listPayload: { page: 1, limit: 1000 },
    createUrl: `${import.meta.env.VITE_SERVER}/marketing/create-marketing-msg`,
    updateUrl: `${import.meta.env.VITE_SERVER}/marketing/update-marketing-msg`,
    deleteUrl: `${import.meta.env.VITE_SERVER}/marketing/delete-marketing-msg`,
    formatCreate: (data) => data,
    formatUpdate: (data) => data,
  });

  // Fetch messages
  useEffect(() => {
    fetchAll(setMessages, setLoading);
  }, [update]);

  const [messages, setMessages] = useState<MarketingMessage[]>([]);

  // Handle Save (create/update)
  const handleSave = async () => {
    if (!form.campaign_name || !form.title || !form.content) {
      toast.error("Campaign Name, Title, and Content are required");
      return;
    }

    await save(form, form.id);
    resetForm();
    setOpen(false);
    setUpdate((prev) => prev + 1);
  };

  // Reset form to default values
  const resetForm = () => {
    setForm({
      status: "draft",
    });
  };

  // Handle dialog open/close
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      resetForm(); // Clear form when dialog closes
    }
  };

  // Handle Edit
  const handleEdit = (message: MarketingMessage) => {
    setForm(message);
    setOpen(true);
  };

  // Handle Delete
  const handleDelete = async (message: MarketingMessage) => {
    if (!confirm(`Delete Marketing Message "${message.title}"?`)) return;
    await remove(message.id);
    setUpdate((prev) => prev + 1);
  };

  // Handle View Details
  const handleViewDetails = (message: MarketingMessage) => {
    setSelectedMessage(message);
    setViewDialogOpen(true);
  };

  // Handle View Details dialog close
  const handleViewDialogClose = () => {
    setViewDialogOpen(false);
    setSelectedMessage(null); // Clear selected message
  };

  // Format status badge
  const StatusBadge = ({ status }: { status: string }) => {
    const getStatusColor = () => {
      switch (status) {
        case "active":
          return "bg-green-100 text-green-800 border-green-200";
        case "draft":
          return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "archived":
          return "bg-gray-100 text-gray-800 border-gray-200";
        default:
          return "bg-gray-100 text-gray-800 border-gray-200";
      }
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}
      >
        {status.toUpperCase()}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Marketing Messages</h1>

        {/* Add/Edit Dialog Trigger */}
        <Dialog open={open} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button
              className="flex items-center gap-2 btn-bw-primary"
              onClick={() => resetForm()} // Reset form when clicking add button
            >
              <Plus size={18} /> Create Message
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle>
                {form.id
                  ? "Edit Marketing Message"
                  : "Create Marketing Message"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaign_name">Campaign Name *</Label>
                  <input
                    id="campaign_name"
                    type="text"
                    placeholder="Enter campaign name"
                    className="border px-3 py-2 rounded w-full"
                    value={form.campaign_name || ""}
                    onChange={(e) =>
                      setForm({ ...form, campaign_name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <input
                    id="title"
                    type="text"
                    placeholder="Enter message title"
                    className="border px-3 py-2 rounded w-full"
                    value={form.title || ""}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template_name">
                    Template Name (WhatsApp)
                  </Label>
                  <input
                    id="template_name"
                    type="text"
                    placeholder="WhatsApp template name"
                    className="border px-3 py-2 rounded w-full"
                    value={form.template_name || ""}
                    onChange={(e) =>
                      setForm({ ...form, template_name: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={form.status || "draft"}
                    onValueChange={(value) =>
                      setForm({ ...form, status: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Message Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Enter your message content here. Use {{variable}} for placeholders."
                  className="border px-3 py-2 rounded w-full min-h-[150px]"
                  value={form.content || ""}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                />
                <p className="text-sm text-gray-500">
                  Use &#123;&#123;variable_name&#125;&#125; syntax for dynamic
                  content
                </p>
              </div>

              {/* Preview Section */}
              <div className="space-y-2">
                <Label>Preview</Label>
                <div className="border rounded-lg p-4 bg-gray-50 min-h-[100px]">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {form.content || "Message content will appear here..."}
                  </p>
                  {form.content?.includes("{{") && (
                    <div className="mt-2 pt-2 border-t">
                      <p className="text-sm text-gray-500">
                        Variables detected:{" "}
                        {Array.from(
                          new Set(form.content.match(/\{\{([^}]+)\}\}/g) || []),
                        )
                          .map((v) => v.replace(/[{}]/g, ""))
                          .join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="btn-bw-primary">
                {form.id ? "Update" : "Create"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Marketing Messages Table */}
      <DataTable
        data={messages}
        label="Marketing Messages"
        showColumns={[
          "code",
          "campaign_name",
          "title",
          "template_name",
          "status",
          "created_at",
        ]}
        loading={loading}
        rowsPerPage={10}
        selectable
        printHead={[
          { label: "Code", value: "code" },
          { label: "Campaign", value: "campaign_name" },
          { label: "Title", value: "title" },
          { label: "Template", value: "template_name" },
          { label: "Status", value: "status" },
          { label: "Created", value: "created_at" },
        ]}
        columnFormats={{
          status: (value) => <StatusBadge status={value} />,
          created_at: (value) => new Date(value).toLocaleDateString(),
        }}
        actions={[
          {
            label: <Info size={16} />,
            onClick: (row) => handleViewDetails(row),
            title: "View Details",
          },
          {
            label: <Pen size={16} />,
            onClick: (row) => handleEdit(row),
            title: "Edit",
          },
          {
            label: <Trash size={16} />,
            onClick: (row) => handleDelete(row),
            title: "Delete",
          },
        ]}
      />

      {/* View Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={handleViewDialogClose}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info size={20} className="text-blue-600" />
              Campaign Details
            </DialogTitle>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
              {/* Header Section */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedMessage.title}
                  </h3>
                  <p className="text-gray-600">
                    {selectedMessage.campaign_name}
                  </p>
                </div>
                <div className="text-right">
                  <Badge
                    variant={
                      selectedMessage.status === "active"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {selectedMessage.status.toUpperCase()}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-1">
                    Code: {selectedMessage.code}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-500 text-sm">Template Name</Label>
                  <p className="font-medium">
                    {selectedMessage.template_name || "Not specified"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-gray-500 text-sm">Created At</Label>
                  <p className="font-medium">
                    {formatDate(selectedMessage.created_at)}
                  </p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-gray-500 text-sm">
                    Message Content
                  </Label>
                  <div className="border rounded-lg p-4 bg-gray-50 min-h-[100px]">
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {selectedMessage.content}
                    </p>
                  </div>
                </div>
              </div>

              {/* Variables Section */}
              {selectedMessage.content?.includes("{{") && (
                <div className="space-y-2">
                  <Label className="text-gray-500 text-sm">
                    Detected Variables
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(
                      new Set(
                        selectedMessage.content.match(/\{\{([^}]+)\}\}/g) || [],
                      ),
                    )
                      .map((variable) => variable.replace(/[{}]/g, ""))
                      .map((variable, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-blue-50"
                        >
                          &#123;&#123;{variable}&#125;&#125;
                        </Badge>
                      ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    These variables will be replaced with actual values during
                    sending
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    handleViewDialogClose();
                    handleEdit(selectedMessage);
                  }}
                  className="flex-1"
                >
                  <Pen size={16} className="mr-2" />
                  Edit Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
