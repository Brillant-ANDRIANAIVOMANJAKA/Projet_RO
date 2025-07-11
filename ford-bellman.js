class Graph {
  constructor() {
    this.nodes = new Set();
    this.edges = [];
  }

  addNode(node) {
    this.nodes.add(node);
  }

  addEdge(source, target, weight) {
    this.edges.push({ source, target, weight });
  }
}

function fordBellmanMinimization(graph, startNode) {
  const distances = {};
  const predecessors = {};
  
  for (const node of graph.nodes) {
    distances[node] = Infinity;
    predecessors[node] = null;
  }
  
  distances[startNode] = 0;
  
  const n = graph.nodes.size;
  
  for (let i = 0; i < n - 1; i++) {
    let updated = false;
    
    for (const { source, target, weight } of graph.edges) {
      if (distances[source] !== Infinity && distances[target] > distances[source] + weight) {
        distances[target] = distances[source] + weight;
        predecessors[target] = source;
        updated = true;
      }
    }
    
    if (!updated) break;
  }
  
  for (const { source, target, weight } of graph.edges) {
    if (distances[source] !== Infinity && distances[target] > distances[source] + weight) {
      console.log("Graph contains a negative weight cycle");
      return { distances, predecessors, hasNegativeCycle: true };
    }
  }
  
  return { distances, predecessors, hasNegativeCycle: false };
}


function fordBellmanMaximization(graph, startNode) {
  const values = {};
  const predecessors = {};
  
  for (const node of graph.nodes) {
    values[node] = -Infinity;
    predecessors[node] = null;
  }
  
  values[startNode] = 0;
  
  const n = graph.nodes.size;
  
  for (let i = 0; i < n - 1; i++) {
    let updated = false;
    
    for (const { source, target, weight } of graph.edges) {
      if (values[source] !== -Infinity && values[target] < values[source] + weight) {
        values[target] = values[source] + weight;
        predecessors[target] = source;
        updated = true;
      }
    }
    
    if (!updated) break;
  }
  
  for (const { source, target, weight } of graph.edges) {
    if (values[source] !== -Infinity && values[target] < values[source] + weight) {
      console.log("Graph contains a positive weight cycle (infinite value possible)");
      return { values, predecessors, hasPositiveCycle: true };
    }
  }
  
  return { values, predecessors, hasPositiveCycle: false };
}

function reconstructPath(predecessors, startNode, endNode) {
  const path = [];
  let currentNode = endNode;
  
  while (currentNode !== null && currentNode !== startNode) {
    path.unshift(currentNode);
    currentNode = predecessors[currentNode];
  }
  
  if (currentNode === null) {
    return null; 
  }
  
  path.unshift(startNode);
  return path;
}

console.log("=== FORD-BELLMAN ALGORITHM - MINIMIZATION (SHORTEST PATH) ===");

const minGraph = new Graph();

for (let i = 1; i <= 6; i++) {
  minGraph.addNode(`x${i}`);
}

minGraph.addEdge("x1", "x2", 5);
minGraph.addEdge("x1", "x3", 3);
minGraph.addEdge("x2", "x4", 2);
minGraph.addEdge("x3", "x2", 1);
minGraph.addEdge("x3", "x4", 6);
minGraph.addEdge("x3", "x5", 7);
minGraph.addEdge("x4", "x6", 4);
minGraph.addEdge("x5", "x6", 2);

const startNode = "x1";
const endNode = "x6";
const minResult = fordBellmanMinimization(minGraph, startNode);

console.log("Distances from start node:");
for (const node of minGraph.nodes) {
  console.log(`${node}: ${minResult.distances[node]}`);
}

const shortestPath = reconstructPath(minResult.predecessors, startNode, endNode);
console.log("\nShortest path from", startNode, "to", endNode, ":");
console.log(shortestPath.join(" → "), `(total distance: ${minResult.distances[endNode]})`);

console.log("\n=== FORD-BELLMAN ALGORITHM - MAXIMIZATION (MAXIMUM VALUE PATH) ===");

const maxGraph = new Graph();

for (let i = 1; i <= 6; i++) {
  maxGraph.addNode(`x${i}`);
}

maxGraph.addEdge("x1", "x2", 5);
maxGraph.addEdge("x1", "x3", 3);
maxGraph.addEdge("x2", "x4", 2);
maxGraph.addEdge("x3", "x2", 1);
maxGraph.addEdge("x3", "x4", 6);
maxGraph.addEdge("x3", "x5", 7);
maxGraph.addEdge("x4", "x6", 4);
maxGraph.addEdge("x5", "x6", 2);

const maxResult = fordBellmanMaximization(maxGraph, startNode);

console.log("Maximum values from start node:");
for (const node of maxGraph.nodes) {
  console.log(`${node}: ${maxResult.values[node]}`);
}

const maxValuePath = reconstructPath(maxResult.predecessors, startNode, endNode);
console.log("\nMaximum value path from", startNode, "to", endNode, ":");
console.log(maxValuePath.join(" → "), `(total value: ${maxResult.values[endNode]})`);

console.log("\n=== EXAMPLE WITH LARGER GRAPH (16 NODES) ===");

const largeGraph = new Graph();

for (let i = 1; i <= 16; i++) {
  largeGraph.addNode(`x${i}`);
}

largeGraph.addEdge("x1", "x2", 4);
largeGraph.addEdge("x1", "x3", 2);
largeGraph.addEdge("x2", "x4", 5);
largeGraph.addEdge("x2", "x5", 3);
largeGraph.addEdge("x3", "x5", 1);
largeGraph.addEdge("x3", "x6", 6);
largeGraph.addEdge("x4", "x7", 2);
largeGraph.addEdge("x5", "x7", 4);
largeGraph.addEdge("x5", "x8", 3);
largeGraph.addEdge("x6", "x8", 5);
largeGraph.addEdge("x7", "x9", 1);
largeGraph.addEdge("x7", "x10", 7);
largeGraph.addEdge("x8", "x10", 2);
largeGraph.addEdge("x8", "x11", 3);
largeGraph.addEdge("x9", "x12", 4);
largeGraph.addEdge("x10", "x12", 6);
largeGraph.addEdge("x10", "x13", 2);
largeGraph.addEdge("x11", "x13", 5);
largeGraph.addEdge("x12", "x14", 3);
largeGraph.addEdge("x13", "x14", 4);
largeGraph.addEdge("x13", "x15", 1);
largeGraph.addEdge("x14", "x16", 2);
largeGraph.addEdge("x15", "x16", 5);

const largeStartNode = "x1";
const largeEndNode = "x16";
const largeResult = fordBellmanMinimization(largeGraph, largeStartNode);

console.log("Shortest path from", largeStartNode, "to", largeEndNode, ":");
const largePath = reconstructPath(largeResult.predecessors, largeStartNode, largeEndNode);
console.log(largePath.join(" → "), `(total distance: ${largeResult.distances[largeEndNode]})`);

console.log("\n=== STEP-BY-STEP VISUALIZATION ===");

function visualizeFordBellman(graph, startNode) {
  const distances = {};
  

  for (const node of graph.nodes) {
    distances[node] = Infinity;
  }

  distances[startNode] = 0;
  
  console.log("Initial distances:", { ...distances });

  const n = graph.nodes.size;

  for (let i = 0; i < n - 1; i++) {
    console.log(`\nIteration ${i + 1}:`);
    let updated = false;
    
    for (const { source, target, weight } of graph.edges) {
      if (distances[source] !== Infinity && distances[target] > distances[source] + weight) {
        console.log(`  Update: ${target} = ${distances[source]} + ${weight} = ${distances[source] + weight} (was ${distances[target]})`);
        distances[target] = distances[source] + weight;
        updated = true;
      }
    }
    
    console.log("  Distances after iteration:", { ...distances });
    
    if (!updated) {
      console.log("  No updates in this iteration, algorithm converged.");
      break;
    }
  }
  
  return distances;
}

const visGraph = new Graph();
for (let i = 1; i <= 5; i++) {
  visGraph.addNode(`x${i}`);
}

visGraph.addEdge("x1", "x2", 6);
visGraph.addEdge("x1", "x3", 4);
visGraph.addEdge("x2", "x4", 2);
visGraph.addEdge("x3", "x2", -3);
visGraph.addEdge("x3", "x4", 8);
visGraph.addEdge("x3", "x5", 5);
visGraph.addEdge("x4", "x5", 3);

console.log("Visualizing Ford-Bellman algorithm on a small graph:");
const visDistances = visualizeFordBellman(visGraph, "x1");
console.log("\nFinal distances:", visDistances);