"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Node, Edge } from "@/lib/graph-types"
import { Trash2, Edit, Save, X } from "lucide-react"

interface EdgeEditorProps {
  edges: Edge[]
  nodes: Node[]
  onAddEdge: (source: string, target: string, weight: number) => void
  onRemoveEdge: (edgeId: string) => void
  onUpdateEdge: (edgeId: string, source: string, target: string, weight: number) => void
}

export function EdgeEditor({ edges, nodes, onAddEdge, onRemoveEdge, onUpdateEdge }: EdgeEditorProps) {
  const [newSource, setNewSource] = useState<string>("")
  const [newTarget, setNewTarget] = useState<string>("")
  const [newWeight, setNewWeight] = useState<string>("1")
  const [editingEdge, setEditingEdge] = useState<string | null>(null)
  const [editSource, setEditSource] = useState<string>("")
  const [editTarget, setEditTarget] = useState<string>("")
  const [editWeight, setEditWeight] = useState<string>("")

  const handleAddEdge = () => {
    if (newSource && newTarget && newWeight) {
      onAddEdge(newSource, newTarget, Number(newWeight))
      setNewSource("")
      setNewTarget("")
      setNewWeight("1")
    }
  }

  const startEditing = (edge: Edge) => {
    setEditingEdge(edge.id)
    setEditSource(edge.source)
    setEditTarget(edge.target)
    setEditWeight(edge.weight.toString())
  }

  const cancelEditing = () => {
    setEditingEdge(null)
  }

  const saveEditing = () => {
    if (editingEdge && editSource && editTarget && editWeight) {
      onUpdateEdge(editingEdge, editSource, editTarget, Number(editWeight))
      setEditingEdge(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="new-source">Source</Label>
            <Select value={newSource} onValueChange={setNewSource}>
              <SelectTrigger id="new-source">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                {nodes.map((node) => (
                  <SelectItem key={node.id} value={node.id}>
                    {node.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="new-target">Cible</Label>
            <Select value={newTarget} onValueChange={setNewTarget}>
              <SelectTrigger id="new-target">
                <SelectValue placeholder="Cible" />
              </SelectTrigger>
              <SelectContent>
                {nodes.map((node) => (
                  <SelectItem key={node.id} value={node.id}>
                    {node.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="new-weight">Poids</Label>
          <Input id="new-weight" type="number" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} />
        </div>

        <Button onClick={handleAddEdge} disabled={!newSource || !newTarget || !newWeight} className="w-full">
          Ajouter un arc
        </Button>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Arcs existants</h3>

        {edges.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun arc. Ajoutez des arcs pour commencer.</p>
        ) : (
          edges.map((edge) => (
            <div key={edge.id} className="p-2 border rounded-md">
              {editingEdge === edge.id ? (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`edit-source-${edge.id}`}>Source</Label>
                      <Select value={editSource} onValueChange={setEditSource}>
                        <SelectTrigger id={`edit-source-${edge.id}`}>
                          <SelectValue placeholder="Source" />
                        </SelectTrigger>
                        <SelectContent>
                          {nodes.map((node) => (
                            <SelectItem key={node.id} value={node.id}>
                              {node.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor={`edit-target-${edge.id}`}>Cible</Label>
                      <Select value={editTarget} onValueChange={setEditTarget}>
                        <SelectTrigger id={`edit-target-${edge.id}`}>
                          <SelectValue placeholder="Cible" />
                        </SelectTrigger>
                        <SelectContent>
                          {nodes.map((node) => (
                            <SelectItem key={node.id} value={node.id}>
                              {node.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor={`edit-weight-${edge.id}`}>Poids</Label>
                    <Input
                      id={`edit-weight-${edge.id}`}
                      type="number"
                      value={editWeight}
                      onChange={(e) => setEditWeight(e.target.value)}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="default" size="sm" onClick={saveEditing} className="flex-1">
                      <Save className="h-4 w-4 mr-1" />
                      Enregistrer
                    </Button>
                    <Button variant="outline" size="sm" onClick={cancelEditing} className="flex-1">
                      <X className="h-4 w-4 mr-1" />
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span>
                    {edge.source} → {edge.target} ({edge.weight})
                  </span>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="icon" onClick={() => startEditing(edge)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onRemoveEdge(edge.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
