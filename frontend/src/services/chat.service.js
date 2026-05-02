import api from './api';

export const chatService = {
  sendMessage: (data) => api.post('/chat/messages', data),
  getMessages: (params) => api.get('/chat/messages', { params }),
  editMessage: (id, content) => api.put(`/chat/messages/${id}`, { content }),
  deleteMessage: (id) => api.delete(`/chat/messages/${id}`),
  markAsRead: (data) => api.post('/chat/read', data),
  getUnreadCount: () => api.get('/chat/unread'),
};

export const projectService = {
  createProject: (data) => api.post('/projects', data),
  getProjects: (params) => api.get('/projects', { params }),
  getProject: (id) => api.get(`/projects/${id}`),
  updateProject: (id, data) => api.put(`/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/projects/${id}`),
  addMember: (id, data) => api.post(`/projects/${id}/members`, data),
  removeMember: (id, userId) => api.delete(`/projects/${id}/members/${userId}`),
};

export const workspaceService = {
  createWorkspace: (data) => api.post('/workspaces', data),
  getWorkspaces: () => api.get('/workspaces'),
  getWorkspace: (id) => api.get(`/workspaces/${id}`),
  updateWorkspace: (id, data) => api.put(`/workspaces/${id}`, data),
  addMember: (id, data) => api.post(`/workspaces/${id}/members`, data),
  removeMember: (id, userId) => api.delete(`/workspaces/${id}/members/${userId}`),
  deleteWorkspace: (id) => api.delete(`/workspaces/${id}`),
};

export const notificationService = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  clearRead: () => api.delete('/notifications/clear-read'),
};

export const commentService = {
  addComment: (data) => api.post('/comments', data),
  getComments: (params) => api.get('/comments', { params }),
  updateComment: (id, data) => api.put(`/comments/${id}`, data),
  deleteComment: (id) => api.delete(`/comments/${id}`),
  react: (id, emoji) => api.post(`/comments/${id}/react`, { emoji }),
};

export const userService = {
  searchUsers: (q) => api.get('/users/search', { params: { q } }),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (formData) => api.put('/users/profile', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getUser: (id) => api.get(`/users/${id}`),
};

export const activityService = {
  getProjectActivity: (projectId, params) => api.get(`/activity/project/${projectId}`, { params }),
  getWorkspaceActivity: (workspaceId, params) => api.get(`/activity/workspace/${workspaceId}`, { params }),
  getUserActivity: (params) => api.get('/activity/user', { params }),
};

export default chatService;
