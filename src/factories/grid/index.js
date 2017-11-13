import Plottable from 'plottable';
import { configureGridTicking } from '../ticking/index';

export const createLinearAxisGridLines = config => {
  const {
    orientation, scale, showGridlines = false, ticking = 'odd'
  } = config;
  if (!showGridlines) return null;

  const xScale = orientation === 'vertical' ? null : scale;
  const yScale = orientation === 'horizontal' ? null : scale;

  const gridlines = new Plottable.Components.Gridlines(xScale, yScale);

  // Add ticking classes
  configureGridTicking(gridlines, ticking);

  return gridlines;
};

export const createScatterGridLines = ({
  horizontalScale,
  verticalScale,
  horizontalAxis,
  verticalAxis,
}) => {
  if (!horizontalAxis.showGridlines && !verticalAxis.showGridlines) return null;

  return new Plottable.Components.Gridlines(
    horizontalAxis.showGridlines ? horizontalScale : null,
    verticalAxis.showGridlines ? verticalScale : null,
  );
};
