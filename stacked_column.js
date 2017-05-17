function vb_stacked_column(svgSelector,config,csvDat) {
    var svg = d3.select(svgSelector);
    //Append style
    var cssText = ".axis--y .tick line, .axis--x .tick line {display:none;}.tick text {color:#a9a6aa;}.axis--y .domain {display:none;}.domain {stroke:#443e42;}.rules .tick line {stroke:#a9a6aa;}.rules .domain {display:none;}#yaxislabel {color:#443e42;}#xaxislabel {color:#443e42;}#visTitle {color:#e84439;}.legend text {color:#443e42;}.axis text{font-size:14px;}";
    //Parse configuration
    var svg_class = svg.attr("class"),
    svgWidth = parseFloat(setDefault(config.width,svg.attr("width"))),
    svgHeight = parseFloat(setDefault(config.height,svg.attr("height"))),
    pTop = parseFloat(setDefault(config.padding_top,100)),
    pRight = parseFloat(setDefault(config.padding_right,0)),
    pBottom = parseFloat(setDefault(config.padding_bottom,100)),
    pLeft = parseFloat(setDefault(config.padding_left,100)),
    xRotation = parseFloat(setDefault(config.x_text_rotation,45)),
    selectedColours= setDefault(config.colour.split(','),['#e84439']),
    xIndicator = setDefault(config.x_indicator,Object.keys(csvDat[0])[0]),
    yIndicator = setDefault(config.y_indicator,Object.keys(csvDat[0])[1]),
    sort =  setDefault(config.sort,""),
    labelsOnChart = setDefault(config.labels_on_chart,false),
    labelFontSize = setDefault(config.label_font_size,10),
    format_entry = setDefault(config.label_format,",.2f"),
    y_axis_ticks = parseFloat(setDefault(config.y_axis_ticks,"")),
    filter_by = setDefault(config.filter_by,"None"),
    selectedFilter = setDefault(config.filter_selection,null),
    margin = {top: pTop, right: pRight, bottom: pBottom, left: pLeft},
    width = +svgWidth - margin.left - margin.right,
    height = +svgHeight - margin.top - margin.bottom,
    x_label = setDefault(config.x_label,""),
    y_label = setDefault(config.y_label,""),
    ymaxauto = setDefault(config.y_maximum,"auto"),
    y_maximum_value = setDefault(config.y_maximum_value,1),
    groupBy = setDefault(config.group_by,""),
    divisor = parseFloat(setDefault(config.unit_divisor,1)),
    legend_position = setDefault(config.legend_position,"tl");

    try{
        var format = d3.format(format_entry); 
    }catch(err){
        var format = d3.format(",.2f");
        $('#id_label_format').value(",.2f");
    };
    
    if (filter_by=="None") {
        //Nothing to filter by, data is csvDat
        var data = csvDat;
        d3.select("select[name='filter_selection']").selectAll("option").remove();
    }else if(selectedFilter===null){
        d3.select("select[name='filter_selection']").selectAll("option").remove();
        var uniqueFilters = d3.map(csvDat,function(d){return d[filter_by]}).keys();
        d3.select("select[name='filter_selection']").selectAll("option").data(uniqueFilters)
          .enter()
          .append("option")
          .attr("value",function(d){return d})
          .text(function(d){return d});
          
        var selectedFilter = uniqueFilters[0];
          
        var data = csvDat.filter(function(d){return d[filter_by]==selectedFilter});
    }else{
        //Filter by selected filter
        d3.select("select[name='filter_selection']").selectAll("option").remove();
        var uniqueFilters = d3.map(csvDat,function(d){return d[filter_by]}).keys();
        d3.select("select[name='filter_selection']").selectAll("option").data(uniqueFilters)
          .enter()
          .append("option")
          .attr("value",function(d){return d})
          .text(function(d){return d})
          .property("selected",function(d){return d==selectedFilter?true:null;});
          
        var data = csvDat.filter(function(d){return d[filter_by]==selectedFilter});
    };
    
    //After filter, apply grouping function
    var nestedData = d3.nest()
      .key(function(d)
      {
        return d[xIndicator];
      })
      .entries(data);
    
    var groupedData = [];
    var keyObj = {};
    for(var i = 0; i < nestedData.length; i++){
      var keyEntry = nestedData[i];
      var obj = {};
      var total = 0;
      obj[xIndicator] = keyEntry.key;
      for(var j = 0; j < keyEntry.values.length; j++){
        var keyValue = keyEntry.values[j];
        obj[keyValue[groupBy]] = parseFloat(keyValue[yIndicator])/divisor;
        keyObj[keyValue[groupBy]] = true;
        if (!isNaN(parseFloat(keyValue[yIndicator]))) {
            total+= parseFloat(keyValue[yIndicator])/divisor;
        };
      };
      obj.total = total;
      groupedData.push(obj);
    };
    var keys = Object.keys(keyObj);
    for(var i = 0; i < groupedData.length; i++){
      for(key in keyObj){
        if (groupedData[i][key] === undefined) {
            groupedData[i][key] = 0;
        };
      };
    };
    
    var c = d3.scaleOrdinal().domain(keys).range(selectedColours);
    
    //Now that data is filtered, let's sort it
    var xType = columnType(groupedData.map(function(d){return d[xIndicator]}));
    var yType = columnType(groupedData.map(function(d){return d.total}));               
    if (sort=="xasc") {
      if (xType=="string") {
        groupedData.sort(function(a,b) {return d3.ascending(a[xIndicator],b[xIndicator]);})
      }else{
        groupedData.sort(function(a,b){return NaNSafeSort(a[xIndicator],b[xIndicator]);})
      };
    }else if (sort=="xdes") {
      if (xType=="string") {
        groupedData.sort(function(a,b) {return d3.descending(a[xIndicator],b[xIndicator]);})
      }else{
        groupedData.sort(function(a,b){return NaNSafeSort(b[xIndicator],a[xIndicator]);})
      };
    }else if (sort=="yasc") {
      if (yType=="string") {
        groupedData.sort(function(a,b) {return d3.ascending(a[yIndicator],b[yIndicator]);})
      }else{
        groupedData.sort(function(a,b){return NaNSafeSort(a[yIndicator],b[yIndicator]);})
      };
    }else if (sort=="ydes") {
      if (yType=="string") {
        groupedData.sort(function(a,b) {return d3.descending(a[yIndicator],b[yIndicator]);})
      }else{
        groupedData.sort(function(a,b){return NaNSafeSort(b[yIndicator],a[yIndicator]);})
      };
    };

    //Apply transformations not dependent on whether the chart exists or not
    svg.attr("width",svgWidth);
    svg.attr("height",svgHeight);
    
    //Axes can be handled before charted or not
    var x = d3.scaleBand().rangeRound([0, width]);
    var xCategories = d3.map(groupedData,function(d){return d[xIndicator]}).keys();
    x.domain(xCategories);
    
    var y = d3.scaleLinear().rangeRound([height, 0]);
    if (ymaxauto=="auto") {
      var ymax = d3.max(groupedData, function(d) {return Number(d.total); });
    }else{
      var ymax = parseFloat(y_maximum_value);
    };
    y.domain([0, ymax]);

    if (svg_class=="charted") {
        //it's already charted, update it
        svg.select("style").text(cssText);
        
        d3.selectAll('.legend').remove();
        
        var g = d3.select("g.padding_wrapper")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            
        var x_axis_label = d3.select("text#xaxislabel")
            .text(x_label==""?xIndicator:x_label)
            .attr("x",(svgWidth-$('#xaxislabel').width()+margin.left-margin.right)/2)
            .attr("y",svgHeight-$('#xaxislabel').height());
            
        var y_axis_label = d3.select("text#yaxislabel")
            .text(y_label==""?yIndicator:y_label)
            .attr("transform","rotate(-90)")
            .attr("y",$('#yaxislabel').width())
            .attr("x",-1*((svgHeight+$('#yaxislabel').height()-margin.bottom+margin.top)/2));
            
        var xaxis = d3.select(".axis--x"),
        yaxis = d3.select(".axis--y"),
        rules = d3.select(".rules");
        if (y_axis_ticks!=""  && !isNaN(y_axis_ticks)) {
          var y_ticks = parseInt(y_axis_ticks);
          rules.call(d3.axisLeft(y)
            .tickSize(-width)
            .ticks(y_ticks)
            .tickFormat("")
          )
          yaxis.transition().duration(0).call(d3.axisLeft(y).ticks(y_ticks).tickFormat(format))
        }else{
          rules.call(d3.axisLeft(y)
            .tickSize(-width)
            .tickFormat("")
          )
          yaxis.transition().duration(0).call(d3.axisLeft(y).tickFormat(format))
        };
        xaxis.transition().duration(0).call(d3.axisBottom(x).tickSizeOuter(0))
        xaxis.attr("transform", "translate(0," + height + ")")
        xaxis.selectAll("text")
          .attr("transform", "rotate("+xRotation+")")
          .style("text-anchor", xRotation>0?"start":"middle");
        
    }else{
        //it's not charted, chart it
        svg.append("style").text(cssText);
        svg.attr("class","charted");
        var g = svg.append("g").attr("class","padding_wrapper")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            
        var x_axis_label = svg.append("text").attr("id","xaxislabel")
            .text(x_label==""?xIndicator:x_label)
            .attr("x",(svgWidth-$('#xaxislabel').width()+margin.left-margin.right)/2)
            .attr("y",svgHeight-$('#xaxislabel').height());
        
        var y_axis_label = svg.append("text").attr("id","yaxislabel")
            .text(y_label==""?yIndicator:y_label)
            .attr("transform","rotate(-90)")
            .attr("y",$('#yaxislabel').width())
            .attr("x",-1*((svgHeight+$('#yaxislabel').height()-margin.bottom+margin.top)/2));
        
        if (y_axis_ticks!=""  && !isNaN(y_axis_ticks)) {
            var y_ticks = parseInt(y_axis_ticks);
            var rules = g.append("g")			
            .attr("class", "rules")
            .call(d3.axisLeft(y)
                .tickSize(-width)
                .ticks(y_ticks)
                .tickFormat("")
            );
            var yaxis = g.append("g")
              .attr("class", "axis axis--y")
              .call(d3.axisLeft(y).ticks(y_ticks).tickFormat(format));
          }else{
            var rules = g.append("g")			
            .attr("class", "rules")
            .call(d3.axisLeft(y)
                .tickSize(-width)
                .tickFormat("")
            );
            var yaxis = g.append("g")
              .attr("class", "axis axis--y")
              .call(d3.axisLeft(y).tickFormat(format));
          };
          
        var xaxis = g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickSizeOuter(0));
        xaxis.selectAll("text")
          .attr("transform", "rotate("+xRotation+")")
          .style("text-anchor", xRotation>0?"start":"middle");
    };
    //I think the bars and labels can be updated outside of state
     var stackData = d3.stack().keys(keys)(groupedData);
    
    var groups = g.selectAll(".group").data(stackData)
      .attr("class","group")
      .attr("fill",function(d){return c(d.key)});
      
    groups.enter().append("g")
      .attr("class","group")
      .attr("fill",function(d){return c(d.key)});
      
    groups.exit().remove();
    
    var groupLabels = g.selectAll(".groupLabel")
    .data(
      stackData[stackData.length-1].map(function(d){return {"y":d[d.length-1],"x":d.data[xIndicator]}})
    )
      .style("font-size",labelFontSize)
      .attr("x", function(d) { return x(d.x) + 2 + (d3.max([(width/xCategories.length)-1,1]))/2 })
      .attr("y", function(d) { return y(d.y) - labelFontSize/2 })
      .text(function(d){return format(d.y)})
      .style("opacity",function(d){return (d.y) > 0 ? 1 : 0 })
      .attr("class","groupLabel")
      .attr("fill","black")
      .attr("text-anchor", "middle");
      
      if (labelsOnChart) {
      groupLabels.enter().append("text")
      .style("font-size",labelFontSize)
      .attr("x", function(d) { return x(d.x) + 2 + (d3.max([(width/xCategories.length)-1,1]))/2 })
      .attr("y", function(d) { return y(d.y) - labelFontSize/2 })
      .text(function(d){return format(d.y)})
      .style("opacity",function(d){return (d.y) > 0 ? 1 : 0 })
      .attr("class","groupLabel")
      .attr("fill","black")
      .attr("text-anchor", "middle");
      }else{
        groupLabels.remove();
      };
      
      groupLabels.exit().remove();
      
    var bars = g.selectAll(".group").data(stackData).selectAll(".bar").data(function(d){return d;})
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.data[xIndicator]) + 2 + (width/xCategories.length)*(1/6); })
      .attr("y", function(d) { return y(d[1]); })
      .attr("width", d3.max([(width/xCategories.length)*(2/3),1]))
      .attr("height", function(d) { return y(d[0]) - y(d[1]); });
      
      bars.enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.data[xIndicator]) + 2 + (width/xCategories.length)*(1/6); })
      .attr("y", function(d) { return y(d[1]); })
      .attr("width", d3.max([(width/xCategories.length)*(2/3),1]))
      .attr("height", function(d) { return y(d[0]) - y(d[1]); });
      
    bars.exit().remove()
    
    var labels = g.selectAll(".group").data(stackData).selectAll(".label").data(function(d){return d;})
      .attr("class","label")
      .style("fill",function(d,i,j){return contrast(d3.select(j[i].parentNode).attr("fill"))})
      .attr("text-anchor", "middle")
      .style("font-size",labelFontSize)
      .attr("x", function(d) { return x(d.data[xIndicator]) + 2 + (d3.max([(width/xCategories.length)-1,1]))/2 })
      .attr("y", function(d) { return y(d[1]) + (y(d[0]) - y(d[1]))/2 + labelFontSize/2; })
      .text(function(d){return format(d[1] - d[0])})
      .each(function(d,i) {
          var bbox = this.getBBox();
          var barHeight = y(d[0]) - y(d[1]);
          d.unsquished =  barHeight > bbox.height;
          })
        .style("opacity",function(d){return (d[1] - d[0]) > 0 && d.unsquished ? 1 : 0 });
      
      if (labelsOnChart) {
        labels.enter().append("text")
        .attr("class","label")
        .style("fill",function(d,i,j){return contrast(d3.select(j[i].parentNode).attr("fill"))})
        .attr("text-anchor", "middle")
        .style("font-size",labelFontSize)
        .attr("x", function(d) { return x(d.data[xIndicator]) + 2 + (d3.max([(width/xCategories.length)-1,1]))/2 })
        .attr("y", function(d) { return y(d[1]) + (y(d[0]) - y(d[1]))/2 + labelFontSize/2; })
        .text(function(d){return format(d[1] - d[0])})
        .each(function(d,i) {
          var bbox = this.getBBox();
          var barHeight = y(d[0]) - y(d[1]);
          d.unsquished =  barHeight > bbox.height;
          })
        .style("opacity",function(d){return (d[1] - d[0]) > 0 && d.unsquished ? 1 : 0 });
        
        labels.exit().remove();
      }else{
        labels.remove();
      };
            
    var legend = svg.append("g").attr("class","legend")
        .attr("font-size", 14)
        .attr("text-anchor", legend_position=="tr"?"end":"start")
        .selectAll(".group")
        .data(keys.slice().reverse())
        .enter().append("g")
        .attr("transform", function(d, i) {
          if (legend_position=="tr" || legend_position=="tl") {
            return "translate("+margin.left+"," + i * 20 + ")";
          }
          if (legend_position=="cr") {
            return "translate("+(svgWidth-margin.right+20)+"," + (svgHeight/2 - (i * 20)) + ")";
          }
        });
  
    legend.append("rect")
        .attr("x", legend_position=="tr"?width-19:0)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", c);
  
    legend.append("text")
        .attr("x", legend_position=="tr"?width-20:20)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function(d) { return d; });
};