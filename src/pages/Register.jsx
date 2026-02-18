import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { AuthSelection } from './AuthSelection';

export const Register = () => {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, register, googleLogin } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (roleKey === 'Recruiter') {
        // Recruiters might be pending, but generally if they have a session they go to dashboard or status page
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [user, navigate, roleKey]);


  // Map role param
  const roleKey = roleParam === 'recruiter' ? 'Recruiter' : 'Job Seeker';

  // If no role specified or invalid, show selection screen
  if (!roleParam || (roleParam !== 'recruiter' && roleParam !== 'job-seeker')) {
    return <AuthSelection mode="register" />;
  }

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const result = await googleLogin(tokenResponse.access_token, roleKey);
        if (result.success) {
          navigate('/dashboard');
        } else {
          setError(result.error || 'Google Login failed');
        }
      } catch (err) {
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google Register Failed');
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        name,
        email,
        password,
        role: roleKey,
      };

      const result = await register(data);
      if (result.success) {
        if (roleKey === 'Recruiter') {
          // Recruiters are pending approval by default
          alert('Registration successful! Please wait for admin approval.');
          navigate('/login?role=recruiter');
        } else {
          // Job Seekers (and others if any) are auto-logged in
          navigate('/dashboard');
        }
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const isRecruiter = roleParam === 'recruiter';

  return (
    <div className="min-h-screen flex animate-fade-in">
      {/* Left Portion */}
      {isRecruiter ? (
        // Recruiter: Form Left - Matches Login Recruiter Layout (Form Left / Graphic Right)
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
          <div className="w-full max-w-md space-y-8">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-indigo-600 rounded-md"></div>
              <span className="text-xl font-bold tracking-tight text-gray-900">Placement<span className="text-green-500">/Portal</span></span>
            </div>

            <div>
              <h2 className="text-3xl font-extrabold text-gray-900">Recruiter Registration</h2>
              <p className="mt-2 text-sm text-gray-600">
                Start posting jobs and hiring today.
              </p>
            </div>

            {error && (
              <div className="p-4 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Work Email</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" placeholder="name@company.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition" placeholder="••••••••" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">or</span></div>
              </div>

              <button type="button" onClick={() => handleGoogleLogin()} className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                Sign up with Google
              </button>
            </form>

            <p className="text-center text-sm text-gray-600">
              Already have an account? <Link to="/login?role=recruiter" className="font-medium text-green-600 hover:text-green-500">Log in</Link>
            </p>
          </div>
        </div>
      ) : (
        // Developer: Graphic Left - Matches Login Developer Layout (Graphic Left / Form Right)
        <div className="hidden md:flex md:w-1/2 bg-gray-900 relative overflow-hidden items-center justify-center p-12">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')] bg-cover bg-center opacity-20"></div>
          <div className="relative z-10 max-w-lg text-center">
            <h2 className="text-4xl font-extrabold text-white mb-6">Join the Talent Pool</h2>
            <p className="text-xl text-gray-300 mb-8">
              Create your profile, showcase your skills, and get noticed by top recruiters.
            </p>
          </div>
        </div>
      )}

      {/* Right Portion */}
      {isRecruiter ? (
        // Recruiter: Graphic Right
        <div className="hidden md:flex md:w-1/2 bg-gray-50 items-center justify-center p-12 relative">
          <div className="max-w-lg text-center">
            <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80" alt="Recruiting" className="w-full max-w-md mx-auto mb-8 rounded-lg shadow-xl" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Hire the Best</h3>
            <p className="text-gray-600">Connect with thousands of eager students and professionals on our platform.</p>
          </div>
        </div>
      ) : (
        // Developer: Form Right
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-white overflow-y-auto">
          <div className="w-full max-w-md space-y-8">
            <div className="text-center md:text-left">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gray-900 text-white mb-4">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 14a2 2 0 11-4 0 2 2 0 014 0zm6-4a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <h2 className="text-3xl font-extrabold text-gray-900">Sign up</h2>
              <p className="mt-2 text-gray-600">Create your account</p>
            </div>

            {error && (
              <div className="p-4 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition" placeholder="name@company.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition" placeholder="••••••••" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors">
                {loading ? 'Creating Account...' : 'Sign Up'}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">or</span></div>
              </div>

              <button type="button" onClick={() => handleGoogleLogin()} className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                Sign up with Google
              </button>
            </form>

            <p className="text-center text-sm text-gray-600">
              Already have an account? <Link to="/login?role=job-seeker" className="font-medium text-black hover:underline">Log in</Link>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
