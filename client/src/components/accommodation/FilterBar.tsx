import { useState } from "react";

const ALL_FACILITIES = [
  "WiFi", "Parking", "Laundry", "Kitchen", "Air Conditioning",
  "Hot Water", "Security", "Study Room", "Gym", "CCTV",
  "Furnished", "Water Included", "Electricity Included",
];

interface Filters {
  minPrice: string;
  maxPrice: string;
  maxDistance: string;
  facilities: string[];
  gender: string;
}

interface Props {
  onFilter: (filters: Filters) => void;
  loading?: boolean;
}

export default function FilterBar({ onFilter, loading }: Props) {
  const [filters, setFilters] = useState<Filters>({
    minPrice: "", maxPrice: "", maxDistance: "", facilities: [], gender: "",
  });
  const [expanded, setExpanded] = useState(false);

  const toggleFacility = (f: string) => {
    setFilters((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(f)
        ? prev.facilities.filter((x) => x !== f)
        : [...prev.facilities, f],
    }));
  };

  const handleReset = () => {
    const reset = { minPrice: "", maxPrice: "", maxDistance: "", facilities: [], gender: "" };
    setFilters(reset);
    onFilter(reset);
  };

  const activeCount = (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0) +
    (filters.maxDistance ? 1 : 0) + filters.facilities.length + (filters.gender ? 1 : 0);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-slate-700 text-sm">🔍 Filter Accommodations</h2>
          {activeCount > 0 && (
            <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-bold">{activeCount}</span>
          )}
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-xs text-indigo-600 font-semibold hover:underline">
          {expanded ? "Hide ↑" : "More filters ↓"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
        <div>
          <label className="text-xs text-slate-500 font-medium mb-1 block">Min Price (Rs.)</label>
          <input type="number" placeholder="0" value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <div>
          <label className="text-xs text-slate-500 font-medium mb-1 block">Max Price (Rs.)</label>
          <input type="number" placeholder="50000" value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <div>
          <label className="text-xs text-slate-500 font-medium mb-1 block">Max Distance (km)</label>
          <input type="number" placeholder="5" value={filters.maxDistance}
            onChange={(e) => setFilters({ ...filters, maxDistance: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <div>
          <label className="text-xs text-slate-500 font-medium mb-1 block">Gender</label>
          <select value={filters.gender} onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
            className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
            <option value="">Any</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <label className="text-xs text-slate-500 font-medium mb-2 block">Facilities</label>
          <div className="flex flex-wrap gap-2">
            {ALL_FACILITIES.map((f) => (
              <button key={f} onClick={() => toggleFacility(f)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                  filters.facilities.includes(f)
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <button onClick={() => onFilter(filters)} disabled={loading}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-xl text-sm transition-colors disabled:opacity-60">
          {loading ? "Searching..." : "Apply Filters"}
        </button>
        {activeCount > 0 && (
          <button onClick={handleReset}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-500 text-sm hover:bg-slate-50">
            Reset
          </button>
        )}
      </div>
    </div>
  );
}