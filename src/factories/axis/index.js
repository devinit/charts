import Plottable from 'plottable';
import approximate from '../approximate/index';
import {configureAxisTicking, configureTimeAxisTicking} from '../ticking/index';


export const log = base => number => Math.round(Math.log(number) / Math.log(base));

export const multiply = multiplier => number => multiplier * number;

export const divide = divisor => number => number / divisor;

export const power = base => exponent => Math.pow(base, exponent);

export const absolutify = shouldAbsolutify => number =>
  shouldAbsolutify ? Math.abs(number) : number;

/**
 * Create a numeric modifier from config
 * @param {NumericAxis} config
 * @returns {{format: (function(*=)), modify: (function(*=))}}
 */
export const createAxisModifier = config => {
  const {modifier = 'multiply', modifierParam = 1, absolute = false} = config;

  const absoluteFn = absolutify(absolute);
  let modifierFn = d => d;
  let formatterFn = d => d;

  if (modifier === 'log') {
    modifierFn = log(modifierParam);
    formatterFn = power(modifierParam);
  }

  if (modifier === 'multiply') {
    modifierFn = multiply(modifierParam);
    formatterFn = divide(modifierParam);
  }

  if (modifier === 'power') {
    modifierFn = power(modifierParam);
    formatterFn = log(modifierParam);
  }

  return {
    format: number => absoluteFn(formatterFn(number)),
    modify: number => modifierFn(number),
  };
};

export const createAxisTable = (alignment, axis, label) => {
  if (alignment === 'top') {
    return new Plottable.Components.Table([[label], [axis]]);
  }

  if (alignment === 'bottom') {
    return new Plottable.Components.Table([[axis], [label]]);
  }

  if (alignment === 'left') {
    return new Plottable.Components.Table([[label, axis]]);
  }

  if (alignment === 'right') {
    return new Plottable.Components.Table([[axis, label]]);
  }
};

export const getAxisLabelRotation = alignment => {
  switch (alignment) {
    case 'top': return 0;
    case 'bottom': return 0;
    case 'left': return -90;
    case 'right': return 90;
    default: return 0;
  }
};

/**
 * @typedef {Object} NumericAxis - Numeric Axis configuration
 * @private
 * @property {indicator} indicator - Data Indicator
 * @property {boolean} showAxis - Show Axis
 * @property {boolean} showGridlines - Show Grid lines
 * @property {'all'|'even'|'odd'|'sparse'} ticking=all - Ticking method
 * @property {'log'|'multiply'|'power'} modifier=multiply - Axis Modifiers
 * @property {number} modifierParam=1 - Axis Modifier Parameter
 * @property {string} axisLabel - Label
 * @property {number} axisMargin - Margin
 * @property {number} axisMinimum - Axis Minimum
 * @property {number} axisMaximum - Axis Maximum
 * @property {string} prefix - Tick Label Prefix
 * @property {string} suffix - Tick Label Suffix
 */

/**
 *
 * @param {NumericAxis} axisConfig
 * @param {Plottable.Axes.Numeric} axis
 * @param {function} format
 * @returns {Plottable.Axes.Numeric}
 */
export const createNumericAxis = (axisConfig, format = d => d, axis) => {
  const {
    showAxis = true,
    axisOrientation,
    axisScale,
    axisLabel = null,
    axisMargin = 10,
    ticking = 'all',
    prefix = '',
    suffix = ''
  } = axisConfig;

  if (!showAxis) return null;

  const alignment = axisOrientation === 'horizontal' ? 'bottom' : 'left';

  if (!axis) axis = new Plottable.Axes.Numeric(axisScale, alignment);

  axis.formatter(d => `${prefix}${approximate(format(d))}${suffix}`);
  axis.showEndTickLabels(true);
  axis.margin(0);

  let label = null;

  if (axisLabel) {
    axis.margin(axisMargin);
    label = axisLabel &&
      new Plottable.Components.AxisLabel(axisLabel, getAxisLabelRotation(alignment));
  }

  // Add ticking classes
  configureAxisTicking(axis, ticking);

  return createAxisTable(alignment, axis, label);
};

/**
 *
 * @typedef {Object} TimeAxis - Category Axis Configuration
 * @private
 * @property {indicator} indicator - Data Indicator
 * @property {boolean} showAxis - Show Axis
 * @property {'years'|'months'|'days'|'hours'} ticking - Ticking method
 * @property {number} tickingStep - Ticking interval
 * @property {string} axisLabel - Axis Label
 * @property {number} axisMargin - Margin
 */

/**
 * Creates a time axis from configuration
 * @param {TimeAxis} config
 * @param {Plottable.Axes.Time} axis
 * @returns {Plottable.Axes.Time}
 */
export const createTimeAxis = (config, axis) => {
  const {
    showAxis = false,
    axisScale,
    axisLabel = null,
    axisMargin = 10,
    ticking,
    tickingStep = 1,
  } = config;

  if (!showAxis) return null;

  if (!axis) axis = new Plottable.Axes.Time(axisScale, 'bottom');

  axis.showEndTickLabels(true);
  axis.margin(0);

  let label = null;

  if (axisLabel) {
    axis.margin(axisMargin);
    label =
      axisLabel && new Plottable.Components.AxisLabel(axisLabel, getAxisLabelRotation('bottom'));
  }

  // Add ticking classes
  configureTimeAxisTicking(axis, ticking, tickingStep);

  return createAxisTable('bottom', axis, label);
};

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

/**
 * Creates a category axis from configuration
 * @param {CategoryAxis} config
 * @param {Plottable.Axes.Category} axis
 * @returns {Plottable.Axes.Category}
 */
export const createCategoryAxis = (config = {}, axis) => {
  const {
    showAxis = false,
    axisOrientation,
    axisDirection,
    axisScale,
    axisLabel = null,
    axisMargin = 20,
    ticking = 'all',
  } = config;

  if (!showAxis) return null;

  const alignment = axisDirection || (axisOrientation === 'vertical' ? 'bottom' : 'left');

  if (!axis) axis = new Plottable.Axes.Category(axisScale, alignment);

  axis.margin(0);

  let label = null;

  if (axisLabel) {
    axis.margin(axisMargin);
    label =
      axisLabel && new Plottable.Components.AxisLabel(axisLabel, getAxisLabelRotation(alignment));
  }

  // Add ticking classes
  configureAxisTicking(axis, ticking);

  return createAxisTable(alignment, axis, label);
};
