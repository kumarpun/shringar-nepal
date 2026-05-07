"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { addToCart } from "@/lib/cart";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.product);
          if (data.product.category) {
            try {
              const relRes = await fetch(`/api/products?category=${encodeURIComponent(data.product.category)}`);
              const relData = await relRes.json();
              if (relData.success) {
                setRelatedProducts(relData.products.filter((p) => p.id !== data.product.id).slice(0, 4));
              }
            } catch {}
          }
        }
      } catch (err) {} finally { setLoading(false); }
    };
    fetchProduct();
  }, [params.id]);

  const getProductImages = () => {
    if (!product) return [];
    if (product.images) {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return [];
  };

  const productImages = product ? getProductImages() : [];
  const stock = product ? Number(product.stock) || 0 : 0;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8"><p className="text-zinc-500">Loading...</p></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8"><p className="text-zinc-500">Product not found.</p></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <button onClick={() => router.back()} className="text-sm text-zinc-500 hover:text-zinc-800 mb-6 inline-block transition-colors">
          &larr; Back
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            {productImages.length > 0 ? (
              <div className="flex gap-3">
                {productImages.length > 1 && (
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    {productImages.map((img, index) => (
                      <button key={index} onClick={() => setMainImageIndex(index)}
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-md overflow-hidden border-2 transition-colors ${mainImageIndex === index ? "border-zinc-700" : "border-zinc-200 hover:border-zinc-400"}`}>
                        <img src={img} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <img src={productImages[mainImageIndex]} alt={product.name} className="w-full rounded-lg shadow-md object-cover" />
                </div>
              </div>
            ) : (
              <div className="w-full h-96 bg-zinc-100 rounded-lg flex items-center justify-center">
                <span className="text-zinc-400">No image</span>
              </div>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-bold text-zinc-800 mb-2">{product.name}</h1>
            {product.category && <p className="text-sm text-zinc-500 mb-1">{product.category}</p>}
            {product.material && <p className="text-sm text-zinc-500 mb-4">Material: {product.material}</p>}
            <p className="text-3xl font-bold text-zinc-800 mb-6">रु {Number(product.price)}</p>

            {product.description && (
              <div className="text-sm text-zinc-600 mb-6 leading-relaxed whitespace-pre-line">{product.description}</div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-zinc-700 mb-2">Quantity</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-zinc-300 rounded-md text-zinc-800 hover:bg-zinc-100 transition-colors">-</button>
                <input type="text" inputMode="numeric" value={quantity}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val === "") return setQuantity(1);
                    setQuantity(Math.max(1, Math.min(stock, Number(val))));
                  }}
                  className="w-12 text-center text-zinc-800 font-medium border border-zinc-300 rounded-md py-1 focus:outline-none focus:ring-2 focus:ring-zinc-400" />
                <button onClick={() => setQuantity(Math.min(stock, quantity + 1))} disabled={quantity >= stock}
                  className="w-10 h-10 border border-zinc-300 rounded-md text-zinc-800 hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">+</button>
              </div>
            </div>

            <button onClick={handleAddToCart} disabled={stock === 0}
              className="w-full px-6 py-3 bg-zinc-700 text-white rounded-md font-medium hover:bg-zinc-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {stock === 0 ? "Out of Stock" : added ? "Added to Cart!" : "Add to Cart"}
            </button>

            <p className="text-xs text-zinc-500 mt-3">
              {stock > 0 ? `${stock} in stock` : "Currently unavailable"}
            </p>
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-8 border-t border-zinc-200 mt-8">
          <h2 className="text-xl font-bold text-zinc-800 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((rp) => {
              let firstImage = null;
              if (rp.images) {
                try {
                  const parsed = JSON.parse(rp.images);
                  if (Array.isArray(parsed) && parsed.length > 0) firstImage = parsed[0];
                } catch {}
              }
              return (
                <Link key={rp.id} href={`/products/${rp.id}`} className="group">
                  <div className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                    {firstImage ? (
                      <img src={firstImage} alt={rp.name} className="w-full h-56 object-cover" />
                    ) : (
                      <div className="w-full h-56 bg-zinc-100 flex items-center justify-center">
                        <span className="text-zinc-400 text-sm">No image</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <h3 className="text-sm font-semibold text-zinc-800">{rp.name}</h3>
                    <p className="text-lg font-bold text-zinc-800 mt-1">रु {Number(rp.price)}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
