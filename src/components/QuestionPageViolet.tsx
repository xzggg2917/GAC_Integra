import React, { useState, useEffect } from 'react'
import { violetInnovationModules } from '../data/violetInnovationQuestions'
import { useDimension } from '../context/DimensionContext'
import { getScoreColor } from '../utils/colorUtils'
import './QuestionPage.css'

interface QuestionPageVioletProps {
  onClose: () => void
}

const QuestionPageViolet: React.FC<QuestionPageVioletProps> = ({ onClose }) => {
  const { setScore, saveAnswers, getAnswers, setQuestionWeights, getQuestionWeights } = useDimension()
  const [answers, setAnswers] = useState<{ [key: string]: string | string[] }>(() => {
    const savedAnswers = getAnswers('violet-innovation')
    const parsedAnswers: { [key: string]: string | string[] } = {}
    Object.entries(savedAnswers).forEach(([key, val]) => {
      try {
        const parsed = JSON.parse(val)
        parsedAnswers[key] = Array.isArray(parsed) ? parsed : val
      } catch {
        parsedAnswers[key] = val
      }
    })
    return parsedAnswers
  })
  
  // 初始化权重 - 如果没有保存的权重，平均分配
  const allQuestions = violetInnovationModules.flatMap(m => m.questions)
  const [weights, setWeights] = useState<{ [key: string]: number }>(() => {
    const savedWeights = getQuestionWeights('violet-innovation')
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

  const totalWeightedScore = allQuestions.reduce((sum, q) => {
    const score = questionScores[q.id] || 0
    const weight = weights[q.id] || 0
    return sum + (score * weight / 100)
  }, 0)
  
  const totalWeight = parseFloat(Object.values(weights).reduce((sum, w) => sum + w, 0).toFixed(2))
  const scoreColor = getScoreColor(totalWeightedScore, 100)

  const calculateQuestionScore = (questionId: string, answer: string | string[]): number => {
    const question = violetInnovationModules
      .flatMap(m => m.questions)
      .find(q => q.id === questionId)

    if (!question) return 0

    if (question.type === 'select') {
      const option = question.options?.find(opt => opt.value === answer)
      return option?.score || 0
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

    // Multi-input questions: Q3, Q4, Q5
    if (question.type === 'multi-input' && Array.isArray(answer)) {
      const values = answer.map(v => parseFloat(v)).filter(v => !isNaN(v))
      
      // Q3: Methodological Synergy Integration Degree
      // Formula: Score = 100 × [1 - exp(-0.1 × V_t² × √(J_p + 1))]
      if (questionId === 'q3' && values.length === 2) {
        const vt = values[0] // V_t: Number of specialized modules
        const jp = values[1] // J_p: Number of coupling points
        const score = 100 * (1 - Math.exp(-0.1 * Math.pow(vt, 2) * Math.sqrt(jp + 1)))
        return Math.max(0, Math.min(100, score))
      }

      // Q4: Structural Advancement and Nonlinear Logic Index
      // Formula: Score = 100 × (L_s × D_sa)² / ((L_s × D_sa)² + 1.5)
      if (questionId === 'q4' && values.length === 2) {
        const ls = values[0]  // L_s: Nonlinear logical steps count
        const dsa = values[1] // D_sa: Customization degree coefficient (0-1)
        const product = ls * dsa
        const score = 100 * Math.pow(product, 2) / (Math.pow(product, 2) + 1.5)
        return Math.max(0, Math.min(100, score))
      }

      // Q5: Theoretical Extension and Knowledge Acquisition Efficiency
      // Formula: Score = 100 × sin(π/2 × (N_r × M_a)/(N_r × M_a + 5))
      if (questionId === 'q5' && values.length === 2) {
        const nr = values[0] // N_r: Interdisciplinary reference resource count
        const ma = values[1] // M_a: Methodological universality transfer capability
        const product = nr * ma
        const score = 100 * Math.sin(Math.PI / 2 * product / (product + 5))
        return Math.max(0, Math.min(100, score))
      }
    }

    return 0
  }

  // Initialize scores from saved answers on mount
  useEffect(() => {
    const initialScores: { [key: string]: number } = {}
    
    allQuestions.forEach(question => {
      const rawScore = calculateQuestionScore(question.id, answers[question.id] || (question.type === 'checkbox' ? [] : ''))
      initialScores[question.id] = rawScore
    })
    
    setQuestionScores(initialScores)
    
    // 计算加权总分
    const totalWeightedScore = allQuestions.reduce((sum, q) => {
      const rawScore = initialScores[q.id] || 0
      const weight = weights[q.id] || 0
      return sum + (rawScore * weight / 100)
    }, 0)
    
    setScore('violet-innovation', totalWeightedScore)
  }, []) // Run only once on mount

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)
    const storageAnswers: { [key: string]: string } = {}
    Object.entries(newAnswers).forEach(([key, val]) => {
      storageAnswers[key] = Array.isArray(val) ? JSON.stringify(val) : val as string
    })
    saveAnswers('violet-innovation', storageAnswers)

    // 计算新的分数
    const rawScore = calculateQuestionScore(questionId, value)
    const newQuestionScores = { ...questionScores, [questionId]: rawScore }
    setQuestionScores(newQuestionScores)

    // 计算加权总分
    const totalWeightedScore = allQuestions.reduce((sum, q) => {
      const score = newQuestionScores[q.id] || 0
      const weight = weights[q.id] || 0
      return sum + (score * weight / 100)
    }, 0)
    
    setScore('violet-innovation', totalWeightedScore)
  }

  const handleWeightChange = (questionId: string, newWeight: number) => {
    const newWeights = { ...weights, [questionId]: newWeight }
    setWeights(newWeights)
    setQuestionWeights('violet-innovation', newWeights)
    
    // 重新计算加权总分
    const totalWeightedScore = allQuestions.reduce((sum, q) => {
      const score = questionScores[q.id] || 0
      const weight = newWeights[q.id] || 0
      return sum + (score * weight / 100)
    }, 0)
    
    setScore('violet-innovation', totalWeightedScore)
  }

  const normalizeWeights = () => {
    const currentTotal = Object.values(weights).reduce((sum, w) => sum + w, 0)
    if (currentTotal === 0) {
      const avgWeight = 100 / allQuestions.length
      const newWeights: { [key: string]: number } = {}
      allQuestions.forEach(q => {
        newWeights[q.id] = parseFloat(avgWeight.toFixed(2))
      })
      setWeights(newWeights)
      setQuestionWeights('violet-innovation', newWeights)
    } else {
      const factor = 100 / currentTotal
      const newWeights: { [key: string]: number } = {}
      allQuestions.forEach(q => {
        newWeights[q.id] = parseFloat(((weights[q.id] || 0) * factor).toFixed(2))
      })
      setWeights(newWeights)
      setQuestionWeights('violet-innovation', newWeights)
      const totalWeightedScore = allQuestions.reduce((sum, q) => {
        const score = questionScores[q.id] || 0
        const weight = newWeights[q.id] || 0
        return sum + (score * weight / 100)
      }, 0)
      setScore('violet-innovation', totalWeightedScore)
    }
  }

  return (
    <div className="question-page">
      <div className="question-header">
        <div className="question-header-left">
          <button className="back-button" onClick={onClose} style={{ borderColor: scoreColor, color: scoreColor }}>
            ← Back to Dashboard
          </button>
          <div className="question-header-content">
            <h2 style={{ marginBottom: '8px' }}>Creative Designer</h2>
            <p className="dimension-description">
              Focuses on whether methods introduce new insights or technological breakthroughs
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
          {violetInnovationModules.flatMap(module => module.questions).map((question) => {
            return (
                <div key={question.id} className="question-item" style={{ borderColor: `${scoreColor}33` }}>
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
                          {option.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {question.type === 'multi-input' && question.multiInputFields && (
                    <div className="multi-input-container">
                      {question.multiInputFields.map((field, fieldIndex) => {
                        const currentAnswers = Array.isArray(answers[question.id]) ? answers[question.id] as string[] : []
                        return (
                          <div key={fieldIndex} className="input-group">
                            <label className="multi-input-label">{field.label}</label>
                            <div className="input-with-unit">
                              <input
                                type="number"
                                value={currentAnswers[fieldIndex] || ''}
                                onChange={(e) => {
                                  const newAnswers = [...currentAnswers]
                                  newAnswers[fieldIndex] = e.target.value
                                  handleAnswerChange(question.id, newAnswers)
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

export default QuestionPageViolet
