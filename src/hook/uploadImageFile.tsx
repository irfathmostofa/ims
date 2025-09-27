"use client";

import { useState } from "react";

type LogoUploaderProps = {
  initialLogo?: string; // existing logo if available
  onChange: (logoUrl: string) => void; // send logo to parent
  disabled?: boolean;
};

export default function LogoUploader({
  initialLogo,
  onChange,
  disabled = false,
}: LogoUploaderProps) {
  const [preview, setPreview] = useState<string | null>(initialLogo || null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      onChange(result); // pass result back to parent
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative group">
      {preview ? (
        <img
          src={preview}
          alt="Logo Preview"
          className="w-32 h-32 object-cover rounded-full border-4 border-gradient-to-r from-orange-300 via-pink-300 to-purple-400 shadow-lg transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-32 h-32 flex items-center justify-center rounded-full border-4 border-dashed border-gray-300 text-gray-400 text-xl shadow-lg">
          Logo
        </div>
      )}

      {!disabled && (
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
  );
}
