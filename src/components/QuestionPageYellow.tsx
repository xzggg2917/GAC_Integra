import React, { useState } from 'react'
import { yellowSocietyModules } from '../data/yellowSocietyQuestions'
import { useDimension } from '../context/DimensionContext'
import CloverVisualization from './CloverVisualization'
import MultiSelectDropdown from './MultiSelectDropdown'
import './QuestionPage.css'

interface QuestionPageYellowProps {
  onClose: () => void
}

const QuestionPageYellow: React.FC<QuestionPageYellowProps> = ({ onClose }) => {
  const { setScore, saveAnswers, getAnswers } = useDimension()
  const [answers, setAnswers] = useState<{ [key: string]: string | string[] }>(() => {
    const savedAnswers = getAnswers('yellow-society')
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
  const [moduleScores, setModuleScores] = useState<{ [key: string]: number }>({})

  const calculateQuestionScore = (questionId: string, answer: string | string[]): number => {
    const question = yellowSocietyModules
      .flatMap(m => m.questions)
      .find(q => q.id === questionId)

    if (!question) return 0

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

  const handleAnswerChange = (questionId: string, moduleId: string, value: string | string[]) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)
    // Convert array values to JSON string for storage
    const storageAnswers: { [key: string]: string } = {}
    Object.entries(newAnswers).forEach(([key, val]) => {
      storageAnswers[key] = Array.isArray(val) ? JSON.stringify(val) : val as string
    })
    saveAnswers('yellow-society', storageAnswers)

    const module = yellowSocietyModules.find(m => m.id === moduleId)
    if (module) {
      const moduleQuestionScores = module.questions.map(q => 
        calculateQuestionScore(q.id, newAnswers[q.id] || (q.type === 'checkbox' ? [] : ''))
      )
      const totalScore = moduleQuestionScores.reduce((sum, score) => sum + score, 0)
      const newModuleScores = { ...moduleScores, [moduleId]: totalScore }
      setModuleScores(newModuleScores)

      const totalDimensionScore = Object.values(newModuleScores).reduce((sum, score) => sum + score, 0)
      setScore('yellow-society', totalDimensionScore)
    }
  }

  return (
    <div className="question-page yellow-theme">
      <div className="question-header">
        <button className="back-button" onClick={onClose}>
          ← Back to Dashboard
        </button>
        <h2>Yellow Society - Safety Guardian</h2>
        <p className="dimension-description">
          Focuses on human safety and occupational health risks
        </p>
      </div>

      <div className="question-content">
        <div className="questions-panel">
          {yellowSocietyModules.map((module, moduleIndex) => (
            <div key={module.id} className="module-section yellow-module">
              <div className="module-header">
                <h3>Module {moduleIndex + 1}: {module.name}</h3>
                <p className="module-focus">Focus: {module.focus}</p>
                <div className="module-score-badge yellow-badge">
                  Score: {(moduleScores[module.id] || 0).toFixed(1)}/
                  {module.questions.length * 10}
                </div>
              </div>

              {module.questions.map((question) => (
                <div key={question.id} className="question-item">
                  <label className="question-label">{question.question}</label>
                  
                  {question.formula && (
                    <div className="question-formula yellow-formula">
                      Formula: {question.formula}
                    </div>
                  )}

                  {question.reference && (
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
                          {option.label} ({option.score} points)
                        </option>
                      ))}
                    </select>
                  )}

                  {question.type === 'checkbox' && (
                    <MultiSelectDropdown
                      options={question.options || []}
                      selectedValues={(answers[question.id] as string[]) || []}
                      onChange={(values) => handleAnswerChange(question.id, module.id, values)}
                      placeholder="-- Select conditions (multiple) --"
                    />
                  )}

                  {question.scoringRules && (
                    <div className="scoring-hints yellow-hints">
                      <strong>Scoring Guide:</strong>
                      {question.scoringRules.map((rule, idx) => (
                        <div key={idx} className="scoring-rule">
                          • {rule.score} pts: {rule.description}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="visualization-panel yellow-panel">
          <h3>Module Performance</h3>
          <CloverVisualization
            modules={yellowSocietyModules.map((m, idx) => ({
              id: m.id,
              name: `Module ${idx + 1}`,
              score: moduleScores[m.id] || 0,
              maxScore: m.questions.length * 10
            }))}
            color="#eab308"
          />
          <div className="total-score-display yellow-score">
            <div className="score-label">Total Score</div>
            <div className="score-value">
              {Object.values(moduleScores).reduce((sum, s) => sum + s, 0).toFixed(1)} / 100
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuestionPageYellow
