import api from './api';

export const taskService = {
  createTask: (data) => api.post('/tasks', data),
  getTasks: (params) => api.get('/tasks', { params }),
  getTask: (id) => api.get(`/tasks/${id}`),
  updateTask: (id, data) => api.put(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  bulkUpdate: (tasks) => api.put('/tasks/bulk-update', { tasks }),
  getMyTasks: (params) => api.get('/tasks/my-tasks', { params }),
};

export default taskService;
