import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getJobById } from '../api/jobs';
import { getJobApplications, updateApplicationStatus } from '../api/applications';
import { useAuth } from '../context/AuthContext';

const statusColors = {
    'Pending': 'bg-yellow-100 text-yellow-800',
    'Shortlisted': 'bg-green-100 text-green-800',
    'Rejected': 'bg-red-100 text-red-800',
    'Accepted': 'bg-blue-100 text-blue-800',
};

export const JobApplications = () => {
    const { jobId } = useParams();
    const { user } = useAuth();
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <Link to="/my-jobs" className="text-indigo-600 hover:text-indigo-800 mb-4 inline-block">&larr; Back to My Jobs</Link>
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Applications for {job?.title}</h1>
                            <p className="text-gray-500 mt-1">Manage and review candidates.</p>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
                            <span className="text-gray-500 text-sm">Total Applicants:</span>
                            <span className="ml-2 font-bold text-gray-900">{applications.length}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Candidate</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied On</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resume</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {applications.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                            No applications received yet.
                                        </td>
                                    </tr>
                                ) : (
                                    applications.map((app) => (
                                        <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">{app.fullName || app.applicantName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{app.email || app.applicantEmail}</div>
                                                <div className="text-xs text-gray-400">{app.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(app.submittedAt || app.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[app.status] || 'bg-gray-100 text-gray-800'}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600">
                                                {app.resumeLink ? (
                                                    <a href={app.resumeLink} target="_blank" rel="noopener noreferrer" className="hover:underline">View Resume</a>
                                                ) : <span className="text-gray-400">N/A</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                {app.status === 'Pending' && (
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleStatusUpdate(app.id, 'Shortlisted')}
                                                            className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md hover:bg-green-100 transition"
                                                        >
                                                            Shortlist
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusUpdate(app.id, 'Rejected')}
                                                            className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md hover:bg-red-100 transition"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                                {app.status === 'Shortlisted' && (
                                                    <button
                                                        onClick={() => handleStatusUpdate(app.id, 'Accepted')}
                                                        className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-md hover:bg-blue-100 transition"
                                                    >
                                                        Accept
                                                    </button>
                                                )}
                                                {app.status === 'Rejected' && (
                                                    <span className="text-gray-400 italic">Rejected</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
