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
