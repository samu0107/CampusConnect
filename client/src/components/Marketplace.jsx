import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Marketplace = () => {
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Electronics',
    sellerContact: '',
  });
  const [imageFile, setImageFile] = useState(null);

  const userName = localStorage.getItem('userName') || 'Student';

  const fetchItems = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/marketplace');
      const data = await res.json();
      setItems(data);
    } catch (err) {
      console.error('Failed to fetch items', err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleListSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('sellerName', userName);
    data.append('sellerContact', formData.sellerContact);
    if (imageFile) data.append('imageFile', imageFile);

    try {
      await fetch('http://localhost:5000/api/marketplace', { method: 'POST', body: data });
      setIsModalOpen(false);
      setFormData({ title: '', description: '', price: '', category: 'Electronics', sellerContact: '' });
      setImageFile(null);
      fetchItems();
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/400x300?text=No+Image';
    return `http://localhost:5000/${path.replace(/\\/g, '/')}`;
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans text-slate-800">
      {/* Navbar */}
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
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-md transition-all active:scale-95"
          >
            + List an Item
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
        <div className="mb-10 text-center animate-fade-in-up">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Student Marketplace</h2>
          <p className="text-slate-500 font-medium">
            Buy and sell textbooks, electronics, and dorm essentials securely on campus.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-300">
              <span className="text-4xl mb-4 block">📦</span>
              <h3 className="text-xl font-bold text-gray-700">The marketplace is empty.</h3>
              <p className="text-gray-500">Be the first to list an item!</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
              >
                <div className="h-48 overflow-hidden relative bg-gray-100">
                  <span className="absolute top-2 right-2 bg-white/90 backdrop-blur text-xs font-bold px-2.5 py-1 rounded-md text-slate-700 shadow-sm z-10 uppercase tracking-wide">
                    {item.category}
                  </span>
                  <img
                    src={formatImageUrl(item.imageUrl)}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1 mb-1">{item.title}</h3>
                  <p className="text-2xl font-extrabold text-purple-600 mb-3">Rs. {item.price.toLocaleString()}</p>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">{item.description}</p>

                  <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                        {item.sellerName ? item.sellerName.charAt(0) : '?'}
                      </div>
                      <span className="text-xs font-semibold text-slate-600 truncate max-w-[80px]">
                        {item.sellerName}
                      </span>
                    </div>
                    <a
                      href={`mailto:${item.sellerContact}`}
                      className="text-xs font-bold bg-purple-50 text-purple-600 hover:bg-purple-100 px-3 py-1.5 rounded-md transition-colors"
                    >
                      Contact
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* List Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in-up">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">List an Item for Sale</h3>
            <form onSubmit={handleListSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-purple-500"
                  placeholder="e.g. MSI Gaming Monitor"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Price (Rs.)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-purple-500"
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-purple-500"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Books">Books</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contact Email/Phone</label>
                <input
                  type="text"
                  required
                  value={formData.sellerContact}
                  onChange={(e) => setFormData({ ...formData, sellerContact: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-purple-500"
                  placeholder="077xxxxxxx or email"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Upload Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Description</label>
                <textarea
                  required
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-purple-500"
                  placeholder="Condition, specs, etc."
                />
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
                  className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-xl hover:bg-purple-700 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Posting...' : 'Post Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;

