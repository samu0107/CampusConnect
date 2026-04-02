import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleStandardLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Standard MERN Auth Fetch
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials');
      }

      // Store tokens and user details
      localStorage.setItem('token', data.token);
      localStorage.setItem('userName', data.user.name);
      
      // FIX: force lowercase so "Admin" or "admin" both work
      const userRole = data.user.role ? data.user.role.toLowerCase() : 'student';
      localStorage.setItem('userRole', userRole);

      // Route based on role
      if (userRole === 'admin') {
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
    <div className="min-h-screen w-full flex bg-white font-sans text-slate-800 selection:bg-blue-500 selection:text-white">
      {/* LEFT SIDE: Animated Hero Branding (Hidden on mobile, visible on md+ screens) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 relative items-center justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"></div>
        <div
          className="absolute bottom-20 right-20 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse-slow"
          style={{ animationDelay: '1s' }}
        ></div>

        {/* Floating Glassmorphism Card */}
        <div className="relative z-10 w-3/4 max-w-lg bg-white/10 backdrop-blur-lg border border-white/20 p-10 rounded-3xl shadow-2xl animate-float">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg mb-8">
            <span className="text-blue-600 font-extrabold text-3xl">C</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight">
            The Ultimate <br />
            Campus Ecosystem.
          </h1>
          <p className="text-blue-100 text-lg mb-8 font-medium leading-relaxed">
            Connect with peers, find exclusive tech internships, secure boarding, and trade resources all in one intelligent
            platform.
          </p>

          <div className="flex items-center space-x-4">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-indigo-700 bg-emerald-400 flex items-center justify-center text-xs font-bold text-white">
                IT
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-indigo-700 bg-orange-400 flex items-center justify-center text-xs font-bold text-white">
                SE
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-indigo-700 bg-purple-400 flex items-center justify-center text-xs font-bold text-white">
                CS
              </div>
            </div>
            <p className="text-sm text-blue-200 font-medium">Joined by 4,000+ Undergraduates</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Clean Modern Login Form */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center p-8 sm:p-12 relative bg-slate-50">
        {/* Mobile Logo (Only shows on small screens) */}
        <div className="md:hidden flex items-center space-x-3 mb-10 absolute top-8 left-8">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
            <span className="text-white font-extrabold text-xl">C</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-blue-700">CampusConnect</h1>
        </div>

        <div className="w-full max-w-md animate-fade-in-up">
          <div className="mb-10 text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500 font-medium">Please enter your credentials to access your portal.</p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center">
              <span className="mr-2">⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleStandardLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Student Email / IT Number
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-5 py-3.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                placeholder="it23xxxxxx@my.sliit.lk"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                <a href="#" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot Password?
                </a>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-5 py-3.5 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/30 active:scale-95 text-sm mt-4 disabled:opacity-70 flex justify-center items-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Sign In to Portal'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-bold hover:underline">
              Register here
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default Login;

