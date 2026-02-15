import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyApplications } from '../api/applications';
import { useAuth } from '../context/AuthContext';

const statusSteps = ['Applied', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];

const getStepIndex = (status) => {
    if (status === 'Rejected') return -1; // Special case
    return statusSteps.indexOf(status);
};

export const MyApplications = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const res = await getMyApplications();
                if (res.success) {
                    setApplications(res.applications);
                } else {
                    setError('Failed to load applications');
                }
            } catch (err) {
                setError('An error occurred');
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
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">My Applications</h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
                )}

                <div className="space-y-6">
                    {applications.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            <p className="mt-4 text-gray-500">You haven't applied to any jobs yet.</p>
                            <Link to="/jobs" className="mt-4 inline-block text-indigo-600 font-medium hover:text-indigo-800">Browse Jobs &rarr;</Link>
                        </div>
                    ) : (
                        applications.map((app) => {
                            const currentStep = getStepIndex(app.status);
                            const isRejected = app.status === 'Rejected';

                            return (
                                <div key={app.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900">
                                                <Link to={`/jobs/${app.jobId}`} className="hover:text-indigo-600 transition-colors">
                                                    {app.jobTitle}
                                                </Link>
                                            </h2>
                                            <p className="text-gray-600 font-medium">{app.company}</p>
                                            <p className="text-sm text-gray-500 mt-1">Applied on {new Date(app.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className={`mt-4 md:mt-0 px-4 py-2 rounded-full text-sm font-semibold 
                                            ${isRejected ? 'bg-red-100 text-red-800' : 'bg-indigo-50 text-indigo-700'}`}>
                                            {app.status}
                                        </div>
                                    </div>

                                    {/* Status Timeline */}
                                    <div className="relative">
                                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-100">
                                            {isRejected ? (
                                                <div style={{ width: '100%' }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"></div>
                                            ) : (
                                                <div style={{ width: `${((currentStep + 1) / 4) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-500"></div>
                                            )}
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 font-medium">
                                            <span>Applied</span>
                                            <span>Shortlisted</span>
                                            <span className="hidden sm:inline">Interview</span>
                                            <span>Selected</span>
                                        </div>
                                    </div>

                                    {app.feedback && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-700 border-l-4 border-gray-300">
                                            <span className="font-semibold block mb-1">Feedback:</span>
                                            {app.feedback}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
