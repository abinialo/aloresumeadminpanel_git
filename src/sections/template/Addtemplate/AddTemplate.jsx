import React, { useEffect, useState } from 'react';
import { ZoomIn, ZoomOut, Grid, Save, Undo, Redo } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Canvas from '../../../components/Canvas/Canvas';
import Sidebar from '../../../components/Panels/Sidebar';
import PropertyPanel from '../../../components/Panels/PropertyPanel';
import useTemplateStore from '../../../stores/useTemplateStore';
import useUIStore from '../../../stores/useUIStore';
import {
  useCreateTemplateMutation,
  useGetAllCategoryQuery,
  useGetTemplateBySlugQuery,
  useUpdateTemplateMutation,
} from '../../../hooks/useTemplateMutations';
import SaveTemplateModal from './SaveTemplateModal';
import { buildSampleDataFromLayout } from '../../../utils/sampleDataBuilder';

const EMPTY_LAYOUT = {
  page: { width: 595, height: 842, backgroundColor: '#ffffff' },
  elements: [],
};

const REPEAT_ROOTS = ['experience', 'education', 'projects', 'certificate', 'certifications'];

const getRepeatRootFromBind = (bind) => {
  if (typeof bind !== 'string' || !bind.includes('.')) return '';
  const [root] = bind.split('.');
  return REPEAT_ROOTS.includes(root) ? root : '';
};

const buildRepeatFromFlatElements = (elements, root) => {
  if (!Array.isArray(elements) || elements.length === 0) return null;
  const rowsByKey = new Map();

  elements.forEach((el) => {
    const bind = String(el?.bind || '');
    if (!bind.startsWith(`${root}.`)) return;
    const field = bind.slice(root.length + 1);
    if (!field) return;
    const y = Number(el.y) || 0;
    const key = `${field}@${y}`;
    if (!rowsByKey.has(key)) {
      rowsByKey.set(key, { field, y, element: el });
    }
  });

  const candidates = Array.from(rowsByKey.values());
  if (candidates.length === 0) return null;

  const fieldCounts = candidates.reduce((acc, item) => {
    acc[item.field] = (acc[item.field] || 0) + 1;
    return acc;
  }, {});
  const anchorField = Object.entries(fieldCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || candidates[0].field;
  const rowStarts = candidates
    .filter((c) => c.field === anchorField)
    .map((c) => c.y)
    .sort((a, b) => a - b);

  const uniqueRowStarts = rowStarts.filter((y, idx) => idx === 0 || y !== rowStarts[idx - 1]);
  const repeatY = uniqueRowStarts[0] ?? Math.min(...candidates.map((c) => c.y));
  const rowGap =
    uniqueRowStarts.length > 1
      ? Math.min(...uniqueRowStarts.slice(1).map((y, idx) => y - uniqueRowStarts[idx]))
      : 140;

  const nextRowStart = uniqueRowStarts[1] ?? Infinity;
  const firstRowElements = candidates
    .map((c) => c.element)
    .filter((el) => {
      const y = Number(el.y) || 0;
      return y >= repeatY && y < nextRowStart;
    });

  if (firstRowElements.length === 0) return null;

  const repeatX = Math.min(...firstRowElements.map((el) => Number(el.x) || 0));
  const childElements = firstRowElements.map((el) => {
    const childBind = String(el.bind || '').slice(root.length + 1);
    const { positionType, ...rest } = el;
    return {
      ...rest,
      bind: childBind,
      x: (Number(el.x) || 0) - repeatX,
      y: (Number(el.y) || 0) - repeatY,
    };
  });

  return {
    id: `repeat-${root}`,
    type: 'repeat',
    positionType: 'absolute',
    bind: root,
    x: repeatX,
    y: repeatY,
    gap: rowGap,
    elements: childElements,
  };
};

const convertFlatSectionElementsToRepeat = (elements = []) => {
  const hasRepeatByRoot = new Set(
    elements
      .filter((el) => el?.type === 'repeat' && typeof el?.bind === 'string')
      .map((el) => el.bind)
      .filter((root) => REPEAT_ROOTS.includes(root))
  );

  const flatByRoot = elements.reduce((acc, el) => {
    const root = getRepeatRootFromBind(el?.bind);
    if (!root || hasRepeatByRoot.has(root) || el?.type === 'repeat') return acc;
    if (!acc[root]) acc[root] = [];
    acc[root].push(el);
    return acc;
  }, {});

  if (Object.keys(flatByRoot).length === 0) return elements;

  const toRemove = new Set();
  const repeatsToAdd = [];

  Object.entries(flatByRoot).forEach(([root, rootElements]) => {
    const repeatElement = buildRepeatFromFlatElements(rootElements, root);
    if (!repeatElement) return;
    rootElements.forEach((el) => toRemove.add(el.id));
    repeatsToAdd.push(repeatElement);
  });

  const remaining = elements.filter((el) => !toRemove.has(el.id));
  return [...remaining, ...repeatsToAdd];
};

const normalizeDataRoot = (root) => {
  if (root === 'certificate' || root === 'certificates' || root === 'certification') return 'certifications';
  if (root === 'project') return 'projects';
  return root;
};

const expandRepeatElementsForEditor = (layoutJSON, resumeData = {}) => {
  if (!layoutJSON || !Array.isArray(layoutJSON.elements)) return layoutJSON;

  const repeatRootsInLayout = new Set(
    layoutJSON.elements
      .filter((el) => el?.type === 'repeat' && REPEAT_ROOTS.includes(el?.bind))
      .map((el) => el.bind)
  );

  const expandedElements = [];

  layoutJSON.elements.forEach((element) => {
    const elementBindRoot = getRepeatRootFromBind(element?.bind);
    const isLegacyFlatForRepeatRoot =
      element?.type !== 'repeat' && elementBindRoot && repeatRootsInLayout.has(elementBindRoot);

    // If a repeat block exists for this section, ignore old flat bound elements to avoid duplicate rendering.
    if (isLegacyFlatForRepeatRoot) {
      return;
    }

    const isTargetRepeat = element?.type === 'repeat' && REPEAT_ROOTS.includes(element?.bind);
    if (!isTargetRepeat || !Array.isArray(element.elements)) {
      expandedElements.push(element);
      return;
    }

    const root = normalizeDataRoot(element.bind);
    const items = Array.isArray(resumeData?.[root]) ? resumeData[root] : [];
    const rowCount = Math.max(1, items.length);
    const gap = Number(element.gap) || 140;
    const baseX = Number(element.x) || 0;
    const baseY = Number(element.y) || 0;

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
      element.elements.forEach((child, childIndex) => {
        const rawChildBind = String(child?.bind || '').trim();
        const normalizedChildBind = rawChildBind.startsWith(`${element.bind}.`)
          ? rawChildBind.slice(element.bind.length + 1)
          : rawChildBind.replace(/^\d+\./, '');
        const composedBind = normalizedChildBind ? `${element.bind}.${normalizedChildBind}` : element.bind;

        expandedElements.push({
          ...child,
          id: `${child?.id || child?.type || 'element'}-r${rowIndex}-c${childIndex}-${Date.now()}-${Math.floor(
            Math.random() * 1000
          )}`,
          positionType: 'absolute',
          x: baseX + (Number(child?.x) || 0),
          y: baseY + (Number(child?.y) || 0) + rowIndex * gap,
          bind: composedBind,
        });
      });
    }
  });

  return {
    ...layoutJSON,
    elements: expandedElements,
  };
};

const AddTemplate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const slugId = searchParams.get('slugId') || '';

  const { undo, redo, layout, loadTemplate, copySelectedElement, pasteCopiedElement } = useTemplateStore();
  const { zoom, setZoom, showGrid, toggleGrid } = useUIStore();

  const [showModal, setShowModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [folderName, setFolderName] = useState('');
  const [editingTemplateId, setEditingTemplateId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [templateUrl, setTemplateUrl] = useState(
    'https://allindev.s3.ap-south-1.amazonaws.com/1771420090804-Professtional_resume.webp'
  );

  const createTemplateMutation = useCreateTemplateMutation();
  const updateTemplateMutation = useUpdateTemplateMutation();
  const { data: templateBySlugData, isLoading: isTemplateLoading } = useGetTemplateBySlugQuery(slugId);
  const { data: categoriesResponse, isLoading: isCategoryLoading } = useGetAllCategoryQuery();

  const categories = Array.isArray(categoriesResponse)
    ? categoriesResponse
    : Array.isArray(categoriesResponse?.data)
      ? categoriesResponse.data
      : Array.isArray(categoriesResponse?.categories)
        ? categoriesResponse.categories
        : [];

  const generateFolderName = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  };

  useEffect(() => {
    if (slugId) return;
    setFolderName(generateFolderName(templateName));
  }, [templateName, slugId]);

  useEffect(() => {
    if (!slugId) {
      setEditingTemplateId('');
      loadTemplate(EMPTY_LAYOUT);
      return;
    }

    const template = templateBySlugData?.data;
    if (!template) return;

    setEditingTemplateId(template._id || '');

    if (template.layoutJSON) {
      const templateSampleData = template.sampleData || {};
      const editorLayout = expandRepeatElementsForEditor(template.layoutJSON, templateSampleData);
      loadTemplate(editorLayout, templateSampleData);
    }

    if (template.name) {
      setTemplateName(template.name);
    }

    if (template.folderName) {
      setFolderName(template.folderName);
    }

    if (template.thumbnail) {
      setTemplateUrl(template.thumbnail);
    }

    const existingCategoryId =
      template.categoryId?._id ||
      template.categoryId ||
      template.category?._id ||
      template.category ||
      '';
    if (existingCategoryId) {
      setSelectedCategoryId(existingCategoryId);
    }
  }, [slugId, templateBySlugData, loadTemplate]);

  useEffect(() => {
    if (selectedCategoryId || categories.length === 0) return;
    setSelectedCategoryId(categories[0]?._id || '');
  }, [categories, selectedCategoryId]);

  useEffect(() => {
    const isTypingTarget = (target) => {
      if (!target) return false;
      const tag = target.tagName?.toLowerCase();
      return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
    };

    const handleKeyDown = (e) => {
      const isMeta = e.ctrlKey || e.metaKey;
      if (!isMeta) return;
      if (isTypingTarget(e.target)) return;

      const key = e.key.toLowerCase();
      if (key === 'c') {
        e.preventDefault();
        copySelectedElement();
      }
      if (key === 'v') {
        e.preventDefault();
        pasteCopiedElement();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [copySelectedElement, pasteCopiedElement]);

  const handleConfirmSave = async () => {
    if (!selectedCategoryId) {
      alert('Please select a category');
      return;
    } 

    try {
      const sampleData = buildSampleDataFromLayout(layout);
      const normalizeRepeatChildBind = (repeatBind, childBind) => {
        if (typeof childBind !== 'string' || !childBind.trim()) return childBind;
        if (typeof repeatBind !== 'string' || !repeatBind.trim()) return childBind;

        const root = repeatBind.trim();
        const escapedRoot = root.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Convert "experience.position" / "experience.0.position" to "position"
        const indexedMatch = childBind.match(new RegExp(`^${escapedRoot}\\.\\d+\\.(.+)$`));
        if (indexedMatch) return indexedMatch[1];

        const directMatch = childBind.match(new RegExp(`^${escapedRoot}\\.(.+)$`));
        if (directMatch) return directMatch[1];

        return childBind;
      };

      const normalizeLayoutElementForSave = (element) => {
        const normalizedZIndex = element.style?.zIndex ?? element.zIndex ?? 1;
        const { zIndex, marginTop, collapsed, ...restElement } = element;
        const sectionRoots = new Set(['experience', 'education', 'projects', 'certificate', 'certifications']);
        const isTargetRepeat = element.type === 'repeat' && sectionRoots.has(element.bind);

        const normalizedChildren = Array.isArray(element.elements)
          ? element.elements.map((child) =>
              isTargetRepeat
                ? { ...child, bind: normalizeRepeatChildBind(element.bind, child.bind) }
                : { ...child }
            )
          : element.elements;

        return {
          ...restElement,
          ...(Array.isArray(element.elements) ? { elements: normalizedChildren } : {}),
          positionType: 'absolute',
          style: {
            ...(element.style || {}),
            zIndex: normalizedZIndex,
          },
        };
      };

      const repeatReadyElements = convertFlatSectionElementsToRepeat(layout.elements || []);
      const normalizedLayout = {
        ...layout,
        elements: repeatReadyElements.map(normalizeLayoutElementForSave),
      };

      const payload = {
        name: templateName,
        folder: folderName,
        // thumbnail:templateUrl,
        layoutJSON: normalizedLayout,
        categoryId: selectedCategoryId,
        sampleData,
      };

      console.log('Payload:', payload);
      const response = editingTemplateId
        ? await updateTemplateMutation.mutateAsync({ templateId: editingTemplateId, payload })
        : await createTemplateMutation.mutateAsync(payload);

      console.log('API Response:', response);

      // alert(editingTemplateId ? 'Template updated successfully!' : 'Template saved successfully!');
      setShowModal(false);

      if (!editingTemplateId) {
        setTemplateName('');
        setFolderName('');
        setSelectedCategoryId(categories[0]?._id || '');
      }

      navigate('/template');
    } catch (error) {
      console.error('Error saving template:', error);
      alert(editingTemplateId ? 'Failed to update template' : 'Failed to save template');
    }
  };

  return (
    <>
      <div className="h-screen flex flex-col bg-gray-50">
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Template Builder</h1>
            {slugId && isTemplateLoading && <span className="text-sm text-gray-500">Loading template...</span>}
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => undo()} className="p-2 hover:bg-gray-100 rounded" title="Undo">
              <Undo className="w-4 h-4" />
            </button>
            <button onClick={() => redo()} className="p-2 hover:bg-gray-100 rounded" title="Redo">
              <Redo className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            <button
              onClick={() => setZoom(Math.max(0.25, zoom - 0.1))}
              className="p-2 hover:bg-gray-100 rounded"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium w-16 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(2, zoom + 0.1))}
              className="p-2 hover:bg-gray-100 rounded"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            <button
              onClick={toggleGrid}
              className={`p-2 rounded ${showGrid ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              title="Toggle Grid"
            >
              <Grid className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-2" />

            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Template
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <Sidebar />
          <Canvas />
          <PropertyPanel />
        </div>
      </div>

      <SaveTemplateModal
        open={showModal}
        templateName={templateName}
        setTemplateName={setTemplateName}
        folderName={folderName}
        setFolderName={setFolderName}
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        setSelectedCategoryId={setSelectedCategoryId}
        isCategoryLoading={isCategoryLoading}
        templateUrl={templateUrl}
        setTemplateUrl={setTemplateUrl}
        isSaving={createTemplateMutation.isPending || updateTemplateMutation.isPending}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmSave}
      />
    </>
  );
};

export default AddTemplate;
