app.controller("dependencyMapController", function($scope, $filter, httpCallerService){
  $scope.$on("$destroy", function() {
    d3.select("#Dependencylabel")
      .style("opacity", 0)
  });
  var line = d3.radialLine()
    .curve(d3.curveBundle.beta(0.85))
    .radius(function(d) { return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; });
    // set the dimensions and margins of the graph
  var svg = d3.select("svg"),
    margin ={"top":5, "bottom":5, "left":5, "right":0},
    width = $("#chart").width()-(margin.left + margin.right),
    height = $("#chart").height()-(margin.top+margin.bottom);

  var diameter = d3.min([width, height]),
    radius = diameter / 2,
    innerRadius = radius - 120;

  var cluster = d3.cluster()
      .size([360, innerRadius]);
  var g = svg.append("g")
    .attr("transform", "translate(" + ((width/2)+margin.left) + "," + ((height/2)+margin.top) + ")");

  var link = g.append("g").selectAll(".link"),
      node = g.append("g").selectAll(".node");

  d3.json("res/dependencyWheel/flare.json", function(error, classes) {
    if (error) throw error;
    d3.select("#Dependencylabel").transition()
      .duration(200)
      .style("opacity", .9)
      .style("left", "20px")
      .style("top", "5px");
    var root = packageHierarchy(classes)
        .sum(function(d) { return d.size; });

    cluster(root);

    link = link
      .data(packageImports(root.leaves()))
      .enter().append("path")
        .each(function(d) { d.source = d[0], d.target = d[d.length - 1]; })
        .attr("class", "link")
        .attr("d", line);

    node = node
      .data(root.leaves())
      .enter().append("text")
        .attr("class", "node")
        .attr("dy", "0.31em")
        .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + (d.y + 8) + ",0)" + (d.x < 180 ? "" : "rotate(180)"); })
        .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
        .text(function(d) { return d.data.key; })
        .on("mouseover", mouseovered)
        .on("mouseout", mouseouted);
  });

  function mouseovered(d) {
    node
        .each(function(n) { n.target = n.source = false; });

    link
        .classed("link--target", function(l) { if (l.target === d) return l.source.source = true; })
        .classed("link--source", function(l) { if (l.source === d) return l.target.target = true; })
      .filter(function(l) { return l.target === d || l.source === d; })
        .raise();

    node
        .classed("node--target", function(n) { return n.target; })
        .classed("node--source", function(n) { return n.source; });
  }

  function mouseouted(d) {
    link
        .classed("link--target", false)
        .classed("link--source", false);

    node
        .classed("node--target", false)
        .classed("node--source", false);
  }

  // Lazily construct the package hierarchy from class names.
  function packageHierarchy(classes) {
    var map = {};

    function find(name, data) {
      var node = map[name], i;
      if (!node) {
        node = map[name] = data || {name: name, children: []};
        if (name.length) {
          node.parent = find(name.substring(0, i = name.lastIndexOf(".")));
          node.parent.children.push(node);
          node.key = name.substring(i + 1);
        }
      }
      return node;
    }

    classes.forEach(function(d) {
      find(d.name, d);
    });

    return d3.hierarchy(map[""]);
  }

  // Return a list of imports for the given array of nodes.
  function packageImports(nodes) {
    var map = {},
        imports = [];

    // Compute a map from name to node.
    nodes.forEach(function(d) {
      map[d.data.name] = d;
    });

    // For each import, construct a link from the source to target node.
    nodes.forEach(function(d) {
      if (d.data.imports) d.data.imports.forEach(function(i) {
        imports.push(map[d.data.name].path(map[i]));
      });
    });

    return imports;
  }
});
