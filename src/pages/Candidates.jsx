import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllRecruiterApplications, updateApplicationStatus } from '../api/applications';
import { getResumeUrl } from '../api/resume'; // Import new API function

const tabStatusMap = {
    'All': null,
    'Applied': 'Pending',
    'Shortlisted': 'Shortlisted',
    'Interview Scheduled': 'Interview Scheduled',
    'Selected': 'Accepted',
    'Rejected': 'Rejected'
};

const statusStyles = {
    'Pending': 'bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20',
    'Shortlisted': 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20',
    'Interview Scheduled': 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-700/10',
    'Accepted': 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10',
    'Rejected': 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10',
};

export const Candidates = () => {
    const { user } = useAuth();
    const [allApplications, setAllApplications] = useState([]);
    const [filteredApps, setFilteredApps] = useState([]);
    const [activeTab, setActiveTab] = useState('All');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedApp, setSelectedApp] = useState(null); // For Modal
    const [resumeUrl, setResumeUrl] = useState(null);
    const [fetchingResume, setFetchingResume] = useState(false);

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                const res = await getAllRecruiterApplications();
                if (res.success) {
                    setAllApplications(res.applications);
                } else {
                    setError('Failed to fetch candidates');
                }
            } catch (err) {
                setError('An error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (user && (user.role === 'Recruiter' || user.role === 'Admin')) {
            fetchCandidates();
        } else {
            setError('Not authorized');
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (activeTab === 'All') {
            setFilteredApps(allApplications);
        } else {
            const statusTarget = tabStatusMap[activeTab];
            setFilteredApps(allApplications.filter(app => app.status === statusTarget));
        }
    }, [activeTab, allApplications]);

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
                setAllApplications(apps =>
                    apps.map(app =>
                        app.id === appId ? { ...app, status: newStatus } : app
                    )
                );
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
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white text-red-600">
                {error}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manage Candidates</h1>
                        <p className="text-sm text-gray-500 mt-1">Review and manage all your job applications.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                        {Object.keys(tabStatusMap).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`
                                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                    ${activeTab === tab
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                `}
                            >
                                {tab}
                                <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs ${activeTab === tab ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}>
                                    {tab === 'All'
                                        ? allApplications.length
                                        : allApplications.filter(a => a.status === tabStatusMap[tab]).length}
                                </span>
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Table Layout */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    {filteredApps.length === 0 ? (
                        <div className="text-center py-16">
                            <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No candidates found</h3>
                            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Candidate</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Job Role</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Applied On</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredApps.map((app) => (
                                        <tr
                                            key={app.id}
                                            onClick={() => setSelectedApp(app)}
                                            className="hover:bg-gray-50 cursor-pointer transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                                                        {app.applicant?.name?.charAt(0).toUpperCase() || '?'}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{app.applicant?.name || 'Unknown'}</div>
                                                        <div className="text-sm text-gray-500">{app.applicant?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{app.job?.title || 'Unknown Role'}</div>
                                                <div className="text-xs text-gray-500">{app.job?.company}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {new Date(app.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${statusStyles[app.status] || 'bg-gray-100 text-gray-600'}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button className="text-indigo-600 hover:text-indigo-900 font-semibold">View Details</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Applicant Details Modal - Redesigned */}
            {selectedApp && (
                <div className="relative z-[9999]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" aria-hidden="true" onClick={() => setSelectedApp(null)}></div>

                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
                            <div className="relative transform overflow-hidden rounded-xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-3xl border border-gray-100">

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
                                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusStyles[selectedApp.status]}`}>
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

                                                    console.log('Render Resume:', { fetchingResume, resumeUrl, appResume: selectedApp.resume, userResume: selectedApp.applicant?.resume, finalLink: link });

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
                </div>
            )}
        </div>
    );
};
