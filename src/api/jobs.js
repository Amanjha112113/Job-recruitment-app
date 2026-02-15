import client from './client';

export const getJobs = async (params = {}) => {
  try {
    const response = await client.get('/jobs', { params });
    const jobs = response.data.jobs.map(j => ({ ...j, id: j._id }));
    return {
      success: true,
      jobs: jobs,
      total: response.data.total,
    };
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return { success: false, error: 'Failed to fetch jobs' };
  }
};

export const getJobStats = async () => {
  try {
    const response = await client.get('/jobs/stats');
    return response.data;
  } catch (error) {
    return { success: false, error: 'Failed to fetch stats' };
  }
};

export const getJobById = async (id) => {
  try {
    const response = await client.get(`/jobs/${id}`);
    return { success: true, job: { ...response.data.job, id: response.data.job._id } };
  } catch (error) {
    return { success: false, error: 'Failed to fetch job' };
  }
};

export const createJob = async (data) => {
  try {
    const response = await client.post('/jobs', data);
    return {
      success: true,
      message: 'Job created successfully',
      job: { ...response.data.job, id: response.data.job._id },
    };
  } catch (error) {
    console.error('Error creating job:', error);
    return { success: false, error: error.response?.data?.message || 'Failed to create job' };
  }
};

export const deleteJob = async (id) => {
  try {
    await client.delete(`/jobs/${id}`);
    return { success: true, message: 'Job deleted successfully' };
  } catch (error) {
    return { success: false, error: 'Failed to delete job' };
  }
};
