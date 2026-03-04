import { useContext } from "react";
import AccommodationList from "../components/accommodation/AccommodationList";
import { Link } from "react-router-dom";

// Assumes you have an AuthContext - adjust to match your existing auth
export default function AccommodationsPage() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div>
      {user?.role === "admin" && (
        <div className="bg-indigo-600 text-white py-2 px-4 text-center text-sm">
          Admin Mode —{" "}
          <Link to="/accommodations/new" className="underline font-semibold hover:text-indigo-200">
            + Add New Accommodation
          </Link>
        </div>
      )}
      <AccommodationList />
    </div>
  );
}