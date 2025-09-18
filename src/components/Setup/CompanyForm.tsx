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

      {/* Logo Upload */}
      <input
        type="file"
        accept="image/*"
        className="w-full border rounded px-3 py-2"
        onChange={handleLogoChange}
      />

      {/* Image Preview */}
      {logoPreview && (
        <div className="mt-2">
          <p className="text-sm text-gray-600 mb-1">Logo Preview:</p>
          <img
            src={logoPreview}
            alt="Logo Preview"
            className="h-20 rounded border shadow-sm"
          />
        </div>
      )}

      <Button type="submit" className="w-full btn-bw-primary">
        Next
      </Button>
    </form>
  );
}
