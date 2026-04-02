import { useState } from "react";

const ALL_FACILITIES = [
  "WiFi", "Parking", "Kitchen", "Air Conditioning",
  "Hot Water", "Security", "Study Room", "CCTV",
  "Furnished", "Water Included", "Electricity Included",
];

const FACILITY_ICONS: Record<string, string> = {
  WiFi: "📶", Parking: "🅿️", Kitchen: "🍳", "Air Conditioning": "❄️",
  "Hot Water": "🚿", Security: "🔒", "Study Room": "📚", CCTV: "📹",
  Furnished: "🛋️", "Water Included": "💧", "Electricity Included": "⚡",
};

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

  const activeCount =
    (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0) +
    (filters.maxDistance ? 1 : 0) + filters.facilities.length + (filters.gender ? 1 : 0);

  return (
    <div className=" border border-slate-200 rounded-2xl overflow-hidden mb-6 shadow-sm">

      {/* Header */}
      <div
        className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg  flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">Filters</p>
            <p className="text-xs text-slate-500">
              {activeCount > 0 ? `${activeCount} filter${activeCount > 1 ? "s" : ""} applied` : "No filters applied"}
            </p>
          </div>
          {activeCount > 0 && (
            <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">{expanded ? "Hide" : "Show"}</span>
          <div className={`w-5 h-5 rounded-full  flex items-center justify-center transition-transform ${expanded ? "rotate-180" : ""}`}>
            <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-5 py-5">

          {/* Price + Distance + Gender */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              { label: "Min Price (Rs.)", key: "minPrice", placeholder: "0", type: "number" },
              { label: "Max Price (Rs.)", key: "maxPrice", placeholder: "50,000", type: "number" },
              { label: "Max Distance (km)", key: "maxDistance", placeholder: "5", type: "number" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">{field.label}</label>
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={(filters as any)[field.key]}
                  onChange={(e) => setFilters({ ...filters, [field.key]: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent  text-slate-700 placeholder-slate-300 transition-all"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">Gender</label>
              <select
                value={filters.gender}
                onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300  text-slate-700 transition-all cursor-pointer"
              >
                <option value="">Any Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* Facilities */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-slate-500 mb-2.5">Facilities</label>
            <div className="flex flex-wrap gap-2">
              {ALL_FACILITIES.map((f) => {
                const active = filters.facilities.includes(f);
                return (
                  <button
                    key={f}
                    onClick={() => toggleFacility(f)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl border font-medium transition-all select-none ${
                      active
                        ? " text-white border-slate-900 shadow-sm"
                        : " backdrop-blur-xl text-slate-600 border-slate-200 hover:border-slate-400 hover:text-slate-800"
                    }`}
                  >
                    <span className="text-sm">{FACILITY_ICONS[f]}</span>
                    {f}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-4 border-t border-slate-100">
            <button
              onClick={() => onFilter(filters)}
              disabled={loading}
              className="w-full text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl px-4 py-2.5 transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 mt-1">
        
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Searching...
                </>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Apply Filters</span>
                </span>
              )}
            </button>
            {activeCount > 0 && (
              <button
                onClick={handleReset}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-500 text-sm font-medium hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-60"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}