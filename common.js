function columnType(arr) {
  var parsedArray = arr.map(function(d){return isNaN(parseFloat(d))});
  var arrAvg = d3.mean(parsedArray);
  if (arrAvg<=.5) {
    return("number");
  }else{
    return("string");
  };
};

function NaNSafeSort(x,y){
  var a = parseFloat(x),
  b = parseFloat(y);
   if(!isFinite(a-b))
      return !isFinite(a) ? -1 : 1;
   else
      return a-b;
};  
function contrast(hex){
  var color = d3.color(hex);
  var lum = 0.2126*color.r + 0.7152*color.g + 0.0722*color.b;
  var contrast =  lum > 128 ? "black" : "white";
  return(contrast);
};

function setDefault(test_value,default_value) {
    return(test_value===undefined?default_value:test_value)
};

function form2config(formSelector) {
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
            };
        }else if (type=="radio") {
            var checked = input.property("checked");
            if (checked) {
                config[name] = value;
            }
        };
    });
    
    //Iterate through selects
    selects.each(function(){
      var select = d3.select(this),
      name = select.attr("name"),
      option = select.select("option:checked");
      if (option.size()>0) {
        value = option.property("value");
        config[name] = value;
      };
      });
    
    return(config);
};