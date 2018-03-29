import * as Plottable from 'plottable';
import {approximate} from '@devinit/prelude/lib/numbers';
import {configureAxisTicking, configureTimeAxisTicking} from '../ticking';

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
export interface NumericAxis {
  showAxis?: boolean;
  axisOrientation: string;
  axisScale: any;
  axisLabel?: any;
  axisMargin: number;
  ticking: string;
  prefix: string;
  suffix: string;
}
export const createNumericAxis =
  (axisConfig: NumericAxis, format?: (any) => any, axis?: Plottable.Axes.Numeric): Plottable.Components.Table
  | undefined => {
  const {
    showAxis = true,
    axisOrientation,
    axisScale,
    axisMargin = 10,
    ticking = 'all',
    prefix = '',
    suffix = ''
  } = axisConfig;

  if (!showAxis) return undefined;

  const alignment = axisOrientation === 'horizontal' ? 'bottom' : 'left';

  if (!axis) axis = new Plottable.Axes.Numeric(axisScale, alignment);

  axis.formatter(d => `${prefix}${approximate(format && format(d))}${suffix}`);
  axis.showEndTickLabels(true);
  axis.margin(0);

  let label: Plottable.Components.AxisLabel | null = null;

  if (axisConfig.axisLabel) {
    axis.margin(axisMargin);
    label = axisConfig.axisLabel &&
      new Plottable.Components.AxisLabel(axisConfig.axisLabel, getAxisLabelRotation(alignment));
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
export interface Config {
  showAxis: boolean;
  axisScale: any;
  axisMargin?: number;
  axisLabel?: string;
  ticking: any;
  tickingStep?: number;
}
export const createTimeAxis = (config: Config, axis?: any) => {
  if (!config.showAxis) return null;

  if (!axis) axis = new Plottable.Axes.Time(config.axisScale, 'bottom');

  axis.showEndTickLabels(true);
  axis.margin(0);

  let label: Plottable.Components.AxisLabel | null = null;

  if (config.axisLabel) {
    axis.margin(config.axisMargin);
    label =
      new Plottable.Components.AxisLabel(config.axisLabel, getAxisLabelRotation('bottom'));
  }

  // Add ticking classes
  configureTimeAxisTicking(axis, config.ticking, config.tickingStep);

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
export type CategoryConfig = Config & {
  axisOrientation?: string;
  innerPadding?: number;
  outerPadding?: number;
  axisDirection: any;
};
export const createCategoryAxis = (config: CategoryConfig, axis?: any) => {
  if (!config.showAxis) return null;

  const alignment = config.axisDirection || (config.axisOrientation === 'vertical' ? 'bottom' : 'left');

  if (!axis) axis = new Plottable.Axes.Category(config.axisScale, alignment);

  axis.margin(0);

  let label: Plottable.Components.AxisLabel | null = null;

  if (config.axisLabel) {
    axis.margin(config.axisMargin);
    label = new Plottable.Components.AxisLabel(config.axisLabel, getAxisLabelRotation(alignment));
  }

  // Add ticking classes
  configureAxisTicking(axis, config.ticking);

  return createAxisTable(alignment, axis, label);
};
