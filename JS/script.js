// D3 script to create heat map

function createChart() {
  // Basic Set-up
  var tempsUrl = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json";

  var margin = {top: 30, right: 10, bottom: 85, left: 80};
  var width = 900 - margin.left - margin.right;
  var height = 550 - margin.top - margin.bottom;
  var colors = ['#4B0082', '#8A2BE2', '#3399ff', '#339900', '#99FF00', '#ffff99', '#FFDD00', '#FFBB11',  '#FF7700', '#FF4400', '#AA1100'];
  var buckets = colors.length;
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


  // SVG Setup
  var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  var tooltip = d3.select("body").append("div")
    .classed("tooltip", true)


  // Import JSON data and create chart, axes, legend
  var heatmapChart = d3.json(tempsUrl, function(error, data) {
    var monthlyVar = data.monthlyVariance;
    //console.log(monthlyVar[0])

    var baseTemp = data.baseTemperature;
    var minTemp = d3.min(monthlyVar, function(d) {return (d.variance + baseTemp);});
    var maxTemp = d3.max(monthlyVar, function(d) {return (d.variance + baseTemp);});
    //console.log(minTemp);
    //console.log(maxTemp);


    var firstYear = monthlyVar[0].year;
    var lastYear = monthlyVar[monthlyVar.length-1].year;
    var dataRange = lastYear - firstYear + 1;
    var tileHeight = height / (months.length);
    var tileWidth = Math.floor(width / dataRange);
    var legendItemWidth = tileWidth * 12;

    // Y-Axis
    var monthLabels = svg.selectAll(".monthLabel")
      .data(months)
      .enter().append('text')
        .text(function(d) { return d;})
        .attr('x', 0)
        .attr('y', function(d, i) { return i * tileHeight;})
        .style('text-anchor', 'end')
        .attr('transform', 'translate(-6,'+ tileHeight / 1.5 + ')')
        .classed('monthLabel', true);

    svg.append('text')
      .attr('y', -40)
      .attr('x', -height/2)
      .attr('transform', 'translate(-10,' + height/2 + ')')
      .attr("transform", "rotate(-90)")
      .style('text-anchor', 'middle')
      .attr('font-weight', 'bold')
      .text('Months')

    // X-Axis
    var xScale = d3.scale.linear()
      .domain([firstYear, lastYear])
      .range([0, width]);

    var xAxis = d3.svg.axis()
      .scale(xScale)
      .orient('bottom')
      .tickFormat(d3.format("d"));

    svg.append('g')
        .classed('axis', true)
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)
      .append('text')
        .attr('x', width/2)
        .attr('y', 45)
        .attr('font-weight', 'bold')
        .style('text-anchor', 'middle')
        .text('Years')

    // Quantile scale to map temp variance + base temp to color range
    var colorScale = d3.scale.quantile()
      .domain([minTemp, maxTemp])
      .range(colors);

    // Build heat map
    var cards = svg.selectAll(".tiles")
      .data(monthlyVar);

    cards.enter().append("rect")
      .attr("x", function(d) { return xScale(d.year)})
      .attr("y", function(d) { return (d.month - 1) * tileHeight; })
      .classed("tiles", true)
      .attr("width", tileWidth)
      .attr("height", tileHeight)
      .style("fill", function(d) {return colorScale(d.variance + baseTemp);})
      .on("mouseover", function(d) {
        var monthFull = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        var monthName = monthFull[d.month - 1];
        var displayTemp = (d.variance + baseTemp).toFixed(3);
        var dataPoint = "<div class='text-center'><strong>"+ d.year +" - " + monthName +"<br />" + displayTemp + " &deg;C</strong><br />" + d.variance + " &deg;C</div>";
        tooltip.transition()
          .style('opacity', .9)
        tooltip.html(dataPoint)
          .style("left", (d3.event.pageX + 5) + "px")
          .style("top", (d3.event.pageY - 28) + "px")
        d3.select(this).style('opacity', 0.5)
      })
      .on("mouseout", function(d) {
        tooltip.transition()
          .style("opacity", 0);
        d3.select(this).style('opacity', 1);
      });

    cards.exit().remove();

    // Color legend - prepends a 0 to color range to start scale and labels from there
    var legend = svg.selectAll(".legend")
      .data([0].concat(colorScale.quantiles()), function(d) { return d; });

    legend.enter().append("g")
      .classed("legend", true);

    legend.append("rect")
      .attr("x", function(d, i) { return (width - (buckets-i)*legendItemWidth); })
      .attr("y", height + 55)
      .attr("width", legendItemWidth)
      .attr("height", tileHeight / 2)
      .style("fill", function(d, i) { return colors[i]; });

    legend.append("text")
      .classed("legendText", true)
      .text(function(d) { return "≥ " + d.toFixed(1); })
      .attr("x", function(d, i) { return (width - (buckets-i)*legendItemWidth); })
      .attr("y", height + 65 + tileHeight / 2);

    legend.exit().remove();

  });
}

createChart();
