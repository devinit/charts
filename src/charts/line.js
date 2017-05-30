import Plottable from "plottable";
import {createCategoryLinearChart} from "../factories/chartFactory";

export default (element, data, config) => {
  const categoryLinearChart = createCategoryLinearChart(
    element,
    data,
    {
      // TODO: Fix [https://github.com/palantir/plottable/issues/747](#747)
      // Temporary work around for [https://github.com/palantir/plottable/issues/747](#747)
      // Issue: AreaPlot / LinePlot should default to no padding on xScale
      innerPadding: 999,

      ...config
    }
  );

  return categoryLinearChart(new Plottable.Plots.Line())
};