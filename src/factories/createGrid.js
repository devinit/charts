import Plottable from "plottable";

export const createAxisGridLines = ({orientation, scale, showGridlines}) => {
  if (!showGridlines) return null;

  const xScale = orientation === 'vertical' ? null : scale;
  const yScale = orientation === 'horizontal' ? null : scale;

  const gridlines = new Plottable.Components.Gridlines(xScale, yScale);

  // ... apply configuration options

  return gridlines
};