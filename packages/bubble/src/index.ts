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

    plot.x((d) => d.x, xScale)
        .y((d) => d.y, yScale)
        .size((d) => d.y * 5)
        .animated(true)
        .animator(Plottable.Plots.Animator.MAIN, new Plottable.Animators.Easing().easingMode('linear'))
        .renderTo(element);

    const update = (newData: BubbleData[]) => {
        const prevDataset = plot.datasets();
        if (prevDataset && prevDataset[0]) plot.removeDataset(prevDataset[0]);
        plot.addDataset(new Plottable.Dataset(newData));
    };

    update(data); // initial draw

    window.addEventListener('resize', () => plot.redraw());

    const chart = {
        plot,
        update
    };

    return chart;
};
