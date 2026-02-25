import React from 'react';
import { Plus } from 'lucide-react';
import useTemplateStore from '../../stores/useTemplateStore';

/**
 * Sidebar - Element palette for adding new elements
 */
const Sidebar = () => {
    const { addElement } = useTemplateStore();

    const elementTypes = [
        { type: 'heading', label: 'Heading', icon: '📌' },
        { type: 'subheading', label: 'Sub Heading', icon: '📝' },
        { type: 'paragraph', label: 'Paragraph', icon: '📄' },
        { type: 'section', label: 'Section', icon: '📦' },
        { type: 'bullet-list', label: 'List', icon: '📋' },
        { type: 'image', label: 'Image', icon: '🖼️' },
    ];

    const handleAddElement = (type) => {
        const fontSize = type === 'heading' ? 24 : type === 'subheading' ? 18 : 14;

        const defaults = {
            text: type === 'heading' ? 'New Heading' : type === 'text' ? 'New Text' : '',
            ...(type === 'image' ? { height: 120 } : {}),
            style: {
                fontSize,
                fontWeight: type === 'heading' ? 'bold' : 'normal',
            }
        };
        addElement(type, defaults);
    };

    return (
        <div className="w-64 bg-white border-r border-gray-200 p-4">
            <h2 className="text-lg font-semibold mb-4">Elements</h2>
            <div className="space-y-2">
                {elementTypes.map(({ type, label, icon }) => (
                    <button
                        key={type}
                        onClick={() => handleAddElement(type)}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-left"
                    >
                        <span className="text-2xl">{icon}</span>
                        <span className="font-medium">{label}</span>
                        <Plus className="ml-auto w-4 h-4 text-gray-400" />
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Sidebar;
