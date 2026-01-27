import React, { useState, useEffect, useRef } from 'react'
import { redPerformanceModules } from '../data/redPerformanceQuestions'
import { useDimension } from '../context/DimensionContext'
import { getScoreColor } from '../utils/colorUtils'
import MultiSelectDropdown from './MultiSelectDropdown'
import './QuestionPage.css'

interface QuestionPageRedProps {
  onClose: () => void
}

const QuestionPageRed: React.FC<QuestionPageRedProps> = ({ onClose }) => {
  console.log('[QuestionPageRed] Component rendering')
  
  const { setScore, getAnswers, setQuestionWeights, getQuestionWeights, saveAnswers, getCurrentFilePath, isLoading } = useDimension()
  const hasLoadedFromContext = useRef(false)
  const lastScoreRef = useRef<number>(0)
  const isInitialLoadComplete = useRef(false) // 标记初始加载是否完成
  const cachedFilePathRef = useRef<string | null>(null)
  const [answers, setAnswers] = useState<{ [key: string]: string | string[] }>({})
  
  // 获取Electron IPC
  const { ipcRenderer } = window.require('electron')
  
  // 初始化权重 - 如果没有保存的权重，平均分配
  const allQuestions = redPerformanceModules.flatMap(m => m.questions)
  const [weights, setWeights] = useState<{ [key: string]: number }>(() => {
    const savedWeights = getQuestionWeights('red-performance')
    if (Object.keys(savedWeights).length === 0) {
      const defaultWeight = 100 / allQuestions.length
      const initial: { [key: string]: number } = {}
      allQuestions.forEach(q => {
        initial[q.id] = defaultWeight
      })
      return initial
    }
    return savedWeights
  })
  
  const [questionScores, setQuestionScores] = useState<{ [key: string]: number }>({})

  const calculateQuestionScore = (questionId: string, answer: string | string[]): number => {
    const question = redPerformanceModules
      .flatMap(m => m.questions)
      .find(q => q.id === questionId)

    if (!question) return 0

    // Handle multi-input questions (Q4, Q5)
    if (question.type === 'multi-input' && typeof answer === 'string') {
      try {
        const data = JSON.parse(answer || '{}')
        
        // Q4: Precision-Accuracy Collaborative Index (PACI)
        if (questionId === 'q4') {
          const recovery = parseFloat(data.recovery || '0')
          const rsd = parseFloat(data.rsd || '0')
          // 只有当有有效输入时才计算
          if (data.recovery === '' || data.recovery === undefined) return 0
          if (!isNaN(recovery) && !isNaN(rsd) && recovery > 0 && rsd >= 0) {
            const accuracyTerm = Math.exp(-0.5 * Math.pow((recovery - 100) / 3, 2))
            const precisionTerm = 1 / (1 + Math.pow(rsd / 2.5, 2))
            return 100 * accuracyTerm * precisionTerm
          }
        }
        
        // Q5: Sensitivity-Linearity Fidelity Score (SLFS)
        if (questionId === 'q5') {
          const r2 = parseFloat(data.r2 || '0')
          const lod = parseFloat(data.lod || '0')
          const creq = parseFloat(data.creq || '1')
          // 只有当有有效输入时才计算
          if (data.r2 === '' || data.r2 === undefined) return 0
          if (!isNaN(r2) && !isNaN(lod) && !isNaN(creq) && r2 >= 0.99 && r2 <= 1.0 && lod >= 0 && creq > 0) {
            const linearityTerm = Math.pow((r2 - 0.99) / 0.0099, 4)
            const sensitivityTerm = Math.cos((Math.PI / 2) * (lod / creq))
            const score = 100 * linearityTerm * sensitivityTerm
            return Math.max(0, score) // 若计算结果<0则计为0
          }
        }
        
        return 0
      } catch {
        return 0
      }
    }

    if (question.type === 'select') {
      const option = question.options?.find(opt => opt.value === answer)
      return option?.score || 0
    }

    if (question.type === 'checkbox' && Array.isArray(answer)) {
      const totalDeduction = answer.reduce((sum, val) => {
        const option = question.options?.find(opt => opt.value === val)
        return sum + (option?.score || 0)
      }, 0)
      const score = 100 - totalDeduction
      return Math.max(0, Math.min(10, score / 10))
    }

    if (question.type === 'input' && question.scoringRules) {
      const value = parseFloat(answer as string)
      if (isNaN(value)) return 0

      for (const rule of question.scoringRules) {
        const minMatch = rule.min === undefined || value >= rule.min
        const maxMatch = rule.max === undefined || value < rule.max
        if (minMatch && maxMatch) {
          return rule.score
        }
      }
    }

    return 0
  }

  useEffect(() => {
    // 等待Context加载完成
    if (isLoading) return
    
    if (!hasLoadedFromContext.current) {
      hasLoadedFromContext.current = true
      cachedFilePathRef.current = getCurrentFilePath()
      
      // 加载保存的权重
      const savedWeights = getQuestionWeights('red-performance')
      if (Object.keys(savedWeights).length > 0) {
        setWeights(savedWeights)
      }
      
      const savedAnswers = getAnswers('red-performance')
      if (Object.keys(savedAnswers).length > 0) {
        const parsedAnswers: { [key: string]: string | string[] } = {}
        Object.entries(savedAnswers).forEach(([key, val]) => {
          try {
            const parsed = JSON.parse(val)
            parsedAnswers[key] = parsed
          } catch {
            parsedAnswers[key] = val
          }
        })
        setAnswers(parsedAnswers)
        const scores: { [key: string]: number } = {}
        Object.entries(parsedAnswers).forEach(([qId, ans]) => {
          // 如果答案是对象或数组，需要转回JSON字符串给calculateQuestionScore
          const answerForCalculation = (typeof ans === 'object') ? JSON.stringify(ans) : ans
          scores[qId] = calculateQuestionScore(qId, answerForCalculation)
          console.log(`[QuestionPageRed] Question ${qId} score:`, scores[qId], 'answer:', ans)
        })
        setQuestionScores(scores)
        
        // 使用setTimeout延迟计算总分，避免在渲染期间调用setScore
        setTimeout(() => {
          const currentWeights = Object.keys(savedWeights).length > 0 ? savedWeights : weights
          const total = allQuestions.reduce((sum, q) => {
            const score = scores[q.id] || 0
            const weight = currentWeights[q.id] || 0
            return sum + (score * weight / 100)
          }, 0)
          lastScoreRef.current = total // 设置初始分数引用
          setScore('red-performance', total)
          isInitialLoadComplete.current = true // 标记初始加载完成
        }, 0)
      } else {
        // 没有保存的数据，也需要标记加载完成
        isInitialLoadComplete.current = true
      }
    }
  }, [isLoading])

  // 当分数或权重变化时，自动计算总分（只在初始加载完成后）
  useEffect(() => {
    // 只有初始加载完成后才响应变化
    if (!isInitialLoadComplete.current) return
    const totalWeightedScore = allQuestions.reduce((sum, q) => {
      const score = questionScores[q.id] || 0
      const weight = weights[q.id] || 0
      return sum + (score * weight / 100)
    }, 0)
    
    // 只有当分数真正变化时才更新
    if (Math.abs(totalWeightedScore - lastScoreRef.current) > 0.01) {
      lastScoreRef.current = totalWeightedScore
      setScore('red-performance', totalWeightedScore)
    }
  }, [questionScores, weights])

  // 单独的useEffect处理答案保存，直接使用IPC写文件，不经过Context
  useEffect(() => {
    // 只有初始加载完成后才保存
    if (!isInitialLoadComplete.current) return
    if (Object.keys(answers).length === 0) return
    
    const saveToFile = async () => {
      try {
        const storageAnswers: { [key: string]: string } = {}
        Object.entries(answers).forEach(([key, val]) => {
          storageAnswers[key] = Array.isArray(val) ? JSON.stringify(val) : val as string
        })
        
        // 同时更新Context的allAnswers和questionWeights
        saveAnswers('red-performance', storageAnswers)
        setQuestionWeights('red-performance', weights)
        
        await ipcRenderer.invoke('save-to-file', {
          dimension: 'red-performance',
          data: {
            answers: storageAnswers,
            questionWeights: weights,
            questionScores: questionScores,
            score: lastScoreRef.current
          }
        })
      } catch (error) {
        console.error('[QuestionPageRed] Failed to save:', error)
      }
    }
    
    // 延迟保存，防抖
    const timer = setTimeout(saveToFile, 500)
    return () => clearTimeout(timer)
  }, [answers, weights, questionScores])

  const handleAnswerChange = React.useCallback((questionId: string, value: string | string[]) => {
    console.log('[QuestionPageRed] handleAnswerChange:', { questionId, value })
    // 只更新本地state，不调用saveAnswers
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: value
    }))
    
    const rawScore = calculateQuestionScore(questionId, value)
    console.log('[QuestionPageRed] Score calculated:', { questionId, rawScore })
    setQuestionScores(prevScores => ({
      ...prevScores,
      [questionId]: rawScore
    }))
  }, [])

  const handleWeightChange = React.useCallback((questionId: string, newWeight: number) => {
    setWeights(prevWeights => ({
      ...prevWeights,
      [questionId]: newWeight
    }))
  }, [])

  const normalizeWeights = React.useCallback(() => {
    setWeights(() => {
      const newWeights: { [key: string]: number } = {}
      
      // 直接均分，不考虑当前值
      const baseWeight = Math.floor(10000 / allQuestions.length) / 100
      let sum = 0
      
      allQuestions.forEach((q, index) => {
        if (index < allQuestions.length - 1) {
          newWeights[q.id] = baseWeight
          sum += baseWeight
        } else {
          // 最后一个补齐到100
          newWeights[q.id] = parseFloat((100 - sum).toFixed(2))
        }
      })
      
      return newWeights
    })
  }, [])

  const totalWeightedScore = allQuestions.reduce((sum, q) => {
    const score = questionScores[q.id] || 0
    const weight = weights[q.id] || 0
    return sum + (score * weight / 100)
  }, 0)
  
  const totalWeight = parseFloat(Object.values(weights).reduce((sum, w) => sum + w, 0).toFixed(1))
  const scoreColor = getScoreColor(totalWeightedScore, 100)

  return (
    <div className="question-page">
      <div className="question-header">
        <div className="question-header-left">
          <button className="back-button" onClick={onClose} style={{ borderColor: scoreColor, color: scoreColor }}>
            ← Back to Dashboard
          </button>
          <div className="question-header-content">
            <h2 style={{ marginBottom: '8px' }}>Excellence Guarantor</h2>
            <p className="dimension-description">
              Analytical accuracy, precision, and reliability assessment
            </p>
          </div>
        </div>
        <div className="header-score-display" style={{ backgroundColor: `${scoreColor}33`, borderColor: scoreColor }}>
          <div className="score-label">Total Score</div>
          <div className="score-value" style={{ color: scoreColor }}>
            {totalWeightedScore.toFixed(1)} / 100
          </div>
        </div>
      </div>

      <div className="question-content-with-sidebar">
        <div className="questions-panel">
          {redPerformanceModules.flatMap(module => module.questions).map((question) => {
            return (
                <div key={question.id} className="question-item" style={{ borderLeftColor: scoreColor }}>
                  <label className="question-label">{question.question}</label>

                  {question.type === 'multi-input' && question.multiInputFields && (
                    <div className="multi-input-container">
                      {question.multiInputFields.map((field) => {
                        const currentData = (() => {
                          const answer = answers[question.id]
                          if (typeof answer === 'object' && !Array.isArray(answer)) {
                            return answer
                          }
                          try {
                            return JSON.parse((answer as string) || '{}')
                          } catch {
                            return {}
                          }
                        })()
                        
                        return (
                          <div key={field.name} className="input-group">
                            <label className="input-label">{field.label}</label>
                            <div className="input-with-unit">
                              <input
                                type="number"
                                value={currentData[field.name] || ''}
                                onChange={(e) => {
                                  const answer = answers[question.id]
                                  let data: any = {}
                                  if (typeof answer === 'object' && !Array.isArray(answer)) {
                                    data = { ...(answer as any) }
                                  } else {
                                    try {
                                      data = JSON.parse((answer as string) || '{}')
                                    } catch {
                                      data = {}
                                    }
                                  }
                                  data[field.name] = e.target.value
                                  handleAnswerChange(question.id, JSON.stringify(data))
                                }}
                                onWheel={(e) => e.currentTarget.blur()}
                                onKeyDown={(e) => {
                                  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                                    e.preventDefault()
                                  }
                                }}
                                className="question-input"
                                placeholder={field.placeholder}
                                min={field.min}
                                max={field.max}
                                step="any"
                              />
                              {field.unit && <span className="input-unit">{field.unit}</span>}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {question.type === 'input' && (
                    <div className="input-group">
                      <input
                        type="number"
                        value={answers[question.id] as string || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        onWheel={(e) => e.currentTarget.blur()}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                            e.preventDefault()
                          }
                        }}
                        className="question-input"
                        placeholder={`Enter value${question.unit ? ` (${question.unit})` : ''}`}
                      />
                      {question.unit && <span className="input-unit">{question.unit}</span>}
                    </div>
                  )}

                  {question.type === 'select' && (
                    <select
                      value={answers[question.id] as string || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="question-select"
                    >
                      <option value="">-- Select an option --</option>
                      {question.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label} ({option.score} points)
                        </option>
                      ))}
                    </select>
                  )}

                  {question.type === 'checkbox' && (
                    <MultiSelectDropdown
                      options={question.options || []}
                      selectedValues={(answers[question.id] as string[]) || []}
                      onChange={(values) => handleAnswerChange(question.id, values)}
                      placeholder="-- Select conditions (multiple) --"
                    />
                  )}

                </div>
          )})}
        </div>

        {/* 右侧固定面板：权重设置和得分表 */}
        <div className="sidebar-panel">
          {/* 权重设置 */}
          <div className="sidebar-section">
            <h3 className="sidebar-title">Question Weights</h3>
            <div className="total-weight-display" style={{ 
              backgroundColor: totalWeight === 100 ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
              borderColor: totalWeight === 100 ? '#22c55e' : '#ef4444'
            }}>
              <span>Total: {totalWeight.toFixed(1)}%</span>
              {totalWeight !== 100 && (
                <>
                  <span className="weight-warning">⚠ Must equal 100%</span>
                  <button 
                    className="normalize-button"
                    onClick={normalizeWeights}
                    title="Auto-adjust weights to 100%"
                  >
                    Normalize
                  </button>
                </>
              )}
            </div>
            <div className="weights-list">
              {allQuestions.map((question, index) => (
                <div key={question.id} className="weight-item">
                  <label className="weight-label">Q{index + 1}</label>
                  <div className="weight-input-group">
                    <input
                      type="number"
                      value={weights[question.id] || 0}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        handleWeightChange(question.id, Math.max(0, Math.min(100, value)))
                      }}
                      onBlur={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        handleWeightChange(question.id, parseFloat(Math.max(0, Math.min(100, value)).toFixed(2)))
                      }}
                      className="weight-input"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="weight-unit">%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 得分表 */}
          <div className="sidebar-section">
            <h3 className="sidebar-title">Score Table</h3>
            <div className="scores-list">
              {allQuestions.map((question, index) => {
                const rawScore = questionScores[question.id] || 0
                const weight = weights[question.id] || 0
                const weightedScore = rawScore * weight / 100
                return (
                  <div key={question.id} className="score-item">
                    <div className="score-item-header">
                      <span className="score-question-label">Q{index + 1}</span>
                      <span className="score-raw">{rawScore.toFixed(1)}/100</span>
                    </div>
                    <div className="score-item-details">
                      <span className="score-weight">{weight.toFixed(1)}% weight</span>
                      <span className="score-weighted" style={{ color: scoreColor }}>
                        = {weightedScore.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="total-score-display" style={{ backgroundColor: `${scoreColor}33`, borderColor: scoreColor }}>
              <span className="total-score-label">Scores Total</span>
              <span className="total-score-value" style={{ color: scoreColor }}>
                {totalWeightedScore.toFixed(2)} / 100
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

// 使用React.memo防止Context其他状态变化导致的不必要重新渲染
export default React.memo(QuestionPageRed)
