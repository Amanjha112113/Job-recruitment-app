import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getJobStats } from '../api/jobs';

export const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    jobsCount: 0,
    applicationsCount: 0,
    myJobsCount: 0, // For recruiters
    usersCount: 0 // For admin
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const statsData = await getJobStats();
        if (statsData.success) {
          setStats(statsData.stats);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const isRecruiter = user.role === 'Recruiter' || user.role === 'Admin';

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-2xl shadow-xl group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 opacity-90 transition-all duration-300 group-hover:scale-105"></div>
          <div className="relative p-8 md:p-12 text-white">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
              Welcome back, {user?.name} 👋
            </h1>
            <p className="text-lg md:text-xl text-indigo-100 max-w-2xl">
              {isRecruiter ?
                (user.role === 'Admin' ? 'Oversee the entire platform activity.' : 'Manage your job postings and find the best talent.')
                : 'Here’s what’s happening with your job search today.'}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isRecruiter ? (
            // Recruiter Stats
            <>
              <Link to="/my-jobs" className="block transform transition-transform hover:-translate-y-1">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-50 rounded-xl">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-wide">
                      Active
                    </span>
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium">My Posted Jobs</h3>
                  <p className="text-4xl font-bold text-gray-900 mt-1">{loading ? '...' : stats.jobsCount}</p>
                </div>
              </Link>

              {user.role === 'Admin' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-50 rounded-xl">
                      <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    </div>
                    <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full uppercase tracking-wide">
                      System
                    </span>
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium">Total Users</h3>
                  <p className="text-4xl font-bold text-gray-900 mt-1">{loading ? '...' : stats.usersCount}</p>
                </div>
              )}

              <Link to="/my-jobs" className="block transform transition-transform hover:-translate-y-1">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-50 rounded-xl">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </div>
                    <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase tracking-wide">
                      Total
                    </span>
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium">Total Candidates</h3>
                  <p className="text-4xl font-bold text-gray-900 mt-1">{loading ? '...' : stats.applicationsCount}</p>
                </div>
              </Link>
            </>
          ) : (
            // Job Seeker Stats
            <>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full uppercase tracking-wide">
                    Available
                  </span>
                </div>
                <h3 className="text-gray-500 text-sm font-medium">Total Jobs</h3>
                <p className="text-4xl font-bold text-gray-900 mt-1">{loading ? '...' : stats.jobsCount}</p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-green-50 rounded-xl">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full uppercase tracking-wide">
                    Active
                  </span>
                </div>
                <h3 className="text-gray-500 text-sm font-medium">My Applications</h3>
                <p className="text-4xl font-bold text-gray-900 mt-1">{loading ? '...' : stats.applicationsCount}</p>
              </div>
            </>
          )}

          {/* Profile Card (Common) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-50 rounded-xl">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
              </div>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full uppercase tracking-wide">
                Profile
              </span>
            </div>
            <h3 className="text-gray-900 font-bold truncate">{user?.name}</h3>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            <p className="text-xs text-indigo-500 mt-1 font-medium uppercase tracking-wide">{user.role}</p>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isRecruiter ? (
            <>
              <Link
                to="/post-job"
                className="group relative p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
                  <svg className="w-32 h-32 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">Post a New Job</h3>
                <p className="text-gray-600 max-w-sm">Create a new job listing to attract top talent.</p>
                <div className="mt-4 flex items-center text-indigo-600 font-medium group-hover:translate-x-2 transition-transform">
                  Post Job <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </div>
              </Link>

              {user.role === 'Admin' ? (
                <Link
                  to="/admin/users"
                  className="group relative p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
                    <svg className="w-32 h-32 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">Manage Users</h3>
                  <p className="text-gray-600 max-w-sm">View all registered users and manage their accounts.</p>
                  <div className="mt-4 flex items-center text-indigo-600 font-medium group-hover:translate-x-2 transition-transform">
                    View Users <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                  </div>
                </Link>
              ) : (
                <Link
                  to="/candidates"
                  className="group relative p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
                    <svg className="w-32 h-32 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path></svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">Manage Candidates</h3>
                  <p className="text-gray-600 max-w-sm">Review applications and shortlist candidates.</p>
                  <div className="mt-4 flex items-center text-indigo-600 font-medium group-hover:translate-x-2 transition-transform">
                    View Candidates <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                  </div>
                </Link>
              )}
            </>
          ) : (
            <>
              <Link
                to="/jobs"
                className="group relative p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
                  <svg className="w-32 h-32 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">Browse Jobs</h3>
                <p className="text-gray-600 max-w-sm">Explore the latest opportunities tailored to your skills and preferences.</p>
                <div className="mt-4 flex items-center text-indigo-600 font-medium group-hover:translate-x-2 transition-transform">
                  Start Searching <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </div>
              </Link>

              <Link
                to="/jobs"
                className="group relative p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
                  <svg className="w-32 h-32 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">Track Applications</h3>
                <p className="text-gray-600 max-w-sm">Monitor the status of your submitted applications in real-time.</p>
                <div className="mt-4 flex items-center text-green-600 font-medium group-hover:translate-x-2 transition-transform">
                  View Status <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </div>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
