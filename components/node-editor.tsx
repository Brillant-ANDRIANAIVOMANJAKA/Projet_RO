"use client"

import { Button } from "@/components/ui/button"
import type { Node } from "@/lib/graph-types"
import { Trash2 } from "lucide-react"

interface NodeEditorProps {
  nodes: Node[]
  onRemoveNode: (nodeId: string) => void
}

export function NodeEditor({ nodes, onRemoveNode }: NodeEditorProps) {
  return (
    <div className="space-y-2">
      {nodes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucun nœud. Ajoutez des nœuds pour commencer.</p>
      ) : (
        nodes.map((node) => (
          <div key={node.id} className="flex items-center justify-between p-2 border rounded-md">
            <span>{node.label}</span>
            <Button variant="ghost" size="icon" onClick={() => onRemoveNode(node.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))
      )}
    </div>
  )
}
