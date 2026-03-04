import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const facilityIcons: Record<string, string> = {
  WiFi: "📶", Parking: "🅿️", Laundry: "🫧", Kitchen: "🍳",
  "Air Conditioning": "❄️", "Hot Water": "🚿", Security: "🔒",
  "Study Room": "📚", Gym: "💪", CCTV: "📹",
  Furnished: "🛋️", "Water Included": "💧", "Electricity Included": "⚡",
};

function AccommodationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [acc, setAcc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activePhoto, setActivePhoto] = useState(0);
  const [showChat, setShowChat] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    axios.get(`${API}/api/accommodations/${id}`)
      .then(({ data }) => setAcc(data.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!acc) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-2xl">😕</p>
      <p className="text-slate-500">Accommodation not found</p>
      <button onClick={() => navigate("/accommodations")} className="text-indigo-600 hover:underline text-sm">
        ← Back to list
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button onClick={() => navigate("/accommodations")}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 text-sm mb-6 transition-colors">
          ← Back to listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
              <div className="relative h-72 md:h-96 bg-slate-100">
                <img src={`${API}${acc.photos[activePhoto]}`} alt={acc.title}
                  className="w-full h-full object-cover" />
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {acc.photos.map((_: any, i: number) => (
                    <button key={i} onClick={() => setActivePhoto(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === activePhoto ? "bg-white w-5" : "bg-white/60 w-1.5"
                      }`} />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 p-3 overflow-x-auto">
                {acc.photos.map((p: string, i: number) => (
                  <img key={i} src={`${API}${p}`} alt="" onClick={() => setActivePhoto(i)}
                    className={`h-14 w-20 object-cover rounded-lg cursor-pointer flex-shrink-0 transition-all ${
                      i === activePhoto ? "ring-2 ring-indigo-600" : "opacity-60 hover:opacity-100"
                    }`} />
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-black text-slate-800 mb-1">{acc.title}</h1>
                  <p className="text-slate-400 text-sm">📍 {acc.address}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
                  acc.gender === "Male" ? "bg-blue-100 text-blue-700"
                  : acc.gender === "Female" ? "bg-pink-100 text-pink-700"
                  : "bg-emerald-100 text-emerald-700"
                }`}>{acc.gender}</span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-5">{acc.description}</p>
              <h3 className="font-bold text-slate-700 mb-3 text-sm">Facilities</h3>
              <div className="flex flex-wrap gap-2 mb-5">
                {acc.facilities.map((f: string) => (
                  <span key={f} className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-full font-medium">
                    {facilityIcons[f]} {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <div className="text-center mb-4">
                <p className="text-3xl font-black text-indigo-600">Rs. {acc.price.toLocaleString()}</p>
                <p className="text-slate-400 text-sm">per month</p>
              </div>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-slate-500">Distance</span>
                <span className="font-semibold text-slate-700">{acc.distance} {acc.distanceUnit} from uni</span>
              </div>
              <div className="flex justify-between text-sm mb-5">
                <span className="text-slate-500">Available Rooms</span>
                <span className={`font-semibold ${acc.availableRooms > 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {acc.availableRooms > 0 ? acc.availableRooms : "Full"}
                </span>
              </div>
              {user && user.role !== "admin" && (
                <button onClick={() => setShowChat(true)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors text-sm">
                  💬 Chat with Owner
                </button>
              )}
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-700 mb-3 text-sm">Owner Details</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                  {acc.owner.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-slate-700 text-sm">{acc.owner.name}</p>
                  <p className="text-slate-400 text-xs">Property Owner</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <span>📞</span> <span>{acc.owner.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <span>✉️</span> <span className="truncate">{acc.owner.email}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccommodationDetail;