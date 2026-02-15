import client from './client';

export const applyToJob = async (jobId, data) => {
  try {
    // data might contain resume if we upload it here, but currently resume is in user profile 
    // or passed as link.
    const response = await client.post(`/jobs/${jobId}/apply`, data);
    return { success: true, application: { ...response.data.application, id: response.data.application._id } };
  } catch (error) {
    console.error('Apply error:', error);
    return { success: false, error: error.response?.data?.message || 'Failed to apply' };
  }
};

export const getMyApplications = async () => {
  try {
    const response = await client.get('/jobs/my-applications');
    const applications = response.data.applications.map(app => ({ ...app, id: app._id }));
    return { success: true, applications: applications };
  } catch (error) {
    return { success: false, error: 'Failed to fetch applications' };
  }
};

export const getJobApplications = async (jobId) => {
  try {
    const response = await client.get(`/jobs/${jobId}/applications`);
    const applications = response.data.applications.map(app => ({ ...app, id: app._id }));
    return { success: true, applications: applications };
  } catch (error) {
    return { success: false, error: 'Failed to fetch job applications' };
  }
};

export const getAllRecruiterApplications = async () => {
  try {
    const response = await client.get('/jobs/applications/all');
    const applications = response.data.applications.map(app => ({ ...app, id: app._id }));
    return { success: true, applications: applications };
  } catch (error) {
    return { success: false, error: 'Failed to fetch applications' };
  }
};

export const updateApplicationStatus = async (appId, status, feedback) => {
  try {
    const response = await client.put(`/jobs/applications/${appId}`, { status, feedback });
    return { success: true, application: { ...response.data.application, id: response.data.application._id } };
  } catch (error) {
    return { success: false, error: 'Failed to update status' };
  }
};
