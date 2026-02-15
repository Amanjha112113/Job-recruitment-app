import React from 'react';
import { Link } from 'react-router-dom';

export const AuthSelection = ({ mode = 'login' }) => {
    // mode can be 'login' or 'register' to direct to correct path
    const baseUrl = mode === 'register' ? '/register' : '/login';

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            {/* Company / Recruiter Section */}
            <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center p-12 transition-all hover:bg-gray-50 group border-b md:border-b-0 md:border-r border-gray-200">
                <div className="mb-6 p-5 bg-indigo-50 rounded-full group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-16 h-16 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                </div>
                <div className="text-center max-w-md">
                    <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold tracking-wide uppercase mb-4">
                        Business
                    </span>
                    <h2 className="text-4xl font-extrabold text-gray-900 mb-4">For Recruiters</h2>
                    <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                        Post jobs, manage applications, and hire the best talent from our pool of qualified candidates.
                    </p>
                    <Link
                        to={`${baseUrl}?role=recruiter`}
                        className="inline-block w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white font-bold rounded-lg shadow-lg hover:bg-indigo-700 hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-center"
                    >
                        {mode === 'register' ? 'Sign Up' : 'Login'}
                    </Link>

                </div>
            </div>

            {/* Developer / Job Seeker Section */}
            <div className="w-full md:w-1/2 bg-gray-900 text-white flex flex-col justify-center items-center p-12 relative overflow-hidden group">
                {/* Background decorations */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>

                <div className="relative z-10 text-center max-w-md">
                    <div className="mb-6 p-5 bg-gray-800 rounded-full inline-block group-hover:scale-110 transition-transform duration-300 ring-1 ring-gray-700">
                        <svg className="w-16 h-16 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
                    </div>

                    <h2 className="text-4xl font-extrabold text-white mb-4">For Students & Job Seekers</h2>
                    <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                        Create your profile, upload your resume, and apply to your dream jobs with a single click.
                    </p>

                    <Link
                        to={`${baseUrl}?role=job-seeker`}
                        className="inline-block w-full sm:w-auto px-8 py-4 bg-gray-800 border border-gray-700 text-white font-bold rounded-lg hover:bg-gray-700 hover:border-gray-600 transition-all text-center"
                    >
                        {mode === 'register' ? 'Sign Up' : 'Login'}
                    </Link>


                </div>
            </div>
        </div>
    );
};
