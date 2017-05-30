import Plottable from "plottable";
import {createCategoryLinearChart} from "../factories/chartFactory";

export default (element, {labels, series}, {innerPadding, ...config}) => {
  const sums = labels
    .map((label, index) =>
      series
        .map(({values}) => values[index] || 0)
        .reduce((sum, value) => sum + value)
    );

  series = series.map(s => {

    return {
      ...s,
      values: s.values.map((value, index) => value / sums[index]),
    }

  });

  const categoryLinearChart = createCategoryLinearChart(
    element,
    {labels, series},
    {
      // TODO: Fix [https://github.com/palantir/plottable/issues/747](#747)
      // Temporary work around for [https://github.com/palantir/plottable/issues/747](#747)
      // Issue: AreaPlot / LinePlot should default to no padding on xScale
      innerPadding: innerPadding || 999,
      max: 1,
      ...config
    });

  return categoryLinearChart(new Plottable.Plots.StackedArea())
};