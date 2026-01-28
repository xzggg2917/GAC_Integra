import React, { useState, useEffect, useRef } from 'react'
import { grayIndustryModules } from '../data/grayIndustryQuestions'
import { useDimension } from '../context/DimensionContext'
import { getQuestionScoreColor } from '../utils/colorUtils'
import './QuestionPage.css'

interface QuestionPageProps {
  onClose: () => void
}

const QuestionPage: React.FC<QuestionPageProps> = ({ onClose }) => {
  const { setScore, saveAnswers, getAnswers, setQuestionWeights, getQuestionWeights, isLoading } = useDimension()
  const hasLoadedFromContext = useRef(false)
  const lastScoreRef = useRef<number>(0)
  const isInitialLoadComplete = useRef(false)
  const [answers, setAnswers] = useState<{ [key: string]: string }>({})
  
  const { ipcRenderer } = window.require('electron')
  
  // 初始化权重 - 如果没有保存的权重，平均分配
  const allQuestions = grayIndustryModules.flatMap(m => m.questions)
  const [weights, setWeights] = useState<{ [key: string]: number }>(() => {
    const savedWeights = getQuestionWeights('gray-industry')
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

  const calculateQuestionScore = (questionId: string, answer: string): number => {
    const question = grayIndustryModules
      .flatMap(m => m.questions)
      .find(q => q.id === questionId)

    if (!question) return 0

    if (question.type === 'select') {
      const option = question.options?.find(opt => opt.value === answer)
      return option?.score || 0
    }

    if (question.type === 'input' && question.scoringRules) {
      const value = parseFloat(answer)
      if (isNaN(value)) return 0

      for (const rule of question.scoringRules) {
        const minMatch = rule.min === undefined || value >= rule.min
        const maxMatch = rule.max === undefined || value < rule.max
        if (minMatch && maxMatch) {
          return rule.score
        }
      }
    }

    // Handle multi-input questions with specific formulas
    if (question.type === 'multi-input') {
      try {
        const data = JSON.parse(answer || '{}')
        
        // Q3: Resource-Accuracy Efficiency Index
        // Formula: Score = 100 · (1 / (1 + e^(-12(Y-0.4)))) · exp(-20 · A²)
        if (questionId === 'q3') {
          const Y = parseFloat(data.Y)
          const A = parseFloat(data.A)
          if (isNaN(Y) || isNaN(A)) return 0
          
          const sigmoid = 1 / (1 + Math.exp(-12 * (Y - 0.4)))
          const accuracyPenalty = Math.exp(-20 * A * A)
          return 100 * sigmoid * accuracyPenalty
        }
        
        // Q4: Scale-In Technical Stability Index (SITSI)
        // Formula: Score = 100 · (P² / (P² + 65)) · exp(-30 · R^1.5)
        // Note: R is input as decimal (e.g., 0.012 means 1.2%)
        if (questionId === 'q4') {
          const P = parseFloat(data.P)
          const R = parseFloat(data.R)
          if (isNaN(P) || isNaN(R)) return 0
          
          const throughputFactor = (P * P) / (P * P + 65)
          const precisionPenalty = Math.exp(-30 * Math.pow(R, 1.5))
          return 100 * throughputFactor * precisionPenalty
        }
        
        // Q5: Minimization-Sensitivity Gain
        // Formula: Score = 100 · (1 - M_waste/M_total) · (2 / (1 + S²))
        if (questionId === 'q5') {
          const wasteRatio = parseFloat(data.wasteRatio)
          const S = parseFloat(data.S)
          if (isNaN(wasteRatio) || isNaN(S)) return 0
          
          const minimizationFactor = 1 - wasteRatio
          const sensitivityFactor = 2 / (1 + S * S)
          return 100 * minimizationFactor * sensitivityFactor
        }
        
        return 0
      } catch {
        return 0
      }
    }

    return 0
  }

  useEffect(() => {
    if (isLoading) return
    
    if (!hasLoadedFromContext.current) {
      hasLoadedFromContext.current = true
      
      // 加载保存的权重
      const savedWeights = getQuestionWeights('gray-industry')
      if (Object.keys(savedWeights).length > 0) {
        setWeights(savedWeights)
      }
      
      const savedAnswers = getAnswers('gray-industry')
      if (Object.keys(savedAnswers).length > 0) {
        setAnswers(savedAnswers)
        const scores: { [key: string]: number } = {}
        Object.entries(savedAnswers).forEach(([qId, ans]) => {
          // Gray页面的answers是Record<string, string>，直接使用即可
          scores[qId] = calculateQuestionScore(qId, ans)
          console.log(`[QuestionPageGray] Question ${qId} score:`, scores[qId], 'answer:', ans)
        })
        setQuestionScores(scores)
        
        setTimeout(() => {
          const currentWeights = Object.keys(savedWeights).length > 0 ? savedWeights : weights
          const total = allQuestions.reduce((sum, q) => {
            const score = scores[q.id] || 0
            const weight = currentWeights[q.id] || 0
            return sum + (score * weight / 100)
          }, 0)
          lastScoreRef.current = total
          setScore('gray-industry', total)
          isInitialLoadComplete.current = true
        }, 0)
      } else {
        isInitialLoadComplete.current = true
      }
    }
  }, [isLoading])
  
  // 当分数或权重变化时，自动计算总分（只在初始加载完成后）
  useEffect(() => {
    if (!isInitialLoadComplete.current) return
    
    const totalWeightedScore = allQuestions.reduce((sum, q) => {
      const score = questionScores[q.id] || 0
      const weight = weights[q.id] || 0
      return sum + (score * weight / 100)
    }, 0)
    
    if (Math.abs(totalWeightedScore - lastScoreRef.current) > 0.01) {
      lastScoreRef.current = totalWeightedScore
      setScore('gray-industry', totalWeightedScore)
    }
  }, [questionScores, weights])
  
  // 保存useEffect
  useEffect(() => {
    if (!isInitialLoadComplete.current) return
    if (Object.keys(answers).length === 0) return
    
    const saveToFile = async () => {
      try {
        saveAnswers('gray-industry', answers)
        setQuestionWeights('gray-industry', weights)
        
        await ipcRenderer.invoke('save-to-file', {
          dimension: 'gray-industry',
          data: {
            answers: answers,
            questionWeights: weights,
            questionScores: questionScores,
            score: lastScoreRef.current
          }
        })
      } catch (error) {
        console.error('[QuestionPage] Failed to save:', error)
      }
    }
    
    const timer = setTimeout(saveToFile, 500)
    return () => clearTimeout(timer)
  }, [answers, weights, questionScores])

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
    
    const rawScore = calculateQuestionScore(questionId, value)
    setQuestionScores(prev => ({ ...prev, [questionId]: rawScore }))
  }

  const handleWeightChange = (questionId: string, newWeight: number) => {
    setWeights(prev => ({ ...prev, [questionId]: newWeight }))
  }

  const normalizeWeights = () => {
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
  }

  const totalWeightedScore = allQuestions.reduce((sum, q) => {
    const score = questionScores[q.id] || 0
    const weight = weights[q.id] || 0
    return sum + (score * weight / 100)
  }, 0)
  
  const totalWeight = parseFloat(Object.values(weights).reduce((sum, w) => sum + w, 0).toFixed(1))
  const scoreColor = getQuestionScoreColor(totalWeightedScore)

  return (
    <div className="question-page">
      <div className="question-header">
        <div className="question-header-left">
          <button className="back-button" onClick={onClose} style={{ borderColor: scoreColor, color: scoreColor }}>
            ← Back to Dashboard
          </button>
          <div className="question-header-content">
            <h2 style={{ marginBottom: '8px' }}>Efficiency Engineer</h2>
            <p className="dimension-description">
              Focuses on efficiency from laboratory to industrial production scale
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
          {grayIndustryModules.flatMap(module => module.questions).map((question) => {
            return (
              <div key={question.id} className="question-item" style={{ borderLeftColor: scoreColor }}>
                <label className="question-label">{question.question}</label>

                  {question.type === 'input' && (
                    <div className="input-group">
                      <input
                        type="number"
                        value={answers[question.id] || ''}
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
                      value={answers[question.id] || ''}
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

                  {question.type === 'multi-input' && question.multiInputFields && (
                    <div className="multi-input-container">
                      {question.multiInputFields.map((field) => {
                        const currentValue = (() => {
                          try {
                            const data = JSON.parse(answers[question.id] || '{}')
                            return data[field.name] || ''
                          } catch {
                            return ''
                          }
                        })()

                        return (
                          <div key={field.name} className="input-group">
                            <label className="input-label">{field.label}</label>
                            <div className="input-with-unit">
                              <input
                                type="number"
                                value={currentValue}
                                onChange={(e) => {
                                  try {
                                    const data = JSON.parse(answers[question.id] || '{}')
                                    data[field.name] = e.target.value
                                    handleAnswerChange(question.id, JSON.stringify(data))
                                  } catch {
                                    const data = { [field.name]: e.target.value }
                                    handleAnswerChange(question.id, JSON.stringify(data))
                                  }
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
                const rawScoreColor = getQuestionScoreColor(rawScore)
                return (
                  <div key={question.id} className="score-item">
                    <div className="score-item-header">
                      <span className="score-question-label">Q{index + 1}</span>
                      <span className="score-raw" style={{ color: rawScoreColor }}>{rawScore.toFixed(1)}/100</span>
                    </div>
                    <div className="score-item-details">
                      <span className="score-weight">{weight.toFixed(1)}% weight</span>
                      <span className="score-weighted" style={{ color: 'white' }}>
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

export default QuestionPage
