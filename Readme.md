# @devinit/charts

Modular d3 charts

## Install
Firstly, install `@devinit/charts`

```
npm install @devinit/charts
```

## Developing

To start contributing, clone this repository and run `npm start`

Browse to localhost:8080, to see some charts

## Usage

This library exposes a `draw` function that takes the following parameters;
 - a DOM node
 - a configuration object
 - a data object

Example:
```js

draw({
    element: document.getElementById('line-chart'),
    config: {
      title: 'Line Chart',
      type: 'line',
    },
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      series: [
        {
          color: '#ff9a55', label: '1992',
          values: [100, 200, 120, 270, 230, 210]
        },
        {
          color: '#ffea6c', label: '1993',
          values: [110, 130, 260, 250, 210, 180]
        },
      ]
    }
})

```

With that you get a line chart inside the element with an id of `line-chart`. The configuration fields and data shape depend on the chart type. The following sections outline the accepted configuration files and data shape for each supported chart type

### Linear Charts

Linear charts consist of a linear axis and a category axis 

#### Chart types
- area
- bar
- line
- stacked-bar
- stacked-area
- full-stacked-bar
- full-stacked-area
- clustered-bar

#### Configuration

```js
const config = {
  
    title: 'Line Chart',

    // titleAlignment: 'left|center|right',
    titleAlignment: 'left',
    
    // orientation: 'vertical|horizontal',
    orientation: 'vertical',
  
    linearAxis: {
      showAxis: false,
      showGridlines: false,
      axisLabel: null,
      axisMinimum: null,
      axisMaximum: null,
    },

    categoryAxis: {
      showAxis: false,
      axisLabel: null,
      innerPadding: 0,
      outerPadding: 0
    },
    
}

```

#### Data Shape

```js
const data = {
  "labels": ["Label 1", ...moreLabels],
  "series": [
    {
      "color": "#abc", 
      "label": "Series Label",
      "values": [1, 2, ...moreValues]
    },
    ...moreSeries
  ]
}
```

| Label | Color | Jan | Feb | Mar | Apr | May |
|-------|-------|-----|-----|-----|-----|-----|
| 2006  | #abc  | 1   | 2   | 3   | 4   | 5   |
| 2007  | #aba  | 2   | 3   | 4   | 5   | 6   |
| 2008  | #abb  | 3   | 4   | 5   | 6   | 7   |

### Circular Charts

Circular charts include pie and donut charts

```js
const data = {
  "series": [
    {
      "label": 'Jan',
      "color": '#ff9a55',
      "value": 200,
    },
    
    ...moreSeries
   ]
}
```

### Hierarchy Charts

Hierachy charts represent tree data e.g `tree-map`, `partition`, `grouped-vertical-stack`. Each series needs a parent identifier.

#### Chart types
- treemap
- partition

#### Configuration

```js
const config = {
  
}
```

#### Data shape
```js
const data = {
  "series": [
    {
      "label": 'Africa',
    },
    {
      "label": 'Uganda',
      "parent": 'Africa',
      "color": '#ff9a55',
      "value": 200,
    },
    {
      "label": 'Kenya',
      "parent": 'Africa',
      "color": '#ff9a55',
      "value": 200,
    },
    
    ...moreSeries
   ]
}
```

| label  | parent | color  | value |
|--------|--------|--------|-------|
| Africa |        |        |       |
| Uganda | Africa | #aba   | 4     |
| Kenya  | Africa | #abb   | 5     |
| Rwanda | Africa | #abb   | 5     |

### 3D Charts (TODO)

3D charts represent three dimensional data

