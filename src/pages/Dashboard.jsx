import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getJobStats, getMyJobs, getJobs, deleteJob } from '../api/jobs';

export const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    jobsCount: 0,
    applicationsCount: 0,
    myJobsCount: 0,
    usersCount: 0
  });

  // Recruiter specific state
  const [activeTab, setActiveTab] = useState('my-jobs');
  const [myJobs, setMyJobs] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const statsData = await getJobStats();
        if (statsData.success) {
          setStats(statsData.stats);
        }

        if (user.role === 'Recruiter' || user.role === 'Admin') {
          setJobsLoading(true);
          // Fetch My Jobs
          const myJobsData = await getMyJobs();
          if (myJobsData.success) {
            setMyJobs(myJobsData.jobs);
          }

          // Fetch All Jobs
          const allJobsData = await getJobs();
          if (allJobsData.success) {
            setAllJobs(allJobsData.jobs);
          }
          setJobsLoading(false);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      try {
        const result = await deleteJob(jobId);
        if (result.success) {
          // Update local state
          setMyJobs(prev => prev.filter(job => job.id !== jobId));
          // Also update stats if needed, or just decrement
          setStats(prev => ({ ...prev, jobsCount: prev.jobsCount - 1 }));
          // Update allJobs as well if it's there
          setAllJobs(prev => prev.filter(job => job.id !== jobId));
          alert('Job deleted successfully');
        } else {
          alert(result.error || 'Failed to delete job');
        }
      } catch (error) {
        alert('An error occurred while deleting the job');
      }
    }
  };

  const isRecruiter = user.role === 'Recruiter' || user.role === 'Admin';

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-2xl shadow-xl group animate-slide-up">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up delay-100">
          {isRecruiter ? (
            // Recruiter Stats
            <>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full">
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

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full">
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
            </>
          ) : (
            // Job Seeker Stats (Kept same as before)
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

        {/* Recruiter Job Management Section */}
        {isRecruiter && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-slide-up delay-200">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('my-jobs')}
                  className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === 'my-jobs'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  My Dashboard (Private)
                </button>
                <button
                  onClick={() => setActiveTab('all-jobs')}
                  className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${activeTab === 'all-jobs'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  All Recruiter Job Posts (Public)
                </button>
              </nav>
            </div>

            <div className="p-6">
              {jobsLoading ? (
                <div className="text-center py-10 text-gray-500">Loading jobs...</div>
              ) : (
                <>
                  {activeTab === 'my-jobs' ? (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-medium text-gray-900">My Posted Jobs</h2>
                        <Link
                          to="/post-job"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Post New Job
                        </Link>
                      </div>

                      {myJobs.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">You haven't posted any jobs yet.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Posted</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {myJobs.map((job) => (
                                <tr key={job.id}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{job.title}</div>
                                    <div className="text-sm text-gray-500">{job.type} • {job.location}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(job.createdAt).toLocaleDateString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {/* Application count could be passed or fetched separately. For now just view link */}
                                    <Link to={`/jobs/${job.id}/applications`} className="text-indigo-600 hover:text-indigo-900">
                                      View Applications
                                    </Link>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                      onClick={() => handleDeleteJob(job.id)}
                                      className="text-red-600 hover:text-red-900"
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-medium text-gray-900">All Jobs (Read Only)</h2>
                      </div>

                      {allJobs.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No jobs found.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {allJobs.map((job) => (
                                <tr key={job.id}>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{job.company}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{job.title}</div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {job.location}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                      {job.type}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(job.createdAt).toLocaleDateString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions for Job Seeker & Admin (Recruiter ones mostly moved to tabs but kept post job) */}
        {!isRecruiter && (
          <div className="mt-8 animate-slide-up delay-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Job Seeker Actions */}
              <Link
                to="/jobs"
                className="group relative p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
                  <svg className="w-32 h-32 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">Browse Jobs</h3>
                <p className="text-gray-600 max-w-sm">Explore the latest opportunities tailored to your skills and preferences.</p>
              </Link>

              <Link
                to="/jobs" // Ideally a different page for applications tracking specifically, using /jobs for now
                className="group relative p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
                  <svg className="w-32 h-32 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">Track Applications</h3>
                <p className="text-gray-600 max-w-sm">Monitor the status of your submitted applications in real-time.</p>
              </Link>
            </div>
          </div>
        )}

        {/* Admin Quick Actions to remain visible if isRecruiter is actually Admin */}
        {user.role === 'Admin' && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link
                to="/admin/users"
                className="group relative p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">Manage Users</h3>
                <p className="text-gray-600">View all registered users and manage their accounts.</p>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
