import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminQAManager = () => {
  const [posts, setPosts] = useState([]);
  const [formData, setFormData] = useState({ content: '', mediaType: 'none' });
  const [mediaFile, setMediaFile] = useState(null);

  // States for editing inline
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const fetchPosts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/posts');
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error('Failed to fetch posts');
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleUploadKuppi = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('authorName', 'CampusConnect Admin');
    data.append('content', formData.content);
    data.append('mediaType', formData.mediaType);
    if (mediaFile) data.append('mediaFile', mediaFile);

    try {
      await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        body: data, // Sending FormData, not JSON!
      });
      setFormData({ content: '', mediaType: 'none' });
      setMediaFile(null);
      fetchPosts();
    } catch (err) {
      console.error('Upload failed', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('WARNING: Delete this post permanently?')) {
      await fetch(`http://localhost:5000/api/posts/${id}`, { method: 'DELETE' });
      fetchPosts();
    }
  };

  const handleEditSave = async (id) => {
    await fetch(`http://localhost:5000/api/posts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: editContent }),
    });
    setEditingId(null);
    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-white">Q&A & Kuppi Management</h2>
            <p className="text-sm text-slate-500 mt-1">Moderate discussions and upload official study materials.</p>
          </div>
          <Link
            to="/admin-dashboard"
            className="flex items-center text-sm font-bold text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-4 py-2 rounded-lg"
          >
            &larr; Return to Root
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Upload Kuppi Form */}
          <div className="bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800 h-fit sticky top-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="text-red-500 mr-2">▶</span> Upload Official Kuppi
            </h3>

            <form onSubmit={handleUploadKuppi} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Upload Type</label>
                <select
                  value={formData.mediaType}
                  onChange={(e) => setFormData({ ...formData, mediaType: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="none">Text Announcement Only</option>
                  <option value="video">Video Recording (MP4)</option>
                  <option value="document">Study Material (PDF/Word)</option>
                  <option value="image">Image / Diagram</option>
                </select>
              </div>

              {formData.mediaType !== 'none' && (
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Select File</label>
                  <input
                    type="file"
                    onChange={(e) => setMediaFile(e.target.files[0])}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Description / Links</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  required
                  rows="4"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-500 transition-colors shadow-lg active:scale-95"
              >
                Broadcast to Feed
              </button>
            </form>
          </div>

          {/* RIGHT: Moderation Feed */}
          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-white mb-6">Live Database Activity</h3>

            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post._id} className="bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{post.authorName}</span>
                      {post.mediaType && post.mediaType !== 'none' && (
                        <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
                          Contains {post.mediaType}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Inline Editing Logic */}
                  {editingId === post._id ? (
                    <div className="mb-4">
                      <textarea
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none mb-2"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows="3"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditSave(post._id)}
                          className="text-xs bg-emerald-600/20 text-emerald-400 px-3 py-1 rounded border border-emerald-500/30"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs bg-slate-800 text-slate-400 px-3 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 mb-4 whitespace-pre-wrap">{post.content}</p>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 mt-auto pt-4 border-t border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingId(post._id);
                        setEditContent(post.content);
                      }}
                      className="text-xs font-bold text-blue-400 hover:text-blue-300"
                    >
                      Edit Text
                    </button>
                    <button
                      onClick={() => handleDelete(post._id)}
                      className="text-xs font-bold text-red-400 hover:text-red-300"
                    >
                      Delete Post
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminQAManager;

