import client from './client';

export const getResumeUrl = async (candidateId) => {
    try {
        const response = await client.get(`/resume/${candidateId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching resume URL:', error);
        return { success: false, message: error.response?.data?.message || 'Failed to fetch resume' };
    }
};

export const uploadResume = async (formData) => {
    try {
        const response = await client.post('/resume/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading resume:', error);
        return { success: false, error: error.response?.data?.message || 'Failed to upload resume' };
    }
};
