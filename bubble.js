function vb_bubble(svgSelector,config,csvDat) {
    var svg = d3.select(svgSelector);
    //Append style
    var cssText = ".axis--y .tick line, .axis--x .tick line {display:none;}.tick text {color:#a9a6aa;}.axis--y .domain {display:none;}.domain {stroke:#443e42;}.rules .tick line {stroke:#a9a6aa;}.rules .domain {display:none;}#yaxislabel {color:#443e42;}#xaxislabel {color:#443e42;}#visTitle {color:#e84439;}.legend text {color:#443e42;}.axis text{font-size:10px;}",
    cssInjection = setDefault(config.inject_css,"");
    cssText = cssText+cssInjection;
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
    divisor = parseFloat(setDefault(config.unit_divisor,1)),
    legend_position = setDefault(config.legend_position,"tl"),
    zIndicator = setDefault(config.z_indicator,"None"),
    cIndicator = setDefault(config.c_indicator,"None"),
    bubbleMin = setDefault(config.bubble_minimum,0),
    bubbleMax = setDefault(config.bubble_maximum,20);

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
    
    //Now that data is filtered, let's sort it
    var xType = columnType(data.map(function(d){return d[xIndicator]}));
    var yType = columnType(data.map(function(d){return d[yIndicator]}));               
    if (sort=="xasc") {
      if (xType=="string") {
        data.sort(function(a,b) {return d3.ascending(a[xIndicator],b[xIndicator]);})
      }else{
        data.sort(function(a,b){return NaNSafeSort(a[xIndicator],b[xIndicator]);})
      };
    }else if (sort=="xdes") {
      if (xType=="string") {
        data.sort(function(a,b) {return d3.descending(a[xIndicator],b[xIndicator]);})
      }else{
        data.sort(function(a,b){return NaNSafeSort(b[xIndicator],a[xIndicator]);})
      };
    }else if (sort=="yasc") {
      if (yType=="string") {
        data.sort(function(a,b) {return d3.ascending(a[yIndicator],b[yIndicator]);})
      }else{
        data.sort(function(a,b){return NaNSafeSort(a[yIndicator],b[yIndicator]);})
      };
    }else if (sort=="ydes") {
      if (yType=="string") {
        data.sort(function(a,b) {return d3.descending(a[yIndicator],b[yIndicator]);})
      }else{
        data.sort(function(a,b){return NaNSafeSort(b[yIndicator],a[yIndicator]);})
      };
    };

    //Apply transformations not dependent on whether the chart exists or not
    svg.attr("width",svgWidth);
    svg.attr("height",svgHeight);
    
    //Axes can be handled before charted or not
    var x = d3.scaleBand().rangeRound([0, width]);
    var xCategories = d3.map(data,function(d){return d[xIndicator]}).keys();
    x.domain(xCategories);
    
    var y = d3.scaleLinear().rangeRound([height, 0]);
    if (ymaxauto=="auto") {
      var ymax = d3.max(data, function(d) {return Number(d[yIndicator]); });
    }else{
      var ymax = parseFloat(y_maximum_value);
    };
    y.domain([0, ymax]);
    
    var z = d3.scaleLinear().rangeRound([bubbleMin, bubbleMax]);
    if(zIndicator!="None"){
        var zmax = d3.max(data, function(d) {return Number(d[zIndicator]); });
        z.domain([0, zmax]);
    };
    
    var c = d3.scaleOrdinal().range(selectedColours);
    if(cIndicator=="None"){
        var cCategories = [];
    }else{
        var cCategories = d3.map(data,function(d){return d[cIndicator]}).keys();
        c.domain(cCategories);  
    };

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
    
    var bubbles = g.selectAll(".bubble").data(data);
        
    bubbles.transition().duration(1000).attr("class", "bubble")
          .style("fill",function(d){return c(d[cIndicator])})
          .style("stroke",function(d){return d3.color(c(d[cIndicator])).darker()})
          .style("stroke-width","1px")
          .attr("cx", function(d) { return x(d[xIndicator]) + x.bandwidth()/2; })
          .attr("cy", function(d) { return y(d[yIndicator]); })
          .attr("r", function(d) { return d3.max([z(d[zIndicator]),bubbleMin]); });
    bubbles.enter().append("circle")
          .attr("class", "bubble")
          .style("fill",function(d){return c(d[cIndicator])})
          .style("stroke",function(d){return d3.color(c(d[cIndicator])).darker()})
          .style("stroke-width","1px")
          .attr("cx", function(d) { return x(d[xIndicator]) + x.bandwidth()/2; })
          .attr("cy", function(d) { return y(d[yIndicator]); })
          .attr("r", function(d) { return d3.max([z(d[zIndicator]),bubbleMin]); });
          
    bubbles.exit().transition().attr("r",0).duration(1000).remove()

            
    var legend = svg.append("g").attr("class","legend")
        .attr("font-size", 14)
        .attr("text-anchor", legend_position=="tr"?"end":"start")
        .selectAll(".group")
        .data(cCategories)
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