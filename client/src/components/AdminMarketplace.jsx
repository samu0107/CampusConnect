import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const AdminMarketplace = () => {
  const [items, setItems] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Electronics',
    sellerName: 'CampusConnect Admin',
    sellerContact: '',
  });
  const [imageFile, setImageFile] = useState(null);

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

  // Handles BOTH Add (POST) and Edit (PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('sellerName', formData.sellerName);
    data.append('sellerContact', formData.sellerContact);
    if (imageFile) data.append('imageFile', imageFile);

    try {
      if (editingId) {
        await fetch(`http://localhost:5000/api/marketplace/${editingId}`, {
          method: 'PUT',
          body: data,
        });
      } else {
        await fetch('http://localhost:5000/api/marketplace', {
          method: 'POST',
          body: data,
        });
      }

      setFormData({
        title: '',
        description: '',
        price: '',
        category: 'Electronics',
        sellerName: 'CampusConnect Admin',
        sellerContact: '',
      });
      setImageFile(null);
      setEditingId(null);

      // Reset the file input visually
      const el = document.getElementById('fileInput');
      if (el) el.value = '';

      fetchItems();
    } catch (err) {
      console.error('Submission failed', err);
    }
  };

  const handleEditClick = (item) => {
    setFormData({
      title: item.title,
      description: item.description,
      price: item.price,
      category: item.category,
      sellerName: item.sellerName,
      sellerContact: item.sellerContact,
    });
    setEditingId(item._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('WARNING: Are you sure you want to permanently delete this listing?')) {
      await fetch(`http://localhost:5000/api/marketplace/${id}`, { method: 'DELETE' });
      fetchItems();
    }
  };

  const formatImageUrl = (path) =>
    path ? `http://localhost:5000/${path.replace(/\\/g, '/')}` : 'https://via.placeholder.com/150?text=No+Image';

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-white">Marketplace Moderation</h2>
            <p className="text-sm text-slate-500 mt-1">Add official items, edit listings, and remove violations.</p>
          </div>
          <Link
            to="/admin-dashboard"
            className="flex items-center text-sm font-bold text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg"
          >
            &larr; Return to Root
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Add/Edit Form */}
          <div className="bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800 h-fit sticky top-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="text-purple-500 mr-2">🛒</span> {editingId ? 'Edit Listing' : 'Inject New Listing'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Price (Rs.)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Books">Books</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Seller Name</label>
                  <input
                    type="text"
                    required
                    value={formData.sellerName}
                    onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contact</label>
                  <input
                    type="text"
                    required
                    value={formData.sellerContact}
                    onChange={(e) => setFormData({ ...formData, sellerContact: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Upload Image {editingId && '(Optional to replace)'}
                </label>
                <input
                  id="fileInput"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-slate-800 file:text-purple-400 hover:file:bg-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                <textarea
                  required
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-500 transition-colors shadow-lg active:scale-95"
                >
                  {editingId ? 'Commit Update' : 'Execute Insert'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({
                        title: '',
                        description: '',
                        price: '',
                        category: 'Electronics',
                        sellerName: 'CampusConnect Admin',
                        sellerContact: '',
                      });
                      setImageFile(null);
                    }}
                    className="bg-slate-800 text-slate-300 font-bold px-4 py-3 rounded-lg hover:bg-slate-700 border border-slate-700 transition-colors active:scale-95"
                  >
                    Abort
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* RIGHT: Active Listings Grid */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-white mb-6">Active Marketplace Database</h3>

            <div className="space-y-4">
              {items.length === 0 ? (
                <div className="bg-slate-900 border border-dashed border-slate-700 rounded-2xl p-10 text-center text-slate-500">
                  Database collection is currently empty.
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item._id}
                    className="bg-slate-900 p-4 rounded-2xl shadow-md border border-slate-800 flex flex-col sm:flex-row items-center hover:border-slate-700 transition-colors group"
                  >
                    <img
                      src={formatImageUrl(item.imageUrl)}
                      alt={item.title}
                      className="w-24 h-24 object-cover rounded-xl border border-slate-700 sm:mr-6 mb-4 sm:mb-0 bg-slate-950"
                    />

                    <div className="flex-1 text-center sm:text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 mb-1">
                        <h4 className="font-bold text-lg text-white">{item.title}</h4>
                        <span className="text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-sm bg-purple-500/10 text-purple-400 border border-purple-500/20 inline-block w-fit mx-auto sm:mx-0">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-md font-extrabold text-emerald-400 mb-1">
                        Rs. {item.price?.toLocaleString?.() || item.price}
                      </p>
                      <p className="text-xs text-slate-500 mb-2">
                        Seller: <span className="text-slate-300">{item.sellerName}</span> | {item.sellerContact}
                      </p>
                    </div>

                    <div className="flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 w-full sm:w-auto mt-4 sm:mt-0">
                      <button
                        type="button"
                        onClick={() => handleEditClick(item)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 text-blue-400 font-bold text-xs uppercase tracking-wide rounded-lg hover:bg-blue-900/30 border border-slate-700 hover:border-blue-500/50 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 text-red-400 font-bold text-xs uppercase tracking-wide rounded-lg hover:bg-red-900/30 border border-slate-700 hover:border-red-500/50 transition-all"
                      >
                        Drop
                      </button>
                    </div>
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

export default AdminMarketplace;

