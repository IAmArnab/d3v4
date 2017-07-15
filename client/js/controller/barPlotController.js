app.controller("barPlotController", function($scope, $filter, httpCallerService) {
  httpCallerService.getValue("category")
    .then(function(data) {
        drawBarPlot(data);
      },
      function(error) {
        console.log("Can't get columns list");
      });
  var drawBarPlot = function(data) {
      // set the dimensions and margins of the graph
      var svg = d3.select("svg"),
        margin = {
          "top": 5,
          "bottom": 40,
          "left": 50,
          "right": 0
        },
        width = $("#chart").width() - (margin.left + margin.right),
        height = $("#chart").height() - (margin.top + margin.bottom);
      svg.selectAll("*").remove();
      var g = svg.append("g")
        .attr("width", width - (margin.left + margin.right))
        .attr("height", height - (margin.top + margin.bottom))
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
        tooltip = d3.select("#tooltip")
        .style("opacity", 0);
      // set the ranges
      var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);
      var y = d3.scaleLinear()
        .range([height, 0]);

      var hist = {};
      for (d in data) {
        if (hist[data[d]]) {
          hist[data[d]]++;
        } else {
          hist[data[d]] = 1;
        }
      }
      data = Object.keys(hist).map(function(e) {
        return {
          "key": e,
          "value": hist[e]
        };
      });
      // Scale the range of the data in the domains
      x.domain(data.map(function(d) {
        return d.key;
      }));
      y.domain([0, d3.max(data, function(d) {
          return d.value;
        })])
        .range([height, 0]);

      // append the rectangles for the bar chart
      var bar = g.selectAll(".bar")
        .data(data)
        .enter().append("g")
        .attr("class", "bar");

      bar.append("rect")
        .attr("x", function(d) {
          return x(d.key);
        })
        .attr("width", x.bandwidth())
        .attr("y", function(d) {
          return y(d.value);
        })
        .attr("height", 0)
        .on("mouseover", function(d) {
            tooltip.transition()
              .duration(200)
              .style("opacity", .9)
              .style("left", (d3.event.pageX - 50) + "px")
              .style("top", (d3.event.pageY - 78) + "px");
            $("#tooltipHeader").html("Category");
            var tooltipBody = d3.select("#tooltipBody");
            var tooltipTemplate = [{
                "key": d.key,
                "value": $filter('number')(
                  (d.value / d3.sum(
                    Object.keys(hist).map(function(e) {
                      return hist[e];
                    })
                  ) * 100), 2) + "%"
            }];
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
      return "translate(" + 0 + ", " + (305 + y(d.value)) + ") rotate(180) scale(-1, 1)";
    });

  bar.selectAll("rect")
    .transition()
    .ease(d3.easeElastic)
    .attr("height", function(d) {
      return height - y(d.value);
    })
    .duration(1000);

  bar.append("text")
    .attr("dy", ".75em")
    .attr("y", 6)
    .attr("x", x.bandwidth() / 2)
    .attr("text-anchor", "middle")
    // .attr("transform", "scale(-1, 0)")
    .text(function(d) {
      return d.value;
    })
    .attr("transform", function(d) {
      return "translate(" + x(d.key) + "," + y(d.value) + ")";
    });
  // text label for the x axis
  g.append("text")
    .attr("transform",
      "translate(" + (width / 2) + " ," +
      (height + margin.bottom - 5) + ")")
    .style("text-anchor", "middle")
    .text("Category");

  // text label for the y axis
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Count");

  // add the x Axis
  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x));

  // add the y Axis
  g.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y));
}
});
