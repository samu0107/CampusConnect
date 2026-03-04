import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Invalid email or password');

      const user = data.user || {};
      const role = user.role;
      const name = user.name;

       if (data.token) localStorage.setItem('token', data.token);
     if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

      if (data.token) localStorage.setItem('token', data.token);
      if (name) localStorage.setItem('userName', name);
      if (role) localStorage.setItem('userRole', role);

      if (role && role.toLowerCase() === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 font-sans p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-pulse" />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-50 animate-pulse"
        style={{ animationDelay: '2s' }}
      />

      <div className="bg-white/10 backdrop-blur-2xl p-8 sm:p-10 rounded-3xl shadow-2xl w-full max-w-md border border-white/20 relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
            <span className="text-white font-extrabold text-3xl">C</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Campus<span className="text-blue-400">Connect</span>
          </h2>
          <p className="text-slate-300 font-medium mt-2">Welcome back. Please enter your details.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 p-4 rounded-xl mb-6 text-sm flex items-start">
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1.5 ml-1">
              University Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={credentials.email}
              onChange={handleChange}
              className="w-full bg-slate-900/50 border border-slate-600/50 text-white rounded-xl px-4 py-3 focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none placeholder-slate-500"
              placeholder="it23328020@my.sliit.lk"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-300 mb-1.5 ml-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={credentials.password}
              onChange={handleChange}
              className="w-full bg-slate-900/50 border border-slate-600/50 text-white rounded-xl px-4 py-3 focus:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none placeholder-slate-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-bold text-white transition-all shadow-lg active:scale-95 ${
              isLoading
                ? 'bg-blue-500/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-500/25'
            }`}
          >
            {isLoading ? (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400 font-medium">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
          >
            Apply for access
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

