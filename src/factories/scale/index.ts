import * as Plottable from 'plottable';

/**
 * Creates linear scale
 * @param {NumericAxis} config
 * @returns {Linear}
 */
export const createLinearScale = (config: any) => {
  const { axisMinimum = null, axisMaximum = null } = config;

  const scale = new Plottable.Scales.Linear();
  scale.domainMin(axisMinimum);
  scale.domainMax(axisMaximum);

  // ...

  return scale;
};

/**
 * Creates time scale
 * @param {TimeAxis} config
 * @returns {Time}
 */
export interface TimeScale {
  axisMaximum?: any;
  axisMinimum?: any;
}
export const createTimeScale = (config: TimeScale) => {
  const scale = new Plottable.Scales.Time();
  if (config.axisMaximum) scale.domainMin(new Date(config.axisMinimum.toString()));
  if (config.axisMaximum) scale.domainMax(new Date(config.axisMaximum.toString()));

  return scale;
};

/**
 * Creates category scale
 * @param {CategoryAxis} config
 * @returns {Category}
 */
export interface Config {
  innerPadding?: number;
  outerPadding?: number;
}
export const createCategoryScale = (config: Config) => {
  const { innerPadding = 0, outerPadding = 0 } = config;
  const scale = new Plottable.Scales.Category();
  scale.outerPadding(outerPadding);
  scale.innerPadding(innerPadding);
  return scale;
};
