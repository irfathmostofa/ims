"use client";

import { Package } from "lucide-react";
import CategoryTree from "@/components/ui/CategoryTree";

export interface Category {
  id: number;
  code: string;
  name: string;
  parent_id?: number | null;
  image?: string | null;
  status?: string | null;
}

interface ProductCategoriesProps {
  categories: Category[];
  selectedCategories: number[];
  onCategoriesChange: (categoryIds: number[]) => void;
  onNavigateToCreate?: () => void;
}

export default function ProductCategories({
  categories,
  selectedCategories,
  onCategoriesChange,
  onNavigateToCreate,
}: ProductCategoriesProps) {
  const toggleCategory = (catId: number) => {
    onCategoriesChange(
      selectedCategories.includes(catId)
        ? selectedCategories.filter((c) => c !== catId)
        : [...selectedCategories, catId],
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
      {/* Section Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center text-white flex-shrink-0">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">Categories</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {selectedCategories.length > 0
                ? `${selectedCategories.length} selected`
                : "None selected"}
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
        <div className="overflow-auto max-h-80 border border-gray-100 rounded-xl p-2">
          <CategoryTree
            categories={categories}
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
          />
        </div>
      </div>
    </div>
  );
}
