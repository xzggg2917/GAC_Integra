import React, { useState, useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useDimension } from '../context/DimensionContext'
import { dimensions } from '../data/algorithms'
import { grayIndustryModules } from '../data/grayIndustryQuestions'
import { yellowSocietyModules } from '../data/yellowSocietyQuestions'
import { cyanDataQuestions } from '../data/cyanDataQuestions'
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
      'gray-industry': grayIndustryModules,
      'yellow-society': yellowSocietyModules,
      'cyan-data': cyanDataQuestions,
      'orange-circular': orangeCircularModules,
      'violet-innovation': violetInnovationModules
    }

    const children = selectedDimensions.map(dimId => {
      const dimension = dimensions.find(d => d.id === dimId)
      const score = scores[dimId] || 0
      const answers = allAnswers[dimId] || {}
      
      // Get questions for this dimension
      const modules = allModules[dimId as keyof typeof allModules]
      const allQuestions = (modules?.flatMap((m: any) => m.questions) || []) as any[]
      
      // Create children for each question
      const questionChildren = Object.entries(answers).map(([questionId, answer]) => {
        const question = allQuestions.find((q: any) => q.id === questionId)
        const answerValue = typeof answer === 'string' ? parseFloat(answer) || 0 : answer
        
        return {
          name: `${questionId.toUpperCase()}`,
          value: Math.max(answerValue, 1), // Ensure minimum visibility even for 0 scores
          itemStyle: {
            color: dimension?.color
          },
          questionText: (question as any)?.question || '',
          answerText: answer,
          actualScore: answerValue // Store actual score for display
        }
      })

      return {
        name: dimension?.name || dimId,
        value: score || 1,
        itemStyle: {
          color: dimension?.color
        },
        children: questionChildren.length > 0 ? questionChildren : undefined
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
      formatter: (info: any) => {
        const { value, treePathInfo, data } = info
        const path = treePathInfo.map((item: any) => item.name).join(' > ')
        
        // If it's a question node (has questionText)
        if (data.questionText) {
          return `<div style="max-width: 400px;">
            <strong>${path}</strong><br/>
            <strong>Question:</strong> ${data.questionText}<br/>
            <strong>Answer:</strong> ${data.answerText}<br/>
            <strong>Score:</strong> ${value.toFixed(1)}
          </div>`
        }
        
        return `<strong>${path}</strong><br/>Score: ${value.toFixed(1)}`
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
            // Show question ID and actual score
            const score = params.data.actualScore !== undefined ? params.data.actualScore : params.value
            return `${params.name}\n${score.toFixed(1)}`
          },
          color: '#fff',
          fontSize: 14,
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
        const { treePathInfo, data } = info
        const path = treePathInfo.map((item: any) => item.name).join(' > ')
        
        // If it's a question node (has questionText)
        if (data.questionText) {
          const displayScore = data.actualScore !== undefined ? data.actualScore : info.value
          return `<div style="max-width: 500px; line-height: 1.6;">
            <div style="font-weight: bold; color: #60a5fa; margin-bottom: 8px;">${path}</div>
            <div style="margin-bottom: 6px;"><strong>Question:</strong><br/>${data.questionText}</div>
            <div style="margin-bottom: 6px;"><strong>Answer:</strong> ${data.answerText}</div>
            <div style="font-size: 15px; font-weight: bold; color: #10b981;">Score: ${displayScore.toFixed(1)}</div>
          </div>`
        }
        
        return `<div style="font-weight: bold;">${path}</div><div>Score: ${info.value.toFixed(1)}</div>`
      }
    },
    series: [
      {
        type: 'sunburst',
        radius: ['15%', '85%'],
        animationDurationUpdate: 600,
        nodeClick: false,
        data: chartData.children,
        itemStyle: {
          borderWidth: 2,
          borderColor: 'rgba(255,255,255,.5)'
        },
        label: {
          show: true,
          formatter: (params: any) => {
            // Show question ID and actual score for inner rings
            if (params.data.questionText) {
              const score = params.data.actualScore !== undefined ? params.data.actualScore : params.value
              return `${params.name}\n${score.toFixed(1)}`
            }
            return params.name
          },
          color: '#fff',
          fontSize: 12,
          overflow: 'truncate'
        }
      }
    ]
  }

  const currentOption = viewMode === 'treemap' ? treemapOption : sunburstOption

  // Generate text report
  const textReport = useMemo(() => {
    const totalScore = getTotalScore()
    const reports = selectedDimensions.map(dimId => {
      const dimension = dimensions.find(d => d.id === dimId)
      const score = scores[dimId] || 0
      const answers = allAnswers[dimId] || {}
      const questionCount = Object.keys(answers).length
      const avgScore = questionCount > 0 ? score / questionCount : 0

      return {
        dimension: dimension?.name || dimId,
        score: score.toFixed(1),
        avgScore: avgScore.toFixed(1),
        questionCount,
        color: dimension?.color,
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
          <div className="chart-container">
            <ReactECharts
              option={currentOption}
              style={{ height: '600px', width: '100%' }}
              theme="dark"
            />
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
