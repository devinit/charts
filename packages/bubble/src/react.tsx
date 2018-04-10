import * as React from 'react';
import Chart from '@devinit-charts/core/lib/react';
import draw, {BubbleData, Config} from '.';

export interface Props {
    data: BubbleData[];
    width: number;
    height: number;
    config: Config;
}

const chart: React.SFC<Props> = ({data, width, height, config}) => {
    const opts = {
        draw,
        config,
        data,
        width,
        height,
    };
    return  <Chart {...opts} />;
};

export default chart;
