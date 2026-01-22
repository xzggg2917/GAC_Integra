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
    } else if (question.type === 'input') {
      const numValue = parseFloat(value)
      if (isNaN(numValue)) return 0

      // Q1: Solvent recovery rate - direct percentage to score conversion
      if (questionId === 'q1') {
        return Math.min(numValue / 10, 10) // 0-100% → 0-10 points
      }
      
      // Q5: Bio-based carbon content - direct percentage to score conversion
      if (questionId === 'q5') {
        return Math.min(numValue / 10, 10) // 0-100% → 0-10 points
      }

      // Q8: Energy consumption with scoring rules
      if (questionId === 'q8' && question.scoringRules) {
        for (const rule of question.scoringRules) {
          if (rule.max !== undefined && numValue <= rule.max) {
            return rule.score
          }
          if (rule.min !== undefined && rule.max !== undefined && numValue >= rule.min && numValue <= rule.max) {
            return rule.score
          }
          if (rule.min !== undefined && rule.max === undefined && numValue >= rule.min) {
            return rule.score
          }
        }
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
