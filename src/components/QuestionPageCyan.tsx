import React, { useState } from 'react'
import { cyanDataQuestions } from '../data/cyanDataQuestions'
import { useDimension } from '../context/DimensionContext'
import CloverVisualization from './CloverVisualization'
import './QuestionPage.css'

interface QuestionPageCyanProps {
  onClose: () => void
}

const QuestionPageCyan: React.FC<QuestionPageCyanProps> = ({ onClose }) => {
  const { setScore } = useDimension()
  const [answers, setAnswers] = useState<Record<string, string>>({})
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

  const handleAnswerChange = (questionId: string, moduleId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)

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

  return (
    <div className="question-page cyan-theme">
      <div className="question-header">
        <button className="back-button" onClick={onClose}>
          ← Back to Dashboard
        </button>
        <h2>Cyan Data - Digital Navigator</h2>
        <p className="dimension-description">
          Focus: ALCOA+ principle, data traceability and tampering prevention; Use mathematical methods to resolve chemical complexity, reducing reagent usage; FAIR principle (Findable, Accessible, Interoperable, Reusable), combating data silos.
        </p>
      </div>

      <div className="question-content">
        <div className="questions-panel">
          {cyanDataQuestions.map((module, moduleIndex) => (
            <div key={module.id} className="module-section">
              <div className="module-header">
                <h3>Module {moduleIndex + 1}: {module.name}</h3>
                <p className="module-focus">Focus: {module.description}</p>
                <div className="module-score-badge">
                  Score: {(moduleScores[module.id] || 0).toFixed(1)}/
                  {module.questions.length * 10}
                </div>
              </div>

              {module.questions.map((question) => (
                <div key={question.id} className="question-item">
                  <label className="question-label">{question.text}</label>

                  {question.formula && (
                    <div className="scoring-hints">
                      <strong>Formula:</strong>
                      <div className="scoring-rule">{question.formula}</div>
                    </div>
                  )}

                  {question.note && (
                    <div className="scoring-hints">
                      <strong>Note:</strong>
                      <div className="scoring-rule">{question.note}</div>
                    </div>
                  )}

                  {question.type === 'input' && (
                    <div className="input-group">
                      <input
                        type="number"
                        step="0.1"
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, module.id, e.target.value)}
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
              ))}
            </div>
          ))}
        </div>

        <div className="visualization-panel">
          <h3>Module Score Distribution</h3>
          <CloverVisualization 
            modules={cyanDataQuestions.map(module => ({
              id: module.id,
              name: module.name,
              score: moduleScores[module.id] || 0,
              maxScore: module.questions.length * 10
            }))}
            color="#06b6d4" 
          />
          <div className="total-score-display">
            <div className="score-label">Total Score</div>
            <div className="score-value">
              {Object.values(moduleScores).reduce((sum, score) => sum + score, 0).toFixed(1)}
            </div>
            <div className="score-denominator">/ 100</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionPageCyan
