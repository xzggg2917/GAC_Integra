import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react'
import { dimensions } from '../data/algorithms'

const { ipcRenderer } = window.require('electron')

interface DimensionState {
  selectedDimensions: string[]
  customWeights: { [key: string]: number }
  scores: { [key: string]: number }
  allAnswers: { [dimensionId: string]: { [questionId: string]: string } }
  questionWeights: { [dimensionId: string]: { [questionId: string]: number } }
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
  setQuestionWeights: (dimensionId: string, weights: { [questionId: string]: number }) => void
  getQuestionWeights: (dimensionId: string) => { [questionId: string]: number }
  loadAllData: (data: Partial<DimensionState>) => void
  getAllData: () => DimensionState
  setCurrentFilePath: (path: string | null) => void
  getCurrentFilePath: () => string | null
  createNewProject: () => Promise<void>
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
  const [questionWeights, setQuestionWeights] = useState<{ [dimensionId: string]: { [questionId: string]: number } }>({})
  
  // 使用 ref 来防止在初始加载时触发自动保存
  const isInitialMount = useRef(true)

  // 应用启动时检查上次打开的文件路径和应用状态
  useEffect(() => {
    const loadLastFile = async () => {
      try {
        const result = await ipcRenderer.invoke('auto-load')
        
        if (result.success) {
          let shouldEnter = false
          
          // 如果auto-load直接返回了数据，使用它
          if (result.data) {
            if (result.data.selectedDimensions) setSelectedDimensions(result.data.selectedDimensions)
            if (result.data.customWeights) setCustomWeights(result.data.customWeights)
            if (result.data.scores) setScores(result.data.scores)
            if (result.data.allAnswers) setAllAnswers(result.data.allAnswers)
            if (result.data.questionWeights) setQuestionWeights(result.data.questionWeights)
            console.log('Data loaded from auto-load')
          }
          
          if (result.lastFilePath) {
            setCurrentFilePathState(result.lastFilePath)
            shouldEnter = true
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

  // 数据变化时的自动保存已移到各个维度页面
  // Context不再自动保存allAnswers和questionWeights，避免覆盖维度页面的保存
  // 只保存分数到内存中，让维度页面负责持久化
  // useEffect(() => {
  //   // 如果是初始加载或未加载完成，不自动保存
  //   if (isInitialMount.current || !isLoaded) {
  //     return
  //   }
  //   
  //   // 如果没有当前文件路径，不自动保存
  //   if (!currentFilePath) {
  //     return
  //   }
  //   
  //   // 自动保存到当前文件
  //   const autoSave = async () => {
  //     try {
  //       const data = {
  //         selectedDimensions,
  //         customWeights,
  //         scores,
  //         allAnswers,
  //         questionWeights
  //       }
  //       await ipcRenderer.invoke('save-to-file', currentFilePath, data)
  //       console.log('[DimensionContext] Auto-saved to:', currentFilePath)
  //     } catch (error) {
  //       console.error('[DimensionContext] Failed to auto-save:', error)
  //     }
  //   }
  //   
  //   // 延迟保存，避免频繁写文件
  //   const timer = setTimeout(autoSave, 500)
  //   return () => clearTimeout(timer)
  // }, [allAnswers, questionWeights, scores, selectedDimensions, customWeights, isLoaded, currentFilePath])

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
    // 更新allAnswers状态，触发自动保存到文件
    setAllAnswers(prev => ({
      ...prev,
      [dimensionId]: answers
    }))
  }

  const getAnswers = (dimensionId: string) => {
    return allAnswers[dimensionId] || {}
  }

  const setQuestionWeightsFunc = (dimensionId: string, weights: { [questionId: string]: number }) => {
    setQuestionWeights(prev => ({ ...prev, [dimensionId]: weights }))
  }

  const getQuestionWeights = (dimensionId: string) => {
    return questionWeights[dimensionId] || {}
  }

  const getAllData = (): DimensionState => {
    return {
      selectedDimensions,
      customWeights,
      scores,
      allAnswers,
      questionWeights
    }
  }

  const loadAllData = (data: Partial<DimensionState>) => {
    if (data.selectedDimensions) setSelectedDimensions(data.selectedDimensions)
    if (data.customWeights) setCustomWeights(data.customWeights)
    if (data.scores) setScores(data.scores)
    if (data.allAnswers) setAllAnswers(data.allAnswers)
    if (data.questionWeights) setQuestionWeights(data.questionWeights)
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

  const createNewProject = async () => {
    // 重置所有数据为初始状态
    setSelectedDimensions([])
    const initial: { [key: string]: number } = {}
    dimensions.forEach(dim => {
      initial[dim.id] = dim.defaultWeight
    })
    setCustomWeights(initial)
    setScores({})
    setAllAnswers({})
    setQuestionWeights({})
    setCurrentFilePathState(null)
    
    // 清除 Electron 存储的上次文件路径
    try {
      await ipcRenderer.invoke('clear-last-file-path')
    } catch (error) {
      console.error('Failed to clear last file path:', error)
    }
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
    return selectedDimensions.reduce((sum, dimensionId) => {
      const weight = customWeights[dimensionId] || dimensions.find(d => d.id === dimensionId)?.defaultWeight || 0
      return sum + weight
    }, 0)
  }

  const getTotalScore = () => {
    return selectedDimensions.reduce((sum, dimensionId) => {
      const score = scores[dimensionId] || 0
      const weight = customWeights[dimensionId] || dimensions.find(d => d.id === dimensionId)?.defaultWeight || 0
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
        questionWeights,
        setSelectedDimensions,
        setCustomWeights,
        setScore,
        getTotalWeight,
        getTotalScore,
        getWeight,
        saveAnswers,
        getAnswers,
        setQuestionWeights: setQuestionWeightsFunc,
        getQuestionWeights,
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
