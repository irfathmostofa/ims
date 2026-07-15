"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadImageToCloudinary } from "@/hook/uploadImageToCloudinary";
import { Building2, Eye, EyeOff } from "lucide-react";

type Props = {
  onSubmit: (data: { company: any; user: any }) => void;
  defaultValues?: any;
};

export default function CompanyForm({ onSubmit, defaultValues }: Props) {
  const {
    register,
    handleSubmit,

    setValue,
    watch,
  } = useForm({
    defaultValues: defaultValues || {
      name: "",
      address: "",
      phone: "",
      email: "",
      website: "",
      logo: null,
      username: "",
      user_phone: "",
      password: "",
      confirm_password: "",
    },
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const password = watch("password");

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.loading("Uploading logo...");
      const uploadedUrl = await uploadImageToCloudinary(file);
      toast.dismiss();

      if (uploadedUrl) {
        setValue("logo", uploadedUrl);
        setLogoPreview(uploadedUrl);
        toast.success("Logo uploaded!");
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Logo upload failed");
    }
  };

  const handleRemoveLogo = () => {
    setValue("logo", null);
    setLogoPreview(null);
  };

  const onFormSubmit = async (formData: any) => {
    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords don't match");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const companyData = {
        name: formData.name,
        address: formData.address,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        logo: formData.logo || null,
        username: formData.username,
        user_phone: formData.user_phone || null,
        password_hash: formData.password,
      };

      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/setup/companies`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(companyData),
        },
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to setup company");
      }

      const response = await res.json();
      const company = response.data;

      toast.success("Company setup complete!");

      onSubmit({
        company: company,
        user: {
          username: formData.username || formData.email.split("@")[0],
          phone: formData.user_phone || formData.phone,
          email: formData.email,
        },
      });
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Logo Upload - Minimal */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 overflow-hidden flex items-center justify-center hover:border-blue-400 transition-colors">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 className="w-6 h-6 text-gray-400" />
            )}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleLogoChange}
            />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-700">Company Logo</p>
          <p className="text-xs text-gray-500">Click to upload (optional)</p>
          {logoPreview && (
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="text-xs text-red-500 hover:underline mt-1"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Company Details */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name *
          </label>
          <Input
            placeholder="Enter company name"
            {...register("name", { required: "Company name is required" })}
            className="h-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <Input
              type="email"
              placeholder="company@email.com"
              {...register("email", { required: "Email is required" })}
              className="h-10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <Input
              placeholder="+1 234 567 890"
              {...register("phone")}
              className="h-10"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Enter your business address"
            rows={2}
            {...register("address")}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Website
          </label>
          <Input
            placeholder="https://yourwebsite.com"
            {...register("website")}
            className="h-10"
          />
        </div>
      </div>

      <hr className="my-6" />

      {/* Admin Account */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Admin Account
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username *
            </label>
            <Input
              placeholder="Choose a username"
              {...register("username", { required: "Username is required" })}
              className="h-10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone (Optional)
            </label>
            <Input
              placeholder="Enter phone number"
              {...register("user_phone")}
              className="h-10"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 6, message: "Minimum 6 characters" },
                  })}
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  {...register("confirm_password", {
                    required: "Please confirm password",
                  })}
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
          {password && password.length > 0 && password.length < 6 && (
            <p className="text-xs text-red-500">
              Password must be at least 6 characters
            </p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={loading}
        className="w-full h-11 bw-primary text-white font-medium rounded-lg transition-colors"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Setting up...
          </span>
        ) : (
          "Continue →"
        )}
      </Button>
    </form>
  );
}
