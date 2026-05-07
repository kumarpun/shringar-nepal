"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-zinc-50"><p className="text-zinc-500">Loading...</p></div>}>
      <ShopContent />
    </Suspense>
  );
}

function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories");
        const data = await res.json();
        if (data.success) setCategories(data.categories.map((c) => c.name));
      } catch (err) {}
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (category) params.set("category", category);
        if (priceRange) params.set("priceRange", priceRange);
        params.set("page", page);
        params.set("limit", ITEMS_PER_PAGE);
        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setProducts(data.products);
          setTotalProducts(data.total);
        }
      } catch (err) {} finally { setLoading(false); }
    };
    fetchProducts();
  }, [search, category, priceRange, page]);

  const handleCategory = (cat) => { setCategory(cat); setPriceRange(""); setPage(1); };
  const handleAll = () => { setCategory(""); setPriceRange(""); setPage(1); };
  const handlePriceRange = (range) => { setPriceRange(range); setCategory(""); setPage(1); };

  const sidebarBtn = (label, active, onClick) => (
    <button onClick={onClick}
      className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${active ? "bg-zinc-700 text-white font-medium" : "text-zinc-600 hover:bg-zinc-100"}`}>
      {label}
    </button>
  );

  const pillBtn = (label, active, onClick) => (
    <button onClick={onClick}
      className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${active ? "bg-zinc-700 text-white" : "bg-white text-zinc-600 border border-zinc-300"}`}>
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-zinc-800 mb-6">All Jewelry</h1>

        {/* Mobile pills */}
        <div className="md:hidden flex gap-2 flex-wrap pb-4 mb-4">
          {pillBtn("All", !category && !priceRange, handleAll)}
          {pillBtn("Affordable", priceRange === "affordable", () => handlePriceRange("affordable"))}
          {pillBtn("Premium", priceRange === "premium", () => handlePriceRange("premium"))}
          {categories.map((cat) => (
            <span key={cat}>{pillBtn(cat, category === cat, () => handleCategory(cat))}</span>
          ))}
        </div>

        <div className="flex gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden md:block w-48 flex-shrink-0">
            <nav className="space-y-1">
              {sidebarBtn("All", !category && !priceRange, handleAll)}
              <div className="pt-3">
                <p className="px-3 py-2 text-sm font-semibold text-zinc-700">Categories</p>
                <div className="space-y-0.5">
                  {categories.map((cat) => (
                    <span key={cat}>{sidebarBtn(cat, category === cat, () => handleCategory(cat))}</span>
                  ))}
                </div>
              </div>
              <div className="pt-3 border-t border-zinc-200 mt-3">
                <p className="px-3 py-2 text-sm font-semibold text-zinc-700">Price Range</p>
                <div className="space-y-0.5">
                  {sidebarBtn("Affordable", priceRange === "affordable", () => handlePriceRange("affordable"))}
                  {sidebarBtn("Premium", priceRange === "premium", () => handlePriceRange("premium"))}
                </div>
              </div>
            </nav>
          </aside>

          {/* Products */}
          <div className="flex-1 min-w-0">
            <div className="mb-6 flex gap-3">
              <input type="text" placeholder="Search jewelry..." value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="flex-1 px-4 py-2 text-base border border-zinc-300 rounded-md bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400" />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 text-sm border border-zinc-300 rounded-md bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400">
                <option value="">Sort by</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {loading ? (
              <p className="text-zinc-500">Loading...</p>
            ) : products.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-md text-center">
                <p className="text-zinc-500">No products found.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...products].sort((a, b) => {
                    if (sortBy === "price-low") return Number(a.price) - Number(b.price);
                    if (sortBy === "price-high") return Number(b.price) - Number(a.price);
                    return 0;
                  }).map((product) => {
                    let firstImage = null;
                    if (product.images) {
                      try {
                        const parsed = JSON.parse(product.images);
                        if (Array.isArray(parsed) && parsed.length > 0) firstImage = parsed[0];
                      } catch {}
                    }

                    return (
                      <Link key={product.id} href={`/products/${product.id}`} className="group">
                        <div className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                          {firstImage ? (
                            <img src={firstImage} alt={product.name} className="w-full h-72 object-cover" />
                          ) : (
                            <div className="w-full h-72 bg-zinc-100 flex items-center justify-center">
                              <span className="text-zinc-400 text-sm">No image</span>
                            </div>
                          )}
                        </div>
                        <div className="mt-3">
                          <h3 className="text-sm font-semibold text-zinc-800">{product.name}</h3>
                          {product.category && <p className="text-xs text-zinc-500 mt-0.5">{product.category}</p>}
                          <p className="text-lg font-bold text-zinc-800 mt-1">रु {Number(product.price)}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {(() => {
                  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE);
                  if (totalPages <= 1) return null;
                  return (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <button onClick={() => { setPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        disabled={page === 1}
                        className="px-3 py-1.5 text-sm text-zinc-800 border border-zinc-300 rounded-md hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed">
                        Prev
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                        .reduce((acc, p, i, arr) => {
                          if (i > 0 && p - arr[i - 1] > 1) acc.push("...");
                          acc.push(p);
                          return acc;
                        }, [])
                        .map((p, i) =>
                          p === "..." ? (
                            <span key={`dots-${i}`} className="px-1 text-zinc-400 text-sm">...</span>
                          ) : (
                            <button key={p} onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                              className={`px-3 py-1.5 text-sm border rounded-md ${page === p ? "bg-zinc-700 text-white border-zinc-700" : "border-zinc-300 text-zinc-800 hover:bg-zinc-50"}`}>
                              {p}
                            </button>
                          )
                        )}
                      <button onClick={() => { setPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        disabled={page === totalPages}
                        className="px-3 py-1.5 text-sm text-zinc-800 border border-zinc-300 rounded-md hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed">
                        Next
                      </button>
                    </div>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
