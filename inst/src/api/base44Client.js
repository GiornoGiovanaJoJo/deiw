import api from '@/lib/api';

// Helper to create a CRUD wrapper for entities
const createEntityClient = (endpoint) => ({
  list: async (sort, limit) => {
    // Basic implementation ignoring sort/limit for now or passing as query params
    const response = await api.get(endpoint);
    return response.data;
  },
  get: async (id) => {
    const response = await api.get(`${endpoint}/${id}`);
    return response.data;
  },
  filter: async (criteria) => {
    // Basic filter implementation - this might need enhancement based on backend support
    const response = await api.get(endpoint); // Fetch all and filter client side or implement search param
    // Ideally backend supports filtering. For now return all for simple "get by id" cases if criteria has id
    if (criteria.id) {
      const item = response.data.find(i => i.id === criteria.id);
      return item ? [item] : [];
    }
    return response.data;
  },
  create: async (data) => {
    const response = await api.post(endpoint, data);
    return response.data;
  },
  update: async (id, data) => {
    const response = await api.put(`${endpoint}/${id}`, data);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`${endpoint}/${id}`);
    return response.data;
  }
});

// Mock the base44 SDK structure
export const base44 = {
  auth: {
    me: async () => {
      const response = await api.get('/auth/me');
      return response.data;
    },
    logout: () => {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  },
  client: {
    getMyProjects: async () => {
      const response = await api.get('/client/projects');
      return response.data;
    },
    getMyRequests: async () => {
      const response = await api.get('/client/requests');
      return response.data;
    },
    updateProfile: async (data) => {
      const response = await api.patch('/client/profile', data);
      return response.data;
    }
  },
  public: {
    getProjects: async (limit = 100) => {
      const response = await api.get(`/public/projects?limit=${limit}`);
      return response.data;
    },
    getCategories: async (limit = 100) => {
      const response = await api.get(`/public/categories?limit=${limit}`);
      return response.data;
    },
    submitInquiry: async (data) => {
      const response = await api.post('/public/inquiries', data);
      return response.data;
    }
  },
  entities: {
    Projekt: createEntityClient('/admin/projects'),
    Kunde: createEntityClient('/admin/customers'),
    Benutzer: createEntityClient('/auth/users'), // Need to add users list endpoint or use admin
    Ware: createEntityClient('/admin/products'),
    Aufgabe: createEntityClient('/admin/tasks'),
    Dokument: createEntityClient('/admin/documents'),
  }
};
