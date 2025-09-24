export async function uploadImageToCloudinary(file: File): Promise<string> {
  if (!file) throw new Error("No file provided");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "ims-image"); // must be unsigned preset in Cloudinary

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/dxefvhcfy/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    console.error("Cloudinary upload error:", errData);
    throw new Error(errData.error?.message || "Image upload failed");
  }

  const data = await res.json();
  return data.secure_url as string;
}
