import React, { useMemo, useState } from "react";

interface SelectOption {
  label: string;
  value: string | number;
}

interface SelectProps {
  label?: string;
  name?: string;
  value?: string | string[];
  onChange?: (value: string | string[]) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  searchable?: boolean;
  multiple?: boolean;
  className?: string;
}

const CustomSelect: React.FC<SelectProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Select option",
  error,
  disabled = false,
  required = false,
  searchable = false,
  multiple = false,
  className = "",
}) => {
  const [search, setSearch] = useState("");

  const filteredOptions = useMemo(() => {
    if (!searchable || !search) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, options, searchable]);

  return (
    <div className="w-full">
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {searchable && (
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}

      <select
        name={name}
        multiple={multiple}
        value={value}
        disabled={disabled}
        onChange={(e) => {
          if (multiple) {
            const selected = Array.from(e.target.selectedOptions).map(
              (opt) => opt.value
            );
            onChange?.(selected);
          } else {
            onChange?.(e.target.value);
          }
        }}
        className={`
          w-full rounded-lg border bg-white px-3 py-2 text-sm
          transition focus:outline-none focus:ring-2
          ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }
          ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
          ${multiple ? "h-40" : ""}
          ${className}
        `}
      >
        {!multiple && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}

        {filteredOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default CustomSelect;
