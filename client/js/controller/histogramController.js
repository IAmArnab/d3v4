app.controller("histogramController", function($scope, $filter, httpCallerService) {
  var map;
  $scope.binsCount = 5;
  httpCallerService.getValue("Modularity Class")
    .then(function(data) {
        map = data.map(function(d) {
          return +d;
        });
        $scope.drawHist();
      },
      function(error) {
        console.log("Can't get columns list");
      });
  $(window).resize(function() {
    $scope.drawHist();
  });
  $scope.drawHist = function() {
    var svg = d3.select("svg"),
      tooltip = d3.select("#tooltip")
      .style("opacity", 0),
      margin = {
        "top": 5,
        "bottom": 40,
        "left": 40,
        "right": 0
      },
      width = $("#chart").width() - (margin.left + margin.right),
      height = $("#chart").height() - (margin.top + margin.bottom);
    svg.selectAll("*").remove();
    var g = svg.append("g")
      .attr("width", width - (margin.left + margin.right))
      .attr("height", height - (margin.top + margin.bottom))
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
      x = d3.scaleLinear()
      .domain([0, d3.max(map)])
      .range([0, width]);
    var bins = d3.histogram()
      .domain(d3.extent(map, function(d) {
        return d;
      }))
      .thresholds(function() {
        var max = d3.max(map);
        var division = d3.max(map) / $scope.binsCount;
        scale = [d3.min(map)];
        for (i = 1; i < $scope.binsCount; i++) {
          scale.push(division * i);
        }
        return scale;
      })
      (map),
      y = d3.scaleLinear()
      .domain([0, d3.max(bins, function(d) {
        return d.length;
      })])
      .range([height, 0]);
    $scope.numberOfBins = bins.length;

    var bar = g.selectAll(".bar")
      .data(bins)
      .enter().append("g")
      .attr("class", "bar");

    bar.append("rect")
      .attr("x", 1)
      .attr("width", x(bins[0].x1) - x(bins[0].x0) - 1)
      .attr("height", 0)
      .on("mouseover", function(d) {
        tooltip.transition()
          .duration(200)
          .style("opacity", .9)
          .style("left", (d3.event.pageX - 50) + "px")
          .style("top", (d3.event.pageY - 78) + "px");
        $("#tooltipHeader").html("Modularity Class");
        var tooltipBody = d3.select("#tooltipBody");
        var tooltipTemplate = [{
            "key": "Count",
            "value": $filter('number')
              (d.length)
          },
          {
            "key": "Percentage",
            "value": $filter('number')(
              (d.length / map.length) * 100, 2) + "%"
          }
        ]
        for (i in tooltipTemplate) {
          var tr = tooltipBody.append("tr");
          tr.append("td")
            .attr("class", "name")
            .html("<span style=\"background-color : #1f77b4\"></span>" + tooltipTemplate[i].key);
          tr.append("td")
            .attr("class", "value")
            .html(tooltipTemplate[i].value);
        }
      })
      .on("mouseout", function(d) {
        tooltip.transition()
          .duration(500)
          .style("opacity", 0);
        d3.select("#tooltipBody").selectAll("tr>td.name").remove();
        d3.select("#tooltipBody").selectAll("tr>td.value").remove();
      })
      .attr("transform", function(d) {
        return "translate(" + x(d.x0 + d3.max(map) / $scope.binsCount) + "," + y(0) + ") rotate(180)";
      });

    bar.selectAll("rect")
      .transition()
      .ease(d3.easeElastic)
      .attr("height", function(d) {
        return height - y(d.length);
      })
      .duration(1000);

    bar.append("text")
      .attr("dy", ".75em")
      .attr("y", function(d) {
        return height - y(d.length) - 10;
      })
      .attr("y", 6)
      .attr("x", (x(bins[0].x1) - x(bins[0].x0)) / 2)
      .attr("text-anchor", "middle")
      // .attr("transform", "scale(-1, 0)")
      .text(function(d) {
        return d.length;
      })
      .attr("transform", function(d) {
        return "translate(" + x(d.x0) + "," + y(d.length) + ")";
      });
    // Add X axis
    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
    // text label for the x axis
    svg.append("text")
      .attr("transform",
        "translate(" + (width / 2) + " ," +
        (height + margin.bottom) + ")")
      .style("text-anchor", "middle")
      .text("Modularity Class");

    // Add the y Axis
    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y));

    // text label for the y axis
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Count");
  }
});
