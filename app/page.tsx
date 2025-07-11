"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GraphVisualizer } from "@/components/graph-visualizer"
import { AlgorithmSteps } from "@/components/algorithm-steps"
import { NodeEditor } from "@/components/node-editor"
import { EdgeEditor } from "@/components/edge-editor"
import { fordBellmanMinimization, fordBellmanMaximization, reconstructPath, findAllOptimalPaths } from "@/lib/ford-bellman"
import type { Graph } from "@/lib/graph-types"

export default function Home() {
  const [graph, setGraph] = useState<Graph>({
    nodes: [],
    edges: [],
  })

  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [startNode, setStartNode] = useState<string | null>(null)
  const [endNode, setEndNode] = useState<string | null>(null)
  const [algorithmType, setAlgorithmType] = useState<"min" | "max">("min")
  const [algorithmResult, setAlgorithmResult] = useState<any>(null)
  const [algorithmSteps, setAlgorithmSteps] = useState<any[]>([])
  const [currentStep, setCurrentStep] = useState<number>(0)

  const addNode = () => {
    const newId = `x${graph.nodes.length + 1}`
    setGraph({
      ...graph,
      nodes: [...graph.nodes, { id: newId, label: newId }],
    })
  }

  const removeNode = (nodeId: string) => {
    setGraph({
      nodes: graph.nodes.filter((node) => node.id !== nodeId),
      edges: graph.edges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId),
    })

    if (selectedNode === nodeId) {
      setSelectedNode(null)
    }

    if (startNode === nodeId) {
      setStartNode(null)
    }

    if (endNode === nodeId) {
      setEndNode(null)
    }
  }

  const addEdge = (source: string, target: string, weight: number) => {
    const newId = `e${graph.edges.length + 1}`
    setGraph({
      ...graph,
      edges: [...graph.edges, { id: newId, source, target, weight }],
    })
  }

  const removeEdge = (edgeId: string) => {
    setGraph({
      ...graph,
      edges: graph.edges.filter((edge) => edge.id !== edgeId),
    })
  }

  const updateEdge = (edgeId: string, source: string, target: string, weight: number) => {
    setGraph({
      ...graph,
      edges: graph.edges.map((edge) => (edge.id === edgeId ? { ...edge, source, target, weight } : edge)),
    })
  }

  const updateNodePosition = (nodeId: string, x: number, y: number) => {
    setGraph((prevGraph) => ({
      ...prevGraph,
      nodes: prevGraph.nodes.map((node) => (node.id === nodeId ? { ...node, x, y } : node)),
    }))
  }

  const resetNodePositions = () => {
    setGraph({
      ...graph,
      nodes: graph.nodes.map((node) => ({ ...node, x: undefined, y: undefined })),
    })
  }

  const runAlgorithm = () => {
    if (!startNode) return

    const algorithmGraph = {
      nodes: new Set(graph.nodes.map((node) => node.id)),
      edges: graph.edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        weight: edge.weight,
      })),
    }

    let result
    const steps: any[] = []

    if (algorithmType === "min") {
      result = fordBellmanMinimization(algorithmGraph, startNode, (step) => {
        steps.push(step)
      })
    } else {
      result = fordBellmanMaximization(algorithmGraph, startNode, (step) => {
        steps.push(step)
      })
    }

    setAlgorithmResult(result)
    setAlgorithmSteps(steps)
    setCurrentStep(0)
  }

  const getPaths = () => {
    if (!algorithmResult || !startNode || !endNode) return [];
    const { predecessors } = algorithmResult;
    return findAllOptimalPaths(predecessors, startNode, endNode);
  }

  return (
    <>
      <div className="fixed top-0 left-0 w-full z-50 bg-background shadow-md">
        <div className="container mx-auto flex items-center py-4">
          <img src="/placeholder-logo.svg" alt="Logo" className="h-10 w-10 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Algorithme de Ford</h1>
        </div>
      </div>
      <div className="container mx-auto py-8 pt-24">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visualisation du Graphe en fixed sur desktop */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="fixed top-24 left-0 w-[66vw] max-w-4xl h-[calc(100vh-6rem)] px-4">
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Visualisation du Graphe</CardTitle>
                </CardHeader>
                <CardContent className="h-[80%] overflow-auto">
                  <GraphVisualizer
                    graph={graph}
                    selectedNode={selectedNode}
                    onSelectNode={setSelectedNode}
                    startNode={startNode}
                    endNode={endNode}
                    path={getPaths()[0] || null}
                    paths={getPaths()}
                    algorithmResult={algorithmResult}
                    currentStep={currentStep < algorithmSteps.length ? algorithmSteps[currentStep] : null}
                    onUpdateNodePosition={updateNodePosition}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
          {/* Version mobile/normale */}
          <div className="lg:hidden">
            <Card className="h-[400px] mb-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Visualisation du Graphe</CardTitle>
            </CardHeader>
              <CardContent className="h-[320px]">
              <GraphVisualizer
                graph={graph}
                selectedNode={selectedNode}
                onSelectNode={setSelectedNode}
                startNode={startNode}
                endNode={endNode}
                path={getPaths()[0] || null}
                paths={getPaths()}
                algorithmResult={algorithmResult}
                currentStep={currentStep < algorithmSteps.length ? algorithmSteps[currentStep] : null}
                onUpdateNodePosition={updateNodePosition}
              />
            </CardContent>
          </Card>
        </div>
          {/* Le reste du contenu prend 1 colonne sur desktop */}
          <div className="lg:col-span-1">
          <Tabs defaultValue="controls">
            <div className="sticky top-24 z-40 bg-background">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="controls">Contrôles</TabsTrigger>
                <TabsTrigger value="nodes">Nœuds</TabsTrigger>
                <TabsTrigger value="edges">Arcs</TabsTrigger>
              </TabsList>
            </div>
            <div className="sticky top-[88px] z-40 bg-background h-1 w-full"></div>
            {/* Conteneur scrollable masqué sous le menu sticky */}
            <div className="relative overflow-hidden pt-1">
              <TabsContent value="controls" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Paramètres de l'Algorithme</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="algorithm-type">Type d'algorithme</Label>
                      <Select value={algorithmType} onValueChange={(value) => setAlgorithmType(value as "min" | "max")}>
                        <SelectTrigger id="algorithm-type">
                          <SelectValue placeholder="Sélectionner le type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="min">Minimisation (plus court chemin)</SelectItem>
                          <SelectItem value="max">Maximisation (chemin de valeur maximale)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="start-node">Nœud de départ</Label>
                      <Select value={startNode || ""} onValueChange={setStartNode}>
                        <SelectTrigger id="start-node">
                          <SelectValue placeholder="Sélectionner le nœud de départ" />
                        </SelectTrigger>
                        <SelectContent>
                          {graph.nodes.map((node) => (
                            <SelectItem key={node.id} value={node.id}>
                              {node.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="end-node">Nœud d'arrivée</Label>
                      <Select value={endNode || ""} onValueChange={setEndNode}>
                        <SelectTrigger id="end-node">
                          <SelectValue placeholder="Sélectionner le nœud d'arrivée" />
                        </SelectTrigger>
                        <SelectContent>
                          {graph.nodes.map((node) => (
                            <SelectItem key={node.id} value={node.id}>
                              {node.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button className="w-full" onClick={runAlgorithm} disabled={!startNode}>
                      Exécuter l'algorithme
                    </Button>
                  </CardContent>
                </Card>

                {algorithmResult && (
                  <AlgorithmSteps
                    steps={algorithmSteps}
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                    algorithmType={algorithmType}
                    startNode={startNode}
                    endNode={endNode}
                    result={algorithmResult}
                    path={getPath()}
                  />
                )}
              </TabsContent>

              <TabsContent value="nodes">
                <Card>
                  <CardHeader>
                    <CardTitle>Gestion des Nœuds</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={addNode} className="mb-4">
                      Ajouter un nœud
                    </Button>

                    <NodeEditor nodes={graph.nodes} onRemoveNode={removeNode} />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="edges">
                <Card>
                  <CardHeader>
                    <CardTitle>Gestion des Arcs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EdgeEditor
                      edges={graph.edges}
                      nodes={graph.nodes}
                      onAddEdge={addEdge}
                      onRemoveEdge={removeEdge}
                      onUpdateEdge={updateEdge}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
    </>
  )
}