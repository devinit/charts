import * as Plottable from 'plottable';
import {createLinearScale, LinearScale} from '@devinit-charts/core/lib/scale';

export interface BubbleData {
    x: number;
    y: number;
}
export interface Config {
    horizontalAxis: LinearScale;
    verticalAxis: LinearScale;
}

export default (element: HTMLElement, data: BubbleData[], config: Config) => {
    const {horizontalAxis, verticalAxis} = config;
    const xScale = createLinearScale(horizontalAxis);
    const yScale = createLinearScale(verticalAxis);

    const plot = new Plottable.Plots.Scatter();

    const update = (newData: BubbleData[]) => {
        plot.addDataset(new Plottable.Dataset(newData))
            .x((d) => d.x, xScale)
            .y((d) => d.y, yScale)
            .size(20)
            .renderTo(element);
    };

    update(data); // initial draw

    window.addEventListener('resize', () => plot.redraw());

    const chart = {
        update
    };

    return chart;
};
