import React, { useState, useEffect, useRef } from 'react'
import { violetInnovationModules } from '../data/violetInnovationQuestions'
import { useDimension } from '../context/DimensionContext'
import { getQuestionScoreColor } from '../utils/colorUtils'
import './QuestionPage.css'

interface QuestionPageVioletProps {
  onClose: () => void
}

const QuestionPageViolet: React.FC<QuestionPageVioletProps> = ({ onClose }) => {
  const { setScore, getAnswers, setQuestionWeights, getQuestionWeights, saveAnswers, getCurrentFilePath, isLoading } = useDimension()
  const hasLoadedFromContext = useRef(false)
  const lastScoreRef = useRef<number>(0)
  const isInitialLoadComplete = useRef(false)
  const cachedFilePathRef = useRef<string | null>(null)
  const [answers, setAnswers] = useState<{ [key: string]: any }>({})
  
  const { ipcRenderer } = window.require('electron')
  
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
  const scoreColor = getQuestionScoreColor(totalWeightedScore)

  const calculateQuestionScore = (questionId: string, answer: any): number => {
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
    if (question.type === 'multi-input') {
      try {
        let data: any = {}
        
        // 处理不同类型的answer
        if (typeof answer === 'string') {
          data = JSON.parse(answer)
        } else if (typeof answer === 'object' && !Array.isArray(answer)) {
          data = answer
        } else {
          return 0
        }
        
        const fields = question.multiInputFields || []
        const values = fields.map(f => parseFloat(data[f.name] || '0')).filter(v => !isNaN(v))
        
        console.log(`[QuestionPageViolet] Calculating score for ${questionId}:`, { data, values })
        
        // Q3: Methodological Synergy Integration Degree
        // Formula: Score = 100 × [1 - exp(-0.1 × V_t² × √(J_p + 1))]
        if (questionId === 'q3' && values.length === 2) {
          const vt = values[0] // V_t: Number of specialized modules
          const jp = values[1] // J_p: Number of coupling points
          const score = 100 * (1 - Math.exp(-0.1 * Math.pow(vt, 2) * Math.sqrt(jp + 1)))
          console.log(`[QuestionPageViolet] Q3 score calculated:`, score)
          return Math.max(0, Math.min(100, score))
        }

        // Q4: Structural Advancement and Nonlinear Logic Index
        // Formula: Score = 100 × (L_s × D_sa)² / ((L_s × D_sa)² + 1.5)
        if (questionId === 'q4' && values.length === 2) {
          const ls = values[0]  // L_s: Nonlinear logical steps count
          const dsa = values[1] // D_sa: Customization degree coefficient (0-1)
          const product = ls * dsa
          const score = 100 * Math.pow(product, 2) / (Math.pow(product, 2) + 1.5)
          console.log(`[QuestionPageViolet] Q4 score calculated:`, score)
          return Math.max(0, Math.min(100, score))
        }

        // Q5: Theoretical Extension and Knowledge Acquisition Efficiency
        // Formula: Score = 100 × sin(π/2 × (N_r × M_a)/(N_r × M_a + 5))
        if (questionId === 'q5' && values.length === 2) {
          const nr = values[0] // N_r: Interdisciplinary reference resource count
          const ma = values[1] // M_a: Methodological universality transfer capability
          const product = nr * ma
          const score = 100 * Math.sin(Math.PI / 2 * product / (product + 5))
          console.log(`[QuestionPageViolet] Q5 score calculated:`, score)
          return Math.max(0, Math.min(100, score))
        }
      } catch (err) {
        console.error(`[QuestionPageViolet] Error calculating score for ${questionId}:`, err)
        return 0
      }
    }

    return 0
  }

  useEffect(() => {
    console.log('[QuestionPageViolet] Initial load useEffect triggered')
    
    if (isLoading) return
    
    if (!hasLoadedFromContext.current) {
      hasLoadedFromContext.current = true
      cachedFilePathRef.current = getCurrentFilePath()
      console.log('[QuestionPageViolet] Loading data from context...')
      
      // 加载保存的权重
      const savedWeights = getQuestionWeights('violet-innovation')
      if (Object.keys(savedWeights).length > 0) {
        setWeights(savedWeights)
      }
      
      const savedAnswers = getAnswers('violet-innovation')
      console.log('[QuestionPageViolet] Saved answers from context:', savedAnswers)
      
      if (Object.keys(savedAnswers).length > 0) {
        const parsedAnswers: { [key: string]: any } = {}
        Object.entries(savedAnswers).forEach(([key, val]) => {
          console.log(`[QuestionPageViolet] Processing answer ${key}:`, val, 'type:', typeof val)
          try {
            // 尝试解析JSON字符串
            const parsed = JSON.parse(val)
            parsedAnswers[key] = parsed
            console.log(`[QuestionPageViolet] Parsed ${key} as JSON:`, parsed)
          } catch {
            // 如果解析失败，直接使用原值（select类型的简单字符串）
            parsedAnswers[key] = val
            console.log(`[QuestionPageViolet] Using raw value for ${key}:`, val)
          }
        })
        
        console.log('[QuestionPageViolet] Final parsed answers:', parsedAnswers)
        setAnswers(parsedAnswers)
        
        const scores: { [key: string]: number } = {}
        Object.entries(parsedAnswers).forEach(([qId, ans]) => {
          // 如果答案是对象或数组，需要转回JSON字符串给calculateQuestionScore
          const answerForCalculation = (typeof ans === 'object') ? JSON.stringify(ans) : (ans as string)
          scores[qId] = calculateQuestionScore(qId, answerForCalculation)
          console.log(`[QuestionPageViolet] Question ${qId} score:`, scores[qId], 'answer:', ans)
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
          setScore('violet-innovation', total)
          isInitialLoadComplete.current = true
          console.log('[QuestionPageViolet] Initial load complete')
        }, 0)
      } else {
        isInitialLoadComplete.current = true
      }
    }
  }, [isLoading])

  // 分数变化时自动计算总分
  useEffect(() => {
    if (!isInitialLoadComplete.current) return
    
    const totalWeightedScore = allQuestions.reduce((sum, q) => {
      const score = questionScores[q.id] || 0
      const weight = weights[q.id] || 0
      return sum + (score * weight / 100)
    }, 0)
    
    if (Math.abs(totalWeightedScore - lastScoreRef.current) > 0.01) {
      lastScoreRef.current = totalWeightedScore
      setScore('violet-innovation', totalWeightedScore)
    }
  }, [questionScores, weights])

  // 答案保存useEffect
  useEffect(() => {
    if (!isInitialLoadComplete.current) {
      console.log('[QuestionPageViolet] Save skipped - initial load not complete')
      return
    }
    
    if (Object.keys(answers).length === 0) {
      console.log('[QuestionPageViolet] Save skipped - no answers')
      return
    }
    
    const saveToFile = async () => {
      try {
        console.log('[QuestionPageViolet] Saving answers:', answers)
        
        // 序列化答案：如果是对象，转换为JSON字符串
        const serializedAnswers: { [key: string]: string } = {}
        Object.entries(answers).forEach(([key, val]) => {
          if (typeof val === 'string') {
            serializedAnswers[key] = val
          } else {
            serializedAnswers[key] = JSON.stringify(val)
          }
        })
        
        console.log('[QuestionPageViolet] Serialized answers:', serializedAnswers)
        
        // 同时更新Context
        saveAnswers('violet-innovation', serializedAnswers)
        setQuestionWeights('violet-innovation', weights)
        
        await ipcRenderer.invoke('save-to-file', {
          dimension: 'violet-innovation',
          data: {
            answers: serializedAnswers,
            questionWeights: weights,
            questionScores: questionScores,
            score: lastScoreRef.current
          }
        })
        
        console.log('[QuestionPageViolet] Save completed successfully')
      } catch (error) {
        console.error('[QuestionPageViolet] Failed to save:', error)
      }
    }
    
    const timer = setTimeout(saveToFile, 500)
    return () => clearTimeout(timer)
  }, [answers, weights, questionScores])

  const handleAnswerChange = React.useCallback((questionId: string, value: any) => {
    console.log('[QuestionPageViolet] handleAnswerChange called:', { questionId, value, valueType: typeof value })
    
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: value
    }))
    
    const rawScore = calculateQuestionScore(questionId, value)
    console.log('[QuestionPageViolet] Score calculated:', { questionId, rawScore })
    
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
                      {question.multiInputFields.map((field) => {
                        const currentValue = (() => {
                          const answer = answers[question.id]
                          if (!answer) return ''
                          
                          try {
                            // 如果answer已经是对象，直接使用
                            if (typeof answer === 'object' && !Array.isArray(answer)) {
                              return answer[field.name] || ''
                            }
                            // 如果是字符串，尝试解析
                            if (typeof answer === 'string') {
                              const data = JSON.parse(answer)
                              return data[field.name] || ''
                            }
                            return ''
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
                                  
                                  try {
                                    // 如果answer已经是对象，直接使用
                                    if (typeof answer === 'object' && !Array.isArray(answer)) {
                                      data = { ...answer }
                                    } else if (typeof answer === 'string') {
                                      // 如果是字符串，尝试解析
                                      data = JSON.parse(answer)
                                    }
                                  } catch {
                                    data = {}
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

export default React.memo(QuestionPageViolet)
