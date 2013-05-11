function exportFunctions(exports) {

// // // // // // // // // // // // // // // // // // // // // // // //  // //
//
// // // Make Table, Sort and Filter Interactions
//
// // // // // // // // // // // // // // // // // // // // // // // //  // //

function initiateTableFilter() {
  $('.clear').on("click", function() { 
    $(".noMatches").css("visibility", "hidden")
    $("#tableFilter").val("")
    makeTable(gData, "#siteTable")
  })
  $('#tableFilter').keyup(function(e) {
    var text = $(e.target).val()
    searchTable(text)
  })
}

function searchTable(searchTerm) {
  var filteredList = []
  gData.forEach(function(object) {
    var stringObject = JSON.stringify(object).toLowerCase()
    if (stringObject.match(searchTerm)) filteredList.push(object)
  })
  // if ($('#tableFilter').val("")) makeTable(gData, "#siteTable")
  if (filteredList.length === 0) {
    console.log("no matchie")
    $(".noMatches").css("visibility", "inherit")
    makeTable("no matches", "#siteTable")
  }
  else $(".noMatches").css("visibility", "hidden")
  makeTable(filteredList, "#siteTable") 
  return filteredList
}

function sortThings(data, sorter, sorted) {
  data.sort(function(a,b){
    if (a[sorter]<b[sorter]) return -1
    if (a[sorter]>b[sorter]) return 1
    return 0
  })
  if (sorted === "descending") data.reverse()
  makeTable(data, "#siteTable")
  var header 
  $("#siteTable .tHeader").each(function(i, el){
    var contents = resolveDataTitle($(el).text())
    if (contents === sorter) header = el
  })
  $(header).attr("data-sorted", sorted)
}

function resolveDataTitle(string) {
  var adjusted = string.toLowerCase().replace(/\s/g, '').replace(/\W/g, '')
  return adjusted
}

function sendToSort(event) {
  var sorted = $(event.target).attr("data-sorted")
  if (sorted) {
    if (sorted === "descending") sorted = "ascending"
    else sorted = "descending"
  }
  else { sorted = "ascending" }
  var sorter = resolveDataTitle(event.target.innerHTML)
  sortThings(gData, sorter, sorted)
}

$(document).on("click", ".tHeader", sendToSort)

function makeTable(data, targetDiv) {
  var templateID = targetDiv.replace("#", "")
  var tableContents = ich[templateID]({
    rows: data
  })
  $(targetDiv).html(tableContents) 
}

// // // // // // // // // // // // // // // // // // // // // // // //  // //
//
// // // Sorting, Ordering Data
//
// // // // // // // // // // // // // // // // // // // // // // // //  // //

// out of the data, filter something from a category
function getMatches(data, filter, category) {
  var matches = []
  data.forEach(function (element) {
    var projectType = element[category]
    if (projectType === filter) filteredProjects.push(element)
  })
  return matches
}

// EDIT //////////////////////////// EDIT
function mostFrequent(data) {
  var stateCount = {}
  for (var i = 0; i < data.length; i++)  {
    if (!stateCount[data[i].state]) {
      stateCount[data[i].state] = 0
   }
   stateCount[data[i].state]++
}
    var sortable = []
    for (var state in stateCount) {
      sortable.push([state, stateCount[state]])
  }
      sortable.sort(function(a, b) {return b[1] - a[1]})
      return  sortable
}

function addUnitsLabels(arrayObj, oldLabel, oldUnits) {
  for (var i = 0; i < arrayObj.length; i++) {
    arrayObj[i].label = arrayObj[i].oldLabel
    arrayObj[i].units = arrayObj[i].oldUnits
    delete arrayObj[i].oldLabel
    delete arrayObj[i].oldUnits
  }
return arrayObj
}

// EDIT //////////////////////////// EDIT
function getOccurance(data) {
  var occuranceCount = {}
  for (var i = 0; i < data.length; i++)  {
   if (!occuranceCount[data[i].state]) {
       occuranceCount[data[i].state] = 0
   }
   occuranceCount[data[i].state]++
  }
  return occuranceCount
}

function makeColorArrayOfObject(data, color) {
  var keys = Object.keys(data)
  var counter = 1
  var colorIndex
  return keys.map(function(key){ 
    if (keys.length > color.length) {
      colorIndex = counter % color.length
    }
    var h = {label: key, units: data[key], hexcolor: color[colorIndex]} 
    counter++  
    colorIndex = counter 
    return h
  })
}

function makeArrayOfObject(data) {
  var keys = Object.keys(data)
  return keys.map(function(key){ 
    // var h = {label: key, units: data[key], hexcolor: "#FDBDBD"}  
    var h = {label: key, units: data[key]}        
    return h
  })
}

// // // // // // // // // // // // // // // // // // // // // // //  // //
// 
// // // // // Mapbox + Leaflet Map
//
// // // // // // // // // // // // // // // // // // // // // // // // //  

// for geocoding: http://mapbox.com/tilemill/docs/guides/google-docs/#geocoding

// create geoJSON from your spreadsheet's coordinates
function createGeoJSON(data) {
  var geoJSON = []
  data.forEach(function(lineItem){
    var feature = {
      type: 'Feature',
      "geometry": {"type": "Point", "coordinates": [lineItem.long, lineItem.lat]},
      "properties": {
        "image": "hello",
        "url": "hi",
        "marker-size": "small",
        "marker-color": lineItem.hexcolor,
        "id": lineItem.id,
        "year": lineItem.year,
        "title": lineItem.placename,
        "city": lineItem.city
      }
    }
    geoJSON.push(feature)
  })
  return geoJSON
}

// load basic map with tiles
function loadMap() {
	var map = L.mapbox.map('map')
  // map.setView(, 4)
	// map.addLayer(L.tileLayer('http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png'))
	map.touchZoom.disable()
	map.doubleClickZoom.disable()
	map.scrollWheelZoom.disable()
	return map
}

function addTileLayer(map) {
  var layer = L.mapbox.tileLayer('examples.map-20v6611k')
  layer.addTo(map)
}

function addMarkerLayer(geoJSON, map) { 
  var viewCoords = [geoJSON[0].geometry.coordinates[1], geoJSON[0].geometry.coordinates[0]]
  var markerLayer = L.mapbox.markerLayer(geoJSON)
  markerLayer.setGeoJSON(geoJSON)
  map.setView(viewCoords, 10)
  // map.fitBounds(geoJSON)
  markerLayer.addTo(map)
  // markerLayer.on('click', function(e) {
  //   var feature = e.layer.feature
  //   // $("td").css("background", "none")
  //   // $("." + feature.properties.id).css("background", "#ff00ff")
  //   console.log(feature.properties.id)
  //   var popupContent = '<h2>' + feature.properties.title + '</h2>' + '<small>' + feature.properties.year + '</small>'
  //   e.layer.bindPopup(popupContent,{
  //   closeButton: false,
  //   })
  // })
  // addPopups(geoJSON, map, markerLayer)
  return markerLayer
}

function addPopups(geoJSON, map, markerLayer) {
  console.log("markerLayer", markerLayer)
  markerLayer.on('click', function(e) {
    var feature = e.layer.feature
    var popupContent = '<h2>' + feature.properties.title + '</h2>' + '<small>' + feature.properties.year + '</small>'
    // var popupContent = popupContent
    e.layer.bindPopup(popupContent,{closeButton: false,})
  })
}

// // // // // // // // // // // // // // // // // // // // // // //  // //
// 
// // // // // D3 Charts
//
// // // // // // // // // // // // // // // // // // // // // // // // // 

// Bar Chart
// Adapted mostly from http://bl.ocks.org/mbostock/3885705

function d3BarChart(data, options) {
  console.log(data, options)

  //  m = [t0, r1, b2, l3]
  var m = options.m,
      w = options.w - m[1] - m[3],
      h = (data.length * 30) - m[0] - m[2]

  var format = d3.format(",.0f")

  var x = d3.scale.linear().range([0, w]),
      y = d3.scale.ordinal().rangeRoundBands([0, h], .1)

  var xAxis = d3.svg.axis().scale(x).orient("top").tickSize(-h).tickFormat(d3.format("1s")),
      yAxis = d3.svg.axis().scale(y).orient("left").tickSize(0)

  var svg = d3.select(options.div).append("svg")
      .attr("width", w + m[1] + m[3])
      .attr("height", h + m[0] + m[2])
    .append("g")
      .attr("transform", "translate(" + m[3] + "," + m[0] + ")")

  x.domain([0, d3.max(data, function(d) { return d.units })]) // 0 to max of units
  y.domain(data.map(function(d) { return d.label })) // makes array of labels

  var mouseOver = function() {
      var rect = d3.select(this)
      var indexValue = rect.attr("index_value")

      var barSelector = "." + "rect-" + indexValue
      var selectedBar = d3.selectAll(barSelector)
      selectedBar.style("fill", options.hiColor)

      var valueSelector = "." + "value-" + indexValue
      var selectedValue = d3.selectAll(valueSelector)
      selectedValue.style("fill", options.hiColor)

      var textSelector = "." + "labels-" + indexValue
      var selectedText = d3.selectAll(textSelector)
      selectedText.style("fill", options.hiColor)
  }

  var mouseOut = function() {
      var rect = d3.select(this)
      var indexValue = rect.attr("index_value")

      var barSelector = "." + "rect-" + indexValue
      var selectedBar = d3.selectAll(barSelector)
      selectedBar.style("fill", function(d) { return d.hexcolor})

      var valueSelector = "." + "value-" + indexValue
      var selectedValue = d3.selectAll(valueSelector)
      selectedValue.style("fill", "#333333")

      var textSelector = "." + "labels-" + indexValue
      var selectedText = d3.selectAll(textSelector)
      selectedText.style("fill", "#333")
  }

  var bar = svg.selectAll("g.bar")
    .data(data)
  .enter().append("g")
    .attr("class", "bar")
    .attr("transform", function(d) { return "translate(0," + y(d.label) + ")" })

  bar.append("text")
    .attr("x", function(d) { return x(d.units) })
    .attr("y", y.rangeBand() / 2)
    .attr("dx", 12)
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .attr("index_value", function(d, i) { return "index-" + i })
    .text(function(d) { return format(d.units) })
    .attr("class", function(d, i) { return "value-" + "index-" + i })
    .on('mouseover', mouseOver)
    .on("mouseout", mouseOut)

  bar.append("text")
    .attr("x", -5)
    .attr("y", y.rangeBand() / 2)
    .attr("dx", 0)
    .attr("dy", ".35em")
    .attr("text-anchor", "end")
    .attr("index_value", function(d, i) { return "index-" + i })
    .text(function(d) { return d.label })
    .attr("class", function(d, i) { return "value-" + "index-" + i })
    .on('mouseover', mouseOver)
    .on("mouseout", mouseOut)

  bar.append("rect")
    .attr("width", function(d) { return x(d.units)})
    .attr("height", y.rangeBand())
    .attr("index_value", function(d, i) { return "index-" + i })
    .style("fill", function(d) { return d.hexcolor})
    .on('mouseover', mouseOver)
    .on("mouseout", mouseOut)
    .attr("class", function(d, i) { return "rect-" + "index-" + i })

  svg.append("g")
    .attr("class", "x axis")
    .call(xAxis)

  d3.select("input").on("change", change)

  function change() {
    // Copy-on-write since in betweens are evaluated after a delay.
    var y0 = y.domain(data.sort(this.checked
        ? function(a, b) { return b.units - a.units }
        : function(a, b) { return d3.ascending(a.label, b.label) })
        .map(function(d) { return d.label }))
        .copy()

    var transition = svg.transition().duration(750),
        delay = function(d, i) { return i * 50 }

    transition.selectAll(".bar")
        .delay(delay)
        .attr("transform", function(d) { return "translate(0," + y(d.label) + ")" })
  }
}

// Pie Chart

function d3PieChart(data, options) {
  var width = options.w,
      height = options.h,
      radius = Math.min(width, height) / 2.3

  var arc = d3.svg.arc()
      .outerRadius(radius - 10)
      .innerRadius(0)

  var arcOver = d3.svg.arc()
      .outerRadius(radius + .1)

  var pie = d3.layout.pie()
      .sort(null)
      .value(function(d) { return d.units })

var svg = d3.select(options.div).append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + width / 3 + "," + height / 2 + ")")

var data = data

  data.forEach(function(d) {
    d.units = +d.units
  })
function mouseOver(d) {
  d3.select(this).select("path").transition()
     .duration(500)
     .attr("d", arcOver)
  var slice = d3.select(this)
  var indexValue = slice.attr("index_value")

  var pathSelector = "." + "path-" + indexValue
  var selectedPath = d3.selectAll(pathSelector)
  selectedPath.style("fill", options.hiColor)

  var textSelector = "." + "labels-" + indexValue
  var selectedText = d3.selectAll(textSelector)
  selectedText.transition()
    .duration(150)
    .style("font-size", "12px").style("font-weight", "bold").style("fill", options.hiColor)
  selectedText.attr("class", function(d, i) { return "labels-" + indexValue + " bigg" })
}
function mouseOut(d) {
  d3.select(this).select("path").transition()
     .duration(150)
     .attr("d", arc)
  var slice = d3.select(this)
  var indexValue = slice.attr("index_value")

  var pathSelector = "." + "path-" + indexValue
  var selectedPath = d3.selectAll(pathSelector)
  selectedPath.style("fill", function(d) { return d.data.hexcolor })

  var textSelector = "." + "labels-" + indexValue
  var selectedText = d3.selectAll(textSelector)
  selectedText.transition()
    .duration(200)
    .style("font-size", "10px").style("font-weight", "normal").style("fill", function(d) { return d.hexcolor })
}

  var g = svg.selectAll(".arc")
      .data(pie(data))
    .enter().append("g")
      .attr("index_value", function(d, i) { return "index-" + i })
      .attr("class", function(d, i) { return "slice-" + "index-" + i + " slice arc" })
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut)

  var path = g.append("path")
      .attr("d", arc)
      .attr("index_value", function(d, i) { return "index-" + i })
      .attr("class", function(d, i) { return "path-" + "index-" + i })
      .style("fill", function(d) { return d.data.hexcolor})
      .attr("fill", function(d) { return d.data.hexcolor})

//   g.append("text")
//       .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")" })
//       .attr("dy", ".35em")
//       .attr("dx", ".35em")
//       .attr("class", "pieTip")
//       .style("text-anchor", "middle")
//       .text(function(d) { return d.data.units })

// var labelr = radius + 8 // radius for label anchor
//   g.append("text")
//     .attr("transform", function(d) {
//         var c = arc.centroid(d),
//             x = c[0],
//             y = c[1],
//             // pythagorean theorem for hypotenuse
//             h = Math.sqrt(x*x + y*y)
//         return "translate(" + (x/h * labelr) +  ',' +
//            (y/h * labelr) +  ")"
//     })
//     .attr("dy", ".35em")
//     .attr("fill", "#333")
//     .attr("class", "pieTip")
//     .attr("text-anchor", function(d) {
//         // are we past the center?
//         return (d.endAngle + d.startAngle)/2 > Math.PI ?
//             "end" : "start"
//     })
//     .text(function(d) { return d.data.units })

    // svg.selectAll("rect")    
    //   .data(data)         
    //   .enter().append("g")
    //     .append("rect")                               
    //     .attr("width", 100)
    //     .attr("height", 26) 
    //     .attr("fill", function(d) { return d.hexcolor }) 
    //     .attr("x", 0)
    //     .attr("y", "-140px") // Controls padding to place text above bars



svg.selectAll("g.labels")
  .data(data)
  .enter().append("g") // Append legend elements
      .append("text")
        .attr("text-anchor", "start")
        .attr("x", width / 2.5)
        .attr("y", function(d, i) { return data.length + i*(data.length * 2)})
        .attr("dx", 0)
        .attr("dy", "-140px") // Controls padding to place text above bars
        .text(function(d) { return d.label + ", " + d.units})
        .style("fill", function(d) { return d.hexcolor })
        .attr("index_value", function(d, i) { return "index-" + i })
        .attr("class", function(d, i) { return "labels-" + "index-" + i + " aLabel "})
        .on('mouseover', mouseOver)
        .on("mouseout", mouseOut)

  d3.select("input").on("change", change)

  function change() {
    console.log("checked/unchecked")
    // Copy-on-write since in betweens are evaluated after a delay.
    // pie.sort(function(a, b) { return b.units - a.units })
    path = path.data(pie(data).sort(function(a, b) { return b.units - a.units; })); // update the data
    path.attr("d", arc)
   // path.transition().duration(750).attrTween("d", arcTween)

  // var pie = d3.layout.pie()
  //     .sort(null)
  //     .value(function(d) { return d.units })

//   function change() {
//   clearTimeout(timeout);
//   path = path.data(pie(dataset[this.value])); // update the data
//   path.attr("d", arc); // redraw the arcs
// }

function arcTween(a) {
  var i = d3.interpolate(this._current, a);
  this._current = i(0);
  return function(t) {
    return arc(i(t));
  };
}
    var transition = svg.transition().duration(750),
        delay = function(d, i) { return i * 50 }

    transition.selectAll(".path")
        .delay(delay)
  }
}


// Line Chart

function d3LineChart(data, options){
    // Adapted from http://bl.ocks.org/1166403 and
    // http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
    
    var m = options.m
    var w = options.w - m[1] - m[3]
    var h = options.h - m[0] - m[2]
    var data = data

    var x = d3.scale.ordinal().rangeRoundBands([0, w], 1)
        x.domain(data.map(function(d) { return d.label }))
    var y = d3.scale.linear().range([0, h])
        y.domain([d3.max(data, function(d) { return d.units }) + 2, 0])

    var line = d3.svg.line()
       .x(function(d, i) { console.log("x", x(i)); return x(i) })
       .y(function(d) { console.log("y", y(d)); return y(d) })

    var graph = d3.select(options.div).append("svg:svg")
          .attr("width", w + m[1] + m[3])
          .attr("height", h + m[0] + m[2])
        .append("svg:g")
          .attr("transform", "translate(" + m[3] + "," + m[0] + ")")

    var div = d3.select(options.div).append("div")   
        .attr("class", "tooltip")               
        .style("opacity", 0)

    // create yAxis
    var xAxis = d3.svg.axis().scale(x).tickSize(-h).tickSubdivide(true)
    // Add the x-axis.
    graph.append("svg:g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + h + ")")
          .call(xAxis)
        .selectAll("text")
          .style("text-anchor", "end")
          .attr("dy", "-.5em")
          .attr('dx', "-1em")
          .attr("transform", "rotate(-80)")
          .call(xAxis)

    // create left yAxis
    var yAxisLeft = d3.svg.axis().scale(y).ticks(4).tickSize(-w).tickSubdivide(true).orient("left")
    // Add the y-axis to the left
    graph.append("svg:g")
          .attr("class", "y axis")
          .attr("dx", "25")
          .attr("transform", "translate(0,0)")
          .call(yAxisLeft)
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", -40)
          .attr("dy", 0)
          .style("text-anchor", "end")
          .text(function() {
            if (options.yaxis) return options.yaxis
            return
          })
      
   var lineData = data.map(function(d) { return d.units })
      graph.append("svg:path")
          .attr("d", line(lineData))
          .attr("class", "chartLine")
          .attr("index_value", function(d, i) { return i })
          // .attr("stroke", options.hiColor).attr("fill", "none")

    graph.selectAll("dot")    
        .data(data)         
    .enter().append("circle")                               
        .attr("r", 3.5) 
        .attr("fill", options.hiColor)      
        .attr("cx", function(d) { return x(d.label); })       
        .attr("cy", function(d) { return y(d.units); })     
        .on("mouseover", function(d) {      
            div.transition().duration(200).style("opacity", .9)    
            div .html(d.label + ", "  + d.units)  
                .style("left", (d3.event.pageX) + "px")     
                .style("top", (d3.event.pageY - 28) + "px")   
            })                  
        .on("mouseout", function(d) {       
            div.transition().duration(500).style("opacity", 0) 
        })
}




exports.searchTable = searchTable
exports.initiateTableFilter = initiateTableFilter
exports.d3LineChart = d3LineChart
exports.d3PieChart = d3PieChart
exports.d3BarChart = d3BarChart
exports.addPopups = addPopups
exports.addMarkerLayer = addMarkerLayer
exports.addTileLayer = addTileLayer
exports.loadMap = loadMap
exports.makeArrayOfObject = makeArrayOfObject
exports.makeColorArrayOfObject = makeColorArrayOfObject
exports.mostFrequent = mostFrequent
exports.addUnitsLabels = addUnitsLabels
exports.getOccurance = getOccurance
exports.getMatches = getMatches
exports.createGeoJSON = createGeoJSON
exports.makeTable = makeTable
exports.sendToSort = sendToSort
exports.resolveDataTitle = resolveDataTitle
exports.sortThings = sortThings

}
var Sheetsee = {}
exportFunctions(Sheetsee)