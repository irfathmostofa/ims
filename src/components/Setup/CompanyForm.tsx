"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { currencies, Timezones } from "@/data/demoData";

type Props = { onNext: (data: any) => void; defaultValues?: any };

export default function CompanyForm({ onNext, defaultValues }: Props) {
  const { register, handleSubmit, reset, setValue } = useForm({
    defaultValues: defaultValues || {},
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
      if (defaultValues.logo && typeof defaultValues.logo === "string") {
        setLogoPreview(defaultValues.logo); // If editing, show saved logo
      }
    }
  }, [defaultValues, reset]);

  const onSubmit = (data: any) => {
    if (data.logo && data.logo.length > 0) {
      data.logo = data.logo[0];
    } else {
      data.logo = defaultValues?.logo || null;
    }
    onNext(data);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("logo", e.target.files); // set value in react-hook-form
      setLogoPreview(URL.createObjectURL(file)); // create preview
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              onChange={handleLogoChange}
            />
          </div>
          <span className="text-xs text-gray-400 mt-1">
            PNG, JPG, JPEG up to 2MB
          </span>
        </label>
        {logoPreview && (
          <button
            type="button"
            className="text-xs text-red-500 mt-2 hover:underline"
            onClick={() => setLogoPreview(null)}
          >
            Remove Logo
          </button>
        )}
      </div>
      <div className="grid gap-2 grid-cols-2">
        <Input
          placeholder="Company Name"
          {...register("name", { required: true })}
        />

        <Input placeholder="Address" {...register("address")} />
        <Input placeholder="Phone" {...register("phone")} />
        <Input placeholder="Email" type="email" {...register("email")} />

        {/* Timezone */}
        <select
          {...register("timezone", { required: true })}
          className="w-full border rounded px-3 py-2"
          defaultValue={defaultValues?.timezone || ""}
        >
          <option value="" disabled>
            Select Timezone
          </option>
          {Timezones.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>

        {/* Currency */}
        <select
          {...register("currency", { required: true })}
          className="w-full border rounded px-3 py-2"
          defaultValue={defaultValues?.currency || ""}
        >
          <option value="" disabled>
            Select Currency
          </option>
          {currencies.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} – {c.name} ({c.symbol})
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" className="w-full btn-bw-primary">
        Next
      </Button>
    </form>
  );
}
