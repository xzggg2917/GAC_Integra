import React, { useState, useEffect } from 'react'
import { cyanDataQuestions } from '../data/cyanDataQuestions'
import { useDimension } from '../context/DimensionContext'
import { getScoreColor } from '../utils/colorUtils'
import './QuestionPage.css'

interface QuestionPageCyanProps {
  onClose: () => void
}

const QuestionPageCyan: React.FC<QuestionPageCyanProps> = ({ onClose }) => {
  const { setScore, saveAnswers, getAnswers } = useDimension()
  const [answers, setAnswers] = useState<Record<string, string>>(() => getAnswers('cyan-data'))
  const [moduleScores, setModuleScores] = useState<Record<string, number>>({})

  const calculateQuestionScore = (questionId: string, value: string): number => {
    if (!value) return 0

    const module = cyanDataQuestions.find(m => m.questions.some(q => q.id === questionId))
    const question = module?.questions.find(q => q.id === questionId)
    if (!question) return 0

    if (question.type === 'select') {
      const selectedOption = question.options?.find(opt => opt.value === value)
      return selectedOption?.score || 0
    } else if (question.type === 'input') {
      const numValue = parseFloat(value)
      if (isNaN(numValue)) return 0
      
      // For Q4 and Q9: user inputs percentage (0-100), convert to 0-10 scale
      if (questionId === 'Q4' || questionId === 'Q9') {
        return Math.min(numValue / 10, 10)
      }
    }

    return 0
  }

  // Initialize scores from saved answers on mount
  useEffect(() => {
    const initialModuleScores: { [key: string]: number } = {}
    
    cyanDataQuestions.forEach(module => {
      const moduleQuestionScores = module.questions.map(q => 
        calculateQuestionScore(q.id, answers[q.id] || '')
      )
      initialModuleScores[module.id] = moduleQuestionScores.reduce((sum, score) => sum + score, 0)
    })
    
    setModuleScores(initialModuleScores)
    const totalDimensionScore = Object.values(initialModuleScores).reduce((sum, score) => sum + score, 0)
    setScore('cyan-data', totalDimensionScore)
  }, []) // Run only once on mount

  const handleAnswerChange = (questionId: string, moduleId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)
    saveAnswers('cyan-data', newAnswers)

    // Calculate module score
    const module = cyanDataQuestions.find(m => m.id === moduleId)
    if (module) {
      const moduleQuestionScores = module.questions.map(q => 
        calculateQuestionScore(q.id, newAnswers[q.id] || '')
      )
      const totalScore = moduleQuestionScores.reduce((sum, score) => sum + score, 0)
      const newModuleScores = { ...moduleScores, [moduleId]: totalScore }
      setModuleScores(newModuleScores)

      // Calculate total score for Cyan Data dimension
      const totalDimensionScore = Object.values(newModuleScores).reduce((sum, score) => sum + score, 0)
      setScore('cyan-data', totalDimensionScore)
    }
  }

  const totalScore = Object.values(moduleScores).reduce((sum, s) => sum + s, 0)
  const maxTotalScore = cyanDataQuestions.reduce((sum, m) => sum + m.questions.length * 10, 0)
  const scoreColor = getScoreColor(totalScore, maxTotalScore)

  return (
    <div className="question-page">
      <div className="question-header">
        <div className="question-header-left">
          <button className="back-button" onClick={onClose} style={{ borderColor: scoreColor, color: scoreColor }}>
            ← Back to Dashboard
          </button>
          <div className="question-header-content">
            <h2 style={{ marginBottom: '8px' }}>Digital Navigator</h2>
            <p className="dimension-description">
              Focus: ALCOA+ principle, data traceability and tampering prevention; Use mathematical methods to resolve chemical complexity, reducing reagent usage; FAIR principle (Findable, Accessible, Interoperable, Reusable), combating data silos.
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
          {cyanDataQuestions.flatMap(module => module.questions).map((question) => {
            const module = cyanDataQuestions.find(m => m.questions.includes(question))!
            return (
                <div key={question.id} className="question-item" style={{ borderLeftColor: scoreColor }}>
                  <label className="question-label">{question.text}</label>

                  {question.formula && (
                    <div className="scoring-hints" style={{ backgroundColor: `${scoreColor}22`, borderLeftColor: scoreColor }}>
                      <strong style={{ color: scoreColor }}>Formula:</strong>
                      <div className="scoring-rule">{question.formula}</div>
                    </div>
                  )}

                  {question.note && (
                    <div className="scoring-hints" style={{ backgroundColor: `${scoreColor}22`, borderLeftColor: scoreColor }}>
                      <strong style={{ color: scoreColor }}>Note:</strong>
                      <div className="scoring-rule">{question.note}</div>
                    </div>
                  )}

                  {question.type === 'input' && (
                    <div className="input-group">
                      <input
                        type="number"
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, module.id, e.target.value)}
                        onWheel={(e) => e.currentTarget.blur()}
                        onKeyDown={(e) => {
                          if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                            e.preventDefault()
                          }
                        }}
                        className="question-input"
                        placeholder="Enter value (0-100)"
                      />
                      <span className="input-unit">percentage</span>
                    </div>
                  )}

                  {question.type === 'select' && (
                    <select
                      value={answers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, module.id, e.target.value)}
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

                  {question.referenceUrl && (
                    <div className="question-reference">
                      <strong>Reference:</strong>{' '}
                      <a href={question.referenceUrl} target="_blank" rel="noopener noreferrer">
                        {question.referenceUrl}
                      </a>
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

export default QuestionPageCyan
