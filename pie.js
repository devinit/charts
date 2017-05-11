function vb_pie(svgSelector,config,csvDat) {
    var svg = d3.select(svgSelector);
    //Append style
    var cssText = "path.slice{stroke-width:2px;stroke: #fff;}polyline{opacity: 1;stroke: #a9a6aa;stroke-width: 2px;fill: none;}";
    svg.append("style").text(cssText);
    //Parse configuration
    var svg_class = svg.attr("class"),
    svgWidth = parseFloat(setDefault(config.width,svg.attr("width"))),
    svgHeight = parseFloat(setDefault(config.height,svg.attr("height"))),
    pTop = parseFloat(setDefault(config.padding_top,100)),
    pRight = parseFloat(setDefault(config.padding_right,0)),
    pBottom = parseFloat(setDefault(config.padding_bottom,100)),
    pLeft = parseFloat(setDefault(config.padding_left,100)),
    selectedColours= setDefault(config.colour.split(','),['#e84439']),
    xIndicator = setDefault(config.x_indicator,Object.keys(csvDat[0])[0]),
    yIndicator = setDefault(config.y_indicator,Object.keys(csvDat[0])[1]),
    sort =  setDefault(config.sort,""),
    labelFontSize = setDefault(config.label_font_size,10),
    format_entry = setDefault(config.label_format,",.2f"),
    filter_by = setDefault(config.filter_by,"None"),
    selectedFilter = setDefault(config.filter_selection,null),
    margin = {top: pTop, right: pRight, bottom: pBottom, left: pLeft},
    width = +svgWidth - margin.left - margin.right,
    height = +svgHeight - margin.top - margin.bottom;
    
    try{
        var format = d3.format(format_entry); 
    }catch(err){
        var format = d3.format(",.2f");
        $('#id_label_format').value(",.2f");
    };
    
    if (filter_by=="None") {
        //Nothing to filter by, filteredData is csvDat
        var filteredData = csvDat;
        d3.select("select[name='filter_selection']").selectAll("option").remove();
    }else if(selectedFilter===null){
        d3.select("select[name='filter_selection']").selectAll("option").remove();
        var uniqueFilters = d3.map(csvDat,function(d){return d[filter_by]}).keys();
        d3.select("select[name='filter_selection']").selectAll("option").filteredData(uniqueFilters)
          .enter()
          .append("option")
          .attr("value",function(d){return d})
          .text(function(d){return d});
          
        var selectedFilter = uniqueFilters[0];
          
        var filteredData = csvDat.filter(function(d){return d[filter_by]==selectedFilter});
    }else{
        //Filter by selected filter
        d3.select("select[name='filter_selection']").selectAll("option").remove();
        var uniqueFilters = d3.map(csvDat,function(d){return d[filter_by]}).keys();
        d3.select("select[name='filter_selection']").selectAll("option").filteredData(uniqueFilters)
          .enter()
          .append("option")
          .attr("value",function(d){return d})
          .text(function(d){return d})
          .property("selected",function(d){return d==selectedFilter?true:null;});
          
        var filteredData = csvDat.filter(function(d){return d[filter_by]==selectedFilter});
    };
    
    var data = filteredData.map(function(d) { return {label: d[xIndicator], value: d[yIndicator]}; });
    
    //Now that data is filtered, let's sort it
    var xType = columnType(data.map(function(d){return d.label}));
    var yType = columnType(data.map(function(d){return d.value}));               
    if (sort=="xasc") {
      if (xType=="string") {
        data.sort(function(a,b) {return d3.ascending(a.label,b.label);})
      }else{
        data.sort(function(a,b){return NaNSafeSort(a.label,b.label);})
      };
    }else if (sort=="xdes") {
      if (xType=="string") {
        data.sort(function(a,b) {return d3.descending(a.label,b.label);})
      }else{
        data.sort(function(a,b){return NaNSafeSort(b.label,a.label);})
      };
    }else if (sort=="yasc") {
      if (yType=="string") {
        data.sort(function(a,b) {return d3.ascending(a.value,b.value);})
      }else{
        data.sort(function(a,b){return NaNSafeSort(a.value,b.value);})
      };
    }else if (sort=="ydes") {
      if (yType=="string") {
        data.sort(function(a,b) {return d3.descending(a.value,b.value);})
      }else{
        data.sort(function(a,b){return NaNSafeSort(b.value,a.value);})
      };
    }else if (sort=="avoid") {
      if (yType=="string") {
        data.sort(function(a,b) {return d3.descending(a.value,b.value);})
        var fullIndex = data.length,
        halfIndex = Math.round(fullIndex/2),
        half = data.splice(halfIndex,fullIndex);
        half.reverse();
        for(var i = 0; i < half.length; i++){
            data.splice((2*i)+1, 0, half[i]);
        };
      }else{
        data.sort(function(a,b){return NaNSafeSort(b.value,a.value);});
        var fullIndex = data.length,
        halfIndex = Math.round(fullIndex/2),
        half = data.splice(halfIndex,fullIndex);
        half.reverse();
        for(var i = 0; i < half.length; i++){
            data.splice((2*i)+1, 0, half[i]);
        };
      };
    };

    //Apply transformations not dependent on whether the chart exists or not
    svg.attr("width",svgWidth);
    svg.attr("height",svgHeight);
    
    //radius can be handled before charted or not
    var xCategories = csvDat.map(function(d){return d[xIndicator]});
    var radius = Math.min(width, height) / 2;
    var sum = d3.sum(data,function(d){return d.value});
    var pie = d3.pie()
	.sort(null)
	.value(function(d) {
		return d.value;
	});
    
    var arc = d3.arc()
	.outerRadius(radius * 0.8)
	.innerRadius(radius * 0);

    var outerArc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);
		
	function textInArc(d,i,elem) {
		if(typeof this.getBBox==='function'){
			var bb = this.getBBox();
		}else{
			var bb = elem.getBBox();
		}
		var center = arc.centroid(d);
			
		var topLeft = {
		  x : center[0] + bb.x,
		  y : center[1] + bb.y
		};
		
		var topRight = {
		  x : topLeft.x + bb.width,
		  y : topLeft.y
		};
		
		var bottomLeft = {
		  x : topLeft.x,
		  y : topLeft.y + bb.height
		};
		
		var bottomRight = {
		  x : topLeft.x + bb.width,
		  y : topLeft.y + bb.height
		};
		d.visible = pointIsInArc(topLeft, d, arc) &&
					pointIsInArc(topRight, d, arc) &&
					pointIsInArc(bottomLeft, d, arc) &&
					pointIsInArc(bottomRight, d, arc);
	};
    
    var key = function(d){ return d.data.label; };
    var color = d3.scaleOrdinal().domain(xCategories).range(selectedColours);
    var data0 = svg.select(".slices").selectAll("path.slice")
        .data().map(function(d) { return d.data });
    if (data0.length == 0) data0 = data;
    var was = mergeWithFirstEqualZero(data, data0);
    var is = mergeWithFirstEqualZero(data0, data);

    if (svg_class=="charted") {
        var duration = 200;
        //it's already charted, update it
        var g = d3.select("g.padding_wrapper")
            .attr("transform", "translate(" + (margin.left+(width/2)) + "," + (margin.top+(height/2)) + ")")
            
    }else{
        var duration = 0;
        //it's not charted, chart it
        svg.attr("class","charted");
        var g = svg.append("g").attr("class","padding_wrapper")
            .attr("transform", "translate(" + (margin.left+(width/2)) + "," + (margin.top+(height/2)) + ")")
        g.append("g")
            .attr("class", "slices");
        g.append("g")
            .attr("class", "labels");
        g.append("g")
            .attr("class", "olabels");
        g.append("g")
            .attr("class", "lines");
    };
    //I think the slices and labels can be updated outside of state
    /* ------- SLICE ARCS -------*/
  
      var slice = svg.select(".slices").selectAll("path.slice")
          .data(pie(was), key);
  
      slice.enter()
          .insert("path")
          .attr("class", "slice")
          .style("fill", function(d) { return color(d.data.label); })
          .each(function(d) {
              this._current = d;
          });
  
      slice = svg.select(".slices").selectAll("path.slice")
          .data(pie(is), key);
  
      slice		
          .transition().duration(duration)
          .style("fill", function(d) { return color(d.data.label); })
          .attrTween("d", function(d) {
              var interpolate = d3.interpolate(this._current, d);
              var _this = this;
              return function(t) {
                  _this._current = interpolate(t);
                  return arc(_this._current);
              };
          });
  
      slice = svg.select(".slices").selectAll("path.slice")
          .data(pie(data), key);
  
      slice
          .exit().transition().delay(duration).duration(0)
          .remove();
  
      /* ------- INNER TEXT LABELS -------*/
	  
	  var text = svg.select(".labels").selectAll("text")
          .data(pie(was), key);
  
      text.enter()
          .append("text")
          .attr("dy", ".35em")
		  .style('opacity', 0)
          .style("font-size",labelFontSize)
		  .style("fill",function(d) { return contrast(color(d.data.label)); })
          .each(function(d) {
              this._current = d;
          }).text(function(d) {
			return d.data.label + " ("+format(d.value/sum)+")";
		  });

      text = svg.select(".labels").selectAll("text")
          .data(pie(is), key);
		text.transition().duration(duration)
          .style("font-size",labelFontSize)
          .attrTween("transform", function(d) {
              var interpolate = d3.interpolate(this._current, d);
              var _this = this;
              return function(t) {
                  var d2 = interpolate(t);
                  _this._current = d2;
                  var pos = arc.centroid(d2);
                  return "translate("+ pos +")";
              };
          })
		  .style("text-anchor","middle")
		  .on('end',function(d,i){
			var text = d3.select(this);
			text.text(d.data.label + " ("+format(d.value/sum)+")");
			var words = text.text().split(/\s+/).reverse(),
				word,
				line = [],
				lineNumber = 0,
				lineHeight = 1, // ems
				y = text.attr("y"),
				dy = parseFloat(text.attr("dy")),
				fontsize = parseFloat(text.style("font-size"))
				tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
			while (word = words.pop()) {
			  line.push(word);
			  tspan.text(line.join(" "));
			  if (tspan.node().getComputedTextLength() > radius/2) {
				line.pop();
				tspan.text(line.join(" "));
				line = [word];
				tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", fontsize ).text(word);
			  }
			}
			textInArc(d,i,this)
			text.style('opacity', function (d) { return d.visible ? 1 : 0; })
			});
      
      text = svg.select(".labels").selectAll("text")
          .data(pie(data), key);

      text
          .exit().transition().delay(duration)
          .remove();
		  
	  /* ------- OUTER TEXT LABELS -------*/
	  
	  	var otext = svg.select(".olabels").selectAll("text")
		.data(pie(was), key);
	
		otext.enter()
			.append("text")
			.attr("dy", ".35em")
			.style("font-size",labelFontSize)
			.style("opacity", 0)
			.text(function(d) {
				return d.data.label + " ("+format(d.value/sum)+")"
			})
			.each(function(d) {
				this._current = d;
			});
		
		function midAngle(d){
			return d.startAngle + (d.endAngle - d.startAngle)/2;
		}
	
		otext = svg.select(".olabels").selectAll("text")
			.data(pie(is), key);
	
		otext.transition().duration(duration)
		.text(function(d) {
				return d.data.label + " ("+format(d.value/sum)+")"
			})
		.style("font-size",labelFontSize)
			.attrTween("transform", function(d) {
				var interpolate = d3.interpolate(this._current, d);
				var _this = this;
				return function(t) {
					var d2 = interpolate(t);
					_this._current = d2;
					var pos = outerArc.centroid(d2);
					pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
					return "translate("+ pos +")";
				};
			})
			.styleTween("text-anchor", function(d){
				var interpolate = d3.interpolate(this._current, d);
				return function(t) {
					var d2 = interpolate(t);
					return midAngle(d2) < Math.PI ? "start":"end";
				};
			}).on('end',function(d,i){
			var visible = d3.select(".labels").selectAll("text").filter(function(textDat){return textDat.index==d.index}).data()[0].visible;
			d3.select(this).style("opacity",visible?0:1);
			var text = d3.select(this),
				words = text.text().split(/\s+/).reverse(),
				word,
				line = [],
				lineNumber = 0,
				lineHeight = 1, // ems
				y = text.attr("y"),
				dy = parseFloat(text.attr("dy")),
				fontsize = parseFloat(text.style("font-size"))
				tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
			while (word = words.pop()) {
			  line.push(word);
			  tspan.text(line.join(" "));
			  if (tspan.node().getComputedTextLength() > radius/2) {
				line.pop();
				tspan.text(line.join(" "));
				line = [word];
				tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", fontsize ).text(word);
			  }
			}
			});
		
		otext = svg.select(".olabels").selectAll("text")
			.data(pie(data), key);
	
		otext
			.exit().transition().delay(duration)
			.remove();
	  
      /* ------- SLICE TO TEXT POLYLINES -------*/
  
      var polyline = svg.select(".lines").selectAll("polyline")
          .data(pie(was), key);
      
      polyline.enter()
          .append("polyline")
          .style("opacity", 0)
          .each(function(d) {
              this._current = d;
          });
  
      polyline = svg.select(".lines").selectAll("polyline")
          .data(pie(is), key);
      
      polyline.transition().duration(duration)
          .attrTween("points", function(d){
              this._current = this._current;
              var interpolate = d3.interpolate(this._current, d);
              var _this = this;
              return function(t) {
                  var d2 = interpolate(t);
                  _this._current = d2;
                  var pos = outerArc.centroid(d2);
                  pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                  return [arc.centroid(d2), outerArc.centroid(d2), pos];
              };			
          })
		  .on('end',function(d,i){
			var visible = d3.select(".labels").selectAll("text").filter(function(textDat){return textDat.index==d.index}).data()[0].visible;
			d3.select(this).style("opacity",visible?0:1)
			});
      
      polyline = svg.select(".lines").selectAll("polyline")
          .data(pie(data), key);
		  
      
      polyline
          .exit().transition().delay(duration)
          .remove();
     
};