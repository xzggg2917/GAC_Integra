import React, { useState, useEffect } from 'react'
import './BioRatioInput.css'

interface BioRatioInputProps {
  value: string // JSON string of {m_total: string, m_bio: string}
  onChange: (value: string) => void
}

const BioRatioInput: React.FC<BioRatioInputProps> = ({ value, onChange }) => {
  const [data, setData] = useState<{ m_total: string; m_bio: string }>(() => {
    try {
      const parsed = JSON.parse(value || '{}')
      return {
        m_total: parsed.m_total || '',
        m_bio: parsed.m_bio || ''
      }
    } catch {
      return { m_total: '', m_bio: '' }
    }
  })

  useEffect(() => {
    // Save to parent component
    onChange(JSON.stringify(data))
  }, [data, onChange])

  const handleChange = (field: 'm_total' | 'm_bio', val: string) => {
    setData(prev => ({ ...prev, [field]: val }))
  }

  return (
    <div className="bio-ratio-input">
      <div className="bio-fields">
        <div className="bio-field-group">
          <label>
            m<sub>total_organic</sub> (Total Organic Reagent Mass)
          </label>
          <div className="input-with-unit">
            <input
              type="number"
              value={data.m_total}
              onChange={(e) => handleChange('m_total', e.target.value)}
              onWheel={(e) => e.currentTarget.blur()}
              onKeyDown={(e) => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                  e.preventDefault()
                }
              }}
              placeholder="Enter total organic mass"
              min="0"
              step="0.1"
              className="bio-input"
            />
            <span className="input-unit">g</span>
          </div>
        </div>

        <div className="bio-field-group">
          <label>
            m<sub>bio</sub> (Bio-based Reagent Mass)
          </label>
          <div className="input-with-unit">
            <input
              type="number"
              value={data.m_bio}
              onChange={(e) => handleChange('m_bio', e.target.value)}
              onWheel={(e) => e.currentTarget.blur()}
              onKeyDown={(e) => {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                  e.preventDefault()
                }
              }}
              placeholder="Enter bio-based mass"
              min="0"
              step="0.1"
              className="bio-input"
            />
            <span className="input-unit">g</span>
          </div>
          {data.m_total && data.m_bio && parseFloat(data.m_bio) > parseFloat(data.m_total) && (
            <div className="validation-error">
              ⚠️ Bio-based mass cannot exceed total organic mass
            </div>
          )}
        </div>
      </div>

      <div className="bio-examples">
        <div className="example-title">📖 Indicator Function I<sub>bio,i</sub>:</div>
        <ul className="example-list">
          <li>
            <strong>Bio-based (I = 1):</strong> Label says "Bio-based" or known fermentation source (e.g., bio-ethanol)
          </li>
          <li>
            <strong>Petroleum-based (I = 0):</strong> Petrochemical source (e.g., standard acetonitrile)
          </li>
        </ul>
        <div className="example-note">
          💡 <strong>Fill in:</strong> Enter total organic reagent mass and bio-based reagent mass, system auto-calculates ratio.
        </div>
      </div>
    </div>
  )
}

export default BioRatioInput
