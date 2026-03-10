import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createCategory,
  createTemplate,
  getAllCategory,
  getTemplateBySlug,
  getTemplates,
  updateCategory,
  updateTemplate,
  deleteCategory,
} from '../api/templateApi';
import { uploadFile } from '../api/fileApi';

export const useCreateTemplateMutation = () => {
  return useMutation({
    mutationFn: createTemplate,
  });
};

export const useUpdateTemplateMutation = () => {
  return useMutation({
    mutationFn: updateTemplate,
  });
};

export const useGetTemplatesQuery = ({ page = 0, limit = 10 } = {}) => {
  return useQuery({
    queryKey: ['templates', page, limit],
    queryFn: () => getTemplates({ page, limit }),
  });
};

export const useGetTemplateBySlugQuery = (slugId) => {
  return useQuery({
    queryKey: ['templateBySlug', slugId],
    queryFn: () => getTemplateBySlug(slugId),
    enabled: Boolean(slugId),
  });
};

export const useGetAllCategoryQuery = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategory,
  });
};

export const useCreateCategoryMutation = () => {
  return useMutation({
    mutationFn: createCategory,
  });
};

export const useUploadFileMutation = () => {
  return useMutation({
    mutationFn: uploadFile,
  });
};

export const useUpdateCategoryMutation = () => {
  return useMutation({
    mutationFn: updateCategory,
  });
};

export const useDeleteCategoryMutation = () => {
  return useMutation({
    mutationFn: deleteCategory,
  });
};
