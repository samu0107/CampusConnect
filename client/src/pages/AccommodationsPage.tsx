import AccommodationList from "../components/accommodation/AccommodationList";
import { Link } from "react-router-dom";

export default function AccommodationsPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans text-slate-800">
      
      {/* Navbar — same as MainDashboard */}
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
          <Link
            to="/dashboard"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-95"
          >
            ← Back to Hub
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Student{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Accommodation
          </span>
        </h2>
        <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto">
          Discover verified rooms, hostels, and apartments near your campus with smart filters and modern tooling.
        </p>
        {user?.role === "admin" && (
          <div className="mt-6">
            <Link
              to="/accommodations/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 transition-all"
            >
              + Post Listing
            </Link>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <AccommodationList />
      </div>

    </div>
  );
}