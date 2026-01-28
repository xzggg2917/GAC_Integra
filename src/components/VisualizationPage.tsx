import React, { useState, useMemo, useRef, useEffect } from 'react'
import ReactECharts from 'echarts-for-react'
import { useDimension } from '../context/DimensionContext'
import { dimensions } from '../data/algorithms'
import { getQuestionScoreColor } from '../utils/colorUtils'
import { greenEcologyModules } from '../data/greenEcologyQuestions'
import { bluePracticalityModules } from '../data/bluePracticalityQuestions'
import { grayIndustryModules } from '../data/grayIndustryQuestions'
import { yellowSocietyModules } from '../data/yellowSocietyQuestions'
import { cyanDataModules } from '../data/cyanDataQuestions'
import { orangeCircularModules } from '../data/orangeCircularQuestions'
import { violetInnovationModules } from '../data/violetInnovationQuestions'
import { redPerformanceModules } from '../data/redPerformanceQuestions'
import { whiteCompletenessModules } from '../data/whiteCompletenessQuestions'
import './VisualizationPage.css'

interface VisualizationPageProps {
  onClose: () => void
}

const VisualizationPage: React.FC<VisualizationPageProps> = ({ onClose }) => {
  const { selectedDimensions, getTotalScore, scores, allAnswers, getQuestionWeights } = useDimension()
  const [viewMode, setViewMode] = useState<'treemap' | 'sunburst'>('treemap')
  const [showTextReport, setShowTextReport] = useState(false)
  const chartRef = useRef<any>(null)

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
      'violet-innovation': violetInnovationModules,
      'red-performance': redPerformanceModules,
      'white-completeness': whiteCompletenessModules
    }

    // Helper function to calculate question score (now returns 0-100 scale)
    const calculateQuestionScore = (question: any, answer: any, dimId: string, questionId: string): number => {
      if (!answer) return 0

      // Parse JSON strings
      let parsedAnswer = answer
      if (typeof answer === 'string' && (answer.startsWith('[') || answer.startsWith('{'))) {
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

      // Handle multi-reagent type (Green Ecology Q3)
      if (question.type === 'multi-reagent') {
        try {
          // parsedAnswer might already be parsed as array, or still be a string
          let reagents = parsedAnswer
          if (typeof parsedAnswer === 'string') {
            reagents = JSON.parse(parsedAnswer || '[]')
          }
          if (!Array.isArray(reagents) || reagents.length === 0) return 0
          
          let sum = 0
          for (const reagent of reagents) {
            const mass = parseFloat(reagent.mass || '0')
            const hcodes = parseFloat(reagent.hcodes || '0')
            if (!isNaN(mass) && !isNaN(hcodes) && mass >= 0 && hcodes >= 0) {
              sum += mass * Math.pow(hcodes, 2)
            }
          }
          
          return 100 * Math.exp(-1.5 * Math.sqrt(sum))
        } catch {
          return 0
        }
      }

      if (question.type === 'multi-input' && typeof parsedAnswer === 'object') {
        try {
          // Red Performance (Dimension 3)
          if (dimId === 'red-performance') {
            if (questionId === 'q4') {
              const recovery = parseFloat(parsedAnswer.recovery)
              const rsd = parseFloat(parsedAnswer.rsd)
              if (!isNaN(recovery) && !isNaN(rsd) && recovery > 0 && rsd >= 0) {
                const accuracyTerm = Math.exp(-0.5 * Math.pow((recovery - 100) / 3, 2))
                const precisionTerm = 1 / (1 + Math.pow(rsd / 2.5, 2))
                return 100 * accuracyTerm * precisionTerm
              }
            }
            if (questionId === 'q5') {
              const r2 = parseFloat(parsedAnswer.r2)
              const lod = parseFloat(parsedAnswer.lod)
              const creq = parseFloat(parsedAnswer.creq || '1')
              if (!isNaN(r2) && !isNaN(lod) && !isNaN(creq) && r2 >= 0.99 && r2 <= 1.0 && lod >= 0 && creq > 0) {
                const linearityTerm = Math.pow((r2 - 0.99) / 0.0099, 4)
                const sensitivityTerm = Math.cos((Math.PI / 2) * (lod / creq))
                const score = 100 * linearityTerm * sensitivityTerm
                return Math.max(0, score)
              }
            }
          }
          
          // Green Ecology (Dimension 1)
          if (dimId === 'green-ecology') {
            if (questionId === 'q4') {
              const tbp = parseFloat(parsedAnswer.tbp)
              const nhalogen = parseFloat(parsedAnswer.nhalogen)
              const nh = parseFloat(parsedAnswer.nh)
              if (!isNaN(tbp) && !isNaN(nhalogen) && !isNaN(nh)) {
                const sigmoid = 1 / (1 + Math.exp(-0.05 * (tbp - 50)))
                const penalty = Math.exp(-(2 * nhalogen + 0.5 * nh) / 5)
                return 100 * sigmoid * penalty
              }
            }
            if (questionId === 'q5') {
              const power = parseFloat(parsedAnswer.power)
              const time = parseFloat(parsedAnswer.time)
              const throughput = parseFloat(parsedAnswer.throughput)
              if (!isNaN(power) && !isNaN(time) && !isNaN(throughput) && throughput > 0) {
                return 100 * Math.exp(-(power * time) / (10000 * throughput))
              }
            }
            if (questionId === 'q6') {
              const vwaste = parseFloat(parsedAnswer.vwaste)
              const eta = parseFloat(parsedAnswer.eta)
              if (!isNaN(vwaste) && !isNaN(eta) && vwaste >= 0 && eta >= 0 && eta <= 1) {
                const term1 = 1 / (1 + 0.05 * Math.pow(vwaste * (1 - eta), 1.2))
                const term2 = Math.exp(-vwaste / 200)
                return 100 * term1 * term2
              }
            }
          }
          
          // Blue Practicality (Dimension 2)
          if (dimId === 'blue-practicality') {
            if (questionId === 'q3') {
              const cost = parseFloat(parsedAnswer.cost)
              const time = parseFloat(parsedAnswer.time)
              if (!isNaN(cost) && !isNaN(time) && cost >= 0 && time >= 0) {
                const numerator = (cost + 20 * time) / 15
                return 100 / (1 + Math.pow(numerator, 2.5))
              }
            }
            if (questionId === 'q4') {
              const runtime = parseFloat(parsedAnswer.runtime)
              const analytes = parseFloat(parsedAnswer.analytes)
              if (!isNaN(runtime) && !isNaN(analytes) && runtime >= 0 && analytes > 0) {
                const ratio = runtime / analytes
                return 100 / (1 + 0.01 * Math.pow(ratio, 4.5))
              }
            }
            if (questionId === 'q5') {
              const analytes = parseFloat(parsedAnswer.analytes)
              const volume = parseFloat(parsedAnswer.volume)
              if (!isNaN(analytes) && !isNaN(volume) && analytes > 0 && volume >= 0) {
                const nSquared = Math.pow(analytes, 2)
                const denominator = nSquared + Math.log(1 + volume)
                return 100 * nSquared / denominator
              }
            }
          }
          
          // Gray Industry (Dimension 5)
          if (dimId === 'gray-industry') {
            if (questionId === 'q3') {
              const Y = parseFloat(parsedAnswer.Y)
              const A = parseFloat(parsedAnswer.A)
              if (isNaN(Y) || isNaN(A)) return 0
              const sigmoid = 1 / (1 + Math.exp(-12 * (Y - 0.4)))
              const accuracyPenalty = Math.exp(-20 * A * A)
              return 100 * sigmoid * accuracyPenalty
            }
            if (questionId === 'q4') {
              const P = parseFloat(parsedAnswer.P)
              const R = parseFloat(parsedAnswer.R)
              if (isNaN(P) || isNaN(R)) return 0
              const throughputFactor = (P * P) / (P * P + 65)
              const precisionPenalty = Math.exp(-30 * Math.pow(R, 1.5))
              return 100 * throughputFactor * precisionPenalty
            }
            if (questionId === 'q5') {
              const wasteRatio = parseFloat(parsedAnswer.wasteRatio)
              const S = parseFloat(parsedAnswer.S)
              if (isNaN(wasteRatio) || isNaN(S)) return 0
              const minimizationFactor = 1 - wasteRatio
              const sensitivityFactor = 2 / (1 + S * S)
              return 100 * minimizationFactor * sensitivityFactor
            }
          }
          
          // Yellow Society (Dimension 6)
          if (dimId === 'yellow-society') {
            if (questionId === 'q3') {
              const H = parseFloat(parsedAnswer.H)
              const t = parseFloat(parsedAnswer.t)
              if (isNaN(H) || isNaN(t)) return 0
              return 100 * Math.exp(-(H * Math.sqrt(t)) / 40)
            }
            if (questionId === 'q4') {
              const N = parseFloat(parsedAnswer.N)
              const F = parseFloat(parsedAnswer.F)
              if (isNaN(N) || isNaN(F)) return 0
              return 100 * Math.pow(N, 4) / (Math.pow(N, 4) + F)
            }
            if (questionId === 'q5') {
              const T_op = parseFloat(parsedAnswer.T_op)
              const deltaT = parseFloat(parsedAnswer.deltaT)
              if (isNaN(T_op) || isNaN(deltaT)) return 0
              if (deltaT <= 35) return 0
              return 100 * Math.exp(-0.1 * Math.pow(T_op / (deltaT - 35), 2))
            }
          }
          
          // Cyan Data (Dimension 7)
          if (dimId === 'cyan-data') {
            if (questionId === 'q3') {
              const x = parseFloat(parsedAnswer.x)
              const y = parseFloat(parsedAnswer.y)
              if (isNaN(x) || isNaN(y)) return 0
              return 100 * Math.pow(x / 100, 1.5) * Math.exp(-(y * y) / 40)
            }
            if (questionId === 'q4') {
              const x = parseFloat(parsedAnswer.x)
              const y = parseFloat(parsedAnswer.y)
              if (isNaN(x) || isNaN(y)) return 0
              return 100 * Math.sin((Math.PI * x) / 200) * (Math.log(1 + y) / Math.log(13))
            }
            if (questionId === 'q5') {
              const x = parseFloat(parsedAnswer.x)
              const y = parseFloat(parsedAnswer.y)
              if (isNaN(x) || isNaN(y)) return 0
              if (x <= 0) return 0
              return 100 * Math.sqrt(x / 10) * (1 - Math.pow(0.5, y)) * 1.143
            }
          }
          
          // Orange Circular (Dimension 8)
          if (dimId === 'orange-circular') {
            if (questionId === 'q3') {
              const R = parseFloat(parsedAnswer.R)
              const N = parseFloat(parsedAnswer.N)
              if (isNaN(R) || isNaN(N)) return 0
              return 65 * Math.tanh(1.0 * R * Math.log(N + 10)) + 25
            }
            if (questionId === 'q4') {
              const Fb = parseFloat(parsedAnswer.Fb)
              const Tr = parseFloat(parsedAnswer.Tr)
              if (isNaN(Fb) || isNaN(Tr)) return 0
              return (25 + 60 * Math.sqrt(Fb)) * Math.exp(-0.005 * (Tr - 1))
            }
            if (questionId === 'q5') {
              const D28 = parseFloat(parsedAnswer.D28)
              const Hlife = parseFloat(parsedAnswer.Hlife)
              if (isNaN(D28) || isNaN(Hlife)) return 0
              return 60 * Math.sqrt((D28 / 100) * (1 - Hlife / (Hlife + 100))) + 30
            }
          }
          
          // Violet Innovation (Dimension 4)
          if (dimId === 'violet-innovation') {
            if (questionId === 'q3') {
              const vt = parseFloat(parsedAnswer.vt)
              const jp = parseFloat(parsedAnswer.jp)
              if (isNaN(vt) || isNaN(jp)) return 0
              return 100 * (1 - Math.exp(-0.1 * Math.pow(vt, 2) * Math.sqrt(jp + 1)))
            }
            if (questionId === 'q4') {
              const ls = parseFloat(parsedAnswer.ls)
              const dsa = parseFloat(parsedAnswer.dsa)
              if (isNaN(ls) || isNaN(dsa)) return 0
              const product = ls * dsa
              return 100 * Math.pow(product, 2) / (Math.pow(product, 2) + 1.5)
            }
            if (questionId === 'q5') {
              const nr = parseFloat(parsedAnswer.nr)
              const ma = parseFloat(parsedAnswer.ma)
              if (isNaN(nr) || isNaN(ma)) return 0
              const product = nr * ma
              return 100 * Math.sin(Math.PI / 2 * product / (product + 5))
            }
          }
          
          // White Completeness (Dimension 9)
          if (dimId === 'white-completeness') {
            if (questionId === 'q3') {
              const P = parseFloat(parsedAnswer.P)
              const E = parseFloat(parsedAnswer.E)
              if (isNaN(P) || isNaN(E)) return 0
              return 100 * P / (P + 1.3 * Math.pow(E, 0.1))
            }
            if (questionId === 'q4') {
              const Ratio = parseFloat(parsedAnswer.Ratio)
              if (isNaN(Ratio)) return 0
              return 100 * Math.exp(-0.89 * Math.pow(Math.abs(Ratio - 1), 0.25))
            }
            if (questionId === 'q5') {
              const L = parseFloat(parsedAnswer.L)
              const A = parseFloat(parsedAnswer.A)
              if (isNaN(L) || isNaN(A)) return 0
              return 100 * Math.pow(L, 0.5) / (Math.pow(L, 0.5) + 0.2 * Math.pow(A, 1.4))
            }
          }
          
          return 0
        } catch {
          return 0
        }
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

      return 0
    }

    const children = selectedDimensions.map(dimId => {
      const dimension = dimensions.find(d => d.id === dimId)
      const score = scores[dimId] || 0
      const answers = allAnswers[dimId] || {}
      const weights = getQuestionWeights(dimId)
      
      // Get questions for this dimension
      const modules = allModules[dimId as keyof typeof allModules]
      const allQuestions = (modules?.flatMap((m: any) => m.questions) || []) as any[]
      
      // Create children for each question with actual score
      const questionChildren = allQuestions.map((question: any, qIndex: number) => {
        let answer = answers[question.id]
        
        // Parse JSON strings
        if (typeof answer === 'string' && (answer.startsWith('[') || answer.startsWith('{'))) {
          try {
            answer = JSON.parse(answer)
          } catch (e) {
            // Keep as string if parse fails
          }
        }
        
        const questionScore = calculateQuestionScore(question, answer, dimId, question.id)
        const questionWeight = weights[question.id] || (100 / allQuestions.length)
        
        // Format answer for display
        let answerDisplay = 'Not answered'
        if (answer !== undefined && answer !== null && answer !== '') {
          if (Array.isArray(answer)) {
            answerDisplay = answer.length > 0 ? answer.join(', ') : 'Not answered'
          } else if (typeof answer === 'object') {
            // Format object answers (e.g., multi-input fields)
            const entries = Object.entries(answer)
            if (entries.length > 0) {
              answerDisplay = entries.map(([key, value]) => `${key}: ${value}`).join(', ')
            } else {
              answerDisplay = 'Not answered'
            }
          } else {
            answerDisplay = String(answer)
          }
        }

        // Calculate color based on question score (0-100 scale)
        const questionColor = getQuestionScoreColor(questionScore)
        const weightedScore = (questionScore * questionWeight) / 100

        // Handle both data structures: 'question' field (standard) and 'text' field (cyan-data)
        const questionText = question.question || question.text || ''
        const questionId = question.id ? question.id.toUpperCase() : `Q${qIndex + 1}`

        return {
          name: questionId,
          value: questionWeight, // Use weight for proportional size
          itemStyle: {
            color: questionColor
          },
          label: {
            color: dimension?.color || '#fff' // Use dimension theme color for question labels
          },
          dimensionName: dimension?.name || dimId,
          questionText: questionText,
          answerText: answerDisplay,
          actualScore: questionScore,
          questionWeight: questionWeight,
          weightedScore: weightedScore,
          questionIndex: qIndex // Add index to prevent overlap
        }
      })

      // Calculate color based on dimension total score (now 0-100 scale)
      const dimensionColor = getQuestionScoreColor(score)

      // Calculate total weight sum for this dimension (should be 100)
      const totalWeight = questionChildren.reduce((sum, child) => sum + child.value, 0)

      // Create meaningful abbreviation based on pronunciation
      const dimName = dimension?.name || dimId
      const abbreviationMap: { [key: string]: string } = {
        'Ecology': 'Eco',
        'Practicality': 'Prac',
        'Performance': 'Perf',
        'Innovation': 'Inno',
        'Industry': 'Ind',
        'Society': 'Soc',
        'Data': 'Data',
        'Circular': 'Circ',
        'Completeness': 'Comp'
      }
      const abbreviation = abbreviationMap[dimName] || dimName.substring(0, 4)

      return {
        name: abbreviation, // Use abbreviation as name
        fullName: dimName,  // Keep full name for tooltip
        value: totalWeight, // Use total weight (100) for dimension size
        itemStyle: {
          color: dimensionColor,
          borderColor: dimension?.color || '#fff', // Use dimension theme color as border
          borderWidth: 4
        },
        label: {
          color: dimension?.color || '#fff' // Set dimension-specific label color
        },
        children: questionChildren.length > 0 ? questionChildren : undefined,
        dimensionScore: score,
        dimensionMaxScore: 100, // Now using 100-point scale
        themeColor: dimension?.color || '#fff' // Keep for tooltip reference
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
          const displayScore = data.actualScore !== undefined ? data.actualScore : 0
          const weight = data.questionWeight || 0
          const weighted = data.weightedScore !== undefined ? data.weightedScore : 0
          return `<div style="max-width: 400px; padding: 10px; line-height: 1.5; word-wrap: break-word; white-space: normal;">
            <div style="font-weight: bold; color: #60a5fa; margin-bottom: 8px; font-size: 14px;">${data.dimensionName} - ${data.name}</div>
            <div style="margin-bottom: 6px; color: #e5e7eb; word-wrap: break-word;"><strong style="color: #fff;">Question:</strong><br/>${data.questionText}</div>
            <div style="margin-bottom: 4px; color: #fbbf24;"><strong>Weight:</strong> ${weight.toFixed(1)}%</div>
            <div style="font-size: 16px; font-weight: bold; color: #10b981; margin-top: 8px;">Score: ${displayScore.toFixed(1)} / 100</div>
            <div style="font-size: 14px; color: #a78bfa; margin-top: 4px;">Weighted Contribution: ${weighted.toFixed(2)}</div>
          </div>`
        }
        
        // Dimension node
        const displayName = data.fullName || data.name
        return `<div style="padding: 6px;">
          <div style="font-weight: bold; font-size: 15px; margin-bottom: 4px;">${displayName}</div>
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
            // Show dimension name, question ID, weight and score for questions
            if (params.data.dimensionName) {
              const score = params.data.actualScore !== undefined ? params.data.actualScore : 0
              const weight = params.data.questionWeight || 0
              return `${params.data.dimensionName}\n${params.name}\n${score.toFixed(1)}\n(${weight.toFixed(1)}%)`
            }
            // Show just name for dimensions
            return params.name
          },
          color: '#fff',
          fontSize: 12,
          fontWeight: 'bold',
          overflow: 'truncate',
          textBorderColor: 'rgba(0, 0, 0, 0.8)',
          textBorderWidth: 2
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
          const weight = data.questionWeight || 0
          const weighted = data.weightedScore !== undefined ? data.weightedScore : 0
          return `<div style="max-width: 400px; padding: 10px; line-height: 1.5; word-wrap: break-word; white-space: normal;">
            <div style="font-weight: bold; color: #60a5fa; margin-bottom: 8px; font-size: 14px;">${data.dimensionName} - ${data.name}</div>
            <div style="margin-bottom: 6px; color: #e5e7eb; word-wrap: break-word;"><strong style="color: #fff;">Question:</strong><br/>${data.questionText}</div>
            <div style="margin-bottom: 4px; color: #fbbf24;"><strong>Weight:</strong> ${weight.toFixed(1)}%</div>
            <div style="font-size: 16px; font-weight: bold; color: #10b981; margin-top: 8px;">Score: ${displayScore.toFixed(1)} / 100</div>
            <div style="font-size: 14px; color: #a78bfa; margin-top: 4px;">Weighted Contribution: ${weighted.toFixed(2)}</div>
          </div>`
        }
        
        // Dimension node
        const dimScore = data.dimensionScore !== undefined ? data.dimensionScore : info.value
        const dimMaxScore = data.dimensionMaxScore || 100
        const displayName = data.fullName || data.name // Use full name for tooltip
        return `<div style="padding: 8px;">
          <div style="font-weight: bold; font-size: 16px; margin-bottom: 4px; color: #60a5fa;">${displayName}</div>
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
              fontWeight: 'bold'
              // Color is set per-item via data.label.color
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
              rotate: 'radial',
              fontSize: 11,
              fontWeight: 'bold'
              // Color is set per-item via data.label.color
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
    
    // Get all question modules (same as in chartData)
    const allModules = {
      'green-ecology': greenEcologyModules,
      'blue-practicality': bluePracticalityModules,
      'gray-industry': grayIndustryModules,
      'yellow-society': yellowSocietyModules,
      'cyan-data': cyanDataModules,
      'orange-circular': orangeCircularModules,
      'violet-innovation': violetInnovationModules,
      'red-performance': redPerformanceModules,
      'white-completeness': whiteCompletenessModules
    }
    
    const reports = selectedDimensions.map(dimId => {
      const dimension = dimensions.find(d => d.id === dimId)
      const score = scores[dimId] || 0
      const answers = allAnswers[dimId] || {}
      
      // Get actual question count from dimension modules
      const modules = allModules[dimId as keyof typeof allModules]
      const questionCount = modules?.flatMap((m: any) => m.questions).length || 0
      
      const avgScore = questionCount > 0 ? score / questionCount : 0
      
      // Calculate score color based on actual score (100 points per dimension)
      const scoreColor = getQuestionScoreColor(score)

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
              ref={chartRef}
              key={`${viewMode}-${selectedDimensions.join(',')}`}
              option={currentOption}
              style={{ height: '600px', width: '100%' }}
              theme="dark"
              opts={{ renderer: 'svg' }}
              notMerge={true}
              lazyUpdate={true}
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
