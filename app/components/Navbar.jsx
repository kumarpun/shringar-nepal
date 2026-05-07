"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { getUser, clearTokens, isAdmin } from "@/lib/auth-client";
import { getCartCount } from "@/lib/cart";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/shop?search=${encodeURIComponent(search.trim())}`);
      setSearch("");
    }
  };

  useEffect(() => {
    setUser(getUser());
    setAdmin(isAdmin());
    setCartCount(getCartCount());

    const handleCartUpdate = () => setCartCount(getCartCount());
    const handleAuthUpdate = () => {
      setUser(getUser());
      setAdmin(isAdmin());
    };
    window.addEventListener("cart-updated", handleCartUpdate);
    window.addEventListener("auth-updated", handleAuthUpdate);
    return () => {
      window.removeEventListener("cart-updated", handleCartUpdate);
      window.removeEventListener("auth-updated", handleAuthUpdate);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    clearTokens();
    setUser(null);
    setAdmin(false);
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    window.dispatchEvent(new Event("cart-updated"));
    router.replace("/");
  };

  const navLink = (href, label) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`text-base font-semibold transition-colors ${
          active ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-800"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-zinc-800">
          Shringar Nepal
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <form onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64 px-3 py-1.5 text-sm border border-zinc-300 bg-zinc-50 text-zinc-800 placeholder-zinc-400 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:bg-white"
            />
          </form>
          {navLink("/shop", "Shop")}
          <Link
            href="/cart"
            className={`relative transition-colors ${
              pathname === "/cart" ? "text-zinc-900" : "text-zinc-500 hover:text-zinc-800"
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-zinc-700 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          {user && navLink("/orders", "Orders")}
          {admin && navLink("/admin", "Admin")}

          {user ? (
            <div className="relative ml-2 pl-4 border-l border-zinc-200" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-1 text-base font-semibold text-zinc-600 hover:text-zinc-800 transition-colors"
              >
                {user.name}
                <svg className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-zinc-200 rounded-lg shadow-lg py-1 z-50">
                  <Link href="/change-password" onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 transition-colors">
                    Change Password
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-zinc-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            navLink("/login", "Login")
          )}
        </div>

        {/* Mobile nav icons */}
        <div className="flex md:hidden items-center gap-3">
          <Link
            href="/cart"
            className="relative text-zinc-500 hover:text-zinc-800"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-zinc-700 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-zinc-500 hover:text-zinc-800"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white">
          <div className="px-4 py-3">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2 text-base border border-zinc-300 rounded-md bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400"
              />
            </form>
          </div>
          <Link href="/shop" className="block px-4 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50">Shop</Link>
          {user ? (
            <>
              <Link href="/orders" className="block px-4 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50">Orders</Link>
              {admin && <Link href="/admin" className="block px-4 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50">Admin</Link>}
              <Link href="/change-password" className="block px-4 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50">Change Password</Link>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm font-medium text-red-600 hover:bg-zinc-50"
              >
                Logout
              </button>
              <div className="px-4 py-3 border-t border-zinc-100 text-xs text-zinc-400">
                Signed in as {user.email}
              </div>
            </>
          ) : (
            <Link href="/login" className="block px-4 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-50">Login</Link>
          )}
        </div>
      )}
    </nav>
  );
}
