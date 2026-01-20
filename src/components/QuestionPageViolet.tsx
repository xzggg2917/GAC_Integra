import React, { useState, useEffect } from 'react'
import { violetInnovationModules } from '../data/violetInnovationQuestions'
import { useDimension } from '../context/DimensionContext'
import { getScoreColor } from '../utils/colorUtils'
import './QuestionPage.css'

interface QuestionPageVioletProps {
  onClose: () => void
}

const QuestionPageViolet: React.FC<QuestionPageVioletProps> = ({ onClose }) => {
  const { setScore, saveAnswers, getAnswers } = useDimension()
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
  const [moduleScores, setModuleScores] = useState<{ [key: string]: number }>({})

  const maxTotalScore = violetInnovationModules.reduce((sum, module) => sum + module.questions.length * 10, 0)
  const totalScore = Object.values(moduleScores).reduce((sum, score) => sum + score, 0)
  const scoreColor = getScoreColor(totalScore, maxTotalScore)

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

    return 0
  }

  // Initialize scores from saved answers on mount
  useEffect(() => {
    const initialModuleScores: { [key: string]: number } = {}
    
    violetInnovationModules.forEach(module => {
      const moduleQuestionScores = module.questions.map(q => 
        calculateQuestionScore(q.id, answers[q.id] || (q.type === 'checkbox' ? [] : ''))
      )
      initialModuleScores[module.id] = moduleQuestionScores.reduce((sum, score) => sum + score, 0)
    })
    
    setModuleScores(initialModuleScores)
    const totalDimensionScore = Object.values(initialModuleScores).reduce((sum, score) => sum + score, 0)
    setScore('violet-innovation', totalDimensionScore)
  }, []) // Run only once on mount

  const handleAnswerChange = (questionId: string, moduleId: string, value: string | string[]) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)
    const storageAnswers: { [key: string]: string } = {}
    Object.entries(newAnswers).forEach(([key, val]) => {
      storageAnswers[key] = Array.isArray(val) ? JSON.stringify(val) : val as string
    })
    saveAnswers('violet-innovation', storageAnswers)

    const module = violetInnovationModules.find(m => m.id === moduleId)
    if (module) {
      const moduleQuestionScores = module.questions.map(q => 
        calculateQuestionScore(q.id, newAnswers[q.id] || '')
      )
      const totalScore = moduleQuestionScores.reduce((sum, score) => sum + score, 0)
      const newModuleScores = { ...moduleScores, [moduleId]: totalScore }
      setModuleScores(newModuleScores)

      const totalDimensionScore = Object.values(newModuleScores).reduce((sum, score) => sum + score, 0)
      setScore('violet-innovation', totalDimensionScore)
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
            {totalScore.toFixed(1)} / {maxTotalScore}
          </div>
        </div>
      </div>

      <div className="question-content">
        <div className="questions-panel">
          {violetInnovationModules.flatMap(module => module.questions).map((question) => {
            const module = violetInnovationModules.find(m => m.questions.includes(question))!
            return (
                <div key={question.id} className="question-item" style={{ borderColor: `${scoreColor}33` }}>
                  <label className="question-label">{question.question}</label>
                  
                  {question.formula && (
                    <div className="question-formula" style={{ backgroundColor: `${scoreColor}15`, borderColor: `${scoreColor}33` }}>
                      Formula: {question.formula}
                    </div>
                  )}

                  {question.reference && question.reference.url !== '#' && (
                    <div className="question-reference">
                      <a href={question.reference.url} target="_blank" rel="noopener noreferrer">
                        🔗 {question.reference.name}
                      </a>
                    </div>
                  )}

                  {question.type === 'input' && (
                    <div className="input-group">
                      <input
                        type="number"
                        value={answers[question.id] as string || ''}
                        onChange={(e) => handleAnswerChange(question.id, module.id, e.target.value)}
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
                      onChange={(e) => handleAnswerChange(question.id, module.id, e.target.value)}
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

                  {question.scoringRules && (
                    <div className="scoring-hints" style={{ backgroundColor: `${scoreColor}15`, borderColor: `${scoreColor}33` }}>
                      <strong>Scoring Guide:</strong>
                      {question.scoringRules.map((rule, idx) => (
                        <div key={idx} className="scoring-rule">
                          • {rule.description}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default QuestionPageViolet
