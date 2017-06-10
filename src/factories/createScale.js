import Plottable from 'plottable'

export const createLinearScale = (config) => {
  const {axisMinimum = null, axisMaximum = null} = config;

  const scale = new Plottable.Scales.Linear();
  scale.domainMin(axisMinimum);
  scale.domainMax(axisMaximum);

  // ...

  return scale;
};

export const createCategoryScale = (config) => {
  const {innerPadding = 0, outerPadding = 0} = config;
  const scale = new Plottable.Scales.Category();
  scale.outerPadding(outerPadding);
  scale.innerPadding(innerPadding);

  // ...

  return scale;
};