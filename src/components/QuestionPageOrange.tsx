import React, { useState, useEffect } from 'react'
import { orangeCircularModules } from '../data/orangeCircularQuestions'
import { useDimension } from '../context/DimensionContext'
import { getScoreColor } from '../utils/colorUtils'
import './QuestionPage.css'

interface QuestionPageOrangeProps {
  onClose: () => void
}

const QuestionPageOrange: React.FC<QuestionPageOrangeProps> = ({ onClose }) => {
  const { setScore, saveAnswers, getAnswers, setQuestionWeights, getQuestionWeights } = useDimension()
  const [answers, setAnswers] = useState<Record<string, string>>(() => getAnswers('orange-circular'))
  
  // 初始化权重 - 如果没有保存的权重，平均分配
  const allQuestions = orangeCircularModules.flatMap(m => m.questions)
  const [weights, setWeights] = useState<{ [key: string]: number }>(() => {
    const savedWeights = getQuestionWeights('orange-circular')
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
  
  const totalWeight = parseFloat(Object.values(weights).reduce((sum, w) => sum + w, 0).toFixed(1))
  const scoreColor = getScoreColor(totalWeightedScore, 100)

  const calculateQuestionScore = (questionId: string, value: string): number => {
    if (!value) return 0

    const module = orangeCircularModules.find(m => m.questions.some(q => q.id === questionId))
    const question = module?.questions.find(q => q.id === questionId)
    if (!question) return 0

    if (question.type === 'select') {
      const selectedOption = question.options?.find(opt => opt.value === value)
      return selectedOption?.score || 0
    } else if (question.type === 'multi-input') {
      try {
        const data = JSON.parse(value)
        
        // Q3: Circular Loop Index (CLI)
        // Formula: Score = 65 × tanh(1.0 · R · ln(N + 10)) + 25
        if (questionId === 'q3') {
          const R = parseFloat(data.R)
          const N = parseFloat(data.N)
          if (isNaN(R) || isNaN(N)) return 0
          
          const score = 65 * Math.tanh(1.0 * R * Math.log(N + 10)) + 25
          return Math.max(0, Math.min(100, score))
        }
        
        // Q4: Biomass Substitution Intensity (BSI)
        // Formula: Score = (25 + 60 · √Fb) · e^(-0.005(Tr-1))
        if (questionId === 'q4') {
          const Fb = parseFloat(data.Fb)
          const Tr = parseFloat(data.Tr)
          if (isNaN(Fb) || isNaN(Tr)) return 0
          
          const score = (25 + 60 * Math.sqrt(Fb)) * Math.exp(-0.005 * (Tr - 1))
          return Math.max(0, Math.min(100, score))
        }
        
        // Q5: Ecosystem Integration Potential (EIP)
        // Formula: Score = 60 × √(D28/100 · (1 - Hlife/(Hlife + 100))) + 30
        if (questionId === 'q5') {
          const D28 = parseFloat(data.D28)
          const Hlife = parseFloat(data.Hlife)
          if (isNaN(D28) || isNaN(Hlife)) return 0
          
          const score = 60 * Math.sqrt((D28 / 100) * (1 - Hlife / (Hlife + 100))) + 30
          return Math.max(0, Math.min(100, score))
        }
      } catch {
        return 0
      }
    }

    return 0
  }

  // Initialize scores from saved answers on mount
  useEffect(() => {
    const initialScores: { [key: string]: number } = {}
    
    allQuestions.forEach(question => {
      const rawScore = calculateQuestionScore(question.id, answers[question.id] || '')
      initialScores[question.id] = rawScore
    })
    
    setQuestionScores(initialScores)
    
    // 计算加权总分
    const totalWeightedScore = allQuestions.reduce((sum, q) => {
      const rawScore = initialScores[q.id] || 0
      const weight = weights[q.id] || 0
      return sum + (rawScore * weight / 100)
    }, 0)
    
    setScore('orange-circular', totalWeightedScore)
  }, []) // Run only once on mount

  const handleAnswerChange = (questionId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)
    saveAnswers('orange-circular', newAnswers)

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
    
    setScore('orange-circular', totalWeightedScore)
  }

  const handleWeightChange = (questionId: string, newWeight: number) => {
    const newWeights = { ...weights, [questionId]: newWeight }
    setWeights(newWeights)
    setQuestionWeights('orange-circular', newWeights)
    
    // 重新计算加权总分
    const totalWeightedScore = allQuestions.reduce((sum, q) => {
      const score = questionScores[q.id] || 0
      const weight = newWeights[q.id] || 0
      return sum + (score * weight / 100)
    }, 0)
    
    setScore('orange-circular', totalWeightedScore)
  }

  const normalizeWeights = () => {
    const currentTotal = Object.values(weights).reduce((sum, w) => sum + w, 0)
    if (currentTotal === 0) {
      const avgWeight = 100 / allQuestions.length
      const newWeights: { [key: string]: number } = {}
      allQuestions.forEach(q => {
        newWeights[q.id] = avgWeight
      })
      setWeights(newWeights)
      setQuestionWeights('orange-circular', newWeights)
    } else {
      const factor = 100 / currentTotal
      const newWeights: { [key: string]: number } = {}
      allQuestions.forEach(q => {
        newWeights[q.id] = (weights[q.id] || 0) * factor
      })
      setWeights(newWeights)
      setQuestionWeights('orange-circular', newWeights)
      const totalWeightedScore = allQuestions.reduce((sum, q) => {
        const score = questionScores[q.id] || 0
        const weight = newWeights[q.id] || 0
        return sum + (score * weight / 100)
      }, 0)
      setScore('orange-circular', totalWeightedScore)
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
            <h2 style={{ marginBottom: '8px' }}>Resource Regenerator</h2>
            <p className="dimension-description">
              Focus: Recovery, reuse, and waste destination; Based on bio-based carbon from renewable materials; Low carbon and emissions throughout the life cycle
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
          {orangeCircularModules.flatMap(module => module.questions).map((question) => {
            return (
                <div key={question.id} className="question-item" style={{ borderColor: `${scoreColor}33` }}>
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
                    <>
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
                      
                      {question.referenceTable && (
                        <div className="reference-table" style={{ 
                          marginTop: '16px', 
                          padding: '16px 18px', 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          borderRadius: '8px',
                          fontSize: '13px',
                          lineHeight: '1.8',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}>
                          <strong style={{ 
                            display: 'block', 
                            marginBottom: '12px', 
                            color: '#ffffff',
                            fontSize: '14px',
                            fontWeight: '600',
                            letterSpacing: '0.5px'
                          }}>📊 Reference Table</strong>
                          <div style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            borderRadius: '6px',
                            padding: '14px',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
                            overflowX: 'auto'
                          }}
                            dangerouslySetInnerHTML={{ __html: question.referenceTable }}
                          />
                        </div>
                      )}
                    </>
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

export default QuestionPageOrange
