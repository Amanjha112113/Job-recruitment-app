import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJobById } from '../api/jobs';
import { getJobApplications, updateApplicationStatus } from '../api/applications';
import { useAuth } from '../context/AuthContext';

const statusColors = {
    'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Shortlisted': 'bg-green-100 text-green-800 border-green-200',
    'Rejected': 'bg-red-100 text-red-800 border-red-200',
    'Accepted': 'bg-blue-100 text-blue-800 border-blue-200',
};

export const JobApplications = () => {
    const { jobId } = useParams();
    const { user } = useAuth();
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedApp, setSelectedApp] = useState(null); // For Modal

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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-600 font-semibold">{error}</div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <Link to="/my-jobs" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-flex items-center gap-1 font-medium">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                        Back to My Jobs
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Applications for {job?.title}</h1>
                            <p className="text-gray-500 mt-1">Review and manage candidates for this role.</p>
                        </div>
                        <div className="bg-white px-5 py-3 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            </div>
                            <div>
                                <span className="block text-gray-500 text-xs uppercase tracking-wide font-semibold">Total Applicants</span>
                                <span className="block text-xl font-bold text-gray-900">{applications.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {applications.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
                        <p className="text-gray-500">Wait for candidates to apply to this position.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {applications.map((app) => (
                            <div key={app.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                                <div className="p-6 flex-grow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                                {app.applicant?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 leading-tight">{app.applicant?.name || 'Unknown'}</h3>
                                                <p className="text-sm text-gray-500">{app.applicant?.email}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusColors[app.status] || 'bg-gray-100 text-gray-800'}`}>
                                            {app.status}
                                        </span>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center text-sm text-gray-600">
                                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                            {app.applicant?.department || 'N/A'} • {app.applicant?.year || 'N/A'}
                                        </div>
                                        <div className="flex items-center text-sm text-gray-600">
                                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                            Applied {new Date(app.submittedAt || app.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setSelectedApp(app)}
                                        className="w-full py-2.5 rounded-xl border border-indigo-100 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                                    >
                                        View Details
                                    </button>
                                </div>
                                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-between items-center">
                                    {app.status === 'Pending' ? (
                                        <div className="flex gap-2 w-full">
                                            <button
                                                onClick={() => handleStatusUpdate(app.id, 'Shortlisted')}
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 rounded-lg transition shadow-sm hover:shadow"
                                            >
                                                Shortlist
                                            </button>
                                            <button
                                                onClick={() => handleStatusUpdate(app.id, 'Rejected')}
                                                className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold py-2 rounded-lg transition"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    ) : (
                                        <span className="text-sm text-gray-500 w-full text-center italic">
                                            {app.status === 'Shortlisted' ? 'Candidate Shortlisted' :
                                                app.status === 'Rejected' ? 'Application Rejected' :
                                                    app.status === 'Accepted' ? 'Candidate Hired!' : app.status}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Applicant Details Modal */}
            {selectedApp && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setSelectedApp(null)}></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl w-full">
                            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-4 flex justify-between items-center">
                                <h3 className="text-lg leading-6 font-bold text-white" id="modal-title">
                                    Applicant Profile
                                </h3>
                                <button onClick={() => setSelectedApp(null)} className="text-white hover:text-gray-200 focus:outline-none">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-3xl font-bold">
                                        {selectedApp.applicant?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{selectedApp.applicant?.name}</h2>
                                        <p className="text-gray-500">{selectedApp.applicant?.email}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${statusColors[selectedApp.status]}`}>
                                                {selectedApp.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Academic Info</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500">Department</span>
                                                <span className="text-sm font-semibold text-gray-900">{selectedApp.applicant?.department || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500">Year</span>
                                                <span className="text-sm font-semibold text-gray-900">{selectedApp.applicant?.year || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-500">CGPA</span>
                                                <span className="text-sm font-semibold text-gray-900">{selectedApp.applicant?.cgpa || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Skills</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedApp.applicant?.skills ? (
                                                selectedApp.applicant.skills.split(',').map((skill, index) => (
                                                    <span key={index} className="px-2 py-1 bg-white border border-gray-200 rounded-md text-xs text-gray-600 font-medium shadow-sm">
                                                        {skill.trim()}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-sm text-gray-500">No skills listed</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h4 className="text-sm font-bold text-gray-900 mb-3">Resume</h4>
                                    {(selectedApp.resume || selectedApp.applicant?.resume) ? (
                                        <a
                                            href={selectedApp.resume || selectedApp.applicant?.resume}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-colors group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-red-100 text-red-600 rounded-lg group-hover:bg-red-200 transition-colors">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-semibold text-gray-900 group-hover:text-indigo-700">View Resume</p>
                                                    <p className="text-xs text-gray-500">Opens in new tab</p>
                                                </div>
                                            </div>
                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                        </a>
                                    ) : (
                                        <div className="p-4 border border-gray-200 border-dashed rounded-xl text-center text-gray-500 bg-gray-50">
                                            No resume uploaded
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-100">
                                <button
                                    onClick={() => setSelectedApp(null)}
                                    className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition"
                                >
                                    Close
                                </button>
                                {selectedApp.status === 'Pending' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusUpdate(selectedApp.id, 'Rejected')}
                                            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-100 transition"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(selectedApp.id, 'Shortlisted')}
                                            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-sm transition"
                                        >
                                            Shortlist
                                        </button>
                                    </>
                                )}
                                {selectedApp.status === 'Shortlisted' && (
                                    <button
                                        onClick={() => handleStatusUpdate(selectedApp.id, 'Accepted')}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-sm transition"
                                    >
                                        Mark as Hired
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
