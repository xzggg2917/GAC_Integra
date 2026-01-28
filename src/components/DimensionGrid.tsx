import React from 'react'
import { dimensions } from '../data/algorithms'
import { useDimension } from '../context/DimensionContext'
import { getQuestionScoreColor } from '../utils/colorUtils'
import './DimensionGrid.css'

const { ipcRenderer } = window.require('electron')

interface DimensionGridProps {
  onDimensionClick: (dimensionId: string) => void
  onVisualize: () => void
}

const DimensionGrid: React.FC<DimensionGridProps> = ({ onDimensionClick, onVisualize }) => {
  const { getWeight, scores, getTotalWeight } = useDimension()

  const handleVisualize = async () => {
    const totalWeight = getTotalWeight()
    
    // Check if total weight is exactly 100%
    if (Math.abs(totalWeight - 100) > 0.01) {
      await ipcRenderer.invoke('show-alert', {
        type: 'warning',
        title: 'Weight Validation Failed',
        message: `The total weight of selected dimensions must equal 100%.\n\nCurrent total: ${totalWeight.toFixed(1)}%\n\nPlease adjust the weights in the "Custom Weights" section above.`
      })
      return
    }
    
    onVisualize()
  }

  return (
    <div className="grid-container">
      <div className="dimension-grid">
        {dimensions.map((dimension) => {
          const weight = getWeight(dimension.id)
          const score = scores[dimension.id] || 0
          const cardColor = getQuestionScoreColor(score)
          const hasQuestions = ['green-ecology', 'blue-practicality', 'red-performance', 'white-completeness', 'gray-industry', 'yellow-society', 'cyan-data', 'orange-circular', 'violet-innovation'].includes(dimension.id)

          return (
            <div 
              key={dimension.id} 
              className={`dimension-card ${hasQuestions ? 'clickable' : ''}`}
              style={{ borderColor: cardColor }}
              onClick={() => hasQuestions && onDimensionClick(dimension.id)}
            >
              <div className="dimension-header">
                <div 
                  className="dimension-icon"
                  style={{ backgroundColor: cardColor }}
                >
                  <span className="dimension-initial">
                    {dimension.name.split(' ')[0].substring(0, 2)}
                  </span>
                </div>
                <div className="dimension-title-group">
                  <h3 className="dimension-title">{dimension.name}</h3>
                  <p className="dimension-role">{dimension.role}</p>
                </div>
              </div>
              
              <div className="dimension-content">
                <p className="dimension-description">{dimension.description}</p>
                
                <div className="dimension-footer">
                  <div className="metric-badge">
                    <span className="metric-label">Weight:</span>
                    <span className="metric-value">{weight.toFixed(1)}%</span>
                  </div>
                  <div className="metric-badge score-badge">
                    <span className="metric-label">Score:</span>
                    <span className="metric-value">{score.toFixed(1)}</span>
                  </div>
                </div>
              </div>
              
              {hasQuestions && (
                <div className="card-overlay">
                  <span className="overlay-text">Click to Answer Questions →</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
      
      <div className="visualization-button-container">
        <button className="visualization-button" onClick={handleVisualize}>
          <span className="viz-icon">📊</span>
          <span className="viz-text">View Results Visualization</span>
          <span className="viz-arrow">→</span>
        </button>
      </div>
    </div>
  )
}

export default DimensionGrid
