import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
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
api.interceptors.response.use(
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

export const cameraService = {
  // Get camera details with relations
  getCameraById: async (id, includeRelations = true) => {
    try {
      const response = await api.get(`/cameras/${id}?include_relations=${includeRelations}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching camera:', error);
      throw error;
    }
  },

  // Get all cameras with filtering and pagination
  getCameras: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        skip: params.skip || 0,
        limit: params.limit || 100,
        include_relations: params.includeRelations || true,
        ...params
      }).toString();
      
      const response = await api.get(`/cameras?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching cameras:', error);
      throw error;
    }
  },

  // Create a new camera
  createCamera: async (cameraData) => {
    try {
      const response = await api.post('/cameras/', cameraData);
      return response.data;
    } catch (error) {
      console.error('Error creating camera:', error);
      throw error;
    }
  },

  // Update a camera
  updateCamera: async (id, cameraData) => {
    try {
      const response = await api.put(`/cameras/${id}`, cameraData);
      return response.data;
    } catch (error) {
      console.error('Error updating camera:', error);
      throw error;
    }
  },

  // Delete a camera
  deleteCamera: async (id) => {
    try {
      const response = await api.delete(`/cameras/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting camera:', error);
      throw error;
    }
  }
};

export const cameraActionService = {
  // Get camera actions for a specific camera
  getCameraActions: async (cameraId, params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        skip: params.skip || 0,
        limit: params.limit || 50,
        camera_id: cameraId,
        sort_order: params.sortOrder || 'desc',
        include_camera: params.includeCamera || false,
        ...params
      }).toString();
      
      const response = await api.get(`/actions?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching camera actions:', error);
      throw error;
    }
  },

  // Get all actions with filtering
  getAllActions: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        skip: params.skip || 0,
        limit: params.limit || 50,
        sort_order: params.sortOrder || 'desc',
        include_camera: params.includeCamera || true,
        ...params
      }).toString();
      
      const response = await api.get(`/actions?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching actions:', error);
      throw error;
    }
  },

  // Create a new camera action
  createAction: async (actionData) => {
    try {
      const response = await api.post('/actions/', actionData);
      return response.data;
    } catch (error) {
      console.error('Error creating camera action:', error);
      throw error;
    }
  },

  // Update a camera action
  updateAction: async (id, actionData) => {
    try {
      const response = await api.put(`/actions/${id}`, actionData);
      return response.data;
    } catch (error) {
      console.error('Error updating camera action:', error);
      throw error;
    }
  },

  // Delete a camera action
  deleteAction: async (id) => {
    try {
      const response = await api.delete(`/actions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting camera action:', error);
      throw error;
    }
  }
};

export const locationService = {
  // Get location details
  getLocationById: async (id) => {
    try {
      const response = await api.get(`/locations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching location:', error);
      throw error;
    }
  },

  // Get all locations with filtering and pagination
  getLocations: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        skip: params.skip || 0,
        limit: params.limit || 100,
        include_cameras: params.includeCameras || false,
        ...params
      }).toString();
      
      const response = await api.get(`/locations?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  },

  // Create a new location
  createLocation: async (locationData) => {
    try {
      const response = await api.post('/locations/', locationData);
      return response.data;
    } catch (error) {
      console.error('Error creating location:', error);
      throw error;
    }
  },

  // Update a location
  updateLocation: async (id, locationData) => {
    try {
      const response = await api.put(`/locations/${id}`, locationData);
      return response.data;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  },

  // Delete a location
  deleteLocation: async (id) => {
    try {
      const response = await api.delete(`/locations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  }
};

export const nvrService = {
  // Get NVR details
  getNvrById: async (id) => {
    try {
      const response = await api.get(`/nvrs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching NVR:', error);
      throw error;
    }
  },

  // Get all NVRs with filtering and pagination
  getNvrs: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        skip: params.skip || 0,
        limit: params.limit || 100,
        include_cameras: params.includeCameras || false,
        ...params
      }).toString();
      
      const response = await api.get(`/nvrs?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching NVRs:', error);
      throw error;
    }
  },

  // Create a new NVR
  createNvr: async (nvrData) => {
    try {
      const response = await api.post('/nvrs/', nvrData);
      return response.data;
    } catch (error) {
      console.error('Error creating NVR:', error);
      throw error;
    }
  },

  // Update an NVR
  updateNvr: async (id, nvrData) => {
    try {
      const response = await api.put(`/nvrs/${id}`, nvrData);
      return response.data;
    } catch (error) {
      console.error('Error updating NVR:', error);
      throw error;
    }
  },

  // Delete an NVR
  deleteNvr: async (id) => {
    try {
      const response = await api.delete(`/nvrs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting NVR:', error);
      throw error;
    }
  }
};

export default api;