import React from "react";

interface InputProps {
  label?: string;
  name?: string;
  type?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  className?: string;
}

const CustomInput: React.FC<InputProps> = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  readonly = false,
  required = false,
  className = "",
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        readOnly={readonly}
        className={`
          w-full rounded-lg border px-3 py-2 text-sm
          transition focus:outline-none focus:ring-2
          ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }
          ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
          ${readonly ? "bg-gray-50 cursor-default" : ""}
          ${className}
        `}
      />

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

export default CustomInput;
