import Plottable from "plottable";
import approximate from "approximate-number";
import {configureAxisTicking, configureTimeAxisTicking} from "./configureTicking";

/**
 * @typedef {Object} NumericAxis - Numeric Axis configuration
 * @private
 * @property {indicator} indicator - Data Indicator
 * @property {boolean} showAxis - Show Axis
 * @property {boolean} showGridlines - Show Grid lines
 * @property {'all'|'even'|'odd'|'sparse'} ticking=all - Ticking method
 * @property {string} axisLabel - Label
 * @property {number} axisMargin - Margin
 * @property {number} axisMinimum - Minimum
 * @property {number} axisMaximum - Maximum
 */

/**
 *
 * @typedef {Object} CategoryAxis - Category Axis Configuration
 * @private
 * @property {indicator} indicator - Data Indicator
 * @property {boolean} showAxis - Show Axis
 * @property {'all'|'even'|'odd'|'sparse'} ticking=all - Ticking method
 * @property {string} axisLabel - Axis Label
 * @property {number} axisMargin - Margin
 * @property {number} innerPadding - Inner Padding
 * @property {number} outerPadding - Outer Padding
 */

export const createNumericAxis = (config) => {

  const {showAxis = true, axisOrientation, axisScale, axisLabel = null, axisMargin = 10, absolute = false, ticking = 'all'} = config;

  if (!showAxis) return null;

  const alignment = axisOrientation === 'horizontal' ? 'bottom' : 'left';

  const axis = new Plottable.Axes.Numeric(axisScale, alignment);
  axis.formatter(d => absolute ? approximate(Math.abs(d)) : approximate(d));
  axis.showEndTickLabels(true);
  axis.margin(0);

  let label = null;

  if (axisLabel) {
    axis.margin(axisMargin);
    label = axisLabel && new Plottable.Components.AxisLabel(axisLabel, getAxisLabelRotation(alignment));
  }

  // Add ticking classes
  configureAxisTicking(axis, ticking);

  return createAxisTable(alignment, axis, label)

};

export const createTimeAxis = (config) => {

  const {showAxis = false, axisOrientation = 'horizontal', axisScale, axisLabel = null, axisMargin = 10, ticking, tickingStep = 1} = config;

  if (!showAxis) return null;

  const axis = new Plottable.Axes.Time(axisScale, 'bottom');
  axis.formatter(d => approximate(d));
  axis.showEndTickLabels(true);
  axis.margin(0);

  let label = null;

  if (axisLabel) {
    axis.margin(axisMargin);
    label = axisLabel && new Plottable.Components.AxisLabel(axisLabel, getAxisLabelRotation('bottom'));
  }

  // Add ticking classes
  configureTimeAxisTicking(axis, ticking, tickingStep);

  return createAxisTable('bottom', axis, label)

};

export const createCategoryAxis = (config = {}) => {
  let {showAxis = false, axisOrientation, axisDirection, axisScale, axisLabel = null, axisMargin = 10, ticking = 'all'} = config;

  if (!showAxis) return null;

  const alignment = axisDirection || (axisOrientation === 'vertical' ? 'bottom' : 'left');

  const axis = new Plottable.Axes.Category(axisScale, alignment);
  axis.margin(0);

  let label = null;

  if (axisLabel) {
    axis.margin(axisMargin);
    label = axisLabel && new Plottable.Components.AxisLabel(axisLabel, getAxisLabelRotation(alignment));
  }

  // Add ticking classes
  configureAxisTicking(axis, ticking);

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
};

export const labelRotationAngles = {
  top: 0,
  bottom: 0,
  left: -90,
  right: 90
};