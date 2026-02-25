import React from 'react';
import { Trash2 } from 'lucide-react';
import useTemplateStore from '../../stores/useTemplateStore';
import { getBindPathsByCategory } from '../../utils/bindPaths';
import { estimateWrappedTextHeight } from '../../utils/textLayout';

/**
 * PropertyPanel - Edit properties of selected element
 */
const PropertyPanel = () => {
    const { getSelectedElement, updateElement, removeElement } = useTemplateStore();
    const element = getSelectedElement();
    const categories = getBindPathsByCategory();
    const isTextLike = ['text', 'heading', 'paragraph', 'subheading', 'bullet-list'].includes(element?.type);


    if (!element) {
        return (
            <div className="w-80 bg-red border-l border-gray-200 p-4">
                <p className="text-gray-500 text-sm">Select an element to edit properties</p>
            </div>
        );
    }

    const borderRadiusRaw = String(element.style?.borderRadius || '0px').trim();
    const borderRadiusMatch = borderRadiusRaw.match(/^(-?\d+(?:\.\d+)?)(px|%)?$/);
    const borderRadiusValue = borderRadiusMatch ? borderRadiusMatch[1] : '0';
    const borderRadiusUnit = borderRadiusMatch?.[2] || 'px';

    const handleUpdate = (field, value) => {
        if (field.startsWith('style.')) {
            const styleField = field.split('.')[1];
            updateElement(element.id, {
                style: { ...element.style, [styleField]: value }
            });
        } else {
            updateElement(element.id, { [field]: value });
        }
    };

    const parseNumberInput = (rawValue, fallback = 0) => {
        if (rawValue === '' || rawValue === null || rawValue === undefined) return fallback;
        const parsed = Number(rawValue);
        return Number.isFinite(parsed) ? parsed : fallback;
    };

    const handleWidthChange = (nextWidth) => {
        if (!Number.isFinite(nextWidth)) return;
        if (!isTextLike) {
            updateElement(element.id, { width: nextWidth });
            return;
        }
        if (!element.autoHeight) {
            updateElement(element.id, { width: nextWidth });
            return;
        }
        const nextHeight = estimateWrappedTextHeight(element.text || '', element.style, nextWidth);
        updateElement(element.id, { width: nextWidth, height: nextHeight });
    };

    const handleTextChange = (nextText) => {
        if (!isTextLike) {
            updateElement(element.id, { text: nextText });
            return;
        }
        if (!element.autoHeight) {
            updateElement(element.id, { text: nextText });
            return;
        }
        const nextHeight = estimateWrappedTextHeight(nextText, element.style, element.width);
        updateElement(element.id, { text: nextText, height: nextHeight });
    };

    const handleBorderRadiusChange = (nextValue, nextUnit = borderRadiusUnit) => {
        const parsed = Number(nextValue);
        const safeValue = Number.isFinite(parsed) ? parsed : 0;
        handleUpdate('style.borderRadius', `${safeValue}${nextUnit}`);
    };

    const isHexColor = (value) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value || '');
    const backgroundColorValue = element.style?.backgroundColor || '';
    const pickerBackgroundColor = isHexColor(backgroundColorValue) ? backgroundColorValue : '#ffffff';

    return (
        <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Properties</h2>
                <button
                    onClick={() => removeElement(element.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                    title="Delete Element"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <div className="space-y-4">
                {/* Element Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <input
                        type="text"
                        value={element.type}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50"
                    />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">X</label>
                        <input
                            type="number"
                            value={element.x}
                            onChange={(e) => handleUpdate('x', parseNumberInput(e.target.value, element.x || 0))}
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Y</label>
                        <input
                            type="number"
                            value={element.y}
                            onChange={(e) => handleUpdate('y', parseNumberInput(e.target.value, element.y || 0))}
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                        />
                    </div>
                </div>

                {/* Size */}
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
                                <input
                                    type="number"
                                    value={element.width}
                                    onChange={(e) => handleWidthChange(parseNumberInput(e.target.value, element.width || 0))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded"
                                />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Height</label>
                        <input
                            type="number"
                            value={element.height}
                            onChange={(e) => handleUpdate('height', parseNumberInput(e.target.value, element.height || 0))}
                            disabled={isTextLike && Boolean(element.autoHeight)}
                            className="w-full px-3 py-2 border border-gray-300 rounded disabled:bg-gray-50 disabled:text-gray-500"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Z-Index</label>
                    <input
                        type="number"
                        value={element.style?.zIndex ?? element.zIndex ?? 1}
                        onChange={(e) =>
                            handleUpdate(
                                'style.zIndex',
                                parseNumberInput(e.target.value, element.style?.zIndex ?? element.zIndex ?? 1)
                            )
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                </div>

                {/* Auto Height */}
                {isTextLike && (
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id="autoHeight"
                            checked={element.autoHeight || false}
                            onChange={(e) => handleUpdate('autoHeight', e.target.checked)}
                            className="mr-2"
                        />
                        <label htmlFor="autoHeight" className="text-sm font-medium text-gray-700">
                            Auto Height
                        </label>
                    </div>
                )}

                {/* Section Type */}
                {element.type === 'section' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Section Type</label>
                        <select
                            value={element.sectionType || 'custom'}
                            onChange={(e) => handleUpdate('sectionType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                        >
                            <option value="custom">Custom (Default)</option>
                            <option value="experience">Experience</option>
                            <option value="education">Education</option>
                            <option value="skills">Skills</option>
                            <option value="projects">Projects</option>
                            <option value="summary">Professional Summary</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Identifies the purpose of this section container</p>
                    </div>
                )}

                {/* List Item Tag */}
                {element.type === 'bullet-list' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">List Item Tag</label>
                        <select
                            value={element.itemTag || 'li'}
                            onChange={(e) => handleUpdate('itemTag', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                        >
                            <option value="li">List Item (li)</option>
                            <option value="p">Paragraph (p)</option>
                            <option value="div">Block (div)</option>
                            <option value="span">Inline (span)</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Changes how lists are wrapped (e.g. bullets vs paragraphs)</p>
                    </div>
                )}

                {/* Text Content */}
                {!element.bind && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
                        <textarea
                            value={element.text || ''}
                            onChange={(e) => handleTextChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                            rows={3}
                        />
                    </div>
                )}

                {/* Bind Path */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bind Path</label>
                    <select
                        value={element.bind || ''}
                        onChange={(e) => handleUpdate('bind', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                    >
                        <option value="">-- None --</option>

                        {Object.entries(categories).map(([category, items]) => (
                            <optgroup key={category} label={category}>
                                {items.map(bp => (
                                    <option key={bp.path} value={bp.path}>
                                        {bp.label}
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>

                </div>

                {/* Style */}
                <div className="border-t pt-4">
                    <h3 className="font-medium mb-2">Style</h3>

                    <div className="space-y-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                            <input
                                type="number"
                                value={element.style?.fontSize || 14}
                                onChange={(e) => handleUpdate('style.fontSize', parseNumberInput(e.target.value, element.style?.fontSize || 14))}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                            <input
                                type="color"
                                value={element.style?.color || '#000000'}
                                onChange={(e) => handleUpdate('style.color', e.target.value)}
                                className="w-full h-10 border border-gray-300 rounded"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Background Color</label>
                            <div className="grid grid-cols-4 gap-2">
                                <input
                                    type="color"
                                    value={pickerBackgroundColor}
                                    onChange={(e) => handleUpdate('style.backgroundColor', e.target.value)}
                                    className="col-span-1 h-10 border border-gray-300 rounded"
                                />
                                <input
                                    type="text"
                                    value={backgroundColorValue}
                                    placeholder="transparent / rgba(...) / #RRGGBB"
                                    onChange={(e) => handleUpdate('style.backgroundColor', e.target.value)}
                                    className="col-span-3 px-3 py-2 border border-gray-300 rounded"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => handleUpdate('style.backgroundColor', 'transparent')}
                                className="mt-2 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
                            >
                                Set Transparent
                            </button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Border Radius</label>
                            <div className="grid grid-cols-3 gap-2">
                                <input
                                    type="number"
                                    min={0}
                                    value={borderRadiusValue}
                                    onChange={(e) => handleBorderRadiusChange(e.target.value, borderRadiusUnit)}
                                    className="col-span-2 w-full px-3 py-2 border border-gray-300 rounded"
                                />
                                <select
                                    value={borderRadiusUnit}
                                    onChange={(e) => handleBorderRadiusChange(borderRadiusValue, e.target.value)}
                                    className="w-full px-2 py-2 border border-gray-300 rounded"
                                >
                                    <option value="px">px</option>
                                    <option value="%">%</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Font Weight</label>
                            <select
                                value={element.style?.fontWeight || 'normal'}
                                onChange={(e) => handleUpdate('style.fontWeight', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                            >
                                <option value="normal">Normal</option>
                                <option value="bold">Bold</option>
                                <option value="600">Semi-Bold</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Text Align</label>
                            <select
                                value={element.style?.textAlign || 'left'}
                                onChange={(e) => handleUpdate('style.textAlign', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                            >
                                <option value="left">Left</option>
                                <option value="center">Center</option>
                                <option value="right">Right</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyPanel;
