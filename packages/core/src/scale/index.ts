import { Scales } from 'plottable';

/**
 * Creates linear scale
 * @param {NumericAxis} config
 * @returns {Linear}
 */
export interface LinearScale {
  axisMaximum?: number;
  axisMinimum?: number;
}
export const createLinearScale = (config: LinearScale): Scales.Linear => {
  const { axisMinimum, axisMaximum} = config;

  const scale = new Scales.Linear();
  if (axisMinimum) scale.domainMin(axisMinimum);
  if (axisMaximum) scale.domainMax(axisMaximum);
  return scale;
};

/**
 * Creates time scale
 * @param {TimeAxis} config
 * @returns {Time}
 */
export interface TimeScale {
  axisMaximum?: string | Date;
  axisMinimum?: string | Date;
}
export const createTimeScale = (config: TimeScale): Scales.Time => {
  const scale = new Scales.Time();
  const { axisMinimum, axisMaximum} = config;
  if (axisMinimum) scale.domainMin(new Date(axisMinimum.toString()));
  if (axisMaximum) scale.domainMax(new Date(axisMaximum.toString()));

  return scale;
};

/**
 * Creates category scale
 * @param {CategoryAxis} config
 * @returns {Category}
 */
export interface CategoryScale {
  innerPadding?: number;
  outerPadding?: number;
}

export const createCategoryScale = (config: CategoryScale): Scales.Category => {
  const { innerPadding = 0, outerPadding = 0 } = config;
  const scale = new Scales.Category();
  scale.outerPadding(outerPadding);
  scale.innerPadding(innerPadding);
  return scale;
};
