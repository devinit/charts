function vb_tree(svgSelector,config,csvDat) {
    var svg = d3.select(svgSelector);
    //Append style
    var cssText = ".tree-label{font-weight:bold;}",
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
    selectedColours= setDefault(config.colour.split(','),['#e84439']),
    xIndicator = setDefault(config.x_indicator,Object.keys(csvDat[0])[0]),
    yIndicator = setDefault(config.y_indicator,Object.keys(csvDat[0])[1]),
    cIndicator = setDefault(config.c_indicator,"None"),
    sort =  setDefault(config.sort,""),
    divisor = parseFloat(setDefault(config.unit_divisor,1)),
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
        d3.select("select[name='filter_selection']").selectAll("option").data(uniqueFilters)
          .enter()
          .append("option")
          .attr("value",function(d){return d})
          .text(function(d){return d})
          .property("selected",function(d){return d==selectedFilter?true:null;});
          
        var filteredData = csvDat.filter(function(d){return d[filter_by]==selectedFilter});
    };
    
    var sum = d3.sum(filteredData,function(d){return d[yIndicator]});
    
    if(cIndicator=="None"){
        var data = filteredData.map(function(d) { return {name: d[xIndicator], value: d[yIndicator]/divisor, colour: d[xIndicator], percent: d[yIndicator]/sum}; });
        var cType = "string";
    }else{
        var data = filteredData.map(function(d) { return {name: d[xIndicator], value: d[yIndicator]/divisor, colour: d[cIndicator], percent: d[yIndicator]/sum}; });
        var cType = columnType(data.map(function(d){return d.colour}));  
    };
    if(cType=="string"){
        var c = d3.scaleOrdinal().range(selectedColours);
        var cCategories = d3.map(data,function(d){return d[cIndicator]}).keys();
        c.domain(cCategories);  
    }else{
        var c = d3.scaleLinear().range(selectedColours.slice(0,2));
        var cRange = [d3.min(data,function(d){return d.colour}),d3.max(data,function(d){return d.colour})];
        c.domain(cRange);
    };
    
    //Now that data is filtered, let's sort it
    var xType = columnType(data.map(function(d){return d.name}));
    var yType = columnType(data.map(function(d){return d.value}));
    if (sort=="xasc") {
      if (xType=="string") {
        data.sort(function(a,b) {return d3.ascending(a.name,b.name);})
      }else{
        data.sort(function(a,b){return NaNSafeSort(a.name,b.name);})
      };
    }else if (sort=="xdes") {
      if (xType=="string") {
        data.sort(function(a,b) {return d3.descending(a.name,b.name);})
      }else{
        data.sort(function(a,b){return NaNSafeSort(b.name,a.name);})
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
    }else if (sort=="casc") {
      if (cType=="string") {
        data.sort(function(a,b) {return d3.ascending(a.colour,b.colour);})
      }else{
        data.sort(function(a,b){return NaNSafeSort(a.colour,b.colour);})
      };
    }else if (sort=="cdes") {
      if (cType=="string") {
        data.sort(function(a,b) {return d3.descending(a.colour,b.colour);})
      }else{
        data.sort(function(a,b){return NaNSafeSort(b.colour,a.colour);})
      };
    };
    
    var rootData = {};
    rootData.name = "root"
    rootData.children = data; 
    
    var root = d3.hierarchy(rootData)
        .eachBefore(function(d){d.data.id = d.data.name})
        .sum(function(d){return d.value})

    //Apply transformations not dependent on whether the chart exists or not
    svg.attr("width",svgWidth);
    svg.attr("height",svgHeight);

    if (svg_class=="charted") {
        //it's already charted, update it
        svg.select("style").text(cssText);
        var g = d3.select("g.padding_wrapper")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        d3.selectAll("g.cell").remove();
    }else{
        //it's not charted, chart it
        svg.append("style").text(cssText);
        svg.attr("class","charted");
        var g = svg.append("g").attr("class","padding_wrapper")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    };
    
     var treemap = d3.treemap()
        .tile(d3.treemapResquarify)
        .size([width, height])
        .round(true)
        .paddingInner(1);
        
    treemap(root);
    
    var cell = g.selectAll("g.cell")
        .data(root.leaves())
        .enter().append("g")
        .attr("class","cell")
        .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; });
    
    var rect = g.selectAll("g.cell")
      .data(root.leaves()).append("rect").attr("class","cell-rect")
      .attr("id", function(d) { return d.data.id; })
      .attr("width", function(d) { return d.x1 - d.x0; })
      .attr("height", function(d) { return d.y1 - d.y0; })
      .attr("fill", function(d) { return c(d.data.colour); });

    cell.append("clipPath").attr("class","cell-clip")
      .attr("id", function(d) { return "clip-" + d.data.id; })
    .append("use")
      .attr("xlink:href", function(d) { return "#" + d.data.id; });

    cell.append("text").attr("class","cell-text")
      .attr("clip-path", function(d) { return "url(#clip-" + d.data.id + ")"; })
      .style("font-size",labelFontSize)
      .attr("x", 4)
      .attr("y", labelFontSize)
      .text(function(d) { return d.data.name + " (" +Math.round(d.data.percent*100)+"%)"; })
      .attr("class","tree-label")
      .style("fill",function(d){return contrast(c(d.data.colour))})
      .each(function(d) {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1, // ems
            x = text.attr("x"),
            y = parseFloat(text.attr("y")),
            fontsize = parseFloat(text.style("font-size"))
            tspan = text.text(null).append("tspan").attr("x", x).attr("y", y);
        var wrapCounter = 0;
        while (word = words.pop()) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > (d.x1 - d.x0)) {
            wrapCounter += 1;
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan = text.append("tspan").attr("x",x).attr("y", y+(fontsize*wrapCounter)).text(word);
          }
        }
      });

    cell.append("title").attr("class","cell-title")
      .text(function(d) { return d.data.name + " (" +Math.round(d.data.percent*100)+"%)" + "\n" + format(d.value); });
    
};