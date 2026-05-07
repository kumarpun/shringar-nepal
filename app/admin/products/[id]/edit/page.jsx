"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { authFetch } from "@/lib/auth-client";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    material: "",
    stock: "",
    isActive: true,
  });
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          authFetch(`/api/admin/products/${params.id}`),
          authFetch("/api/admin/categories"),
        ]);
        const prodData = await prodRes.json();
        const catData = await catRes.json();

        if (catData.success) setCategories(catData.categories);

        if (prodData.success) {
          setFormData({
            name: prodData.product.name || "",
            description: prodData.product.description || "",
            price: String(prodData.product.price),
            category: prodData.product.category || "",
            material: prodData.product.material || "",
            stock: String(prodData.product.stock || 0),
            isActive: prodData.product.isActive,
          });

          let parsedImages = [];
          if (prodData.product.images) {
            try { parsedImages = JSON.parse(prodData.product.images); } catch {}
          }
          setImages(parsedImages);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        setError("Failed to load product");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [params.id]);

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    if (images.length + files.length > 4) {
      setError("Maximum 4 images allowed");
      return;
    }

    setUploading(true);
    setError("");

    for (const file of files) {
      const fd = new FormData();
      fd.append("file", file);

      try {
        const res = await authFetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.url) {
          setImages((prev) => [...prev, data.url]);
        } else {
          setError(data.error || "Upload failed");
        }
      } catch (err) {
        setError("Failed to upload image");
      }
    }
    setUploading(false);
    e.target.value = "";
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const setCoverImage = (index) => {
    if (index === 0) return;
    const updated = [...images];
    const [selected] = updated.splice(index, 1);
    updated.unshift(selected);
    setImages(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await authFetch(`/api/admin/products/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock) || 0,
          images,
        }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/admin/products");
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <p className="text-zinc-500">Loading product...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-800 mb-6">Edit Product</h1>

      <form onSubmit={handleSubmit} className="bg-white p-4 sm:p-8 rounded-lg shadow-md">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>
        )}

        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium mb-2 text-zinc-700">Name *</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required
            className="w-full px-4 py-2 border border-zinc-300 rounded-md bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400" />
        </div>

        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium mb-2 text-zinc-700">Description</label>
          <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4}
            className="w-full px-4 py-2 border border-zinc-300 rounded-md bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium mb-2 text-zinc-700">Price *</label>
            <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} required step="0.01" min="0"
              className="w-full px-4 py-2 border border-zinc-300 rounded-md bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400" />
          </div>
          <div>
            <label htmlFor="stock" className="block text-sm font-medium mb-2 text-zinc-700">Stock</label>
            <input type="number" id="stock" name="stock" value={formData.stock} onChange={handleChange} min="0"
              className="w-full px-4 py-2 border border-zinc-300 rounded-md bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="category" className="block text-sm font-medium mb-2 text-zinc-700">Category</label>
            <select id="category" name="category" value={formData.category} onChange={handleChange}
              className="w-full px-4 py-2 border border-zinc-300 rounded-md bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400">
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="material" className="block text-sm font-medium mb-2 text-zinc-700">Material</label>
            <input type="text" id="material" name="material" value={formData.material} onChange={handleChange} placeholder="e.g. Gold, Silver"
              className="w-full px-4 py-2 border border-zinc-300 rounded-md bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400" />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-zinc-700">Images (up to 4)</label>

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
              {images.map((url, index) => (
                <div key={index} className="relative group">
                  <img src={url} alt={`Product ${index + 1}`}
                    className={`w-full aspect-square object-cover rounded-lg border-2 ${index === 0 ? "border-zinc-700" : "border-zinc-200"}`} />
                  {index === 0 && (
                    <span className="absolute top-1 left-1 bg-zinc-700 text-white text-xs px-1.5 py-0.5 rounded">Cover</span>
                  )}
                  <button type="button" onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    x
                  </button>
                  {index !== 0 && (
                    <button type="button" onClick={() => setCoverImage(index)}
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                      <span className="bg-white text-zinc-800 text-xs font-medium px-2 py-1 rounded">Set Cover</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {images.length < 4 && (
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-sm rounded-lg border border-zinc-300 transition-colors">
              {uploading ? "Uploading..." : "Upload Images"}
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
            </label>
          )}
        </div>

        <div className="mb-6">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} className="w-4 h-4" />
            <span className="text-sm font-medium text-zinc-700">Active</span>
          </label>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={loading}
            className="px-6 py-3 bg-zinc-700 text-white rounded-md font-medium hover:bg-zinc-600 transition-colors disabled:opacity-50">
            {loading ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={() => router.push("/admin/products")}
            className="px-6 py-3 border border-zinc-300 text-zinc-700 rounded-md font-medium hover:bg-zinc-50 transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
