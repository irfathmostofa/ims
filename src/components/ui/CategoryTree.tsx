"use client";

import React from "react";

interface Category {
  id: number;
  name: string;
  slug?: string;
  parent_id?: number | null;
  children?: Category[] | null;
}

interface Props {
  categories: Category[];
  selectedCategories: number[];
  toggleCategory: (id: number) => void;
}

const CategoryTree: React.FC<Props> = ({
  categories = [],
  selectedCategories,
  toggleCategory,
}) => {
  const renderTree = (cat: Category, level = 0) => {
    if (!cat || !cat.id) return null; // prevent null read

    return (
      <div key={cat.id} className="pl-3">
        <label className="flex items-center gap-2 py-1">
          <input
            type="checkbox"
            className="cursor-pointer accent-blue-600"
            checked={selectedCategories.includes(cat.id)}
            onChange={() => toggleCategory(cat.id)}
          />
          <span className="text-sm">{cat.name}</span>
        </label>

        {Array.isArray(cat.children) && cat.children.length > 0 && (
          <div className="pl-4 border-l border-gray-200 ml-2">
            {cat.children.map((child) => renderTree(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {Array.isArray(categories) && categories.length > 0 ? (
        categories.map((cat) => renderTree(cat))
      ) : (
        <p className="text-sm text-gray-400">No categories available</p>
      )}
    </div>
  );
};

export default React.memo(CategoryTree);
