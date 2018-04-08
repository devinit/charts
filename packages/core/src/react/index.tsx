/**
 * for using a chart as a react component
 */
import * as React from 'react';

// import stylesheet from '@devinit/charts/dist/di-charts.min.css';
/* eslint-disable react/no-danger */

export interface BasicChart <U> {
  update: (data: U) => void;
}

export interface Props <T, U, S>  {
  config: T;
  data: U;
  width: number;
  height: number;
  draw: (element: HTMLElement, data: U, config: T) => S & BasicChart<U>;
}

class Chart<T, U, S> extends React.Component <Props<T, U, S>> {
  public props: Props<T, U, S>;
  public element: HTMLElement | null;
  public chart: S & BasicChart<U>;

  constructor(props: Props<T, U, S>) {
    super(props);
  }

  public componentDidMount() {
    const element = this.element;
    const data = this.props.data;
    const config = this.props.config;
    if (!element) throw new Error ('provided empty html element');
    this.chart = this.props.draw(element, data, config);
  }

  public componentWillUpdate(props) {
    if (this.chart) {
      this.chart.update(props.data);
    }
  }
  public render() {
    return (
      <div
        ref={element => {
          this.element = element;
        }}
        style={{ width: this.props.width, height: this.props.height }}
      />
    );
  }
}

export default Chart;
