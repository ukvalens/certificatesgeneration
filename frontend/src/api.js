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
