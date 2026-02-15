import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Jobs } from './pages/Jobs';
import { Apply } from './pages/Apply';
import { PostJob } from './pages/PostJob';
import { MyJobs } from './pages/MyJobs';
import { JobApplications } from './pages/JobApplications';
import { AdminUsers } from './pages/AdminUsers';
import { JobDetails } from './pages/JobDetails';
import { Profile } from './pages/Profile';
import { Candidates } from './pages/Candidates';
import { MyApplications } from './pages/MyApplications';
import { TestUpload } from './pages/TestUpload';

// Setup React Router routes:
// /login, /register (public)
// /dashboard, /jobs, /apply/:jobId (protected)
// Add Navbar component shown only when logged in.
// Wrap everything with AuthProvider.

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <Jobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/post-job"
              element={
                <ProtectedRoute>
                  <PostJob />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-jobs"
              element={
                <ProtectedRoute>
                  <MyJobs />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/:jobId/applications"
              element={
                <ProtectedRoute>
                  <JobApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <AdminUsers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/apply/:jobId"
              element={
                <ProtectedRoute>
                  <Apply />
                </ProtectedRoute>
              }
            />
            <Route
              path="/jobs/:jobId"
              element={
                <ProtectedRoute>
                  <JobDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/candidates"
              element={
                <ProtectedRoute>
                  <Candidates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-applications"
              element={
                <ProtectedRoute>
                  <MyApplications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/test-upload"
              element={
                <ProtectedRoute>
                  <TestUpload />
                </ProtectedRoute>
              }
            />

            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

export default App;
