import React from 'react'
import './CloverVisualization.css'

interface Module {
  id: string
  name: string
  score: number
  maxScore: number
}

interface CloverVisualizationProps {
  modules: Module[]
  color?: string
}

const CloverVisualization: React.FC<CloverVisualizationProps> = ({ modules, color = '#6b7280' }) => {
  const getLeafPath = (index: number, percentage: number): string => {
    const angle = (index * 120 - 90) * Math.PI / 180
    const maxRadius = 80
    const radius = (percentage / 100) * maxRadius
    
    const centerX = 150
    const centerY = 150
    
    const tipX = centerX + Math.cos(angle) * radius
    const tipY = centerY + Math.sin(angle) * radius
    
    const leftAngle = angle - Math.PI / 6
    const rightAngle = angle + Math.PI / 6
    const baseRadius = radius * 0.3
    
    const leftX = centerX + Math.cos(leftAngle) * baseRadius
    const leftY = centerY + Math.sin(leftAngle) * baseRadius
    const rightX = centerX + Math.cos(rightAngle) * baseRadius
    const rightY = centerY + Math.sin(rightAngle) * baseRadius
    
    return `M ${centerX} ${centerY} 
            L ${leftX} ${leftY} 
            Q ${tipX} ${tipY} ${rightX} ${rightY} 
            Z`
  }

  const getTextPosition = (index: number): { x: number; y: number } => {
    const angle = (index * 120 - 90) * Math.PI / 180
    const distance = 105
    const centerX = 150
    const centerY = 150
    
    return {
      x: centerX + Math.cos(angle) * distance,
      y: centerY + Math.sin(angle) * distance
    }
  }

  return (
    <div className="clover-container">
      <svg width="300" height="300" viewBox="0 0 300 300">
        {/* Background circles for reference */}
        <circle cx="150" cy="150" r="80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        <circle cx="150" cy="150" r="60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <circle cx="150" cy="150" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <circle cx="150" cy="150" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

        {/* Clover leaves */}
        {modules.slice(0, 3).map((module, index) => {
          const percentage = (module.score / module.maxScore) * 100
          const hue = 120 - (percentage * 0.5) // Green (120) to yellow/red (60-0)
          const color = `hsl(${hue}, 70%, 50%)`
          
          return (
            <g key={module.id}>
              <path
                d={getLeafPath(index, percentage)}
                fill={color}
                fillOpacity="0.7"
                stroke={color}
                strokeWidth="2"
              />
              <text
                x={getTextPosition(index).x}
                y={getTextPosition(index).y}
                textAnchor="middle"
                fill="white"
                fontSize="12"
                fontWeight="600"
              >
                {module.name}
              </text>
              <text
                x={getTextPosition(index).x}
                y={getTextPosition(index).y + 15}
                textAnchor="middle"
                fill="white"
                fontSize="10"
              >
                {module.score.toFixed(1)}/{module.maxScore}
              </text>
            </g>
          )
        })}

        {/* Center circle */}
        <circle cx="150" cy="150" r="15" fill={`${color}CC`} />
        <text
          x="150"
          y="155"
          textAnchor="middle"
          fill="white"
          fontSize="10"
          fontWeight="600"
        >
          {color === '#eab308' ? 'Yellow' : color === '#06b6d4' ? 'Cyan' : color === '#f97316' ? 'Orange' : 'Gray'}
        </text>
      </svg>
    </div>
  )
}

export default CloverVisualization
