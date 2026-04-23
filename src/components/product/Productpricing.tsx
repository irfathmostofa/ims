"use client";

import { Input } from "@/components/ui/input";

interface ProductPricingProps {
  costPrice: number | "";
  sellingPrice: number | "";
  regularPrice: number | "";
  onCostPriceChange: (price: number | "") => void;
  onSellingPriceChange: (price: number | "") => void;
  onRegularPriceChange: (price: number | "") => void;
}

export default function ProductPricing({
  costPrice,
  sellingPrice,
  regularPrice,
  onCostPriceChange,
  onSellingPriceChange,
  onRegularPriceChange,
}: ProductPricingProps) {
  const priceFields = [
    {
      label: "Cost Price",
      required: true,
      value: costPrice,
      setter: onCostPriceChange,
    },
    {
      label: "Selling Price",
      required: true,
      value: sellingPrice,
      setter: onSellingPriceChange,
    },
    {
      label: "Regular Price",
      hint: "Strike-through / compare price",
      value: regularPrice,
      setter: onRegularPriceChange,
    },
  ];

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
        Pricing
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {priceFields.map(({ label, required, hint, value, setter }) => (
          <div key={label} className="space-y-1.5">
            <label className="block text-sm font-semibold text-gray-700">
              {label}
              {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                $
              </span>
              <Input
                type="number"
                placeholder="0.00"
                value={value}
                onChange={(e) =>
                  setter(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="pl-7 h-11 rounded-xl border-gray-200"
              />
            </div>
            {hint && <p className="text-xs text-gray-400">{hint}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
