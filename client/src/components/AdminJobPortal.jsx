import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminJobPortal = () => {
  const [jobs, setJobs] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    jobType: 'Job',
  });
  const [editingId, setEditingId] = useState(null);

  const fetchJobs = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/jobs');
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error('Failed to fetch jobs', err);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, postedBy: '65e4a3b2c1f8d900123abcde' };
    try {
      if (editingId) {
        await fetch(`http://localhost:5000/api/jobs/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch('http://localhost:5000/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setFormData({ title: '', company: '', description: '', jobType: 'Job' });
      setEditingId(null);
      fetchJobs();
    } catch (err) {
      console.error('Error saving job', err);
    }
  };

  const handleEdit = (job) => {
    setFormData({
      title: job.title,
      company: job.company,
      description: job.description,
      jobType: job.jobType,
    });
    setEditingId(job._id);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        'WARNING: Are you sure you want to permanently delete this listing from the database?',
      )
    ) {
      try {
        await fetch(`http://localhost:5000/api/jobs/${id}`, { method: 'DELETE' });
        fetchJobs();
      } catch (err) {
        console.error('Error deleting job', err);
      }
    }
  };

  const handleSyncJobs = async () => {
    setIsSyncing(true);

    const mockIndustryJobs = [
      { title: 'Software Engineering Intern', company: 'WSO2', jobType: 'Internship', description: 'Join our core platform team. Experience with Java, Spring Boot, and Microservices required. Fast-paced learning environment.' },
      { title: 'Trainee Full Stack Developer', company: 'Arimac IT', jobType: 'Internship', description: 'Looking for a sharp intern to join our engineering team. Must have strong foundational knowledge in the MERN stack (MongoDB, Express, React, Node.js).' },
      { title: 'QA Automation Engineer', company: 'Sysco LABS', jobType: 'Job', description: 'Write automated test scripts for our latest enterprise software. Knowledge of Selenium, Cypress, and CI/CD pipelines is a huge plus.' },
      { title: 'Frontend Developer', company: '99x', jobType: 'Job', description: 'Build scalable web applications for our European clients. Requires deep expertise in React, TypeScript, and modern CSS frameworks like Tailwind.' },
      { title: 'Associate Software Engineer', company: 'IFS', jobType: 'Job', description: 'Work on our core ERP systems. Strong background in C#, .NET core, and SQL Server required.' },
      { title: 'DevOps Engineering Intern', company: 'Virtusa', jobType: 'Internship', description: 'Learn cloud infrastructure management. Familiarity with AWS, Docker, and Linux command line is expected.' },
      { title: 'Data Engineer', company: 'PickMe', jobType: 'Job', description: 'Handle massive real-time data streams. Python, SQL, and experience with Big Data tools like Hadoop or Spark needed.' },
      { title: 'Cloud Architecture Trainee', company: 'Dialog Axiata', jobType: 'Internship', description: 'Assist our cloud architects in migrating legacy systems. Knowledge of Azure or AWS networking concepts required.' },
      { title: 'Game Development Intern', company: 'CreativeHub', jobType: 'Internship', description: 'Passionate about gaming? Work with Unity and Unreal Engine to build immersive 3D experiences. C# knowledge required.' },
      { title: 'UI/UX Designer Intern', company: 'Surge Global', jobType: 'Internship', description: 'Design beautiful, user-centric interfaces. Must be proficient in Figma and Adobe XD. Please attach your portfolio link.' },
      { title: 'Backend Node.js Developer', company: 'Mitra Innovation', jobType: 'Job', description: 'Scale our backend API services. Requires expertise in Node.js, Express, Redis, and highly scalable RESTful APIs.' },
      { title: 'Cybersecurity Analyst', company: 'LSEG (London Stock Exchange Group)', jobType: 'Job', description: 'Monitor and secure global financial networks. Deep understanding of networking protocols, penetration testing, and security fundamentals.' },
      { title: 'Business Analyst Trainee', company: 'Pearson', jobType: 'Internship', description: 'Bridge the gap between engineering and stakeholders. Familiarity with Agile methodologies, Scrum, and Jira required.' },
      { title: 'Machine Learning Intern', company: 'Zone24x7', jobType: 'Internship', description: 'Work on predictive retail algorithms. Strong math background and Python (TensorFlow, PyTorch) skills required.' },
      { title: 'Mobile App Developer', company: 'Calcey Technologies', jobType: 'Job', description: 'Build cross-platform mobile apps for US startups. Flutter and Dart experience is mandatory.' },
      { title: 'React Native Intern', company: 'Rootcode Labs', jobType: 'Internship', description: 'Join our mobile team. Learn to deploy to iOS and Android using React Native. JavaScript knowledge required.' },
      { title: 'Technical Writer Intern', company: 'WSO2', jobType: 'Internship', description: 'Document our open-source APIs. Excellent English writing skills and basic programming knowledge needed.' },
      { title: 'Project Management Intern', company: 'Sysco LABS', jobType: 'Internship', description: 'Assist project managers in sprint planning and unblocking developers. Great communication skills required.' },
      { title: 'Cloud Support Engineer', company: '99x', jobType: 'Job', description: 'Provide L2 support for cloud infrastructure. Linux administration and AWS troubleshooting skills needed.' },
      { title: 'ERP Support Intern', company: 'IFS', jobType: 'Internship', description: 'Learn enterprise software support. Basic SQL knowledge and excellent customer communication skills required.' },
      { title: 'Game QA Tester', company: 'Arimac IT', jobType: 'Internship', description: 'Playtest unreleased mobile and PC games. Report bugs systematically using Jira. Attention to detail is critical.' },
      { title: 'Senior Full Stack Engineer', company: 'Virtusa', jobType: 'Job', description: 'Lead enterprise modernization projects. Expert level Angular, Spring Boot, and Java required.' },
      { title: 'Site Reliability Engineer', company: 'PickMe', jobType: 'Job', description: 'Ensure 99.99% uptime for our ride-hailing services. Kubernetes, Go, and Microservices experience required.' },
      { title: 'Data Science Intern', company: 'Dialog Axiata', jobType: 'Internship', description: 'Analyze telco data to find trends. Python, R, and Pandas knowledge required.' },
      { title: '3D Animator Intern', company: 'CreativeHub', jobType: 'Internship', description: 'Rig and animate 3D character models for client projects. Blender or Maya experience needed.' },
      { title: 'Software Quality Assurance Intern', company: 'Mitra Innovation', jobType: 'Internship', description: 'Learn both manual and automated testing. Understanding of the software testing life cycle (STLC) is required.' },
      { title: 'Frontend UI Developer', company: 'Surge Global', jobType: 'Job', description: 'Turn Figma designs into pixel-perfect React code. HTML, CSS, and advanced JavaScript required.' },
      { title: 'Network Engineering Intern', company: 'LSEG', jobType: 'Internship', description: 'Assist in managing enterprise routing and switching. CCNA knowledge is highly preferred.' },
      { title: 'Product Manager', company: 'Zone24x7', jobType: 'Job', description: 'Drive the vision for our retail hardware products. 3+ years of product management experience required.' },
      { title: 'iOS Developer', company: 'Calcey Technologies', jobType: 'Job', description: "Native iOS development using Swift. Experience with Apple's human interface guidelines required." },
    ];

    try {
      const response = await fetch('http://localhost:5000/api/jobs/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobs: mockIndustryJobs }),
      });

      if (response.ok) {
        alert('⚡ Successfully synchronized 5 live industry jobs from external API!');
        fetchJobs();
      }
    } catch (error) {
      console.error('Sync failed:', error);
      alert('API Sync Failed. Check console.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-300 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-10 border-b border-slate-800 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-white">Job Database Management</h2>
            <p className="text-sm text-slate-500 mt-1">
              Live Database Connection:{' '}
              <span className="text-emerald-500 font-bold">● Active</span>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSyncJobs}
              disabled={isSyncing}
              className="flex items-center text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 rounded-lg shadow-lg shadow-indigo-500/20 transition-all border border-indigo-400/30 disabled:opacity-50"
            >
              {isSyncing ? 'Syncing...' : '⚡ Sync Industry API'}
            </button>
            <Link
              to="/admin/applications"
              className="flex items-center text-sm font-bold text-white bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-lg shadow-lg shadow-blue-500/20 transition-all"
            >
              Review Applications &rarr;
            </Link>
            <Link
              to="/admin-dashboard"
              className="flex items-center text-sm font-bold text-slate-400 hover:text-white transition-colors bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-lg"
            >
              Return
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-800 h-fit sticky top-8">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              {editingId ? 'Modify Record' : 'Inject New Record'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Listing Type
                </label>
                <select
                  name="jobType"
                  value={formData.jobType}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                >
                  <option value="Job">Job</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20 active:scale-95"
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
                        company: '',
                        description: '',
                        jobType: 'Job',
                      });
                    }}
                    className="bg-slate-800 text-slate-300 font-bold px-4 py-3 rounded-lg hover:bg-slate-700 border border-slate-700 transition-colors active:scale-95"
                  >
                    Abort
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-xl font-bold text-white mb-6">Active Database Entries</h3>

            <div className="space-y-4">
              {jobs.length === 0 ? (
                <div className="bg-slate-900 border border-dashed border-slate-700 rounded-2xl p-10 text-center">
                  <span className="text-slate-500">Database collection is currently empty.</span>
                </div>
              ) : (
                jobs.map((job) => (
                  <div
                    key={job._id}
                    className="bg-slate-900 p-6 rounded-2xl shadow-md border border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:border-slate-700 transition-colors group"
                  >
                    <div className="flex-1 pr-6">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-bold text-lg text-white leading-tight">{job.title}</h4>
                        <span
                          className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-sm ${
                            job.jobType === 'Internship'
                              ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {job.jobType}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-blue-400 mb-2">{job.company}</p>
                      <p className="text-sm text-slate-400 line-clamp-2">{job.description}</p>
                    </div>

                    <div className="flex sm:flex-col space-x-2 sm:space-x-0 sm:space-y-2 mt-4 sm:mt-0 min-w-[100px]">
                      <button
                        onClick={() => handleEdit(job)}
                        className="w-full flex justify-center items-center bg-slate-800 text-blue-400 font-bold text-xs uppercase tracking-wide py-2 rounded-lg hover:bg-blue-900/30 border border-slate-700 hover:border-blue-500/50 transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(job._id)}
                        className="w-full flex justify-center items-center bg-slate-800 text-red-400 font-bold text-xs uppercase tracking-wide py-2 rounded-lg hover:bg-red-900/30 border border-slate-700 hover:border-red-500/50 transition-all"
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

export default AdminJobPortal;

