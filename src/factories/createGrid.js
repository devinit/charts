import Plottable from "plottable";

export const createLinearAxisGridLines = ({orientation, scale, showGridlines}) => {
  if (!showGridlines) return null;

  const xScale = orientation === 'vertical' ? null : scale;
  const yScale = orientation === 'horizontal' ? null : scale;

  const gridlines = new Plottable.Components.Gridlines(xScale, yScale);

  // ... apply configuration options

  return gridlines
};

export const createScatterGridLines = ({xAxis, yAxis, xScale, yScale}) => {
  if (!xAxis.showGridlines && !yAxis.showGridlines) return null;

  return new Plottable.Components.Gridlines(
    xAxis.showGridlines ? xScale : null,
    yAxis.showGridlines ? yScale : null
  )
};