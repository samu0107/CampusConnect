import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const MainDashboard = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Student');

  useEffect(() => {
    const storedName = localStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const modules = [
    {
      title: 'Job & Internship Portal',
      description:
        'Find and apply for career opportunities, manage your CV, and track applications.',
      path: '/jobs',
      color: 'from-blue-500 to-blue-700',
      shadow: 'hover:shadow-blue-200',
      icon: (
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
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
      title: 'Accommodation ',
      description: 'Manage boarding listings and sync your academic schedule in one place.',
      path: '/accommodations',
      color: 'from-emerald-400 to-emerald-600',
      shadow: 'hover:shadow-emerald-200',
      icon: (
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      title: 'Timetable Shedule ',
      description: 'Manage boarding listings and sync your academic schedule in one place.',
      path: '/time-management',
      color: 'from-emerald-400 to-emerald-600',
      shadow: 'hover:shadow-emerald-200',
      icon: (
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      title: 'Student Marketplace',
      description: 'Buy and sell academic items, textbooks, and electronics securely.',
      path: '/marketplace',
      color: 'from-purple-500 to-purple-700',
      shadow: 'hover:shadow-purple-200',
      icon: (
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
    },
    {
      title: 'Study Support & Q&A',
      description:
        'Share notes, book peer sessions, and ask questions to the community.',
      path: '/study-support',
      color: 'from-orange-400 to-orange-600',
      shadow: 'hover:shadow-orange-200',
      icon: (
        <svg
          className="w-8 h-8 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans text-slate-800">
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

          <div className="flex items-center space-x-5">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-bold text-slate-800">{userName}</span>
              <span className="text-xs font-medium text-slate-500">Student Portal</span>
            </div>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
              {userName.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={handleLogout}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-all active:scale-95"
            >
              Log Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Welcome back,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              {userName}
            </span>
          </h2>
          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto">
            Access all your academic tools, career opportunities, and campus life resources in one
            unified platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {modules.map((module, index) => (
            <Link
              to={module.path}
              key={index}
              className={`group bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-2xl ${module.shadow} hover:-translate-y-2 transition-all duration-300 flex flex-col relative overflow-hidden`}
            >
              <div
                className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${module.color} opacity-0 group-hover:opacity-100 transition-opacity`}
              />

              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                {module.icon}
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight">
                {module.title}
              </h3>
              <p className="text-sm text-slate-500 font-medium mb-8 flex-grow leading-relaxed">
                {module.description}
              </p>

              <div className="mt-auto flex items-center text-sm font-bold text-slate-400 group-hover:text-blue-600 transition-colors">
                Launch Module
                <svg
                  className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
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

export default MainDashboard;

