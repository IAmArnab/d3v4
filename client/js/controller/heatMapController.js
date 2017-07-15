app.controller("heatmapController", function($scope, httpCallerService) {
  var svg = d3.select("svg"),
    tooltip = d3.select("#tooltip"),
    margin = {
      "top": 5,
      "bottom": 5,
      "left": 5,
      "right": 0
    },
    width = $("#chart").width() - (margin.left + margin.right),
    height = $("#chart").height() - (margin.top + margin.bottom);
  var url = "res/heatMap/volcano.json"
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  var color = d3.scaleLinear()
    .range(['#FEFEFF', 'blue'])
    .interpolate(d3.interpolateHcl)


  d3.json(url, function(data) {
    color.domain(d3.extent(data, function(d) {
      return d[2]
    }))
    // var body = d3.select('body')
    // var svg = body.append('svg')
    var heatmap = svg
      .append('g')
      .attr('transform', 'translate(30,30)')

    var span = svg
      .append('text')
      .attr('y', 11.5 * 20)
      .attr('x', 30)
    var head = svg
      .append('g')
      .attr('transform', 'translate(30,22)')
    head
      .append('text')
      .classed('first', true)
      .text('midnight')
    head
      .append('text')
      .attr('x', 12 * 20)
      .text('noon')
    head
      .append('text')
      .classed('last', true)
      .attr('x', 24 * 20)
      .text('midnight')

    heatmap
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', function(d) {
        return d[1] * 20
      })
      .attr('y', function(d) {
        return d[0] * 20
      })
      .attr('width', 20)
      .attr('height', 20)
      .style('fill', function(d) {
        return color(d[2])
      })
      .on("mouseover", function(d) {
        $("#tooltip")
          .css('transition-duration', '1s')
          .css('opacity', '0.9')
          .css("left", (d3.event.pageX - 50) + "px")
          .css("top", (d3.event.pageY + 20) + "px");
        $("#tooltipHeader").html("Comments");
        var tooltipBody = d3.select("#tooltipBody");
        var tooltipTemplate = [{
            "key": "Day",
            "value": days[d[0]]
          },
          {
            "key": "# of comments",
            "value": d[2]
          },
          {
            "key": "From",
            "value": d[1] + ":00"
          },
          {
            "key": "To",
            "value": d[1] + ":59"
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
      .on("mouseout", function() {
        $("#tooltip")
          .css('opacity', '0');
        d3.select("#tooltipBody").selectAll("tr>td.name").remove();
        d3.select("#tooltipBody").selectAll("tr>td.value").remove();
      });

    var dates = d3.nest()
      .key(function(d) {
        return d[0]
      })
      .entries(data)
    var hours = d3.nest()
      .key(function(d) {
        return d[1]
      })
      .entries(data)
    var daysMean = dates.map(function(v) {
      return d3.mean(v.values, function(d) {
        return d[2]
      })
    })
    var hoursMean = hours.map(function(v) {
      return d3.mean(v.values, function(d) {
        return d[2]
      })
    })
    svg.append('g')
      .attr('transform', 'translate(' + (30 + 20 * 24 + 5) + ',30)')
      .selectAll('rect')
      .data(daysMean)
      .enter()
      .append('rect')
      .attr('width', 20)
      .attr('height', 20)
      .attr('y', function(d, i) {
        return i * 20
      })
      .style('fill', color)
    svg.append('g')
      .attr('transform', 'translate(30,' + (30 + 20 * 7 + 5) + ')')
      .selectAll('rect')
      .data(hoursMean)
      .enter()
      .append('rect')
      .attr('width', 20)
      .attr('height', 20)
      .attr('x', function(d, i) {
        return i * 20
      })
      .style('fill', color)
  })
});
