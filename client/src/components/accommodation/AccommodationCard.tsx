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
  WiFi: "📶", Parking: "🅿️", Laundry: "🫧", Kitchen: "🍳",
  "Air Conditioning": "❄️", "Hot Water": "🚿", Security: "🔒",
  "Study Room": "📚", Gym: "💪", CCTV: "📹",
  Furnished: "🛋️", "Water Included": "💧", "Electricity Included": "⚡",
};

export default function AccommodationCard({ accommodation }: Props) {
  const [imgIdx, setImgIdx] = useState(0);
  const navigate = useNavigate();
  const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

  return (
    <div
      onClick={() => navigate(`/accommodations/${accommodation._id}`)}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100 hover:-translate-y-1"
    >
      {/* Photo Carousel */}
      <div className="relative h-52 overflow-hidden bg-slate-100">
        <img
          src={`${BASE}${accommodation.photos[imgIdx]}`}
          alt={accommodation.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {accommodation.photos.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {accommodation.photos.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setImgIdx(i); }}
                className={`h-1.5 rounded-full transition-all ${
                  i === imgIdx ? "bg-white w-3" : "bg-white/60 w-1.5"
                }`}
              />
            ))}
          </div>
        )}
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded-full ${
          accommodation.gender === "Male"
            ? "bg-blue-100 text-blue-700"
            : accommodation.gender === "Female"
            ? "bg-pink-100 text-pink-700"
            : "bg-emerald-100 text-emerald-700"
        }`}>
          {accommodation.gender}
        </span>
        {accommodation.availableRooms === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">FULL</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-slate-800 text-base leading-snug line-clamp-1 mb-1">
          {accommodation.title}
        </h3>
        <p className="text-slate-400 text-xs mb-3 line-clamp-1">📍 {accommodation.address}</p>

        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="text-2xl font-black text-indigo-600">
              Rs. {accommodation.price.toLocaleString()}
            </span>
            <span className="text-slate-400 text-xs">/month</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-lg">
            <span className="text-slate-500 text-xs">🎓</span>
            <span className="text-slate-600 text-xs font-medium">
              {accommodation.distance} {accommodation.distanceUnit}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {accommodation.facilities.slice(0, 4).map((f) => (
            <span key={f} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
              {facilityIcons[f]} {f}
            </span>
          ))}
          {accommodation.facilities.length > 4 && (
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
              +{accommodation.facilities.length - 4} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            {accommodation.availableRooms > 0
              ? `${accommodation.availableRooms} room${accommodation.availableRooms > 1 ? "s" : ""} available`
              : "No rooms available"}
          </span>
          <span className="text-xs font-semibold text-indigo-600 group-hover:underline">
            View details →
          </span>
        </div>
      </div>
    </div>
  );
}