"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/auth-client";

export default function AdminSettingsPage() {
  const [codEnabled, setCodEnabled] = useState(true);
  const [onlineEnabled, setOnlineEnabled] = useState(true);
  const [deliveryCharge, setDeliveryCharge] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Cities state
  const [cities, setCities] = useState([]);
  const [newCityName, setNewCityName] = useState("");
  const [newCityCharge, setNewCityCharge] = useState("");
  const [cityMessage, setCityMessage] = useState("");
  const [addingCity, setAddingCity] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [editName, setEditName] = useState("");
  const [editCharge, setEditCharge] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const [cityPage, setCityPage] = useState(1);
  const CITIES_PER_PAGE = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, citiesRes] = await Promise.all([
          authFetch("/api/admin/settings"),
          authFetch("/api/admin/cities"),
        ]);
        const settingsData = await settingsRes.json();
        const citiesData = await citiesRes.json();

        if (settingsData.success) {
          setCodEnabled(settingsData.codEnabled);
          setOnlineEnabled(settingsData.onlineEnabled);
          setDeliveryCharge(settingsData.deliveryCharge || "0");
        }
        if (citiesData.success) {
          setCities(citiesData.cities);
        }
      } catch (err) {}
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const showMessage = (msg, setter) => {
    setter(msg);
    setTimeout(() => setter(""), 3000);
  };

  const handleSave = async () => {
    if (!codEnabled && !onlineEnabled) {
      showMessage("At least one payment method must be enabled", setMessage);
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      const res = await authFetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          codEnabled,
          onlineEnabled,
          deliveryCharge: parseFloat(deliveryCharge) || 0,
        }),
      });
      const data = await res.json();
      showMessage(data.success ? "Settings saved" : (data.message || "Failed to save"), setMessage);
    } catch (err) {
      showMessage("Something went wrong", setMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleAddCity = async (e) => {
    e.preventDefault();
    setAddingCity(true);
    setCityMessage("");
    try {
      const res = await authFetch("/api/admin/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCityName, deliveryCharge: parseFloat(newCityCharge) }),
      });
      const data = await res.json();
      if (data.success) {
        setCities([...cities, data.city]);
        setNewCityName("");
        setNewCityCharge("");
        showMessage("City added", setCityMessage);
      } else {
        showMessage(data.message || "Failed to add city", setCityMessage);
      }
    } catch (err) {
      showMessage("Something went wrong", setCityMessage);
    } finally {
      setAddingCity(false);
    }
  };

  const handleUpdateCity = async (id) => {
    setCityMessage("");
    try {
      const res = await authFetch("/api/admin/cities", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name: editName, deliveryCharge: parseFloat(editCharge) }),
      });
      const data = await res.json();
      if (data.success) {
        setCities(cities.map((c) => (c.id === id ? { ...c, name: editName, deliveryCharge: parseFloat(editCharge) } : c)));
        setEditingCity(null);
        showMessage("City updated", setCityMessage);
      } else {
        showMessage(data.message || "Failed to update", setCityMessage);
      }
    } catch (err) {
      showMessage("Something went wrong", setCityMessage);
    }
  };

  const handleDeleteCity = async (id) => {
    setCityMessage("");
    try {
      const res = await authFetch("/api/admin/cities", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setCities(cities.filter((c) => c.id !== id));
        showMessage("City deleted", setCityMessage);
      } else {
        showMessage(data.message || "Failed to delete", setCityMessage);
      }
    } catch (err) {
      showMessage("Something went wrong", setCityMessage);
    }
  };

  if (loading) return <p className="text-zinc-500">Loading settings...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-800 mb-6">Settings</h1>

      {message && (
        <div className={`mb-4 p-3 rounded-md text-sm ${message.includes("saved") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message}
        </div>
      )}

      {/* Payment Methods + Delivery Charge */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-lg font-semibold text-zinc-800 mb-4">Payment Methods</h2>
        <p className="text-sm text-zinc-500 mb-4">Choose which payment methods customers can use at checkout.</p>

        <div className="space-y-4 mb-6">
          <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${codEnabled ? "border-zinc-700 bg-zinc-50" : "border-zinc-200"}`}>
            <div>
              <p className="text-sm font-medium text-zinc-800">Cash on Delivery</p>
              <p className="text-xs text-zinc-500 mt-0.5">Customer pays when the order is delivered</p>
            </div>
            <input type="checkbox" checked={codEnabled} onChange={(e) => setCodEnabled(e.target.checked)}
              className="w-5 h-5 accent-zinc-700 cursor-pointer" />
          </label>

          <label className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${onlineEnabled ? "border-zinc-700 bg-zinc-50" : "border-zinc-200"}`}>
            <div>
              <p className="text-sm font-medium text-zinc-800">Online Payment</p>
              <p className="text-xs text-zinc-500 mt-0.5">Customer pays online before or after placing order</p>
            </div>
            <input type="checkbox" checked={onlineEnabled} onChange={(e) => setOnlineEnabled(e.target.checked)}
              className="w-5 h-5 accent-zinc-700 cursor-pointer" />
          </label>
        </div>

        {!codEnabled && !onlineEnabled && (
          <p className="mb-4 text-sm text-red-600">At least one payment method must be enabled.</p>
        )}

        <div className="mb-6">
          <label htmlFor="deliveryCharge" className="block text-sm font-medium mb-2 text-zinc-700">
            Default Delivery Charge (रु)
          </label>
          <input type="number" id="deliveryCharge" value={deliveryCharge}
            onChange={(e) => setDeliveryCharge(e.target.value)} min="0" step="0.01"
            className="w-full px-4 py-2 border border-zinc-300 rounded-md bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400" />
          <p className="text-xs text-zinc-500 mt-1">Fallback charge when no city match. Set 0 for free delivery.</p>
        </div>

        <button onClick={handleSave} disabled={saving || (!codEnabled && !onlineEnabled)}
          className="px-6 py-3 bg-zinc-700 text-white rounded-md font-medium hover:bg-zinc-600 transition-colors disabled:opacity-50">
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </div>

      {/* City-wise Delivery Charges */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-zinc-800 mb-4">City-wise Delivery Charges</h2>

        {cityMessage && (
          <div className={`mb-4 p-3 rounded-md text-sm ${cityMessage.includes("added") || cityMessage.includes("updated") || cityMessage.includes("deleted") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {cityMessage}
          </div>
        )}

        <form onSubmit={handleAddCity} className="flex flex-col sm:flex-row gap-3 mb-6">
          <input type="text" placeholder="City name" value={newCityName}
            onChange={(e) => setNewCityName(e.target.value)} required
            className="flex-1 px-4 py-2 border border-zinc-300 rounded-md bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400" />
          <input type="number" placeholder="Charge (रु)" value={newCityCharge}
            onChange={(e) => setNewCityCharge(e.target.value)} min="0" step="0.01" required
            className="w-full sm:w-32 px-4 py-2 border border-zinc-300 rounded-md bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400" />
          <button type="submit" disabled={addingCity}
            className="px-4 py-2 bg-zinc-700 text-white rounded-md font-medium hover:bg-zinc-600 transition-colors disabled:opacity-50 text-sm">
            {addingCity ? "Adding..." : "Add City"}
          </button>
        </form>

        {cities.length > 5 && (
          <input type="text" placeholder="Search cities..." value={citySearch}
            onChange={(e) => { setCitySearch(e.target.value); setCityPage(1); }}
            className="w-full px-4 py-2 border border-zinc-300 rounded-md bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 mb-4 text-sm" />
        )}

        {(() => {
          const filtered = cities.filter((c) => c.name.toLowerCase().includes(citySearch.toLowerCase()));
          const totalPages = Math.ceil(filtered.length / CITIES_PER_PAGE);
          const paginated = filtered.slice((cityPage - 1) * CITIES_PER_PAGE, cityPage * CITIES_PER_PAGE);

          if (cities.length === 0) {
            return <p className="text-sm text-zinc-500">No cities added yet. Add cities to set location-based delivery charges.</p>;
          }
          if (filtered.length === 0) {
            return <p className="text-sm text-zinc-500">No cities match your search.</p>;
          }

          return (
            <>
              <div className="space-y-2">
                {paginated.map((city) => (
                  <div key={city.id} className="flex items-center gap-3 p-3 border border-zinc-200 rounded-md">
                    {editingCity === city.id ? (
                      <>
                        <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-zinc-300 rounded-md bg-white text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400" />
                        <input type="number" value={editCharge} onChange={(e) => setEditCharge(e.target.value)} min="0" step="0.01"
                          className="w-24 px-3 py-1.5 border border-zinc-300 rounded-md bg-white text-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-400" />
                        <button onClick={() => handleUpdateCity(city.id)} className="text-sm text-green-600 hover:text-green-800 font-medium">Save</button>
                        <button onClick={() => setEditingCity(null)} className="text-sm text-zinc-500 hover:text-zinc-700 font-medium">Cancel</button>
                      </>
                    ) : (
                      <>
                        <span className="flex-1 text-sm font-medium text-zinc-800">{city.name}</span>
                        <span className="text-sm text-zinc-600">रु {Number(city.deliveryCharge)}</span>
                        <button onClick={() => { setEditingCity(city.id); setEditName(city.name); setEditCharge(String(Number(city.deliveryCharge))); }}
                          className="text-sm text-zinc-500 hover:text-zinc-700 font-medium">Edit</button>
                        <button onClick={() => handleDeleteCity(city.id)}
                          className="text-sm text-red-500 hover:text-red-700 font-medium">Delete</button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button onClick={() => setCityPage((p) => Math.max(1, p - 1))} disabled={cityPage === 1}
                    className="px-3 py-1.5 text-sm text-zinc-800 border border-zinc-300 rounded-md hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed">Prev</button>
                  <span className="text-sm text-zinc-500">Page {cityPage} of {totalPages}</span>
                  <button onClick={() => setCityPage((p) => Math.min(totalPages, p + 1))} disabled={cityPage === totalPages}
                    className="px-3 py-1.5 text-sm text-zinc-800 border border-zinc-300 rounded-md hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed">Next</button>
                </div>
              )}
            </>
          );
        })()}
      </div>
    </div>
  );
}
