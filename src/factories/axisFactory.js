import Plottable from 'plottable'

export const createNumericAxis = ({required, alignment, scale, label, }) => {
  if (!required) return null;

  const axis = new Plottable.Axes.Numeric(scale, alignment);
  axis.showEndTickLabels(true);
  const axisLabel = label && new Plottable.Components.AxisLabel(label, 0);

  return createAxisTable(alignment, axis, axisLabel)
};

export const createCategoryAxis = ({required, alignment, scale, label, }) => {
  if (!required) return null;

  const axis = new Plottable.Axes.Category(scale, alignment);
  const axisLabel = label && new Plottable.Components.AxisLabel(label, 0);

  return createAxisTable(alignment, axis, axisLabel)
};

export const createAxisTable = (alignment, axis, label) => {

  if (alignment === 'top') {
    return new Plottable.Components.Table([[label], [axis],]);
  }

  if (alignment === 'bottom') {
    return new Plottable.Components.Table([[axis], [label],]);
  }

  if (alignment === 'left') {
    label.angle(-90);
    return new Plottable.Components.Table([[label, axis]]);
  }

  if (alignment === 'right') {
    label.angle(90);
    return new Plottable.Components.Table([[axis, label]]);
  }

};