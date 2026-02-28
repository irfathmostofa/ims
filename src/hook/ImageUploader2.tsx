// hook/imageUploader.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { uploadImageToCloudinary } from "./uploadImageToCloudinary";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  onUploadComplete?: (imageUrl: string) => void;
  onRemove?: () => void;
  initialImage?: string | null;
  showPreview?: boolean;
  className?: string;
  buttonText?: string;
}

export default function ImageUploader2({
  onUploadComplete,
  onRemove,
  initialImage,
  showPreview = true,
  className = "",
  buttonText = "Upload Image",
}: ImageUploaderProps) {
  const [image, setImage] = useState<string | null>(initialImage || null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImage(initialImage || null);
  }, [initialImage]);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    try {
      const previewUrl = URL.createObjectURL(file);
      setImage(previewUrl);

      setUploading(true);
      const url = await uploadImageToCloudinary(file);

      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);

      setImage(url);
      onUploadComplete?.(url);
      toast.success("Image uploaded successfully!");
    } catch (err: any) {
      console.error("Upload failed:", err);
      toast.error(err.message || "Failed to upload image");
      setImage(initialImage || null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    setImage(null);
    onRemove?.();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {showPreview && image ? (
        <div className="flex items-start gap-4">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
            <img
              src={image}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <div className="flex-1 flex items-start gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs"
            >
              Change
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              disabled={uploading}
              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <X size={14} className="mr-1" /> Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:border-gray-400 transition-colors"
        >
          {uploading ? (
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="text-xs text-gray-500">{buttonText}</span>
          )}
        </div>
      )}
    </div>
  );
}
