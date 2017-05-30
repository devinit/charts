import Plottable from 'plottable'

export const createLinearScale = ({min, max}) => {
  const scale = new Plottable.Scales.Linear();
  scale.domainMin(min);
  scale.domainMax(max);

  // ...

  return scale;
};

export const createCategoryScale = ({innerPadding, outerPadding}) => {
  const scale = new Plottable.Scales.Category();
  scale.outerPadding(outerPadding);
  scale.innerPadding(innerPadding);

  // ...

  return scale;
};