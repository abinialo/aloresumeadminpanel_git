import { create } from "zustand";
import mockResumeData from "../utils/mockResumeData.json";
import { estimateWrappedTextHeight } from "../utils/textLayout";

const normalizeElementIds = (elements = []) => {
  return elements.map((element, index) => {
    const fallbackId = `${element?.type || "element"}-${Date.now()}-${index}-${Math.floor(Math.random() * 1000)}`;
    const normalized = {
      ...element,
      id: String(element?.id || element?._id || fallbackId),
    };

    if (Array.isArray(element?.elements)) {
      normalized.elements = normalizeElementIds(element.elements);
    }

    return normalized;
  });
};
/**
 * Template Store - Manages the layoutJSON state
 * Includes undo/redo functionality
 */
const useTemplateStore = create((set, get) => ({
  // State
  layout: {
    page: { width: 595, height: 842, backgroundColor: "#ffffff" },
    elements: [],
  },
  resumeData: mockResumeData,
  selectedId: null,
  copiedElement: null,
  history: [],
  historyIndex: -1,

  // Actions
  addElement: (type, defaults = {}) => {
    const baseElement = {
      id: `${type}-${Date.now()}`,
      type,
      positionType: "absolute",
      x: 50,
      y: 50,
      width: 200,
      height: 24,
      style: {
        fontSize: 14,
        color: "#000000",
        zIndex: 1,
      },
    };
    const mergedStyle = { ...baseElement.style, ...(defaults.style || {}) };
    const newElement = { ...baseElement, ...defaults, style: mergedStyle };

    const textLikeTypes = ["text", "heading", "paragraph", "subheading", "bullet-list"];
    if (defaults.height === undefined && textLikeTypes.includes(type)) {
      const content = typeof newElement.text === "string" ? newElement.text : "";
      newElement.height = estimateWrappedTextHeight(content, newElement.style, newElement.width);
    }

    set((state) => {
      const newElements = [...state.layout.elements, newElement];
      return {
        layout: { ...state.layout, elements: newElements },
        selectedId: newElement.id,
        history: [
          ...state.history.slice(0, state.historyIndex + 1),
          { ...state.layout },
        ],
        historyIndex: state.historyIndex + 1,
      };
    });
  },

  updateResumeData: (path, value) => {
    set((state) => {
      const keys = path.split(".");
      const updated = { ...state.resumeData };
      let obj = updated;

      keys.slice(0, -1).forEach((k) => {
        if (!obj[k]) obj[k] = {};
        obj[k] = { ...obj[k] };
        obj = obj[k];
      });

      obj[keys[keys.length - 1]] = value;

      return { resumeData: updated };
    });
  },

  updateElement: (id, updates) => {
    set((state) => {
      const newElements = state.layout.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el,
      );
      return {
        layout: { ...state.layout, elements: newElements },
        history: [
          ...state.history.slice(0, state.historyIndex + 1),
          { ...state.layout },
        ],
        historyIndex: state.historyIndex + 1,
      };
    });
  },

  removeElement: (id) => {
    set((state) => {
      const newElements = state.layout.elements.filter((el) => el.id !== id);
      return {
        layout: { ...state.layout, elements: newElements },
        selectedId: state.selectedId === id ? null : state.selectedId,
        history: [
          ...state.history.slice(0, state.historyIndex + 1),
          { ...state.layout },
        ],
        historyIndex: state.historyIndex + 1,
      };
    });
  },

  selectElement: (id) => {
    set({ selectedId: id });
  },

  copySelectedElement: () => {
    const state = get();
    const selectedElement = state.layout.elements.find(
      (el) => el.id === state.selectedId,
    );
    if (!selectedElement) return;
    set({
      copiedElement: JSON.parse(JSON.stringify(selectedElement)),
    });
  },

  pasteCopiedElement: () => {
    set((state) => {
      if (!state.copiedElement) return state;

      const source = state.copiedElement;
      const newElement = {
        ...JSON.parse(JSON.stringify(source)),
        id: `${source.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        x: Number(source.x || 0) + 20,
        y: Number(source.y || 0) + 20,
      };

      const newElements = [...state.layout.elements, newElement];
      return {
        layout: { ...state.layout, elements: newElements },
        selectedId: newElement.id,
        history: [
          ...state.history.slice(0, state.historyIndex + 1),
          { ...state.layout },
        ],
        historyIndex: state.historyIndex + 1,
      };
    });
  },

  reorderElements: (startIndex, endIndex) => {
    set((state) => {
      const newElements = [...state.layout.elements];
      const [removed] = newElements.splice(startIndex, 1);
      newElements.splice(endIndex, 0, removed);
      return {
        layout: { ...state.layout, elements: newElements },
        history: [
          ...state.history.slice(0, state.historyIndex + 1),
          { ...state.layout },
        ],
        historyIndex: state.historyIndex + 1,
      };
    });
  },

  undo: () => {
    set((state) => {
      if (state.historyIndex > 0) {
        return {
          layout: state.history[state.historyIndex - 1],
          historyIndex: state.historyIndex - 1,
        };
      }
      return state;
    });
  },

  redo: () => {
    set((state) => {
      if (state.historyIndex < state.history.length - 1) {
        return {
          layout: state.history[state.historyIndex + 1],
          historyIndex: state.historyIndex + 1,
        };
      }
      return state;
    });
  },

  // Computed
  getSelectedElement: () => {
    const state = get();
    return state.layout.elements.find((el) => el.id === state.selectedId);
  },

  // Load template from API
  loadTemplate: (layoutJSON, resumeData) => {
    const safeLayout = {
      ...layoutJSON,
      elements: normalizeElementIds(layoutJSON?.elements || []),
    };

    set({
      layout: safeLayout,
      resumeData: resumeData ?? mockResumeData,
      selectedId: null,
      copiedElement: null,
      history: [safeLayout],
      historyIndex: 0,
    });
  },
}));

export default useTemplateStore;
