import Plottable from "plottable";
import {createTreeDataset} from "./createDataset";

export default ({element, plot, config: {

    title = null,

    orientation = 'vertical',

    titleAlignment = 'left',

    // ... config
  }}) => {

  const xScale = new Plottable.Scales.Linear();
  xScale.domainMin(0);
  xScale.domainMax(1);

  const yScale = new Plottable.Scales.Linear();
  yScale.domainMin(0);
  yScale.domainMax(1);

  const x = orientation === 'vertical' ? 'x' : 'y';
  const y = orientation === 'horizontal' ? 'x' : 'y';

  plot
    .x(d => d[`${x}0`], xScale)
    .y(d => d[`${y}0`], yScale)
    .x2(d => d[`${x}1`], xScale)
    .y2(d => d[`${y}1`], yScale)
    .attr("fill", d => d.data.color)
    .attr("stroke", d => '#fff')
    .attr("stroke-width", () => 1)
    .labelsEnabled(true)
    .label(d => `${d.data.label} (${d.value})`);

  const titleLabel = new Plottable.Components.TitleLabel(title, 0)
    .xAlignment(titleAlignment)
    .yAlignment('top');

  const table = new Plottable.Components.Table([
    [titleLabel],
    [plot],
  ]);

  table.rowPadding(20);

  table.renderTo(element);

  const addData = (data = null) => {
    if (data) {

      plot.datasets(createTreeDataset(data));
    }
  };

  const onClick = (callback = d => d) => {

    const interaction = new Plottable.Interactions.Click()
      .onClick(function (point) {

        const entities = plot.entitiesAt(point);

        if (entities.length) {
          callback(entities, xScale, yScale)
        }

      });

    interaction.attachTo(plot);

  };

  const onPointerEnter = (callback = d => d) => {

    const interaction = new Plottable.Interactions.Pointer()
      .onPointerEnter(function (point) {

        const entities = plot.entitiesAt(point);

        if (entities.length) {
          callback(entities[0])
        }

      });

    interaction.attachTo(plot);

  };

  const onPointerExit = (callback = d => d) => {

    const interaction = new Plottable.Interactions.Pointer()
      .onPointerEnter(function (point) {

        const entities = plot.entitiesAt(point);

        if (entities.length) {
          callback(entities[0])
        }

      });

    interaction.attachTo(plot);

  };

  return {

    table,

    addData,

    onClick,

    onPointerEnter,

    onPointerExit,
  };
};