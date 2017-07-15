app.controller("radialTreeController", function($scope) {
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
    g = svg.append("g").attr("transform", "translate(" + (width / 2 + 40) + "," + (height / 2 + 90) + ")");
  var i = 0,
    duration = 350,
    root;

    var tree = d3.tree()
      .size([360, 700 / 2 - 80])
      .separation(function(a, b) { return (a.parent == b.parent ? 1 : 10) / a.depth; });

  var diagonal = function link(d) {
    return "M" + d.source.y + "," + d.source.x
        + "C" + (d.source.y + d.target.y) / 2 + "," + d.source.x
        + " " + (d.source.y + d.target.y) / 2 + "," + d.target.x
        + " " + d.target.y + "," + d.target.x;
  }
  var tree = d3.tree()
      .size([2 * Math.PI, 500])
      .separation(function(a, b) { return (a.parent == b.parent ? 1 : 10) / a.depth; });
  d3.json("res/radialTree/flare.json", function(error, data) {
    if (error) throw error;

    // root = tree(stratify(data));
    root = tree(d3.hierarchy(data, function(d) { return d.children; }));
    root.x0 = height / 2;
    root.y0 = 0;
    update(root);
  });

  function update(source){
    // Assigns the x and y position for the nodes
    var treeData = root;
    var nodes = g.selectAll(".node")
      .data(treeData.descendants(),function(d) { return d.id || (d.id = ++i); });
    var links = g.selectAll(".link")
        .data(treeData.links(), function(d) { return d.target.id; });
    var newLinks = links.enter().append("path")
        .attr("class", "link")
        .attr("d", d3.linkRadial()
          .angle(function(d) {  return source.x; })
          .radius(function(d) { return source.y; }));

    // Transition exiting nodes to the parent's new position.
    newLinks.transition()
      .duration(duration)
      .attr("d", d3.linkRadial()
        .angle(function(d) { return d.x; })
        .radius(function(d) { return d.y; }));

    // Transition exiting nodes to the parent's new position.
    var oldLinks = links.exit();
    oldLinks.transition()
      .duration(duration)
      .attr("d", d3.linkRadial()
        .angle(function(d) { return source.x; })
        .radius(function(d) { return source.y; })
      )
      .remove();

    var newNode = nodes.enter().append("g")
      .attr("class", function(d) { return "node" + (d.data.children ? " node--internal" : " node--leaf"); })
      // .attr("transform", function(d) { return "translate(" + radialPoint(d.x, d.y) + ")"; })
      .on("click", click);

    newNode.append("circle")
      .attr("transform", function(d) { return "translate(" + radialPoint(d.x, d.y) + ")"; })
        .attr("r", 1e-6);

    newNode.append("text")
      .attr("transform", function(d) { return "translate(" + radialPoint(d.x, d.y) + ") rotate(0)"; })
      .attr("dy", "0.31em")
      .attr("x", 10)
      .attr("text-anchor", function(d) { return d.x < Math.PI === !d.data.children ? "start" : "end"; })
      // .attr("transform", function(d) { return "rotate(" + (d.x < Math.PI ? d.x - Math.PI / 2 : d.x + Math.PI / 2) * 180 / Math.PI + ")"; })
      .text(function(d) { return d.data.name; })
      .style("fill-opacity", 1e-6);

      // Transition nodes to their new position.
    var nodeUpdate = newNode.transition()
        .duration(duration);

    nodeUpdate.select("circle")
      .attr("r", 4.5)
      .style("fill", function(d) { return d.children ? "lightsteelblue" : "#fff"; });

    nodeUpdate.select("text")
      .style("fill-opacity", 1)
      .attr("x", function(d) { return d.x < Math.PI === !d.children ? 6 : -6; })
      .attr("text-anchor", function(d) { return d.x < Math.PI === !d.children ? "start" : "end"; })
      .attr("transform", function(d) { return "translate(" + radialPoint(d.x, d.y) + ") rotate(" + (d.x < Math.PI ? d.x - Math.PI / 2 : d.x + Math.PI / 2) * 180 / Math.PI + ")"; });

    var nodeExit = nodes.exit()
      .transition()
        .duration(duration)
        .remove();
    nodeExit.select("circle")
      .attr("r", 1e-6);
  }

  function radialPoint(x, y) {
    return [(y = +y) * Math.cos(x -= Math.PI / 2), y * Math.sin(x)];
  }

  // Toggle children on click.
  function click(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
    update(d);
  }
});
