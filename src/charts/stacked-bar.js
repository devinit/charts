import Plottable from "plottable";
import { createCategoryLinearChart } from '../factories/chartFactory'

export default (element, data, {orientation, ...config}) => {
  return createCategoryLinearChart(element, data, {orientation, ...config})(new Plottable.Plots.StackedBar(orientation))
};