import client from './client';

const STORAGE_KEY_USERS = 'recruitment_users';
const STORAGE_KEY_CURRENT_USER = 'recruitment_current_user';

// Helper to get users from local storage
const getUsers = () => {
  const users = localStorage.getItem(STORAGE_KEY_USERS);
  return users ? JSON.parse(users) : [];
};

// Helper to save users to local storage
const saveUsers = (users) => {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
};

export const register = async (data) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    const users = getUsers();
    const existingUser = users.find((u) => u.email === data.email);

    if (existingUser) {
      return {
        success: false,
        error: 'User already exists with this email',
      };
    }

    const newUser = {
      id: 'user-' + Date.now(),
      name: data.name,
      email: data.email,
      password: data.password, // In a real app, never store plain text passwords!
      role: data.role || 'Job Seeker',
    };

    users.push(newUser);
    saveUsers(users);

    return {
      success: true,
      message: 'Registration successful',
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: 'Registration failed',
    };
  }
};

export const login = async (data) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  try {
    const users = getUsers();
    const user = users.find((u) => u.email === data.email && u.password === data.password);

    if (user) {
      const token = 'mock-token-' + Date.now();
      // Store current user info separately for easy 'me' access in this mock setup
      // In a real app, 'me' would decode the token or validate it with backend
      const userSafe = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(userSafe));

      return {
        success: true,
        message: 'Login successful',
        token: token,
        user: userSafe,
      };
    }

    return {
      success: false,
      error: 'Invalid email or password',
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: 'Login failed',
    };
  }
};

export const me = async () => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  try {
    const userStr = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (userStr) {
      return {
        success: true,
        user: JSON.parse(userStr),
      };
    }
    return {
      success: false,
      error: 'Not logged in',
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch user',
    };
  }
};

export const getAllUsers = async () => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  try {
    const users = getUsers();
    // Return without passwords for security simulation
    const safeUsers = users.map(({ password, ...u }) => u);
    return { success: true, users: safeUsers };
  } catch (error) {
    return { success: false, error: 'Failed to fetch users' };
  }
};

export const deleteUser = async (id) => {
  await new Promise((resolve) => setTimeout(resolve, 300));
  try {
    let users = getUsers();
    const initialLength = users.length;
    users = users.filter(u => u.id !== id);

    if (users.length === initialLength) {
      return { success: false, error: 'User not found' };
    }

    saveUsers(users);
    return { success: true, message: 'User deleted' };
  } catch (error) {
    return { success: false, error: 'Failed to delete user' };
  }
};
