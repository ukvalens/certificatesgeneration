import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const forgotPassword = (data) => API.post('/auth/forgot-password', data);
export const resetPassword = (data) => API.post('/auth/reset-password', data);

export const getUsers = () => API.get('/users');
export const updateUserRole = (id, role) => API.put(`/users/${id}/role`, { role });
export const adminResetPassword = (id, password) => API.put(`/users/${id}/password`, { password });
export const deleteUser = (id) => API.delete(`/users/${id}`);

export const getCategories = () => API.get('/categories');
export const createCategory = (data) => API.post('/categories', data);
export const updateCategory = (id, data) => API.put(`/categories/${id}`, data);
export const deleteCategory = (id) => API.delete(`/categories/${id}`);

export const getCertificateTypes = () => API.get('/certificate-types');
export const createCertificateType = (data) => API.post('/certificate-types', data);
export const updateCertificateType = (id, data) => API.put(`/certificate-types/${id}`, data);
export const deleteCertificateType = (id) => API.delete(`/certificate-types/${id}`);

export const getCertificates = () => API.get('/certificates');
export const createCertificate = (data) => API.post('/certificates', data);
export const updateCertificate = (id, data) => API.put(`/certificates/${id}`, data);
export const deleteCertificate = (id) => API.delete(`/certificates/${id}`);
export const verifyCertificate = (code) => API.get(`/certificates/verify/${code}`);
export const downloadCertificate = (id) => `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/certificates/${id}/download`;

export const getCourses = () => API.get('/courses');
export const getCourse = (id) => API.get(`/courses/${id}`);
export const createCourse = (data) => API.post('/courses', data);
export const updateCourse = (id, data) => API.put(`/courses/${id}`, data);
export const deleteCourse = (id) => API.delete(`/courses/${id}`);
export const createLesson = (courseId, data) => API.post(`/courses/${courseId}/lessons`, data);
export const updateLesson = (courseId, lessonId, data) => API.put(`/courses/${courseId}/lessons/${lessonId}`, data);
export const deleteLesson = (courseId, lessonId) => API.delete(`/courses/${courseId}/lessons/${lessonId}`);
export const enrollCourse = (id) => API.post(`/courses/${id}/enroll`);
export const getMyEnrollments = () => API.get('/courses/my-enrollments');
export const completeLesson = (lessonId) => API.post(`/courses/lessons/${lessonId}/complete`);
export const getLessonProgress = (courseId) => API.get(`/courses/${courseId}/progress`);
