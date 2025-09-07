"use client";

export default function ProductCategory({
  categories,
  category,
  setCategory,
}: {
  categories: string[];
  category: string;
  setCategory: (cat: string) => void;
}) {
  return (
    <div className="bg-bw-50 p-4 rounded-md shadow-md">
      <h2 className="text-bw-900 font-bold mb-2">Categories</h2>
      <div className="flex flex-col gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              category === cat
                ? "bg-bw-700 text-bw-50"
                : "bg-bw-100 text-bw-900 hover:bg-bw-200"
            }`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
