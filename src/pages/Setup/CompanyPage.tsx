"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/hook/apiClient";
import { toast } from "sonner";
import LogoUploader from "@/hook/uploadImageFile";

type Company = {
  id: number;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  website?: string;
  status?: string;
};

export default function CompanyProfilePage() {
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const data = await apiClient(
        `${import.meta.env.VITE_SERVER}/setup/get-companies`,
        {
          method: "GET",
          tokenType: "jwt",
        }
      );

      if (data.data && data.data.length > 0) {
        setCompany(data.data[0]);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to fetch companies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompany();
  }, []);

  const handleUpdate = async () => {
    if (!company) return;
    if (!company.name) {
      toast.error("Company name is required");
      return;
    }
    try {
      // You can call your API to update here
      const updateData = {
        code: company.code,
        name: company.name,
        address: company.address,
        phone: company.phone,
        email: company.email,
        logo: company.logo,
        website: company.website,
      };
      await apiClient(
        `${import.meta.env.VITE_SERVER}/setup/update-companies/${company.id}`,
        {
          method: "POST",
          data: updateData,
          tokenType: "jwt",
        }
      );

      toast.success("Company profile updated successfully!");
      setEditMode(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Update failed");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center mt-20 space-y-4">
        <div className="w-12 h-12 border-4 border-t-[#111827] border-gray-300 rounded-full animate-spin"></div>
        <p className="text-gray-600 text-lg font-medium">Loading company...</p>
      </div>
    );
  }

  if (!company) {
    return <p className="text-center text-gray-500 mt-10">No company found</p>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-lg space-y-6">
      {/* Logo & Name */}
      <div className="flex flex-col items-center space-y-3 relative">
        <LogoUploader
          initialLogo={company.logo}
          disabled={!editMode}
          onChange={(newLogo) => setCompany({ ...company, logo: newLogo })}
        />

        <h2 className="text-2xl font-bold text-gray-900">{company.name}</h2>
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
      </div>

      {/* Action Button */}
      <div className="flex justify-center">
        {editMode ? (
          <div className="flex gap-4">
            {" "}
            <Button
              className="btn-peach"
              onClick={() => {
                setEditMode(false);
              }}
            >
              Cancel
            </Button>
            <Button className="btn-peach" onClick={handleUpdate}>
              Save Changes
            </Button>
          </div>
        ) : (
          <Button className="btn-peach" onClick={() => setEditMode(true)}>
            Edit Profile
          </Button>
        )}
      </div>
    </div>
  );
}
