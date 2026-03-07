import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyApplications } from '../api/applications';

const ArchivedApplications = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const data = await getMyApplications();
                if (data.success) {
                    setApplications((data.applications || []).filter(app => app.status === 'Job Deleted'));
                } else {
                    setError(data.error || 'Failed to fetch archived applications');
                }
            } catch (err) {
                setError('An error occurred while fetching your archive.');
            } finally {
                setLoading(false);
            }
        };

        fetchApps();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slide-up">
                    <div>
                        <div className="flex items-center gap-3">
                            <Link to="/my-applications" className="p-2 bg-white text-gray-400 hover:text-gray-900 rounded-full border border-gray-200 shadow-sm transition-all hover:shadow-md">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                            </Link>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Archived Applications</h1>
                        </div>
                        <p className="text-gray-500 mt-2 ml-12">Jobs that have been removed by the recruiter.</p>
                    </div>
                </div>

                {/* List Section */}
                <div className="space-y-4 animate-slide-up delay-100">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-2">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {error}
                        </div>
                    )}

                    {applications.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100 mt-8">
                            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No archived applications.</h3>
                            <p className="text-gray-500 max-w-sm mx-auto">
                                None of the jobs you've applied to have been deleted by recruiters.
                            </p>
                        </div>
                    ) : (
                        applications.map((app) => (
                            <div key={app.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-gray-100 text-gray-400 rounded-xl flex items-center justify-center text-xl font-bold shadow-inner">
                                        {(app.company || app.job?.company || 'XX').substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-500 line-through decoration-gray-300">
                                            {app.jobTitle || app.job?.title || 'Unknown Job'}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                                            <span className="font-medium">{app.company || app.job?.company || 'Unknown Company'}</span>
                                            <span>&bull;</span>
                                            <span>Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 shrink-0 w-full sm:w-auto mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                                    <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-gray-100 text-gray-600 border border-gray-200 w-full sm:w-auto justify-center">
                                        <svg className="w-4 h-4 mr-1.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                        Job Removed
                                    </span>
                                    {app.feedback && (
                                        <span className="text-xs text-red-500 italic max-w-xs text-right hidden sm:block">
                                            "{app.feedback}"
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ArchivedApplications;
