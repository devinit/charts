import { Components, Scale } from 'plottable';
import { configureGridTicking } from './ticking';
import { Gridlines } from 'plottable/build/src/components';
import { BarOrientation } from 'plottable/build/src/plots';

export interface Config {
  orientation: BarOrientation;
  scale: Scale<any, any>;
  showGridlines?: boolean;
  ticking?: string;
}

export const createLinearAxisGridLines = (config: Config): Gridlines | undefined => {
  const {
    orientation, scale, showGridlines = false, ticking = 'odd'
  } = config;
  if (!showGridlines) return undefined;

  const xScale = orientation === 'vertical' ? null : scale;
  const yScale = orientation === 'horizontal' ? null : scale;

  const gridlines = new Components.Gridlines(xScale, yScale);

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

  return new Components.Gridlines(
    horizontalAxis.showGridlines ? horizontalScale : null,
    verticalAxis.showGridlines ? verticalScale : null,
  );
};
