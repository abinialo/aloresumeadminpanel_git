import apiClient from './apiClient';

export const getTemplates = async ({ page = 0, limit = 10 } = {}) => {
  const res = await apiClient.get('/template', {
    params: { page, limit },
  });
  return res.data;
};

export const getTemplateBySlug = async (slugId) => {
  const res = await apiClient.get(`/template/${encodeURIComponent(slugId)}`);
  return res.data;
};

export const createTemplate = async (payload) => {
  const res = await apiClient.post('/template', payload);
  return res.data;
};

export const updateTemplate = async ({ templateId, payload }) => {
  const res = await apiClient.put(`/template/${encodeURIComponent(templateId)}`, payload);
  return res.data;
};

export const getAllCategory = async () => {
  const res = await apiClient.get('/category/getAllCategory');
  return res.data;
};

export const createCategory = async (payload) => {
  const res = await apiClient.post('/category/createCategory', payload);
  return res.data;
};

export const updateCategory = async ({ categoryId, payload }) => {
  const res = await apiClient.put(
    `/category/updateCategory/${encodeURIComponent(categoryId)}`,
    payload
  );
  return res.data;
};

export const deleteCategory = async (categoryId) => {
  const res = await apiClient.delete(`/category/deleteCategory/${encodeURIComponent(categoryId)}`);
  return res.data;
};
