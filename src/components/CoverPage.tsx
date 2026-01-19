import React from 'react'
import './CoverPage.css'

const { ipcRenderer } = window.require('electron')

interface CoverPageProps {
  onNewProject: () => void
  onOpenProject: (data: any, filePath: string) => void
}

const CoverPage: React.FC<CoverPageProps> = ({ onNewProject, onOpenProject }) => {
  const handleNewProject = () => {
    onNewProject()
  }

  const handleOpenProject = async () => {
    try {
      const result = await ipcRenderer.invoke('open-file')
      if (result.success && result.data) {
        onOpenProject(result.data, result.filePath)
      }
    } catch (error) {
      console.error('Failed to open project:', error)
    }
  }
  return (
    <div className="cover-page">
      <div className="cover-content">
        <div className="logo-container">
          {/* Logo占位符 - 使用化学元素图标 */}
          <div className="logo-placeholder">
            <svg viewBox="0 0 200 200" className="logo-svg">
              {/* 绿色化学符号 */}
              <circle cx="100" cy="100" r="80" fill="url(#gradient1)" opacity="0.2"/>
              <circle cx="70" cy="80" r="25" fill="#10b981" opacity="0.8"/>
              <circle cx="130" cy="80" r="25" fill="#3b82f6" opacity="0.8"/>
              <circle cx="100" cy="130" r="25" fill="#a78bfa" opacity="0.8"/>
              <line x1="85" y1="90" x2="115" y2="90" stroke="#60a5fa" strokeWidth="4"/>
              <line x1="115" y1="95" x2="105" y2="115" stroke="#60a5fa" strokeWidth="4"/>
              <line x1="85" y1="95" x2="95" y2="115" stroke="#60a5fa" strokeWidth="4"/>
              <defs>
                <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <h1 className="cover-title">GAC Integra</h1>
        <p className="cover-subtitle">Green Analytical Chemistry Integration Platform</p>
        <p className="cover-description">
          Comprehensive Assessment Platform for Green Analytical Chemistry
          <br />
          Multi-dimensional Evaluation & Analysis Tool
        </p>

        <div className="action-buttons">
          <button className="action-button new-project-button" onClick={handleNewProject}>
            <span className="button-icon">📝</span>
            <span className="button-text">New Project</span>
          </button>
          <button className="action-button open-project-button" onClick={handleOpenProject}>
            <span className="button-icon">📂</span>
            <span className="button-text">Open Project</span>
          </button>
        </div>

        <div className="cover-footer">
          <div className="feature-list">
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Multi-dimensional Assessment</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🎯</span>
              <span>Smart Analysis</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💾</span>
              <span>Data Storage</span>
            </div>
          </div>
        </div>
      </div>

      <div className="background-animation">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>
    </div>
  )
}

export default CoverPage
