app.controller("sunbustController", function($scope, httpCallerService) {
  var svg = d3.select("svg"),
    tooltip = d3.select("#tooltip"),
    margin = {
      "top": 5,
      "bottom": 5,
      "left": 5,
      "right": 0
    },
    width = $("#chart").width() - (margin.left + margin.right),
    height = $("#chart").height() - (margin.top + margin.bottom),
    radius = (Math.min(width, height) / 2) - 10;

  var formatNumber = d3.format(",d");

  var x = d3.scaleLinear()
    .range([0, 2 * Math.PI]);

  var y = d3.scaleSqrt()
    .range([0, radius]);

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var partition = d3.partition();

  var arc = d3.arc()
    .startAngle(function(d) {
      return Math.max(0, Math.min(2 * Math.PI, x(d.x0)));
    })
    .endAngle(function(d) {
      return Math.max(0, Math.min(2 * Math.PI, x(d.x1)));
    })
    .innerRadius(function(d) {
      return Math.max(0, y(d.y0));
    })
    .outerRadius(function(d) {
      return Math.max(0, y(d.y1));
    });


  var g = svg.append("g")
    .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

  d3.json("res/sunbust/flare.json", function(error, root) {
    if (error) throw error;

    root = d3.hierarchy(root);
    root.sum(function(d) {
      return d.size;
    });
    g.selectAll("path")
      .data(partition(root).descendants())
      .enter().append("path")
      .attr("d", arc)
      .style("fill", function(d) {
        return color((d.children ? d : d.parent).data.name);
      })
      .on("click", click)
      .on("mouseover", function(d) {
        $("#tooltip")
          .css('transition-duration', '1s')
          .css('opacity', '0.9')
          .css("left", (d3.event.pageX - 50) + "px")
          .css("top", (d3.event.pageY + 20) + "px");
        $("#tooltipHeader").html(null === d.parent ? "Root" : d.parent.data.name);
        var tooltipBody = d3.select("#tooltipBody");
        var tooltipTemplate = [{
          "key": d.data.name,
          "value": d.data.size || sizeofChild(d.data.children)
        }]
        for (i in tooltipTemplate) {
          var tr = tooltipBody.append("tr");
          tr.append("td")
            .attr("class", "name")
            .html("<span style=\"background-color : " + color((d.children ? d : d.parent).data.name) + "\"></span>" + tooltipTemplate[i].key);
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
  });

  function click(d) {
    g.transition()
      .duration(750)
      .tween("scale", function() {
        var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
          yd = d3.interpolate(y.domain(), [d.y0, 1]),
          yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
        return function(t) {
          x.domain(xd(t));
          y.domain(yd(t)).range(yr(t));
        };
      })
      .selectAll("path")
      .attrTween("d", function(d) {
        return function() {
          return arc(d);
        };
      });
  }

  function sizeofChild(data) {
    sum = 0;
    for (d in data) {
      sum += data[d].size || sizeofChild(data[d].children);
    }
    return sum;
  }
  d3.select(self.frameElement).style("height", height + "px");
});
