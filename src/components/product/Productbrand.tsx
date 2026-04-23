"use client";

import React from "react";
import { Package } from "lucide-react";

export interface Brand {
  id: number;
  name: string;
  slug?: string;
}

interface ProductBrandProps {
  brands: Brand[];
  selectedBrandId: number | null;
  onBrandSelect: (id: number) => void;
  onNavigateToCreate?: () => void;
}

const ProductBrand: React.FC<ProductBrandProps> = ({
  brands = [],
  selectedBrandId,
  onBrandSelect,
  onNavigateToCreate,
}) => {
  const selectedBrand = brands.find((b) => b.id === selectedBrandId);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
      {/* Section Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center text-white flex-shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Brand</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {selectedBrand ? selectedBrand.name : "None selected"}
            </p>
          </div>
        </div>
        {onNavigateToCreate && (
          <button
            onClick={onNavigateToCreate}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            + New
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="overflow-auto max-h-80 border border-gray-100 rounded-xl p-3">
          {Array.isArray(brands) && brands.length > 0 ? (
            <div className="space-y-2">
              {brands.map((brand) => (
                <label
                  key={brand.id}
                  className="flex items-center gap-2 py-1 cursor-pointer hover:bg-gray-50 px-2 rounded transition-colors"
                >
                  <input
                    type="radio"
                    name="brand"
                    className="cursor-pointer accent-blue-600"
                    checked={selectedBrandId === brand.id}
                    onChange={() => onBrandSelect(brand.id)}
                  />
                  <span className="text-sm text-gray-700">{brand.name}</span>
                  {brand.slug && (
                    <span className="text-xs text-gray-400 ml-auto">
                      {brand.slug}
                    </span>
                  )}
                </label>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">
              No brands available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProductBrand);
