import { AxisOrientation, Axes, Components, Scales, Component, XAlignment, YAlignment} from 'plottable';
import {approximate} from '@devinit/prelude/lib/numbers';
import {configureAxisTicking, configureTimeAxisTicking} from '../axes/ticking';
import { AxisLabel } from 'plottable/build/src/components';

export interface AxisConfig {
  showAxis?: boolean;
  axisMargin?: number;
  axisLabel?: string;
  ticking?: string;
  tickingStep?: number;
  prefix?: string;
  suffix?: string;
}

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
export interface AxisModifier {
  modifier?: string;
  modifierParam?: number;
  absolute?: boolean;
}

export const createAxisModifier = (config: AxisModifier) => {
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

export const createAxisTable = (alignment: XAlignment | YAlignment, axis: Component, label?: AxisLabel) => {
  if (alignment === 'top') {
    return new Components.Table([[label], [axis]]);
  }

  if (alignment === 'bottom') {
    return new Components.Table([[axis], [label]]);
  }

  if (alignment === 'left') {
    return new Components.Table([[label, axis]]);
  }

  if (alignment === 'right') {
    return new Components.Table([[axis, label]]);
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

export type NumericAxisConfig = AxisConfig & {
  axisScale: Scales.Linear;
  axisOrientation?: string;
};

export const createNumericAxis =
  (axisConfig: NumericAxisConfig, format?: (any) => any, axis?: Axes.Numeric): Component
  | undefined => {
  const {
    showAxis = true,
    axisOrientation = 'horizontal',
    axisScale,
    axisMargin = 10,
    ticking = 'all',
    prefix = '',
    suffix = ''
  } = axisConfig;

  if (!showAxis) return undefined;

  const alignment: AxisOrientation = axisOrientation === 'horizontal' ? 'bottom' : 'left';

  if (!axis) axis = new Axes.Numeric(axisScale, alignment);

  axis.formatter(d => `${prefix}${approximate(format && format(d))}${suffix}`);
  axis.showEndTickLabels(true);
  axis.margin(0);

  let label: Components.AxisLabel | undefined;

  if (axisConfig.axisLabel) {
    axis.margin(axisMargin);
    label = new Components.AxisLabel(axisConfig.axisLabel, getAxisLabelRotation(alignment));
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
export type TimeAxisConfig = AxisConfig & {
  axisScale: Scales.Time;
};

export const createTimeAxis = (config: TimeAxisConfig, axis?: Axes.Time): Component | undefined => {
  if (!config.showAxis) return undefined;

  if (!axis) axis = new Axes.Time(config.axisScale, 'bottom');

  axis.showEndTickLabels(true);
  axis.margin(0);

  let label: Components.AxisLabel | undefined;

  if (config.axisLabel && config.axisMargin) {
    axis.margin(config.axisMargin);
    label =
      new Components.AxisLabel(config.axisLabel, getAxisLabelRotation('bottom'));
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
export type CategoryAxisConfig = AxisConfig & {
  axisScale: Scales.Category;
  axisOrientation?: string;
  innerPadding?: number;
  outerPadding?: number;
  axisDirection?: AxisOrientation;
};

export const createCategoryAxis = (config: CategoryAxisConfig, axis?: Axes.Category): Component | undefined => {
  if (!config.showAxis) return undefined;

  const alignment = config.axisDirection || (config.axisOrientation === 'vertical' ? 'bottom' : 'left');

  if (!axis) axis = new Axes.Category(config.axisScale, alignment);

  axis.margin(0);

  let label: Components.AxisLabel | undefined;

  if (config.axisLabel) {
    axis.margin(config.axisMargin || 10);
    label = new Components.AxisLabel(config.axisLabel, getAxisLabelRotation(alignment));
  }

  // Add ticking classes
  configureAxisTicking(axis, config.ticking);

  return createAxisTable(alignment, axis, label);
};
