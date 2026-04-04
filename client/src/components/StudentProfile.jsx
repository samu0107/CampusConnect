import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const StudentProfile = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  
  const currentUserId = 'IT23328020'; 
  const currentUserName = localStorage.getItem('userName') || 'Anuk Cooray';

  const [formData, setFormData] = useState({
    fullName: currentUserName,
    major: 'Information Technology',
    skills: '', 
    githubLink: '',
    bio: '',
    phone: '',
    profilePicUrl: null
  });
  
  const [cvFile, setCvFile] = useState(null);
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [picPreview, setPicPreview] = useState(null); // For real-time image preview

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/profiles/${currentUserId}`);
        const data = await res.json();
        if (data && data._id) {
          setProfileExists(true);
          setFormData({
            fullName: data.fullName,
            major: data.major,
            skills: data.skills.join(', '), 
            githubLink: data.githubLink || '',
            bio: data.bio || '',
            phone: data.phone || '',
            profilePicUrl: data.profilePicUrl || null
          });
        }
      } catch (err) { console.error('No profile found yet'); }
    };
    fetchProfile();
  }, []);

  // Handle local image preview instantly when user selects a file
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicFile(file);
      setPicPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const data = new FormData();
    data.append('studentId', currentUserId);
    data.append('fullName', formData.fullName);
    data.append('major', formData.major);
    data.append('skills', formData.skills);
    data.append('githubLink', formData.githubLink);
    data.append('bio', formData.bio);
    data.append('phone', formData.phone);
    
    if (cvFile) data.append('cvFile', cvFile);
    if (profilePicFile) data.append('profilePic', profilePicFile);

    try {
      await fetch('http://localhost:5000/api/profiles', { method: 'POST', body: data });
      alert('Profile details and avatar updated successfully! 🚀');
      setProfileExists(true);
    } catch (err) { 
      console.error('Save failed', err); 
      alert(`Error saving profile: ${err.message}`);
    }
    finally { setIsSubmitting(false); }
  };

  const formatImageUrl = (path) => path ? `http://localhost:5000/${path.replace(/\\/g, '/')}` : null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-12">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 shadow-sm mb-8">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-extrabold text-xl">C</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-blue-700 hidden sm:block">Campus<span className="text-slate-800">Connect</span></h1>
          </Link>
          <Link to="/dashboard" className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-bold transition-all">
            &larr; Back to Hub
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        <div className="mb-8 text-center animate-fade-in-up">
          <h2 className="text-4xl font-extrabold text-slate-900">Account Settings</h2>
          <p className="text-sm text-slate-500 mt-2">Customize your profile, update your avatar, and tweak your ATS settings.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in-up">
          
          {/* Cover Photo Area */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
            {profileExists && (
              <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center">
                <span className="animate-ping w-2 h-2 bg-white rounded-full mr-2"></span> Profile Live
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-8 sm:p-12 pt-0 relative">
            
            {/* Interactive Avatar Upload */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-8 gap-6 relative z-10">
              <div className="relative group cursor-pointer">
                <div className="w-32 h-32 rounded-full border-4 border-white bg-slate-200 shadow-lg overflow-hidden flex items-center justify-center">
                  {picPreview ? (
                     <img src={picPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : formData.profilePicUrl ? (
                     <img src={formatImageUrl(formData.profilePicUrl)} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                     <span className="text-5xl text-slate-400 font-bold">{formData.fullName.charAt(0)}</span>
                  )}
                </div>
                {/* Hover Overlay */}
                <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white text-sm font-bold flex-col">
                  <span className="text-2xl mb-1">📷</span> Upload
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
              
              <div className="text-center sm:text-left mb-2">
                <h3 className="text-2xl font-extrabold text-slate-900">{formData.fullName}</h3>
                <p className="text-sm text-slate-500 font-mono mt-1">{currentUserId} • {formData.major}</p>
              </div>
            </div>

            {/* Profile Form Grid */}
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                  <input type="text" required value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone Number</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+94 7X XXX XXXX" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Short Bio</label>
                <textarea rows="2" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} placeholder="Tell your peers and recruiters a bit about yourself..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium"></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Degree / Major</label>
                  <input type="text" required value={formData.major} onChange={(e) => setFormData({...formData, major: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2">GitHub Profile Link</label>
                  <input type="url" value={formData.githubLink} onChange={(e) => setFormData({...formData, githubLink: e.target.value})} placeholder="https://github.com/..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center justify-between">
                  <span>ATS Technical Skills</span>
                  <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">1-Click Apply Ready</span>
                </label>
                <textarea required rows="2" value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} placeholder="React, Node.js, MongoDB, Java..." className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all font-medium"></textarea>
                <p className="text-[11px] text-slate-400 mt-1">Our AI engine uses these exact keywords to match you with top industry jobs.</p>
              </div>

              <div className="border-2 border-dashed border-blue-200 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors bg-blue-50/30">
                <label className="block text-sm font-bold text-slate-700 mb-2">Update Master CV (PDF)</label>
                <input type="file" accept="application/pdf" onChange={(e) => setCvFile(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 cursor-pointer mx-auto block" />
                {profileExists && !cvFile && <p className="text-xs text-emerald-600 mt-2 font-bold">✓ Current Master CV is securely stored.</p>}
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto px-8 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/30 active:scale-95 flex items-center justify-center">
                  {isSubmitting ? <span className="animate-pulse">Saving Changes...</span> : 'Save Profile Settings'}
                </button>
              </div>

            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;

