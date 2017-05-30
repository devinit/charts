import Plottable from "plottable";
import { createCircularChart } from '../factories/chartFactory'

export default (element, data, config) => {

  return createCircularChart(element, data, config)(new Plottable.Plots.Pie());

};