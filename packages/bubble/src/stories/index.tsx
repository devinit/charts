import * as React from 'react';
import { storiesOf } from '@storybook/react';
import {BubbleData} from '..';
import BubbleChart from '../react';

const data: BubbleData[] = [
    { x: 1, y: 1 }, { x: 2, y: 3 }, { x: 3, y: 2 },
    { x: 4, y: 4 }, { x: 5, y: 3 }, { x: 6, y: 5 }
];

const config = {
    horizontalAxis: {axisMinimum: 1, axisMaxmum: 6},
    verticalAxis: {axisMinimum: 1, axisMaxmum: 6}
};

const Frame = ({children}) =>
    <div style={{border: 'solid 2px black', width: '500px', height: '500px', padding: '10px'}}>
        {...children}
    </div>;

storiesOf('BubbleChart', module)
    .add('simple', () =>
        <Frame>
            <BubbleChart {...{data, width: 400, height: 400, config}} />
        </Frame>);
