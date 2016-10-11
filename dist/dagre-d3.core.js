(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.dagreD3 = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @license
 * Copyright (c) 2012-2013 Chris Pettitt
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
module.exports =  {
  graphlib: require("./lib/graphlib"),
  dagre: require("./lib/dagre"),
  intersect: require("./lib/intersect"),
  render: require("./lib/render"),
  util: require("./lib/util"),
  version: require("./lib/version")
};

},{"./lib/dagre":8,"./lib/graphlib":9,"./lib/intersect":10,"./lib/render":25,"./lib/util":27,"./lib/version":28}],2:[function(require,module,exports){
var util = require("./util");

module.exports = {
  "default": normal,
  "normal": normal,
  "vee": vee,
  "undirected": undirected
};

function normal(parent, id, edge, type) {
  var marker = parent.append("marker")
    .attr("id", id)
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 9)
    .attr("refY", 5)
    .attr("markerUnits", "strokeWidth")
    .attr("markerWidth", 8)
    .attr("markerHeight", 6)
    .attr("orient", "auto");

  var path = marker.append("path")
    .attr("d", "M 0 0 L 10 5 L 0 10 z")
    .style("stroke-width", 1)
    .style("stroke-dasharray", "1,0");
  util.applyStyle(path, edge[type + "Style"]);
  if (edge[type + "Class"]) {
    path.attr("class", edge[type + "Class"]);
  }
}

function vee(parent, id, edge, type) {
  var marker = parent.append("marker")
    .attr("id", id)
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 9)
    .attr("refY", 5)
    .attr("markerUnits", "strokeWidth")
    .attr("markerWidth", 8)
    .attr("markerHeight", 6)
    .attr("orient", "auto");

  var path = marker.append("path")
    .attr("d", "M 0 0 L 10 5 L 0 10 L 4 5 z")
    .style("stroke-width", 1)
    .style("stroke-dasharray", "1,0");
  util.applyStyle(path, edge[type + "Style"]);
  if (edge[type + "Class"]) {
    path.attr("class", edge[type + "Class"]);
  }
}

function undirected(parent, id, edge, type) {
  var marker = parent.append("marker")
    .attr("id", id)
    .attr("viewBox", "0 0 10 10")
    .attr("refX", 9)
    .attr("refY", 5)
    .attr("markerUnits", "strokeWidth")
    .attr("markerWidth", 8)
    .attr("markerHeight", 6)
    .attr("orient", "auto");

  var path = marker.append("path")
    .attr("d", "M 0 5 L 10 5")
    .style("stroke-width", 1)
    .style("stroke-dasharray", "1,0");
  util.applyStyle(path, edge[type + "Style"]);
  if (edge[type + "Class"]) {
    path.attr("class", edge[type + "Class"]);
  }
}

},{"./util":27}],3:[function(require,module,exports){
var util = require("./util"),
    addLabel = require("./label/add-label");

module.exports = createClusters;

function createClusters(selection, g) {
  var clusters = g.nodes().filter(function(v) { return util.isSubgraph(g, v); }),
      svgClusters = selection.selectAll("g.cluster")
        .data(clusters, function(v) { return v; });

  svgClusters.selectAll("*").remove();
  svgClusters.enter()
    .append("g")
      .attr("class", "cluster")
      .attr("id",function(v){
          var node = g.node(v);
          return node.id;
      })
      .style("opacity", 0);

  util.applyTransition(svgClusters, g)
    .style("opacity", 1);

  svgClusters =selection.selectAll("g.cluster");
  svgClusters.each(function(v) {
    var node = g.node(v),
        thisGroup = d3.select(this);
    d3.select(this).append("rect");
    var labelGroup = thisGroup.append("g").attr("class", "label");
    addLabel(labelGroup, node, node.clusterLabelPos);
  });

  svgClusters.selectAll("rect").each(function(c) {
    var node = g.node(c);
    var domCluster = d3.select(this);
    util.applyStyle(domCluster, node.style);
  });

  util.applyTransition(svgClusters.exit(), g)
    .style("opacity", 0)
    .remove();

  return svgClusters;
}

},{"./label/add-label":18,"./util":27}],4:[function(require,module,exports){
"use strict";

var _ = require("./lodash"),
    addLabel = require("./label/add-label"),
    util = require("./util"),
    d3 = require("./d3");

module.exports = createEdgeLabels;

function createEdgeLabels(selection, g) {
  var svgEdgeLabels = selection.selectAll("g.edgeLabel")
    .data(g.edges(), function(e) { return util.edgeToId(e); })
    .classed("update", true);

  svgEdgeLabels.selectAll("*").remove();
  svgEdgeLabels.enter()
    .append("g")
      .classed("edgeLabel", true)
      .style("opacity", 0);
  svgEdgeLabels = selection.selectAll("g.edgeLabel");
  svgEdgeLabels.each(function(e) {
    var edge = g.edge(e),
        label = addLabel(d3.select(this), g.edge(e), 0, 0).classed("label", true),
        bbox = label.node().getBBox();

    if (edge.labelId) { label.attr("id", edge.labelId); }
    if (!_.has(edge, "width")) { edge.width = bbox.width; }
    if (!_.has(edge, "height")) { edge.height = bbox.height; }
  });

  util.applyTransition(svgEdgeLabels.exit(), g)
    .style("opacity", 0)
    .remove();

  return svgEdgeLabels;
}

},{"./d3":7,"./label/add-label":18,"./lodash":21,"./util":27}],5:[function(require,module,exports){
"use strict";

var _ = require("./lodash"),
  intersectNode = require("./intersect/intersect-node"),
  util = require("./util"),
  d3 = require("./d3");
module.exports = createEdgePaths;

function createEdgePaths(selection, g, arrows) {
  var svgPaths = selection.selectAll("g.edgePath")
    .data(g.edges(), function (e) {
      return util.edgeToId(e);
    })
    .classed("update", true);

  enter(svgPaths, g);
  exit(svgPaths, g);

  svgPaths = selection.selectAll("g.edgePath");
  util.applyTransition(svgPaths, g)
    .style("opacity", 1);

  // Save DOM element in the path group, and set ID and class
  svgPaths.each(function (e) {
    var domEdge = d3.select(this);
    var edge = g.edge(e);
    edge.elem = this;

    if (edge.id) {
      domEdge.attr("id", edge.id);
    }

    util.applyClass(domEdge, edge["class"],
      (domEdge.classed("update") ? "update " : "") + "edgePath");
  });

  svgPaths.selectAll("path.path")
    .each(function (e) {
      var edge = g.edge(e);
      edge.arrowheadId = _.uniqueId("arrowhead");

      var domEdge = d3.select(this)
        .attr("marker-end", function () {
          return "url(" + makeFragmentRef(location.href, edge.arrowheadId) + ")";
        })
        .style("fill", "none");

      util.applyTransition(domEdge, g)
        .attr("d", function (e) {
          return calcPoints(g, e);
        });

      util.applyStyle(domEdge, edge.style);
    });

  svgPaths.selectAll("defs *").remove();
  svgPaths.selectAll("defs")
    .each(function (e) {
      var edge = g.edge(e),
        arrowhead = arrows[edge.arrowhead];
      arrowhead(d3.select(this), edge.arrowheadId, edge, "arrowhead");
    });

  return svgPaths;
}

function makeFragmentRef(url, fragmentId) {
  var baseUrl = url.split("#")[0];
  return baseUrl + "#" + fragmentId;
}

function calcPoints(g, e) {
  var edge = g.edge(e),
    tail = g.node(e.v),
    head = g.node(e.w),
    points = edge.points.slice(1, edge.points.length - 1);
  points.unshift(intersectNode(tail, points[0]));
  points.push(intersectNode(head, points[points.length - 1]));

  return createLine(edge, points);
}

function createLine(edge, points) {
  var line = d3.line()
    .x(function (d) {
      return d.x;
    })
    .y(function (d) {
      return d.y;
    });

  if (_.has(edge, "lineInterpolate")) {
    //line.curve(edge.lineInterpolate);
    line.curve(util.getLineMethod(edge.lineInterpolate));
  }
  // TODO: Line Tension has been deprecated
  //if (_.has(edge, "lineTension")) {
  //  line.tension(Number(edge.lineTension));
  //}

  return line(points);
}

function getCoords(elem) {
  var bbox = elem.getBBox(),
    matrix = elem.ownerSVGElement.getScreenCTM()
      .inverse()
      .multiply(elem.getScreenCTM())
      .translate(bbox.width / 2, bbox.height / 2);
  return {x: matrix.e, y: matrix.f};
}

function enter(svgPaths, g) {
  var svgPathsEnter = svgPaths.enter()
    .append("g")
    .attr("class", "edgePath")
    .style("opacity", 0);
  svgPathsEnter.append("path")
    .attr("class", "path")
    .attr("d", function (e) {
      var edge = g.edge(e),
        sourceElem = g.node(e.v).elem,
        points = _.range(edge.points.length).map(function () {
          return getCoords(sourceElem);
        });
      return createLine(edge, points);
    });
  svgPathsEnter.append("defs");
}

function exit(svgPaths, g) {
  var svgPathExit = svgPaths.exit();
  util.applyTransition(svgPathExit, g)
    .style("opacity", 0)
    .remove();

  util.applyTransition(svgPathExit.select("path.path"), g)
    .attr("d", function (e) {
      var source = g.node(e.v);

      if (source) {
        var points = _.range(this.getTotalLength()).map(function () {
          return source;
        });
        return createLine({}, points);
      } else {
        return d3.select(this).attr("d");
      }
    });
}

},{"./d3":7,"./intersect/intersect-node":14,"./lodash":21,"./util":27}],6:[function(require,module,exports){
"use strict";

var _ = require("./lodash"),
    addLabel = require("./label/add-label"),
    util = require("./util"),
    d3 = require("./d3");

module.exports = createNodes;

function createNodes(selection, g, shapes) {
  var simpleNodes = g.nodes().filter(function(v) { return !util.isSubgraph(g, v); });
  var svgNodes = selection.selectAll("g.node")
    .data(simpleNodes, function(v) {
      return v;
    })
    .classed("update", true);

  svgNodes.selectAll("*").remove();
  svgNodes.enter()
    .append("g")
      .attr("class", "node")
      .style("opacity", 0);
  svgNodes = selection.selectAll(".node");
  svgNodes.each(function(v) {
    var node = g.node(v),
        thisGroup = d3.select(this),
        shape = shapes[node.shape],
        labelGroup = thisGroup.append("g").attr("class", "label"),
        labelDom = addLabel(labelGroup, node),
        bbox = _.pick(labelDom.node().getBBox(), "width", "height");


    node.elem = this;

    if (node.id) { thisGroup.attr("id", node.id); }
    if (node.labelId) { labelGroup.attr("id", node.labelId); }
    util.applyClass(thisGroup, node["class"],
      (thisGroup.classed("update") ? "update " : "") + "node");

    if (_.has(node, "width")) { bbox.width = node.width; }
    if (_.has(node, "height")) { bbox.height = node.height; }

    bbox.width += node.paddingLeft + node.paddingRight;
    bbox.height += node.paddingTop + node.paddingBottom;
    labelGroup.attr("transform", "translate(" +
      ((node.paddingLeft - node.paddingRight) / 2) + "," +
      ((node.paddingTop - node.paddingBottom) / 2) + ")");

    var shapeSvg = shape(d3.select(this), bbox, node);
    util.applyStyle(shapeSvg, node.style);

    var shapeBBox = shapeSvg.node().getBBox();
    node.width = shapeBBox.width;
    node.height = shapeBBox.height;
  });

  util.applyTransition(svgNodes.exit(), g)
    .style("opacity", 0)
    .remove();

  return svgNodes;
}

},{"./d3":7,"./label/add-label":18,"./lodash":21,"./util":27}],7:[function(require,module,exports){
// Stub to get D3 either via NPM or from the global object
module.exports = window.d3;

},{}],8:[function(require,module,exports){
/* global window */

var dagre;

if (require) {
  try {
    dagre = require("dagre");
  } catch (e) {}
}

if (!dagre) {
  dagre = window.dagre;
}

module.exports = dagre;

},{"dagre":undefined}],9:[function(require,module,exports){
/* global window */

var graphlib;

if (require) {
  try {
    graphlib = require("graphlib");
  } catch (e) {}
}

if (!graphlib) {
  graphlib = window.graphlib;
}

module.exports = graphlib;

},{"graphlib":undefined}],10:[function(require,module,exports){
module.exports = {
  node: require("./intersect-node"),
  circle: require("./intersect-circle"),
  ellipse: require("./intersect-ellipse"),
  polygon: require("./intersect-polygon"),
  rect: require("./intersect-rect")
};

},{"./intersect-circle":11,"./intersect-ellipse":12,"./intersect-node":14,"./intersect-polygon":15,"./intersect-rect":16}],11:[function(require,module,exports){
var intersectEllipse = require("./intersect-ellipse");

module.exports = intersectCircle;

function intersectCircle(node, rx, point) {
  return intersectEllipse(node, rx, rx, point);
}

},{"./intersect-ellipse":12}],12:[function(require,module,exports){
module.exports = intersectEllipse;

function intersectEllipse(node, rx, ry, point) {
  // Formulae from: http://mathworld.wolfram.com/Ellipse-LineIntersection.html

  var cx = node.x;
  var cy = node.y;

  var px = cx - point.x;
  var py = cy - point.y;

  var det = Math.sqrt(rx * rx * py * py + ry * ry * px * px);

  var dx = Math.abs(rx * ry * px / det);
  if (point.x < cx) {
    dx = -dx;
  }
  var dy = Math.abs(rx * ry * py / det);
  if (point.y < cy) {
    dy = -dy;
  }

  return {x: cx + dx, y: cy + dy};
}


},{}],13:[function(require,module,exports){
module.exports = intersectLine;

/*
 * Returns the point at which two lines, p and q, intersect or returns
 * undefined if they do not intersect.
 */
function intersectLine(p1, p2, q1, q2) {
  // Algorithm from J. Avro, (ed.) Graphics Gems, No 2, Morgan Kaufmann, 1994,
  // p7 and p473.

  var a1, a2, b1, b2, c1, c2;
  var r1, r2 , r3, r4;
  var denom, offset, num;
  var x, y;

  // Compute a1, b1, c1, where line joining points 1 and 2 is F(x,y) = a1 x +
  // b1 y + c1 = 0.
  a1 = p2.y - p1.y;
  b1 = p1.x - p2.x;
  c1 = (p2.x * p1.y) - (p1.x * p2.y);

  // Compute r3 and r4.
  r3 = ((a1 * q1.x) + (b1 * q1.y) + c1);
  r4 = ((a1 * q2.x) + (b1 * q2.y) + c1);

  // Check signs of r3 and r4. If both point 3 and point 4 lie on
  // same side of line 1, the line segments do not intersect.
  if ((r3 !== 0) && (r4 !== 0) && sameSign(r3, r4)) {
    return /*DONT_INTERSECT*/;
  }

  // Compute a2, b2, c2 where line joining points 3 and 4 is G(x,y) = a2 x + b2 y + c2 = 0
  a2 = q2.y - q1.y;
  b2 = q1.x - q2.x;
  c2 = (q2.x * q1.y) - (q1.x * q2.y);

  // Compute r1 and r2
  r1 = (a2 * p1.x) + (b2 * p1.y) + c2;
  r2 = (a2 * p2.x) + (b2 * p2.y) + c2;

  // Check signs of r1 and r2. If both point 1 and point 2 lie
  // on same side of second line segment, the line segments do
  // not intersect.
  if ((r1 !== 0) && (r2 !== 0) && (sameSign(r1, r2))) {
    return /*DONT_INTERSECT*/;
  }

  // Line segments intersect: compute intersection point.
  denom = (a1 * b2) - (a2 * b1);
  if (denom === 0) {
    return /*COLLINEAR*/;
  }

  offset = Math.abs(denom / 2);

  // The denom/2 is to get rounding instead of truncating. It
  // is added or subtracted to the numerator, depending upon the
  // sign of the numerator.
  num = (b1 * c2) - (b2 * c1);
  x = (num < 0) ? ((num - offset) / denom) : ((num + offset) / denom);

  num = (a2 * c1) - (a1 * c2);
  y = (num < 0) ? ((num - offset) / denom) : ((num + offset) / denom);

  return { x: x, y: y };
}

function sameSign(r1, r2) {
  return r1 * r2 > 0;
}

},{}],14:[function(require,module,exports){
module.exports = intersectNode;

function intersectNode(node, point) {
  return node.intersect(point);
}

},{}],15:[function(require,module,exports){
var intersectLine = require("./intersect-line");

module.exports = intersectPolygon;

/*
 * Returns the point ({x, y}) at which the point argument intersects with the
 * node argument assuming that it has the shape specified by polygon.
 */
function intersectPolygon(node, polyPoints, point) {
  var x1 = node.x;
  var y1 = node.y;

  var intersections = [];

  var minX = Number.POSITIVE_INFINITY,
      minY = Number.POSITIVE_INFINITY;
  polyPoints.forEach(function(entry) {
    minX = Math.min(minX, entry.x);
    minY = Math.min(minY, entry.y);
  });

  var left = x1 - node.width / 2 - minX;
  var top =  y1 - node.height / 2 - minY;

  for (var i = 0; i < polyPoints.length; i++) {
    var p1 = polyPoints[i];
    var p2 = polyPoints[i < polyPoints.length - 1 ? i + 1 : 0];
    var intersect = intersectLine(node, point,
      {x: left + p1.x, y: top + p1.y}, {x: left + p2.x, y: top + p2.y});
    if (intersect) {
      intersections.push(intersect);
    }
  }

  if (!intersections.length) {
    console.log("NO INTERSECTION FOUND, RETURN NODE CENTER", node);
    return node;
  }

  if (intersections.length > 1) {
    // More intersections, find the one nearest to edge end point
    intersections.sort(function(p, q) {
      var pdx = p.x - point.x,
          pdy = p.y - point.y,
          distp = Math.sqrt(pdx * pdx + pdy * pdy),

          qdx = q.x - point.x,
          qdy = q.y - point.y,
          distq = Math.sqrt(qdx * qdx + qdy * qdy);

      return (distp < distq) ? -1 : (distp === distq ? 0 : 1);
    });
  }
  return intersections[0];
}

},{"./intersect-line":13}],16:[function(require,module,exports){
module.exports = intersectRect;

function intersectRect(node, point) {
  var x = node.x;
  var y = node.y;

  // Rectangle intersection algorithm from:
  // http://math.stackexchange.com/questions/108113/find-edge-between-two-boxes
  var dx = point.x - x;
  var dy = point.y - y;
  var w = node.width / 2;
  var h = node.height / 2;

  var sx, sy;
  if (Math.abs(dy) * w > Math.abs(dx) * h) {
    // Intersection is top or bottom of rect.
    if (dy < 0) {
      h = -h;
    }
    sx = dy === 0 ? 0 : h * dx / dy;
    sy = h;
  } else {
    // Intersection is left or right of rect.
    if (dx < 0) {
      w = -w;
    }
    sx = w;
    sy = dx === 0 ? 0 : w * dy / dx;
  }

  return {x: x + sx, y: y + sy};
}

},{}],17:[function(require,module,exports){
var util = require("../util");

module.exports = addHtmlLabel;

function addHtmlLabel(root, node) {
  var fo = root
    .append("foreignObject")
    .attr("width", "100000");

  var div = fo
    .append("xhtml:div");
  div.attr("xmlns", "http://www.w3.org/1999/xhtml");

  var label = node.label;
  switch (typeof label) {
    case "function":
      div.insert(label);
      break;
    case "object":
      // Currently we assume this is a DOM object.
      div.insert(function () {
        return label;
      });
      break;
    default:
      div.html(label);
  }

  util.applyStyle(div, node.labelStyle);
  div.style("display", "inline-block");
  // Fix for firefox
  div.style("white-space", "nowrap");

  var client = div._groups[0][0].getBoundingClientRect();
  fo
    .attr("width", client.width)
    .attr("height", client.height);

  return fo;
}

},{"../util":27}],18:[function(require,module,exports){
var addTextLabel = require("./add-text-label"),
    addHtmlLabel = require("./add-html-label"),
    addSVGLabel  = require("./add-svg-label");

module.exports = addLabel;

function addLabel(root, node, location) {
  var label = node.label;
  var labelSvg = root.append("g").lower();

  // Allow the label to be a string, a function that returns a DOM element, or
  // a DOM element itself.
  if (node.labelType === "svg") {
    addSVGLabel(labelSvg, node);
  } else if (typeof label !== "string" || node.labelType === "html") {
    addHtmlLabel(labelSvg, node);
  } else {
    addTextLabel(labelSvg, node);
  }

  var labelBBox = labelSvg.node().getBBox();
  var y;
  switch(location) {
    case "top":
      y = (-node.height / 2);
      break;
    case "bottom":
      y = (node.height / 2) - labelBBox.height;
      break;
    default:
      y = (-labelBBox.height / 2);
  }
  labelSvg.attr("transform",
                "translate(" + (-labelBBox.width / 2) + "," + y + ")");

  return labelSvg;
}

},{"./add-html-label":17,"./add-svg-label":19,"./add-text-label":20}],19:[function(require,module,exports){
var util = require("../util");

module.exports = addSVGLabel;

function addSVGLabel(root, node) {
  var domNode = root;

  domNode.node().appendChild(node.label);

  util.applyStyle(domNode, node.labelStyle);

  return domNode;
}

},{"../util":27}],20:[function(require,module,exports){
var util = require("../util");

module.exports = addTextLabel;

/*
 * Attaches a text label to the specified root. Handles escape sequences.
 */
function addTextLabel(root, node) {
  var domNode = root.append("text");

  var lines = processEscapeSequences(node.label).split("\n");
  for (var i = 0; i < lines.length; i++) {
    domNode
      .append("tspan")
        .attr("xml:space", "preserve")
        .attr("dy", "1em")
        .attr("x", "1")
        .text(lines[i]);
  }

  util.applyStyle(domNode, node.labelStyle);

  return domNode;
}

function processEscapeSequences(text) {
  var newText = "",
      escaped = false,
      ch;
  for (var i = 0; i < text.length; ++i) {
    ch = text[i];
    if (escaped) {
      switch(ch) {
        case "n": newText += "\n"; break;
        default: newText += ch;
      }
      escaped = false;
    } else if (ch === "\\") {
      escaped = true;
    } else {
      newText += ch;
    }
  }
  return newText;
}

},{"../util":27}],21:[function(require,module,exports){
/* global window */

var lodash;

if (require) {
  try {
    lodash = require("lodash");
  } catch (e) {}
}

if (!lodash) {
  lodash = window._;
}

module.exports = lodash;

},{"lodash":undefined}],22:[function(require,module,exports){
"use strict";

var util = require("./util"),
    d3 = require("./d3");

module.exports = positionClusters;

function positionClusters(selection, g) {
  var created = selection.filter(function() { return !d3.select(this).classed("update"); });

  function translate(v) {
    var node = g.node(v);
    return "translate(" + node.x + "," + node.y + ")";
  }

  created.attr("transform", translate);

  util.applyTransition(selection, g)
      .style("opacity", 1)
      .attr("transform", translate);

  util.applyTransition(created.selectAll("rect"), g)
      .attr("width", function(v) { return g.node(v).width; })
      .attr("height", function(v) { return g.node(v).height; })
      .attr("x", function(v) {
        var node = g.node(v);
        return -node.width / 2;
      })
      .attr("y", function(v) {
        var node = g.node(v);
        return -node.height / 2;
      });

}

},{"./d3":7,"./util":27}],23:[function(require,module,exports){
"use strict";

var util = require("./util"),
    d3 = require("./d3"),
    _ = require("./lodash");

module.exports = positionEdgeLabels;

function positionEdgeLabels(selection, g) {
  var created = selection.filter(function() { return !d3.select(this).classed("update"); });

  function translate(e) {
    var edge = g.edge(e);
    return _.has(edge, "x") ? "translate(" + edge.x + "," + edge.y + ")" : "";
  }

  created.attr("transform", translate);

  util.applyTransition(selection, g)
    .style("opacity", 1)
    .attr("transform", translate);
}

},{"./d3":7,"./lodash":21,"./util":27}],24:[function(require,module,exports){
"use strict";

var util = require("./util"),
    d3 = require("./d3");

module.exports = positionNodes;

function positionNodes(selection, g) {
  var created = selection.filter(function() { return !d3.select(this).classed("update"); });

  function translate(v) {
    var node = g.node(v);
    return "translate(" + node.x + "," + node.y + ")";
  }

  created.attr("transform", translate);

  util.applyTransition(selection, g)
    .style("opacity", 1)
    .attr("transform", translate);
}

},{"./d3":7,"./util":27}],25:[function(require,module,exports){
var _ = require("./lodash"),
    layout = require("./dagre").layout;

module.exports = render;

// This design is based on http://bost.ocks.org/mike/chart/.
function render() {
  var createNodes = require("./create-nodes"),
      createClusters = require("./create-clusters"),
      createEdgeLabels = require("./create-edge-labels"),
      createEdgePaths = require("./create-edge-paths"),
      positionNodes = require("./position-nodes"),
      positionEdgeLabels = require("./position-edge-labels"),
      positionClusters = require("./position-clusters"),
      shapes = require("./shapes"),
      arrows = require("./arrows");

  var fn = function(svg, g) {
    preProcessGraph(g);

    var outputGroup = createOrSelectGroup(svg, "output"),
        clustersGroup = createOrSelectGroup(outputGroup, "clusters"),
        edgePathsGroup = createOrSelectGroup(outputGroup, "edgePaths"),
        edgeLabels = createEdgeLabels(createOrSelectGroup(outputGroup, "edgeLabels"), g),
        nodes = createNodes(createOrSelectGroup(outputGroup, "nodes"), g, shapes);

    layout(g);

    positionNodes(nodes, g);
    positionEdgeLabels(edgeLabels, g);
    createEdgePaths(edgePathsGroup, g, arrows);

    var clusters = createClusters(clustersGroup, g);
    positionClusters(clusters, g);

    postProcessGraph(g);
  };

  fn.createNodes = function(value) {
    if (!arguments.length) return createNodes;
    createNodes = value;
    return fn;
  };

  fn.createClusters = function(value) {
    if (!arguments.length) return createClusters;
    createClusters = value;
    return fn;
  };

  fn.createEdgeLabels = function(value) {
    if (!arguments.length) return createEdgeLabels;
    createEdgeLabels = value;
    return fn;
  };

  fn.createEdgePaths = function(value) {
    if (!arguments.length) return createEdgePaths;
    createEdgePaths = value;
    return fn;
  };

  fn.shapes = function(value) {
    if (!arguments.length) return shapes;
    shapes = value;
    return fn;
  };

  fn.arrows = function(value) {
    if (!arguments.length) return arrows;
    arrows = value;
    return fn;
  };

  return fn;
}

var NODE_DEFAULT_ATTRS = {
  paddingLeft: 10,
  paddingRight: 10,
  paddingTop: 10,
  paddingBottom: 10,
  rx: 0,
  ry: 0,
  shape: "rect"
};

var EDGE_DEFAULT_ATTRS = {
  arrowhead: "normal",
  lineInterpolate: "linear"
};

function preProcessGraph(g) {
  g.nodes().forEach(function(v) {
    var node = g.node(v);
    if (!_.has(node, "label") && !g.children(v).length) { node.label = v; }

    if (_.has(node, "paddingX")) {
      _.defaults(node, {
        paddingLeft: node.paddingX,
        paddingRight: node.paddingX
      });
    }

    if (_.has(node, "paddingY")) {
      _.defaults(node, {
        paddingTop: node.paddingY,
        paddingBottom: node.paddingY
      });
    }

    if (_.has(node, "padding")) {
      _.defaults(node, {
        paddingLeft: node.padding,
        paddingRight: node.padding,
        paddingTop: node.padding,
        paddingBottom: node.padding
      });
    }

    _.defaults(node, NODE_DEFAULT_ATTRS);

    _.each(["paddingLeft", "paddingRight", "paddingTop", "paddingBottom"], function(k) {
      node[k] = Number(node[k]);
    });

    // Save dimensions for restore during post-processing
    if (_.has(node, "width")) { node._prevWidth = node.width; }
    if (_.has(node, "height")) { node._prevHeight = node.height; }
  });

  g.edges().forEach(function(e) {
    var edge = g.edge(e);
    if (!_.has(edge, "label")) { edge.label = ""; }
    _.defaults(edge, EDGE_DEFAULT_ATTRS);
  });
}

function postProcessGraph(g) {
  _.each(g.nodes(), function(v) {
    var node = g.node(v);

    // Restore original dimensions
    if (_.has(node, "_prevWidth")) {
      node.width = node._prevWidth;
    } else {
      delete node.width;
    }

    if (_.has(node, "_prevHeight")) {
      node.height = node._prevHeight;
    } else {
      delete node.height;
    }

    delete node._prevWidth;
    delete node._prevHeight;
  });
}

function createOrSelectGroup(root, name) {
  var selection = root.select("g." + name);
  if (selection.empty()) {
    selection = root.append("g").attr("class", name);
  }
  return selection;
}

},{"./arrows":2,"./create-clusters":3,"./create-edge-labels":4,"./create-edge-paths":5,"./create-nodes":6,"./dagre":8,"./lodash":21,"./position-clusters":22,"./position-edge-labels":23,"./position-nodes":24,"./shapes":26}],26:[function(require,module,exports){
"use strict";

var intersectRect = require("./intersect/intersect-rect"),
    intersectEllipse = require("./intersect/intersect-ellipse"),
    intersectCircle = require("./intersect/intersect-circle"),
    intersectPolygon = require("./intersect/intersect-polygon");

module.exports = {
  rect: rect,
  ellipse: ellipse,
  circle: circle,
  diamond: diamond
};

function rect(parent, bbox, node) {
  var shapeSvg = parent.insert("rect")
        .attr("rx", node.rx)
        .attr("ry", node.ry)
        .attr("x", -bbox.width / 2)
        .attr("y", -bbox.height / 2)
        .attr("width", bbox.width)
        .attr("height", bbox.height)
      .lower();

  node.intersect = function(point) {
    return intersectRect(node, point);
  };

  return shapeSvg;
}

function ellipse(parent, bbox, node) {
  var rx = bbox.width / 2,
      ry = bbox.height / 2,
      shapeSvg = parent.append("ellipse", ":first-child")
        .attr("x", -bbox.width / 2)
        .attr("y", -bbox.height / 2)
        .attr("rx", rx)
        .attr("ry", ry)
          .lower();

  node.intersect = function(point) {
    return intersectEllipse(node, rx, ry, point);
  };

  return shapeSvg;
}

function circle(parent, bbox, node) {
  var r = Math.max(bbox.width, bbox.height) / 2,
      shapeSvg = parent.append("circle", ":first-child")
        .attr("x", -bbox.width / 2)
        .attr("y", -bbox.height / 2)
        .attr("r", r)
          .lower();

  node.intersect = function(point) {
    return intersectCircle(node, r, point);
  };

  return shapeSvg;
}

// Circumscribe an ellipse for the bounding box with a diamond shape. I derived
// the function to calculate the diamond shape from:
// http://mathforum.org/kb/message.jspa?messageID=3750236
function diamond(parent, bbox, node) {
  var w = (bbox.width * Math.SQRT2) / 2,
      h = (bbox.height * Math.SQRT2) / 2,
      points = [
        { x:  0, y: -h },
        { x: -w, y:  0 },
        { x:  0, y:  h },
        { x:  w, y:  0 }
      ],
      shapeSvg = parent.append("polygon", ":first-child")
        .attr("points", points.map(function(p) { return p.x + "," + p.y; }).join(" "))
          .lower();

  node.intersect = function(p) {
    return intersectPolygon(node, points, p);
  };

  return shapeSvg;
}

},{"./intersect/intersect-circle":11,"./intersect/intersect-ellipse":12,"./intersect/intersect-polygon":15,"./intersect/intersect-rect":16}],27:[function(require,module,exports){
var _ = require("./lodash");

// Public utility functions
module.exports = {
  isSubgraph: isSubgraph,
  edgeToId: edgeToId,
  applyStyle: applyStyle,
  applyClass: applyClass,
  applyTransition: applyTransition,
  getLineMethod: getLineMethod
};

/*
 * Returns true if the specified node in the graph is a subgraph node. A
 * subgraph node is one that contains other nodes.
 */
function isSubgraph(g, v) {
  return !!g.children(v).length;
}

function edgeToId(e) {
  return escapeId(e.v) + ":" + escapeId(e.w) + ":" + escapeId(e.name);
}

var ID_DELIM = /:/g;
function escapeId(str) {
  return str ? String(str).replace(ID_DELIM, "\\:") : "";
}

function applyStyle(dom, styleFn) {
  if (styleFn) {
    dom.attr("style", styleFn);
  }
}

function applyClass(dom, classFn, otherClasses) {
  if (classFn) {
    dom
      .attr("class", classFn)
      .attr("class", otherClasses + " " + dom.attr("class"));
  }
}

function applyTransition(selection, g) {
  var graph = g.graph();

  if (_.isPlainObject(graph)) {
    var transition = graph.transition;
    if (_.isFunction(transition)) {
      return transition(selection);
    }
  }

  return selection;
}

function getLineMethod(lineType) {
  var lines = {
    "linear": d3.curveLinear,
    "linear-closed": d3.curveLinearClosed,
    "step": d3.curveStep,
    "step-before": d3.curveStepBefore,
    "step-after": d3.curveStepAfter,
    "basis": d3.curveBasis,
    "basis-open": d3.curveBasisOpen,
    "basis-closed": d3.curveBasisClosed,
    "bundle": d3.curveBundle,
    "cardinal": d3.curveCardinal,
    "cardinal-open": d3.curveCardinalOpen,
    "cardinal-closed": d3.curveCardinalClosed,
    "monotone": d3.curveMonotoneX
  };

  return lines[lineType];
}

},{"./lodash":21}],28:[function(require,module,exports){
module.exports = "0.4.18-pre";

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsImxpYi9hcnJvd3MuanMiLCJsaWIvY3JlYXRlLWNsdXN0ZXJzLmpzIiwibGliL2NyZWF0ZS1lZGdlLWxhYmVscy5qcyIsImxpYi9jcmVhdGUtZWRnZS1wYXRocy5qcyIsImxpYi9jcmVhdGUtbm9kZXMuanMiLCJsaWIvZDMuanMiLCJsaWIvZGFncmUuanMiLCJsaWIvZ3JhcGhsaWIuanMiLCJsaWIvaW50ZXJzZWN0L2luZGV4LmpzIiwibGliL2ludGVyc2VjdC9pbnRlcnNlY3QtY2lyY2xlLmpzIiwibGliL2ludGVyc2VjdC9pbnRlcnNlY3QtZWxsaXBzZS5qcyIsImxpYi9pbnRlcnNlY3QvaW50ZXJzZWN0LWxpbmUuanMiLCJsaWIvaW50ZXJzZWN0L2ludGVyc2VjdC1ub2RlLmpzIiwibGliL2ludGVyc2VjdC9pbnRlcnNlY3QtcG9seWdvbi5qcyIsImxpYi9pbnRlcnNlY3QvaW50ZXJzZWN0LXJlY3QuanMiLCJsaWIvbGFiZWwvYWRkLWh0bWwtbGFiZWwuanMiLCJsaWIvbGFiZWwvYWRkLWxhYmVsLmpzIiwibGliL2xhYmVsL2FkZC1zdmctbGFiZWwuanMiLCJsaWIvbGFiZWwvYWRkLXRleHQtbGFiZWwuanMiLCJsaWIvbG9kYXNoLmpzIiwibGliL3Bvc2l0aW9uLWNsdXN0ZXJzLmpzIiwibGliL3Bvc2l0aW9uLWVkZ2UtbGFiZWxzLmpzIiwibGliL3Bvc2l0aW9uLW5vZGVzLmpzIiwibGliL3JlbmRlci5qcyIsImxpYi9zaGFwZXMuanMiLCJsaWIvdXRpbC5qcyIsImxpYi92ZXJzaW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBOztBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRUE7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTItMjAxMyBDaHJpcyBQZXR0aXR0XG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluXG4gKiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU5cbiAqIFRIRSBTT0ZUV0FSRS5cbiAqL1xubW9kdWxlLmV4cG9ydHMgPSAge1xuICBncmFwaGxpYjogcmVxdWlyZShcIi4vbGliL2dyYXBobGliXCIpLFxuICBkYWdyZTogcmVxdWlyZShcIi4vbGliL2RhZ3JlXCIpLFxuICBpbnRlcnNlY3Q6IHJlcXVpcmUoXCIuL2xpYi9pbnRlcnNlY3RcIiksXG4gIHJlbmRlcjogcmVxdWlyZShcIi4vbGliL3JlbmRlclwiKSxcbiAgdXRpbDogcmVxdWlyZShcIi4vbGliL3V0aWxcIiksXG4gIHZlcnNpb246IHJlcXVpcmUoXCIuL2xpYi92ZXJzaW9uXCIpXG59O1xuIiwidmFyIHV0aWwgPSByZXF1aXJlKFwiLi91dGlsXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgXCJkZWZhdWx0XCI6IG5vcm1hbCxcbiAgXCJub3JtYWxcIjogbm9ybWFsLFxuICBcInZlZVwiOiB2ZWUsXG4gIFwidW5kaXJlY3RlZFwiOiB1bmRpcmVjdGVkXG59O1xuXG5mdW5jdGlvbiBub3JtYWwocGFyZW50LCBpZCwgZWRnZSwgdHlwZSkge1xuICB2YXIgbWFya2VyID0gcGFyZW50LmFwcGVuZChcIm1hcmtlclwiKVxuICAgIC5hdHRyKFwiaWRcIiwgaWQpXG4gICAgLmF0dHIoXCJ2aWV3Qm94XCIsIFwiMCAwIDEwIDEwXCIpXG4gICAgLmF0dHIoXCJyZWZYXCIsIDkpXG4gICAgLmF0dHIoXCJyZWZZXCIsIDUpXG4gICAgLmF0dHIoXCJtYXJrZXJVbml0c1wiLCBcInN0cm9rZVdpZHRoXCIpXG4gICAgLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCA4KVxuICAgIC5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDYpXG4gICAgLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpO1xuXG4gIHZhciBwYXRoID0gbWFya2VyLmFwcGVuZChcInBhdGhcIilcbiAgICAuYXR0cihcImRcIiwgXCJNIDAgMCBMIDEwIDUgTCAwIDEwIHpcIilcbiAgICAuc3R5bGUoXCJzdHJva2Utd2lkdGhcIiwgMSlcbiAgICAuc3R5bGUoXCJzdHJva2UtZGFzaGFycmF5XCIsIFwiMSwwXCIpO1xuICB1dGlsLmFwcGx5U3R5bGUocGF0aCwgZWRnZVt0eXBlICsgXCJTdHlsZVwiXSk7XG4gIGlmIChlZGdlW3R5cGUgKyBcIkNsYXNzXCJdKSB7XG4gICAgcGF0aC5hdHRyKFwiY2xhc3NcIiwgZWRnZVt0eXBlICsgXCJDbGFzc1wiXSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gdmVlKHBhcmVudCwgaWQsIGVkZ2UsIHR5cGUpIHtcbiAgdmFyIG1hcmtlciA9IHBhcmVudC5hcHBlbmQoXCJtYXJrZXJcIilcbiAgICAuYXR0cihcImlkXCIsIGlkKVxuICAgIC5hdHRyKFwidmlld0JveFwiLCBcIjAgMCAxMCAxMFwiKVxuICAgIC5hdHRyKFwicmVmWFwiLCA5KVxuICAgIC5hdHRyKFwicmVmWVwiLCA1KVxuICAgIC5hdHRyKFwibWFya2VyVW5pdHNcIiwgXCJzdHJva2VXaWR0aFwiKVxuICAgIC5hdHRyKFwibWFya2VyV2lkdGhcIiwgOClcbiAgICAuYXR0cihcIm1hcmtlckhlaWdodFwiLCA2KVxuICAgIC5hdHRyKFwib3JpZW50XCIsIFwiYXV0b1wiKTtcblxuICB2YXIgcGF0aCA9IG1hcmtlci5hcHBlbmQoXCJwYXRoXCIpXG4gICAgLmF0dHIoXCJkXCIsIFwiTSAwIDAgTCAxMCA1IEwgMCAxMCBMIDQgNSB6XCIpXG4gICAgLnN0eWxlKFwic3Ryb2tlLXdpZHRoXCIsIDEpXG4gICAgLnN0eWxlKFwic3Ryb2tlLWRhc2hhcnJheVwiLCBcIjEsMFwiKTtcbiAgdXRpbC5hcHBseVN0eWxlKHBhdGgsIGVkZ2VbdHlwZSArIFwiU3R5bGVcIl0pO1xuICBpZiAoZWRnZVt0eXBlICsgXCJDbGFzc1wiXSkge1xuICAgIHBhdGguYXR0cihcImNsYXNzXCIsIGVkZ2VbdHlwZSArIFwiQ2xhc3NcIl0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIHVuZGlyZWN0ZWQocGFyZW50LCBpZCwgZWRnZSwgdHlwZSkge1xuICB2YXIgbWFya2VyID0gcGFyZW50LmFwcGVuZChcIm1hcmtlclwiKVxuICAgIC5hdHRyKFwiaWRcIiwgaWQpXG4gICAgLmF0dHIoXCJ2aWV3Qm94XCIsIFwiMCAwIDEwIDEwXCIpXG4gICAgLmF0dHIoXCJyZWZYXCIsIDkpXG4gICAgLmF0dHIoXCJyZWZZXCIsIDUpXG4gICAgLmF0dHIoXCJtYXJrZXJVbml0c1wiLCBcInN0cm9rZVdpZHRoXCIpXG4gICAgLmF0dHIoXCJtYXJrZXJXaWR0aFwiLCA4KVxuICAgIC5hdHRyKFwibWFya2VySGVpZ2h0XCIsIDYpXG4gICAgLmF0dHIoXCJvcmllbnRcIiwgXCJhdXRvXCIpO1xuXG4gIHZhciBwYXRoID0gbWFya2VyLmFwcGVuZChcInBhdGhcIilcbiAgICAuYXR0cihcImRcIiwgXCJNIDAgNSBMIDEwIDVcIilcbiAgICAuc3R5bGUoXCJzdHJva2Utd2lkdGhcIiwgMSlcbiAgICAuc3R5bGUoXCJzdHJva2UtZGFzaGFycmF5XCIsIFwiMSwwXCIpO1xuICB1dGlsLmFwcGx5U3R5bGUocGF0aCwgZWRnZVt0eXBlICsgXCJTdHlsZVwiXSk7XG4gIGlmIChlZGdlW3R5cGUgKyBcIkNsYXNzXCJdKSB7XG4gICAgcGF0aC5hdHRyKFwiY2xhc3NcIiwgZWRnZVt0eXBlICsgXCJDbGFzc1wiXSk7XG4gIH1cbn1cbiIsInZhciB1dGlsID0gcmVxdWlyZShcIi4vdXRpbFwiKSxcbiAgICBhZGRMYWJlbCA9IHJlcXVpcmUoXCIuL2xhYmVsL2FkZC1sYWJlbFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBjcmVhdGVDbHVzdGVycztcblxuZnVuY3Rpb24gY3JlYXRlQ2x1c3RlcnMoc2VsZWN0aW9uLCBnKSB7XG4gIHZhciBjbHVzdGVycyA9IGcubm9kZXMoKS5maWx0ZXIoZnVuY3Rpb24odikgeyByZXR1cm4gdXRpbC5pc1N1YmdyYXBoKGcsIHYpOyB9KSxcbiAgICAgIHN2Z0NsdXN0ZXJzID0gc2VsZWN0aW9uLnNlbGVjdEFsbChcImcuY2x1c3RlclwiKVxuICAgICAgICAuZGF0YShjbHVzdGVycywgZnVuY3Rpb24odikgeyByZXR1cm4gdjsgfSk7XG5cbiAgc3ZnQ2x1c3RlcnMuc2VsZWN0QWxsKFwiKlwiKS5yZW1vdmUoKTtcbiAgc3ZnQ2x1c3RlcnMuZW50ZXIoKVxuICAgIC5hcHBlbmQoXCJnXCIpXG4gICAgICAuYXR0cihcImNsYXNzXCIsIFwiY2x1c3RlclwiKVxuICAgICAgLmF0dHIoXCJpZFwiLGZ1bmN0aW9uKHYpe1xuICAgICAgICAgIHZhciBub2RlID0gZy5ub2RlKHYpO1xuICAgICAgICAgIHJldHVybiBub2RlLmlkO1xuICAgICAgfSlcbiAgICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMCk7XG5cbiAgdXRpbC5hcHBseVRyYW5zaXRpb24oc3ZnQ2x1c3RlcnMsIGcpXG4gICAgLnN0eWxlKFwib3BhY2l0eVwiLCAxKTtcblxuICBzdmdDbHVzdGVycyA9c2VsZWN0aW9uLnNlbGVjdEFsbChcImcuY2x1c3RlclwiKTtcbiAgc3ZnQ2x1c3RlcnMuZWFjaChmdW5jdGlvbih2KSB7XG4gICAgdmFyIG5vZGUgPSBnLm5vZGUodiksXG4gICAgICAgIHRoaXNHcm91cCA9IGQzLnNlbGVjdCh0aGlzKTtcbiAgICBkMy5zZWxlY3QodGhpcykuYXBwZW5kKFwicmVjdFwiKTtcbiAgICB2YXIgbGFiZWxHcm91cCA9IHRoaXNHcm91cC5hcHBlbmQoXCJnXCIpLmF0dHIoXCJjbGFzc1wiLCBcImxhYmVsXCIpO1xuICAgIGFkZExhYmVsKGxhYmVsR3JvdXAsIG5vZGUsIG5vZGUuY2x1c3RlckxhYmVsUG9zKTtcbiAgfSk7XG5cbiAgc3ZnQ2x1c3RlcnMuc2VsZWN0QWxsKFwicmVjdFwiKS5lYWNoKGZ1bmN0aW9uKGMpIHtcbiAgICB2YXIgbm9kZSA9IGcubm9kZShjKTtcbiAgICB2YXIgZG9tQ2x1c3RlciA9IGQzLnNlbGVjdCh0aGlzKTtcbiAgICB1dGlsLmFwcGx5U3R5bGUoZG9tQ2x1c3Rlciwgbm9kZS5zdHlsZSk7XG4gIH0pO1xuXG4gIHV0aWwuYXBwbHlUcmFuc2l0aW9uKHN2Z0NsdXN0ZXJzLmV4aXQoKSwgZylcbiAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIDApXG4gICAgLnJlbW92ZSgpO1xuXG4gIHJldHVybiBzdmdDbHVzdGVycztcbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoXCIuL2xvZGFzaFwiKSxcbiAgICBhZGRMYWJlbCA9IHJlcXVpcmUoXCIuL2xhYmVsL2FkZC1sYWJlbFwiKSxcbiAgICB1dGlsID0gcmVxdWlyZShcIi4vdXRpbFwiKSxcbiAgICBkMyA9IHJlcXVpcmUoXCIuL2QzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZUVkZ2VMYWJlbHM7XG5cbmZ1bmN0aW9uIGNyZWF0ZUVkZ2VMYWJlbHMoc2VsZWN0aW9uLCBnKSB7XG4gIHZhciBzdmdFZGdlTGFiZWxzID0gc2VsZWN0aW9uLnNlbGVjdEFsbChcImcuZWRnZUxhYmVsXCIpXG4gICAgLmRhdGEoZy5lZGdlcygpLCBmdW5jdGlvbihlKSB7IHJldHVybiB1dGlsLmVkZ2VUb0lkKGUpOyB9KVxuICAgIC5jbGFzc2VkKFwidXBkYXRlXCIsIHRydWUpO1xuXG4gIHN2Z0VkZ2VMYWJlbHMuc2VsZWN0QWxsKFwiKlwiKS5yZW1vdmUoKTtcbiAgc3ZnRWRnZUxhYmVscy5lbnRlcigpXG4gICAgLmFwcGVuZChcImdcIilcbiAgICAgIC5jbGFzc2VkKFwiZWRnZUxhYmVsXCIsIHRydWUpXG4gICAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIDApO1xuICBzdmdFZGdlTGFiZWxzID0gc2VsZWN0aW9uLnNlbGVjdEFsbChcImcuZWRnZUxhYmVsXCIpO1xuICBzdmdFZGdlTGFiZWxzLmVhY2goZnVuY3Rpb24oZSkge1xuICAgIHZhciBlZGdlID0gZy5lZGdlKGUpLFxuICAgICAgICBsYWJlbCA9IGFkZExhYmVsKGQzLnNlbGVjdCh0aGlzKSwgZy5lZGdlKGUpLCAwLCAwKS5jbGFzc2VkKFwibGFiZWxcIiwgdHJ1ZSksXG4gICAgICAgIGJib3ggPSBsYWJlbC5ub2RlKCkuZ2V0QkJveCgpO1xuXG4gICAgaWYgKGVkZ2UubGFiZWxJZCkgeyBsYWJlbC5hdHRyKFwiaWRcIiwgZWRnZS5sYWJlbElkKTsgfVxuICAgIGlmICghXy5oYXMoZWRnZSwgXCJ3aWR0aFwiKSkgeyBlZGdlLndpZHRoID0gYmJveC53aWR0aDsgfVxuICAgIGlmICghXy5oYXMoZWRnZSwgXCJoZWlnaHRcIikpIHsgZWRnZS5oZWlnaHQgPSBiYm94LmhlaWdodDsgfVxuICB9KTtcblxuICB1dGlsLmFwcGx5VHJhbnNpdGlvbihzdmdFZGdlTGFiZWxzLmV4aXQoKSwgZylcbiAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIDApXG4gICAgLnJlbW92ZSgpO1xuXG4gIHJldHVybiBzdmdFZGdlTGFiZWxzO1xufVxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBfID0gcmVxdWlyZShcIi4vbG9kYXNoXCIpLFxuICBpbnRlcnNlY3ROb2RlID0gcmVxdWlyZShcIi4vaW50ZXJzZWN0L2ludGVyc2VjdC1ub2RlXCIpLFxuICB1dGlsID0gcmVxdWlyZShcIi4vdXRpbFwiKSxcbiAgZDMgPSByZXF1aXJlKFwiLi9kM1wiKTtcbm1vZHVsZS5leHBvcnRzID0gY3JlYXRlRWRnZVBhdGhzO1xuXG5mdW5jdGlvbiBjcmVhdGVFZGdlUGF0aHMoc2VsZWN0aW9uLCBnLCBhcnJvd3MpIHtcbiAgdmFyIHN2Z1BhdGhzID0gc2VsZWN0aW9uLnNlbGVjdEFsbChcImcuZWRnZVBhdGhcIilcbiAgICAuZGF0YShnLmVkZ2VzKCksIGZ1bmN0aW9uIChlKSB7XG4gICAgICByZXR1cm4gdXRpbC5lZGdlVG9JZChlKTtcbiAgICB9KVxuICAgIC5jbGFzc2VkKFwidXBkYXRlXCIsIHRydWUpO1xuXG4gIGVudGVyKHN2Z1BhdGhzLCBnKTtcbiAgZXhpdChzdmdQYXRocywgZyk7XG5cbiAgc3ZnUGF0aHMgPSBzZWxlY3Rpb24uc2VsZWN0QWxsKFwiZy5lZGdlUGF0aFwiKTtcbiAgdXRpbC5hcHBseVRyYW5zaXRpb24oc3ZnUGF0aHMsIGcpXG4gICAgLnN0eWxlKFwib3BhY2l0eVwiLCAxKTtcblxuICAvLyBTYXZlIERPTSBlbGVtZW50IGluIHRoZSBwYXRoIGdyb3VwLCBhbmQgc2V0IElEIGFuZCBjbGFzc1xuICBzdmdQYXRocy5lYWNoKGZ1bmN0aW9uIChlKSB7XG4gICAgdmFyIGRvbUVkZ2UgPSBkMy5zZWxlY3QodGhpcyk7XG4gICAgdmFyIGVkZ2UgPSBnLmVkZ2UoZSk7XG4gICAgZWRnZS5lbGVtID0gdGhpcztcblxuICAgIGlmIChlZGdlLmlkKSB7XG4gICAgICBkb21FZGdlLmF0dHIoXCJpZFwiLCBlZGdlLmlkKTtcbiAgICB9XG5cbiAgICB1dGlsLmFwcGx5Q2xhc3MoZG9tRWRnZSwgZWRnZVtcImNsYXNzXCJdLFxuICAgICAgKGRvbUVkZ2UuY2xhc3NlZChcInVwZGF0ZVwiKSA/IFwidXBkYXRlIFwiIDogXCJcIikgKyBcImVkZ2VQYXRoXCIpO1xuICB9KTtcblxuICBzdmdQYXRocy5zZWxlY3RBbGwoXCJwYXRoLnBhdGhcIilcbiAgICAuZWFjaChmdW5jdGlvbiAoZSkge1xuICAgICAgdmFyIGVkZ2UgPSBnLmVkZ2UoZSk7XG4gICAgICBlZGdlLmFycm93aGVhZElkID0gXy51bmlxdWVJZChcImFycm93aGVhZFwiKTtcblxuICAgICAgdmFyIGRvbUVkZ2UgPSBkMy5zZWxlY3QodGhpcylcbiAgICAgICAgLmF0dHIoXCJtYXJrZXItZW5kXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICByZXR1cm4gXCJ1cmwoXCIgKyBtYWtlRnJhZ21lbnRSZWYobG9jYXRpb24uaHJlZiwgZWRnZS5hcnJvd2hlYWRJZCkgKyBcIilcIjtcbiAgICAgICAgfSlcbiAgICAgICAgLnN0eWxlKFwiZmlsbFwiLCBcIm5vbmVcIik7XG5cbiAgICAgIHV0aWwuYXBwbHlUcmFuc2l0aW9uKGRvbUVkZ2UsIGcpXG4gICAgICAgIC5hdHRyKFwiZFwiLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgIHJldHVybiBjYWxjUG9pbnRzKGcsIGUpO1xuICAgICAgICB9KTtcblxuICAgICAgdXRpbC5hcHBseVN0eWxlKGRvbUVkZ2UsIGVkZ2Uuc3R5bGUpO1xuICAgIH0pO1xuXG4gIHN2Z1BhdGhzLnNlbGVjdEFsbChcImRlZnMgKlwiKS5yZW1vdmUoKTtcbiAgc3ZnUGF0aHMuc2VsZWN0QWxsKFwiZGVmc1wiKVxuICAgIC5lYWNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICB2YXIgZWRnZSA9IGcuZWRnZShlKSxcbiAgICAgICAgYXJyb3doZWFkID0gYXJyb3dzW2VkZ2UuYXJyb3doZWFkXTtcbiAgICAgIGFycm93aGVhZChkMy5zZWxlY3QodGhpcyksIGVkZ2UuYXJyb3doZWFkSWQsIGVkZ2UsIFwiYXJyb3doZWFkXCIpO1xuICAgIH0pO1xuXG4gIHJldHVybiBzdmdQYXRocztcbn1cblxuZnVuY3Rpb24gbWFrZUZyYWdtZW50UmVmKHVybCwgZnJhZ21lbnRJZCkge1xuICB2YXIgYmFzZVVybCA9IHVybC5zcGxpdChcIiNcIilbMF07XG4gIHJldHVybiBiYXNlVXJsICsgXCIjXCIgKyBmcmFnbWVudElkO1xufVxuXG5mdW5jdGlvbiBjYWxjUG9pbnRzKGcsIGUpIHtcbiAgdmFyIGVkZ2UgPSBnLmVkZ2UoZSksXG4gICAgdGFpbCA9IGcubm9kZShlLnYpLFxuICAgIGhlYWQgPSBnLm5vZGUoZS53KSxcbiAgICBwb2ludHMgPSBlZGdlLnBvaW50cy5zbGljZSgxLCBlZGdlLnBvaW50cy5sZW5ndGggLSAxKTtcbiAgcG9pbnRzLnVuc2hpZnQoaW50ZXJzZWN0Tm9kZSh0YWlsLCBwb2ludHNbMF0pKTtcbiAgcG9pbnRzLnB1c2goaW50ZXJzZWN0Tm9kZShoZWFkLCBwb2ludHNbcG9pbnRzLmxlbmd0aCAtIDFdKSk7XG5cbiAgcmV0dXJuIGNyZWF0ZUxpbmUoZWRnZSwgcG9pbnRzKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTGluZShlZGdlLCBwb2ludHMpIHtcbiAgdmFyIGxpbmUgPSBkMy5saW5lKClcbiAgICAueChmdW5jdGlvbiAoZCkge1xuICAgICAgcmV0dXJuIGQueDtcbiAgICB9KVxuICAgIC55KGZ1bmN0aW9uIChkKSB7XG4gICAgICByZXR1cm4gZC55O1xuICAgIH0pO1xuXG4gIGlmIChfLmhhcyhlZGdlLCBcImxpbmVJbnRlcnBvbGF0ZVwiKSkge1xuICAgIC8vbGluZS5jdXJ2ZShlZGdlLmxpbmVJbnRlcnBvbGF0ZSk7XG4gICAgbGluZS5jdXJ2ZSh1dGlsLmdldExpbmVNZXRob2QoZWRnZS5saW5lSW50ZXJwb2xhdGUpKTtcbiAgfVxuICAvLyBUT0RPOiBMaW5lIFRlbnNpb24gaGFzIGJlZW4gZGVwcmVjYXRlZFxuICAvL2lmIChfLmhhcyhlZGdlLCBcImxpbmVUZW5zaW9uXCIpKSB7XG4gIC8vICBsaW5lLnRlbnNpb24oTnVtYmVyKGVkZ2UubGluZVRlbnNpb24pKTtcbiAgLy99XG5cbiAgcmV0dXJuIGxpbmUocG9pbnRzKTtcbn1cblxuZnVuY3Rpb24gZ2V0Q29vcmRzKGVsZW0pIHtcbiAgdmFyIGJib3ggPSBlbGVtLmdldEJCb3goKSxcbiAgICBtYXRyaXggPSBlbGVtLm93bmVyU1ZHRWxlbWVudC5nZXRTY3JlZW5DVE0oKVxuICAgICAgLmludmVyc2UoKVxuICAgICAgLm11bHRpcGx5KGVsZW0uZ2V0U2NyZWVuQ1RNKCkpXG4gICAgICAudHJhbnNsYXRlKGJib3gud2lkdGggLyAyLCBiYm94LmhlaWdodCAvIDIpO1xuICByZXR1cm4ge3g6IG1hdHJpeC5lLCB5OiBtYXRyaXguZn07XG59XG5cbmZ1bmN0aW9uIGVudGVyKHN2Z1BhdGhzLCBnKSB7XG4gIHZhciBzdmdQYXRoc0VudGVyID0gc3ZnUGF0aHMuZW50ZXIoKVxuICAgIC5hcHBlbmQoXCJnXCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcImVkZ2VQYXRoXCIpXG4gICAgLnN0eWxlKFwib3BhY2l0eVwiLCAwKTtcbiAgc3ZnUGF0aHNFbnRlci5hcHBlbmQoXCJwYXRoXCIpXG4gICAgLmF0dHIoXCJjbGFzc1wiLCBcInBhdGhcIilcbiAgICAuYXR0cihcImRcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgIHZhciBlZGdlID0gZy5lZGdlKGUpLFxuICAgICAgICBzb3VyY2VFbGVtID0gZy5ub2RlKGUudikuZWxlbSxcbiAgICAgICAgcG9pbnRzID0gXy5yYW5nZShlZGdlLnBvaW50cy5sZW5ndGgpLm1hcChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIGdldENvb3Jkcyhzb3VyY2VFbGVtKTtcbiAgICAgICAgfSk7XG4gICAgICByZXR1cm4gY3JlYXRlTGluZShlZGdlLCBwb2ludHMpO1xuICAgIH0pO1xuICBzdmdQYXRoc0VudGVyLmFwcGVuZChcImRlZnNcIik7XG59XG5cbmZ1bmN0aW9uIGV4aXQoc3ZnUGF0aHMsIGcpIHtcbiAgdmFyIHN2Z1BhdGhFeGl0ID0gc3ZnUGF0aHMuZXhpdCgpO1xuICB1dGlsLmFwcGx5VHJhbnNpdGlvbihzdmdQYXRoRXhpdCwgZylcbiAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIDApXG4gICAgLnJlbW92ZSgpO1xuXG4gIHV0aWwuYXBwbHlUcmFuc2l0aW9uKHN2Z1BhdGhFeGl0LnNlbGVjdChcInBhdGgucGF0aFwiKSwgZylcbiAgICAuYXR0cihcImRcIiwgZnVuY3Rpb24gKGUpIHtcbiAgICAgIHZhciBzb3VyY2UgPSBnLm5vZGUoZS52KTtcblxuICAgICAgaWYgKHNvdXJjZSkge1xuICAgICAgICB2YXIgcG9pbnRzID0gXy5yYW5nZSh0aGlzLmdldFRvdGFsTGVuZ3RoKCkpLm1hcChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIHNvdXJjZTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBjcmVhdGVMaW5lKHt9LCBwb2ludHMpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGQzLnNlbGVjdCh0aGlzKS5hdHRyKFwiZFwiKTtcbiAgICAgIH1cbiAgICB9KTtcbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgXyA9IHJlcXVpcmUoXCIuL2xvZGFzaFwiKSxcbiAgICBhZGRMYWJlbCA9IHJlcXVpcmUoXCIuL2xhYmVsL2FkZC1sYWJlbFwiKSxcbiAgICB1dGlsID0gcmVxdWlyZShcIi4vdXRpbFwiKSxcbiAgICBkMyA9IHJlcXVpcmUoXCIuL2QzXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGNyZWF0ZU5vZGVzO1xuXG5mdW5jdGlvbiBjcmVhdGVOb2RlcyhzZWxlY3Rpb24sIGcsIHNoYXBlcykge1xuICB2YXIgc2ltcGxlTm9kZXMgPSBnLm5vZGVzKCkuZmlsdGVyKGZ1bmN0aW9uKHYpIHsgcmV0dXJuICF1dGlsLmlzU3ViZ3JhcGgoZywgdik7IH0pO1xuICB2YXIgc3ZnTm9kZXMgPSBzZWxlY3Rpb24uc2VsZWN0QWxsKFwiZy5ub2RlXCIpXG4gICAgLmRhdGEoc2ltcGxlTm9kZXMsIGZ1bmN0aW9uKHYpIHtcbiAgICAgIHJldHVybiB2O1xuICAgIH0pXG4gICAgLmNsYXNzZWQoXCJ1cGRhdGVcIiwgdHJ1ZSk7XG5cbiAgc3ZnTm9kZXMuc2VsZWN0QWxsKFwiKlwiKS5yZW1vdmUoKTtcbiAgc3ZnTm9kZXMuZW50ZXIoKVxuICAgIC5hcHBlbmQoXCJnXCIpXG4gICAgICAuYXR0cihcImNsYXNzXCIsIFwibm9kZVwiKVxuICAgICAgLnN0eWxlKFwib3BhY2l0eVwiLCAwKTtcbiAgc3ZnTm9kZXMgPSBzZWxlY3Rpb24uc2VsZWN0QWxsKFwiLm5vZGVcIik7XG4gIHN2Z05vZGVzLmVhY2goZnVuY3Rpb24odikge1xuICAgIHZhciBub2RlID0gZy5ub2RlKHYpLFxuICAgICAgICB0aGlzR3JvdXAgPSBkMy5zZWxlY3QodGhpcyksXG4gICAgICAgIHNoYXBlID0gc2hhcGVzW25vZGUuc2hhcGVdLFxuICAgICAgICBsYWJlbEdyb3VwID0gdGhpc0dyb3VwLmFwcGVuZChcImdcIikuYXR0cihcImNsYXNzXCIsIFwibGFiZWxcIiksXG4gICAgICAgIGxhYmVsRG9tID0gYWRkTGFiZWwobGFiZWxHcm91cCwgbm9kZSksXG4gICAgICAgIGJib3ggPSBfLnBpY2sobGFiZWxEb20ubm9kZSgpLmdldEJCb3goKSwgXCJ3aWR0aFwiLCBcImhlaWdodFwiKTtcblxuXG4gICAgbm9kZS5lbGVtID0gdGhpcztcblxuICAgIGlmIChub2RlLmlkKSB7IHRoaXNHcm91cC5hdHRyKFwiaWRcIiwgbm9kZS5pZCk7IH1cbiAgICBpZiAobm9kZS5sYWJlbElkKSB7IGxhYmVsR3JvdXAuYXR0cihcImlkXCIsIG5vZGUubGFiZWxJZCk7IH1cbiAgICB1dGlsLmFwcGx5Q2xhc3ModGhpc0dyb3VwLCBub2RlW1wiY2xhc3NcIl0sXG4gICAgICAodGhpc0dyb3VwLmNsYXNzZWQoXCJ1cGRhdGVcIikgPyBcInVwZGF0ZSBcIiA6IFwiXCIpICsgXCJub2RlXCIpO1xuXG4gICAgaWYgKF8uaGFzKG5vZGUsIFwid2lkdGhcIikpIHsgYmJveC53aWR0aCA9IG5vZGUud2lkdGg7IH1cbiAgICBpZiAoXy5oYXMobm9kZSwgXCJoZWlnaHRcIikpIHsgYmJveC5oZWlnaHQgPSBub2RlLmhlaWdodDsgfVxuXG4gICAgYmJveC53aWR0aCArPSBub2RlLnBhZGRpbmdMZWZ0ICsgbm9kZS5wYWRkaW5nUmlnaHQ7XG4gICAgYmJveC5oZWlnaHQgKz0gbm9kZS5wYWRkaW5nVG9wICsgbm9kZS5wYWRkaW5nQm90dG9tO1xuICAgIGxhYmVsR3JvdXAuYXR0cihcInRyYW5zZm9ybVwiLCBcInRyYW5zbGF0ZShcIiArXG4gICAgICAoKG5vZGUucGFkZGluZ0xlZnQgLSBub2RlLnBhZGRpbmdSaWdodCkgLyAyKSArIFwiLFwiICtcbiAgICAgICgobm9kZS5wYWRkaW5nVG9wIC0gbm9kZS5wYWRkaW5nQm90dG9tKSAvIDIpICsgXCIpXCIpO1xuXG4gICAgdmFyIHNoYXBlU3ZnID0gc2hhcGUoZDMuc2VsZWN0KHRoaXMpLCBiYm94LCBub2RlKTtcbiAgICB1dGlsLmFwcGx5U3R5bGUoc2hhcGVTdmcsIG5vZGUuc3R5bGUpO1xuXG4gICAgdmFyIHNoYXBlQkJveCA9IHNoYXBlU3ZnLm5vZGUoKS5nZXRCQm94KCk7XG4gICAgbm9kZS53aWR0aCA9IHNoYXBlQkJveC53aWR0aDtcbiAgICBub2RlLmhlaWdodCA9IHNoYXBlQkJveC5oZWlnaHQ7XG4gIH0pO1xuXG4gIHV0aWwuYXBwbHlUcmFuc2l0aW9uKHN2Z05vZGVzLmV4aXQoKSwgZylcbiAgICAuc3R5bGUoXCJvcGFjaXR5XCIsIDApXG4gICAgLnJlbW92ZSgpO1xuXG4gIHJldHVybiBzdmdOb2Rlcztcbn1cbiIsIi8vIFN0dWIgdG8gZ2V0IEQzIGVpdGhlciB2aWEgTlBNIG9yIGZyb20gdGhlIGdsb2JhbCBvYmplY3Rcbm1vZHVsZS5leHBvcnRzID0gd2luZG93LmQzO1xuIiwiLyogZ2xvYmFsIHdpbmRvdyAqL1xuXG52YXIgZGFncmU7XG5cbmlmIChyZXF1aXJlKSB7XG4gIHRyeSB7XG4gICAgZGFncmUgPSByZXF1aXJlKFwiZGFncmVcIik7XG4gIH0gY2F0Y2ggKGUpIHt9XG59XG5cbmlmICghZGFncmUpIHtcbiAgZGFncmUgPSB3aW5kb3cuZGFncmU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZGFncmU7XG4iLCIvKiBnbG9iYWwgd2luZG93ICovXG5cbnZhciBncmFwaGxpYjtcblxuaWYgKHJlcXVpcmUpIHtcbiAgdHJ5IHtcbiAgICBncmFwaGxpYiA9IHJlcXVpcmUoXCJncmFwaGxpYlwiKTtcbiAgfSBjYXRjaCAoZSkge31cbn1cblxuaWYgKCFncmFwaGxpYikge1xuICBncmFwaGxpYiA9IHdpbmRvdy5ncmFwaGxpYjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBncmFwaGxpYjtcbiIsIm1vZHVsZS5leHBvcnRzID0ge1xuICBub2RlOiByZXF1aXJlKFwiLi9pbnRlcnNlY3Qtbm9kZVwiKSxcbiAgY2lyY2xlOiByZXF1aXJlKFwiLi9pbnRlcnNlY3QtY2lyY2xlXCIpLFxuICBlbGxpcHNlOiByZXF1aXJlKFwiLi9pbnRlcnNlY3QtZWxsaXBzZVwiKSxcbiAgcG9seWdvbjogcmVxdWlyZShcIi4vaW50ZXJzZWN0LXBvbHlnb25cIiksXG4gIHJlY3Q6IHJlcXVpcmUoXCIuL2ludGVyc2VjdC1yZWN0XCIpXG59O1xuIiwidmFyIGludGVyc2VjdEVsbGlwc2UgPSByZXF1aXJlKFwiLi9pbnRlcnNlY3QtZWxsaXBzZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbnRlcnNlY3RDaXJjbGU7XG5cbmZ1bmN0aW9uIGludGVyc2VjdENpcmNsZShub2RlLCByeCwgcG9pbnQpIHtcbiAgcmV0dXJuIGludGVyc2VjdEVsbGlwc2Uobm9kZSwgcngsIHJ4LCBwb2ludCk7XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IGludGVyc2VjdEVsbGlwc2U7XG5cbmZ1bmN0aW9uIGludGVyc2VjdEVsbGlwc2Uobm9kZSwgcngsIHJ5LCBwb2ludCkge1xuICAvLyBGb3JtdWxhZSBmcm9tOiBodHRwOi8vbWF0aHdvcmxkLndvbGZyYW0uY29tL0VsbGlwc2UtTGluZUludGVyc2VjdGlvbi5odG1sXG5cbiAgdmFyIGN4ID0gbm9kZS54O1xuICB2YXIgY3kgPSBub2RlLnk7XG5cbiAgdmFyIHB4ID0gY3ggLSBwb2ludC54O1xuICB2YXIgcHkgPSBjeSAtIHBvaW50Lnk7XG5cbiAgdmFyIGRldCA9IE1hdGguc3FydChyeCAqIHJ4ICogcHkgKiBweSArIHJ5ICogcnkgKiBweCAqIHB4KTtcblxuICB2YXIgZHggPSBNYXRoLmFicyhyeCAqIHJ5ICogcHggLyBkZXQpO1xuICBpZiAocG9pbnQueCA8IGN4KSB7XG4gICAgZHggPSAtZHg7XG4gIH1cbiAgdmFyIGR5ID0gTWF0aC5hYnMocnggKiByeSAqIHB5IC8gZGV0KTtcbiAgaWYgKHBvaW50LnkgPCBjeSkge1xuICAgIGR5ID0gLWR5O1xuICB9XG5cbiAgcmV0dXJuIHt4OiBjeCArIGR4LCB5OiBjeSArIGR5fTtcbn1cblxuIiwibW9kdWxlLmV4cG9ydHMgPSBpbnRlcnNlY3RMaW5lO1xuXG4vKlxuICogUmV0dXJucyB0aGUgcG9pbnQgYXQgd2hpY2ggdHdvIGxpbmVzLCBwIGFuZCBxLCBpbnRlcnNlY3Qgb3IgcmV0dXJuc1xuICogdW5kZWZpbmVkIGlmIHRoZXkgZG8gbm90IGludGVyc2VjdC5cbiAqL1xuZnVuY3Rpb24gaW50ZXJzZWN0TGluZShwMSwgcDIsIHExLCBxMikge1xuICAvLyBBbGdvcml0aG0gZnJvbSBKLiBBdnJvLCAoZWQuKSBHcmFwaGljcyBHZW1zLCBObyAyLCBNb3JnYW4gS2F1Zm1hbm4sIDE5OTQsXG4gIC8vIHA3IGFuZCBwNDczLlxuXG4gIHZhciBhMSwgYTIsIGIxLCBiMiwgYzEsIGMyO1xuICB2YXIgcjEsIHIyICwgcjMsIHI0O1xuICB2YXIgZGVub20sIG9mZnNldCwgbnVtO1xuICB2YXIgeCwgeTtcblxuICAvLyBDb21wdXRlIGExLCBiMSwgYzEsIHdoZXJlIGxpbmUgam9pbmluZyBwb2ludHMgMSBhbmQgMiBpcyBGKHgseSkgPSBhMSB4ICtcbiAgLy8gYjEgeSArIGMxID0gMC5cbiAgYTEgPSBwMi55IC0gcDEueTtcbiAgYjEgPSBwMS54IC0gcDIueDtcbiAgYzEgPSAocDIueCAqIHAxLnkpIC0gKHAxLnggKiBwMi55KTtcblxuICAvLyBDb21wdXRlIHIzIGFuZCByNC5cbiAgcjMgPSAoKGExICogcTEueCkgKyAoYjEgKiBxMS55KSArIGMxKTtcbiAgcjQgPSAoKGExICogcTIueCkgKyAoYjEgKiBxMi55KSArIGMxKTtcblxuICAvLyBDaGVjayBzaWducyBvZiByMyBhbmQgcjQuIElmIGJvdGggcG9pbnQgMyBhbmQgcG9pbnQgNCBsaWUgb25cbiAgLy8gc2FtZSBzaWRlIG9mIGxpbmUgMSwgdGhlIGxpbmUgc2VnbWVudHMgZG8gbm90IGludGVyc2VjdC5cbiAgaWYgKChyMyAhPT0gMCkgJiYgKHI0ICE9PSAwKSAmJiBzYW1lU2lnbihyMywgcjQpKSB7XG4gICAgcmV0dXJuIC8qRE9OVF9JTlRFUlNFQ1QqLztcbiAgfVxuXG4gIC8vIENvbXB1dGUgYTIsIGIyLCBjMiB3aGVyZSBsaW5lIGpvaW5pbmcgcG9pbnRzIDMgYW5kIDQgaXMgRyh4LHkpID0gYTIgeCArIGIyIHkgKyBjMiA9IDBcbiAgYTIgPSBxMi55IC0gcTEueTtcbiAgYjIgPSBxMS54IC0gcTIueDtcbiAgYzIgPSAocTIueCAqIHExLnkpIC0gKHExLnggKiBxMi55KTtcblxuICAvLyBDb21wdXRlIHIxIGFuZCByMlxuICByMSA9IChhMiAqIHAxLngpICsgKGIyICogcDEueSkgKyBjMjtcbiAgcjIgPSAoYTIgKiBwMi54KSArIChiMiAqIHAyLnkpICsgYzI7XG5cbiAgLy8gQ2hlY2sgc2lnbnMgb2YgcjEgYW5kIHIyLiBJZiBib3RoIHBvaW50IDEgYW5kIHBvaW50IDIgbGllXG4gIC8vIG9uIHNhbWUgc2lkZSBvZiBzZWNvbmQgbGluZSBzZWdtZW50LCB0aGUgbGluZSBzZWdtZW50cyBkb1xuICAvLyBub3QgaW50ZXJzZWN0LlxuICBpZiAoKHIxICE9PSAwKSAmJiAocjIgIT09IDApICYmIChzYW1lU2lnbihyMSwgcjIpKSkge1xuICAgIHJldHVybiAvKkRPTlRfSU5URVJTRUNUKi87XG4gIH1cblxuICAvLyBMaW5lIHNlZ21lbnRzIGludGVyc2VjdDogY29tcHV0ZSBpbnRlcnNlY3Rpb24gcG9pbnQuXG4gIGRlbm9tID0gKGExICogYjIpIC0gKGEyICogYjEpO1xuICBpZiAoZGVub20gPT09IDApIHtcbiAgICByZXR1cm4gLypDT0xMSU5FQVIqLztcbiAgfVxuXG4gIG9mZnNldCA9IE1hdGguYWJzKGRlbm9tIC8gMik7XG5cbiAgLy8gVGhlIGRlbm9tLzIgaXMgdG8gZ2V0IHJvdW5kaW5nIGluc3RlYWQgb2YgdHJ1bmNhdGluZy4gSXRcbiAgLy8gaXMgYWRkZWQgb3Igc3VidHJhY3RlZCB0byB0aGUgbnVtZXJhdG9yLCBkZXBlbmRpbmcgdXBvbiB0aGVcbiAgLy8gc2lnbiBvZiB0aGUgbnVtZXJhdG9yLlxuICBudW0gPSAoYjEgKiBjMikgLSAoYjIgKiBjMSk7XG4gIHggPSAobnVtIDwgMCkgPyAoKG51bSAtIG9mZnNldCkgLyBkZW5vbSkgOiAoKG51bSArIG9mZnNldCkgLyBkZW5vbSk7XG5cbiAgbnVtID0gKGEyICogYzEpIC0gKGExICogYzIpO1xuICB5ID0gKG51bSA8IDApID8gKChudW0gLSBvZmZzZXQpIC8gZGVub20pIDogKChudW0gKyBvZmZzZXQpIC8gZGVub20pO1xuXG4gIHJldHVybiB7IHg6IHgsIHk6IHkgfTtcbn1cblxuZnVuY3Rpb24gc2FtZVNpZ24ocjEsIHIyKSB7XG4gIHJldHVybiByMSAqIHIyID4gMDtcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gaW50ZXJzZWN0Tm9kZTtcblxuZnVuY3Rpb24gaW50ZXJzZWN0Tm9kZShub2RlLCBwb2ludCkge1xuICByZXR1cm4gbm9kZS5pbnRlcnNlY3QocG9pbnQpO1xufVxuIiwidmFyIGludGVyc2VjdExpbmUgPSByZXF1aXJlKFwiLi9pbnRlcnNlY3QtbGluZVwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbnRlcnNlY3RQb2x5Z29uO1xuXG4vKlxuICogUmV0dXJucyB0aGUgcG9pbnQgKHt4LCB5fSkgYXQgd2hpY2ggdGhlIHBvaW50IGFyZ3VtZW50IGludGVyc2VjdHMgd2l0aCB0aGVcbiAqIG5vZGUgYXJndW1lbnQgYXNzdW1pbmcgdGhhdCBpdCBoYXMgdGhlIHNoYXBlIHNwZWNpZmllZCBieSBwb2x5Z29uLlxuICovXG5mdW5jdGlvbiBpbnRlcnNlY3RQb2x5Z29uKG5vZGUsIHBvbHlQb2ludHMsIHBvaW50KSB7XG4gIHZhciB4MSA9IG5vZGUueDtcbiAgdmFyIHkxID0gbm9kZS55O1xuXG4gIHZhciBpbnRlcnNlY3Rpb25zID0gW107XG5cbiAgdmFyIG1pblggPSBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFksXG4gICAgICBtaW5ZID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICBwb2x5UG9pbnRzLmZvckVhY2goZnVuY3Rpb24oZW50cnkpIHtcbiAgICBtaW5YID0gTWF0aC5taW4obWluWCwgZW50cnkueCk7XG4gICAgbWluWSA9IE1hdGgubWluKG1pblksIGVudHJ5LnkpO1xuICB9KTtcblxuICB2YXIgbGVmdCA9IHgxIC0gbm9kZS53aWR0aCAvIDIgLSBtaW5YO1xuICB2YXIgdG9wID0gIHkxIC0gbm9kZS5oZWlnaHQgLyAyIC0gbWluWTtcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IHBvbHlQb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgcDEgPSBwb2x5UG9pbnRzW2ldO1xuICAgIHZhciBwMiA9IHBvbHlQb2ludHNbaSA8IHBvbHlQb2ludHMubGVuZ3RoIC0gMSA/IGkgKyAxIDogMF07XG4gICAgdmFyIGludGVyc2VjdCA9IGludGVyc2VjdExpbmUobm9kZSwgcG9pbnQsXG4gICAgICB7eDogbGVmdCArIHAxLngsIHk6IHRvcCArIHAxLnl9LCB7eDogbGVmdCArIHAyLngsIHk6IHRvcCArIHAyLnl9KTtcbiAgICBpZiAoaW50ZXJzZWN0KSB7XG4gICAgICBpbnRlcnNlY3Rpb25zLnB1c2goaW50ZXJzZWN0KTtcbiAgICB9XG4gIH1cblxuICBpZiAoIWludGVyc2VjdGlvbnMubGVuZ3RoKSB7XG4gICAgY29uc29sZS5sb2coXCJOTyBJTlRFUlNFQ1RJT04gRk9VTkQsIFJFVFVSTiBOT0RFIENFTlRFUlwiLCBub2RlKTtcbiAgICByZXR1cm4gbm9kZTtcbiAgfVxuXG4gIGlmIChpbnRlcnNlY3Rpb25zLmxlbmd0aCA+IDEpIHtcbiAgICAvLyBNb3JlIGludGVyc2VjdGlvbnMsIGZpbmQgdGhlIG9uZSBuZWFyZXN0IHRvIGVkZ2UgZW5kIHBvaW50XG4gICAgaW50ZXJzZWN0aW9ucy5zb3J0KGZ1bmN0aW9uKHAsIHEpIHtcbiAgICAgIHZhciBwZHggPSBwLnggLSBwb2ludC54LFxuICAgICAgICAgIHBkeSA9IHAueSAtIHBvaW50LnksXG4gICAgICAgICAgZGlzdHAgPSBNYXRoLnNxcnQocGR4ICogcGR4ICsgcGR5ICogcGR5KSxcblxuICAgICAgICAgIHFkeCA9IHEueCAtIHBvaW50LngsXG4gICAgICAgICAgcWR5ID0gcS55IC0gcG9pbnQueSxcbiAgICAgICAgICBkaXN0cSA9IE1hdGguc3FydChxZHggKiBxZHggKyBxZHkgKiBxZHkpO1xuXG4gICAgICByZXR1cm4gKGRpc3RwIDwgZGlzdHEpID8gLTEgOiAoZGlzdHAgPT09IGRpc3RxID8gMCA6IDEpO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBpbnRlcnNlY3Rpb25zWzBdO1xufVxuIiwibW9kdWxlLmV4cG9ydHMgPSBpbnRlcnNlY3RSZWN0O1xuXG5mdW5jdGlvbiBpbnRlcnNlY3RSZWN0KG5vZGUsIHBvaW50KSB7XG4gIHZhciB4ID0gbm9kZS54O1xuICB2YXIgeSA9IG5vZGUueTtcblxuICAvLyBSZWN0YW5nbGUgaW50ZXJzZWN0aW9uIGFsZ29yaXRobSBmcm9tOlxuICAvLyBodHRwOi8vbWF0aC5zdGFja2V4Y2hhbmdlLmNvbS9xdWVzdGlvbnMvMTA4MTEzL2ZpbmQtZWRnZS1iZXR3ZWVuLXR3by1ib3hlc1xuICB2YXIgZHggPSBwb2ludC54IC0geDtcbiAgdmFyIGR5ID0gcG9pbnQueSAtIHk7XG4gIHZhciB3ID0gbm9kZS53aWR0aCAvIDI7XG4gIHZhciBoID0gbm9kZS5oZWlnaHQgLyAyO1xuXG4gIHZhciBzeCwgc3k7XG4gIGlmIChNYXRoLmFicyhkeSkgKiB3ID4gTWF0aC5hYnMoZHgpICogaCkge1xuICAgIC8vIEludGVyc2VjdGlvbiBpcyB0b3Agb3IgYm90dG9tIG9mIHJlY3QuXG4gICAgaWYgKGR5IDwgMCkge1xuICAgICAgaCA9IC1oO1xuICAgIH1cbiAgICBzeCA9IGR5ID09PSAwID8gMCA6IGggKiBkeCAvIGR5O1xuICAgIHN5ID0gaDtcbiAgfSBlbHNlIHtcbiAgICAvLyBJbnRlcnNlY3Rpb24gaXMgbGVmdCBvciByaWdodCBvZiByZWN0LlxuICAgIGlmIChkeCA8IDApIHtcbiAgICAgIHcgPSAtdztcbiAgICB9XG4gICAgc3ggPSB3O1xuICAgIHN5ID0gZHggPT09IDAgPyAwIDogdyAqIGR5IC8gZHg7XG4gIH1cblxuICByZXR1cm4ge3g6IHggKyBzeCwgeTogeSArIHN5fTtcbn1cbiIsInZhciB1dGlsID0gcmVxdWlyZShcIi4uL3V0aWxcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gYWRkSHRtbExhYmVsO1xuXG5mdW5jdGlvbiBhZGRIdG1sTGFiZWwocm9vdCwgbm9kZSkge1xuICB2YXIgZm8gPSByb290XG4gICAgLmFwcGVuZChcImZvcmVpZ25PYmplY3RcIilcbiAgICAuYXR0cihcIndpZHRoXCIsIFwiMTAwMDAwXCIpO1xuXG4gIHZhciBkaXYgPSBmb1xuICAgIC5hcHBlbmQoXCJ4aHRtbDpkaXZcIik7XG4gIGRpdi5hdHRyKFwieG1sbnNcIiwgXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCIpO1xuXG4gIHZhciBsYWJlbCA9IG5vZGUubGFiZWw7XG4gIHN3aXRjaCAodHlwZW9mIGxhYmVsKSB7XG4gICAgY2FzZSBcImZ1bmN0aW9uXCI6XG4gICAgICBkaXYuaW5zZXJ0KGxhYmVsKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgXCJvYmplY3RcIjpcbiAgICAgIC8vIEN1cnJlbnRseSB3ZSBhc3N1bWUgdGhpcyBpcyBhIERPTSBvYmplY3QuXG4gICAgICBkaXYuaW5zZXJ0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIGxhYmVsO1xuICAgICAgfSk7XG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgZGl2Lmh0bWwobGFiZWwpO1xuICB9XG5cbiAgdXRpbC5hcHBseVN0eWxlKGRpdiwgbm9kZS5sYWJlbFN0eWxlKTtcbiAgZGl2LnN0eWxlKFwiZGlzcGxheVwiLCBcImlubGluZS1ibG9ja1wiKTtcbiAgLy8gRml4IGZvciBmaXJlZm94XG4gIGRpdi5zdHlsZShcIndoaXRlLXNwYWNlXCIsIFwibm93cmFwXCIpO1xuXG4gIHZhciBjbGllbnQgPSBkaXYuX2dyb3Vwc1swXVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgZm9cbiAgICAuYXR0cihcIndpZHRoXCIsIGNsaWVudC53aWR0aClcbiAgICAuYXR0cihcImhlaWdodFwiLCBjbGllbnQuaGVpZ2h0KTtcblxuICByZXR1cm4gZm87XG59XG4iLCJ2YXIgYWRkVGV4dExhYmVsID0gcmVxdWlyZShcIi4vYWRkLXRleHQtbGFiZWxcIiksXG4gICAgYWRkSHRtbExhYmVsID0gcmVxdWlyZShcIi4vYWRkLWh0bWwtbGFiZWxcIiksXG4gICAgYWRkU1ZHTGFiZWwgID0gcmVxdWlyZShcIi4vYWRkLXN2Zy1sYWJlbFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBhZGRMYWJlbDtcblxuZnVuY3Rpb24gYWRkTGFiZWwocm9vdCwgbm9kZSwgbG9jYXRpb24pIHtcbiAgdmFyIGxhYmVsID0gbm9kZS5sYWJlbDtcbiAgdmFyIGxhYmVsU3ZnID0gcm9vdC5hcHBlbmQoXCJnXCIpLmxvd2VyKCk7XG5cbiAgLy8gQWxsb3cgdGhlIGxhYmVsIHRvIGJlIGEgc3RyaW5nLCBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIERPTSBlbGVtZW50LCBvclxuICAvLyBhIERPTSBlbGVtZW50IGl0c2VsZi5cbiAgaWYgKG5vZGUubGFiZWxUeXBlID09PSBcInN2Z1wiKSB7XG4gICAgYWRkU1ZHTGFiZWwobGFiZWxTdmcsIG5vZGUpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBsYWJlbCAhPT0gXCJzdHJpbmdcIiB8fCBub2RlLmxhYmVsVHlwZSA9PT0gXCJodG1sXCIpIHtcbiAgICBhZGRIdG1sTGFiZWwobGFiZWxTdmcsIG5vZGUpO1xuICB9IGVsc2Uge1xuICAgIGFkZFRleHRMYWJlbChsYWJlbFN2Zywgbm9kZSk7XG4gIH1cblxuICB2YXIgbGFiZWxCQm94ID0gbGFiZWxTdmcubm9kZSgpLmdldEJCb3goKTtcbiAgdmFyIHk7XG4gIHN3aXRjaChsb2NhdGlvbikge1xuICAgIGNhc2UgXCJ0b3BcIjpcbiAgICAgIHkgPSAoLW5vZGUuaGVpZ2h0IC8gMik7XG4gICAgICBicmVhaztcbiAgICBjYXNlIFwiYm90dG9tXCI6XG4gICAgICB5ID0gKG5vZGUuaGVpZ2h0IC8gMikgLSBsYWJlbEJCb3guaGVpZ2h0O1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHkgPSAoLWxhYmVsQkJveC5oZWlnaHQgLyAyKTtcbiAgfVxuICBsYWJlbFN2Zy5hdHRyKFwidHJhbnNmb3JtXCIsXG4gICAgICAgICAgICAgICAgXCJ0cmFuc2xhdGUoXCIgKyAoLWxhYmVsQkJveC53aWR0aCAvIDIpICsgXCIsXCIgKyB5ICsgXCIpXCIpO1xuXG4gIHJldHVybiBsYWJlbFN2Zztcbn1cbiIsInZhciB1dGlsID0gcmVxdWlyZShcIi4uL3V0aWxcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gYWRkU1ZHTGFiZWw7XG5cbmZ1bmN0aW9uIGFkZFNWR0xhYmVsKHJvb3QsIG5vZGUpIHtcbiAgdmFyIGRvbU5vZGUgPSByb290O1xuXG4gIGRvbU5vZGUubm9kZSgpLmFwcGVuZENoaWxkKG5vZGUubGFiZWwpO1xuXG4gIHV0aWwuYXBwbHlTdHlsZShkb21Ob2RlLCBub2RlLmxhYmVsU3R5bGUpO1xuXG4gIHJldHVybiBkb21Ob2RlO1xufVxuIiwidmFyIHV0aWwgPSByZXF1aXJlKFwiLi4vdXRpbFwiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBhZGRUZXh0TGFiZWw7XG5cbi8qXG4gKiBBdHRhY2hlcyBhIHRleHQgbGFiZWwgdG8gdGhlIHNwZWNpZmllZCByb290LiBIYW5kbGVzIGVzY2FwZSBzZXF1ZW5jZXMuXG4gKi9cbmZ1bmN0aW9uIGFkZFRleHRMYWJlbChyb290LCBub2RlKSB7XG4gIHZhciBkb21Ob2RlID0gcm9vdC5hcHBlbmQoXCJ0ZXh0XCIpO1xuXG4gIHZhciBsaW5lcyA9IHByb2Nlc3NFc2NhcGVTZXF1ZW5jZXMobm9kZS5sYWJlbCkuc3BsaXQoXCJcXG5cIik7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICBkb21Ob2RlXG4gICAgICAuYXBwZW5kKFwidHNwYW5cIilcbiAgICAgICAgLmF0dHIoXCJ4bWw6c3BhY2VcIiwgXCJwcmVzZXJ2ZVwiKVxuICAgICAgICAuYXR0cihcImR5XCIsIFwiMWVtXCIpXG4gICAgICAgIC5hdHRyKFwieFwiLCBcIjFcIilcbiAgICAgICAgLnRleHQobGluZXNbaV0pO1xuICB9XG5cbiAgdXRpbC5hcHBseVN0eWxlKGRvbU5vZGUsIG5vZGUubGFiZWxTdHlsZSk7XG5cbiAgcmV0dXJuIGRvbU5vZGU7XG59XG5cbmZ1bmN0aW9uIHByb2Nlc3NFc2NhcGVTZXF1ZW5jZXModGV4dCkge1xuICB2YXIgbmV3VGV4dCA9IFwiXCIsXG4gICAgICBlc2NhcGVkID0gZmFsc2UsXG4gICAgICBjaDtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCB0ZXh0Lmxlbmd0aDsgKytpKSB7XG4gICAgY2ggPSB0ZXh0W2ldO1xuICAgIGlmIChlc2NhcGVkKSB7XG4gICAgICBzd2l0Y2goY2gpIHtcbiAgICAgICAgY2FzZSBcIm5cIjogbmV3VGV4dCArPSBcIlxcblwiOyBicmVhaztcbiAgICAgICAgZGVmYXVsdDogbmV3VGV4dCArPSBjaDtcbiAgICAgIH1cbiAgICAgIGVzY2FwZWQgPSBmYWxzZTtcbiAgICB9IGVsc2UgaWYgKGNoID09PSBcIlxcXFxcIikge1xuICAgICAgZXNjYXBlZCA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgIG5ld1RleHQgKz0gY2g7XG4gICAgfVxuICB9XG4gIHJldHVybiBuZXdUZXh0O1xufVxuIiwiLyogZ2xvYmFsIHdpbmRvdyAqL1xuXG52YXIgbG9kYXNoO1xuXG5pZiAocmVxdWlyZSkge1xuICB0cnkge1xuICAgIGxvZGFzaCA9IHJlcXVpcmUoXCJsb2Rhc2hcIik7XG4gIH0gY2F0Y2ggKGUpIHt9XG59XG5cbmlmICghbG9kYXNoKSB7XG4gIGxvZGFzaCA9IHdpbmRvdy5fO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGxvZGFzaDtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoXCIuL3V0aWxcIiksXG4gICAgZDMgPSByZXF1aXJlKFwiLi9kM1wiKTtcblxubW9kdWxlLmV4cG9ydHMgPSBwb3NpdGlvbkNsdXN0ZXJzO1xuXG5mdW5jdGlvbiBwb3NpdGlvbkNsdXN0ZXJzKHNlbGVjdGlvbiwgZykge1xuICB2YXIgY3JlYXRlZCA9IHNlbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24oKSB7IHJldHVybiAhZDMuc2VsZWN0KHRoaXMpLmNsYXNzZWQoXCJ1cGRhdGVcIik7IH0pO1xuXG4gIGZ1bmN0aW9uIHRyYW5zbGF0ZSh2KSB7XG4gICAgdmFyIG5vZGUgPSBnLm5vZGUodik7XG4gICAgcmV0dXJuIFwidHJhbnNsYXRlKFwiICsgbm9kZS54ICsgXCIsXCIgKyBub2RlLnkgKyBcIilcIjtcbiAgfVxuXG4gIGNyZWF0ZWQuYXR0cihcInRyYW5zZm9ybVwiLCB0cmFuc2xhdGUpO1xuXG4gIHV0aWwuYXBwbHlUcmFuc2l0aW9uKHNlbGVjdGlvbiwgZylcbiAgICAgIC5zdHlsZShcIm9wYWNpdHlcIiwgMSlcbiAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIHRyYW5zbGF0ZSk7XG5cbiAgdXRpbC5hcHBseVRyYW5zaXRpb24oY3JlYXRlZC5zZWxlY3RBbGwoXCJyZWN0XCIpLCBnKVxuICAgICAgLmF0dHIoXCJ3aWR0aFwiLCBmdW5jdGlvbih2KSB7IHJldHVybiBnLm5vZGUodikud2lkdGg7IH0pXG4gICAgICAuYXR0cihcImhlaWdodFwiLCBmdW5jdGlvbih2KSB7IHJldHVybiBnLm5vZGUodikuaGVpZ2h0OyB9KVxuICAgICAgLmF0dHIoXCJ4XCIsIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgdmFyIG5vZGUgPSBnLm5vZGUodik7XG4gICAgICAgIHJldHVybiAtbm9kZS53aWR0aCAvIDI7XG4gICAgICB9KVxuICAgICAgLmF0dHIoXCJ5XCIsIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgdmFyIG5vZGUgPSBnLm5vZGUodik7XG4gICAgICAgIHJldHVybiAtbm9kZS5oZWlnaHQgLyAyO1xuICAgICAgfSk7XG5cbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoXCIuL3V0aWxcIiksXG4gICAgZDMgPSByZXF1aXJlKFwiLi9kM1wiKSxcbiAgICBfID0gcmVxdWlyZShcIi4vbG9kYXNoXCIpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHBvc2l0aW9uRWRnZUxhYmVscztcblxuZnVuY3Rpb24gcG9zaXRpb25FZGdlTGFiZWxzKHNlbGVjdGlvbiwgZykge1xuICB2YXIgY3JlYXRlZCA9IHNlbGVjdGlvbi5maWx0ZXIoZnVuY3Rpb24oKSB7IHJldHVybiAhZDMuc2VsZWN0KHRoaXMpLmNsYXNzZWQoXCJ1cGRhdGVcIik7IH0pO1xuXG4gIGZ1bmN0aW9uIHRyYW5zbGF0ZShlKSB7XG4gICAgdmFyIGVkZ2UgPSBnLmVkZ2UoZSk7XG4gICAgcmV0dXJuIF8uaGFzKGVkZ2UsIFwieFwiKSA/IFwidHJhbnNsYXRlKFwiICsgZWRnZS54ICsgXCIsXCIgKyBlZGdlLnkgKyBcIilcIiA6IFwiXCI7XG4gIH1cblxuICBjcmVhdGVkLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgdHJhbnNsYXRlKTtcblxuICB1dGlsLmFwcGx5VHJhbnNpdGlvbihzZWxlY3Rpb24sIGcpXG4gICAgLnN0eWxlKFwib3BhY2l0eVwiLCAxKVxuICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIHRyYW5zbGF0ZSk7XG59XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIHV0aWwgPSByZXF1aXJlKFwiLi91dGlsXCIpLFxuICAgIGQzID0gcmVxdWlyZShcIi4vZDNcIik7XG5cbm1vZHVsZS5leHBvcnRzID0gcG9zaXRpb25Ob2RlcztcblxuZnVuY3Rpb24gcG9zaXRpb25Ob2RlcyhzZWxlY3Rpb24sIGcpIHtcbiAgdmFyIGNyZWF0ZWQgPSBzZWxlY3Rpb24uZmlsdGVyKGZ1bmN0aW9uKCkgeyByZXR1cm4gIWQzLnNlbGVjdCh0aGlzKS5jbGFzc2VkKFwidXBkYXRlXCIpOyB9KTtcblxuICBmdW5jdGlvbiB0cmFuc2xhdGUodikge1xuICAgIHZhciBub2RlID0gZy5ub2RlKHYpO1xuICAgIHJldHVybiBcInRyYW5zbGF0ZShcIiArIG5vZGUueCArIFwiLFwiICsgbm9kZS55ICsgXCIpXCI7XG4gIH1cblxuICBjcmVhdGVkLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgdHJhbnNsYXRlKTtcblxuICB1dGlsLmFwcGx5VHJhbnNpdGlvbihzZWxlY3Rpb24sIGcpXG4gICAgLnN0eWxlKFwib3BhY2l0eVwiLCAxKVxuICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIHRyYW5zbGF0ZSk7XG59XG4iLCJ2YXIgXyA9IHJlcXVpcmUoXCIuL2xvZGFzaFwiKSxcbiAgICBsYXlvdXQgPSByZXF1aXJlKFwiLi9kYWdyZVwiKS5sYXlvdXQ7XG5cbm1vZHVsZS5leHBvcnRzID0gcmVuZGVyO1xuXG4vLyBUaGlzIGRlc2lnbiBpcyBiYXNlZCBvbiBodHRwOi8vYm9zdC5vY2tzLm9yZy9taWtlL2NoYXJ0Ly5cbmZ1bmN0aW9uIHJlbmRlcigpIHtcbiAgdmFyIGNyZWF0ZU5vZGVzID0gcmVxdWlyZShcIi4vY3JlYXRlLW5vZGVzXCIpLFxuICAgICAgY3JlYXRlQ2x1c3RlcnMgPSByZXF1aXJlKFwiLi9jcmVhdGUtY2x1c3RlcnNcIiksXG4gICAgICBjcmVhdGVFZGdlTGFiZWxzID0gcmVxdWlyZShcIi4vY3JlYXRlLWVkZ2UtbGFiZWxzXCIpLFxuICAgICAgY3JlYXRlRWRnZVBhdGhzID0gcmVxdWlyZShcIi4vY3JlYXRlLWVkZ2UtcGF0aHNcIiksXG4gICAgICBwb3NpdGlvbk5vZGVzID0gcmVxdWlyZShcIi4vcG9zaXRpb24tbm9kZXNcIiksXG4gICAgICBwb3NpdGlvbkVkZ2VMYWJlbHMgPSByZXF1aXJlKFwiLi9wb3NpdGlvbi1lZGdlLWxhYmVsc1wiKSxcbiAgICAgIHBvc2l0aW9uQ2x1c3RlcnMgPSByZXF1aXJlKFwiLi9wb3NpdGlvbi1jbHVzdGVyc1wiKSxcbiAgICAgIHNoYXBlcyA9IHJlcXVpcmUoXCIuL3NoYXBlc1wiKSxcbiAgICAgIGFycm93cyA9IHJlcXVpcmUoXCIuL2Fycm93c1wiKTtcblxuICB2YXIgZm4gPSBmdW5jdGlvbihzdmcsIGcpIHtcbiAgICBwcmVQcm9jZXNzR3JhcGgoZyk7XG5cbiAgICB2YXIgb3V0cHV0R3JvdXAgPSBjcmVhdGVPclNlbGVjdEdyb3VwKHN2ZywgXCJvdXRwdXRcIiksXG4gICAgICAgIGNsdXN0ZXJzR3JvdXAgPSBjcmVhdGVPclNlbGVjdEdyb3VwKG91dHB1dEdyb3VwLCBcImNsdXN0ZXJzXCIpLFxuICAgICAgICBlZGdlUGF0aHNHcm91cCA9IGNyZWF0ZU9yU2VsZWN0R3JvdXAob3V0cHV0R3JvdXAsIFwiZWRnZVBhdGhzXCIpLFxuICAgICAgICBlZGdlTGFiZWxzID0gY3JlYXRlRWRnZUxhYmVscyhjcmVhdGVPclNlbGVjdEdyb3VwKG91dHB1dEdyb3VwLCBcImVkZ2VMYWJlbHNcIiksIGcpLFxuICAgICAgICBub2RlcyA9IGNyZWF0ZU5vZGVzKGNyZWF0ZU9yU2VsZWN0R3JvdXAob3V0cHV0R3JvdXAsIFwibm9kZXNcIiksIGcsIHNoYXBlcyk7XG5cbiAgICBsYXlvdXQoZyk7XG5cbiAgICBwb3NpdGlvbk5vZGVzKG5vZGVzLCBnKTtcbiAgICBwb3NpdGlvbkVkZ2VMYWJlbHMoZWRnZUxhYmVscywgZyk7XG4gICAgY3JlYXRlRWRnZVBhdGhzKGVkZ2VQYXRoc0dyb3VwLCBnLCBhcnJvd3MpO1xuXG4gICAgdmFyIGNsdXN0ZXJzID0gY3JlYXRlQ2x1c3RlcnMoY2x1c3RlcnNHcm91cCwgZyk7XG4gICAgcG9zaXRpb25DbHVzdGVycyhjbHVzdGVycywgZyk7XG5cbiAgICBwb3N0UHJvY2Vzc0dyYXBoKGcpO1xuICB9O1xuXG4gIGZuLmNyZWF0ZU5vZGVzID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBjcmVhdGVOb2RlcztcbiAgICBjcmVhdGVOb2RlcyA9IHZhbHVlO1xuICAgIHJldHVybiBmbjtcbiAgfTtcblxuICBmbi5jcmVhdGVDbHVzdGVycyA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gY3JlYXRlQ2x1c3RlcnM7XG4gICAgY3JlYXRlQ2x1c3RlcnMgPSB2YWx1ZTtcbiAgICByZXR1cm4gZm47XG4gIH07XG5cbiAgZm4uY3JlYXRlRWRnZUxhYmVscyA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gY3JlYXRlRWRnZUxhYmVscztcbiAgICBjcmVhdGVFZGdlTGFiZWxzID0gdmFsdWU7XG4gICAgcmV0dXJuIGZuO1xuICB9O1xuXG4gIGZuLmNyZWF0ZUVkZ2VQYXRocyA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gY3JlYXRlRWRnZVBhdGhzO1xuICAgIGNyZWF0ZUVkZ2VQYXRocyA9IHZhbHVlO1xuICAgIHJldHVybiBmbjtcbiAgfTtcblxuICBmbi5zaGFwZXMgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHNoYXBlcztcbiAgICBzaGFwZXMgPSB2YWx1ZTtcbiAgICByZXR1cm4gZm47XG4gIH07XG5cbiAgZm4uYXJyb3dzID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBhcnJvd3M7XG4gICAgYXJyb3dzID0gdmFsdWU7XG4gICAgcmV0dXJuIGZuO1xuICB9O1xuXG4gIHJldHVybiBmbjtcbn1cblxudmFyIE5PREVfREVGQVVMVF9BVFRSUyA9IHtcbiAgcGFkZGluZ0xlZnQ6IDEwLFxuICBwYWRkaW5nUmlnaHQ6IDEwLFxuICBwYWRkaW5nVG9wOiAxMCxcbiAgcGFkZGluZ0JvdHRvbTogMTAsXG4gIHJ4OiAwLFxuICByeTogMCxcbiAgc2hhcGU6IFwicmVjdFwiXG59O1xuXG52YXIgRURHRV9ERUZBVUxUX0FUVFJTID0ge1xuICBhcnJvd2hlYWQ6IFwibm9ybWFsXCIsXG4gIGxpbmVJbnRlcnBvbGF0ZTogXCJsaW5lYXJcIlxufTtcblxuZnVuY3Rpb24gcHJlUHJvY2Vzc0dyYXBoKGcpIHtcbiAgZy5ub2RlcygpLmZvckVhY2goZnVuY3Rpb24odikge1xuICAgIHZhciBub2RlID0gZy5ub2RlKHYpO1xuICAgIGlmICghXy5oYXMobm9kZSwgXCJsYWJlbFwiKSAmJiAhZy5jaGlsZHJlbih2KS5sZW5ndGgpIHsgbm9kZS5sYWJlbCA9IHY7IH1cblxuICAgIGlmIChfLmhhcyhub2RlLCBcInBhZGRpbmdYXCIpKSB7XG4gICAgICBfLmRlZmF1bHRzKG5vZGUsIHtcbiAgICAgICAgcGFkZGluZ0xlZnQ6IG5vZGUucGFkZGluZ1gsXG4gICAgICAgIHBhZGRpbmdSaWdodDogbm9kZS5wYWRkaW5nWFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgaWYgKF8uaGFzKG5vZGUsIFwicGFkZGluZ1lcIikpIHtcbiAgICAgIF8uZGVmYXVsdHMobm9kZSwge1xuICAgICAgICBwYWRkaW5nVG9wOiBub2RlLnBhZGRpbmdZLFxuICAgICAgICBwYWRkaW5nQm90dG9tOiBub2RlLnBhZGRpbmdZXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBpZiAoXy5oYXMobm9kZSwgXCJwYWRkaW5nXCIpKSB7XG4gICAgICBfLmRlZmF1bHRzKG5vZGUsIHtcbiAgICAgICAgcGFkZGluZ0xlZnQ6IG5vZGUucGFkZGluZyxcbiAgICAgICAgcGFkZGluZ1JpZ2h0OiBub2RlLnBhZGRpbmcsXG4gICAgICAgIHBhZGRpbmdUb3A6IG5vZGUucGFkZGluZyxcbiAgICAgICAgcGFkZGluZ0JvdHRvbTogbm9kZS5wYWRkaW5nXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICBfLmRlZmF1bHRzKG5vZGUsIE5PREVfREVGQVVMVF9BVFRSUyk7XG5cbiAgICBfLmVhY2goW1wicGFkZGluZ0xlZnRcIiwgXCJwYWRkaW5nUmlnaHRcIiwgXCJwYWRkaW5nVG9wXCIsIFwicGFkZGluZ0JvdHRvbVwiXSwgZnVuY3Rpb24oaykge1xuICAgICAgbm9kZVtrXSA9IE51bWJlcihub2RlW2tdKTtcbiAgICB9KTtcblxuICAgIC8vIFNhdmUgZGltZW5zaW9ucyBmb3IgcmVzdG9yZSBkdXJpbmcgcG9zdC1wcm9jZXNzaW5nXG4gICAgaWYgKF8uaGFzKG5vZGUsIFwid2lkdGhcIikpIHsgbm9kZS5fcHJldldpZHRoID0gbm9kZS53aWR0aDsgfVxuICAgIGlmIChfLmhhcyhub2RlLCBcImhlaWdodFwiKSkgeyBub2RlLl9wcmV2SGVpZ2h0ID0gbm9kZS5oZWlnaHQ7IH1cbiAgfSk7XG5cbiAgZy5lZGdlcygpLmZvckVhY2goZnVuY3Rpb24oZSkge1xuICAgIHZhciBlZGdlID0gZy5lZGdlKGUpO1xuICAgIGlmICghXy5oYXMoZWRnZSwgXCJsYWJlbFwiKSkgeyBlZGdlLmxhYmVsID0gXCJcIjsgfVxuICAgIF8uZGVmYXVsdHMoZWRnZSwgRURHRV9ERUZBVUxUX0FUVFJTKTtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIHBvc3RQcm9jZXNzR3JhcGgoZykge1xuICBfLmVhY2goZy5ub2RlcygpLCBmdW5jdGlvbih2KSB7XG4gICAgdmFyIG5vZGUgPSBnLm5vZGUodik7XG5cbiAgICAvLyBSZXN0b3JlIG9yaWdpbmFsIGRpbWVuc2lvbnNcbiAgICBpZiAoXy5oYXMobm9kZSwgXCJfcHJldldpZHRoXCIpKSB7XG4gICAgICBub2RlLndpZHRoID0gbm9kZS5fcHJldldpZHRoO1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgbm9kZS53aWR0aDtcbiAgICB9XG5cbiAgICBpZiAoXy5oYXMobm9kZSwgXCJfcHJldkhlaWdodFwiKSkge1xuICAgICAgbm9kZS5oZWlnaHQgPSBub2RlLl9wcmV2SGVpZ2h0O1xuICAgIH0gZWxzZSB7XG4gICAgICBkZWxldGUgbm9kZS5oZWlnaHQ7XG4gICAgfVxuXG4gICAgZGVsZXRlIG5vZGUuX3ByZXZXaWR0aDtcbiAgICBkZWxldGUgbm9kZS5fcHJldkhlaWdodDtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU9yU2VsZWN0R3JvdXAocm9vdCwgbmFtZSkge1xuICB2YXIgc2VsZWN0aW9uID0gcm9vdC5zZWxlY3QoXCJnLlwiICsgbmFtZSk7XG4gIGlmIChzZWxlY3Rpb24uZW1wdHkoKSkge1xuICAgIHNlbGVjdGlvbiA9IHJvb3QuYXBwZW5kKFwiZ1wiKS5hdHRyKFwiY2xhc3NcIiwgbmFtZSk7XG4gIH1cbiAgcmV0dXJuIHNlbGVjdGlvbjtcbn1cbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgaW50ZXJzZWN0UmVjdCA9IHJlcXVpcmUoXCIuL2ludGVyc2VjdC9pbnRlcnNlY3QtcmVjdFwiKSxcbiAgICBpbnRlcnNlY3RFbGxpcHNlID0gcmVxdWlyZShcIi4vaW50ZXJzZWN0L2ludGVyc2VjdC1lbGxpcHNlXCIpLFxuICAgIGludGVyc2VjdENpcmNsZSA9IHJlcXVpcmUoXCIuL2ludGVyc2VjdC9pbnRlcnNlY3QtY2lyY2xlXCIpLFxuICAgIGludGVyc2VjdFBvbHlnb24gPSByZXF1aXJlKFwiLi9pbnRlcnNlY3QvaW50ZXJzZWN0LXBvbHlnb25cIik7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICByZWN0OiByZWN0LFxuICBlbGxpcHNlOiBlbGxpcHNlLFxuICBjaXJjbGU6IGNpcmNsZSxcbiAgZGlhbW9uZDogZGlhbW9uZFxufTtcblxuZnVuY3Rpb24gcmVjdChwYXJlbnQsIGJib3gsIG5vZGUpIHtcbiAgdmFyIHNoYXBlU3ZnID0gcGFyZW50Lmluc2VydChcInJlY3RcIilcbiAgICAgICAgLmF0dHIoXCJyeFwiLCBub2RlLnJ4KVxuICAgICAgICAuYXR0cihcInJ5XCIsIG5vZGUucnkpXG4gICAgICAgIC5hdHRyKFwieFwiLCAtYmJveC53aWR0aCAvIDIpXG4gICAgICAgIC5hdHRyKFwieVwiLCAtYmJveC5oZWlnaHQgLyAyKVxuICAgICAgICAuYXR0cihcIndpZHRoXCIsIGJib3gud2lkdGgpXG4gICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGJib3guaGVpZ2h0KVxuICAgICAgLmxvd2VyKCk7XG5cbiAgbm9kZS5pbnRlcnNlY3QgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIHJldHVybiBpbnRlcnNlY3RSZWN0KG5vZGUsIHBvaW50KTtcbiAgfTtcblxuICByZXR1cm4gc2hhcGVTdmc7XG59XG5cbmZ1bmN0aW9uIGVsbGlwc2UocGFyZW50LCBiYm94LCBub2RlKSB7XG4gIHZhciByeCA9IGJib3gud2lkdGggLyAyLFxuICAgICAgcnkgPSBiYm94LmhlaWdodCAvIDIsXG4gICAgICBzaGFwZVN2ZyA9IHBhcmVudC5hcHBlbmQoXCJlbGxpcHNlXCIsIFwiOmZpcnN0LWNoaWxkXCIpXG4gICAgICAgIC5hdHRyKFwieFwiLCAtYmJveC53aWR0aCAvIDIpXG4gICAgICAgIC5hdHRyKFwieVwiLCAtYmJveC5oZWlnaHQgLyAyKVxuICAgICAgICAuYXR0cihcInJ4XCIsIHJ4KVxuICAgICAgICAuYXR0cihcInJ5XCIsIHJ5KVxuICAgICAgICAgIC5sb3dlcigpO1xuXG4gIG5vZGUuaW50ZXJzZWN0ID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICByZXR1cm4gaW50ZXJzZWN0RWxsaXBzZShub2RlLCByeCwgcnksIHBvaW50KTtcbiAgfTtcblxuICByZXR1cm4gc2hhcGVTdmc7XG59XG5cbmZ1bmN0aW9uIGNpcmNsZShwYXJlbnQsIGJib3gsIG5vZGUpIHtcbiAgdmFyIHIgPSBNYXRoLm1heChiYm94LndpZHRoLCBiYm94LmhlaWdodCkgLyAyLFxuICAgICAgc2hhcGVTdmcgPSBwYXJlbnQuYXBwZW5kKFwiY2lyY2xlXCIsIFwiOmZpcnN0LWNoaWxkXCIpXG4gICAgICAgIC5hdHRyKFwieFwiLCAtYmJveC53aWR0aCAvIDIpXG4gICAgICAgIC5hdHRyKFwieVwiLCAtYmJveC5oZWlnaHQgLyAyKVxuICAgICAgICAuYXR0cihcInJcIiwgcilcbiAgICAgICAgICAubG93ZXIoKTtcblxuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgcmV0dXJuIGludGVyc2VjdENpcmNsZShub2RlLCByLCBwb2ludCk7XG4gIH07XG5cbiAgcmV0dXJuIHNoYXBlU3ZnO1xufVxuXG4vLyBDaXJjdW1zY3JpYmUgYW4gZWxsaXBzZSBmb3IgdGhlIGJvdW5kaW5nIGJveCB3aXRoIGEgZGlhbW9uZCBzaGFwZS4gSSBkZXJpdmVkXG4vLyB0aGUgZnVuY3Rpb24gdG8gY2FsY3VsYXRlIHRoZSBkaWFtb25kIHNoYXBlIGZyb206XG4vLyBodHRwOi8vbWF0aGZvcnVtLm9yZy9rYi9tZXNzYWdlLmpzcGE/bWVzc2FnZUlEPTM3NTAyMzZcbmZ1bmN0aW9uIGRpYW1vbmQocGFyZW50LCBiYm94LCBub2RlKSB7XG4gIHZhciB3ID0gKGJib3gud2lkdGggKiBNYXRoLlNRUlQyKSAvIDIsXG4gICAgICBoID0gKGJib3guaGVpZ2h0ICogTWF0aC5TUVJUMikgLyAyLFxuICAgICAgcG9pbnRzID0gW1xuICAgICAgICB7IHg6ICAwLCB5OiAtaCB9LFxuICAgICAgICB7IHg6IC13LCB5OiAgMCB9LFxuICAgICAgICB7IHg6ICAwLCB5OiAgaCB9LFxuICAgICAgICB7IHg6ICB3LCB5OiAgMCB9XG4gICAgICBdLFxuICAgICAgc2hhcGVTdmcgPSBwYXJlbnQuYXBwZW5kKFwicG9seWdvblwiLCBcIjpmaXJzdC1jaGlsZFwiKVxuICAgICAgICAuYXR0cihcInBvaW50c1wiLCBwb2ludHMubWFwKGZ1bmN0aW9uKHApIHsgcmV0dXJuIHAueCArIFwiLFwiICsgcC55OyB9KS5qb2luKFwiIFwiKSlcbiAgICAgICAgICAubG93ZXIoKTtcblxuICBub2RlLmludGVyc2VjdCA9IGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gaW50ZXJzZWN0UG9seWdvbihub2RlLCBwb2ludHMsIHApO1xuICB9O1xuXG4gIHJldHVybiBzaGFwZVN2Zztcbn1cbiIsInZhciBfID0gcmVxdWlyZShcIi4vbG9kYXNoXCIpO1xuXG4vLyBQdWJsaWMgdXRpbGl0eSBmdW5jdGlvbnNcbm1vZHVsZS5leHBvcnRzID0ge1xuICBpc1N1YmdyYXBoOiBpc1N1YmdyYXBoLFxuICBlZGdlVG9JZDogZWRnZVRvSWQsXG4gIGFwcGx5U3R5bGU6IGFwcGx5U3R5bGUsXG4gIGFwcGx5Q2xhc3M6IGFwcGx5Q2xhc3MsXG4gIGFwcGx5VHJhbnNpdGlvbjogYXBwbHlUcmFuc2l0aW9uLFxuICBnZXRMaW5lTWV0aG9kOiBnZXRMaW5lTWV0aG9kXG59O1xuXG4vKlxuICogUmV0dXJucyB0cnVlIGlmIHRoZSBzcGVjaWZpZWQgbm9kZSBpbiB0aGUgZ3JhcGggaXMgYSBzdWJncmFwaCBub2RlLiBBXG4gKiBzdWJncmFwaCBub2RlIGlzIG9uZSB0aGF0IGNvbnRhaW5zIG90aGVyIG5vZGVzLlxuICovXG5mdW5jdGlvbiBpc1N1YmdyYXBoKGcsIHYpIHtcbiAgcmV0dXJuICEhZy5jaGlsZHJlbih2KS5sZW5ndGg7XG59XG5cbmZ1bmN0aW9uIGVkZ2VUb0lkKGUpIHtcbiAgcmV0dXJuIGVzY2FwZUlkKGUudikgKyBcIjpcIiArIGVzY2FwZUlkKGUudykgKyBcIjpcIiArIGVzY2FwZUlkKGUubmFtZSk7XG59XG5cbnZhciBJRF9ERUxJTSA9IC86L2c7XG5mdW5jdGlvbiBlc2NhcGVJZChzdHIpIHtcbiAgcmV0dXJuIHN0ciA/IFN0cmluZyhzdHIpLnJlcGxhY2UoSURfREVMSU0sIFwiXFxcXDpcIikgOiBcIlwiO1xufVxuXG5mdW5jdGlvbiBhcHBseVN0eWxlKGRvbSwgc3R5bGVGbikge1xuICBpZiAoc3R5bGVGbikge1xuICAgIGRvbS5hdHRyKFwic3R5bGVcIiwgc3R5bGVGbik7XG4gIH1cbn1cblxuZnVuY3Rpb24gYXBwbHlDbGFzcyhkb20sIGNsYXNzRm4sIG90aGVyQ2xhc3Nlcykge1xuICBpZiAoY2xhc3NGbikge1xuICAgIGRvbVxuICAgICAgLmF0dHIoXCJjbGFzc1wiLCBjbGFzc0ZuKVxuICAgICAgLmF0dHIoXCJjbGFzc1wiLCBvdGhlckNsYXNzZXMgKyBcIiBcIiArIGRvbS5hdHRyKFwiY2xhc3NcIikpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFwcGx5VHJhbnNpdGlvbihzZWxlY3Rpb24sIGcpIHtcbiAgdmFyIGdyYXBoID0gZy5ncmFwaCgpO1xuXG4gIGlmIChfLmlzUGxhaW5PYmplY3QoZ3JhcGgpKSB7XG4gICAgdmFyIHRyYW5zaXRpb24gPSBncmFwaC50cmFuc2l0aW9uO1xuICAgIGlmIChfLmlzRnVuY3Rpb24odHJhbnNpdGlvbikpIHtcbiAgICAgIHJldHVybiB0cmFuc2l0aW9uKHNlbGVjdGlvbik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHNlbGVjdGlvbjtcbn1cblxuZnVuY3Rpb24gZ2V0TGluZU1ldGhvZChsaW5lVHlwZSkge1xuICB2YXIgbGluZXMgPSB7XG4gICAgXCJsaW5lYXJcIjogZDMuY3VydmVMaW5lYXIsXG4gICAgXCJsaW5lYXItY2xvc2VkXCI6IGQzLmN1cnZlTGluZWFyQ2xvc2VkLFxuICAgIFwic3RlcFwiOiBkMy5jdXJ2ZVN0ZXAsXG4gICAgXCJzdGVwLWJlZm9yZVwiOiBkMy5jdXJ2ZVN0ZXBCZWZvcmUsXG4gICAgXCJzdGVwLWFmdGVyXCI6IGQzLmN1cnZlU3RlcEFmdGVyLFxuICAgIFwiYmFzaXNcIjogZDMuY3VydmVCYXNpcyxcbiAgICBcImJhc2lzLW9wZW5cIjogZDMuY3VydmVCYXNpc09wZW4sXG4gICAgXCJiYXNpcy1jbG9zZWRcIjogZDMuY3VydmVCYXNpc0Nsb3NlZCxcbiAgICBcImJ1bmRsZVwiOiBkMy5jdXJ2ZUJ1bmRsZSxcbiAgICBcImNhcmRpbmFsXCI6IGQzLmN1cnZlQ2FyZGluYWwsXG4gICAgXCJjYXJkaW5hbC1vcGVuXCI6IGQzLmN1cnZlQ2FyZGluYWxPcGVuLFxuICAgIFwiY2FyZGluYWwtY2xvc2VkXCI6IGQzLmN1cnZlQ2FyZGluYWxDbG9zZWQsXG4gICAgXCJtb25vdG9uZVwiOiBkMy5jdXJ2ZU1vbm90b25lWFxuICB9O1xuXG4gIHJldHVybiBsaW5lc1tsaW5lVHlwZV07XG59XG4iLCJtb2R1bGUuZXhwb3J0cyA9IFwiMC40LjE4LXByZVwiO1xuIl19
