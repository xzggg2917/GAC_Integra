import React, { useState, useEffect } from 'react'
import './MultiReagentInput.css'

interface Reagent {
  mass: string
  hcodes: string
}

interface MultiReagentInputProps {
  value: string
  onChange: (value: string) => void
}

const MultiReagentInput: React.FC<MultiReagentInputProps> = ({ value, onChange }) => {
  const [reagents, setReagents] = useState<Reagent[]>([])

  useEffect(() => {
    try {
      const parsed = JSON.parse(value || '[]')
      if (Array.isArray(parsed) && parsed.length > 0) {
        setReagents(parsed)
      } else {
        setReagents([{ mass: '', hcodes: '' }])
      }
    } catch {
      setReagents([{ mass: '', hcodes: '' }])
    }
  }, [])

  useEffect(() => {
    onChange(JSON.stringify(reagents))
  }, [reagents, onChange])

  const addReagent = () => {
    setReagents([...reagents, { mass: '', hcodes: '' }])
  }

  const removeReagent = (index: number) => {
    if (reagents.length > 1) {
      setReagents(reagents.filter((_, i) => i !== index))
    }
  }

  const updateReagent = (index: number, field: keyof Reagent, value: string) => {
    const updated = [...reagents]
    updated[index][field] = value
    setReagents(updated)
  }

  // Keep for potential future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const calculateScore = () => {
    let sum = 0
    for (const reagent of reagents) {
      const m = parseFloat(reagent.mass || '0')
      const nh = parseFloat(reagent.hcodes || '0')
      if (!isNaN(m) && !isNaN(nh) && m >= 0 && nh >= 0) {
        sum += m * Math.pow(nh, 2)
      }
    }
    return 100 * Math.exp(-1.5 * Math.sqrt(sum))
  }

  return (
    <div className="multi-reagent-input">
      <div className="reagent-list">
        {reagents.map((reagent, index) => (
          <div key={index} className="reagent-entry">
            <div className="reagent-header">
              <span className="reagent-number">Reagent {index + 1}</span>
              {reagents.length > 1 && (
                <button
                  type="button"
                  className="remove-reagent-btn"
                  onClick={() => removeReagent(index)}
                >
                  ✕
                </button>
              )}
            </div>
            <div className="reagent-fields">
              <div className="reagent-field">
                <label>
                  mᵢ (Mass)
                  <span className="field-description">Total mass of reagent i in single experiment</span>
                </label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={reagent.mass}
                    onChange={(e) => updateReagent(index, 'mass', e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder="0.0"
                    min="0"
                    step="any"
                  />
                  <span className="unit">kg</span>
                </div>
              </div>
              <div className="reagent-field">
                <label>
                  N_H,i (H-codes)
                  <span className="field-description">Total number of H-codes on reagent label</span>
                </label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    value={reagent.hcodes}
                    onChange={(e) => updateReagent(index, 'hcodes', e.target.value)}
                    onWheel={(e) => e.currentTarget.blur()}
                    placeholder="0"
                    min="0"
                    step="1"
                  />
                  <span className="unit">count</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button type="button" className="add-reagent-btn" onClick={addReagent}>
        + Add Another Reagent
      </button>
    </div>
  )
}

export default MultiReagentInput
