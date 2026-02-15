import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) {
    return null;
  }

  const isActive = (path) => {
    return location.pathname === path ? 'bg-black text-white font-medium' : 'text-gray-600 hover:bg-gray-100 hover:text-black';
  };

  const isRecruiter = user.role === 'Recruiter' || user.role === 'Admin';

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-none bg-black flex items-center justify-center text-white font-bold tracking-tighter">
                RH
              </div>
              <span className="text-xl font-bold text-black tracking-tight group-hover:opacity-80 transition-opacity">
                RecruitmentHub
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex space-x-2">
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-md text-sm transition-all ${isActive('/dashboard')}`}
              >
                Dashboard
              </Link>
              <Link
                to="/jobs"
                className={`px-4 py-2 rounded-md text-sm transition-all ${isActive('/jobs')}`}
              >
                Jobs
              </Link>

              {isRecruiter && (
                <Link
                  to="/post-job"
                  className={`px-4 py-2 rounded-md text-sm transition-all ${isActive('/post-job')}`}
                >
                  Post Job
                </Link>
              )}
              {isRecruiter && (
                <Link
                  to="/candidates"
                  className={`px-4 py-2 rounded-md text-sm transition-all ${isActive('/candidates')}`}
                >
                  Candidates
                </Link>
              )}
              {!isRecruiter && (
                <Link
                  to="/my-applications"
                  className={`px-4 py-2 rounded-md text-sm transition-all ${isActive('/my-applications')}`}
                >
                  My Applications
                </Link>
              )}
              {user.role === 'Admin' && (
                <Link
                  to="/admin/users"
                  className={`px-4 py-2 rounded-md text-sm transition-all ${isActive('/admin/users')}`}
                >
                  Users
                </Link>
              )}
            </div>

            <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
              <Link to="/profile" className="group flex items-center gap-2" title="Edit Profile">
                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:bg-gray-800 transition-all duration-300 transform group-hover:scale-105">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
