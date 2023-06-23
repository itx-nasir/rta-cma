import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/auth`,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor to handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async login(username, password) {
    const response = await this.api.post('/login', {
      username,
      password
    });
    return response.data;
  }

  async register(userData) {
    const response = await this.api.post('/register', userData);
    return response.data;
  }

  async getProfile(token = null) {
    const config = {};
    if (token) {
      config.headers = { Authorization: `Bearer ${token}` };
    }
    
    const response = await this.api.get('/me', config);
    return response.data;
  }

  async updateProfile(userData) {
    const response = await this.api.put('/me', userData);
    return response.data;
  }

  async updatePassword(passwordData) {
    const response = await this.api.put('/me/password', passwordData);
    return response.data;
  }

  async getUsers(params = {}) {
    const response = await this.api.get('/users', { params });
    return response.data;
  }

  async getUserById(userId) {
    const response = await this.api.get(`/users/${userId}`);
    return response.data;
  }

  async updateUser(userId, userData) {
    const response = await this.api.put(`/users/${userId}`, userData);
    return response.data;
  }

  async resetUserPassword(userId, passwordData) {
    const response = await this.api.put(`/users/${userId}/password`, passwordData);
    return response.data;
  }

  async deactivateUser(userId) {
    const response = await this.api.delete(`/users/${userId}`);
    return response.data;
  }

  async activateUser(userId) {
    const response = await this.api.put(`/users/${userId}/activate`);
    return response.data;
  }

  async getUsersByRole(role) {
    const response = await this.api.get(`/users/role/${role}`);
    return response.data;
  }

  async getUsersByLocation(locationId) {
    const response = await this.api.get(`/users/location/${locationId}`);
    return response.data;
  }

  logout() {
    localStorage.removeItem('auth_token');
  }

  isAuthenticated() {
    const token = localStorage.getItem('auth_token');
    return !!token;
  }

  getToken() {
    return localStorage.getItem('auth_token');
  }

  getAuthHeader() {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

export const authService = new AuthService();