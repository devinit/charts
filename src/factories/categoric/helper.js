/**
 * the labels plotable provides  for barchart are not ideal for now
 * for instance they are cut off via height from some bars
 */
import {groupBy, range} from 'lodash';
import approximate from '../approximate/index';


const drawLabel = (opts, foreground) => {
  // forExtend is for drawing sums of values in a stacked bar
  const {width, height, x, y, value, color, suffix, prefix, drawStackedBarSum = false} = opts;
  const yPos = height && !drawStackedBarSum < 30 ? y + 2 : y + 10;
  foreground
    .append('foreignObject')
    .attr('width', width)
    .attr('height', height)
    .attr('x', x)
    .attr('y', yPos)
    .append('xhtml:body')
    .html(height > 15 || drawStackedBarSum ?
      `<span class="custom-label" style="color: ${color}">
            ${prefix}${approximate(value)}${suffix}
        </span>`
      : '<span></span>');
};

const getValuesFromEntity = (entity) => {
  const rect = entity.selection._groups[0][0];
  const width = rect.width.baseVal.value;
  const height = rect.height.baseVal.value;
  const value = entity.datum.value;
  const y = rect.y.baseVal.value;
  const x = rect.x.baseVal.value;
  return {width, height, y, x, value };
};

const getGroupValues = (entities) => {
  const groups = groupBy(entities, (obj) => obj.datum.group);
  const groupKeys = Object.keys(groups);
  const lastKey = groupKeys[groupKeys.length - 1];
  const groupLength = groups[groupKeys[0]].length;
  return range(groupLength).map((index) => {
    return groupKeys.reduce((all, key) => {
      const entity = groups[key][index];
      const entityValues = getValuesFromEntity(entity);
      const sum = all.sum + entityValues.value;
      if (lastKey === key) {
        const y = entityValues.y - 20;
        return {...entityValues, height: 30, value: sum, y};
      }
      return {...all, sum};
    }, {sum: 0});
  });
};

export const createCustomLabels = (config, plot) => {
  const foreground = plot.foreground();
  const {prefix = ' ', suffix = ' '} = config;
  const entities = plot.entities();
  entities.forEach(entity => {
    const entityValues = getValuesFromEntity(entity);
    drawLabel({...entityValues, color: 'white', prefix, suffix}, foreground);
  });
  if (!entities[0].datum.group || !config.drawStackedBarSum) return false;
  const groupEntities = getGroupValues(entities);
  groupEntities.forEach(group => {
    drawLabel({
      ...group,
      prefix,
      color: 'black',
      suffix,
      drawStackedBarSum: config.drawStackedBarSum}, foreground);
  });
};
