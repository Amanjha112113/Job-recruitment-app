import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/auth';
import { uploadResume } from '../api/resume';

export const Profile = () => {
    const { user, login, updateUser, logout } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        department: '',
        year: '',
        cgpa: '',
        skills: '',
        companyName: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Resume State
    const [resumeFile, setResumeFile] = useState(null);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [resumeMessage, setResumeMessage] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '', // Don't populate password
                department: user.department || '',
                year: user.year || '',
                cgpa: user.cgpa || '',
                skills: user.skills || '',
                companyName: user.companyName || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setResumeFile(e.target.files[0]);
        }
    };

    const handleResumeUpload = async () => {
        if (!resumeFile) return;

        setUploadingResume(true);
        setResumeMessage('');

        try {
            const data = new FormData();
            data.append('resume', resumeFile);
            data.append('candidateId', user.id); // Although backend uses token, safety

            const res = await uploadResume(data);

            if (res.success) {
                setResumeMessage('Resume uploaded successfully!');
                setResumeFile(null); // Clear file input
                // Ideally refresh user context to show "Resume Uploaded" status if we stored URL in user
                // But we store flag.
            } else {
                setResumeMessage('Failed to upload: ' + res.error);
            }
        } catch (err) {
            setResumeMessage('Error uploading resume');
        } finally {
            setUploadingResume(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess('');
        setError('');
        setResumeMessage(''); // Clear resume messages

        try {
            // 1. Upload Resume if selected
            let resumeUploadSuccess = true;
            if (resumeFile) {
                setResumeMessage('Uploading resume...');
                const formDataResume = new FormData();
                formDataResume.append('resume', resumeFile);
                formDataResume.append('candidateId', user.id);

                const resResume = await uploadResume(formDataResume);
                if (resResume.success) {
                    setResumeMessage('');
                    setResumeFile(null);
                } else {
                    resumeUploadSuccess = false;
                    setResumeMessage('Failed to upload resume: ' + resResume.error);
                }
            }

            // 2. Update Profile
            const dataToSend = { ...formData };
            if (!dataToSend.password) delete dataToSend.password;

            const resProfile = await updateProfile(dataToSend);

            if (resProfile.success) {
                // Determine overall message
                let msg = 'Profile updated successfully!';
                if (resumeFile && resumeUploadSuccess) {
                    msg = 'Profile and Resume updated successfully!';
                } else if (resumeFile && !resumeUploadSuccess) {
                    msg = 'Profile updated, but Resume upload failed.';
                }

                setSuccess(msg);

                // Update Context without reload
                if (resProfile.user) {
                    // If token is also returned, use it
                    updateUser(resProfile.user, resProfile.token);
                }

                // Scroll to top to see message
                window.scrollTo(0, 0);

            } else {
                setError(resProfile.error || 'Failed to update profile');
                window.scrollTo(0, 0);
            }
        } catch (err) {
            setError('An error occurred');
            window.scrollTo(0, 0);
        } finally {
            setLoading(false);
        }
    };

    const handleViewResume = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/resume/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success && data.url) {
                window.open(data.url, '_blank');
            } else {
                setResumeMessage('Failed to get resume: ' + (data.message || 'Unknown error'));
            }
        } catch (err) {
            setResumeMessage('Error viewing resume');
        }
    };



    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-black h-32 flex items-center justify-center">
                        <h1 className="text-3xl font-bold text-white tracking-tight">Your Profile</h1>
                    </div>

                    <div className="p-8">
                        {success && (
                            <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-lg">
                                {success}
                            </div>
                        )}
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">New Password (leave blank to keep current)</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            {user.role === 'Job Seeker' && (
                                <>
                                    <div className="border-t border-gray-100 pt-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Details</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Department</label>
                                                <input
                                                    type="text"
                                                    name="department"
                                                    value={formData.department}
                                                    onChange={handleChange}
                                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Year</label>
                                                <input
                                                    type="text"
                                                    name="year"
                                                    value={formData.year}
                                                    onChange={handleChange}
                                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">CGPA</label>
                                                <input
                                                    type="text"
                                                    name="cgpa"
                                                    value={formData.cgpa}
                                                    onChange={handleChange}
                                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Skills (comma separated)</label>
                                                <input
                                                    type="text"
                                                    name="skills"
                                                    value={formData.skills}
                                                    onChange={handleChange}
                                                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                                />
                                            </div>


                                            {/* Resume Upload Section */}
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700">Resume (PDF, Max 10MB)</label>
                                                <div className="mt-1 flex items-center space-x-4">
                                                    <input
                                                        type="file"
                                                        accept="application/pdf"
                                                        onChange={handleFileChange}
                                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                                    />
                                                    {/* Upload button removed. Handled by Save Changes */}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Select a file and click "Save Changes" to upload.</p>

                                                {resumeMessage && (
                                                    <p className={`mt-2 text-sm ${resumeMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                                                        {resumeMessage}
                                                    </p>
                                                )}
                                                {user.resume && (user.resume === 'uploaded' || user.resume === 'true') && (
                                                    <div className="mt-2 flex items-center">
                                                        <span className="text-sm text-green-600 mr-3">✅ Resume on file</span>
                                                        <button
                                                            onClick={handleViewResume}
                                                            className="text-sm text-indigo-600 hover:text-indigo-800 underline focus:outline-none"
                                                            type="button"
                                                        >
                                                            View Current Resume
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}

                            {user.role === 'Recruiter' && (
                                <div className="border-t border-gray-100 pt-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Company Details</h3>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Company Name</label>
                                        <input
                                            type="text"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between items-center pt-6">
                                <button
                                    type="button"
                                    onClick={logout}
                                    className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors"
                                >
                                    Log Out
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-transform transform hover:-translate-y-0.5 disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
