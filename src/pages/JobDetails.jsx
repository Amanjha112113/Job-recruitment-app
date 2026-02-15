import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

export const JobDetails = () => {
    const { jobId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const fetchJobAndStatus = async () => {
            try {
                const data = await getJobs();
                const foundJob = data.jobs.find(j => j.id === jobId);
                if (foundJob) {
                    setJob(foundJob);

                    // Check if already applied
                    if (user && user.role === 'Job Seeker') {
                        const appsRes = await getMyApplications();
                        if (appsRes.success) {
                            const hasApplied = appsRes.applications.some(app => app.job === jobId || app.job._id === jobId);
                            if (hasApplied) {
                                setSuccessMsg('You have already applied to this job.');
                            }
                        }
                    }
                } else {
                    setError('Job not found');
                }
            } catch (err) {
                setError('Failed to load job details');
            } finally {
                setLoading(false);
            }
        };
        fetchJobAndStatus();
    }, [jobId, user]);

    const handleApply = async () => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role === 'Recruiter' || user.role === 'Admin') {
            alert("Recruiters cannot apply to jobs.");
            return;
        }

        setApplying(true);
        setError('');
        setSuccessMsg('');

        try {
            const res = await applyToJob(jobId, {});
            if (res.success) {
                setSuccessMsg('Application submitted successfully!');
            } else {
                setError(res.error || 'Failed to apply');
            }
        } catch (err) {
            setError('An error occurred while applying');
        } finally {
            setApplying(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                    <div className="text-gray-500 font-medium">Loading job details...</div>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-xl shadow-md text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Job Not Found</h2>
                    <Link to="/jobs" className="text-indigo-600 hover:text-indigo-800 font-medium">Back to Jobs</Link>
                </div>
            </div>
        );
    }

    const badge = typeBadge(job.type);
    const isRecruiter = user?.role === 'Recruiter' || user?.role === 'Admin';
    const letter = job.company ? job.company.charAt(0).toUpperCase() : 'C';

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="max-w-4xl mx-auto">
                <Link to="/jobs" className="inline-flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors">
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Jobs
                </Link>

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

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-32 md:h-48 relative">
                        <div className="absolute -bottom-16 left-8">
                            <div className="h-32 w-32 rounded-2xl bg-white p-2 shadow-lg">
                                <div className="h-full w-full rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 text-4xl font-bold">
                                    {letter}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-20 px-8 pb-8">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                                <p className="text-lg text-gray-600 font-medium mt-1">{job.company}</p>
                                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-gray-500">
                                    <div className="flex items-center">
                                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                        {job.location}
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        {job.salary || 'Not specified'}
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                        Posted {new Date(job.createdAt).toLocaleDateString()} at {new Date(job.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <span className={badge.className}>{badge.label}</span>
                                </div>
                            </div>
                            {!isRecruiter && (
                                <button
                                    onClick={handleApply}
                                    disabled={applying || successMsg}
                                    className="w-full md:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5"
                                >
                                    {applying ? 'Applying...' : successMsg ? 'Applied' : 'Apply Now'}
                                </button>
                            )}
                        </div>

                        <div className="mt-8 border-t border-gray-100 pt-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Job Description</h3>
                            <div className="prose prose-indigo max-w-none text-gray-600">
                                <p className="whitespace-pre-wrap">{job.description}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
