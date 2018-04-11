import * as React from 'react';
import { storiesOf } from '@storybook/react';
import AnimatedBubbleChart from './animated-bubble';

storiesOf('BubbleChart', module)
    .add('simple', () => <AnimatedBubbleChart />);
