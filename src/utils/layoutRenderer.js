/**
 * Client-side Layout Renderer
 * Replicates backend LayoutRenderer logic for WYSIWYG preview
 */

import mockResumeData from './mockResumeData.json';
import { estimateWrappedTextHeight } from './textLayout';

/**
 * Resolve bind path (e.g., "basic.firstName", "experience.0.company")
 */
const resolveBindPath = (data, bindPath) => {
    if (!bindPath) return '';

    try {
        const value = bindPath.split('.').reduce((obj, key) => {
            if (obj === null || obj === undefined) return '';
            if (!isNaN(key)) return obj[parseInt(key)];
            return obj[key];
        }, data);

        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return '';
        return String(value);
    } catch {
        return '';
    }
};

/**
 * Calculate layout with flow positioning
 */
export const calculateLayout = (layoutJSON, resumeData = mockResumeData) => {
    const elements = JSON.parse(JSON.stringify(layoutJSON.elements));
    let flowCursorY = 0;

    return elements.map(element => {
        const el = { ...element };
        let content = '';
        const hasManualText = typeof el.text === 'string' && el.text.length > 0;

        if (el.bind) content = resolveBindPath(resumeData, el.bind);
        else if (hasManualText) content = el.text;

        // Absolute positioning - pass through
        if (el.positionType !== 'flow') {
            return el;
        }

        // Flow positioning logic
        // 1. Auto-collapse empty elements (except containers, sections, lists)
        if (!content && el.type !== 'container' && el.type !== 'section' && el.type !== 'list') {
            el.height = 0;
            el.y = flowCursorY;
            el.collapsed = true;
            return el;
        }

        // 2. Set Y position
        const marginTop = el.marginTop || 0;
        el.y = flowCursorY + marginTop;

        // 3. Calculate height
        let calculatedHeight = el.height || 0;

        if (el.autoHeight) {
            if (el.type === 'list') {
                const arrayData = el.bind.split('.').reduce((o, k) => o?.[k], resumeData);
                if (Array.isArray(arrayData)) {
                    const fontSize = Number(el.style?.fontSize) || 14;
                    const lineHeightRatio = Number(el.style?.lineHeight) || 1.4;
                    const inferredItemHeight = Math.ceil(fontSize * lineHeightRatio + 4);
                    const itemHeight = el.itemHeight || inferredItemHeight;
                    calculatedHeight = arrayData.length * itemHeight;
                }
            } else if (el.type === 'image') {
                // Keep fixed height
            } else {
                // Text/Paragraph
                calculatedHeight = estimateWrappedTextHeight(content, el.style || {}, el.width);
            }
            el.height = calculatedHeight;
        }

        // 4. Update cursor
        flowCursorY = el.y + calculatedHeight;

        return el;
    });
};

/**
 * Render element content (for preview)
 */
export const renderElementContent = (element, resumeData = mockResumeData) => {
    if (element.collapsed) return '';

    let content = '';
    const hasManualText = typeof element.text === 'string' && element.text.length > 0;

    if (element.bind) {
        content = resolveBindPath(resumeData, element.bind);
    } else if (hasManualText) {
        content = element.text;
    }

    // Handle lists and arrays
    if (['list', 'bullet-list'].includes(element.type) && element.bind) {
        const rawData = element.bind.split('.').reduce((o, k) => o?.[k], resumeData);

        if (typeof rawData === 'string') {
            const lines = rawData.split('\n').map(l => l.trim()).filter(Boolean);
            if (lines.length > 0) {
                const itemTag = element.itemTag || 'li';
                if (itemTag === 'li') {
                    return lines.map(line => `• ${line}`).join('\n');
                } else {
                    return lines.join('\n\n');
                }
            }
        } else if (Array.isArray(rawData) && rawData.length > 0) {
            return rawData
                .map(
                    (item, idx) =>
                        `${idx + 1}. ${item.company || item.name || item.title || item.schoolOrCollegeName || ''}`
                )
                .join('\n');
        }
        return '';
    }

    return content;
};

const layoutRenderer = {
    calculateLayout,
    renderElementContent,
    resolveBindPath
};

export default layoutRenderer;
