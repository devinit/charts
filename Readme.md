# @devinit/charts

> Disclaimer: This is a work in progress

Hello there,

We're building another charting library. Why would we do that, you ask? 

> We won't be reinventing anything. Instead this is library interface between DevInit products and any number of charting libraries.

We're putting all the charts in one place, such that no one has to reinvent wheels. The charts are written in pure javascript, thus can be used anywhere.

Chart authors may use any existing JavaScript libraries to implement charts. Since each chart component bundle is loaded asynchronously, this should have no effect on your application's initial bundle.

## Concepts

Since this library is only an interface, we have come up with some general rules for how datasets should look like. This format should be compatible with any chart type

### Linear Charts

```js
const data = {
  "labels": ["Label 1", ...moreLabels], 
  "series": [
    {
      "stroke": "#abc", 
      "fill": "#abc", 
      "opacity": 1, 
      "values": [1, 2, ...moreValues]
    },
    ...moreSeries
  ]
}
```

#### Rules
1. Each value in a `series` should correspond to a `label`. This implies that;
    1. the number of values in a `series` should equal the number of `labels`
    2. all `series` should contain an equal number of `values`, use zero when no value is available
2. All color configuration associated with a series should be provided in the series
3. Simple chart types (e.g. bar, column, line, area, pie) should require only one series
4. Compound chart types (e.g bar-stack, column-cluster, area-stack, pie-stack) should render each series 

### Hierachy Charts

TODO

## Install
Firstly, install `@devinit/charts`

> `yarn add @devinit/charts`

## Developing

To start contributing and run `npm start`

```
$ npm start
```

Browse to localhost:8080, to see some charts

