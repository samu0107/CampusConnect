import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ApplicationTracker = () => {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hardcoded for presentation
  const currentUserId = 'IT23328020';

  useEffect(() => {
    const fetchMyApplications = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/applications/student/${currentUserId}`);
        const data = await response.json();
        setApplications(data);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyApplications();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer group">
            <div className="w-10 h-10 bg-blue-600 group-hover:bg-blue-700 rounded-lg flex items-center justify-center shadow-md transition-colors">
              <span className="text-white font-extrabold text-xl">C</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-blue-700 hidden sm:block">
              Campus<span className="text-slate-800">Connect</span>
            </h1>
          </Link>
          <Link
            to="/jobs"
            className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-all"
          >
            &larr; Back to Job Portal
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-6">
        <div className="mb-10 animate-fade-in-up">
          <h2 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">My Job Pipeline</h2>
          <p className="text-slate-500 font-medium text-lg">Track the real-time status of your applications.</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300 shadow-sm">
            <span className="text-5xl mb-4 block">📝</span>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">No Applications Yet</h3>
            <p className="text-slate-500 mb-6">
              You haven't applied to any jobs or internships. Head over to the Job Portal to start your career journey!
            </p>
            <Link
              to="/jobs"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-colors"
            >
              Browse Opportunities
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {applications.map((app) => (
              <div
                key={app._id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all"
              >
                {/* Header Info */}
                <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 line-clamp-1">
                      {app.jobId ? app.jobId.title : 'Listing Removed'}
                    </h3>
                    <p className="text-sm font-bold text-indigo-600 mt-1">
                      {app.jobId ? app.jobId.company : 'Unknown Company'}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Applied On</span>
                    <span className="text-sm font-semibold text-slate-700">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Visual Progress Pipeline */}
                <div className="relative pt-2">
                  <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-100 -translate-y-1/2 rounded-full z-0"></div>

                  {/* Progress Line Filler */}
                  <div
                    className={`absolute top-1/2 left-4 h-1 -translate-y-1/2 rounded-full z-0 transition-all duration-1000 ${
                      app.status === 'Pending'
                        ? 'w-1/2 bg-yellow-400'
                        : app.status === 'Shortlisted'
                          ? 'w-[calc(100%-2rem)] bg-emerald-500'
                          : 'w-[calc(100%-2rem)] bg-red-500'
                    }`}
                  ></div>

                  <div className="flex justify-between relative z-10">
                    {/* Step 1: Sent */}
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-200 text-sm">
                        ✓
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 mt-2 uppercase">Sent</span>
                    </div>

                    {/* Step 2: Under Review */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                          app.status === 'Pending'
                            ? 'bg-yellow-400 text-white shadow-md shadow-yellow-200 animate-pulse'
                            : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        {app.status === 'Pending' ? '⏳' : '✓'}
                      </div>
                      <span
                        className={`text-[10px] font-bold mt-2 uppercase ${
                          app.status === 'Pending' ? 'text-yellow-600' : 'text-slate-400'
                        }`}
                      >
                        Reviewing
                      </span>
                    </div>

                    {/* Step 3: Decision */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md ${
                          app.status === 'Shortlisted'
                            ? 'bg-emerald-500 text-white shadow-emerald-200'
                            : app.status === 'Rejected'
                              ? 'bg-red-500 text-white shadow-red-200'
                              : 'bg-white border-2 border-slate-200 text-slate-300'
                        }`}
                      >
                        {app.status === 'Shortlisted' ? '🎉' : app.status === 'Rejected' ? '✖' : '🔒'}
                      </div>
                      <span
                        className={`text-[10px] font-bold mt-2 uppercase ${
                          app.status === 'Shortlisted'
                            ? 'text-emerald-600'
                            : app.status === 'Rejected'
                              ? 'text-red-600'
                              : 'text-slate-400'
                        }`}
                      >
                        {app.status === 'Shortlisted'
                          ? 'Shortlisted'
                          : app.status === 'Rejected'
                            ? 'Rejected'
                            : 'Decision'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Message Context */}
                <div
                  className={`mt-6 p-4 rounded-xl text-sm border ${
                    app.status === 'Pending'
                      ? 'bg-yellow-50 border-yellow-100 text-yellow-800'
                      : app.status === 'Shortlisted'
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                        : 'bg-red-50 border-red-100 text-red-800'
                  }`}
                >
                  {app.status === 'Pending' && <strong>Under Review:</strong>}
                  {app.status === 'Shortlisted' && <strong>Congratulations!</strong>}
                  {app.status === 'Rejected' && <strong>Update:</strong>}
                  <span className="ml-1">
                    {app.status === 'Pending'
                      ? 'The employer is currently reviewing your CV. Keep an eye on your SLIIT inbox.'
                      : app.status === 'Shortlisted'
                        ? 'You have been selected for the next phase! Check your student email for interview details.'
                        : 'Unfortunately, the employer has moved forward with other candidates. Keep applying!'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ApplicationTracker;

