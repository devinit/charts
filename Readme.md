# @devinit/charts

[![Build Status](https://travis-ci.org/devinit/charts.svg?branch=master)](https://travis-ci.org/devinit/charts)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/539c39de03d64cb5b776ef388eef29d6)](https://www.codacy.com/app/epicallan/charts?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=devinit/charts&amp;utm_campaign=Badge_Grade)
[![Dependency Status](https://gemnasium.com/badges/github.com/devinit/charts.svg)](https://gemnasium.com/github.com/devinit/charts)

configurable d3 charts from csv like data

## Install
Firstly, install `@devinit/charts`

```
npm install @devinit/charts
```

## Developing

To start contributing, clone this repository and run `npm start`

Browse to localhost:8080, to see some charts

## Usage

This library exposes a `draw` function that takes an object with the following properties;
 - element: a DOM node
 - config: a configuration object
 - data: a list of entries
 
The function returns an object with the following methods
- update(data: Array): updates visualised data
 
 Example:
```js

draw({
    element: document.getElementById('area_chart'),
    config: {
        title: 'Area Chart',
        type: 'area',
        colors: ['#ba0c2f', '#93328e', '#b7bf10', '#004862'],
        linearAxis: {
            showAxis: true,
            showGridlines: true,
            axisLabel: 'Country',
        },
        categoryAxis: {
            showAxis: true,
            axisLabel: 'Area',
        }
    },
    data: [
        {"Area": 100, "Country": "Uganda"},
        {"Area": 200, "Country": "Kenya"},
        {"Area": 120, "Country": "Tanzania"},
        {"Area": 270, "Country": "Rwanda"},
        {"Area": 230, "Country": "Burundi"},
    ]
})

```

With that you get an area chart inside the element with an id of `area-chart`. The configuration fields depend on the chart type. 

# Configuration
The following sections outline the accepted configuration fields for each supported chart type

### Linear vs Category Charts

These consist of a linear axis and a category axis 

#### Chart types
- area
- bar
- line
- stacked-bar
- stacked-area
- full-stacked-bar
- full-stacked-area
- clustered-bar

```js
const config = {
    
    title: 'Line Chart',

    // title alignment: left/center/right,
    titleAlignment: 'left',
    
    // orientation: vertical/horizontal,
    orientation: 'vertical',
  
    linearAxis: {
        // Whether or not to show axis component
        showAxis: false,
        // Whether or not to show grid lines
        showGridlines: false,
        // Data field for this axis
        axisLabel: 'Area',
        // Minimum axis value
        axisMinimum: null,
        // Maximum axis value
        axisMaximum: null,
    },

    categoryAxis: {
        // Whether or not to show axis component
        showAxis: false,
        // Data field for this axis
        axisLabel: 'Countries',
        // Padding between categories
        innerPadding: 0,
        // Padding between axes and end data categories
        outerPadding: 0
    },
    
    legend: {
        // Whether or not to show legend
        showLegend: false,
        // Align of label items; left/center/right
        alignment: 'left',
        // Position of legend on chart: bottom/right
        position: 'bottom',
        // Shape of legend indicators: 
        // circle/square/cross/diamond/triangle/star/wye
        symbol: 'square',
        // Maximum entries per row
        rowSpan: 1
    }
    
}
```

### Circular Charts

Circular charts include pie and donut charts

```js
const data = {
    type: 'pie',
    
    title: 'Donut Chart',
    
    titleAlignment: 'center',
    
    colors: ['#ba0c2f', '#93328e', '#b7bf10', '#004862'],
    
    circular: {
        // Data field for label sectors
        label: 'Country',
        // Data field for sector values
        value: 'Population',
        // Inner radius for donut charts
        innerRadius: 100,
        // Stroke width and color around each sector
        strokeWidth: 5,
        strokeColor: '#fff',
    },
    
    // See previous section
    legend: {
        showLegend: true,
        position: 'bottom',
        alignment: 'center'
    }
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
      
    title: 'Partition Chart',
    type: 'partition',
    orientation: 'horizontal',
    
    
    tree: {
        // unique node reference field
        id: 'label',
        // node parent reference field 
        parent: 'parent',
        // node value field
        value: 'value',
        // Maximum visible node depth
        depth: Infinity,
    },
    
    // applies to type = treemap
    treemap: {
        // Tiling algorithm: 
        // binary/dice/slice/sliceDice/squarify/resquarify
        tile: 'sliceDice',
    
    },
    
}
```

### 3D Charts (TODO)

3D charts represent three dimensional data

