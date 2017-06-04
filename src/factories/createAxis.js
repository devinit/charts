import Plottable from "plottable";

export const createNumericAxis = ({showAxis = false, axisOrientation, axisScale, axisLabel = null, axisMargin = 10}) => {

  if (!showAxis) return null;

  const alignment = axisOrientation === 'horizontal' ? 'bottom' : 'left';

  const axis = new Plottable.Axes.Numeric(axisScale, alignment);
  axis.margin(axisMargin);

  const label = axisLabel && new Plottable.Components.AxisLabel(axisLabel, getAxisLabelRotation(alignment));

  return createAxisTable(alignment, axis, label)

};

export const createCategoryAxis = ({showAxis = false, axisOrientation, axisScale, axisLabel = null, axisMargin = 10}) => {
  if (!showAxis) return null;

  const alignment = axisOrientation === 'vertical' ? 'bottom' : 'left';

  const axis = new Plottable.Axes.Category(axisScale, alignment);

  axis.margin(axisMargin);

  const label = axisLabel && new Plottable.Components.AxisLabel(axisLabel, getAxisLabelRotation(alignment));

  return createAxisTable(alignment, axis, label)
};

export const createAxisTable = (alignment, axis, label) => {

  if (alignment === 'top') {
    return new Plottable.Components.Table([[label], [axis],]);
  }

  if (alignment === 'bottom') {
    return new Plottable.Components.Table([[axis], [label],]);
  }

  if (alignment === 'left') {
    return new Plottable.Components.Table([[label, axis]]);
  }

  if (alignment === 'right') {
    return new Plottable.Components.Table([[axis, label]]);
  }

};

export const getAxisLabelRotation = (alignment) => {
  return labelRotationAngles[alignment]
}

export const labelRotationAngles = {
  top: 0,
  bottom: 0,
  left: -90,
  right: 90
};