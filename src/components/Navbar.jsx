import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) {
    return null;
  }

  const isActive = (path) => {
    return location.pathname === path
      ? 'text-indigo-600 font-semibold bg-indigo-50/50'
      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50';
  };

  const isRecruiter = user.role === 'Recruiter' || user.role === 'Admin';

  return (
    <nav className="sticky top-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold tracking-tighter shadow-lg shadow-indigo-500/30 transform group-hover:scale-105 transition-all duration-300">
                RH
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
                RecruitmentHub
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex space-x-1">
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-xl text-sm transition-all duration-200 ${isActive('/dashboard')}`}
              >
                Dashboard
              </Link>
              <Link
                to="/jobs"
                className={`px-4 py-2 rounded-xl text-sm transition-all duration-200 ${isActive('/jobs')}`}
              >
                Jobs
              </Link>

              {isRecruiter && (
                <Link
                  to="/post-job"
                  className={`px-4 py-2 rounded-xl text-sm transition-all duration-200 ${isActive('/post-job')}`}
                >
                  Post Job
                </Link>
              )}
              {isRecruiter && (
                <Link
                  to="/candidates"
                  className={`px-4 py-2 rounded-xl text-sm transition-all duration-200 ${isActive('/candidates')}`}
                >
                  Candidates
                </Link>
              )}
              {!isRecruiter && (
                <>
                  <Link
                    to="/my-applications"
                    className={`px-4 py-2 rounded-xl text-sm transition-all duration-200 ${isActive('/my-applications')}`}
                  >
                    My Apps
                  </Link>
                  <Link
                    to="/saved-jobs"
                    className={`px-4 py-2 rounded-xl text-sm transition-all duration-200 ${isActive('/saved-jobs')}`}
                  >
                    Saved
                  </Link>
                </>
              )}
              {user.role === 'Admin' && (
                <Link
                  to="/admin/users"
                  className={`px-4 py-2 rounded-xl text-sm transition-all duration-200 ${isActive('/admin/users')}`}
                >
                  Users
                </Link>
              )}
            </div>

            <div className="flex items-center gap-4 pl-6 border-l border-slate-200">
              <Link to="/profile" className="group flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-slate-50 transition-all duration-200" title="Edit Profile">
                <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-md group-hover:shadow-lg transition-all duration-300 ring-2 ring-white">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors">{user.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user.role}</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
