import React, { useMemo } from 'react';
import useTemplateStore from '../../stores/useTemplateStore';
import useUIStore from '../../stores/useUIStore';
import { calculateLayout } from '../../utils/layoutRenderer';
import AbsoluteElement from './AbsoluteElement';

/**
 * Canvas - Main workspace for template editing
 */
const Canvas = () => {
    const { layout, resumeData } = useTemplateStore();
    const { zoom, showGrid } = useUIStore();

    // Keep legacy flow templates renderable by precomputing layout,
    // then force absolute rendering in editor.
    const positionedElements = useMemo(() => {
        return calculateLayout(layout, resumeData).map((element) => ({
            ...element,
            positionType: 'absolute',
            collapsed: false
        }));
    }, [layout, resumeData]);

    const canvasStyle = {
        width: layout.page.width,
        height: layout.page.height,
        backgroundColor: layout.page.backgroundColor || '#ffffff',
        position: 'relative',
        transform: `scale(${zoom})`,
        transformOrigin: 'top left',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        backgroundImage: showGrid
            ? 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)'
            : 'none',
        backgroundSize: showGrid ? '20px 20px' : 'auto'
    };

    return (
        <div className="flex-1 overflow-auto bg-gray-100 p-8">
            <div style={canvasStyle}>
                {positionedElements.map(element => {
                    return <AbsoluteElement key={element.id} element={element} resumeData={resumeData} />;
                })}
            </div>
        </div>
    );
};

export default Canvas;
