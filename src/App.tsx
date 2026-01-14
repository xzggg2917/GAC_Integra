import React, { useState } from 'react'
import DimensionGrid from './components/DimensionGrid'
import InputPanel from './components/InputPanel'
import QuestionPage from './components/QuestionPage'
import QuestionPageYellow from './components/QuestionPageYellow'
import QuestionPageCyan from './components/QuestionPageCyan'
import QuestionPageOrange from './components/QuestionPageOrange'
import { DimensionProvider } from './context/DimensionContext'
import './App.css'

function App() {
  const [activeDimension, setActiveDimension] = useState<string | null>(null)

  return (
    <DimensionProvider>
      {activeDimension === 'gray-industry' ? (
        <QuestionPage onClose={() => setActiveDimension(null)} />
      ) : activeDimension === 'yellow-society' ? (
        <QuestionPageYellow onClose={() => setActiveDimension(null)} />
      ) : activeDimension === 'cyan-data' ? (
        <QuestionPageCyan onClose={() => setActiveDimension(null)} />
      ) : activeDimension === 'orange-circular' ? (
        <QuestionPageOrange onClose={() => setActiveDimension(null)} />
      ) : (
        <div className="app">
          <header className="app-header">
            <h1>GAC Integra</h1>
            <p className="subtitle">Green Analytical Chemistry Integration Platform</p>
          </header>
          <InputPanel />
          <DimensionGrid onDimensionClick={setActiveDimension} />
        </div>
      )}
    </DimensionProvider>
  )
}

export default App
