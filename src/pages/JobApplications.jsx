import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJobById } from '../api/jobs';
import { getJobApplications, updateApplicationStatus } from '../api/applications';
import { getResumeUrl } from '../api/resume';
import { useAuth } from '../context/AuthContext';

const statusStyles = {
    'Pending': 'bg-gray-100 text-gray-700 border-gray-200',
    'Shortlisted': 'bg-black text-white border-black',
    'Rejected': 'bg-white text-gray-400 border-gray-200 line-through decoration-gray-400',
    'Accepted': 'bg-white text-black border-black font-bold',
    'Interview Scheduled': 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-700/10',
};

export const JobApplications = () => {
    const { jobId } = useParams();
    const { user } = useAuth();
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedApp, setSelectedApp] = useState(null); // For Modal
    const [resumeUrl, setResumeUrl] = useState(null);
    const [fetchingResume, setFetchingResume] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [jobData, appsData] = await Promise.all([
                    getJobById(jobId),
                    getJobApplications(jobId)
                ]);

                if (jobData.success) {
                    setJob(jobData.job);
                } else {
                    setError('Job not found');
                }

                if (appsData.success) {
                    setApplications(appsData.applications);
                }
            } catch (err) {
                setError('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [jobId]);

    // Fetch Resume URL when selectedApp changes
    useEffect(() => {
        const fetchResume = async () => {
            if (selectedApp && selectedApp.applicant && selectedApp.applicant.resume === 'uploaded') {
                setFetchingResume(true);
                setResumeUrl(null); // Reset prev url
                try {
                    const res = await getResumeUrl(selectedApp.applicant._id);
                    if (res.success) {
                        setResumeUrl(res.url);
                    } else {
                        console.error('Failed to get resume URL:', res.message);
                    }
                } catch (err) {
                    console.error('Error fetching resume:', err);
                } finally {
                    setFetchingResume(false);
                }
            } else {
                setResumeUrl(null);
            }
        };

        if (selectedApp) {
            fetchResume();
        }
    }, [selectedApp]);


    const handleStatusUpdate = async (appId, newStatus) => {
        try {
            const res = await updateApplicationStatus(appId, newStatus);
            if (res.success) {
                setApplications(apps =>
                    apps.map(app =>
                        app.id === appId ? { ...app, status: newStatus } : app
                    )
                );
                // Also update selected app if open
                if (selectedApp && selectedApp.id === appId) {
                    setSelectedApp({ ...selectedApp, status: newStatus });
                }
            } else {
                alert('Failed to update status');
            }
        } catch (err) {
            alert('Error updating status');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-4 w-32 bg-gray-200 rounded mb-4"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white text-black font-medium border border-red-500">{error}</div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10 border-b border-gray-200 pb-6">
                    <Link to="/my-jobs" className="text-gray-500 hover:text-black mb-6 inline-flex items-center gap-2 font-medium transition-colors group">
                        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Back to My Jobs
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-extrabold text-black tracking-tight leading-tight">Applications for <br /><span className="text-gray-400">{job?.title}</span></h1>
                        </div>
                        <div className="bg-black text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-4">
                            <div className="p-2 bg-white/10 rounded-md">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            </div>
                            <div>
                                <span className="block text-gray-400 text-xs uppercase tracking-wider font-bold">Total Applicants</span>
                                <span className="block text-2xl font-bold text-white leading-none mt-1">{applications.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {applications.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-16 text-center">
                        <div className="w-16 h-16 bg-white border border-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                        </div>
                        <h3 className="text-xl font-bold text-black mb-2">No applications yet</h3>
                        <p className="text-gray-500">Wait for candidates to apply to this position.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {applications.map((app, index) => (
                            <div key={app.id} className="bg-white rounded-lg border border-gray-200 hover:border-black transition-colors duration-300 flex flex-col group animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                                <div className="p-8 flex-grow">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-none bg-black flex items-center justify-center text-white font-bold text-xl">
                                                {(app.applicant?.name || 'U').charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-black leading-tight group-hover:underline decoration-2 underline-offset-4">{app.applicant?.name || 'Unknown Candidate'}</h3>
                                                <p className="text-sm text-gray-500 mt-1">{app.applicant?.email || 'No email'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wide border ${statusStyles[app.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                                            {app.status}
                                        </span>
                                    </div>

                                    <div className="space-y-4 mb-8 border-t border-gray-100 pt-6">
                                        <div className="flex items-center text-sm text-gray-700">
                                            <span className="w-24 text-gray-400 text-xs uppercase font-bold tracking-wider">Education</span>
                                            <span className="font-medium">{app.applicant?.department || 'N/A'} • {app.applicant?.year || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-700">
                                            <span className="w-24 text-gray-400 text-xs uppercase font-bold tracking-wider">Applied</span>
                                            <span className="font-medium">{new Date(app.submittedAt || app.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedApp(app)}
                                        className="w-full py-3 bg-white border border-gray-300 text-black font-bold text-sm hover:bg-black hover:text-white transition-all uppercase tracking-wide"
                                    >
                                        View Full Profile
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Applicant Details Modal - Unified Design */}
            {selectedApp && (
                <div className="fixed inset-0 z-[9999] overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-900/75 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => setSelectedApp(null)}></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="relative z-10 inline-block align-bottom bg-white border border-black shadow-2xl text-left overflow-hidden transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl w-full rounded-xl">

                            {/* Modal Header */}
                            <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900" id="modal-title">
                                        Applicant Details
                                    </h3>
                                    <p className="text-sm text-gray-500">Review candidate information and take action.</p>
                                </div>
                                <button
                                    type="button"
                                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    onClick={() => setSelectedApp(null)}
                                >
                                    <span className="sr-only">Close</span>
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Content - Two Column Layout */}
                            <div className="px-6 py-6 max-h-[75vh] overflow-y-auto">
                                <div className="flex flex-col md:flex-row gap-8">

                                    {/* Left Column: Basic Info */}
                                    <div className="md:w-1/3 space-y-6">
                                        <div className="text-center md:text-left">
                                            <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-3xl font-bold mx-auto md:mx-0 mb-4 ring-4 ring-white shadow-sm">
                                                {selectedApp.applicant?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900">{selectedApp.applicant?.name}</h2>
                                            <p className="text-sm text-gray-500 mt-1">{selectedApp.applicant?.email}</p>

                                            <div className="mt-4">
                                                <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusStyles[selectedApp.status] || 'bg-gray-100 text-gray-600'}`}>
                                                    {selectedApp.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Academic Info</h4>
                                            <dl className="space-y-3">
                                                <div className="flex justify-between">
                                                    <dt className="text-sm text-gray-500">Department</dt>
                                                    <dd className="text-sm font-medium text-gray-900">{selectedApp.applicant?.department || 'N/A'}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-sm text-gray-500">Year</dt>
                                                    <dd className="text-sm font-medium text-gray-900">{selectedApp.applicant?.year || 'N/A'}</dd>
                                                </div>
                                                <div className="flex justify-between">
                                                    <dt className="text-sm text-gray-500">CGPA</dt>
                                                    <dd className="text-sm font-medium text-gray-900">{selectedApp.applicant?.cgpa || 'N/A'}</dd>
                                                </div>
                                            </dl>
                                        </div>
                                    </div>

                                    {/* Right Column: Detailed Info */}
                                    <div className="md:w-2/3 space-y-8">
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                                                Skills & Expertise
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedApp.applicant?.skills && typeof selectedApp.applicant.skills === 'string' ? (
                                                    selectedApp.applicant.skills.split(',').map((skill, index) => (
                                                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                            {skill.trim()}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-gray-500 italic">No skills listed.</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                                                Resume / CV
                                            </h4>
                                            {(() => {
                                                const link = resumeUrl ||
                                                    (selectedApp.resume && selectedApp.resume !== 'uploaded' ? selectedApp.resume : null) ||
                                                    (selectedApp.applicant?.resume && selectedApp.applicant?.resume !== 'uploaded' ? selectedApp.applicant?.resume : null);

                                                if (fetchingResume) {
                                                    return (
                                                        <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50">
                                                            <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full mr-3"></div>
                                                            <span className="text-sm text-gray-500">Fetching resume...</span>
                                                        </div>
                                                    );
                                                }

                                                if (link) {
                                                    return (
                                                        <a
                                                            href={link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-indigo-300 transition-all group"
                                                        >
                                                            <div className="h-10 w-10 bg-red-100 text-red-600 rounded flex items-center justify-center mr-4 group-hover:bg-red-200 transition-colors">
                                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium text-gray-900 group-hover:text-indigo-600">View Resume Document</p>
                                                                <p className="text-xs text-gray-500">PDF • Opens in new tab</p>
                                                            </div>
                                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                                        </a>
                                                    );
                                                }

                                                return (
                                                    <div className="p-4 bg-gray-50 border border-gray-200 border-dashed rounded-lg text-center text-sm text-gray-500">
                                                        No resume attached to this application.
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer / Actions */}
                            <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row sm:justify-end gap-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => handleStatusUpdate(selectedApp.id, 'Rejected')}
                                    className="inline-flex justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 w-full sm:w-auto hover:text-red-600 hover:border-red-200"
                                >
                                    Reject
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleStatusUpdate(selectedApp.id, 'Interview Scheduled')}
                                    className="inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 w-full sm:w-auto"
                                >
                                    Schedule Interview
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleStatusUpdate(selectedApp.id, 'Shortlisted')}
                                    className="inline-flex justify-center rounded-lg border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 w-full sm:w-auto"
                                >
                                    Shortlist
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleStatusUpdate(selectedApp.id, 'Accepted')}
                                    className="inline-flex justify-center rounded-lg border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto"
                                >
                                    Hire Applicant
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
