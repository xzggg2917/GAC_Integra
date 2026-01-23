import React, { useState, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useDimension } from '../context/DimensionContext'
import { dimensions } from '../data/algorithms'
import { getScoreColor } from '../utils/colorUtils'
import { greenEcologyModules } from '../data/greenEcologyQuestions'
import { bluePracticalityModules } from '../data/bluePracticalityQuestions'
import { grayIndustryModules } from '../data/grayIndustryQuestions'
import { yellowSocietyModules } from '../data/yellowSocietyQuestions'
import { cyanDataModules } from '../data/cyanDataQuestions'
import { orangeCircularModules } from '../data/orangeCircularQuestions'
import { violetInnovationModules } from '../data/violetInnovationQuestions'
import './VisualizationPage.css'

interface VisualizationPageProps {
  onClose: () => void
}

const VisualizationPage: React.FC<VisualizationPageProps> = ({ onClose }) => {
  const { selectedDimensions, getTotalScore, scores, allAnswers } = useDimension()
  const [viewMode, setViewMode] = useState<'treemap' | 'sunburst'>('treemap')
  const [showTextReport, setShowTextReport] = useState(false)

  // Convert dimension data to chart format
  const chartData = useMemo(() => {
    // Get all question modules
    const allModules = {
      'green-ecology': greenEcologyModules,
      'blue-practicality': bluePracticalityModules,
      'gray-industry': grayIndustryModules,
      'yellow-society': yellowSocietyModules,
      'cyan-data': cyanDataModules,
      'orange-circular': orangeCircularModules,
      'violet-innovation': violetInnovationModules
    }

    // Helper function to calculate question score
    const calculateQuestionScore = (question: any, answer: any): number => {
      if (!answer) return 0

      // Parse JSON strings for checkbox answers
      let parsedAnswer = answer
      if (typeof answer === 'string' && answer.startsWith('[')) {
        try {
          parsedAnswer = JSON.parse(answer)
        } catch (e) {
          parsedAnswer = answer
        }
      }

      if (question.type === 'select') {
        const selectedOption = question.options?.find((opt: any) => opt.value === parsedAnswer)
        return selectedOption?.score || 0
      }

      if (question.type === 'input' && question.scoringRules) {
        const numValue = parseFloat(parsedAnswer)
        if (isNaN(numValue)) return 0

        for (const rule of question.scoringRules) {
          const minMatch = rule.min === undefined || numValue >= rule.min
          const maxMatch = rule.max === undefined || numValue < rule.max
          if (minMatch && maxMatch) {
            return rule.score
          }
        }
      }

      if (question.type === 'checkbox' && Array.isArray(parsedAnswer)) {
        return parsedAnswer.reduce((sum: number, val: string) => {
          const opt = question.options?.find((o: any) => o.value === val)
          return sum + (opt?.score || 0)
        }, 0)
      }

      return 0
    }

    const children = selectedDimensions.map(dimId => {
      const dimension = dimensions.find(d => d.id === dimId)
      const score = scores[dimId] || 0
      const answers = allAnswers[dimId] || {}
      
      // Get questions for this dimension
      const modules = allModules[dimId as keyof typeof allModules]
      const allQuestions = (modules?.flatMap((m: any) => m.questions) || []) as any[]
      
      // Create children for each question with actual score
      const questionChildren = allQuestions.map((question: any, qIndex: number) => {
        let answer = answers[question.id]
        
        // Parse JSON strings (for checkbox answers)
        if (typeof answer === 'string' && answer.startsWith('[')) {
          try {
            answer = JSON.parse(answer)
          } catch (e) {
            // Keep as string if parse fails
          }
        }
        
        const questionScore = calculateQuestionScore(question, answer)
        
        // Format answer for display
        let answerDisplay = 'Not answered'
        if (answer !== undefined && answer !== null && answer !== '') {
          if (Array.isArray(answer)) {
            answerDisplay = answer.length > 0 ? answer.join(', ') : 'Not answered'
          } else {
            answerDisplay = String(answer)
          }
        }

        // Calculate color based on question score
        const questionColor = getScoreColor(questionScore, 10)

        // Handle both data structures: 'question' field (standard) and 'text' field (cyan-data)
        const questionText = question.question || question.text || ''
        const questionId = question.id ? question.id.toUpperCase() : `Q${qIndex + 1}`

        return {
          name: questionId,
          value: 1, // Use fixed value for even distribution in sunburst
          itemStyle: {
            color: questionColor
          },
          dimensionName: dimension?.name || dimId,
          questionText: questionText,
          answerText: answerDisplay,
          actualScore: questionScore,
          questionIndex: qIndex // Add index to prevent overlap
        }
      })

      // Calculate color based on dimension total score
      const maxDimensionScore = allQuestions.length * 10
      const dimensionColor = getScoreColor(score, maxDimensionScore)

      return {
        name: dimension?.name || dimId,
        value: questionChildren.length || 1, // Use number of questions for dimension size
        itemStyle: {
          color: dimensionColor
        },
        children: questionChildren.length > 0 ? questionChildren : undefined,
        dimensionScore: score,
        dimensionMaxScore: maxDimensionScore
      }
    })

    return {
      name: 'GAC Integra',
      children: children
    }
  }, [selectedDimensions, scores, allAnswers])

  const treemapOption = {
    title: {
      text: 'Dimension Score Distribution (Treemap)',
      left: 'center',
      top: 20,
      textStyle: {
        color: '#fff',
        fontSize: 20
      }
    },
    tooltip: {
      confine: true,
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: '#60a5fa',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
        fontSize: 13
      },
      formatter: (info: any) => {
        const { data } = info
        
        // If it's a question node (has questionText)
        if (data.questionText) {
          const displayScore = data.actualScore !== undefined ? data.actualScore : info.value
          return `<div style="max-width: 400px; padding: 10px; line-height: 1.5; word-wrap: break-word; white-space: normal;">
            <div style="font-weight: bold; color: #60a5fa; margin-bottom: 8px; font-size: 14px;">${data.dimensionName} - ${data.name}</div>
            <div style="margin-bottom: 6px; color: #e5e7eb; word-wrap: break-word;"><strong style="color: #fff;">Question:</strong><br/>${data.questionText}</div>
            <div style="margin-bottom: 6px; color: #e5e7eb; word-wrap: break-word;"><strong style="color: #fff;">Answer:</strong> ${data.answerText}</div>
            <div style="font-size: 16px; font-weight: bold; color: #10b981; margin-top: 8px;">Score: ${displayScore.toFixed(1)} / 10</div>
          </div>`
        }
        
        // Dimension node
        return `<div style="padding: 6px;">
          <div style="font-weight: bold; font-size: 15px; margin-bottom: 4px;">${data.name}</div>
          <div style="color: #10b981; font-weight: bold;">Total Score: ${info.value.toFixed(1)}</div>
        </div>`
      }
    },
    series: [
      {
        type: 'treemap',
        animationDurationUpdate: 600,
        roam: false,
        nodeClick: false,
        data: chartData.children,
        label: {
          show: true,
          formatter: (params: any) => {
            // Show dimension name and question ID for questions
            if (params.data.dimensionName) {
              const score = params.data.actualScore !== undefined ? params.data.actualScore : params.value
              return `${params.data.dimensionName}\n${params.name}\n${score.toFixed(1)}`
            }
            // Show just name for dimensions
            return params.name
          },
          color: '#fff',
          fontSize: 12,
          overflow: 'truncate'
        },
        breadcrumb: {
          show: false
        },
        levels: [
          {
            itemStyle: {
              borderColor: '#555',
              borderWidth: 4,
              gapWidth: 4
            }
          },
          {
            colorSaturation: [0.3, 0.6],
            itemStyle: {
              borderColorSaturation: 0.7,
              gapWidth: 2,
              borderWidth: 2
            }
          }
        ]
      }
    ]
  }

  const sunburstOption = {
    title: {
      text: 'Dimension Score Distribution (Sunburst)',
      left: 40,
      top: 30,
      textStyle: {
        color: '#fff',
        fontSize: 20
      }
    },
    tooltip: {
      confine: true,
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: '#60a5fa',
      borderWidth: 1,
      textStyle: {
        color: '#fff',
        fontSize: 13
      },
      formatter: (info: any) => {
        const { data } = info
        
        // If it's a question node (has questionText)
        if (data.questionText) {
          const displayScore = data.actualScore !== undefined ? data.actualScore : 0
          return `<div style="max-width: 400px; padding: 10px; line-height: 1.5; word-wrap: break-word; white-space: normal;">
            <div style="font-weight: bold; color: #60a5fa; margin-bottom: 8px; font-size: 14px;">${data.dimensionName} - ${data.name}</div>
            <div style="margin-bottom: 6px; color: #e5e7eb; word-wrap: break-word;"><strong style="color: #fff;">Question:</strong><br/>${data.questionText}</div>
            <div style="margin-bottom: 6px; color: #e5e7eb; word-wrap: break-word;"><strong style="color: #fff;">Answer:</strong> ${data.answerText}</div>
            <div style="font-size: 16px; font-weight: bold; color: #10b981; margin-top: 8px;">Score: ${displayScore.toFixed(1)} / 10</div>
          </div>`
        }
        
        // Dimension node
        const dimScore = data.dimensionScore !== undefined ? data.dimensionScore : info.value
        const dimMaxScore = data.dimensionMaxScore || 100
        return `<div style="padding: 8px;">
          <div style="font-weight: bold; font-size: 16px; margin-bottom: 4px; color: #60a5fa;">${data.name}</div>
          <div style="color: #10b981; font-weight: bold; font-size: 14px;">Total Score: ${dimScore.toFixed(1)} / ${dimMaxScore}</div>
          <div style="color: #94a3b8; font-size: 12px; margin-top: 4px;">Questions: ${data.children?.length || 0}</div>
        </div>`
      }
    },
    series: [
      {
        type: 'sunburst',
        center: ['50%', '52%'],
        radius: ['15%', '88%'],
        animationDurationUpdate: 600,
        nodeClick: false,
        sort: 'asc', // Sort to prevent overlap
        data: chartData.children,
        itemStyle: {
          borderWidth: 2,
          borderColor: 'rgba(255,255,255,.5)'
        },
        emphasis: {
          focus: 'ancestor' // Highlight parent when hovering child
        },
        levels: [
          {
            // Root level
            r0: 0,
            r: '15%',
            label: {
              show: false
            }
          },
          {
            // Dimension level (inner ring)
            r0: '15%',
            r: '45%',
            label: {
              rotate: 'radial',
              align: 'center',
              fontSize: 15,
              fontWeight: 'bold',
              color: '#fff'
            },
            itemStyle: {
              borderWidth: 3
            }
          },
          {
            // Question level (outer ring)
            r0: '45%',
            r: '90%',
            label: {
              show: false // Hide all labels on outer ring to avoid clutter
            },
            itemStyle: {
              borderWidth: 1
            }
          }
        ]
      }
    ]
  }

  const currentOption = viewMode === 'treemap' ? treemapOption : sunburstOption

  // Calculate total score for water ball
  const totalScore = getTotalScore()
  
  // Water ball level: use the displayed total score directly as water level (0-100 scale)
  // If total score is shown as 38.9, water should be at 38.9% height
  const waterLevel = totalScore > 100 ? 100 : totalScore // Cap at 100 for display
  const textColor = totalScore < 30 ? '#ef4444' : totalScore < 60 ? '#f59e0b' : '#10b981'

  // Generate text report
  const textReport = useMemo(() => {
    const totalScore = getTotalScore()
    const reports = selectedDimensions.map(dimId => {
      const dimension = dimensions.find(d => d.id === dimId)
      const score = scores[dimId] || 0
      const answers = allAnswers[dimId] || {}
      const questionCount = Object.keys(answers).length
      const avgScore = questionCount > 0 ? score / questionCount : 0
      
      // Calculate score color based on actual score vs max (100 points per dimension)
      const maxScore = 100
      const scoreColor = getScoreColor(score, maxScore)

      return {
        dimension: dimension?.name || dimId,
        score: score.toFixed(1),
        avgScore: avgScore.toFixed(1),
        questionCount,
        color: scoreColor,
        description: dimension?.description || ''
      }
    })

    // Sort by score descending
    reports.sort((a, b) => parseFloat(b.score) - parseFloat(a.score))

    return { totalScore, reports }
  }, [selectedDimensions, scores, allAnswers, getTotalScore])

  return (
    <div className="visualization-page">
      <div className="visualization-header">
        <h1>Results Visualization</h1>
        <button className="close-button" onClick={onClose}>
          ✕ Close
        </button>
      </div>

      <div className="visualization-controls">
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'treemap' ? 'active' : ''}`}
            onClick={() => setViewMode('treemap')}
          >
            📊 Treemap View
          </button>
          <button
            className={`toggle-btn ${viewMode === 'sunburst' ? 'active' : ''}`}
            onClick={() => setViewMode('sunburst')}
          >
            🎯 Sunburst View
          </button>
        </div>
        <button
          className={`text-report-btn ${showTextReport ? 'active' : ''}`}
          onClick={() => setShowTextReport(!showTextReport)}
        >
          📝 {showTextReport ? 'Hide' : 'Show'} Text Report
        </button>
      </div>

      <div className="visualization-content">
        {!showTextReport ? (
          <div className="chart-container" style={{ position: 'relative' }}>
            <ReactECharts
              option={currentOption}
              style={{ height: '600px', width: '100%' }}
              theme="dark"
            />
            {viewMode === 'sunburst' && (
              <div className="water-ball-container">
                <svg className="water-ball" viewBox="0 0 200 200">
                  <defs>
                    <clipPath id="circle-clip">
                      <circle cx="100" cy="100" r="100" />
                    </clipPath>
                    <linearGradient id="water-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor={totalScore < 30 ? '#ef4444' : totalScore < 60 ? '#f59e0b' : '#10b981'} />
                      <stop offset="100%" stopColor={totalScore < 30 ? '#dc2626' : totalScore < 60 ? '#d97706' : '#059669'} />
                    </linearGradient>
                  </defs>
                  
                  {/* Background circle - matches sunburst center */}
                  <circle cx="100" cy="100" r="100" fill="rgba(15, 23, 42, 0.98)" stroke="none" />
                  
                  {/* Water wave */}
                  <g clipPath="url(#circle-clip)">
                    <path
                      d={`M 0,${200 - (waterLevel * 2)} Q 50,${200 - (waterLevel * 2) - 10} 100,${200 - (waterLevel * 2)} T 200,${200 - (waterLevel * 2)} V 200 H 0 Z`}
                      fill="url(#water-gradient)"
                      opacity="0.7"
                    >
                      <animate
                        attributeName="d"
                        dur="3s"
                        repeatCount="indefinite"
                        values={`M 0,${200 - (waterLevel * 2)} Q 50,${200 - (waterLevel * 2) - 10} 100,${200 - (waterLevel * 2)} T 200,${200 - (waterLevel * 2)} V 200 H 0 Z;
                                M 0,${200 - (waterLevel * 2)} Q 50,${200 - (waterLevel * 2) + 10} 100,${200 - (waterLevel * 2)} T 200,${200 - (waterLevel * 2)} V 200 H 0 Z;
                                M 0,${200 - (waterLevel * 2)} Q 50,${200 - (waterLevel * 2) - 10} 100,${200 - (waterLevel * 2)} T 200,${200 - (waterLevel * 2)} V 200 H 0 Z`}
                      />
                    </path>
                    <path
                      d={`M 0,${200 - (waterLevel * 2) + 5} Q 50,${200 - (waterLevel * 2) + 15} 100,${200 - (waterLevel * 2) + 5} T 200,${200 - (waterLevel * 2) + 5} V 200 H 0 Z`}
                      fill="url(#water-gradient)"
                      opacity="0.5"
                    >
                      <animate
                        attributeName="d"
                        dur="2.5s"
                        repeatCount="indefinite"
                        values={`M 0,${200 - (waterLevel * 2) + 5} Q 50,${200 - (waterLevel * 2) + 15} 100,${200 - (waterLevel * 2) + 5} T 200,${200 - (waterLevel * 2) + 5} V 200 H 0 Z;
                                M 0,${200 - (waterLevel * 2) + 5} Q 50,${200 - (waterLevel * 2) - 5} 100,${200 - (waterLevel * 2) + 5} T 200,${200 - (waterLevel * 2) + 5} V 200 H 0 Z;
                                M 0,${200 - (waterLevel * 2) + 5} Q 50,${200 - (waterLevel * 2) + 15} 100,${200 - (waterLevel * 2) + 5} T 200,${200 - (waterLevel * 2) + 5} V 200 H 0 Z`}
                      />
                    </path>
                  </g>
                  
                  {/* Score text */}
                  <text
                    x="100"
                    y="105"
                    textAnchor="middle"
                    fill={textColor}
                    fontSize="42"
                    fontWeight="bold"
                  >
                    {totalScore.toFixed(1)}
                  </text>
                </svg>
              </div>
            )}
            <div className="chart-hint">
              💡 Hover over blocks to see detailed scores. Block size represents score magnitude.
            </div>
          </div>
        ) : (
          <div className="text-report">
            <div className="report-summary">
              <h2>Assessment Summary</h2>
              <div className="total-score-display">
                <span className="label">Total Score:</span>
                <span className="value">{textReport.totalScore.toFixed(1)}</span>
              </div>
            </div>

            <div className="dimension-reports">
              {textReport.reports.map((report, index) => (
                <div key={index} className="dimension-report-card">
                  <div
                    className="dimension-indicator"
                    style={{ backgroundColor: report.color }}
                  />
                  <div className="dimension-info">
                    <h3>{report.dimension}</h3>
                    <p className="dimension-desc">{report.description}</p>
                    <div className="dimension-metrics">
                      <div className="metric">
                        <span className="metric-label">Total Score:</span>
                        <span className="metric-value">{report.score}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Questions Answered:</span>
                        <span className="metric-value">{report.questionCount}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Average Score:</span>
                        <span className="metric-value">{report.avgScore}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VisualizationPage
