"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  onNext: (data: any) => void;
  defaultValues?: any;
};

export default function CompanyForm({ onNext, defaultValues }: Props) {
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: defaultValues || {},
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
      if (defaultValues.logo) setLogoPreview(defaultValues.logo);
    }
  }, [defaultValues, reset]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("logo", file); // ✅ store single File
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveLogo = () => {
    setValue("logo", null);
    setLogoPreview(null);
  };

  const onSubmit = async (formDataValues: any) => {
    if (!formDataValues.logo && !defaultValues?.logo) {
      return toast.error("Please upload a logo");
    }

    setLoading(true);

    try {
      const formData = new FormData();

      // append logo if new file selected
      if (formDataValues.logo instanceof File) {
        formData.append("logo", formDataValues.logo);
      }

      // append other fields
      ["name", "address", "phone", "email", "website"].forEach((field) => {
        if (formDataValues[field])
          formData.append(field, formDataValues[field]);
      });

      const res = await fetch(
        `${import.meta.env.VITE_SERVER}/setup/create-company`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) throw new Error("Failed to save company");

      const data = await res.json();
      toast.success("Company saved successfully!");
      onNext(data);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Logo Upload */}
      <div className="flex flex-col items-center gap-2 py-4 bg-gray-50 rounded-lg border border-gray-200">
        <label className="cursor-pointer flex flex-col items-center">
          <span className="text-sm font-medium text-gray-700 mb-2">
            Upload Company Logo
          </span>
          <div className="flex items-center justify-center w-24 h-24 bg-white border-2 border-dashed border-gray-300 rounded-full hover:border-blue-400 transition">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo Preview"
                className="w-20 h-20 object-cover rounded-full"
              />
            ) : (
              <svg
                className="w-10 h-10 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16V4a1 1 0 011-1h8a1 1 0 011 1v12m-9 4h10a1 1 0 001-1v-2a1 1 0 00-1-1H6a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              {...register("logo")}
              onChange={handleLogoChange}
            />
          </div>
          {logoPreview && (
            <button
              type="button"
              className="text-xs text-red-500 mt-2 hover:underline"
              onClick={handleRemoveLogo}
            >
              Remove Logo
            </button>
          )}
          <span className="text-xs text-gray-400 mt-1">
            PNG, JPG, JPEG up to 2MB
          </span>
        </label>
      </div>

      {/* Company Details */}
      <div className="grid gap-4 grid-cols-2">
        <Input
          placeholder="Company Name"
          {...register("name", { required: true })}
        />
        <Input placeholder="Address" {...register("address")} />
        <Input placeholder="Phone" {...register("phone")} />
        <Input placeholder="Email" type="email" {...register("email")} />
        <Input placeholder="Website" {...register("website")} />
      </div>

      {/* Buttons */}
      <div className="flex gap-4">
        <Button
          type="submit"
          className="flex-1 btn-bw-primary"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </Button>
        <Button
          type="button"
          className="flex-1 btn-bw-secondary"
          onClick={() => {
            // ✅ pass current form values except File object
            const currentValues = { ...watch() };
            if (currentValues.logo instanceof File) currentValues.logo = null;
            onNext(currentValues);
          }}
        >
          Next
        </Button>
      </div>
    </form>
  );
}
