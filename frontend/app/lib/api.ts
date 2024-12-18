import axios from 'axios';

// Create an axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add authentication token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Authentication Services
export const authService = {
  candidateRegister: (data: { name: string, email: string, password: string }) => 
    api.post('/auth/candidates/register', data),
  
  candidateLogin: (data: { email: string, password: string }) => 
    api.post('/auth/candidates/login', data),
  
  adminLogin: (data: { username: string, password: string }) => 
    api.post('/auth/admin/login', data),
};

// Candidate Services
export const candidateService = {
  getProfile: () => api.get('/candidates/profile'),
  getCurrentProject: () => api.get('/candidates/current-project'),
  getCompletedProjects: () => api.get('/candidates/completed-projects'),
  updateProfile: (data: { name?: string, email?: string }) => 
    api.patch('/candidates/profile', data),
  getScoreboard: () => api.get('/candidates/scoreboard'),
};

// Project Services
export const projectService = {
  getAvailableProjects: () => api.get('/projects/available'),
  acceptProject: (data: { projectId: string, githubLink: string }) => 
    api.post('/projects/accept', data),
  resignFromProject: (data: { projectId: string }) => 
    api.post('/projects/resign', data),
};

// Progress Services
export const progressService = {
  updateProgress: (data: { completionPercentage: number, githubLink: string }) => 
    api.patch('/progress/update', data),
};

// Admin Services
export const adminService = {
  getAllCandidates: () => api.get('/admin/candidates'),
  getCandidatePerformance: () => api.get('/admin/candidates/performance'),
  createProject: (data: { 
    title: string, 
    description: string, 
    difficultyLevel: string, 
    pointsWorth: number 
  }) => api.post('/admin/projects', data),
  updateProject: (id: string, data: any) => api.patch(`/admin/projects/${id}`, data),
  getAllProjects: () => api.get('/admin/projects'),
  scoreProgress: (progressId: string, data: { 
    pointsEarned: number, 
    status: string, 
    adminFeedback: string 
  }) => api.patch(`/admin/progress/${progressId}/score`, data),
};

export default api;