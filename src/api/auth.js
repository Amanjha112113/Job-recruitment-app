import client from './client';

export const register = async (data) => {
  try {
    const response = await client.post('/auth/register', data);
    return {
      success: true,
      message: 'Registration successful',
      user: response.data.user,
      token: response.data.token // if auto-login
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Registration failed',
    };
  }
};

export const login = async (data) => {
  try {
    const response = await client.post('/auth/login', data);
    return {
      success: true,
      message: 'Login successful',
      token: response.data.token,
      user: response.data.user,
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Login failed',
    };
  }
};

export const googleLogin = async (token, role) => {
  try {
    const response = await client.post('/auth/google', { token, role });
    return {
      success: true,
      message: 'Google login successful',
      token: response.data.token,
      user: response.data.user,
    };
  } catch (error) {
    console.error('Google Login error:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.response?.data?.message || 'Google login failed',
    };
  }
};

export const me = async () => {
  try {
    const response = await client.get('/auth/me');
    return {
      success: true,
      user: response.data.user,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch user',
    };
  }
};

export const getAllUsers = async () => {
  try {
    const response = await client.get('/auth/users');
    // Normalize _id to id
    const users = response.data.users.map(u => ({ ...u, id: u._id }));
    return { success: true, users };
  } catch (error) {
    return { success: false, error: 'Failed to fetch users' };
  }
};

export const updateUserStatus = async (id, status) => {
  try {
    const response = await client.put(`/auth/users/${id}`, { status });
    return { success: true, user: { ...response.data.user, id: response.data.user._id } };
  } catch (error) {
    return { success: false, error: 'Failed to update user' };
  }
};

export const updateProfile = async (data) => {
  try {
    const response = await client.put('/auth/profile', data);
    return {
      success: true,
      user: response.data.user,
      token: response.data.token,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update profile',
    };
  }
};

export const deleteUser = async (id) => {
  try {
    await client.delete(`/auth/users/${id}`);
    return { success: true, message: 'User deleted' };
  } catch (error) {
    return { success: false, error: 'Failed to delete user' };
  }
};
