import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react'
import { dimensions } from '../data/algorithms'

const { ipcRenderer } = window.require('electron')

interface DimensionState {
  selectedDimensions: string[]
  customWeights: { [key: string]: number }
  scores: { [key: string]: number }
  allAnswers: { [dimensionId: string]: { [questionId: string]: string } }
}

interface DimensionContextType extends DimensionState {
  setSelectedDimensions: (dimensions: string[]) => void
  setCustomWeights: (weights: { [key: string]: number }) => void
  setScore: (dimensionId: string, score: number) => void
  getTotalWeight: () => number
  getTotalScore: () => number
  getWeight: (dimensionId: string) => number
  saveAnswers: (dimensionId: string, answers: { [questionId: string]: string }) => void
  getAnswers: (dimensionId: string) => { [questionId: string]: string }
  loadAllData: (data: Partial<DimensionState>) => void
  getAllData: () => DimensionState
  setCurrentFilePath: (path: string | null) => void
  getCurrentFilePath: () => string | null
  createNewProject: () => void
  hasEnteredApp: () => boolean
  markAppEntered: () => void
  isLoading: boolean
  currentPage: { type: 'dashboard' | 'dimension' | 'visualization', dimensionId?: string | null }
  setCurrentPage: (page: { type: 'dashboard' | 'dimension' | 'visualization', dimensionId?: string | null }) => void
}

const DimensionContext = createContext<DimensionContextType | undefined>(undefined)

export const DimensionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentFilePath, setCurrentFilePathState] = useState<string | null>(null)
  const [appEntered, setAppEntered] = useState(false)
  const [currentPage, setCurrentPageState] = useState<{ type: 'dashboard' | 'dimension' | 'visualization', dimensionId?: string | null }>({ type: 'dashboard' })
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([])
  const [customWeights, setCustomWeights] = useState<{ [key: string]: number }>(() => {
    const initial: { [key: string]: number } = {}
    dimensions.forEach(dim => {
      initial[dim.id] = dim.defaultWeight
    })
    return initial
  })
  const [scores, setScores] = useState<{ [key: string]: number }>({})
  const [allAnswers, setAllAnswers] = useState<{ [dimensionId: string]: { [questionId: string]: string } }>({})
  
  // 使用 ref 来防止在初始加载时触发自动保存
  const isInitialMount = useRef(true)

  // 应用启动时检查上次打开的文件路径和应用状态
  useEffect(() => {
    const loadLastFile = async () => {
      try {
        const result = await ipcRenderer.invoke('auto-load')
        
        if (result.success) {
          let shouldEnter = false
          
          if (result.lastFilePath) {
            setCurrentFilePathState(result.lastFilePath)
            shouldEnter = true
            
            // 从文件加载数据
            try {
              const fileContent = await ipcRenderer.invoke('read-file', result.lastFilePath)
              if (fileContent.success && fileContent.data) {
                if (fileContent.data.selectedDimensions) setSelectedDimensions(fileContent.data.selectedDimensions)
                if (fileContent.data.customWeights) setCustomWeights(fileContent.data.customWeights)
                if (fileContent.data.scores) setScores(fileContent.data.scores)
                if (fileContent.data.allAnswers) setAllAnswers(fileContent.data.allAnswers)
                console.log('Data loaded from file:', result.lastFilePath)
              }
            } catch (error) {
              console.error('Failed to load data from file:', error)
            }
          }
          
          if (result.appEntered === true) {
            shouldEnter = true
          }
          
          if (result.currentPage) {
            setCurrentPageState(result.currentPage)
          }
          
          if (shouldEnter) {
            setAppEntered(true)
          }
        }
      } catch (error) {
        console.error('Failed to load app state:', error)
      } finally {
        setIsLoaded(true)
        isInitialMount.current = false
      }
    }
    loadLastFile()
  }, [])

  // 数据变化时自动保存到当前文件
  useEffect(() => {
    if (!isInitialMount.current && isLoaded && currentFilePath) {
      const autoSave = async () => {
        try {
          const data = {
            selectedDimensions,
            customWeights,
            scores,
            allAnswers
          }
          console.log('[auto-save] Saving to:', currentFilePath)
          console.log('[auto-save] Data:', data)
          await ipcRenderer.invoke('save-to-file', currentFilePath, data)
          console.log('[auto-save] Save completed')
        } catch (error) {
          console.error('Failed to auto-save:', error)
        }
      }
      // 延迟保存，避免频繁写入
      const timer = setTimeout(autoSave, 500)
      return () => clearTimeout(timer)
    } else {
      if (!currentFilePath) {
        console.log('[auto-save] Skipped: No file path set')
      }
    }
  }, [selectedDimensions, customWeights, scores, allAnswers, isLoaded, currentFilePath])

  // 页面状态变化时保存
  useEffect(() => {
    if (!isInitialMount.current && isLoaded && appEntered) {
      const savePage = async () => {
        try {
          await ipcRenderer.invoke('save-current-page', currentPage)
        } catch (error) {
          console.error('Failed to save current page:', error)
        }
      }
      savePage()
    }
  }, [currentPage, isLoaded, appEntered])

  const setScore = (dimensionId: string, score: number) => {
    setScores(prev => ({ ...prev, [dimensionId]: score }))
  }

  const saveAnswers = (dimensionId: string, answers: { [questionId: string]: string }) => {
    console.log('[saveAnswers] Saving answers for dimension:', dimensionId)
    console.log('[saveAnswers] Answers:', answers)
    setAllAnswers(prev => ({ ...prev, [dimensionId]: answers }))
  }

  const getAnswers = (dimensionId: string) => {
    return allAnswers[dimensionId] || {}
  }

  const getAllData = (): DimensionState => {
    return {
      selectedDimensions,
      customWeights,
      scores,
      allAnswers
    }
  }

  const loadAllData = (data: Partial<DimensionState>) => {
    if (data.selectedDimensions) setSelectedDimensions(data.selectedDimensions)
    if (data.customWeights) setCustomWeights(data.customWeights)
    if (data.scores) setScores(data.scores)
    if (data.allAnswers) setAllAnswers(data.allAnswers)
  }

  const setCurrentFilePath = async (path: string | null) => {
    setCurrentFilePathState(path)
    // 保存最后打开的文件路径
    if (path) {
      try {
        await ipcRenderer.invoke('save-last-file-path', path)
      } catch (error) {
        console.error('Failed to save last file path:', error)
      }
    }
  }

  const getCurrentFilePath = () => {
    return currentFilePath
  }

  const createNewProject = () => {
    // 重置所有数据为初始状态
    setSelectedDimensions([])
    const initial: { [key: string]: number } = {}
    dimensions.forEach(dim => {
      initial[dim.id] = dim.defaultWeight
    })
    setCustomWeights(initial)
    setScores({})
    setAllAnswers({})
    setCurrentFilePathState(null)
  }

  const hasEnteredApp = () => {
    if (!isLoaded) return false
    return appEntered || currentFilePath !== null
  }

  const markAppEntered = async () => {
    setAppEntered(true)
    try {
      await ipcRenderer.invoke('mark-app-entered')
    } catch (error) {
      console.error('Failed to mark app entered:', error)
    }
  }

  const setCurrentPage = (page: { type: 'dashboard' | 'dimension' | 'visualization', dimensionId?: string | null }) => {
    setCurrentPageState(page)
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
        allAnswers,
        setSelectedDimensions,
        setCustomWeights,
        setScore,
        getTotalWeight,
        getTotalScore,
        getWeight,
        saveAnswers,
        getAnswers,
        loadAllData,
        getAllData,
        setCurrentFilePath,
        getCurrentFilePath,
        createNewProject,
        hasEnteredApp,
        markAppEntered,
        isLoading: !isLoaded,
        currentPage,
        setCurrentPage
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
