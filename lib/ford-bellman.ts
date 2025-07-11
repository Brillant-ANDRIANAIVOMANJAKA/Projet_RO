interface AlgorithmGraph {
  nodes: Set<string>
  edges: {
    source: string
    target: string
    weight: number
  }[]
}

interface AlgorithmStep {
  iteration: number
  distances?: Record<string, number>
  values?: Record<string, number>
  updatedEdges: {
    source: string
    target: string
    weight: number
    oldValue: number
    newValue: number
  }[]
}

export function fordBellmanMinimization(
  graph: AlgorithmGraph,
  startNode: string,
  onStep?: (step: AlgorithmStep) => void,
) {
  const distances: Record<string, number> = {}
  const predecessors: Record<string, string | null> = {}

  for (const node of graph.nodes) {
    distances[node] = Number.POSITIVE_INFINITY
    predecessors[node] = null
  }

  distances[startNode] = 0

  const n = graph.nodes.size

  for (let i = 0; i < n - 1; i++) {
    let updated = false
    const updatedEdges: {
      source: string
      target: string
      weight: number
      oldValue: number
      newValue: number
    }[] = []

    for (const { source, target, weight } of graph.edges) {
      if (distances[source] !== Number.POSITIVE_INFINITY && distances[target] > distances[source] + weight) {
        const oldValue = distances[target]
        distances[target] = distances[source] + weight
        predecessors[target] = source
        updated = true

        updatedEdges.push({
          source,
          target,
          weight,
          oldValue,
          newValue: distances[target],
        })
      }
    }

    if (onStep) {
      onStep({
        iteration: i + 1,
        distances: { ...distances },
        updatedEdges,
      })
    }

    if (!updated) break
  }

  let hasNegativeCycle = false
  for (const { source, target, weight } of graph.edges) {
    if (distances[source] !== Number.POSITIVE_INFINITY && distances[target] > distances[source] + weight) {
      hasNegativeCycle = true
      break
    }
  }

  return { distances, predecessors, hasNegativeCycle }
}

export function fordBellmanMaximization(
  graph: AlgorithmGraph,
  startNode: string,
  onStep?: (step: AlgorithmStep) => void,
) {
  const values: Record<string, number> = {}
  const predecessors: Record<string, string | null> = {}

  for (const node of graph.nodes) {
    values[node] = Number.NEGATIVE_INFINITY
    predecessors[node] = null
  }

  values[startNode] = 0

  const n = graph.nodes.size

  for (let i = 0; i < n - 1; i++) {
    let updated = false
    const updatedEdges: {
      source: string
      target: string
      weight: number
      oldValue: number
      newValue: number
    }[] = []

     for (const { source, target, weight } of graph.edges) {
      if (values[source] !== Number.NEGATIVE_INFINITY && values[target] < values[source] + weight) {
        const oldValue = values[target]
        values[target] = values[source] + weight
        predecessors[target] = source
        updated = true

        updatedEdges.push({
          source,
          target,
          weight,
          oldValue,
          newValue: values[target],
        })
      }
    }

    if (onStep) {
      onStep({
        iteration: i + 1,
        values: { ...values },
        updatedEdges,
      })
    }

    if (!updated) break
  }

  let hasPositiveCycle = false
  for (const { source, target, weight } of graph.edges) {
    if (values[source] !== Number.NEGATIVE_INFINITY && values[target] < values[source] + weight) {
      hasPositiveCycle = true
      break
    }
  }

  return { values, predecessors, hasPositiveCycle }
}

export function reconstructPath(
  predecessors: Record<string, string | null>,
  startNode: string,
  endNode: string,
): string[] | null {
  const path: string[] = []
  let currentNode: string | null = endNode

  while (currentNode !== null && currentNode !== startNode) {
    path.unshift(currentNode)
    currentNode = predecessors[currentNode]
  }

  if (currentNode === null) {
    return null 
  }

  path.unshift(startNode)
  return path
}
