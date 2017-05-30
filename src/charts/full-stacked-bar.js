import Plottable from "plottable";
import {createCategoryLinearChart} from "../factories/chartFactory";

export default (element, {labels, series}, {orientation, ...config}) => {
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

  const categoryLinearChart = createCategoryLinearChart(element, {labels, series}, {orientation, max: 1, ...config});
  return categoryLinearChart(new Plottable.Plots.StackedBar(orientation))
};