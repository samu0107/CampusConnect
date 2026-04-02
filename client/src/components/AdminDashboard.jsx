import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState('System Admin');

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) setAdminName(storedName);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const adminModules = [
    {
      title: 'Job & Internship Manager',
      description: 'Create, edit, and remove career opportunities from the live feed.',
      path: '/admin/jobs',
      accent: 'group-hover:border-blue-500 group-hover:shadow-blue-500/20',
      iconText: 'text-blue-400',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      ),
    },
    {
      title: 'Accommodation Control',
      description: 'Moderate boarding listings and resolve student disputes.',
      path: '/admin/accommodation',
      accent: 'group-hover:border-emerald-500 group-hover:shadow-emerald-500/20',
      iconText: 'text-emerald-400',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      title: 'Marketplace Moderation',
      description: 'Review flagged items and monitor peer-to-peer transactions.',
      path: '/admin/marketplace',
      accent: 'group-hover:border-purple-500 group-hover:shadow-purple-500/20',
      iconText: 'text-purple-400',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
    },
    {
      title: 'Study Support Oversight',
      description: 'Manage Q&A forums, approve notes, and oversee study sessions.',
      path: '/admin/qa',
      accent: 'group-hover:border-orange-500 group-hover:shadow-orange-500/20',
      iconText: 'text-orange-400',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300">
      <nav className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 shadow-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center shadow-lg shadow-red-600/20">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              CampusConnect{' '}
              <span className="text-sm font-bold text-red-500 tracking-widest ml-2 uppercase">
                Root Access
              </span>
            </h1>
          </div>

          <div className="flex items-center space-x-5">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-bold text-white">{adminName}</span>
              <span className="text-xs font-medium text-slate-500">System Administrator</span>
            </div>
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

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-10 border-b border-slate-800 pb-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
            System Dashboard
          </h2>
          <p className="text-slate-400 font-medium text-lg">
            Monitor infrastructure, manage database entries, and enforce platform guidelines.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminModules.map((module, index) => (
            <Link
              to={module.path}
              key={index}
              className={`group bg-slate-900 rounded-2xl p-6 border border-slate-800 shadow-lg ${module.accent} hover:-translate-y-1 transition-all duration-300 flex flex-col`}
            >
              <div
                className={`w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center mb-5 border border-slate-700 ${module.iconText} shadow-inner`}
              >
                {module.icon}
              </div>

              <h3 className="text-lg font-bold text-white mb-2 leading-tight">{module.title}</h3>
              <p className="text-sm text-slate-400 font-medium mb-6 flex-grow">
                {module.description}
              </p>

              <div className="mt-auto flex items-center text-xs font-bold text-slate-500 group-hover:text-white transition-colors uppercase tracking-wider">
                Access Panel
                <svg
                  className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;

