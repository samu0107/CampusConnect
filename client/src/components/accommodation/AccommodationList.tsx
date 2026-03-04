import { useEffect, useState, useCallback } from "react";
import AccommodationCard from "./AccommodationCard";
import FilterBar from "./FilterBar";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AccommodationList() {
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchAccommodations = useCallback(async (filters: any = {}) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filters.minPrice) params.append("minPrice", filters.minPrice);
      if (filters.maxPrice) params.append("maxPrice", filters.maxPrice);
      if (filters.maxDistance) params.append("maxDistance", filters.maxDistance);
      if (filters.gender) params.append("gender", filters.gender);
      if (filters.facilities?.length) params.append("facilities", filters.facilities.join(","));

      const { data } = await axios.get(`${API}/api/accommodations?${params}`);
      setAccommodations(data.data);
    } catch {
      setError("Failed to load accommodations. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAccommodations(); }, [fetchAccommodations]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 mb-1">
            🏠 Find Your <span className="text-indigo-600">Perfect Boarding</span>
          </h1>
          <p className="text-slate-500 text-sm">Verified accommodations near your university</p>
        </div>

        <FilterBar onFilter={fetchAccommodations} loading={loading} />

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 border border-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
                <div className="h-52 bg-slate-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-6 bg-slate-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : accommodations.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🏚️</p>
            <p className="text-slate-500 text-lg font-medium">No accommodations found</p>
            <p className="text-slate-400 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-500 mb-4">{accommodations.length} accommodation{accommodations.length !== 1 ? "s" : ""} found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {accommodations.map((a: any) => (
                <AccommodationCard key={a._id} accommodation={a} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}