import * as Plottable from 'plottable';
import { CategoricChart} from '../factories/categoric';
import { createLineChart} from '../factories/categoric/line';

/**
 * @typedef {LinearCategoryChart} Area
 * @public
 * @property {'area'} type
 *
 */
const area = (element, data, config): CategoricChart => {
  const plot = new Plottable.Plots.Area();

  // ... apply area configuration

  const chart = createLineChart(element, plot, config);

  chart.update(data);

  return chart;
};

export default area;
