import React, { useState } from 'react'
import { dimensions } from '../data/algorithms'
import { useDimension } from '../context/DimensionContext'
import './InputPanel.css'

const { ipcRenderer } = window.require('electron')

const InputPanel: React.FC = () => {
  const {
    selectedDimensions,
    setSelectedDimensions,
    customWeights,
    setCustomWeights,
    getTotalWeight,
    getTotalScore
  } = useDimension()

  const handleDimensionToggle = (dimensionId: string) => {
    setSelectedDimensions(
      selectedDimensions.includes(dimensionId) 
        ? selectedDimensions.filter(id => id !== dimensionId)
        : [...selectedDimensions, dimensionId]
    )
  }

  const handleWeightChange = (dimensionId: string, weight: string) => {
    const numWeight = parseFloat(weight)
    if (!isNaN(numWeight) && numWeight >= 0 && numWeight <= 100) {
      setCustomWeights({ ...customWeights, [dimensionId]: numWeight })
    }
  }

  return (
    <div className="input-panel">
      <div className="input-section">
        <label className="input-label">Selected Dimensions</label>
        <div className="dimension-selector">
          {dimensions.map(dim => (
            <button
              key={dim.id}
              className={`dimension-chip ${selectedDimensions.includes(dim.id) ? 'selected' : ''}`}
              onClick={() => handleDimensionToggle(dim.id)}
              style={{ 
                borderColor: selectedDimensions.includes(dim.id) ? dim.color : 'rgba(255,255,255,0.2)',
                backgroundColor: selectedDimensions.includes(dim.id) ? `${dim.color}20` : 'transparent'
              }}
            >
              {dim.name}
            </button>
          ))}
        </div>
      </div>

      <div className="input-section">
        <label className="input-label">Custom Weights (%)</label>
        <div className="weight-inputs">
          {dimensions.map(dim => (
            <div key={dim.id} className="weight-input-group">
              <span className="dimension-name">{dim.name}</span>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={customWeights[dim.id] || dim.defaultWeight}
                onChange={(e) => handleWeightChange(dim.id, e.target.value)}
                className="weight-input"
                disabled={!selectedDimensions.includes(dim.id)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="input-section total-section">
        <label className="input-label">Total Weight</label>
        <div className="total-weight">
          {getTotalWeight().toFixed(1)}%
        </div>
        
        <label className="input-label total-score-label">Total Score</label>
        <div className="total-score">
          {getTotalScore().toFixed(1)}
        </div>
      </div>
    </div>
  )
}

export default InputPanel
