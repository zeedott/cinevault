import axios from 'axios';
import { AuthResponse, User } from '../types';

const API_BASE = '/api';

// Set up automatic Authorization header for all API requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('cinevault_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  // Register / Sign Up
  signup: async (
    name: string,
    email: string,
    password: string,
    profilePhoto?: string
  ): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>(`${API_BASE}/auth/register`, {
      name,
      email,
      password,
      profilePhoto,
    });
    return response.data;
  },

  // Sign In / Login
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>(`${API_BASE}/auth/login`, {
      email,
      password,
    });
    return response.data;
  },

  // Get Current User Session
  getMe: async (): Promise<User> => {
    const response = await axios.get<User>(`${API_BASE}/auth/me`);
    return response.data;
  },

  // Update Profile (Name, Profile Photo)
  updateProfile: async (name: string, profilePhoto?: string): Promise<User> => {
    const response = await axios.put<User>(`${API_BASE}/auth/profile`, {
      name,
      profilePhoto,
    });
    return response.data;
  },

  // Logout API call
  logout: async (): Promise<{ message: string }> => {
    const response = await axios.post<{ message: string }>(`${API_BASE}/auth/logout`);
    return response.data;
  },
};
