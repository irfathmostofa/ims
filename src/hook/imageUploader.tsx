"use client";

type Props = {
  onChange: (base64: string) => void;
  disabled?: boolean;
};

export default function ImageUploader({ onChange, disabled = false }: Props) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      onChange(result); // send Base64 to parent
    };
    reader.readAsDataURL(file);
  };

  return (
    <input
      type="file"
      accept="image/*"
      onChange={handleChange}
      disabled={disabled}
    />
  );
}
