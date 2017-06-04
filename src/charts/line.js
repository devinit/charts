import Plottable from "plottable";
import {createLinearChart} from "../factories/createLinearChart";

export default ({element, data, config}) => {

  const plot = new Plottable.Plots.Line();

  const linearChart = createLineChart(element, plot, config);

  linearChart.addData(data);

  return linearChart
};

export const createLineChart = (element, plot, {categoryAxis = {}, ...config}) => {

  return createLinearChart({
    element,
    plot,
    config: {
      categoryAxis: {

        // TODO: Fix [https://github.com/palantir/plottable/issues/747](#747)
        // Temporary work around for [https://github.com/palantir/plottable/issues/747](#747)
        // Issue: AreaPlot / LinePlot should default to no padding on xScale
        innerPadding: 999,

        ...categoryAxis
      },

      ...config
    }
  });
};