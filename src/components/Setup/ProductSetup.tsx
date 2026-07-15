"use client";

import { Button } from "@/components/ui/button";

import { Package } from "lucide-react";
import BulkProductUpload from "@/pages/Inventory/BulkProductUpload";

type Props = {
  onNext: (data: any) => void;
  onBack: () => void;
  defaultValues?: any;
};

export default function ProductSetup({ onNext, onBack }: Props) {
  const handleSkip = () => {
    onNext({ products: [], skipped: true });
  };

  const handleContinue = () => {
    onNext({ products: [], skipped: true });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex p-3 bg-blue-50 rounded-full mb-3">
          <Package className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Add Products</h2>
        <p className="text-sm text-gray-500 mt-1">
          Import your products or skip this step
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <p className="text-sm text-gray-600">
          You can always add products later from your dashboard
        </p>
      </div>

      {/* Product Upload */}
      <div className="border border-gray-200 rounded-lg p-4">
        <BulkProductUpload />
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack} className="px-6">
          ← Back
        </Button>
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-gray-500"
          >
            Skip
          </Button>
          <Button
            onClick={handleContinue}
            className="bw-primary text-white px-6"
          >
            Continue →
          </Button>
        </div>
      </div>
    </div>
  );
}
