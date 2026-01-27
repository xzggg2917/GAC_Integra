import React, { useState, useEffect, useRef } from 'react'
import { greenEcologyModules } from '../data/greenEcologyQuestions'
import { useDimension } from '../context/DimensionContext'
import { getScoreColor } from '../utils/colorUtils'
import MultiReagentInput from './MultiReagentInput'
import './QuestionPage.css'

interface QuestionPageGreenProps {
  onClose: () => void
}

const QuestionPageGreen: React.FC<QuestionPageGreenProps> = ({ onClose }) => {
  const { setScore, getAnswers, setQuestionWeights, getQuestionWeights, saveAnswers, getCurrentFilePath, isLoading } = useDimension()
  const hasLoadedFromContext = useRef(false)
  const lastScoreRef = useRef<number>(0)
  const isInitialLoadComplete = useRef(false)
  const cachedFilePathRef = useRef<string | null>(null)
  const [answers, setAnswers] = useState<{ [key: string]: string | string[] }>({})
  
  const { ipcRenderer } = window.require('electron')
  
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

    // Q1, Q2: 选择题
    if (question.type === 'select') {
      const option = question.options?.find(opt => opt.value === answer)
      return option?.score || 0
    }

    // Q3: 多试剂输入 (Essential Hazard Index)
    if (question.type === 'multi-reagent' && typeof answer === 'string') {
      try {
        const reagents = JSON.parse(answer || '[]')
        if (!Array.isArray(reagents) || reagents.length === 0) return 0
        
        let sum = 0
        for (const reagent of reagents) {
          const m = parseFloat(reagent.mass || '0')
          const nh = parseFloat(reagent.hcodes || '0')
          if (!isNaN(m) && !isNaN(nh) && m >= 0 && nh >= 0) {
            sum += m * Math.pow(nh, 2)
          }
        }
        
        return 100 * Math.exp(-1.5 * Math.sqrt(sum))
      } catch {
        return 0
      }
    }

    // Q4, Q5, Q6: 多输入字段
    if (question.type === 'multi-input' && typeof answer === 'string') {
      try {
        const data = JSON.parse(answer || '{}')
        
        // Q4: Atmospheric Safety Index (ASI)
        if (questionId === 'q4') {
          const tbp = parseFloat(data.tbp || '0')
          const nhalogen = parseInt(data.nhalogen || '0')
          const nh = parseInt(data.nh || '0')
          
          if (data.tbp === '' || data.tbp === undefined) return 0
          if (!isNaN(tbp) && !isNaN(nhalogen) && !isNaN(nh)) {
            const sigmoid = 1 / (1 + Math.exp(-0.05 * (tbp - 50)))
            const exponential = Math.exp(-(2 * nhalogen + 0.5 * nh) / 5)
            return 100 * sigmoid * exponential
          }
        }
        
        // Q5: Operational Energy Load (OEL)
        if (questionId === 'q5') {
          const power = parseFloat(data.power || '0')
          const time = parseFloat(data.time || '0')
          const throughput = parseInt(data.throughput || '1')
          
          if (data.power === '' || data.power === undefined) return 0
          if (!isNaN(power) && !isNaN(time) && !isNaN(throughput) && throughput > 0) {
            return 100 * Math.exp(-(power * time) / (10000 * throughput))
          }
        }
        
        // Q6: Waste Burden Intensity (WBI)
        if (questionId === 'q6') {
          const vwaste = parseFloat(data.vwaste || '0')
          const eta = parseFloat(data.eta || '0')
          
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

    return 0
  }

  useEffect(() => {
    // 等待Context加载完成
    if (isLoading) return
    
    if (!hasLoadedFromContext.current) {
      hasLoadedFromContext.current = true
      cachedFilePathRef.current = getCurrentFilePath()
      
      console.log('[QuestionPageGreen] Loading data from Context...')
      
      // 加载保存的权重
      const savedWeights = getQuestionWeights('green-ecology')
      if (Object.keys(savedWeights).length > 0) {
        setWeights(savedWeights)
      }
      
      const savedAnswers = getAnswers('green-ecology')
      console.log('[QuestionPageGreen] Loaded answers:', savedAnswers)
      
      // 加载答案
      if (Object.keys(savedAnswers).length > 0) {
        const parsedAnswers: { [key: string]: string | string[] } = {}
        Object.entries(savedAnswers).forEach(([key, val]) => {
          try {
            // 尝试解析JSON
            const parsed = JSON.parse(val)
            parsedAnswers[key] = parsed
          } catch {
            // 如果不是JSON，直接使用原值
            parsedAnswers[key] = val
          }
        })
        
        console.log('[QuestionPageGreen] Parsed answers count:', Object.keys(parsedAnswers).length)
        console.log('[QuestionPageGreen] Parsed answers:', parsedAnswers)
        
        // 设置答案到state
        setAnswers(parsedAnswers)
        
        // 计算初始分数
        const scores: { [key: string]: number } = {}
        Object.entries(parsedAnswers).forEach(([qId, ans]) => {
          // 如果答案是对象或数组，需要转回JSON字符串给calculateQuestionScore
          const answerForCalculation = (typeof ans === 'object') ? JSON.stringify(ans) : ans
          const score = calculateQuestionScore(qId, answerForCalculation)
          scores[qId] = score
          console.log(`[QuestionPageGreen] Question ${qId} score:`, score, 'answer:', ans)
        })
        setQuestionScores(scores)
        
        // 延迟计算总分和完成标记
        setTimeout(() => {
          const currentWeights = Object.keys(savedWeights).length > 0 ? savedWeights : weights
          const total = allQuestions.reduce((sum, q) => {
            const score = scores[q.id] || 0
            const weight = currentWeights[q.id] || 0
            return sum + (score * weight / 100)
          }, 0)
          lastScoreRef.current = total
          setScore('green-ecology', total)
          
          // 确保在所有state更新后才标记完成
          isInitialLoadComplete.current = true
          console.log('[QuestionPageGreen] Initial load complete, total score:', total)
          console.log('[QuestionPageGreen] Final answers count after load:', Object.keys(parsedAnswers).length)
        }, 100) // 增加延迟确保所有state更新完成
      } else {
        isInitialLoadComplete.current = true
        console.log('[QuestionPageGreen] No saved data found')
      }
    }
  }, [isLoading])

  // 分数变化时自动计算总分
  useEffect(() => {
    if (!isInitialLoadComplete.current) {
      return
    }
    
    const totalWeightedScore = allQuestions.reduce((sum, q) => {
      const score = questionScores[q.id] || 0
      const weight = weights[q.id] || 0
      return sum + (score * weight / 100)
    }, 0)
    
    if (Math.abs(totalWeightedScore - lastScoreRef.current) > 0.01) {
      lastScoreRef.current = totalWeightedScore
      setScore('green-ecology', totalWeightedScore)
    }
  }, [questionScores, weights])

  // 答案保存useEffect
  useEffect(() => {
    console.log('[QuestionPageGreen] Save useEffect triggered')
    console.log('[QuestionPageGreen] isInitialLoadComplete:', isInitialLoadComplete.current)
    console.log('[QuestionPageGreen] answers:', answers)
    const answersCount = Object.keys(answers).length
    console.log('[QuestionPageGreen] answers count:', answersCount)
    
    if (!isInitialLoadComplete.current) {
      console.log('[QuestionPageGreen] Skipping save - initial load not complete')
      return
    }
    
    // 移除答案数量检查 - 允许保存空答案以清除数据
    // if (answersCount === 0) {
    //   console.log('[QuestionPageGreen] Skipping save - no answers')
    //   return
    // }
    
    const saveToFile = async () => {
      try {
        console.log('[QuestionPageGreen] Preparing to save...')
        const storageAnswers: { [key: string]: string } = {}
        Object.entries(answers).forEach(([key, val]) => {
          storageAnswers[key] = Array.isArray(val) ? JSON.stringify(val) : val as string
        })
        
        // 同时更新Context的allAnswers和questionWeights
        saveAnswers('green-ecology', storageAnswers)
        setQuestionWeights('green-ecology', weights)
        
        console.log('[QuestionPageGreen] Saving data:', {
          dimension: 'green-ecology',
          answersCount: Object.keys(storageAnswers).length,
          weightsCount: Object.keys(weights).length,
          scoresCount: Object.keys(questionScores).length,
          totalScore: lastScoreRef.current
        })
        
        const result = await ipcRenderer.invoke('save-to-file', {
          dimension: 'green-ecology',
          data: {
            answers: storageAnswers,
            questionWeights: weights,
            questionScores: questionScores,
            score: lastScoreRef.current
          }
        })
        
        console.log('[QuestionPageGreen] Save result:', result)
      } catch (error) {
        console.error('[QuestionPageGreen] Failed to save:', error)
      }
    }
    
    const timer = setTimeout(saveToFile, 500)
    return () => clearTimeout(timer)
  }, [answers, weights, questionScores])

  const handleAnswerChange = React.useCallback((questionId: string, value: string | string[]) => {
    console.log('[QuestionPageGreen] handleAnswerChange:', { questionId, value })
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: value
    }))
    
    const rawScore = calculateQuestionScore(questionId, value)
    console.log('[QuestionPageGreen] Score calculated:', { questionId, rawScore })
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

  const handleReagentChange = React.useCallback((value: string) => {
    handleAnswerChange('q3', value)
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
          {greenEcologyModules.flatMap(module => module.questions).map((question) => {
            return (
              <div key={question.id} className="question-item" style={{ borderLeftColor: scoreColor }}>
                <label className="question-label">{question.question}</label>

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

                  {question.type === 'multi-reagent' && (
                    <MultiReagentInput
                      value={
                        typeof answers[question.id] === 'string'
                          ? answers[question.id] as string
                          : JSON.stringify(answers[question.id] || [])
                      }
                      onChange={handleReagentChange}
                    />
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
                                      data = { ...(answer as any) }
                                    } else if (typeof answer === 'string') {
                                      // 如果是字符串，尝试解析
                                      data = JSON.parse(answer || '{}')
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
                                step={field.step || 'any'}
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

export default React.memo(QuestionPageGreen)
