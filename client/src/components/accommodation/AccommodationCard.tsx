import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Accommodation {
  _id: string;
  title: string;
  description: string;
  price: number;
  distance: number;
  distanceUnit: string;
  address: string;
  photos: string[];
  facilities: string[];
  owner: { name: string; phone: string; email: string };
  gender: string;
  availableRooms: number;
  isAvailable: boolean;
}

interface Props {
  accommodation: Accommodation;
}

const facilityIcons: Record<string, string> = {
  WiFi: "📶", Parking: "🅿️", Kitchen: "🍳",
  "Air Conditioning": "❄️", "Hot Water": "🚿", Security: "🔒",
  "Study Room": "📚", CCTV: "📹",
  Furnished: "🛋️", "Water Included": "💧", "Electricity Included": "⚡",
};

export default function AccommodationCard({ accommodation }: Props) {
  const [imgIdx, setImgIdx] = useState(0);
  const navigate = useNavigate();
  const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const isFull = accommodation.availableRooms === 0;

  return (
    <div
      onClick={() => navigate(`/accommodations/${accommodation._id}`)}
      className="group bg-transparent rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer border border-blue-900 hover:-translate-y-1"
    >
      {/* Photo */}
      <div className="relative h-52 overflow-hidden bg-slate-700">
        {accommodation.photos?.[imgIdx] ? (
          <img
            src={`${BASE}${accommodation.photos[imgIdx]}`}
            alt={accommodation.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-slate-800 text-cyan-200">🏠</div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none" />

        {/* Full overlay */}
        {isFull && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-black text-xl tracking-widest uppercase">Full</span>
          </div>
        )}

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow ${
            accommodation.gender === "Male" ? "bg-blue-500 text-white" :
            accommodation.gender === "Female" ? "bg-pink-500 text-white" :
            "bg-emerald-500 text-white"
          }`}>
            {accommodation.gender === "Male" ? "👨 Male" :
             accommodation.gender === "Female" ? "👩 Female" : "👥 Any"}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span className="text-[11px] font-bold bg-white/90 text-slate-700 px-2.5 py-1 rounded-full shadow">
            {isFull ? "🔴 Full" : `🟢 ${accommodation.availableRooms} room${accommodation.availableRooms > 1 ? "s" : ""}`}
          </span>
        </div>

        {/* Photo dots */}
        {accommodation.photos?.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 items-center">
            {accommodation.photos.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setImgIdx(i); }}
                className={`rounded-full transition-all ${
                  i === imgIdx ? "bg-white w-4 h-1.5" : "bg-white/50 w-1.5 h-1.5"
                }`}
              />
            ))}
          </div>
        )}

        {/* Price on image */}
        <div className="absolute bottom-4 left-4">
          <p className="text-white font-black text-xl leading-none drop-shadow-lg">
            Rs. {accommodation.price.toLocaleString()}
          </p>
          <p className="text-white/80 text-xs font-medium">/ month</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-black text-slate-900 text-base leading-snug line-clamp-1 mb-1">
          {accommodation.title}
        </h3>
        <p className="text-slate-400 text-xs mb-3 flex items-center gap-1 line-clamp-1">
          <span>📍</span> {accommodation.address}
        </p>

        {/* Distance */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            🎓 {accommodation.distance} {accommodation.distanceUnit} from uni
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            accommodation.isAvailable ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-600"
          }`}>
            {accommodation.isAvailable ? "Available" : "Unavailable"}
          </span>
        </div>

        {/* Facilities */}
        {accommodation.facilities?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {accommodation.facilities.slice(0, 4).map((f) => (
              <span key={f} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
                {facilityIcons[f]} {f}
              </span>
            ))}
            {accommodation.facilities.length > 4 && (
              <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">
                +{accommodation.facilities.length - 4}
              </span>
            )}
          </div>
        )}

        {/* CTA Button */}
        <button className="w-full text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl px-4 py-2.5 transition-all hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 mt-1">
          View Details & Photos
        </button>
      </div>
    </div>
  );
}