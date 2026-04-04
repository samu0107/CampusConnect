import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const AdminAccommodation = () => {
  const [places, setPlaces] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rent: '',
    location: '',
    address: '',
    propertyType: 'Room',
    targetGender: 'Any',
    ownerName: 'Admin Verified',
    contactNumber: '',
  });
  const [imageFiles, setImageFiles] = useState([]);

  const fetchPlaces = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/accommodation');
      const data = await res.json();
      setPlaces(data);
    } catch (err) {
      console.error('Failed to fetch', err);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const handleStatusUpdate = async (id, status) => {
    await fetch(`http://localhost:5000/api/accommodation/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchPlaces();
  };

  const handleDelete = async (id) => {
    if (window.confirm('WARNING: Delete this accommodation listing permanently?')) {
      await fetch(`http://localhost:5000/api/accommodation/${id}`, { method: 'DELETE' });
      fetchPlaces();
    }
  };

  // Admin directly adds an Approved listing
  const handleDirectAdd = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('rent', formData.rent);
    data.append('location', formData.location);
    data.append('address', formData.address);
    data.append('propertyType', formData.propertyType);
    data.append('targetGender', formData.targetGender);
    data.append('ownerName', formData.ownerName);
    data.append('contactNumber', formData.contactNumber);
    data.append('isAdmin', 'true');
    for (let i = 0; i < imageFiles.length; i++) {
      data.append('imageFiles', imageFiles[i]);
    }

    try {
      await fetch('http://localhost:5000/api/accommodation', { method: 'POST', body: data });
      setFormData({
        title: '',
        description: '',
        rent: '',
        location: '',
        address: '',
        propertyType: 'Room',
        targetGender: 'Any',
        ownerName: 'Admin Verified',
        contactNumber: '',
      });
      setImageFiles([]);
      const fileInput = document.getElementById('accFileInput');
      if (fileInput) fileInput.value = '';
      fetchPlaces();
    } catch (err) {
      console.error('Submission failed', err);
    }
  };

  const formatImageUrl = (urls) =>
    urls && urls.length > 0
      ? `http://localhost:5000/${urls[0].replace(/\\/g, '/')}`
      : 'https://via.placeholder.com/150?text=No+Image';

  const pendingPlaces = places.filter((p) => p.status === 'Pending');
  const activePlaces = places.filter((p) => p.status === 'Approved');

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-white">Accommodation Control</h2>
            <p className="text-sm text-slate-500 mt-1">
              Approve student posts and manage university-approved housing.
            </p>
          </div>
          <Link
            to="/admin-dashboard"
            className="flex items-center text-sm font-bold text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg"
          >
            &larr; Return to Root
          </Link>
        </div>

        {pendingPlaces.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-bold text-orange-400 mb-4 flex items-center">
              <span className="animate-pulse mr-2">⚠️</span> Pending Student Approvals ({pendingPlaces.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingPlaces.map((place) => (
                <div key={place._id} className="bg-slate-900 p-5 rounded-xl border border-orange-500/50 shadow-lg">
                  <div className="flex items-center space-x-4 mb-3">
                    <img src={formatImageUrl(place.imageUrls)} className="w-16 h-16 object-cover rounded-lg border border-slate-700" alt="Property" />
                    <div>
                      <h4 className="font-bold text-white text-sm line-clamp-1">{place.title}</h4>
                      <p className="text-xs text-slate-400">By: {place.ownerName}</p>
                      <p className="text-xs text-orange-300 font-bold">
                        {place.propertyType} - {place.targetGender}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={() => handleStatusUpdate(place._id, 'Approved')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(place._id, 'Rejected')}
                      className="flex-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2 rounded transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800 h-fit sticky top-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="text-emerald-500 mr-2">🏠</span> Inject Approved Listing
            </h3>

            <form onSubmit={handleDirectAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Rent</label>
                  <input
                    type="number"
                    required
                    value={formData.rent}
                    onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Type</label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                  >
                    <option value="Room">Room</option>
                    <option value="Full House">House</option>
                    <option value="Hostel">Hostel</option>
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Gender</label>
                  <select
                    value={formData.targetGender}
                    onChange={(e) => setFormData({ ...formData, targetGender: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                  >
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                    <option value="Any">Any</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Area</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                    placeholder="Malabe"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Contact</label>
                  <input
                    type="text"
                    required
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Images (Up to 5)</label>
                <input
                  id="accFileInput"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setImageFiles(e.target.files)}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-slate-800 file:text-emerald-400"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
                <textarea
                  required
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-emerald-500 shadow-lg active:scale-95"
              >
                Execute Direct Insert
              </button>
            </form>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-white mb-6">Active Approved Database</h3>
            <div className="space-y-4">
              {activePlaces.length === 0 ? (
                <div className="bg-slate-900 border border-dashed border-slate-700 rounded-2xl p-10 text-center text-slate-500">
                  No active listings.
                </div>
              ) : (
                activePlaces.map((place) => (
                  <div
                    key={place._id}
                    className="bg-slate-900 p-4 rounded-2xl shadow-md border border-slate-800 flex flex-col sm:flex-row items-center"
                  >
                    <img
                      src={formatImageUrl(place.imageUrls)}
                      alt={place.title}
                      className="w-24 h-24 object-cover rounded-xl border border-slate-700 sm:mr-6 mb-4 sm:mb-0"
                    />
                    <div className="flex-1 text-center sm:text-left">
                      <h4 className="font-bold text-lg text-white">{place.title}</h4>
                      <p className="text-md font-extrabold text-blue-400 mb-1">Rs. {place.rent.toLocaleString()}</p>
                      <p className="text-xs text-slate-400 mb-1">
                        {place.propertyType} for {place.targetGender} - {place.location}
                      </p>
                      <p className="text-xs text-slate-500">
                        Owner: <span className="text-slate-300">{place.ownerName}</span> | {place.contactNumber}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(place._id)}
                      className="px-4 py-2 bg-slate-800 text-red-400 font-bold text-xs uppercase rounded-lg hover:bg-red-900/30 border border-slate-700"
                    >
                      Drop
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAccommodation;

