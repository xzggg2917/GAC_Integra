import React, { useState } from 'react'
import { grayIndustryModules } from '../data/grayIndustryQuestions'
import { useDimension } from '../context/DimensionContext'
import CloverVisualization from './CloverVisualization'
import './QuestionPage.css'

interface QuestionPageProps {
  onClose: () => void
}

const QuestionPage: React.FC<QuestionPageProps> = ({ onClose }) => {
  const { setScore } = useDimension()
  const [answers, setAnswers] = useState<{ [key: string]: string }>({})
  const [moduleScores, setModuleScores] = useState<{ [key: string]: number }>({})

  const calculateQuestionScore = (questionId: string, answer: string): number => {
    const question = grayIndustryModules
      .flatMap(m => m.questions)
      .find(q => q.id === questionId)

    if (!question) return 0

    if (question.type === 'select') {
      const option = question.options?.find(opt => opt.value === answer)
      return option?.score || 0
    }

    if (question.type === 'input' && question.scoringRules) {
      const value = parseFloat(answer)
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

  const handleAnswerChange = (questionId: string, moduleId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)

    // Calculate module score
    const module = grayIndustryModules.find(m => m.id === moduleId)
    if (module) {
      const moduleQuestionScores = module.questions.map(q => 
        calculateQuestionScore(q.id, newAnswers[q.id] || '')
      )
      const totalScore = moduleQuestionScores.reduce((sum, score) => sum + score, 0)
      const newModuleScores = { ...moduleScores, [moduleId]: totalScore }
      setModuleScores(newModuleScores)

      // Calculate total score for Gray Industry dimension
      const totalDimensionScore = Object.values(newModuleScores).reduce((sum, score) => sum + score, 0)
      setScore('gray-industry', totalDimensionScore)
    }
  }

  return (
    <div className="question-page">
      <div className="question-header">
        <button className="back-button" onClick={onClose}>
          ← Back to Dashboard
        </button>
        <h2>Gray Industry - Efficiency Engineer</h2>
        <p className="dimension-description">
          Focuses on efficiency from laboratory to industrial production scale
        </p>
      </div>

      <div className="question-content">
        <div className="questions-panel">
          {grayIndustryModules.map((module, moduleIndex) => (
            <div key={module.id} className="module-section">
              <div className="module-header">
                <h3>Module {moduleIndex + 1}: {module.name}</h3>
                <p className="module-focus">Focus: {module.focus}</p>
                <div className="module-score-badge">
                  Score: {(moduleScores[module.id] || 0).toFixed(1)}/
                  {module.questions.length * 10}
                </div>
              </div>

              {module.questions.map((question) => (
                <div key={question.id} className="question-item">
                  <label className="question-label">{question.question}</label>
                  
                  {question.formula && (
                    <div className="question-formula">Formula: {question.formula}</div>
                  )}

                  {question.type === 'input' && (
                    <div className="input-group">
                      <input
                        type="number"
                        step="0.01"
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, module.id, e.target.value)}
                        className="question-input"
                        placeholder={`Enter value${question.unit ? ` (${question.unit})` : ''}`}
                      />
                      {question.unit && <span className="input-unit">{question.unit}</span>}
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

                  {question.scoringRules && (
                    <div className="scoring-hints">
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

        <div className="visualization-panel">
          <h3>Module Performance</h3>
          <CloverVisualization
            modules={grayIndustryModules.map((m, idx) => ({
              id: m.id,
              name: `Module ${idx + 1}`,
              score: moduleScores[m.id] || 0,
              maxScore: m.questions.length * 10
            }))}
          />
          <div className="total-score-display">
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

export default QuestionPage
