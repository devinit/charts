import Plottable from "plottable";

export const createGridLines = ({xScale = null, yScale = null}) => {
  if (!xScale && !yScale) return null;

  const gridlines = new Plottable.Components.Gridlines(xScale, yScale);

  // ... apply configuration options

  return gridlines
};