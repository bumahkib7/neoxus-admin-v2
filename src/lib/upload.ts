import Cookies from "js-cookie";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export async function uploadProductImage(file: File, productId?: string): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  if (productId) {
    formData.append("productId", productId);
  }

  const token = Cookies.get("auth_token");

  const response = await fetch(`${API_URL}/admin/uploads/product-image`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Failed to upload image");
  }

  const data = await response.json();
  return data.url as string;
}
