import * as React from 'react';
import { storiesOf } from '@storybook/react';
import {BubbleData} from '..';
import BubbleChart from '../react';

const data: BubbleData[] = [
    { x: 1, y: 1 }, { x: 2, y: 3 }, { x: 3, y: 2 },
    { x: 4, y: 4 }, { x: 5, y: 3 }, { x: 6, y: 5 }
];
const Frame = ({children}) =>
    <div style={{border: 'solid 2px black', width: '500px', height: '500px'}}>
        {...children}
    </div>;

storiesOf('BubbleChart', module)
    .add('simple', () =>
        <Frame>
            <BubbleChart data={data} />
        </Frame>);
