export const columnType = function (arr) {
  var parsedArray = arr.map(function(d){return isNaN(parseFloat(d))});
  var arrAvg = d3.mean(parsedArray);
  if (arrAvg<=.5) {
    return("number");
  }else{
    return("string");
  }
};

export const NaNSafeSort = function (x,y){
  var a = parseFloat(x),
  b = parseFloat(y);
   if(!isFinite(a-b))
      return !isFinite(a) ? -1 : 1;
   else
      return a-b;
};

export const contrast = function (hex){
  var color = d3.color(hex);
  var lum = 0.2126*color.r + 0.7152*color.g + 0.0722*color.b;
  var contrast =  lum > 128 ? "black" : "white";
  return(contrast);
};

export const setDefault = function (test_value,default_value) {
    return(test_value===undefined?default_value:test_value)
};

export const form2config  = function(formSelector) {
    var config = {};
    var inputs = d3.select(formSelector).selectAll("input");
    var selects = d3.select(formSelector).selectAll("select");
    //Iterate through inputs
    inputs.each(function(){
      var input = d3.select(this),
      name = input.attr("name"),
      value = input.property("value");
      config[name] = value;
      });
    //Repeat, ensuring to overwrite duplicate names with checked values
    inputs.each(function(){
        var input = d3.select(this),
        name = input.attr("name"),
        value = input.property("value"),
        type = input.attr("type");
        if (type=="checkbox") {
            var checked = input.property("checked");
            if (checked) {
                config[name] = true;
            }else{
              config[name] = false;
            }
        }else if (type=="radio") {
            var checked = input.property("checked");
            if (checked) {
                config[name] = value;
            }
        }
    });
    
    //Iterate through selects
    selects.each(function(){
      var select = d3.select(this),
      name = select.attr("name"),
      option = select.select("option:checked");
      if (option.size()>0) {
        value = option.property("value");
        config[name] = value;
      }
    });
    
    return(config);
};

export const mergeWithFirstEqualZero = function (first, second){
    var secondSet = d3.set(); second.forEach(function(d) { secondSet.add(d.label); });

    var onlyFirst = first
        .filter(function(d){ return !secondSet.has(d.label) })
        .map(function(d) { return {label: d.label, value: 0}; });
    return d3.merge([ second, onlyFirst ])
        .sort(function(a,b) {
            return d3.ascending(a.label, b.label);
        });
};

export const wrap = function (text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
		fontsize = parseFloat(text.style("font-size"));
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", fontsize ).text(word);
      }
    }
  });
};

export const pointIsInArc =  function (pt, ptData, d3Arc) {
	// Center of the arc is assumed to be 0,0
	// (pt.x, pt.y) are assumed to be relative to the center
	var r1 = d3Arc.innerRadius()(ptData),
		r2 = d3Arc.outerRadius()(ptData),
		theta1 = d3Arc.startAngle()(ptData),
		theta2 = d3Arc.endAngle()(ptData);
	
	var dist = Math.sqrt(pt.x * pt.x + pt.y * pt.y),
		angle = Math.atan2(pt.x, -pt.y);
	
	angle = (angle < 0) ? (angle + Math.PI * 2) : angle;
		
	return (r1 * r1 <= dist) && (dist <= r2 * r2) && 
		   (theta1 <= angle) && (angle <= theta2);
};