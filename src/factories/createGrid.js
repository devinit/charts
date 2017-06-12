import Plottable from "plottable";

export const createLinearAxisGridLines = (config) => {
  let {orientation, scale, showGridlines = false} = config;
  if (!showGridlines) return null;

  const xScale = orientation === 'vertical' ? null : scale;
  const yScale = orientation === 'horizontal' ? null : scale;

  const gridlines = new Plottable.Components.Gridlines(xScale, yScale);

  // ... apply configuration options

  return gridlines
};

export const createScatterGridLines = ({horizontalScale, verticalScale, horizontalAxis, verticalAxis}) => {
  if (!horizontalAxis.showGridlines && !verticalAxis.showGridlines) return null;

  return new Plottable.Components.Gridlines(
    horizontalAxis.showGridlines ? horizontalScale : null,
    verticalAxis.showGridlines ? verticalScale : null
  )
};