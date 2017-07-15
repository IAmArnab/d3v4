app.controller("lineDiagramController", function($scope, $filter, httpCallerService) {
  var svg = d3.select("svg"),
    tooltip = d3.select("#tooltip")
    .style("opacity", 0),
    margin = {
      "top": 5,
      "bottom": 40,
      "left": 50,
      "right": 100
    },
    width = $("#chart").width() - (margin.left + margin.right),
    height = $("#chart").height() - (margin.top + margin.bottom);
  svg.selectAll("*").remove();

  var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var parseTime = d3.timeParse("%Y%m%d");

  var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

  var line = d3.line()
    .curve(d3.curveBasis)
    .x(function(d) {
      return x(d.date);
    })
    .y(function(d) {
      return y(d.temperature);
    });
  var area = d3.area()
      .x(function(d) { return x(d.date); })
      .y1(function(d) { return y(d.temperature); });
  d3.csv("res/line/data.csv", type, function(error, data) {
    if (error) throw error;

    var cities = data.columns.slice(1).map(function(id) {
      return {
        id: id,
        values: data.map(function(d) {
          return {
            city:id,
            date: d.date,
            temperature: d[id]
          };
        })
      };
    });

    x.domain(d3.extent(data, function(d) {
      return d.date;
    }));

    y.domain([
      d3.min(cities, function(c) {
        return d3.min(c.values, function(d) {
          return d.temperature;
        });
      }),
      d3.max(cities, function(c) {
        return d3.max(c.values, function(d) {
          return d.temperature;
        });
      })
    ]);

    z.domain(cities.map(function(c) {
      return c.id;
    }));

    area.y0(y(0));
    g.selectAll(".areaGroup")
      .data(cities)
      .enter().append("g")
      // .style("fill", )
      .append("path")
      .datum(function(d){
        return d.values;
      })
      .style("fill", function(d) {
        return z(d[0].city);
      })
      .attr("d", area)
      .style("opacity", .3);

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("fill", "#000")
      .text("Temperature, ºF");

    var city = g.selectAll(".city")
      .data(cities)
      .enter().append("g")
      .attr("class", "city");

    city.append("path")
      .attr("class", "line")
      .attr("d", function(d) {
        return line(d.values);
      })
      .style("stroke", function(d) {
        return z(d.id);
      });

    // add the dots with tooltips
    g.selectAll(".dotGroup")
      .data(cities)
      .enter().append("g")
      .style("fill", function(d) {
        return z(d.id);
      })
      .selectAll("dot")
      .data(function(d) {
        return d.values
      })
      .enter().append("circle")
      .attr("r", 3)
      .attr("cx", function(d) {
        return x(d.date);
      })
      .attr("cy", function(d) {
        return y(d.temperature);
      })
      .on("mouseover", function(d) {
        $("#tooltip")
          .css('transition-duration', '1s')
          .css('opacity', '0.8')
          .css("left", (d3.event.pageX - 50) + "px")
          .css("top", (d3.event.pageY +20) + "px");
        $("#tooltipHeader").html(d.city);
        var tooltipBody = d3.select("#tooltipBody");
        var tooltipTemplate = [{
          key: "Date",
          value: $filter("date")(d.date)
        },{
          "key": "Temperature",
          "value": $filter('number')(d.temperature, 2) + " ºF"
        }]
        for (i in tooltipTemplate) {
          var tr = tooltipBody.append("tr");
          tr.append("td")
            .attr("class", "name")
            .html("<span style=\"background-color : "+z(d.city)+"\"></span>" + tooltipTemplate[i].key);
          tr.append("td")
            .attr("class", "value")
            .html(tooltipTemplate[i].value);
        }
      })
      .on("mouseout", function(d) {
        $("#tooltip")
          .css('opacity', '0');
        d3.select("#tooltipBody").selectAll("tr>td.name").remove();
        d3.select("#tooltipBody").selectAll("tr>td.value").remove();
      });

    city.append("text")
      .datum(function(d) {
        return {
          id: d.id,
          value: d.values[d.values.length - 1]
        };
      })
      .attr("transform", function(d) {
        return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")";
      })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .text(function(d) {
        return d.id;
      });
  });

  function type(d, _, columns) {
    d.date = parseTime(d.date);
    for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
    return d;
  }
});
