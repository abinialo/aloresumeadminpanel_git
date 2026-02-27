import React, { useEffect, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import useTemplateStore from '../../stores/useTemplateStore';
import { renderElementContent } from '../../utils/layoutRenderer';
import { estimateWrappedTextHeight } from '../../utils/textLayout';

const normalizeBulletText = (text) =>
  text.replace(/^(\*|-|\u2022|\d+\.)\s+/, '').trim();

const resolvePath = (data, path) => {
  if (!path || typeof path !== 'string') return '';
  return path.split('.').reduce((obj, key) => {
    if (obj === null || obj === undefined) return undefined;
    if (!isNaN(key)) return obj[parseInt(key, 10)];
    return obj[key];
  }, data);
};

const normalizeRepeatRoot = (root) => {
  if (root === 'certificate' || root === 'certificates' || root === 'certification') return 'certifications';
  if (root === 'project') return 'project';
  return root;
};

const AbsoluteElement = ({ element, resumeData }) => {
  const { updateElement, selectedId, selectElement } = useTemplateStore();
  const isSelected = selectedId === element.id;
  const isTextLike = ['text', 'heading', 'paragraph', 'subheading', 'bullet-list'].includes(element.type);
  const canInlineEdit = isTextLike;

  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState('');
  const inputRef = useRef(null);

  const renderedContent = renderElementContent(element, resumeData);
  const visibleContent = renderedContent || element.text || `[${element.type}]`;
  const shouldAutoHeight = isTextLike && Boolean(element.autoHeight);

  useEffect(() => {
    if (!isEditing) return;

    const initialText = element.text || renderedContent || '';
    setDraftText(initialText);
  }, [isEditing, element.text, renderedContent]);

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  useEffect(() => {
    if (!shouldAutoHeight || isEditing) return;
    const activeText = element.bind
      ? renderedContent || ''
      : typeof element.text === 'string' && element.text.length > 0
      ? element.text
      : renderedContent || '';
    const nextHeight = estimateWrappedTextHeight(activeText, element.style, element.width);
    if (nextHeight !== element.height) {
      updateElement(element.id, { height: nextHeight });
    }
  }, [shouldAutoHeight, isEditing, element.id, element.text, element.bind, element.style, element.width, element.height, renderedContent, updateElement ,]);

  const handleSelectOrEdit = () => {
    if (!isSelected) {
      selectElement(element.id);
      return;
    }
    if (canInlineEdit) setIsEditing(true);
  };

  const getAutoHeight = (nextText, widthOverride) => {
    const targetWidth = Number.isFinite(widthOverride) ? widthOverride : element.width;
    const estimated = estimateWrappedTextHeight(nextText, element.style, targetWidth);
    const measured = inputRef.current ? Math.ceil(inputRef.current.scrollHeight) : 0;
    return Math.max(estimated, measured);
  };

  const handleDraftChange = (nextText) => {
    setDraftText(nextText);
    requestAnimationFrame(() => {
      const manualTextUpdate = element.bind
        ? { text: nextText, bind: '' }
        : { text: nextText };

      if (!shouldAutoHeight) {
        updateElement(element.id, manualTextUpdate);
        return;
      }

      const nextHeight = getAutoHeight(nextText);
      updateElement(element.id, { ...manualTextUpdate, height: nextHeight });
    });
  };

  const commitEditing = () => {
    setIsEditing(false);
  };

  const resolvedLineHeight =
    element.style?.lineHeight ||
    (['heading', 'subheading'].includes(element.type) ? 1.15 : 1.2);

  const style = {
    fontSize: element.style?.fontSize || 14,
    color: element.style?.color || '#000000',
    fontFamily: element.style?.fontFamily || 'Arial',
    fontWeight: element.style?.fontWeight,
    lineHeight: resolvedLineHeight,
    textAlign: element.style?.textAlign || 'left',
    backgroundColor: element.style?.backgroundColor,
    borderRadius: element.style?.borderRadius || 0,
    border: '1px solid transparent',
    outline: isSelected ? '2px solid #7c3aed' : 'none',
    outlineOffset: 0,
    boxSizing: 'border-box',
    padding: 0,
    cursor: isEditing ? 'text' : 'move',
    overflow: 'hidden',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
   
  };

  const renderRepeatContent = () => {
    const repeatRoot = normalizeRepeatRoot(element.bind);
    const repeatItems = Array.isArray(resolvePath(resumeData, repeatRoot))
      ? resolvePath(resumeData, repeatRoot)
      : [];

    if (!repeatRoot || repeatItems.length === 0 || !Array.isArray(element.elements)) {
      return '[repeat]';
    }

    const gap = Number(element.gap) || 120;

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'visible' }}>
        {repeatItems.map((item, rowIndex) =>
          element.elements.map((child, childIndex) => {
            const childBind = String(child.bind || '').trim();
            let childPath = childBind;
            if (childPath.startsWith(`${repeatRoot}.`)) {
              childPath = childPath.slice(repeatRoot.length + 1);
            }
            childPath = childPath.replace(/^\d+\./, '');
            const boundValue = childPath ? resolvePath(item, childPath) : '';
            const textValue =
              typeof child.text === 'string' && child.text.trim().length > 0
                ? child.text
                : (boundValue ?? '');

            const childStyle = {
              position: 'absolute',
              left: Number(child.x) || 0,
              top: (Number(child.y) || 0) + rowIndex * gap,
              width: Number(child.width) || 200,
              minHeight: Number(child.height) || 16,
              fontSize: child.style?.fontSize || 12,
              fontWeight: child.style?.fontWeight || 'normal',
              color: child.style?.color || '#000000',
              lineHeight: child.style?.lineHeight || 1.2,
              whiteSpace: 'pre-wrap',
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
            };

            if (child.type === 'bullet-list') {
              const lines = String(textValue || '')
                .split('\n')
                .map((line) => normalizeBulletText(line))
                .filter(Boolean);

              return (
                <ul key={`${rowIndex}-${childIndex}`} style={{ ...childStyle, margin: 0, paddingLeft: 18 }}>
                  {lines.map((line, idx) => (
                    <li key={`${rowIndex}-${childIndex}-${idx}`}>{line}</li>
                  ))}
                </ul>
              );
            }

            return (
              <div key={`${rowIndex}-${childIndex}`} style={childStyle}>
                {String(textValue || '')}
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <Rnd
      size={{ width: Number(element.width) || 220, height: Number(element.height) || 120 }}
      position={{ x: element.x, y: element.y }}
      style={{ zIndex: element.style?.zIndex ?? element.zIndex ?? 1 }}
      onDragStop={(e, d) => updateElement(element.id, { x: d.x, y: d.y })}
      onResizeStop={(e, direction, ref, delta, position) =>
        (() => {
          const nextWidth = parseInt(ref.style.width, 10);
          const activeText = element.bind
            ? renderedContent || ''
            : typeof element.text === 'string' && element.text.length > 0
            ? element.text
            : renderedContent || '';
          const nextHeight = shouldAutoHeight
            ? getAutoHeight(activeText, nextWidth)
            : parseInt(ref.style.height, 10);

          updateElement(element.id, {
            width: nextWidth,
            height: nextHeight,
            x: position.x,
            y: position.y,
          });
        })()
      }
      onClick={handleSelectOrEdit}
      bounds="parent"
      enableResizing={isSelected && !isEditing}
      disableDragging={!isSelected || isEditing}
    >
      <div style={style} className="h-full w-full">
        {element.type === 'repeat' ? (
          renderRepeatContent()
        ) : isEditing ? (
          <textarea
            ref={inputRef}
            value={draftText}
            onChange={(e) => handleDraftChange(e.target.value)}
            onBlur={commitEditing}
            className="w-full h-full bg-transparent outline-none border-none resize-none overflow-hidden"
          />
        ) : (
          element.type === 'bullet-list' ? (
            <ul className="list-disc m-0 pl-6">
              {String(visibleContent)
                .split('\n')
                .map((line) => normalizeBulletText(line))
                .filter(Boolean)
                .map((line, idx) => (
                  <li key={`${element.id}-item-${idx}`}>{line}</li>
                ))}
            </ul>
          ) : (
            visibleContent
          )
        )}
      </div>
    </Rnd>
  );
};

export default AbsoluteElement;
