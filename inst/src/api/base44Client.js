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
  entities: {
    Projekt: createEntityClient('/admin/projects'),
    Kunde: createEntityClient('/admin/customers'),
    Benutzer: createEntityClient('/auth/users'), // Need to add users list endpoint or use admin
    Ware: createEntityClient('/admin/products'),
    Aufgabe: createEntityClient('/admin/tasks'),
    Dokument: createEntityClient('/admin/documents'),
  }
};
