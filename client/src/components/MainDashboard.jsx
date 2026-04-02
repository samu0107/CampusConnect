import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const MainDashboard = () => {
  const navigate = useNavigate();
  // Using your default SLIIT details as the fallback for the presentation!
  const [userName, setUserName] = useState(localStorage.getItem('userName') || 'Anuk Cooray');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [feedPosts, setFeedPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const currentUserId = 'IT23328020';

  const fetchPosts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/posts');
      const data = await response.json();
      setFeedPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/notifications/${currentUserId}`);
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, { method: 'PUT' });
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    setIsPosting(true);
    try {
      const response = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ authorName: userName, content: newPostContent, mediaType: 'none' }),
      });

      if (response.ok) {
        setNewPostContent('');
        fetchPosts();
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const formatMediaUrl = (path) => (path ? `http://localhost:5000/${path.replace(/\\/g, '/')}` : '');

  const navigationLinks = [
    { name: 'Study Support Feed', path: '/dashboard', icon: '📚', color: 'bg-blue-100 text-blue-600', active: true },
    { name: 'Job & Internship Portal', path: '/jobs', icon: '💼', color: 'bg-indigo-100 text-indigo-600', active: false },
    { name: 'Accommodation', path: '/accommodation', icon: '🏠', color: 'bg-emerald-100 text-emerald-600', active: false },
    { name: 'Student Marketplace', path: '/marketplace', icon: '🛒', color: 'bg-purple-100 text-purple-600', active: false },
  ];

  return (
    <div className="min-h-screen bg-[#F3F2EF] font-sans text-slate-800">
      {/* Premium Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 px-4 sm:px-8 py-2 shadow-sm flex justify-between items-center h-16">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-extrabold text-2xl">C</span>
          </div>
          <div className="hidden relative w-72 md:block">
            <input
              type="text"
              placeholder="Search posts, jobs, or students..."
              className="w-full bg-slate-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-md py-2 pl-10 pr-4 text-sm transition-all outline-none"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="relative">
            <div
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="flex flex-col items-center text-slate-500 hover:text-blue-600 cursor-pointer transition-colors relative"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
              </svg>
              <span className="text-[10px] font-bold mt-1 hidden sm:block">Notifications</span>

              {unreadCount > 0 && (
                <div className="absolute -top-1 right-2 sm:-top-1 sm:right-4 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm animate-fade-in-up">
                  {unreadCount}
                </div>
              )}
            </div>

            {showNotifDropdown && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-fade-in-up">
                <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                  <h3 className="font-bold text-slate-800">Notifications</h3>
                  {unreadCount > 0 && <span className="text-xs text-blue-600 font-bold hover:underline cursor-pointer">Mark all as read</span>}
                </div>

                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500 font-medium">No new notifications.</div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif._id}
                        onClick={() => markAsRead(notif._id)}
                        className={`p-4 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 flex gap-3 ${!notif.isRead ? 'bg-blue-50/30' : ''}`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-lg ${notif.type === 'Job' ? 'bg-indigo-100' : notif.type === 'Accommodation' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                          {notif.type === 'Job' ? '💼' : notif.type === 'Accommodation' ? '🏠' : '🔔'}
                        </div>
                        <div>
                          <p className={`text-sm ${!notif.isRead ? 'font-bold text-slate-900' : 'text-slate-600 font-medium'}`}>{notif.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wide">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {!notif.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 ml-auto flex-shrink-0"></div>}
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-2 border-t border-slate-100 text-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                  <span className="text-xs font-bold text-blue-600">View All Settings</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center border-l border-slate-200 pl-6">
            <button
              onClick={handleLogout}
              className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm flex items-center space-x-2 active:scale-95"
              title="Securely sign out of CampusConnect"
            >
              <span className="text-lg">🚪</span>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      {/* THE NEW 12-COLUMN GRID LAYOUT */}
      <div className="max-w-7xl mx-auto pt-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
          {/* LEFT SIDEBAR (Col span 3) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-4">
              {/* 🌟 FIXED: Left-Aligned Profile Widget */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center space-x-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="h-14 w-14 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-sm">
                  {userName ? userName.charAt(0).toUpperCase() : 'A'}
                </div>
                <div className="overflow-hidden flex-1">
                  <h3 className="font-bold text-slate-900 text-sm truncate" title={userName}>{userName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">IT Undergraduate</p>
                  <p className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">IT23328020</p>
                </div>
              </div>

              {/* FIXED: Compact Navigation Menu */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 space-y-1">
                {navigationLinks.map((link, index) => (
                  <Link key={index} to={link.path} className={`flex items-center space-x-3 px-3 py-3 rounded-lg font-semibold text-sm transition-all ${link.active ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-600'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg flex-shrink-0 ${link.active ? link.color : 'bg-slate-100 text-slate-500'}`}>{link.icon}</div>
                    <span className="truncate">{link.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* CENTER FEED (Col span 6) */}
          <div className="lg:col-span-6 space-y-6 pb-20">
            {/* Create Post Box */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
              <form onSubmit={handleCreatePost}>
                <div className="flex space-x-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-blue-600 to-blue-400 flex-shrink-0 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-grow">
                    <input
                      type="text"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder={`Ask a question or share notes, ${userName.split(' ')[0]}?`}
                      className="w-full bg-slate-100 hover:bg-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 border border-transparent focus:border-blue-300 rounded-full px-5 py-3 text-sm outline-none transition-all font-medium"
                      disabled={isPosting}
                    />
                  </div>
                </div>
                <div className="border-t border-slate-100 mt-4 pt-3 flex justify-between px-2">
                  <button type="button" className="flex items-center space-x-2 text-slate-500 hover:bg-slate-100 py-2 px-4 rounded-lg font-semibold text-sm transition-colors">
                    <span className="text-blue-500 text-lg">📷</span> <span>Photo</span>
                  </button>
                  <button type="button" className="flex items-center space-x-2 text-slate-500 hover:bg-slate-100 py-2 px-4 rounded-lg font-semibold text-sm transition-colors">
                    <span className="text-orange-500 text-lg">📄</span> <span>Document</span>
                  </button>
                  <button
                    type="submit"
                    disabled={!newPostContent.trim() || isPosting}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-6 rounded-full font-bold text-sm transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                  >
                    {isPosting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </form>
            </div>

            {/* Feed Posts */}
            {feedPosts.length === 0 ? (
              <div className="text-center text-slate-500 py-10 bg-white rounded-xl border border-dashed border-slate-300">
                No questions yet. Be the first to ask!
              </div>
            ) : (
              feedPosts.map((post) => (
                <div key={post._id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-fade-in-up">
                  <div className="p-4 sm:p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm ${
                            post.authorName.includes('Admin')
                              ? 'bg-slate-900'
                              : 'bg-gradient-to-tr from-slate-400 to-slate-600'
                          }`}
                        >
                          {post.authorName ? post.authorName.charAt(0).toUpperCase() : 'S'}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm flex items-center hover:text-blue-600 cursor-pointer">
                            {post.authorName || 'Unknown Student'}
                            {post.authorName.includes('Admin') && (
                              <svg className="w-4 h-4 text-blue-500 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                ></path>
                              </svg>
                            )}
                          </h4>
                          <p className="text-[11px] text-slate-500 flex items-center">
                            {new Date(post.createdAt).toLocaleDateString()} <span className="mx-1">•</span> 🌎
                          </p>
                        </div>
                      </div>
                      <button className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z"></path>
                        </svg>
                      </button>
                    </div>

                    <p className="text-slate-800 text-sm mb-4 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                    {/* Media Rendering */}
                    {post.mediaUrl && post.mediaType !== 'none' && (
                      <div className="mt-3 mb-2 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                        {post.mediaType === 'video' && (
                          <div className="relative group">
                            <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] tracking-wider uppercase font-bold px-2.5 py-1 rounded shadow-md z-10 animate-pulse flex items-center">
                              <span className="w-2 h-2 bg-white rounded-full mr-1.5 animate-ping"></span> Watch Kuppi
                            </div>
                            <video controls className="w-full max-h-[500px] object-cover bg-black" src={formatMediaUrl(post.mediaUrl)}></video>
                          </div>
                        )}
                        {post.mediaType === 'image' && (
                          <img src={formatMediaUrl(post.mediaUrl)} alt="Material" className="w-full max-h-[500px] object-cover" />
                        )}
                        {post.mediaType === 'document' && (
                          <div className="p-4 flex items-center justify-between bg-white border-y border-slate-100">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center text-red-600 text-xl">📄</div>
                              <div>
                                <p className="font-bold text-slate-900 text-sm">Study Material Attached</p>
                                <p className="text-[11px] text-slate-500 uppercase tracking-wide">PDF Document</p>
                              </div>
                            </div>
                            <a
                              href={formatMediaUrl(post.mediaUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                            >
                              Download
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-between text-[11px] text-slate-500 mt-4 px-1 border-b border-slate-100 pb-3">
                      <span className="flex items-center space-x-1">
                        <span className="bg-blue-500 rounded-full w-4 h-4 flex items-center justify-center text-white text-[10px]">
                          👍
                        </span>{' '}
                        <span>{post.likes}</span>
                      </span>
                      <span>{post.commentCount} Comments</span>
                    </div>
                  </div>

                  <div className="px-2 py-1 flex justify-between bg-white">
                    <button className="flex-1 flex items-center justify-center space-x-2 text-slate-500 hover:bg-slate-100 py-3 rounded-lg font-bold text-sm transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                        ></path>
                      </svg>
                      <span>Like</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center space-x-2 text-slate-500 hover:bg-slate-100 py-3 rounded-lg font-bold text-sm transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        ></path>
                      </svg>
                      <span>Comment</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center space-x-2 text-slate-500 hover:bg-slate-100 py-3 rounded-lg font-bold text-sm transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        ></path>
                      </svg>
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* RIGHT SIDEBAR (Col span 3) */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-4">
              {/* Trending Widget */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                <h3 className="font-bold text-slate-900 mb-4 px-1 flex items-center justify-between">
                  Trending on Campus
                  <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </h3>
                <ul className="space-y-1">
                  <li className="hover:bg-slate-50 p-2 rounded-lg cursor-pointer transition-colors group">
                    <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                      #SLIIT Final Year Project Defenses
                    </p>
                    <p className="text-xs text-slate-500 mt-1">120 recent posts</p>
                  </li>
                  <li className="hover:bg-slate-50 p-2 rounded-lg cursor-pointer transition-colors group">
                    <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                      MERN Stack Debugging Session
                    </p>
                    <p className="text-xs text-slate-500 mt-1">45 recent posts</p>
                  </li>
                  <li className="hover:bg-slate-50 p-2 rounded-lg cursor-pointer transition-colors group">
                    <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                      Internship Hunting Tips 2026
                    </p>
                    <p className="text-xs text-slate-500 mt-1">89 recent posts</p>
                  </li>
                </ul>
                <button className="w-full text-center text-sm font-bold text-blue-600 hover:text-blue-700 mt-2 p-2 hover:bg-blue-50 rounded-lg transition-colors">
                  Show More
                </button>
              </div>

              {/* Legal / Footer Links */}
              <div className="flex flex-wrap gap-x-3 gap-y-1 px-4 text-[11px] font-medium text-slate-500 justify-center">
                <a href="#" className="hover:text-blue-600 hover:underline">
                  About
                </a>
                <a href="#" className="hover:text-blue-600 hover:underline">
                  Accessibility
                </a>
                <a href="#" className="hover:text-blue-600 hover:underline">
                  Help Center
                </a>
                <a href="#" className="hover:text-blue-600 hover:underline">
                  Privacy & Terms
                </a>
                <a href="#" className="hover:text-blue-600 hover:underline">
                  Ad Choices
                </a>
                <div className="w-full text-center mt-2 flex items-center justify-center space-x-1">
                  <span className="font-bold text-blue-600">CampusConnect</span> <span>© 2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;

