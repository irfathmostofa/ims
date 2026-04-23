"use client";

interface UOM {
  id: number;
  code: string;
  name: string;
  symbol: string;
  description?: string;
  created_by?: string;
  created_at?: string;
  updated_by?: string;
  updated_at?: string;
}

interface ProductUOMProps {
  uoms: UOM[];
  selectedUom: number | "";
  onUomChange: (uomId: number | "") => void;
}

export default function ProductUOM({
  uoms,
  selectedUom,
  onUomChange,
}: ProductUOMProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-gray-700">
        Unit of Measure (UOM)
        <span className="text-red-500 ml-0.5">*</span>
      </label>
      <select
        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
        value={selectedUom}
        onChange={(e) =>
          onUomChange(e.target.value ? Number(e.target.value) : "")
        }
      >
        <option value="">— Select UOM —</option>
        {uoms?.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} ({u.symbol})
          </option>
        ))}
      </select>
      {selectedUom && (
        <p className="text-xs text-gray-400">
          {uoms.find((u) => u.id === selectedUom)?.description}
        </p>
      )}
    </div>
  );
}
