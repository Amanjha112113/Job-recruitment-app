import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) {
    return null;
  }

  const isActive = (path) => {
    return location.pathname === path ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900';
  };

  const isRecruiter = user.role === 'Recruiter' || user.role === 'Admin';

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold group-hover:scale-105 transition-transform">
                R
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                RecruitmentHub
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex space-x-1">
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${isActive('/dashboard')}`}
              >
                Dashboard
              </Link>
              <Link
                to="/jobs"
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${isActive('/jobs')}`}
              >
                Jobs
              </Link>

              {isRecruiter && (
                <Link
                  to="/post-job"
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${isActive('/post-job')}`}
                >
                  Post Job
                </Link>
              )}
              {isRecruiter && (
                <Link
                  to="/candidates"
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${isActive('/candidates')}`}
                >
                  Candidates
                </Link>
              )}
              {!isRecruiter && (
                <Link
                  to="/my-applications"
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${isActive('/my-applications')}`}
                >
                  My Applications
                </Link>
              )}
              {user.role === 'Admin' && (
                <Link
                  to="/admin/users"
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${isActive('/admin/users')}`}
                >
                  Users
                </Link>
              )}
            </div>

            <div className="flex items-center gap-4 pl-6 border-l border-gray-200">
              <div className="hidden sm:flex flex-col items-end mr-2">
                <span className="text-sm font-medium text-gray-900">{user.name}</span>
                <span className="text-xs text-gray-500 capitalize">{user.role || 'User'}</span>
                <Link to="/profile" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Edit Profile</Link>
              </div>

              <button
                onClick={logout}
                className="group relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-red-200 via-red-300 to-yellow-200 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 dark:text-white dark:hover:text-gray-900 focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400"
              >
                <span className="relative px-4 py-2 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0 text-red-600 group-hover:text-white">
                  Logout
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
