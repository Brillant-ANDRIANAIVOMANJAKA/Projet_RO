"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import type { Graph } from "@/lib/graph-types"

interface GraphVisualizerProps {
  graph: Graph
  selectedNode: string | null
  onSelectNode: (nodeId: string | null) => void
  startNode: string | null
  endNode: string | null
  path: string[] | null
  algorithmResult: any
  currentStep: any
  onUpdateNodePosition: (nodeId: string, x: number, y: number) => void
}

export function GraphVisualizer({
  graph,
  selectedNode,
  onSelectNode,
  startNode,
  endNode,
  path,
  algorithmResult,
  currentStep,
  onUpdateNodePosition,
}: GraphVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({})

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) * 0.35

    const positions: Record<string, { x: number; y: number }> = {}

    graph.nodes.forEach((node, index) => {
      if (node.x !== undefined && node.y !== undefined) {
        positions[node.id] = { x: node.x, y: node.y }
      } else {
        const angle = (index / Math.max(1, graph.nodes.length)) * 2 * Math.PI
        positions[node.id] = {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle),
        }
      }
    })

    setNodePositions(positions)
  }, [graph.nodes])

  const drawGraph = () => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    graph.edges.forEach((edge) => {
      const sourcePos = nodePositions[edge.source]
      const targetPos = nodePositions[edge.target]

      if (!sourcePos || !targetPos) return

      const isInPath =
        path &&
        path.length > 1 &&
        path.findIndex((n) => n === edge.source) !== -1 &&
        path[path.findIndex((n) => n === edge.source) + 1] === edge.target

      const isUpdatedInStep =
        currentStep &&
        currentStep.updatedEdges &&
        Array.isArray(currentStep.updatedEdges) &&
        currentStep.updatedEdges.some((e: any) => e.source === edge.source && e.target === edge.target)

      const dx = targetPos.x - sourcePos.x
      const dy = targetPos.y - sourcePos.y
      const length = Math.sqrt(dx * dx + dy * dy)

      const ndx = dx / length
      const ndy = dy / length

      const nodeRadius = 20
      const startX = sourcePos.x + ndx * nodeRadius
      const startY = sourcePos.y + ndy * nodeRadius
      const endX = targetPos.x - ndx * nodeRadius
      const endY = targetPos.y - ndy * nodeRadius

      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(endX, endY)


      if (isUpdatedInStep) {
        ctx.strokeStyle = "#ff3300"
        ctx.lineWidth = 3
      } else if (isInPath) {
        ctx.strokeStyle = "#00cc00" 
        ctx.lineWidth = 3
      } else {
        ctx.strokeStyle = "#666666"
        ctx.lineWidth = 1.5
      }

      ctx.stroke()


      const arrowSize = 10
      const angle = Math.atan2(endY - startY, endX - startX)

      ctx.beginPath()
      ctx.moveTo(endX, endY)
      ctx.lineTo(endX - arrowSize * Math.cos(angle - Math.PI / 6), endY - arrowSize * Math.sin(angle - Math.PI / 6))
      ctx.lineTo(endX - arrowSize * Math.cos(angle + Math.PI / 6), endY - arrowSize * Math.sin(angle + Math.PI / 6))
      ctx.closePath()
      ctx.fillStyle = isInPath ? "#00cc00" : "#666666"
      ctx.fill()

      const midX = (startX + endX) / 2
      const midY = (startY + endY) / 2


      const perpX = -ndy * 15
      const perpY = ndx * 15

      ctx.font = "14px Arial"
      ctx.fillStyle = isUpdatedInStep ? "#ff3300" : "#000000"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(edge.weight.toString(), midX + perpX, midY + perpY)
    })

    graph.nodes.forEach((node) => {
      const pos = nodePositions[node.id]
      if (!pos) return

      const isStart = node.id === startNode
      const isEnd = node.id === endNode
      const isSelected = node.id === selectedNode
      const isInPath = path && path.includes(node.id)
      const isDragging = node.id === draggedNode

      ctx.beginPath()
      ctx.arc(pos.x, pos.y, 20, 0, 2 * Math.PI)


      if (isDragging) {
        ctx.fillStyle = "#9C27B0" // Violet pour le nœud en cours de déplacement
      } else if (isStart) {
        ctx.fillStyle = "#4CAF50" // Vert pour le nœud de départ
      } else if (isEnd) {
        ctx.fillStyle = "#F44336" // Rouge pour le nœud d'arrivée
      } else if (isInPath) {
        ctx.fillStyle = "#8BC34A" // Vert clair pour les nœuds du chemin
      } else if (isSelected) {
        ctx.fillStyle = "#2196F3" // Bleu pour le nœud sélectionné
      } else {
        ctx.fillStyle = "#E0E0E0" // Gris pour les nœuds normaux
      }

      ctx.fill()
      ctx.strokeStyle = "#000000"
      ctx.lineWidth = isSelected || isDragging ? 3 : 1
      ctx.stroke()

      ctx.font = "14px Arial"
      ctx.fillStyle = "#000000"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(node.label, pos.x, pos.y)

      if (algorithmResult) {
        const distances = algorithmResult.distances || {}
        const values = algorithmResult.values || {}
        const value = distances[node.id] !== undefined ? distances[node.id] : values[node.id]

        if (value !== undefined && value !== Number.POSITIVE_INFINITY && value !== Number.NEGATIVE_INFINITY) {
          ctx.font = "12px Arial"
          ctx.fillStyle = "#000000"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"
          ctx.fillText(value.toString(), pos.x, pos.y + 35)
        }
      }
    })

    ctx.font = "14px Arial"
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)"
    ctx.textAlign = "center"
    ctx.textBaseline = "top"
    ctx.fillText("Cliquez et faites glisser les nœuds pour les déplacer", canvas.width / 2, 10)
  }

  const findNodeAtPosition = (x: number, y: number) => {
    for (const node of graph.nodes) {
      const pos = nodePositions[node.id]
      if (!pos) continue

      const dx = x - pos.x
      const dy = y - pos.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance <= 20) {
        return node.id
      }
    }
    return null
  }


  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const nodeId = findNodeAtPosition(x, y)
    if (nodeId) {
      setDraggedNode(nodeId)
      e.preventDefault() 
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedNode || !canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setNodePositions((prev) => ({
      ...prev,
      [draggedNode]: { x, y },
    }))

    drawGraph()
  }

  const handleMouseUp = () => {
    if (draggedNode) {
      const position = nodePositions[draggedNode]
      if (position) {

        onUpdateNodePosition(draggedNode, position.x, position.y)
      }
      setDraggedNode(null)
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const nodeId = findNodeAtPosition(x, y)
    onSelectNode(nodeId)
  }

  const resizeCanvas = () => {
    if (!canvasRef.current) return

    const container = canvasRef.current.parentElement
    if (!container) return

    canvasRef.current.width = container.clientWidth
    canvasRef.current.height = container.clientHeight

    drawGraph()
  }

  useEffect(() => {
    window.addEventListener("resize", resizeCanvas)
    resizeCanvas()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])


  useEffect(() => {
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [draggedNode, nodePositions])


  useEffect(() => {
    drawGraph()
  }, [graph, selectedNode, startNode, endNode, path, algorithmResult, currentStep, nodePositions, draggedNode])

  return (
    <canvas
      ref={canvasRef}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="w-full h-full cursor-pointer"
    />
  )
}
