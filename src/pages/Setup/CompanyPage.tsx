"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Company = {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  website?: string;
  tagline?: string;
  currency?: string;
  logoUrl?: string;
};

export default function CompanyProfilePage() {
  const [company, setCompany] = useState<Company>({
    id: 1,
    name: "My Company",
    email: "info@mycompany.com",
    phone: "123456789",
    address: "123 Main St, City",
    taxId: "TAX-001",
    website: "https://mycompany.com",
    tagline: "We deliver excellence",
    currency: "USD",
    logoUrl: "",
  });

  const [editMode, setEditMode] = useState(false);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      setCompany({ ...company, logoUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  const handleUpdate = () => {
    if (!company.name) {
      alert("Company name is required");
      return;
    }
    console.log("Updated Company:", company);
    alert("Company profile updated successfully!");
    setEditMode(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-lg space-y-6">
      {/* Logo & Name */}
      <div className="flex flex-col items-center space-y-3 relative">
        <div className="relative group">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt="Company Logo"
              className="w-32 h-32 object-cover rounded-full border-4 border-gradient-to-r from-orange-300 via-pink-300 to-purple-400 shadow-lg transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-32 h-32 flex items-center justify-center rounded-full border-4 border-dashed border-gray-300 text-gray-400 text-xl shadow-lg">
              Logo
            </div>
          )}

          {editMode && (
            <label className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer rounded-full transition-opacity">
              Change Logo
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        <h2 className="text-2xl font-bold text-gray-900">{company.name}</h2>
        <p className="text-gray-600 italic">{company.tagline}</p>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-500">Email</label>
          {editMode ? (
            <Input
              value={company.email || ""}
              onChange={(e) =>
                setCompany({ ...company, email: e.target.value })
              }
            />
          ) : (
            <p className="text-gray-700">{company.email || "-"}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Phone</label>
          {editMode ? (
            <Input
              value={company.phone || ""}
              onChange={(e) =>
                setCompany({ ...company, phone: e.target.value })
              }
            />
          ) : (
            <p className="text-gray-700">{company.phone || "-"}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Website</label>
          {editMode ? (
            <Input
              value={company.website || ""}
              onChange={(e) =>
                setCompany({ ...company, website: e.target.value })
              }
            />
          ) : (
            <p className="text-gray-700">{company.website || "-"}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Tax ID</label>
          {editMode ? (
            <Input
              value={company.taxId || ""}
              onChange={(e) =>
                setCompany({ ...company, taxId: e.target.value })
              }
            />
          ) : (
            <p className="text-gray-700">{company.taxId || "-"}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-medium text-gray-500">Address</label>
          {editMode ? (
            <Input
              value={company.address || ""}
              onChange={(e) =>
                setCompany({ ...company, address: e.target.value })
              }
            />
          ) : (
            <p className="text-gray-700">{company.address || "-"}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Currency</label>
          {editMode ? (
            <Input
              value={company.currency || ""}
              onChange={(e) =>
                setCompany({ ...company, currency: e.target.value })
              }
            />
          ) : (
            <p className="text-gray-700">{company.currency || "-"}</p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-500">Tagline</label>
          {editMode ? (
            <Input
              value={company.tagline || ""}
              onChange={(e) =>
                setCompany({ ...company, tagline: e.target.value })
              }
            />
          ) : (
            <p className="text-gray-700 italic">{company.tagline || "-"}</p>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        {editMode ? (
          <Button className="btn-peach" onClick={handleUpdate}>
            Save Changes
          </Button>
        ) : (
          <Button className="btn-peach" onClick={() => setEditMode(true)}>
            Edit Profile
          </Button>
        )}
      </div>
    </div>
  );
}
