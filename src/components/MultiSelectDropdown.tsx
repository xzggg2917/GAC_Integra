import React, { useState, useRef, useEffect } from 'react'
import './MultiSelectDropdown.css'

interface Option {
  value: string
  label: string
  score: number
}

interface MultiSelectDropdownProps {
  options: Option[]
  selectedValues: string[]
  onChange: (values: string[]) => void
  placeholder?: string
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  selectedValues,
  onChange,
  placeholder = 'Select options...'
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value]
    onChange(newValues)
  }

  const getDisplayText = () => {
    if (selectedValues.length === 0) return placeholder
    if (selectedValues.length === 1) {
      const option = options.find(opt => opt.value === selectedValues[0])
      return option?.label || ''
    }
    return `${selectedValues.length} items selected`
  }

  return (
    <div className="multi-select-dropdown" ref={dropdownRef}>
      <div className="multi-select-trigger" onClick={() => setIsOpen(!isOpen)}>
        <span className="multi-select-text">{getDisplayText()}</span>
        <span className={`multi-select-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </div>
      
      {isOpen && (
        <div className="multi-select-options">
          {options.map(option => (
            <label key={option.value} className="multi-select-option">
              <input
                type="checkbox"
                checked={selectedValues.includes(option.value)}
                onChange={() => handleToggle(option.value)}
                className="multi-select-checkbox"
              />
              <span className="multi-select-label">
                {option.label} (-{option.score} points)
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  )
}

export default MultiSelectDropdown
