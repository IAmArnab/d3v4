app.controller("networkController", function($scope, $filter, httpCallerService){
  var svg = d3.select("svg"),
      tooltip = d3.select("#tooltip")
        .style("opacity", 0),
  margin ={"top":5, "bottom":40, "left":40, "right":0},
  width = $("#chart").width()-(margin.left + margin.right),
  height = $("#chart").height()-(margin.top+margin.bottom);
  svg.selectAll("*").remove();

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function(d) { return d.id; }))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));

  d3.json("res/network/miserables.json", function(error, graph) {
    if (error) throw error;

    var link = svg.append("g")
        .attr("class", "links")
      .selectAll("line")
      .data(graph.links)
      .enter().append("line")
        .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

    var node = svg.append("g")
        .attr("class", "nodes")
      .selectAll("circle")
      .data(graph.nodes)
      .enter().append("circle")
        .attr("r", 5)
        .attr("fill", function(d) { return color(d.group); })
        .on("mouseover", function(d) {
          $("#tooltip")
            .css('transition-duration','1s')
            .css('opacity', '0.9')
            .css("left",(d3.event.pageX-50) + "px")
            .css("top", (d3.event.pageY - 78) + "px");
          $("#tooltipHeader").html(d.id);
          var tooltipBody = d3.select("#tooltipBody");
          var tooltipTemplate = [
            {
              "key": "Group ID",
              "value":d.group
            }
          ]
          for(i in tooltipTemplate){
            var tr = tooltipBody.append("tr");
            tr.append("td")
              .attr("class", "name")
              .html("<span style=\"background-color : #1f77b4\"></span>"+tooltipTemplate[i].key);
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
         })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    // node.append("title")
    //     .text(function(d) { return d.id; });

    simulation
        .nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    function ticked() {
      link
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    }
  });

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
});
