import React, { useState, useEffect } from 'react'
import { greenEcologyModules } from '../data/greenEcologyQuestions'
import { useDimension } from '../context/DimensionContext'
import { getScoreColor } from '../utils/colorUtils'
import MultiSelectDropdown from './MultiSelectDropdown'
import MultiReagentInput from './MultiReagentInput'
import './QuestionPage.css'

interface QuestionPageGreenProps {
  onClose: () => void
}

const QuestionPageGreen: React.FC<QuestionPageGreenProps> = ({ onClose }) => {
  const { setScore, saveAnswers, getAnswers, setQuestionWeights, getQuestionWeights } = useDimension()
  const [answers, setAnswers] = useState<{ [key: string]: string | string[] }>(() => {
    const savedAnswers = getAnswers('green-ecology')
    // Parse JSON strings back to arrays for checkbox questions
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
  const allQuestions = greenEcologyModules.flatMap(m => m.questions)
  const [weights, setWeights] = useState<{ [key: string]: number }>(() => {
    const savedWeights = getQuestionWeights('green-ecology')
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
    const question = greenEcologyModules
      .flatMap(m => m.questions)
      .find(q => q.id === questionId)

    if (!question) return 0

    // Handle multi-reagent input (Q3)
    if (question.type === 'multi-reagent' && typeof answer === 'string') {
      try {
        const reagents = JSON.parse(answer || '[]')
        if (!Array.isArray(reagents) || reagents.length === 0) return 0
        
        let sum = 0
        let hasValidInput = false
        for (const reagent of reagents) {
          const mass = parseFloat(reagent.mass || '0')
          const hcodes = parseFloat(reagent.hcodes || '0')
          if (!isNaN(mass) && !isNaN(hcodes) && mass >= 0 && hcodes >= 0) {
            if (mass > 0 || hcodes > 0) hasValidInput = true
            sum += mass * Math.pow(hcodes, 2)
          }
        }
        // 只有当有有效输入时才计算分数
        if (!hasValidInput) return 0
        return 100 * Math.exp(-1.5 * Math.sqrt(sum))
      } catch {
        return 0
      }
    }

    // Handle multi-input questions
    if (question.type === 'multi-input' && typeof answer === 'string') {
      try {
        const data = JSON.parse(answer || '{}')
        
        // Q4: ASI calculation
        if (question.id === 'q4') {
          const tbp = parseFloat(data.tbp || '0')
          const nhalogen = parseFloat(data.nhalogen || '0')
          const nh = parseFloat(data.nh || '0')
          if (!isNaN(tbp) && !isNaN(nhalogen) && !isNaN(nh)) {
            const sigmoid = 1 / (1 + Math.exp(-0.05 * (tbp - 50)))
            const penalty = Math.exp(-(2 * nhalogen + 0.5 * nh) / 5)
            return 100 * sigmoid * penalty
          }
        }
        
        // Q5: OEL calculation
        if (question.id === 'q5') {
          const power = parseFloat(data.power || '0')
          const time = parseFloat(data.time || '0')
          const throughput = parseFloat(data.throughput || '1')
          if (!isNaN(power) && !isNaN(time) && !isNaN(throughput) && throughput > 0) {
            return 100 * Math.exp(-(power * time) / (10000 * throughput))
          }
        }
        
        // Q6: WBI calculation
        if (question.id === 'q6') {
          const vwaste = parseFloat(data.vwaste || '0')
          const eta = parseFloat(data.eta || '0')
          // 只有当用户实际输入了数据时才计算分数
          if (data.vwaste === '' || data.vwaste === undefined) return 0
          if (!isNaN(vwaste) && !isNaN(eta) && vwaste >= 0 && eta >= 0 && eta <= 1) {
            const term1 = 1 / (1 + 0.05 * Math.pow(vwaste * (1 - eta), 1.2))
            const term2 = Math.exp(-vwaste / 200)
            return 100 * term1 * term2
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
    
    setScore('green-ecology', totalWeightedScore)
  }, []) // Run only once on mount

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)
    // Convert array values to JSON string for storage
    const storageAnswers: { [key: string]: string } = {}
    Object.entries(newAnswers).forEach(([key, val]) => {
      storageAnswers[key] = Array.isArray(val) ? JSON.stringify(val) : val as string
    })
    saveAnswers('green-ecology', storageAnswers)

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
    
    setScore('green-ecology', totalWeightedScore)
  }

  const handleWeightChange = (questionId: string, newWeight: number) => {
    const newWeights = { ...weights, [questionId]: newWeight }
    setWeights(newWeights)
    setQuestionWeights('green-ecology', newWeights)
    
    // 重新计算加权总分
    const totalWeightedScore = allQuestions.reduce((sum, q) => {
      const score = questionScores[q.id] || 0
      const weight = newWeights[q.id] || 0
      return sum + (score * weight / 100)
    }, 0)
    
    setScore('green-ecology', totalWeightedScore)
  }

  const normalizeWeights = () => {
    const currentTotal = Object.values(weights).reduce((sum, w) => sum + w, 0)
    if (currentTotal === 0) {
      // 如果全是0，平均分配
      const avgWeight = parseFloat((100 / allQuestions.length).toFixed(2))
      const newWeights: { [key: string]: number } = {}
      allQuestions.forEach(q => {
        newWeights[q.id] = avgWeight
      })
      setWeights(newWeights)
      setQuestionWeights('green-ecology', newWeights)
    } else {
      // 按比例归一化到精确的100%
      const factor = 100 / currentTotal
      const newWeights: { [key: string]: number } = {}
      allQuestions.forEach(q => {
        newWeights[q.id] = parseFloat(((weights[q.id] || 0) * factor).toFixed(2))
      })
      setWeights(newWeights)
      setQuestionWeights('green-ecology', newWeights)
      
      // 重新计算加权总分
      const totalWeightedScore = allQuestions.reduce((sum, q) => {
        const score = questionScores[q.id] || 0
        const weight = newWeights[q.id] || 0
        return sum + (score * weight / 100)
      }, 0)
      setScore('green-ecology', totalWeightedScore)
    }
  }

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
            <h2 style={{ marginBottom: '8px' }}>Environmental Guardian</h2>
            <p className="dimension-description">
              Focuses on the direct environmental impact of analytical methods
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
          {allQuestions.map((question) => {
            return (
              <div key={question.id} className="question-item" style={{ borderLeftColor: scoreColor }}>
                <label className="question-label">{question.question}</label>

                {question.type === 'multi-reagent' && (
                  <MultiReagentInput
                    value={answers[question.id] as string || '[]'}
                    onChange={(value) => handleAnswerChange(question.id, value)}
                  />
                )}

                {question.type === 'multi-input' && question.multiInputFields && (
                  <div className="multi-input-container">
                    {question.multiInputFields.map((field) => {
                      const currentValue = (() => {
                        try {
                          const data = JSON.parse(answers[question.id] as string || '{}')
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
                                  const data = JSON.parse(answers[question.id] as string || '{}')
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

export default QuestionPageGreen
