"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

function ProductCard({ product }) {
  let firstImage = null;
  if (product.images) {
    try {
      const parsed = JSON.parse(product.images);
      if (Array.isArray(parsed) && parsed.length > 0) firstImage = parsed[0];
    } catch {}
  }

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
        {firstImage ? (
          <img
            src={firstImage}
            alt={product.name}
            className="w-full h-72 object-cover"
          />
        ) : (
          <div className="w-full h-72 bg-zinc-100 flex items-center justify-center">
            <span className="text-zinc-400 text-sm">No image</span>
          </div>
        )}
      </div>
      <div className="mt-3">
        <h3 className="text-sm font-semibold text-zinc-800">{product.name}</h3>
        {product.material && (
          <p className="text-xs text-zinc-500 mt-0.5">{product.material}</p>
        )}
        <p className="text-lg font-bold text-zinc-800 mt-1">
          रु {Number(product.price)}
        </p>
      </div>
    </Link>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products?limit=6");
        const data = await res.json();
        if (data.success) {
          setProducts(data.products);
        }
      } catch (err) {}
      finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      {/* Hero */}
      <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-6xl font-bold mb-4">Timeless Elegance</h1>
          <p className="text-lg sm:text-xl text-zinc-300 mb-8">
            Discover exquisite jewelry crafted for every special moment
          </p>
          <Link
            href="/shop"
            className="inline-block px-8 py-3 bg-white text-zinc-800 font-semibold rounded-md hover:bg-zinc-100 transition-colors"
          >
            Shop Collection
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-zinc-800">New Arrivals</h2>
          <Link href="/shop" className="text-sm font-medium text-zinc-500 hover:text-zinc-800 transition-colors">
            View all &rarr;
          </Link>
        </div>

        {loading ? (
          <p className="text-zinc-500">Loading...</p>
        ) : products.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-zinc-500">No products yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
