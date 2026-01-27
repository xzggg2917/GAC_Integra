import React, { useState, useEffect, useRef } from 'react'
import { bluePracticalityModules } from '../data/bluePracticalityQuestions'
import { useDimension } from '../context/DimensionContext'
import { getScoreColor } from '../utils/colorUtils'
import MultiSelectDropdown from './MultiSelectDropdown'
import './QuestionPage.css'

interface QuestionPageBlueProps {
  onClose: () => void
}

const QuestionPageBlue: React.FC<QuestionPageBlueProps> = ({ onClose }) => {
  const { setScore, getAnswers, setQuestionWeights, getQuestionWeights, saveAnswers, getCurrentFilePath, isLoading } = useDimension()
  const hasLoadedFromContext = useRef(false)
  const lastScoreRef = useRef<number>(0)
  const isInitialLoadComplete = useRef(false)
  const cachedFilePathRef = useRef<string | null>(null)
  const [answers, setAnswers] = useState<{ [key: string]: string | string[] }>({})
  
  const { ipcRenderer } = window.require('electron')
  
  // 初始化权重 - 如果没有保存的权重，平均分配
  const allQuestions = bluePracticalityModules.flatMap(m => m.questions)
  const [weights, setWeights] = useState<{ [key: string]: number }>(() => {
    const savedWeights = getQuestionWeights('blue-practicality')
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
    const question = bluePracticalityModules
      .flatMap(m => m.questions)
      .find(q => q.id === questionId)

    if (!question) return 0

    // Handle multi-input questions (Q3, Q4, Q5)
    if (question.type === 'multi-input' && typeof answer === 'string') {
      try {
        const data = JSON.parse(answer || '{}')
        
        // Q3: Economic Burden Index (EBI)
        if (questionId === 'q3') {
          const cost = parseFloat(data.cost || '0')
          const time = parseFloat(data.time || '0')
          // 只有当有有效输入时才计算
          if (data.cost === '' || data.cost === undefined) return 0
          if (!isNaN(cost) && !isNaN(time) && cost >= 0 && time >= 0) {
            const numerator = (cost + 20 * time) / 15
            return 100 / (1 + Math.pow(numerator, 2.5))
          }
        }
        
        // Q4: Time-Output Efficiency (TOE)
        if (questionId === 'q4') {
          const runtime = parseFloat(data.runtime || '0')
          const analytes = parseFloat(data.analytes || '1')
          // 只有当有有效输入时才计算
          if (data.runtime === '' || data.runtime === undefined) return 0
          if (!isNaN(runtime) && !isNaN(analytes) && runtime >= 0 && analytes > 0) {
            const ratio = runtime / analytes
            return 100 / (1 + 0.01 * Math.pow(ratio, 4.5))
          }
        }
        
        // Q5: Resource Productivity Ratio (RPR)
        if (questionId === 'q5') {
          const analytes = parseFloat(data.analytes || '1')
          const volume = parseFloat(data.volume || '0')
          // 只有当有有效输入时才计算
          if (data.analytes === '' || data.analytes === undefined) return 0
          if (!isNaN(analytes) && !isNaN(volume) && analytes > 0 && volume >= 0) {
            const nSquared = Math.pow(analytes, 2)
            const denominator = nSquared + Math.log(1 + volume)
            return 100 * nSquared / denominator
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
    console.log('[QuestionPageBlue] Initial load useEffect triggered')
    
    // 等待Context加载完成
    if (isLoading) return
    
    if (!hasLoadedFromContext.current) {
      hasLoadedFromContext.current = true
      cachedFilePathRef.current = getCurrentFilePath()
      console.log('[QuestionPageBlue] Loading data from context...')
      
      // 加载保存的权重
      const savedWeights = getQuestionWeights('blue-practicality')
      if (Object.keys(savedWeights).length > 0) {
        setWeights(savedWeights)
      }
      
      const savedAnswers = getAnswers('blue-practicality')
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
        
        // 计算初始分数
        const scores: { [key: string]: number } = {}
        Object.entries(parsedAnswers).forEach(([qId, ans]) => {
          // 如果答案是对象或数组，需要转回JSON字符串给calculateQuestionScore
          const answerForCalculation = (typeof ans === 'object') ? JSON.stringify(ans) : ans
          scores[qId] = calculateQuestionScore(qId, answerForCalculation)
          console.log(`[QuestionPageBlue] Question ${qId} score:`, scores[qId], 'answer:', ans)
        })
        setQuestionScores(scores)
        
        // 延迟计算总分
        setTimeout(() => {
          const currentWeights = Object.keys(savedWeights).length > 0 ? savedWeights : weights
          const total = allQuestions.reduce((sum, q) => {
            const score = scores[q.id] || 0
            const weight = currentWeights[q.id] || 0
            return sum + (score * weight / 100)
          }, 0)
          lastScoreRef.current = total
          setScore('blue-practicality', total)
          isInitialLoadComplete.current = true
          console.log('[QuestionPageBlue] Initial load complete, total score:', total)
        }, 0)
      } else {
        isInitialLoadComplete.current = true
      }
    }
  }, [isLoading])

  // 分数变化时自动计算总分
  useEffect(() => {
    console.log('[QuestionPageBlue] Score calculation useEffect triggered')
    
    if (!isInitialLoadComplete.current) {
      console.log('[QuestionPageBlue] Skipping score calculation - initial load not complete')
      return
    }
    
    const totalWeightedScore = allQuestions.reduce((sum, q) => {
      const score = questionScores[q.id] || 0
      const weight = weights[q.id] || 0
      return sum + (score * weight / 100)
    }, 0)
    
    if (Math.abs(totalWeightedScore - lastScoreRef.current) > 0.01) {
      console.log('[QuestionPageBlue] Score changed:', lastScoreRef.current, '->', totalWeightedScore)
      lastScoreRef.current = totalWeightedScore
      setScore('blue-practicality', totalWeightedScore)
    }
  }, [questionScores, weights])

  // 答案保存useEffect
  useEffect(() => {
    console.log('[QuestionPageBlue] Save useEffect triggered')
    
    if (!isInitialLoadComplete.current) {
      console.log('[QuestionPageBlue] Skipping save - initial load not complete')
      return
    }
    if (Object.keys(answers).length === 0) {
      console.log('[QuestionPageBlue] Skipping save - no answers')
      return
    }
    
    const saveToFile = async () => {
      try {
        console.log('[QuestionPageBlue] Saving to file')
        
        const storageAnswers: { [key: string]: string } = {}
        Object.entries(answers).forEach(([key, val]) => {
          storageAnswers[key] = Array.isArray(val) ? JSON.stringify(val) : val as string
        })
        
        // 同时更新Context
        saveAnswers('blue-practicality', storageAnswers)
        setQuestionWeights('blue-practicality', weights)
        
        await ipcRenderer.invoke('save-to-file', {
          dimension: 'blue-practicality',
          data: {
            answers: storageAnswers,
            questionWeights: weights,
            questionScores: questionScores,
            score: lastScoreRef.current
          }
        })
        console.log('[QuestionPageBlue] Save completed')
      } catch (error) {
        console.error('[QuestionPageBlue] Failed to save:', error)
      }
    }
    
    const timer = setTimeout(saveToFile, 500)
    return () => clearTimeout(timer)
  }, [answers, weights, questionScores])

  const handleAnswerChange = React.useCallback((questionId: string, value: string | string[]) => {
    console.log('[QuestionPageBlue] handleAnswerChange called for', questionId)
    
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: value
    }))
    
    const rawScore = calculateQuestionScore(questionId, value)
    console.log('[QuestionPageBlue] Calculated score for', questionId, ':', rawScore)
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
      const baseWeight = Math.floor(10000 / allQuestions.length) / 100
      let sum = 0
      
      allQuestions.forEach((q, index) => {
        if (index < allQuestions.length - 1) {
          newWeights[q.id] = baseWeight
          sum += baseWeight
        } else {
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
  
  const totalWeight = parseFloat(Object.values(weights).reduce((sum, w) => sum + w, 0).toFixed(2))
  const scoreColor = getScoreColor(totalWeightedScore, 100)

  return (
    <div className="question-page">
      <div className="question-header">
        <div className="question-header-left">
          <button className="back-button" onClick={onClose} style={{ borderColor: scoreColor, color: scoreColor }}>
            ← Back to Dashboard
          </button>
          <div className="question-header-content">
            <h2 style={{ marginBottom: '8px' }}>Laboratory Steward</h2>
            <p className="dimension-description">
              Focuses on whether methods are practical and affordable in routine laboratories
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
          {bluePracticalityModules.flatMap(module => module.questions).map((question) => {
            return (
              <div key={question.id} className="question-item" style={{ borderLeftColor: scoreColor }}>
                <label className="question-label">{question.question}</label>

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
                              <span className="input-unit">{field.unit}</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                </div>
            )
          })}
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

export default React.memo(QuestionPageBlue)
