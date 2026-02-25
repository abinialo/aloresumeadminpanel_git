export const estimateWrappedTextHeight = (text, style = {}, width = 200) => {
  const fontSize = Number(style?.fontSize) || 14;
  const lineHeightRatio = Number(style?.lineHeight) || 1.2;
  const safeWidth = Math.max(40, Number(width) || 200);
  const horizontalPadding = 0;
  const usableWidth = Math.max(1, safeWidth - horizontalPadding);
  const avgCharWidth = fontSize * 0.55;
  const charsPerLine = Math.max(1, Math.floor(usableWidth / avgCharWidth));

  const content = typeof text === 'string' ? text : '';
  const lines = content.split('\n');

  const wrappedLineCount = Math.max(
    1,
    lines.reduce((count, line) => count + Math.max(1, Math.ceil(line.length / charsPerLine)), 0)
  );

  const contentHeight = wrappedLineCount * (fontSize * lineHeightRatio);
  const basePadding = 0;
  const safetyBuffer = 2;
  return Math.ceil(contentHeight + basePadding + safetyBuffer);
};

export default estimateWrappedTextHeight;
