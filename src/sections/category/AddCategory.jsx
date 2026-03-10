import React, { useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateCategoryMutation,
  useGetAllCategoryQuery,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useUploadFileMutation,
} from '../../hooks/useTemplateMutations';

const normalizeCategory = (category) => {
  if (!category) return null;
  const id =
    category._id ?? category.id ?? `${category.categoryName ?? category.name ?? 'category'}-${Math.random()
      .toString(16)
      .slice(2)}`;
  const rawId = category._id ?? category.id ?? category.categoryId ?? id;
  return {
    id,
    name: category.categoryName ?? category.name ?? 'Untitled Category',
    image:
      category.categoryImage ??
      category.thumbnail ??
      category.image ??
      category.imageUrl ??
      '',
    originalId: rawId,
  };
};

const extractImageUrlFromUpload = (payload) => {
  if (!payload) return '';
  const candidate =
    payload.imgUrl ??
    payload.data?.imgUrl ??
    payload.url ??
    payload.data?.url ??
    payload.fileUrl ??
    payload.imageUrl ??
    payload.path ??
    payload.data?.path;
  return candidate ?? '';
};

const AddCategory = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryImageUrl, setCategoryImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();
  const createCategoryMutation = useCreateCategoryMutation();
  const updateCategoryMutation = useUpdateCategoryMutation();
  const deleteCategoryMutation = useDeleteCategoryMutation();
  const fileUploadMutation = useUploadFileMutation();
  const { data: categoriesResponse, isLoading: isCategoriesLoading, isError } =
    useGetAllCategoryQuery();
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

  const canSubmit = Boolean(categoryName.trim() && categoryImageUrl.trim());
  const isSubmitting = createCategoryMutation.isPending || updateCategoryMutation.isPending;

  const resetFormState = () => {
    setCategoryName('');
    setCategoryImageUrl('');
    setSelectedFile(null);
    setUploadError('');
    setIsEditing(false);
    setEditingCategoryId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openCreateModal = () => {
    resetFormState();
    setIsModalOpen(true);
  };

  const startEditingCategory = (category) => {
    resetFormState();
    setCategoryName(category.name ?? '');
    setCategoryImageUrl(category.image ?? '');
    setEditingCategoryId(category.originalId ?? category.id ?? null);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetFormState();
  };

  const apiCategories = useMemo(() => {
    if (!categoriesResponse) return [];
    if (Array.isArray(categoriesResponse)) return categoriesResponse;
    if (Array.isArray(categoriesResponse.data)) return categoriesResponse.data;
    if (Array.isArray(categoriesResponse.categories)) return categoriesResponse.categories;
    return [];
  }, [categoriesResponse]);

  const normalizedCategories = useMemo(
    () => apiCategories.map((category) => normalizeCategory(category)).filter(Boolean),
    [apiCategories]
  );

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setUploadError('');
  };

  const handleFileUpload = () => {
    if (!selectedFile || fileUploadMutation.isLoading) return;

    fileUploadMutation.mutate(selectedFile, {
      onSuccess: (data) => {
        const uploadedImageUrl = extractImageUrlFromUpload(data);
        if (!uploadedImageUrl) {
          setUploadError('Upload succeeded but server did not return a usable URL.');
          return;
        }
        setCategoryImageUrl(uploadedImageUrl);
        setSelectedFile(null);
        setUploadError('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      },
      onError: (error) => {
        const message =
          error?.response?.data?.message ??
          error?.message ??
          'Unable to upload image. Please try again.';
        setUploadError(message);
      },
    });
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const [deleteCandidate, setDeleteCandidate] = useState(null);

  const handleRequestDelete = (category) => {
    if (deleteCategoryMutation.isPending) return;
    setDeleteCandidate(category);
  };

  const cancelDelete = () => {
    setDeleteCandidate(null);
  };

  const confirmDelete = () => {
    if (!deleteCandidate) return;
    deleteCategoryMutation.mutate(deleteCandidate.originalId ?? deleteCandidate.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      },
      onSettled: () => {
        cancelDelete();
      },
    });
  };

  const emptyStateMessage = isCategoriesLoading
    ? 'Loading categories...'
    : isError
      ? 'Failed to load categories'
      : 'No categories yet. Click "Add Category" to begin.';

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!canSubmit || isSubmitting) return;

    const payload = {
      categoryName: categoryName.trim(),
      categoryImage: categoryImageUrl.trim(),
    };

    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    };

    const onSettled = () => {
      resetFormState();
      setIsModalOpen(false);
    };

    if (isEditing && editingCategoryId) {
      updateCategoryMutation.mutate(
        { categoryId: editingCategoryId, payload },
        { onSuccess, onSettled }
      );
    } else {
      createCategoryMutation.mutate(payload, {
        onSuccess,
        onSettled,
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500">
            Manage categories that templates can be assigned to.
          </p>
        </div>
        <button
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-500 transition-colors"
          onClick={openCreateModal}
        >
          Add Category
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-lg divide-y divide-slate-100">
        {normalizedCategories.length === 0 ? (
          <div className="p-8 text-center text-slate-500">{emptyStateMessage}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Category Name</th>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {normalizedCategories.map((category) => (
                  <tr key={category.id} className="border-b last:border-transparent">
                    <td className="px-4 py-3 text-sm text-slate-600">{category.name}</td>
                    <td className="px-4 py-3">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-16 h-16 rounded-lg object-cover border border-slate-200"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-[10px] text-slate-400">
                          No image
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditingCategory(category)}
                          className="px-2 py-1 text-xs font-semibold text-indigo-600 rounded-lg hover:bg-indigo-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRequestDelete(category)}
                          disabled={deleteCategoryMutation.isPending}
                          className="px-2 py-1 text-xs font-semibold text-rose-600 rounded-lg hover:bg-rose-50 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center px-4 z-50">
          <form
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
            onSubmit={handleSubmit}
          >
            <h2 className="text-xl font-semibold text-slate-900">
              {isEditing ? 'Edit Category' : 'Add New Category'}
            </h2>

            <label className="block space-y-2 text-sm text-slate-600">
              <span className="font-medium text-slate-800">Category Name</span>
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="e.g. Professional"
                className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                required
              />
            </label>

            <div className="space-y-2 text-sm text-slate-600">
              <p className="text-xs text-slate-500">
                Upload an image from your device to set the category image.
              </p>
              <label className="block space-y-2">
                <span className="font-medium text-slate-800">Upload Image</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:border-indigo-500 focus:outline-none"
                />
              </label>
              {selectedFile && (
                <div className="mt-2 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  <span className="truncate">{selectedFile.name}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleFileUpload}
                      disabled={fileUploadMutation.isLoading}
                      className="px-3 py-1 rounded-xl bg-slate-900 text-white text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {fileUploadMutation.isLoading ? 'Uploading...' : 'Upload file'}
                    </button>
                    <button
                      type="button"
                      onClick={clearSelectedFile}
                      className="px-1 text-xs font-semibold text-rose-500 hover:text-rose-600"
                      aria-label="Clear selected file"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
              {uploadError && <p className="text-xs text-rose-500">{uploadError}</p>}
            </div>

            {categoryImageUrl && (
              <div className="space-y-1">
                <p className="text-xs text-slate-500">Preview</p>
                <img
                  src={categoryImageUrl}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-xl border border-slate-200"
                />
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold disabled:bg-emerald-300 transition-colors"
              >
                {isSubmitting ? (isEditing ? 'Updating...' : 'Saving...') : isEditing ? 'Update Category' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      )}
      {deleteCandidate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">Confirm delete</h3>
            <p className="text-sm text-slate-600">
              Delete category <span className="font-semibold text-slate-900">{deleteCandidate.name}</span>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={cancelDelete}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteCategoryMutation.isPending}
                className="px-3 py-2 rounded-xl bg-rose-600 text-white font-semibold disabled:bg-rose-300"
              >
                {deleteCategoryMutation.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCategory;
