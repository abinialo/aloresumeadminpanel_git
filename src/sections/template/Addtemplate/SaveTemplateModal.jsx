import React from 'react';

const SaveTemplateModal = ({
  open,
  templateName,
  setTemplateName,
  folderName,
  setFolderName,
  categories,
  selectedCategoryId,
  setSelectedCategoryId,
  isCategoryLoading,
  templateUrl,
  setTemplateUrl,
  isSaving,
  onClose,
  onConfirm,
}) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Save Template</h2>

        <div className="mb-3">
          <label className="text-sm font-medium">Template Name</label>
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-full border rounded px-2 py-1 mt-1"
          />
        </div>

        <div className="mb-3">
          <label className="text-sm font-medium">Folder Name</label>
          <input
            type="text"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className="w-full border rounded px-2 py-1 mt-1"
          />
        </div>

        <div className="mb-3">
          <label className="text-sm font-medium">Category</label>
          <select
            value={selectedCategoryId || ''}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full border rounded px-2 py-1 mt-1"
            disabled={isCategoryLoading}
          >
            <option value="">
              {isCategoryLoading ? 'Loading categories...' : '-- Select Category --'}
            </option>
            {(categories || []).map((category) => (
              <option key={category._id} value={category._id}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>

        {/* <div className="mb-4">
          <label className="text-sm font-medium">Template URL</label>
          <input
            type="text"
            value={templateUrl}
            onChange={(e) => setTemplateUrl(e.target.value)}
            className="w-full border rounded px-2 py-1 mt-1"
          />
        </div> */}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-1 bg-gray-200 rounded">
            Cancel
          </button>

          <button
            disabled={isSaving || !templateName || !selectedCategoryId}
            onClick={onConfirm}
            className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Confirm Save'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveTemplateModal;
