import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Accommodation = () => {
  const [places, setPlaces] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // NEW: Smart Filter States
  const [filterType, setFilterType] = useState('All');
  const [filterGender, setFilterGender] = useState('All');
  const [maxPrice, setMaxPrice] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    rent: '',
    location: '',
    address: '',
    propertyType: 'Room',
    targetGender: 'Any',
    contactNumber: '',
  });
  const [imageFiles, setImageFiles] = useState([]);

  const userName = localStorage.getItem('userName') || 'Student';

  const fetchPlaces = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/accommodation');
      const data = await res.json();
      setPlaces(data.filter((place) => place.status === 'Approved'));
    } catch (err) {
      console.error('Failed to fetch', err);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  // NEW: The Filtering Engine
  const filteredPlaces = places.filter((place) => {
    const matchType = filterType === 'All' || place.propertyType === filterType;
    const matchGender =
      filterGender === 'All' || place.targetGender === filterGender || place.targetGender === 'Any';
    const matchPrice = maxPrice === '' || place.rent <= Number(maxPrice);
    return matchType && matchGender && matchPrice;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('rent', formData.rent);
    data.append('location', formData.location);
    data.append('address', formData.address);
    data.append('propertyType', formData.propertyType);
    data.append('targetGender', formData.targetGender);
    data.append('ownerName', userName);
    data.append('contactNumber', formData.contactNumber);
    data.append('isAdmin', 'false');

    for (let i = 0; i < imageFiles.length; i++) {
      data.append('imageFiles', imageFiles[i]);
    }

    try {
      await fetch('http://localhost:5000/api/accommodation', { method: 'POST', body: data });
      setIsModalOpen(false);
      alert('Listing submitted successfully! It is pending Admin approval before it appears on the feed.');
      setFormData({
        title: '',
        description: '',
        rent: '',
        location: '',
        address: '',
        propertyType: 'Room',
        targetGender: 'Any',
        contactNumber: '',
      });
      setImageFiles([]);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSingleImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/400x300?text=No+Image';
    return `http://localhost:5000/${path.replace(/\\/g, '/')}`;
  };

  const getThumbnailUrl = (urls) => {
    if (urls && urls.length > 0) return getSingleImageUrl(urls[0]);
    return 'https://via.placeholder.com/400x300?text=No+Image';
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans text-slate-800">
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 shadow-sm flex justify-between items-center">
        <Link to="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer group">
          <div className="w-10 h-10 bg-blue-600 group-hover:bg-blue-700 rounded-lg flex items-center justify-center shadow-md transition-colors">
            <span className="text-white font-extrabold text-xl">C</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-blue-700 hidden sm:block">
            Campus<span className="text-slate-800">Connect</span>
          </h1>
        </Link>
        <div className="flex space-x-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95"
          >
            + Post Listing
          </button>
          <Link
            to="/dashboard"
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-all"
          >
            Back to Hub
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6">
        <div className="mb-8 text-center animate-fade-in-up">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Student Accommodation</h2>
          <p className="text-slate-500 font-medium">Find boarding places, annexes, and rooms near the campus.</p>
        </div>

        {/* NEW: Smart Filter Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-10 flex flex-col md:flex-row gap-4 items-center justify-between animate-fade-in-up">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all cursor-pointer"
            >
              <option value="All">All Property Types</option>
              <option value="Room">Rooms Only</option>
              <option value="Full House">Full Houses</option>
              <option value="Hostel">Hostels</option>
            </select>

            <select
              value={filterGender}
              onChange={(e) => setFilterGender(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all cursor-pointer"
            >
              <option value="All">Any Gender</option>
              <option value="Boys">Boys Accommodations</option>
              <option value="Girls">Girls Accommodations</option>
            </select>

            <div className="relative w-full md:w-48">
              <span className="absolute left-4 top-3 text-slate-400 font-bold text-sm">Rs.</span>
              <input
                type="number"
                placeholder="Max Rent"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all"
              />
            </div>

            {(filterType !== 'All' || filterGender !== 'All' || maxPrice !== '') && (
              <button
                onClick={() => {
                  setFilterType('All');
                  setFilterGender('All');
                  setMaxPrice('');
                }}
                className="text-sm font-bold text-red-500 hover:text-red-700 px-2 transition-colors flex items-center"
              >
                Clear
              </button>
            )}
          </div>

          <div className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-2.5 rounded-xl w-full md:w-auto text-center">
            {filteredPlaces.length} Matches Found
          </div>
        </div>

        {/* Listings Grid (Now maps over filteredPlaces!) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-300">
              <span className="text-4xl mb-4 block">🔍</span>
              <h3 className="text-xl font-bold text-gray-700">No properties match your filters.</h3>
              <p className="text-slate-500">Try increasing your max rent or changing the category.</p>
            </div>
          ) : (
            filteredPlaces.map((place) => (
              <div
                key={place._id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                <div className="h-56 overflow-hidden relative bg-gray-100 cursor-pointer" onClick={() => setSelectedPlace(place)}>
                  <div className="absolute top-2 left-2 flex flex-col space-y-1 z-10">
                    <span className="bg-white/90 backdrop-blur text-xs font-bold px-3 py-1.5 rounded-md text-emerald-700 shadow-sm">
                      {place.propertyType}
                    </span>
                  </div>
                  {place.imageUrls && place.imageUrls.length > 1 && (
                    <span className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-xs font-bold px-2 py-1 rounded-md z-10 shadow-sm flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        ></path>
                      </svg>
                      {place.imageUrls.length} Photos
                    </span>
                  )}
                  <img
                    src={getThumbnailUrl(place.imageUrls)}
                    alt={place.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xl font-bold text-slate-900 line-clamp-1">{place.title}</h3>
                    <span
                      className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md shadow-sm ml-2 ${
                        place.targetGender === 'Boys'
                          ? 'bg-blue-50 text-blue-600'
                          : place.targetGender === 'Girls'
                            ? 'bg-pink-50 text-pink-600'
                            : 'bg-purple-50 text-purple-600'
                      }`}
                    >
                      {place.targetGender}
                    </span>
                  </div>

                  <p className="text-2xl font-extrabold text-emerald-600 mb-2">
                    Rs. {place.rent.toLocaleString()} <span className="text-sm text-slate-500 font-medium">/ month</span>
                  </p>
                  <p className="text-xs text-slate-500 mb-4 flex items-center font-medium">📍 {place.location}</p>

                  <div className="mt-auto border-t border-gray-100 pt-4">
                    <button
                      onClick={() => setSelectedPlace(place)}
                      className="w-full bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-200 font-bold py-2.5 rounded-xl transition-all shadow-sm active:scale-95 flex justify-center items-center"
                    >
                      View Details & Photos
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* The "View Details" Popup Modal */}
      {selectedPlace && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-fade-in-up my-8 relative">
            <button
              onClick={() => setSelectedPlace(null)}
              className="absolute top-4 right-4 z-20 bg-white/80 backdrop-blur hover:bg-slate-100 text-slate-600 p-2 rounded-full shadow-md transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>

            <div className="bg-slate-100 p-4 flex gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar border-b border-gray-200">
              {selectedPlace.imageUrls && selectedPlace.imageUrls.length > 0 ? (
                selectedPlace.imageUrls.map((url, index) => (
                  <img
                    key={index}
                    src={getSingleImageUrl(url)}
                    alt={`Property ${index}`}
                    className="snap-center w-full sm:w-[80%] flex-shrink-0 h-64 object-cover rounded-2xl shadow-sm border border-gray-200"
                  />
                ))
              ) : (
                <div className="w-full h-64 flex items-center justify-center text-slate-400 bg-slate-200 rounded-2xl">No Images Provided</div>
              )}
            </div>

            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900 leading-tight">{selectedPlace.title}</h2>
                  <p className="text-emerald-600 font-extrabold text-2xl mt-1">
                    Rs. {selectedPlace.rent.toLocaleString()} <span className="text-sm text-slate-500 font-medium">/ month</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200">
                    {selectedPlace.propertyType}
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${
                      selectedPlace.targetGender === 'Boys'
                        ? 'bg-blue-50 text-blue-600 border-blue-200'
                        : selectedPlace.targetGender === 'Girls'
                          ? 'bg-pink-50 text-pink-600 border-pink-200'
                          : 'bg-purple-50 text-purple-600 border-purple-200'
                    }`}
                  >
                    For {selectedPlace.targetGender}
                  </span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Location Information</h4>
                <p className="text-sm text-slate-700 font-medium mb-1">
                  <span className="mr-2">📍</span> {selectedPlace.location}
                </p>
                <p className="text-sm text-slate-600 ml-6">{selectedPlace.address}</p>
              </div>

              <div className="mb-8">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description & Facilities</h4>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedPlace.description}</p>
              </div>

              <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                  <p className="text-xs text-slate-500">Verified Owner</p>
                  <p className="font-bold text-slate-800">{selectedPlace.ownerName}</p>
                </div>
                <a
                  href={`tel:${selectedPlace.contactNumber}`}
                  className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center active:scale-95"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    ></path>
                  </svg>
                  {selectedPlace.contactNumber}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posting Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl my-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Request Accommodation Listing</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. Single Room near SLIIT"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Type</label>
                  <select
                    value={formData.propertyType}
                    onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Room">Room</option>
                    <option value="Full House">Full House</option>
                    <option value="Hostel">Hostel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                  <select
                    value={formData.targetGender}
                    onChange={(e) => setFormData({ ...formData, targetGender: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Boys">Boys</option>
                    <option value="Girls">Girls</option>
                    <option value="Any">Any</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rent / Month</label>
                  <input
                    type="number"
                    required
                    value={formData.rent}
                    onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Area</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                    placeholder="e.g. Malabe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Address</label>
                <textarea
                  required
                  rows="2"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g. 123 Kaduwela Rd"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Number</label>
                <input
                  type="text"
                  required
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                  placeholder="07xxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Upload Photos (Up to 5)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setImageFiles(e.target.files)}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Details</label>
                <textarea
                  required
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-emerald-500"
                  placeholder="Facilities, rules, distance to uni..."
                ></textarea>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 shadow-md"
                >
                  {isSubmitting ? 'Sending...' : 'Submit for Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accommodation;

