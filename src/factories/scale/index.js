import Plottable from 'plottable';

/**
 * Creates linear scale
 * @param {NumericAxis} config
 * @returns {Linear}
 */
export const createLinearScale = (config = {}) => {
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
export const createTimeScale = (config = {}) => {
  const { axisMinimum = null, axisMaximum = null } = config;

  const scale = new Plottable.Scales.Time();
  axisMaximum && scale.domainMin(new Date(axisMinimum.toString()));
  axisMaximum && scale.domainMax(new Date(axisMaximum.toString()));

  // ...

  return scale;
};

/**
 * Creates category scale
 * @param {CategoryAxis} config
 * @returns {Category}
 */
export const createCategoryScale = config => {
  const { innerPadding = 0, outerPadding = 0 } = config;
  const scale = new Plottable.Scales.Category();
  scale.outerPadding(outerPadding);
  scale.innerPadding(innerPadding);

  // ...

  return scale;
};
