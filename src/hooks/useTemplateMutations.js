import { useMutation, useQuery } from '@tanstack/react-query';
import { createTemplate, getAllCategory, getTemplateBySlug, getTemplates, updateTemplate } from '../api/templateApi';

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
