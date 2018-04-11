import * as React from 'react';
import {BubbleData} from '..';
import BubbleChart from '../react';

const baseDataA: BubbleData[] = [
    { x: 2, y: 6 }, { x: 2, y: 3 }, { x: 3, y: 2 },
    { x: 4, y: 4 }, { x: 5, y: 3 }, { x: 6, y: 5 }
];

const baseDataB: BubbleData[] = [
    { x: 8, y: 3 }, { x: 7, y: 2 }
];

// const scaler = Math.abs(Math.random() * 10);

const config = {
    horizontalAxis: {axisMinimum: 1, axisMaxmum: 10},
    verticalAxis: {axisMinimum: 1, axisMaxmum: 10}
};

export enum CurrentData {
    DataA,
    DataB
}

export interface State {
    data: BubbleData[];
    currentData: CurrentData;
}

export default class AnimatedBubbleChart extends React.Component<{}, State> {
    constructor(props) {
        super(props);
        this.state = {data: baseDataA, currentData: CurrentData.DataA};
        this.updateData = this.updateData.bind(this);
    }
    public updateData() {
        const newState = this.state.currentData === CurrentData.DataA ?
            {data: baseDataB, currentData: CurrentData.DataB} :
            {data: baseDataA, currentData: CurrentData.DataA};
        this.setState(newState);
    }
    public render() {
       console.log('state', this.state);
       return (
        <div style={{border: 'solid 2px black', width: '500px', height: '500px', padding: '10px'}}>
            <BubbleChart {...{data: this.state.data, width: 400, height: 400, config}} />
            <hr />
            <button
                onClick={this.updateData}
                style={{backgroundColor: 'red', color: 'white', width: '100px', height: '50px', padding: '10px' }}
            >
            switch data
            </button>
        </div>);
    }
}
