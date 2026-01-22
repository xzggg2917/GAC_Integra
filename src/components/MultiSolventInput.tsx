import React, { useState, useEffect } from 'react'
import './MultiSolventInput.css'

interface SolventEntry {
  id: string
  phi: string
  ncodes: string
}

interface MultiSolventInputProps {
  value: string // JSON string of solvent entries
  onChange: (value: string) => void
  alpha: number
}

const MultiSolventInput: React.FC<MultiSolventInputProps> = ({ value, onChange, alpha: _alpha }) => {
  const [solvents, setSolvents] = useState<SolventEntry[]>(() => {
    try {
      const parsed = JSON.parse(value || '[]')
      return parsed.length > 0 ? parsed : [{ id: Date.now().toString(), phi: '', ncodes: '' }]
    } catch {
      return [{ id: Date.now().toString(), phi: '', ncodes: '' }]
    }
  })

  useEffect(() => {
    // Save to parent component
    onChange(JSON.stringify(solvents))
  }, [solvents, onChange])

  const addSolvent = () => {
    setSolvents([...solvents, { id: Date.now().toString(), phi: '', ncodes: '' }])
  }

  const removeSolvent = (id: string) => {
    if (solvents.length > 1) {
      setSolvents(solvents.filter(s => s.id !== id))
    }
  }

  const updateSolvent = (id: string, field: 'phi' | 'ncodes', value: string) => {
    setSolvents(solvents.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ))
  }

  return (
    <div className="multi-solvent-input">
      <div className="solvent-list">
        {solvents.map((solvent, index) => (
          <div key={solvent.id} className="solvent-entry">
            <div className="solvent-label">Solvent {index + 1}</div>
            <div className="solvent-fields">
              <div className="field-group">
                <label>φ<sub>{index + 1}</sub> (Volume Fraction)</label>
                <input
                  type="number"
                  value={solvent.phi}
                  onChange={(e) => updateSolvent(solvent.id, 'phi', e.target.value)}
                  onWheel={(e) => e.currentTarget.blur()}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                      e.preventDefault()
                    }
                  }}
                  placeholder="0.0 - 1.0"
                  min="0"
                  max="1"
                  step="0.01"
                  className="solvent-input"
                />
              </div>
              <div className="field-group">
                <label>N<sub>codes,{index + 1}</sub> (H-codes Count)</label>
                <input
                  type="number"
                  value={solvent.ncodes}
                  onChange={(e) => updateSolvent(solvent.id, 'ncodes', e.target.value)}
                  onWheel={(e) => e.currentTarget.blur()}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                      e.preventDefault()
                    }
                  }}
                  placeholder="Number of H-codes"
                  min="0"
                  step="1"
                  className="solvent-input"
                />
              </div>
              {solvents.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSolvent(solvent.id)}
                  className="remove-solvent-btn"
                  title="Remove this solvent"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <button
        type="button"
        onClick={addSolvent}
        className="add-solvent-btn"
      >
        + Add Another Solvent
      </button>
    </div>
  )
}

export default MultiSolventInput
