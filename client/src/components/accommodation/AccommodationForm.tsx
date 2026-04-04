import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ALL_FACILITIES = [
  "WiFi", "Parking", "Kitchen", "Air Conditioning",
  "Hot Water", "Security", "Study Room", "CCTV",
  "Furnished", "Water Included", "Electricity Included",
];

const FACILITY_ICONS: Record<string, string> = {
  WiFi: "📶", Parking: "🅿️",  Kitchen: "🍳",
  "Air Conditioning": "❄️", "Hot Water": "🚿", Security: "🔒",
  "Study Room": "📚",  CCTV: "📹",
  Furnished: "🛋️", "Water Included": "💧", "Electricity Included": "⚡",
};


interface Props {
  existing?: any;
  onSuccess?: () => void;
  onCancel?: () => void;  
}


export default function AccommodationForm({ existing, onSuccess, onCancel }: Props) {
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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    // Price: Rs. 1,000 – Rs. 500,000
    const price = Number(form.price);
    if (!form.price) {
      errors.price = "Price is required.";
    } else if (isNaN(price) || price < 1000) {
      errors.price = "Price must be at least Rs. 1,000.";
    } else if (price > 500000) {
      errors.price = "Price cannot exceed Rs. 500,000.";
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.ownerEmail) {
      errors.ownerEmail = "Email is required.";
    } else if (!emailRegex.test(form.ownerEmail)) {
      errors.ownerEmail = "Enter a valid email address.";
    }

    // Phone: 10-digit Sri Lankan number starting with 0
    const phoneRegex = /^0[0-9]{9}$/;
    const rawPhone = form.ownerPhone.replace(/[\s\-]/g, "");
    if (!form.ownerPhone) {
      errors.ownerPhone = "Phone number is required.";
    } else if (!phoneRegex.test(rawPhone)) {
      errors.ownerPhone = "Enter a valid 10-digit phone number (e.g. 0771234567).";
    }

    // Address: optional "No." prefix, street number, at least 2 comma-separated parts
    // e.g. "12, Temple Road, Malabe" or "No. 12, Temple Road, Malabe"
    const addressRegex = /^(No\.?\s*)?\d+[\w/-]*,\s*.+,\s*.+$/i;
    if (!form.address) {
      errors.address = "Address is required.";
    } else if (!addressRegex.test(form.address.trim())) {
      errors.address = 'Address must include a street number, street name, and city (e.g. "12, Temple Road, Malabe").';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const totalPhotos = keepPhotos.length + newPhotos.length;

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const toAdd = files.slice(0, 5 - totalPhotos);
    setNewPhotos((prev) => [...prev, ...toAdd]);
    setPreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
  };

  const removeKeepPhoto = (p: string) =>
    setKeepPhotos((prev) => prev.filter((x) => x !== p));

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
    if (!validate()) return; // stop if field validation fails

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
      onSuccess ? onSuccess() : navigate("/admin/accommodations");
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full bg-[#0d1117] border border-[#2a3142] rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/40 transition-all";
  const inpError = "w-full bg-[#0d1117] border border-red-500/60 rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-500/40 transition-all";
  const lbl = "block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest";
  const card = "bg-[#141824] border border-[#1e2535] rounded-xl p-5";
  const errMsg = "mt-1.5 text-[11px] text-red-400 flex items-center gap-1";

  return (
    <div className="min-h-screen bg-[#0d1117] text-white font-sans">

      {/* ── Top Nav ── */}
      <div className="sticky top-0 z-20 bg-[#0d1117] border-b border-[#1e2535]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin-dashboard")}
              className="text-slate-400 hover:text-white transition-colors text-sm flex items-center gap-1.5"
            >
              ← Back
            </button>
            <div className="w-px h-5 bg-[#2a3142]" />
            <div>
              <h1 className="text-base font-black text-white leading-tight">
                {existing ? "Edit Accommodation" : "Inject New Record"}
              </h1>
              <p className="text-xs text-slate-500">
                Accommodation Database ●{" "}
                <span className={totalPhotos >= 2 ? "text-emerald-400" : "text-amber-400"}>
                  {totalPhotos >= 2 ? "● Ready to submit" : "⚠ Add at least 2 photos"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
            type="button"
             onClick={() => onCancel ? onCancel() : navigate("/admin-dashboard")}
            className="px-4 py-2 rounded-lg border border-[#2a3142] text-slate-300 text-sm font-semibold hover:bg-[#1a1f2e] transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              form="acc-form"
              disabled={loading}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-sm font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-900/40"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>{existing ? "Save Changes" : "Create Listing"} →</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-5 flex items-center gap-3 bg-red-950/40 text-red-400 text-sm px-4 py-3 rounded-xl border border-red-800/40">
            ⚠️ {error}
          </div>
        )}

        {/* Field-level error summary */}
        {Object.keys(fieldErrors).length > 0 && (
          <div className="mb-5 bg-red-950/40 border border-red-800/40 rounded-xl px-4 py-3 space-y-1">
            <p className="text-red-400 text-xs font-bold uppercase tracking-wider mb-2">Please fix the following:</p>
            {Object.values(fieldErrors).map((msg, i) => (
              <p key={i} className="text-red-400 text-sm flex items-center gap-2">
                <span className="text-red-500">•</span> {msg}
              </p>
            ))}
          </div>
        )}

        <form id="acc-form" onSubmit={handleSubmit} className="space-y-4">

          {/* ── Photos ── */}
          <div className={card}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className={lbl}>📸 Photos</p>
                <p className="text-xs text-slate-600">Minimum 2 · Maximum 5 images</p>
              </div>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <div
                    key={n}
                    className={`h-1 w-7 rounded-full transition-all duration-300 ${
                      n <= totalPhotos ? "bg-cyan-500" : "bg-[#2a3142]"
                    }`}
                  />
                ))}
                <span className="text-xs text-slate-600 ml-1 font-mono">{totalPhotos}/5</span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {keepPhotos.map((p) => (
                <div key={p} className="relative aspect-square rounded-lg overflow-hidden group border border-[#2a3142]">
                  <img src={`${API}${p}`} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all" />
                  <button
                    type="button"
                    onClick={() => removeKeepPhoto(p)}
                    className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full w-5 h-5 text-xs hidden group-hover:flex items-center justify-center font-bold"
                  >×</button>
                </div>
              ))}
              {previews.map((p, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden group border-2 border-cyan-500/40">
                  <img src={p} className="w-full h-full object-cover" alt="" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all" />
                  <div className="absolute bottom-1 left-1 bg-cyan-500 text-white text-[10px] px-1.5 py-0.5 rounded font-black tracking-wider">NEW</div>
                  <button
                    type="button"
                    onClick={() => removeNewPhoto(i)}
                    className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full w-5 h-5 text-xs hidden group-hover:flex items-center justify-center font-bold"
                  >×</button>
                </div>
              ))}
              {totalPhotos < 5 && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-[#2a3142] hover:border-cyan-500/60 hover:bg-cyan-500/5 flex flex-col items-center justify-center text-slate-600 hover:text-cyan-400 transition-all group"
                >
                  <span className="text-2xl leading-none group-hover:scale-110 transition-transform">+</span>
                  <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">Add</span>
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
          </div>

          {/* ── Basic Info ── */}
          <div className={card}>
            <p className={lbl}>📝 Basic Information</p>
            <div className="space-y-3">
              <div>
                <label className={lbl}>Title *</label>
                <input type="text" required value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Cozy Room near Engineering Faculty"
                  className={inp} />
              </div>
              <div>
                <label className={lbl}>Description *</label>
                <textarea required rows={3} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe the accommodation, rules, surroundings..."
                  className={`${inp} resize-none`} />
              </div>
              <div>
                <label className={lbl}>Address *</label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) => {
                    setForm({ ...form, address: e.target.value });
                    if (fieldErrors.address) setFieldErrors((prev) => ({ ...prev, address: "" }));
                  }}
                  placeholder="No. 12, Temple Road, Malabe"
                  className={fieldErrors.address ? inpError : inp}
                />
                {fieldErrors.address && (
                  <p className={errMsg}>⚠ {fieldErrors.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* ── Pricing + Location side by side ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={card}>
              <p className={lbl}>💰 Pricing & Rooms</p>
              <div className="space-y-3">
                <div>
                  <label className={lbl}>Monthly Fee (Rs.) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">Rs.</span>
                    <input
                      type="number"
                      required
                      min="0"
                      value={form.price}
                      onChange={(e) => {
                        setForm({ ...form, price: e.target.value });
                        if (fieldErrors.price) setFieldErrors((prev) => ({ ...prev, price: "" }));
                      }}
                      placeholder="15000"
                      className={`${fieldErrors.price ? inpError : inp} pl-9`}
                    />
                  </div>
                  {fieldErrors.price && (
                    <p className={errMsg}>⚠ {fieldErrors.price}</p>
                  )}
                  <p className="mt-1 text-[10px] text-slate-600">Range: Rs. 1,000 – Rs. 500,000</p>
                </div>
                <div>
                  <label className={lbl}>Available Rooms</label>
                  <input type="number" min="0" value={form.availableRooms}
                    onChange={(e) => setForm({ ...form, availableRooms: Number(e.target.value) })}
                    className={inp} />
                </div>
              </div>
            </div>

            <div className={card}>
              <p className={lbl}>📍 Distance & Gender</p>
              <div className="space-y-3">
                <div>
                  <label className={lbl}>Distance from University *</label>
                  <div className="flex gap-2">
                    <input type="number" required min="0" step="0.1" value={form.distance}
                      onChange={(e) => setForm({ ...form, distance: e.target.value })}
                      placeholder="1.5"
                      className={`${inp} flex-1`} />
                    <select value={form.distanceUnit}
                      onChange={(e) => setForm({ ...form, distanceUnit: e.target.value })}
                      className="bg-[#0d1117] border border-[#2a3142] rounded-lg px-3 text-sm font-bold text-slate-300 focus:outline-none focus:border-cyan-500 transition-all">
                      <option value="km">km</option>
                      <option value="m">m</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className={lbl}>Gender</label>
                  <select value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className={inp}>
                    <option value="Any">Any Gender</option>
                    <option value="Male">Male Only</option>
                    <option value="Female">Female Only</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ── Facilities ── */}
          <div className={card}>
            <div className="flex items-center justify-between mb-3">
              <p className={lbl}>✨ Facilities</p>
              {form.facilities.length > 0 && (
                <span className="text-[10px] bg-indigo-900/40 text-indigo-300 border border-indigo-700/40 px-2.5 py-1 rounded-full font-black tracking-wider uppercase">
                  {form.facilities.length} selected
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_FACILITIES.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFacility(f)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all font-semibold ${
                    form.facilities.includes(f)
                      ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/50 shadow-sm shadow-indigo-900/50"
                      : "bg-[#0d1117] text-slate-500 border-[#2a3142] hover:border-slate-500 hover:text-slate-300"
                  }`}
                >
                  {FACILITY_ICONS[f]} {f}
                </button>
              ))}
            </div>
          </div>

          {/* ── Owner Details ── */}
          <div className={card}>
            <p className={lbl}>👤 Owner Details</p>
            <div className="space-y-3">
              <div>
                <label className={lbl}>Owner Name *</label>
                <input type="text" required value={form.ownerName}
                  onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
                  placeholder="Full name"
                  className={inp} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>Phone *</label>
                  <input
                    type="tel"
                    required
                    value={form.ownerPhone}
                    onChange={(e) => {
                      setForm({ ...form, ownerPhone: e.target.value });
                      if (fieldErrors.ownerPhone) setFieldErrors((prev) => ({ ...prev, ownerPhone: "" }));
                    }}
                    placeholder="0771234567"
                    className={fieldErrors.ownerPhone ? inpError : inp}
                  />
                  {fieldErrors.ownerPhone && (
                    <p className={errMsg}>⚠ {fieldErrors.ownerPhone}</p>
                  )}
                </div>
                <div>
                  <label className={lbl}>Email *</label>
                  <input
                    type="email"
                    required
                    value={form.ownerEmail}
                    onChange={(e) => {
                      setForm({ ...form, ownerEmail: e.target.value });
                      if (fieldErrors.ownerEmail) setFieldErrors((prev) => ({ ...prev, ownerEmail: "" }));
                    }}
                    placeholder="owner@email.com"
                    className={fieldErrors.ownerEmail ? inpError : inp}
                  />
                  {fieldErrors.ownerEmail && (
                    <p className={errMsg}>⚠ {fieldErrors.ownerEmail}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Mobile Submit ── */}
          <button
            type="submit"
            disabled={loading}
            className="md:hidden w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm transition-all disabled:opacity-50 shadow-xl shadow-indigo-900/40"
          >
            {loading ? "Saving..." : existing ? "Save Changes →" : "Create Listing →"}
          </button>

        </form>
      </div>
    </div>
  );
}