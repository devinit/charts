export const labelFontSize = (width, height, text) => {
  const baseFont = 8;
  const availableArea = width * height;
  const words = text.split(/\s+/);
  const longestWordLength = Math.max.apply(null, words.map((l) => { return l.length; }));
  const estimatedArea = longestWordLength * (8 * 0.6) * words.length * 8;

  const areaRatio = Math.floor(availableArea / estimatedArea);

  if (areaRatio < 2) {
    return baseFont * 1.1;
  }

  if (areaRatio < 4) {
    return baseFont * 1.3;
  }

  if (areaRatio < 6) {
    return baseFont * 1.5;
  }

  if (areaRatio > 10) {
    return baseFont * 2;
  }

  return baseFont * 2;
};

export const autofitStyle = (width, height, text) => {
  return `style="font-size: ${labelFontSize(width, height, text)}px"`;
};

