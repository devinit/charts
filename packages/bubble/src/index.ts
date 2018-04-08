import * as Plottable from 'plottable';

export interface BubbleData {
    x: number;
    y: number;
}

export default (element: HTMLElement, data: BubbleData[], config: any) => {
    console.info('config', config);

    const xScale = new Plottable.Scales.Category();
    const yScale = new Plottable.Scales.Linear();

    const plot = new Plottable.Plots.Scatter();

    const update = (newData: BubbleData[]) => {
        plot.addDataset(new Plottable.Dataset(newData))
            .x((d) => d.x, xScale)
            .y((d) => d.y, yScale)
            .renderTo(element);
    };

    update(data); // initial draw

    window.addEventListener('resize', () => plot.redraw());

    const chart = {
        update
    };

    return chart;
};
