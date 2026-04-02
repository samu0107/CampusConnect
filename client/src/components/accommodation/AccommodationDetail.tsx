import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ChatWindow from "../chat/ChatWindow";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const facilityIcons: Record<string, string> = {
  WiFi: "📶", Parking: "🅿️", Kitchen: "🍳",
  "Air Conditioning": "❄️", "Hot Water": "🚿", Security: "🔒",
  "Study Room": "📚", CCTV: "📹",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!acc) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center gap-4">
      <p className="text-4xl">😕</p>
      <p className="text-slate-500 font-medium">Accommodation not found</p>
      <button onClick={() => navigate("/accommodations")}
        className="text-blue-600 hover:underline text-sm font-semibold">
        ← Back to list
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans text-slate-800">

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg shadow-md flex items-center justify-center">
              <span className="text-white font-bold text-xl leading-none">C</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-blue-700">
              Campus<span className="text-slate-800">Connect</span>
            </h1>
          </div>
          <button
            onClick={() => navigate("/accommodations")}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-95"
          >
            ← Back to Listings
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Title */}
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-1">
            {acc.title}
          </h2>
          <p className="text-slate-500 text-sm flex items-center gap-1">
            📍 {acc.address}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left — Photos + Details */}
          <div className="lg:col-span-2 space-y-6">

            {/* Photo */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
              <div className="relative h-72 md:h-96 bg-slate-100">
                <img
                  src={`${API}${acc.photos[activePhoto]}`}
                  alt={acc.title}
                  className="w-full h-full object-cover"
                />
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
                    className={`h-14 w-20 object-cover rounded-xl cursor-pointer flex-shrink-0 transition-all ${
                      i === activePhoto ? "ring-2 ring-blue-600" : "opacity-60 hover:opacity-100"
                    }`} />
                ))}
              </div>
            </div>

            {/* Description + Facilities */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-extrabold text-slate-800">About this place</h3>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                  acc.gender === "Male" ? "bg-blue-100 text-blue-700"
                  : acc.gender === "Female" ? "bg-pink-100 text-pink-700"
                  : "bg-emerald-100 text-emerald-700"
                }`}>
                  {acc.gender === "Male" ? "👨 Male Only"
                  : acc.gender === "Female" ? "👩 Female Only"
                  : "👥 Any Gender"}
                </span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">{acc.description}</p>

              <h3 className="font-extrabold text-slate-800 mb-3 text-sm">Facilities</h3>
              <div className="flex flex-wrap gap-2">
                {acc.facilities.map((f: string) => (
                  <span key={f}
                    className="text-sm bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium border border-blue-100">
                    {facilityIcons[f]} {f}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right — Price + Owner */}
          <div className="space-y-5">

            {/* Price card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <div className="text-center mb-5">
                <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Rs. {acc.price.toLocaleString()}
                </p>
                <p className="text-slate-400 text-sm font-medium mt-1">per month</p>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex justify-between text-sm py-2 border-b border-slate-50">
                  <span className="text-slate-400 font-medium">Distance</span>
                  <span className="font-bold text-slate-700">{acc.distance} {acc.distanceUnit} from uni</span>
                </div>
                <div className="flex justify-between text-sm py-2">
                  <span className="text-slate-400 font-medium">Available Rooms</span>
                  <span className={`font-bold ${acc.availableRooms > 0 ? "text-emerald-600" : "text-red-500"}`}>
                    {acc.availableRooms > 0 ? `${acc.availableRooms} room${acc.availableRooms > 1 ? "s" : ""}` : "Full"}
                  </span>
                </div>
              </div>

              {user && user.role?.toLowerCase() !== "admin" && (
                <button
                  onClick={() => setShowChat(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-200 text-sm"
                >
                  💬 Chat with Owner
                </button>
              )}

              {showChat && (
                <ChatWindow
                  accommodationId={acc._id}
                  onClose={() => setShowChat(false)}
                />
              )}
            </div>

            {/* Owner card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-extrabold text-slate-800 mb-4 text-sm">Owner Details</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md">
                  {acc.owner.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{acc.owner.name}</p>
                  <p className="text-slate-400 text-xs">Property Owner</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-slate-600 bg-slate-50 rounded-xl px-3 py-2">
                  <span>📞</span> <span className="font-medium">{acc.owner.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 bg-slate-50 rounded-xl px-3 py-2">
                  <span>✉️</span> <span className="truncate font-medium">{acc.owner.email}</span>
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