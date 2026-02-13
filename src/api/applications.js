import client from './client';
import { me } from './auth';

const STORAGE_KEY_APPLICATIONS = 'recruitment_applications';

// Helper to get applications
const getApplications = () => {
  const apps = localStorage.getItem(STORAGE_KEY_APPLICATIONS);
  return apps ? JSON.parse(apps) : [];
};

export const applyToJob = async (jobId, data) => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  try {
    // Get current user to link application
    const userRes = await me();
    if (!userRes.success) {
      throw new Error('User not logged in');
    }

    const apps = getApplications();

    // Check if already applied
    const existing = apps.find(a => a.jobId === parseInt(jobId) && a.userId === userRes.user.id);
    if (existing) {
      return { success: false, error: 'You have already applied for this job' };
    }

    const newApp = {
      id: 'app-' + Date.now(),
      jobId: parseInt(jobId),
      userId: userRes.user.id,
      applicantName: userRes.user.name,
      applicantEmail: userRes.user.email,
      ...data,
      status: 'Pending',
      submittedAt: new Date().toISOString(),
    };

    apps.push(newApp);
    localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(apps));

    return {
      success: true,
      message: 'Application submitted successfully',
      application: newApp,
    };
  } catch (error) {
    console.error('Application error:', error);
    return { success: false, error: error.message || 'Failed to apply' };
  }
};

export const getMyApplications = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    const userRes = await me();
    if (!userRes.success) return { success: false, error: 'Not logged in' };

    const apps = getApplications();
    const myApps = apps.filter(a => a.userId === userRes.user.id);

    // Enrich with job details - inefficient but fine for mock
    // In real app, this would be a JOIN or separate fetch
    const jobs = JSON.parse(localStorage.getItem('recruitment_jobs') || '[]');

    // Reverse for newest first
    const enrichedApps = myApps.map(app => {
      const job = jobs.find(j => j.id === app.jobId);
      return {
        ...app,
        jobTitle: job ? job.title : 'Unknown Job',
        company: job ? job.company : 'Unknown Company',
      };
    }).reverse();

    return {
      success: true,
      applications: enrichedApps,
      total: enrichedApps.length,
    };
  } catch (error) {
    console.error('Fetch applications error:', error);
    return { success: false, error: 'Failed to fetch applications' };
  }
};

/**
 * For Recruiters to see who applied
 */
export const getJobApplications = async (jobId) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const apps = getApplications();
  const jobApps = apps.filter(a => a.jobId === parseInt(jobId));
  // Sort by date desc
  jobApps.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
  return { success: true, applications: jobApps };
};

export const updateApplicationStatus = async (appId, status) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    const apps = getApplications();
    const appIndex = apps.findIndex(a => a.id === appId);

    if (appIndex === -1) {
      return { success: false, error: 'Application not found' };
    }

    apps[appIndex].status = status;
    localStorage.setItem(STORAGE_KEY_APPLICATIONS, JSON.stringify(apps));

    return { success: true, message: 'Status updated' };
  } catch (error) {
    return { success: false, error: 'Failed to update status' };
  }
};
