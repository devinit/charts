import Plottable from 'plottable'

export const createLinearScale = ({axisMinimum = null, axisMaximum = null}) => {
  const scale = new Plottable.Scales.Linear();
  scale.domainMin(axisMinimum);
  scale.domainMax(axisMaximum);

  // ...

  return scale;
};

export const createCategoryScale = ({innerPadding = 0, outerPadding = 0}) => {
  const scale = new Plottable.Scales.Category();
  scale.outerPadding(outerPadding);
  scale.innerPadding(innerPadding);

  // ...

  return scale;
};