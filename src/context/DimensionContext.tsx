import React, { createContext, useContext, useState, ReactNode } from 'react'
import { dimensions } from '../data/algorithms'

interface DimensionState {
  selectedDimensions: string[]
  customWeights: { [key: string]: number }
  scores: { [key: string]: number }
}

interface DimensionContextType extends DimensionState {
  setSelectedDimensions: (dimensions: string[]) => void
  setCustomWeights: (weights: { [key: string]: number }) => void
  setScore: (dimensionId: string, score: number) => void
  getTotalWeight: () => number
  getTotalScore: () => number
  getWeight: (dimensionId: string) => number
}

const DimensionContext = createContext<DimensionContextType | undefined>(undefined)

export const DimensionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([])
  const [customWeights, setCustomWeights] = useState<{ [key: string]: number }>(() => {
    const initial: { [key: string]: number } = {}
    dimensions.forEach(dim => {
      initial[dim.id] = dim.defaultWeight
    })
    return initial
  })
  const [scores, setScores] = useState<{ [key: string]: number }>({})

  const setScore = (dimensionId: string, score: number) => {
    setScores(prev => ({ ...prev, [dimensionId]: score }))
  }

  const getTotalWeight = () => {
    return Object.entries(customWeights)
      .reduce((sum, [id, weight]) => sum + weight, 0)
  }

  const getTotalScore = () => {
    return Object.entries(scores)
      .reduce((sum, [id, score]) => {
        const weight = customWeights[id] || 0
        return sum + (score * weight / 100)
      }, 0)
  }

  const getWeight = (dimensionId: string) => {
    return customWeights[dimensionId] || dimensions.find(d => d.id === dimensionId)?.defaultWeight || 0
  }

  return (
    <DimensionContext.Provider
      value={{
        selectedDimensions,
        customWeights,
        scores,
        setSelectedDimensions,
        setCustomWeights,
        setScore,
        getTotalWeight,
        getTotalScore,
        getWeight
      }}
    >
      {children}
    </DimensionContext.Provider>
  )
}

export const useDimension = () => {
  const context = useContext(DimensionContext)
  if (!context) {
    throw new Error('useDimension must be used within DimensionProvider')
  }
  return context
}
