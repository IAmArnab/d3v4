app.controller("pieChartController", function($scope, $filter, httpCallerService) {
  httpCallerService.getValue("category")
    .then(function(data) {
        var hist = {};
        for (d in data) {
          if (hist[data[d]]) {
            hist[data[d]]++;
          } else {
            hist[data[d]] = 1;
          }
        };
        data = Object.keys(hist).map(function(e) {
          return hist[e];
        });
        var label = Object.keys(hist).map(function(e) {
          return e;
        });

        var svg = d3.select("svg"),
          tooltip = d3.select("#tooltip")
          .style("opacity", 0),
          margin = {
            "top": 5,
            "bottom": 5,
            "left": 5,
            "right": 5
          },
          width = $("#chart").width(),
          height = $("#chart").height(),
          radius = Math.min(width, height) / 2,
          // data = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89],
          outerRadius = height / 2 - 20,
          innerRadius = 10;
        var categorical = [{
              "name": "schemeAccent",
              "n": 8
            },
            {
              "name": "schemeDark2",
              "n": 8
            },
            {
              "name": "schemePastel2",
              "n": 8
            },
            {
              "name": "schemeSet2",
              "n": 8
            },
            {
              "name": "schemeSet1",
              "n": 9
            },
            {
              "name": "schemePastel1",
              "n": 9
            },
            {
              "name": "schemeCategory10",
              "n": 10
            },
            {
              "name": "schemeSet3",
              "n": 12
            },
            {
              "name": "schemePaired",
              "n": 12
            },
            {
              "name": "schemeCategory20",
              "n": 20
            },
            {
              "name": "schemeCategory20b",
              "n": 20
            },
            {
              "name": "schemeCategory20c",
              "n": 20
            }
          ],
          colorScale = d3.scaleOrdinal(d3[categorical[10].name]),
          hoverScale = d3.scaleOrdinal(d3[categorical[11].name]);
        var pie = d3.pie()
          .padAngle(.02);
        var arc = d3.arc()
          .padRadius(outerRadius)
          .innerRadius(innerRadius);

        var g = svg.append("g")
          .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        g.selectAll(".monthArc")
          .data(pie(data))
          .enter().append("path")
          .style("fill", function(d, i) {
            return colorScale(d.data);
          })
          .attr("class", "monthArc")
          .attr("id", function(d, i) {
            return "monthArc_" + i;
          })
          .each(function(d) {
            d.outerRadius = outerRadius - 20;
          })
          .attr("d", arc)
          .on("mouseover",
            arcTween(outerRadius, 0)
          )
          .on("mouseout",
            arcTween(outerRadius - 20, 150)
          );

        function arcTween(outerRadius, delay) {
          return function() {
            d3.select(this)
              .transition()
              .delay(delay)
              .style("fill", function(d, i) {
                if (delay == 0) {
                  tooltip.transition()
                    .duration(200)
                    .style("opacity", .9)
                    .style("left", (d3.event.pageX - 50) + "px")
                    .style("top", (d3.event.pageY - 78) + "px");
                  $("#tooltipHeader").html("Category");
                  var tooltipBody = d3.select("#tooltipBody");
                  var tooltipTemplate = [{
                    "key": label[d.index],
                    "value": $filter('number')(
                      (d.data / d3.sum(data)) * 100, 2) + "%"
                  }]
                  for (i in tooltipTemplate) {
                    var tr = tooltipBody.append("tr");
                    tr.append("td")
                      .attr("class", "name")
                      .html("<span style=\"background-color : #1f77b4\"></span>" + tooltipTemplate[i].key);
                    tr.append("td")
                      .attr("class", "value")
                      .html(tooltipTemplate[i].value);
                  }
                  return hoverScale(d.data);
                } else {
                  tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
                  d3.select("#tooltipBody").selectAll("tr>td.name").remove();
                  d3.select("#tooltipBody").selectAll("tr>td.value").remove();
                  return colorScale(d.data);
                }
              })
              .attrTween("d", function(d) {
                var i = d3.interpolate(d.outerRadius, outerRadius);
                return function(t) {
                  d.outerRadius = i(t);
                  return arc(d);
                };
              });
          };
        };

        // ////////////////////////////////////////////////////////////
        // //////////////////// Create the Slices /////////////////////
        // ////////////////////////////////////////////////////////////

        // //Append the month names within the arcs
        g.selectAll(".monthText")
          .data(data)
          .enter().append("text")
          .attr("class", "monthText")
          .attr("x", 5) //Move the text from the start angle of the arc
          .attr("dy", 18) //Move the text down
          .append("textPath")
          .attr("xlink:href", function(d, i) {
            return "#monthArc_" + i;
          })
          .text(function(d) {
            return d;
          });
        // _____________________________________________________________________
      },
      function(error) {
        console.log("Can't get columns list");
      });
});
