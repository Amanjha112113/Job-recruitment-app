import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getJobs } from '../api/jobs';
import { applyToJob, getMyApplications } from '../api/applications';
import { useAuth } from '../context/AuthContext';

const typeBadge = (type) => {
  const t = (type || '').toLowerCase();
  const base = "px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border";
  if (t.includes('full')) return { label: 'Full Time', className: `${base} bg-green-50 text-green-700 border-green-200` };
  if (t.includes('intern')) return { label: 'Internship', className: `${base} bg-blue-50 text-blue-700 border-blue-200` };
  if (t.includes('remote')) return { label: 'Remote', className: `${base} bg-purple-50 text-purple-700 border-purple-200` };
  return { label: type, className: `${base} bg-gray-50 text-gray-700 border-gray-200` };
};

export const Jobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null); // Job ID being applied to
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [jobsData, appsData] = await Promise.all([
          getJobs(),
          user && user.role !== 'Recruiter' ? getMyApplications() : Promise.resolve({ success: true, applications: [] })
        ]);

        setJobs(jobsData.jobs || []);

        if (appsData.success && appsData.applications) {
          const ids = new Set(appsData.applications.map(app => app.jobId));
          setAppliedJobIds(ids);
        }
      } catch (err) {
        setError('Failed to load data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleApply = async (jobId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role === 'Recruiter' || user.role === 'Admin') {
      alert("Recruiters cannot apply to jobs.");
      return;
    }

    setApplying(jobId);
    setError('');
    setSuccessMsg('');

    try {
      const res = await applyToJob(jobId, {});
      if (res.success) {
        setAppliedJobIds(prev => new Set(prev).add(jobId));
        setSuccessMsg('Application submitted successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      } else {
        setError(res.error || 'Failed to apply');
      }
    } catch (err) {
      setError('An error occurred while applying');
    } finally {
      setApplying(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <div className="text-gray-500 font-medium">Finding opportunities...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Open Positions</h1>
            <p className="mt-1 text-gray-500">Discover your next career move from our curated list.</p>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search jobs..."
              className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-shadow"
            />
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg shadow-sm">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg shadow-sm animate-fade-in-up">
            <p className="font-bold">Success</p>
            <p>{successMsg}</p>
          </div>
        )}

        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
            <p className="mt-1 text-sm text-gray-500">Check back later for new opportunities.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {jobs.map((job) => {
              const badge = typeBadge(job.type);
              const letter = job.company ? job.company.charAt(0).toUpperCase() : 'C';
              const isApplied = appliedJobIds.has(job.id);
              const isRecruiter = user?.role === 'Recruiter' || user?.role === 'Admin';

              return (
                <div key={job.id} className="group bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-100 transition-all duration-200">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                      <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-indigo-100">
                        {letter}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {job.title}
                          </h2>
                          <p className="text-sm font-medium text-gray-600 mt-1">{job.company}</p>
                        </div>
                        <span className={badge.className}>{badge.label}</span>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                          {job.location}
                        </div>
                        {job.salary && (
                          <div className="flex items-center">
                            <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {job.salary}
                          </div>
                        )}
                        <div className="flex items-center">
                          <svg className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          Posted {new Date(job.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {job.description && (
                        <p className="mt-4 text-gray-600 text-sm leading-relaxed line-clamp-2">
                          {job.description}
                        </p>
                      )}
                    </div>

                    {/* Action */}
                    <div className="flex items-center">
                      {isApplied ? (
                        <button
                          disabled
                          className="w-full md:w-auto inline-flex items-center justify-center px-6 py-2 border border-green-200 bg-green-50 text-green-700 text-sm font-medium rounded-lg cursor-not-allowed"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                          Applied
                        </button>
                      ) : (
                        !isRecruiter && (
                          <button
                            onClick={() => handleApply(job.id)}
                            disabled={applying === job.id}
                            className="w-full md:w-auto inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-wait"
                          >
                            {applying === job.id ? 'Applying...' : 'Apply Now'}
                          </button>
                        )
                      )}

                      {isRecruiter && job.recruiterId === user.id && (
                        <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded ml-2">Your Post</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
