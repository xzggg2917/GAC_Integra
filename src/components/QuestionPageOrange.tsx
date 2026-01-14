import React, { useState } from 'react'
import { orangeCircularModules } from '../data/orangeCircularQuestions'
import { useDimension } from '../context/DimensionContext'
import CloverVisualization from './CloverVisualization'
import './QuestionPage.css'

interface QuestionPageOrangeProps {
  onClose: () => void
}

const QuestionPageOrange: React.FC<QuestionPageOrangeProps> = ({ onClose }) => {
  const { setScore } = useDimension()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [moduleScores, setModuleScores] = useState<Record<string, number>>({})

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

  const handleAnswerChange = (questionId: string, moduleId: string, value: string) => {
    const newAnswers = { ...answers, [questionId]: value }
    setAnswers(newAnswers)

    // Calculate module score
    const module = orangeCircularModules.find(m => m.id === moduleId)
    if (module) {
      const moduleQuestionScores = module.questions.map(q => 
        calculateQuestionScore(q.id, newAnswers[q.id] || '')
      )
      const totalScore = moduleQuestionScores.reduce((sum, score) => sum + score, 0)
      const newModuleScores = { ...moduleScores, [moduleId]: totalScore }
      setModuleScores(newModuleScores)

      // Calculate total score for Orange Circular dimension
      const totalDimensionScore = Object.values(newModuleScores).reduce((sum, score) => sum + score, 0)
      setScore('orange-circular', totalDimensionScore)
    }
  }

  return (
    <div className="question-page orange-theme">
      <div className="question-header">
        <button className="back-button" onClick={onClose}>
          ← Back to Dashboard
        </button>
        <h2>Orange Circular - Resource Regenerator</h2>
        <p className="dimension-description">
          Focus: Recovery, reuse, and waste destination; Based on bio-based carbon from renewable materials; Low carbon and emissions throughout the life cycle
        </p>
      </div>

      <div className="question-content">
        <div className="questions-panel">
          {orangeCircularModules.map((module, moduleIndex) => (
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
                    <div className="scoring-hints">
                      <strong>Formula:</strong>
                      <div className="scoring-rule">{question.formula}</div>
                    </div>
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
          <h3>Module Score Distribution</h3>
          <CloverVisualization 
            modules={orangeCircularModules.map(module => ({
              id: module.id,
              name: module.name,
              score: moduleScores[module.id] || 0,
              maxScore: module.questions.length * 10
            }))}
            color="#f97316" 
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

export default QuestionPageOrange
