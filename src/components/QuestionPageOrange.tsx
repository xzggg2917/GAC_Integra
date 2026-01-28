import React, { useState, useEffect, useRef } from 'react'
import { orangeCircularModules } from '../data/orangeCircularQuestions'
import { useDimension } from '../context/DimensionContext'
import { getQuestionScoreColor } from '../utils/colorUtils'
import './QuestionPage.css'

interface QuestionPageOrangeProps {
  onClose: () => void
}

const QuestionPageOrange: React.FC<QuestionPageOrangeProps> = ({ onClose }) => {
  const { setScore, getAnswers, setQuestionWeights, getQuestionWeights, saveAnswers, getCurrentFilePath, isLoading } = useDimension()
  const hasLoadedFromContext = useRef(false)
  const lastScoreRef = useRef<number>(0)
  const isInitialLoadComplete = useRef(false)
  const cachedFilePathRef = useRef<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  
  const { ipcRenderer } = window.require('electron')
  
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

  useEffect(() => {
    if (isLoading) return
    
    if (!hasLoadedFromContext.current) {
      hasLoadedFromContext.current = true
      cachedFilePathRef.current = getCurrentFilePath()
      
      // 加载保存的权重
      const savedWeights = getQuestionWeights('orange-circular')
      if (Object.keys(savedWeights).length > 0) {
        setWeights(savedWeights)
      }
      
      const savedAnswers = getAnswers('orange-circular')
      if (Object.keys(savedAnswers).length > 0) {
        setAnswers(savedAnswers)
        
        const scores: { [key: string]: number } = {}
        Object.entries(savedAnswers).forEach(([qId, ans]) => {
          // Orange页面的answers是Record<string, string>，直接使用即可
          scores[qId] = calculateQuestionScore(qId, ans)
          console.log(`[QuestionPageOrange] Question ${qId} score:`, scores[qId], 'answer:', ans)
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
          setScore('orange-circular', total)
          isInitialLoadComplete.current = true
        }, 0)
      } else {
        isInitialLoadComplete.current = true
      }
    }
  }, [isLoading])

  useEffect(() => {
    if (!isInitialLoadComplete.current) return
    
    const totalWeightedScore = allQuestions.reduce((sum, q) => {
      const score = questionScores[q.id] || 0
      const weight = weights[q.id] || 0
      return sum + (score * weight / 100)
    }, 0)
    
    if (Math.abs(totalWeightedScore - lastScoreRef.current) > 0.01) {
      lastScoreRef.current = totalWeightedScore
      setScore('orange-circular', totalWeightedScore)
    }
  }, [questionScores, weights])

  useEffect(() => {
    if (!isInitialLoadComplete.current || Object.keys(answers).length === 0) return
    
    const saveToFile = async () => {
      try {
        const storageAnswers: { [key: string]: string } = {}
        Object.entries(answers).forEach(([key, val]) => {
          storageAnswers[key] = Array.isArray(val) ? JSON.stringify(val) : val as string
        })
        
        // 同时更新Context
        saveAnswers('orange-circular', storageAnswers)
        setQuestionWeights('orange-circular', weights)
        
        await ipcRenderer.invoke('save-to-file', {
          dimension: 'orange-circular',
          data: {
            answers: storageAnswers,
            questionWeights: weights,
            questionScores: questionScores,
            score: lastScoreRef.current
          }
        })
      } catch (error) {
        console.error('[QuestionPageOrange] Failed to save:', error)
      }
    }
    
    const timer = setTimeout(saveToFile, 500)
    return () => clearTimeout(timer)
  }, [answers, weights, questionScores])

  const handleAnswerChange = React.useCallback((questionId: string, value: string) => {
    console.log('[QuestionPageOrange] handleAnswerChange:', { questionId, value })
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: value
    }))
    
    const rawScore = calculateQuestionScore(questionId, value)
    console.log('[QuestionPageOrange] Score calculated:', { questionId, rawScore })
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
                            const answer = answers[question.id]
                            if (typeof answer === 'object' && !Array.isArray(answer)) {
                              return answer[field.name] || ''
                            }
                            try {
                              const data = JSON.parse(answer || '{}')
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
                                    const answer = answers[question.id]
                                    let data: any = {}
                                    if (typeof answer === 'string') {
                                      try {
                                        data = JSON.parse(answer || '{}')
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

export default React.memo(QuestionPageOrange)
