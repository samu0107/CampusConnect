import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const ALL_FACILITIES = [
  "WiFi", "Parking", "Laundry", "Kitchen", "Air Conditioning",
  "Hot Water", "Security", "Study Room", "Gym", "CCTV",
  "Furnished", "Water Included", "Electricity Included",
];

interface Props {
  existing?: any;
  onSuccess?: () => void;
}

export default function AccommodationForm({ existing, onSuccess }: Props) {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    title: existing?.title || "",
    description: existing?.description || "",
    price: existing?.price || "",
    distance: existing?.distance || "",
    distanceUnit: existing?.distanceUnit || "km",
    address: existing?.address || "",
    gender: existing?.gender || "Any",
    availableRooms: existing?.availableRooms || 1,
    facilities: existing?.facilities || [] as string[],
    ownerName: existing?.owner?.name || "",
    ownerPhone: existing?.owner?.phone || "",
    ownerEmail: existing?.owner?.email || "",
  });

  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [keepPhotos, setKeepPhotos] = useState<string[]>(existing?.photos || []);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalPhotos = keepPhotos.length + newPhotos.length;

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = 5 - totalPhotos;
    const toAdd = files.slice(0, remaining);
    setNewPhotos((prev) => [...prev, ...toAdd]);
    const newPreviews = toAdd.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeKeepPhoto = (p: string) => setKeepPhotos((prev) => prev.filter((x) => x !== p));
  const removeNewPhoto = (i: number) => {
    setNewPhotos((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const toggleFacility = (f: string) => {
    setForm((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(f)
        ? prev.facilities.filter((x: string) => x !== f)
        : [...prev.facilities, f],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (totalPhotos < 2) return setError("Please add at least 2 photos");
    if (totalPhotos > 5) return setError("Maximum 5 photos allowed");

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "facilities") fd.append(k, JSON.stringify(v));
        else fd.append(k, String(v));
      });
      newPhotos.forEach((f) => fd.append("photos", f));
      if (existing) fd.append("keepPhotos", JSON.stringify(keepPhotos));

      if (existing) {
        await axios.put(`${API}/api/accommodations/${existing._id}`, fd, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(`${API}/api/accommodations`, fd, {
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        });
      }

      onSuccess ? onSuccess() : navigate("/accommodations");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white";
  const labelCls = "block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-800">
            {existing ? "✏️ Edit Accommodation" : "➕ Add New Accommodation"}
          </h1>
          <p className="text-slate-400 text-sm mt-1">Fill in all details carefully</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-4 border border-red-100">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photos */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h2 className="font-bold text-slate-700 mb-3">
              Photos <span className="text-red-500">*</span>
              <span className="text-slate-400 text-xs font-normal ml-2">Min 2, Max 5</span>
            </h2>

            <div className="flex flex-wrap gap-3 mb-3">
              {keepPhotos.map((p) => (
                <div key={p} className="relative w-24 h-24 rounded-xl overflow-hidden group">
                  <img src={`${API}${p}`} className="w-full h-full object-cover" alt="" />
                  <button type="button" onClick={() => removeKeepPhoto(p)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    ×
                  </button>
                </div>
              ))}
              {previews.map((p, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden group">
                  <img src={p} className="w-full h-full object-cover" alt="" />
                  <button type="button" onClick={() => removeNewPhoto(i)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    ×
                  </button>
                </div>
              ))}
              {totalPhotos < 5 && (
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-400 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-500 transition-colors text-xs gap-1">
                  <span className="text-2xl">+</span> Add photo
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
            <p className="text-xs text-slate-400">{totalPhotos}/5 photos added</p>
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-700">Basic Information</h2>
            <div>
              <label className={labelCls}>Title *</label>
              <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Sunny Room near Faculty of Engineering" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Description *</label>
              <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the accommodation..." className={`${inputCls} resize-none`} />
            </div>
            <div>
              <label className={labelCls}>Address *</label>
              <input type="text" required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Full address" className={inputCls} />
            </div>
          </div>

          {/* Pricing + Distance */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h2 className="font-bold text-slate-700 mb-4">Pricing & Location</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Monthly Fee (Rs.) *</label>
                <input type="number" required min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                  placeholder="15000" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Distance from Uni *</label>
                <div className="flex gap-2">
                  <input type="number" required min="0" step="0.1" value={form.distance}
                    onChange={(e) => setForm({ ...form, distance: e.target.value })}
                    placeholder="1.5" className={`${inputCls} flex-1`} />
                  <select value={form.distanceUnit} onChange={(e) => setForm({ ...form, distanceUnit: e.target.value })}
                    className="border border-slate-200 rounded-xl px-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white">
                    <option value="km">km</option>
                    <option value="m">m</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={labelCls}>Available Rooms</label>
                <input type="number" min="0" value={form.availableRooms}
                  onChange={(e) => setForm({ ...form, availableRooms: Number(e.target.value) })}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Gender</label>
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  className={`${inputCls}`}>
                  <option value="Any">Any</option>
                  <option value="Male">Male only</option>
                  <option value="Female">Female only</option>
                </select>
              </div>
            </div>
          </div>

          {/* Facilities */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
            <h2 className="font-bold text-slate-700 mb-3">Facilities</h2>
            <div className="flex flex-wrap gap-2">
              {ALL_FACILITIES.map((f) => (
                <button key={f} type="button" onClick={() => toggleFacility(f)}
                  className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                    form.facilities.includes(f)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                  }`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Owner Details */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-700">Owner Details</h2>
            <div>
              <label className={labelCls}>Owner Name *</label>
              <input type="text" required value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                placeholder="Full name" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Phone *</label>
                <input type="tel" required value={form.ownerPhone} onChange={(e) => setForm({ ...form, ownerPhone: e.target.value })}
                  placeholder="07X XXXXXXX" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email *</label>
                <input type="email" required value={form.ownerEmail} onChange={(e) => setForm({ ...form, ownerEmail: e.target.value })}
                  placeholder="owner@email.com" className={inputCls} />
              </div>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-colors disabled:opacity-60 text-base shadow-lg shadow-indigo-200">
            {loading ? "Saving..." : existing ? "Save Changes" : "Create Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}