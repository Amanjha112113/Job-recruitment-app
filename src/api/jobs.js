import client from './client';

const STORAGE_KEY_JOBS = 'recruitment_jobs';

const initialMockJobs = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: 'Tech Corp',
    location: 'San Francisco, CA',
    type: 'Full-time',
    description: 'Build amazing user interfaces with React and modern web technologies.',
    salary: '$120,000 - $150,000',
    postedBy: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Backend Developer',
    company: 'StartUp Inc',
    location: 'New York, NY',
    type: 'Full-time',
    description: 'Develop scalable APIs and backend services using Node.js and databases.',
    salary: '$130,000 - $160,000',
    postedBy: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    title: 'UI/UX Designer',
    company: 'Design Studio',
    location: 'Los Angeles, CA',
    type: 'Contract',
    description: 'Create beautiful and user-friendly designs for web and mobile applications.',
    salary: '$80,000 - $110,000',
    postedBy: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: 4,
    title: 'Full Stack Developer',
    company: 'Enterprise Co',
    location: 'Remote',
    type: 'Full-time',
    description: 'Work on full stack development across frontend, backend, and DevOps.',
    salary: '$140,000 - $180,000',
    postedBy: 'admin',
    createdAt: new Date().toISOString()
  },
];

// Helper to get jobs from local storage or initialize
const getStoredJobs = () => {
  const jobs = localStorage.getItem(STORAGE_KEY_JOBS);
  if (!jobs) {
    localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(initialMockJobs));
    return initialMockJobs;
  }
  return JSON.parse(jobs);
};

export const getJobs = async (params = {}) => {
  // Simulate delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    let jobs = getStoredJobs();

    // Simple filter simulation if needed
    if (params.search) {
      const lowerSearch = params.search.toLowerCase();
      jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(lowerSearch) ||
        j.company.toLowerCase().includes(lowerSearch)
      );
    }

    // Sort by newest first
    jobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return {
      success: true,
      jobs: jobs,
      total: jobs.length,
    };
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return { success: false, error: 'Failed to fetch jobs' };
  }
};

export const getJobById = async (id) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    const jobs = getStoredJobs();
    const job = jobs.find((j) => j.id === parseInt(id) || j.id === id);

    if (job) {
      return { success: true, job };
    }
    return { success: false, error: 'Job not found' };
  } catch (error) {
    return { success: false, error: 'Failed to fetch job' };
  }
};

/**
 * Recruiter creates a new job
 */
export const createJob = async (data) => {
  await new Promise((resolve) => setTimeout(resolve, 600));

  try {
    const jobs = getStoredJobs();
    const newJob = {
      id: Date.now(),
      ...data,
      createdAt: new Date().toISOString(),
    };

    jobs.push(newJob);
    localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));

    return {
      success: true,
      message: 'Job created successfully',
      job: newJob,
    };
  } catch (error) {
    console.error('Error creating job:', error);
    return { success: false, error: 'Failed to create job' };
  }
};

export const deleteJob = async (id) => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  try {
    let jobs = getStoredJobs();
    const initialLength = jobs.length;
    jobs = jobs.filter((j) => j.id !== parseInt(id) && j.id !== id);

    if (jobs.length === initialLength) {
      return { success: false, error: 'Job not found' };
    }

    localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));
    return { success: true, message: 'Job deleted successfully' };
  } catch (error) {
    return { success: false, error: 'Failed to delete job' };
  }
};
