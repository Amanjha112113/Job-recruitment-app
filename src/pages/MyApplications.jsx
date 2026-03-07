import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyApplications } from '../api/applications';
import { useAuth } from '../context/AuthContext';

const STATUS_STEPS = ['Applied', 'Shortlisted', 'Interview Scheduled', 'Selected', 'Rejected'];

const getStepIndex = (status) => {
    if (status === 'Rejected' || status === 'Job Deleted') return -1;
    return STATUS_STEPS.indexOf(status);
};

const getStatusColor = (status) => {
    switch (status) {
        case 'Applied': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'Shortlisted': return 'bg-purple-50 text-purple-700 border-purple-200';
        case 'Interview Scheduled': return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'Selected': return 'bg-green-50 text-green-700 border-green-200';
        case 'Rejected': return 'bg-red-50 text-red-700 border-red-200';
        case 'Job Deleted': return 'bg-gray-100 text-gray-500 border-gray-300';
        default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
};

export const MyApplications = () => {
    const { user } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    useEffect(() => {
        const fetchApps = async () => {
            try {
                const res = await getMyApplications();
                if (res.success) {
                    setApplications(res.applications);
                } else {
                    setError(res.error || 'Failed to load applications');
                }
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.error || err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchApps();
    }, []);

    // Filter out deleted jobs from the main tracking feed
    const activeApplications = applications.filter(app => app.status !== 'Job Deleted');

    const filteredApplications = filterStatus === 'All'
        ? activeApplications
        : activeApplications.filter(app => app.status === filterStatus);

    const stats = {
        total: activeApplications.length,
        active: activeApplications.filter(app => ['Applied', 'Shortlisted', 'Interview Scheduled'].includes(app.status)).length,
        interviews: activeApplications.filter(app => app.status === 'Interview Scheduled').length,
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-slide-up">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Track Applications</h1>
                        <p className="text-gray-500 mt-2">Monitor your job application status in real-time.</p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/archived" className="btn-secondary whitespace-nowrap px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 inline-flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                            Archive
                        </Link>
                        <Link to="/jobs" className="btn-primary inline-flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            Browse More Jobs
                        </Link>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up delay-100">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Applications</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                        </div>
                        <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active Processes</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.active}</p>
                        </div>
                        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Interviews Scheduled</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.interviews}</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex overflow-x-auto pb-2 gap-2 animate-slide-up delay-200">
                    {['All', ...STATUS_STEPS].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${filterStatus === status
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                                : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Applications List */}
                <div className="space-y-6 animate-slide-up delay-300">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-2">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            {error}
                        </div>
                    )}

                    {filteredApplications.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100">
                            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No applications found</h3>
                            <p className="text-gray-500 max-w-sm mx-auto mb-6">
                                {filterStatus === 'All'
                                    ? "You haven't applied to any jobs yet. Start your journey by browsing available positions."
                                    : `You don't have any applications with status "${filterStatus}".`}
                            </p>
                            {filterStatus === 'All' && (
                                <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
                            )}
                        </div>
                    ) : (
                        filteredApplications.map((app) => {
                            const currentStep = getStepIndex(app.status);
                            const isRejectedOrDeleted = app.status === 'Rejected' || app.status === 'Job Deleted';

                            return (
                                <div key={app.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-xl font-bold text-gray-600 uppercase flex-shrink-0">
                                                {app.company?.substring(0, 2) || 'XX'}
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                    <Link to={`/jobs/${app.jobId}`}>
                                                        {app.jobTitle || 'Unknown Job'}
                                                    </Link>
                                                </h2>
                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    <span className="font-medium text-gray-700">{app.company || 'Unknown Company'}</span>
                                                    <span className="text-gray-300">•</span>
                                                    <span className="text-sm text-gray-500">Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(app.status)}`}>
                                            {app.status}
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="relative mt-8 mb-2">
                                        {/* Progress Bar Background */}
                                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 rounded-full -translate-y-1/2"></div>

                                        {/* Active Progress Bar */}
                                        <div
                                            className={`absolute top-1/2 left-0 h-1 rounded-full -translate-y-1/2 transition-all duration-1000 ${app.status === 'Job Deleted' ? 'bg-gray-400' : (app.status === 'Rejected' ? 'bg-red-500' : 'bg-green-500')}`}
                                            style={{ width: isRejectedOrDeleted ? '100%' : `${((currentStep) / (STATUS_STEPS.length - 2)) * 100}%` }}
                                        ></div>

                                        {/* Steps */}
                                        <div className="relative flex justify-between w-full">
                                            {STATUS_STEPS.filter(step => step !== 'Rejected').map((step, index) => {
                                                const isCompleted = index <= currentStep;
                                                const isCurrent = index === currentStep;

                                                return (
                                                    <div key={step} className="relative flex flex-col items-center group/step">
                                                        <div className={`w-4 h-4 rounded-full border-2 z-10 transition-all duration-300 ${isCompleted
                                                            ? (isRejectedOrDeleted && isCurrent ? (app.status === 'Job Deleted' ? 'bg-gray-400 border-gray-400' : 'bg-red-500 border-red-500') : 'bg-green-500 border-green-500')
                                                            : 'bg-white border-gray-300'
                                                            }`}></div>
                                                        <span className={`absolute top-6 text-xs font-medium text-center w-24 -ml-12 left-1/2 transition-all duration-300 ${isCompleted
                                                            ? (isRejectedOrDeleted && isCurrent ? (app.status === 'Job Deleted' ? 'text-gray-500 font-bold' : 'text-red-600 font-bold') : 'text-gray-900')
                                                            : 'text-gray-400'
                                                            }`}>
                                                            {step}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Feedback Section */}
                                    {app.feedback && (
                                        <div className="mt-12 md:mt-10 p-4 bg-gray-50 rounded-xl text-sm text-gray-700 border border-gray-100">
                                            <span className="font-bold block mb-1 flex items-center gap-2">
                                                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
                                                Recruiter Feedback
                                            </span>
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
