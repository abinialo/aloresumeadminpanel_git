import { create } from 'zustand';

/**
 * UI Store - Manages UI state (zoom, panels, modals)
 */
const useUIStore = create((set) => ({
    // State
    zoom: 1,
    showGrid: true,
    activePanel: 'properties', // 'properties' | 'layers' | null

    // Actions
    setZoom: (zoom) => set({ zoom }),
    toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
    setActivePanel: (panel) => set({ activePanel: panel }),
    togglePanel: (panel) => set((state) => ({
        activePanel: state.activePanel === panel ? null : panel
    }))
}));

export default useUIStore;
