function vb_bar(svgSelector,config,csvDat) {
    var svg = d3.select(svgSelector);
    //Parse configuration
    var svg_class = svg.attr("class"),
    svgWidth = parseFloat(setDefault(config.width,svg.attr("width"))),
    svgHeight = parseFloat(setDefault(config.height,svg.attr("height"))),
    pTop = parseFloat(setDefault(config.padding_top,100)),
    pRight = parseFloat(setDefault(config.padding_right,0)),
    pBottom = parseFloat(setDefault(config.padding_bottom,100)),
    pLeft = parseFloat(setDefault(config.padding_left,100)),
    xRotation = parseFloat(setDefault(config.x_text_rotation,45)),
    selectedColour = setDefault(config.colour,"#e84439"),
    xIndicator = setDefault(config.x_indicator,Object.keys(csvDat[0])[0]),
    yIndicator = setDefault(config.y_indicator,Object.keys(csvDat[0])[1]),
    sort =  setDefault(config.sort,""),
    labelsOnChart = setDefault(config.labels_on_chart,false),
    labelFontSize = setDefault(config.label_font_size,10),
    format_entry = setDefault(config.label_format,",.2f"),
    filter_by = setDefault(config.filter_by,"None"),
    selectedFilter = setDefault(config.filter_selection,null),
    margin = {top: pTop, right: pRight, bottom: pBottom, left: pLeft},
    width = +svgWidth - margin.left - margin.right,
    height = +svgHeight - margin.top - margin.bottom,
    x_label = setDefault(config.x_label,""),
    y_label = setDefault(config.y_label,""),
    xmaxauto = setDefault(config.x_maximum,"auto"),
    x_maximum_value = setDefault(config.x_maximum_value,1);
    
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
          
        var selectedFilter = uniquefilters[0];
          
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
    var y = d3.scaleBand().rangeRound([height,0]);
    var yCategories = d3.map(data,function(d){return d[yIndicator]}).keys();
    y.domain(yCategories);
    
    var x = d3.scaleLinear().rangeRound([0, width]);
    if (xmaxauto=="auto") {
      var xmax = d3.max(data, function(d) {return Number(d[xIndicator]); });
    }else{
      var xmax = parseFloat(x_maximum_value);
    };
    x.domain([0, xmax]);

    if (svg_class=="charted") {
        //it's already charted, update it
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
        yaxis = d3.select(".axis--y");
        
        yaxis.transition().duration(0).call(d3.axisLeft(y))
        xaxis.transition().duration(0).call(d3.axisBottom(x).tickFormat(format).tickSizeOuter(0))
        
        xaxis.attr("transform", "translate(0," + height + ")")
        xaxis.selectAll("text")
          .attr("transform", "rotate("+xRotation+")")
          .style("text-anchor", xRotation>0?"start":"middle");
        
    }else{
        //it's not charted, chart it
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
        
        
        var xaxis = g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).tickFormat(format).tickSizeOuter(0));
    
        var yaxis = g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y))

        xaxis.selectAll("text")
          .attr("transform", "rotate("+xRotation+")")
          .style("text-anchor", xRotation>0?"start":"middle");
    };
    //I think the bars and labels can be updated outside of state
      var bars = g.selectAll(".bar").data(data)
          .attr("class", "bar")
          .style("fill",selectedColour)
          .attr("x", 2)
          .attr("y", function(d) { return y(d[yIndicator]); })
          .attr("height", d3.max([(height/yCategories.length)-1,1]))
          .attr("width", function(d) { return x(d[xIndicator]); });
          
          bars.enter().append("rect")
          .attr("class", "bar")
          .style("fill",selectedColour)
          .attr("x", 2)
          .attr("y", function(d) { return y(d[yIndicator]); })
          .attr("height", d3.max([(height/yCategories.length)-1,1]))
          .attr("width", function(d) { return x(d[xIndicator]); });
          
        bars.exit().remove()
        
        var labels = g.selectAll(".label").data(data)
          .attr("class","label")
          .style("fill",contrast(selectedColour))
          .attr("text-anchor", "middle")
          .style("font-size",labelFontSize)
          .attr("x", function(d) { return x(d[xIndicator]/2) })
          .attr("y", function(d) { return y(d[yIndicator]) + d3.max([((height/yCategories.length)-1)/2,1]); })
          .text(function(d){return format(d[xIndicator])});
          
          if (labelsOnChart) {
            labels.enter().append("text")
            .attr("class","label")
            .style("fill",contrast(selectedColour))
            .attr("text-anchor", "middle")
            .style("font-size",labelFontSize)
            .attr("x", function(d) { return x(d[xIndicator]/2) })
            .attr("y", function(d) { return y(d[yIndicator]) + d3.max([((height/yCategories.length)-1)/2,1]); })
            .text(function(d){return format(d[xIndicator])});
            
            labels.exit().remove();
          }else{
            labels.remove();
          };
};