import {uniq} from "lodash";

export default dualSidebar => function innerDrawLabels() {
  const entities = this.entities();
  const foreground = this.foreground();
  const data = entities.map(entity => entity.datum);
  const direction = data[0] && data[0].direction;

  foreground.attr('style', 'overflow: visible');
  foreground.selectAll('text').remove();

  uniq(data.map(d => d.category)).forEach(categoryId => {
    const categoryEntities = entities.filter(entity => entity.datum.category === categoryId);

    if (direction > 0 && categoryEntities.length) {
      const nodeYValues = categoryEntities.map(entity => entity.selection.node().y.baseVal.value);

      const top = Math.min.apply(null, nodeYValues);

      foreground
        .append('text')
        .text(categoryId)
        .attr('class', 'group-label')
        .attr('x', dualSidebar.gutter * -0.5)
        .attr('y', top - 15)
        .attr('text-anchor', 'middle');

      uniq(categoryEntities.map(entity => entity.datum.subCategory))
        .forEach(subCategoryId => {
          const subCategoryEntities = categoryEntities
            .filter(entity => entity.datum.subCategory === subCategoryId);

          const nodeTopValues = subCategoryEntities
            .map(entity => entity.selection.node().y.baseVal.value);

          const nodeBottomValues = subCategoryEntities.map(entity => {
            const y = entity.selection.node().y.baseVal.value;
            const height = entity.selection.node().height.baseVal.value;
            return y + height;
          });

          const top = Math.min.apply(null, nodeTopValues);
          const bottom = Math.max.apply(null, nodeBottomValues);

          const y = top + ((bottom - top) / 2);

          foreground
            .append('text')
            .text(subCategoryId)
            .attr('class', 'subGroup-label')
            .attr('x', dualSidebar.gutter * -0.5)
            .attr('y', y)
            .attr('alignment-baseline', 'middle')
            .attr('text-anchor', 'middle');
        });
    }
  });

  entities.forEach(entity => {
    const {datum} = entity;

    // Don't draw labels if datum has no label
    // Maybe because it's a dummy datum
    if (datum.label) {
      const x = entity.selection.node().x.baseVal.value;
      const y = entity.selection.node().y.baseVal.value;
      const width = entity.selection.node().width.baseVal.value;
      const height = entity.selection.node().height.baseVal.value;

      foreground
        .append('text')
        .text(datum.label)
        .attr('class', 'data-label')
        .attr('x', (datum.direction > 0 ? x + width : x) + (datum.direction * 10))
        .attr('y', y + (height / 2))
        .attr('alignment-baseline', 'middle')
        .attr('text-anchor', datum.direction > 0 ? 'start' : 'end');
    }
  });
};