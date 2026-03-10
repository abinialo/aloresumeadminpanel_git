import apiClient from './apiClient';

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post('/file/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};
