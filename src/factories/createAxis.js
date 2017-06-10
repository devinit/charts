import Plottable from "plottable";

/**
 * @typedef {Object} NumericAxis - Numeric Axis configuration
 * @private
 * @property {boolean} showAxis - Show Axis
 * @property {boolean} showGridlines - Show Grid lines
 * @property {boolean} showAxisLabel - Show Label
 * @property {'vertical'|'horizontal'} axisOrientation - Orientation
 * @property {string} axisLabel - Label
 * @property {number} axisMargin - Margin
 * @property {number} axisMinimum - Minimum
 * @property {number} axisMaximum - Maximum
 */

/**
 *
 * @typedef {Object} CategoryAxis - Category Axis Configuration
 * @private
 * @property {boolean} showAxis - Show Axis
 * @property {boolean} showAxisLabel - Show Label
 * @property {string} axisOrientation - Orientation
 * @property {string} axisLabel - Data label
 * @property {number} axisMargin - Margin
 * @property {number} innerPadding - Inner Padding
 * @property {number} outerPadding - Outer Padding
 */

export const createNumericAxis = (config) => {

  const {showAxis = false, axisOrientation, axisScale, axisLabel = null, axisMargin = 10} = config;

  if (!showAxis) return null;

  const alignment = axisOrientation === 'horizontal' ? 'bottom' : 'left';

  const axis = new Plottable.Axes.Numeric(axisScale, alignment);
  axis.margin(axisMargin);

  const label = axisLabel && new Plottable.Components.AxisLabel(axisLabel, getAxisLabelRotation(alignment));

  return createAxisTable(alignment, axis, label)

};

export const createCategoryAxis = (config) => {
  let {showAxis = false, axisOrientation, axisScale, axisLabel = null, axisMargin = 10} = config;

  if (!showAxis) return null;

  const alignment = axisOrientation === 'vertical' ? 'bottom' : 'left';

  const axis = new Plottable.Axes.Category(axisScale, alignment);

  axis.margin(axisMargin);

  const label = axisLabel && new Plottable.Components.AxisLabel(axisLabel, getAxisLabelRotation(alignment));

  return createAxisTable(alignment, axis, label)
};

export const createAxisTable = (alignment, axis, label) => {

  if (alignment === 'top') {
    return new Plottable.Components.Table([[label], [axis],]);
  }

  if (alignment === 'bottom') {
    return new Plottable.Components.Table([[axis], [label],]);
  }

  if (alignment === 'left') {
    return new Plottable.Components.Table([[label, axis]]);
  }

  if (alignment === 'right') {
    return new Plottable.Components.Table([[axis, label]]);
  }

};

export const getAxisLabelRotation = (alignment) => {
  return labelRotationAngles[alignment]
}

export const labelRotationAngles = {
  top: 0,
  bottom: 0,
  left: -90,
  right: 90
};