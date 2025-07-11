"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Play, Pause, SkipBack, SkipForward } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface AlgorithmStepsProps {
  steps: any[]
  currentStep: number
  setCurrentStep: (step: number) => void
  algorithmType: "min" | "max"
  startNode: string | null
  endNode: string | null
  result: any
  path: string[] | null
}

export function AlgorithmSteps({
  steps = [],
  currentStep = 0,
  setCurrentStep,
  algorithmType = "min",
  startNode,
  endNode,
  result,
  path,
}: AlgorithmStepsProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    if (isPlaying && currentStep < steps.length - 1) {
      timer = setTimeout(() => {
        setCurrentStep(currentStep + 1)
      }, 1000)
    } else if (isPlaying && currentStep >= steps.length - 1) {
      setIsPlaying(false)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [isPlaying, currentStep, steps.length, setCurrentStep])

  const goToFirstStep = () => {
    setCurrentStep(0)
  }

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToLastStep = () => {
    setCurrentStep(steps.length - 1)
  }

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const currentStepData = steps && steps.length > 0 && currentStep < steps.length ? steps[currentStep] : null

  const getResultValues = () => {
    if (!result) return null

    const values = algorithmType === "min" ? result.distances : result.values
    if (!values) return null

    return Object.entries(values)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([node, value]) => ({
        node,
        value: value === Number.POSITIVE_INFINITY || value === Number.NEGATIVE_INFINITY ? "∞" : value,
      }))
  }

  const resultValues = getResultValues()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Résultats de l'Algorithme</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm">
            Étape {currentStep + 1} / {steps.length}
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={goToFirstStep}
              disabled={currentStep === 0 || steps.length === 0}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousStep}
              disabled={currentStep === 0 || steps.length === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={togglePlayPause} disabled={steps.length === 0}>
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextStep}
              disabled={currentStep === steps.length - 1 || steps.length === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToLastStep}
              disabled={currentStep === steps.length - 1 || steps.length === 0}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {currentStepData && (
          <div className="text-sm">
            <p className="font-medium mb-2">Itération {currentStepData.iteration}</p>
            {currentStepData.updatedEdges && currentStepData.updatedEdges.length > 0 ? (
              <div className="overflow-auto max-h-64">
                <p className="mb-2">Mises à jour dans cette itération :</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Arc</TableHead>
                      <TableHead>Calcul</TableHead>
                      <TableHead>Ancienne valeur</TableHead>
                      <TableHead>Nouvelle valeur</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentStepData.updatedEdges.map((update: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>
                          {update.source} → {update.target}
                        </TableCell>
                        <TableCell>
                          {update.source} + {update.weight} = {update.newValue}
                        </TableCell>
                        <TableCell>{update.oldValue === Number.POSITIVE_INFINITY ? "∞" : update.oldValue}</TableCell>
                        <TableCell className="font-medium text-green-600">{update.newValue}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p>Aucune mise à jour dans cette itération.</p>
            )}
          </div>
        )}

        {result && resultValues && (
          <div className="space-y-2 pt-2 border-t">
            <p className="font-medium mt-2">{algorithmType === "min" ? "Distances finales" : "Valeurs finales"} :</p>
            <div className="overflow-auto max-h-64">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nœud</TableHead>
                    <TableHead>{algorithmType === "min" ? "Distance" : "Valeur"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultValues.length > 0 ? (
                    resultValues.map(({ node, value }) => (
                      <TableRow key={node}>
                        <TableCell>{node}</TableCell>
                        <TableCell>{value}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-gray-500">Aucune donnée</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {path && endNode && result && (
              <div className="pt-2">
                <p className="font-medium">
                  {algorithmType === "min" ? "Chemin le plus court" : "Chemin de valeur maximale"} :
                </p>
                <div className="bg-secondary p-2 rounded-md mt-1">
                  <p className="font-medium">{path.join(" → ")}</p>
                  <p>
                    {algorithmType === "min" ? "Distance" : "Valeur"} totale :{" "}
                    <span className="font-bold">
                      {algorithmType === "min" && result.distances && result.distances[endNode] !== undefined
                        ? result.distances[endNode]
                        : algorithmType === "max" && result.values && result.values[endNode] !== undefined
                          ? result.values[endNode]
                          : "N/A"}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Affichage si aucune donnée du tout */}
        {(!currentStepData && (!resultValues || resultValues.length === 0)) && (
          <div className="text-center text-gray-500 py-8">Aucune donnée à afficher</div>
        )}
      </CardContent>
    </Card>
  )
}
