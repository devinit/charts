import * as React from 'react';
import Chart from '@devinit-charts/core/lib/react';
import draw, {BubbleData} from '.';

export interface Props {
    data: BubbleData[];
}

const chart: React.SFC<Props> = ({data}) => {
    const config = {labeling: true};
    const opts = {
        draw,
        config,
        data,
        width: 200,
        height: 400
    };
    return  <Chart {...opts} />;
};

export default chart;
