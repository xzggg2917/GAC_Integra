import React, { useState } from 'react'
import DimensionGrid from './components/DimensionGrid'
import InputPanel from './components/InputPanel'
import QuestionPage from './components/QuestionPage'
import QuestionPageYellow from './components/QuestionPageYellow'
import QuestionPageCyan from './components/QuestionPageCyan'
import QuestionPageOrange from './components/QuestionPageOrange'
import QuestionPageViolet from './components/QuestionPageViolet'
import QuestionPageGreen from './components/QuestionPageGreen'
import QuestionPageBlue from './components/QuestionPageBlue'
import QuestionPageRed from './components/QuestionPageRed'
import QuestionPageWhite from './components/QuestionPageWhite'
import CoverPage from './components/CoverPage'
import VisualizationPage from './components/VisualizationPage'
import { DimensionProvider, useDimension } from './context/DimensionContext'
import './App.css'

const { ipcRenderer } = window.require('electron')

function MainContent({ setActiveDimension, setShowVisualization }: { setActiveDimension: (dim: string | null) => void, setShowVisualization: (show: boolean) => void }) {
  const { getAllData, loadAllData, getCurrentFilePath, setCurrentFilePath } = useDimension()
  const [saveStatus, setSaveStatus] = useState<string>('')
  const currentFile = getCurrentFilePath()

  const handleSave = async () => {
    try {
      setSaveStatus('Saving...')
      const data = getAllData()
      const result = await ipcRenderer.invoke('save-file', data)
      
      if (result.success) {
        setCurrentFilePath(result.filePath)
        setSaveStatus('✓ Saved')
        setTimeout(() => setSaveStatus(''), 3000)
      } else if (result.cancelled) {
        setSaveStatus('')
      } else {
        setSaveStatus('✗ Failed')
        setTimeout(() => setSaveStatus(''), 3000)
      }
    } catch (error) {
      setSaveStatus('✗ Failed')
      setTimeout(() => setSaveStatus(''), 3000)
    }
  }

  const handleOpen = async () => {
    try {
      setSaveStatus('Opening...')
      const result = await ipcRenderer.invoke('open-file')
      
      if (result.success) {
        loadAllData(result.data)
        setCurrentFilePath(result.filePath)
        setSaveStatus('✓ Loaded')
        setTimeout(() => setSaveStatus(''), 3000)
      } else if (result.cancelled) {
        setSaveStatus('')
      } else {
        setSaveStatus('✗ Failed')
        setTimeout(() => setSaveStatus(''), 3000)
      }
    } catch (error) {
      setSaveStatus('✗ Failed')
      setTimeout(() => setSaveStatus(''), 3000)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <h1>GAC Integra</h1>
            <p className="subtitle">Green Analytical Chemistry Integration Platform</p>
            {currentFile && <p className="current-file">📄 {currentFile.split('\\').pop()?.split('/').pop()}</p>}
          </div>
          <div className="header-actions">
            <button className="file-button save-button" onClick={handleSave}>
              💾 Save As...
            </button>
            <button className="file-button open-button" onClick={handleOpen}>
              📂 Open File
            </button>
          </div>
        </div>
        {saveStatus && <div className="save-status-header">{saveStatus}</div>}
      </header>
      <InputPanel />
      <DimensionGrid onDimensionClick={setActiveDimension} onVisualize={() => setShowVisualization(true)} />
    </div>
  )
}

function AppContent() {
  const { 
    loadAllData, 
    setCurrentFilePath, 
    createNewProject, 
    hasEnteredApp, 
    markAppEntered, 
    isLoading,
    currentPage,
    setCurrentPage
  } = useDimension()

  const handleNewProject = async () => {
    // 创建新项目时，立即提示用户选择保存位置
    try {
      const result = await ipcRenderer.invoke('save-file', {
        selectedDimensions: [],
        customWeights: {},
        scores: {},
        allAnswers: {}
      })
      
      if (result.success && result.filePath) {
        createNewProject()
        setCurrentFilePath(result.filePath)
        markAppEntered()
        setCurrentPage({ type: 'dashboard' })
      } else if (result.cancelled) {
        // 用户取消了，不进入应用
        return
      }
    } catch (error) {
      console.error('Failed to create new project:', error)
    }
  }

  const handleOpenProject = (data: any, filePath: string) => {
    loadAllData(data)
    setCurrentFilePath(filePath)
    markAppEntered()
    setCurrentPage({ type: 'dashboard' })
  }

  const handleDimensionClick = (dimensionId: string) => {
    setCurrentPage({ type: 'dimension', dimensionId })
  }

  const handleCloseQuestion = () => {
    setCurrentPage({ type: 'dashboard' })
  }

  const handleShowVisualization = () => {
    setCurrentPage({ type: 'visualization' })
  }

  const handleCloseVisualization = () => {
    setCurrentPage({ type: 'dashboard' })
  }

  // 在数据加载期间显示加载画面
  if (isLoading) {
    return (
      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Loading...</h2>
        </div>
      </div>
    )
  }

  // 数据加载完成后，检查是否需要显示封面页
  if (!hasEnteredApp()) {
    return (
      <CoverPage 
        onNewProject={handleNewProject}
        onOpenProject={handleOpenProject}
      />
    )
  }

  // 根据当前页面状态渲染对应组件
  if (currentPage.type === 'visualization') {
    return <VisualizationPage onClose={handleCloseVisualization} />
  }

  if (currentPage.type === 'dimension' && currentPage.dimensionId) {
    if (currentPage.dimensionId === 'green-ecology') {
      return <QuestionPageGreen onClose={handleCloseQuestion} />
    }
    if (currentPage.dimensionId === 'blue-practicality') {
      return <QuestionPageBlue onClose={handleCloseQuestion} />
    }
    if (currentPage.dimensionId === 'red-performance') {
      return <QuestionPageRed onClose={handleCloseQuestion} />
    }
    if (currentPage.dimensionId === 'white-completeness') {
      return <QuestionPageWhite onClose={handleCloseQuestion} />
    }
    if (currentPage.dimensionId === 'gray-industry') {
      return <QuestionPage onClose={handleCloseQuestion} />
    }
    if (currentPage.dimensionId === 'yellow-society') {
      return <QuestionPageYellow onClose={handleCloseQuestion} />
    }
    if (currentPage.dimensionId === 'cyan-data') {
      return <QuestionPageCyan onClose={handleCloseQuestion} />
    }
    if (currentPage.dimensionId === 'orange-circular') {
      return <QuestionPageOrange onClose={handleCloseQuestion} />
    }
    if (currentPage.dimensionId === 'violet-innovation') {
      return <QuestionPageViolet onClose={handleCloseQuestion} />
    }
  }

  // 默认显示主页面
  return (
    <MainContent setActiveDimension={handleDimensionClick} setShowVisualization={handleShowVisualization} />
  )
}

function App() {
  return (
    <DimensionProvider>
      <AppContent />
    </DimensionProvider>
  )
}

export default App
