'use strict';
/**
 * Global chart settings
 * function used for formatting axis lines etc
 */
export default class Utility {
  
  constructor({chart, axis}) {
    /*jshint validthis: true */
    this.chart = chart;
    this.axis = axis;
    this.axisElm = this.chart.select('.' + axis + '-axis');
  }

  setAxis(axis) {
    this.axis = axis;
    this.axisElm = this.chart.select('.' + axis + '-axis');
  }

  default () {
    this.showHiddenLabels();
    // this.transformTickLabelsOutWards();
    // this.dashGridLines();
    this.hideAxisTickMarks();
    this.hideAxisBaseLine();
  };

  hideLastGridLineAndLabel () {
    // hide last grid line
    this.chart.select('.' + this.axis + '-gridlines line')[0][0]
      .parentNode.lastChild.setAttribute('style', 'visibility:hidden');
    // hide last axis label
    this.chart.select('.' + this.axis + '-axis .tick-label')[0][0]
      .parentNode.lastChild.setAttribute('style', 'visibility:hidden');
  };

  transformTickLabelsOutWards () {
    var tickLabelContainerTransform = this.chart.select('.tick-label-container').attr('transform');
    var point = tickLabelContainerTransform.replace(/[\()a-z]/g, '').split(',');
    if (point[0] > 0) {
      this.chart.select('.tick-label-container').attr('transform', 'translate(' + (point[0] - 10) + ', ' + point[1] + ')');
    }
  };

  showHiddenLabels () {
    this.chart.selectAll('.tick-label').attr('style', 'visibility:visible');
  };

  hideAxisTickMarks (axis) {
    var axisElm = axis ? this.chart.select('.' + axis + '-axis') : this.axisElm;
    axisElm.select('.tick-mark-container').attr('style', 'visibility:hidden');
  };

  showAllAxisLabels (axis) {
    this.chart.select('.' + axis)
      .selectAll('.tick-label').attr('style', 'visibility:visible');
  };


  hideAllTickMarks () {
    this.chart.selectAll('.tick-mark').attr('style', 'visibility:hidden');
  };

  hideAxisBaseLine () {
    this.axisElm.select('.baseline').attr('style', 'visibility:hidden');
  };

  hideChartBaseLine () {
    this.chart.select('.render-area').select('.baseline').attr('style', 'visibility:hidden');
  };


  showFirstTickLabel () {
    this.chart.select('.' + this.axis + '-axis .tick-label')[0][0]
      .parentNode.firstChild.setAttribute('style', 'visibility:visible');
  };

  showBarGraphEvenLabelsAndCenter () {
    var tickLabels = this.chart.selectAll('.x-axis .tick-label')[0];
    tickLabels.forEach(function (item, index) {
      if ((index % 2) !== 1) {
        item.setAttribute('style', 'visibility:visible; text-anchor:middle');
      } else {
        item.setAttribute('style', 'visibility:hidden; text-anchor:middle');
      }
    });
  };

  showLastTickLabel () {
    this.chart.select('.' + this.axis + '-axis .tick-label')[0][0]
      .parentNode.lastChild.setAttribute('style', 'visibility:visible');
  };


  dashGridLines (axis) {
    // added dashed gridlines for a specific axis
    var gridAxis = axis !== undefined ? axis : this.axis;
    this.chart.select('.' + gridAxis + '-gridlines').selectAll('line').attr('stroke-dasharray', '1 5');
  };

  removeClipPath () {
    this.chart.selectAll('clipPath').remove();
  };

  spaceLineLegend (legend) {
    // find which point we will add or subtract to
    console.log('before', legend);
    var dy = legend[0].y - legend[1].y;
    if (dy > 0) {
      legend[0].y += 5;
      legend[1].y -= 5;
    } else {
      legend[0].y -= 5;
      legend[1].y += 5;
    }
    console.log('after', legend);
    var chart = this.chart;
    legend.map(function (point) {
      chart.select('#' + point.id).attr('y', point.y);
    });
  };

  createTextNode(currentNode, attrs) {
    var newElement = document.createElementNS('http://www.w3.org/2000/svg', 'text'); //Create a path in SVG's namespace
    newElement.setAttribute('x', attrs.x);
    newElement.setAttribute('dy', attrs.dy);
    newElement.setAttribute('dy', attrs.dy);
    newElement.textContent = attrs.value;
    currentNode.parentNode.appendChild(newElement);
  }

  xAxisLineChartResetup (maxValue) {
    var tickLabels = this.chart.selectAll('.x-axis .tick-label')[0];
    var lastXDist = 0;
    var distBtnX = 0;
    var centerLabel = 0;
    var ydist = 0;

    if (tickLabels.length >= 2) {
      distBtnX = (tickLabels[1].x.baseVal[0].value) - (tickLabels[0].x.baseVal[0].value);
      centerLabel = distBtnX / 4;
    }
    tickLabels.forEach(function (item, index) {
      item.x.baseVal[0].value = item.x.baseVal[0].value - centerLabel;
    });

    //Determine whether the last year is an odd or even year
    var oddYear = ((maxValue % 2) === 1);

    tickLabels.forEach(function (item, index) {
      // get x value
      if (tickLabels.length - 1 !== index) {

        var itemX = item.x.baseVal[0].value;
        var nextItemX = tickLabels[index + 1].x.baseVal[0].value;

        // compute new nodes x value
        var Dx = (nextItemX - itemX) / 2;


        var x = itemX + Dx;

        //Assign the distance of the last item on the x-axis to lastXDist 
        lastXDist = nextItemX;

        var dy = item.getAttribute('dy');
        ydist = dy;
        createTextNode(item, {x: x, dy: dy, value: item.__data__ + 1});
      }
      //If the last node(year) is an odd year
      else if (tickLabels.length && oddYear) {
        //Get the distance of the last node (odd year) on the x-axis
        var xdist = lastXDist + (distBtnX / 2);
        createTextNode(item, {x: xdist, dy: ydist, value: maxValue});
      }

      // compute new nodes year value
      // add new node
    });
  }
}
