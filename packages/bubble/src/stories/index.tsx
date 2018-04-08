import * as React from 'react';
import { storiesOf } from '@storybook/react';
import {BubbleData} from '..';
import BubbleChart from '../react';

const data: BubbleData[] = [
    { x: 1, y: 1 }, { x: 2, y: 3 }, { x: 3, y: 2 },
    { x: 4, y: 4 }, { x: 5, y: 3 }, { x: 6, y: 5 }
];

storiesOf('BubbleChart', module)
    .add('simple', () => <BubbleChart data={data} />);
