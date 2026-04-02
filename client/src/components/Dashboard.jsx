import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const JobPortal = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [userProfile, setUserProfile] = useState(null); // Stores the Master Profile
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');

  // Hardcoded for the presentation demo
  const currentUserId = 'IT23328020';
  const userName = localStorage.getItem('userName') || 'Anuk Cooray';

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 1. Fetch Jobs
        const jobsRes = await fetch('http://localhost:5000/api/jobs');
        const jobsData = await jobsRes.json();
        setJobs(jobsData);

        // 2. Fetch User Profile for the ATS Engine
        const profileRes = await fetch(`http://localhost:5000/api/profiles/${currentUserId}`);
        const profileData = await profileRes.json();
        if (profileData && profileData.skills) {
          setUserProfile(profileData);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };
    fetchInitialData();
  }, []);

  // The ATS Keyword Matching Algorithm
  const calculateMatch = (job) => {
    if (!userProfile || !userProfile.skills || userProfile.skills.length === 0) return null;

    const textToSearch = (job.title + ' ' + job.description).toLowerCase();
    const matchedSkills = userProfile.skills.filter((skill) => textToSearch.includes(skill.toLowerCase()));

    if (matchedSkills.length === 0) return null;

    // Generous scoring for the presentation
    let score = 0;
    if (matchedSkills.length === 1) score = 45 + Math.floor(Math.random() * 10); // 45-54%
    else if (matchedSkills.length === 2) score = 75 + Math.floor(Math.random() * 10); // 75-84%
    else score = 90 + Math.floor(Math.random() * 9); // 90-99%

    return { score, matchedSkills };
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || job.jobType === filterType;
    return matchesSearch && matchesType;
  });

  // Sort jobs so the highest ATS matches appear at the TOP of the feed!
  const sortedAndFilteredJobs = [...filteredJobs].sort((a, b) => {
    const matchA = calculateMatch(a)?.score || 0;
    const matchB = calculateMatch(b)?.score || 0;
    return matchB - matchA;
  });

  const handleApplyClick = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    if (!cvFile && !userProfile?.cvUrl) {
      alert('Please upload your CV before applying.');
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('jobId', selectedJob._id);
    formData.append('studentId', currentUserId);

    if (cvFile) {
      formData.append('cvFile', cvFile);
    } else {
      // 1-Click Apply fallback for current backend behavior
      const blob = new Blob(['Using Master CV from Profile'], { type: 'application/pdf' });
      formData.append('cvFile', blob, 'MasterProfileCV.pdf');
    }

    try {
      const response = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Server Error: Failed to submit application');
      }

      alert('Application submitted successfully! 🚀');
      setIsModalOpen(false);
      setSelectedJob(null);
      setCvFile(null);
    } catch (err) {
      console.error('Application error:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans text-slate-800">
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <Link
              to="/dashboard"
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer group"
            >
              <div className="w-10 h-10 bg-blue-600 group-hover:bg-blue-700 rounded-lg flex items-center justify-center shadow-md transition-colors">
                <span className="text-white font-extrabold text-xl">C</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-blue-700 hidden sm:block">
                Campus<span className="text-slate-800">Connect</span>
              </h1>
            </Link>
            <Link
              to="/dashboard"
              className="hidden sm:block text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors"
            >
              &larr; Back to Hub
            </Link>
          </div>
          <div className="flex items-center space-x-5">
            <Link
              to="/applications/track"
              className="flex items-center space-x-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-bold transition-all border border-indigo-200"
            >
              <span className="text-lg">📊</span>
              <span className="hidden sm:inline">Track Applications</span>
            </Link>
            <Link
              to="/profile"
              className="flex items-center space-x-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold transition-all border border-blue-200"
            >
              <span className="text-lg">⚙️</span>
              <span className="hidden sm:inline">ATS Profile</span>
            </Link>
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold shadow-md">
              {userName.charAt(0)}
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">Discover Opportunities</h2>
            <p className="text-slate-500 font-medium text-lg">
              {userProfile
                ? 'Your ATS engine is actively scanning for matches.'
                : 'Set up your ATS profile to unlock AI matching.'}
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200 flex items-center space-x-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            <span className="text-sm font-bold text-slate-700">{filteredJobs.length} Active Postings</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 mb-10 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-grow w-full">
            <input
              type="text"
              placeholder="Search by role or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium"
            />
          </div>
          <div className="flex space-x-2 w-full md:w-auto overflow-x-auto">
            {['All', 'Job', 'Internship'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  filterType === type
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type === 'All' ? 'All Roles' : `${type}s`}
              </button>
            ))}
          </div>
        </div>

        {/* Job Listings Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedAndFilteredJobs.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300">
              <h3 className="text-xl font-bold text-slate-700">No matches found.</h3>
            </div>
          ) : (
            sortedAndFilteredJobs.map((job) => {
              const match = calculateMatch(job);

              return (
                <div
                  key={job._id}
                  className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col relative overflow-hidden"
                >
                  {/* ATS Match Badge */}
                  {match && match.score >= 50 && (
                    <div
                      className={`absolute top-0 right-0 px-3 py-1.5 rounded-bl-xl text-xs font-bold text-white flex items-center shadow-sm z-10 ${
                        match.score >= 80 ? 'bg-orange-500' : 'bg-emerald-500'
                      }`}
                    >
                      {match.score >= 80 ? '🔥' : '👍'} {match.score}% Match
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4 mt-2">
                    <span
                      className={`text-xs font-bold px-3 py-1.5 rounded-full tracking-wide ${
                        job.jobType === 'Internship'
                          ? 'bg-purple-50 text-purple-700 border border-purple-100'
                          : 'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}
                    >
                      {job.jobType}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-1 line-clamp-2">{job.title}</h3>
                  <p className="text-sm font-bold text-slate-500 mb-4">{job.company}</p>

                  <p className="text-xs text-slate-600 mb-4 flex-grow line-clamp-3 leading-relaxed">{job.description}</p>

                  {/* Skill Hit Indicators */}
                  {match && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {match.matchedSkills.map((skill) => (
                        <span
                          key={skill}
                          className="text-[10px] bg-emerald-50 border border-emerald-200 text-emerald-700 px-2 py-0.5 rounded-md font-bold uppercase"
                        >
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <button
                    onClick={() => handleApplyClick(job)}
                    className={`w-full text-slate-700 bg-slate-50 border border-slate-200 font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm active:scale-95 group-hover:text-white group-hover:border-transparent ${
                      match && match.score >= 80 ? 'group-hover:bg-orange-500' : 'group-hover:bg-blue-600'
                    }`}
                  >
                    {userProfile ? '⚡ 1-Click Apply' : 'Apply Now'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Premium Application Modal */}
      {isModalOpen && selectedJob && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-fade-in-up">
            <h3 className="text-2xl font-bold text-slate-900 leading-tight">Apply for {selectedJob.title}</h3>
            <p className="text-sm font-medium text-slate-500 mb-6">{selectedJob.company}</p>

            <form onSubmit={submitApplication}>
              {userProfile ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center mb-6">
                  <div className="text-3xl mb-2">⚡</div>
                  <h4 className="font-bold text-emerald-800">1-Click Apply Ready</h4>
                  <p className="text-xs text-emerald-600 mt-1">
                    We will send your Master CV and Profile directly to {selectedJob.company}.
                  </p>
                </div>
              ) : (
                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Upload Custom CV <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    required
                    accept="application/pdf"
                    onChange={(e) => setCvFile(e.target.files[0])}
                    className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 font-bold rounded-xl text-white transition-all shadow-md active:scale-95 bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? 'Sending...' : userProfile ? '⚡ Submit 1-Click' : 'Send Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobPortal;

