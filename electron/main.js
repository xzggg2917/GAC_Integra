const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Set application language to English
app.commandLine.appendSwitch('lang', 'en-US');

// 获取用户数据目录
const userDataPath = app.getPath('userData');
const autoSaveFilePath = path.join(userDataPath, 'gac-autosave.json');
const lastFilePathStorage = path.join(userDataPath, 'last-file-path.txt');
const appStateStorage = path.join(userDataPath, 'app-state.json');
const currentPageStorage = path.join(userDataPath, 'current-page.json');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: true,
      allowRunningInsecureContent: false
    },
    autoHideMenuBar: true,
    title: 'GAC Integra - Green Analytical Chemistry Integration Platform'
  });

  // 设置Content Security Policy
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;"]
      }
    })
  })

  // 开发环境加载开发服务器，生产环境加载构建后的文件
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// Show confirmation dialog
ipcMain.handle('show-confirm', async (event, options) => {
  try {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    const result = await dialog.showMessageBox(focusedWindow, {
      type: 'question',
      buttons: options.buttons || ['OK', 'Cancel'],
      defaultId: 0,
      cancelId: 1,
      title: options.title || 'Confirm',
      message: options.message || '',
      noLink: true
    });
    
    return { confirmed: result.response === 0 };
  } catch (error) {
    console.error('Show confirm dialog error:', error);
    return { confirmed: false, error: error.message };
  }
});

// Show alert dialog
ipcMain.handle('show-alert', async (event, options) => {
  try {
    const focusedWindow = BrowserWindow.getFocusedWindow()
    await dialog.showMessageBox(focusedWindow, {
      type: options.type || 'info',
      buttons: ['OK'],
      title: options.title || 'Alert',
      message: options.message || '',
      noLink: true
    });
    
    return { success: true };
  } catch (error) {
    console.error('Show alert dialog error:', error);
    return { success: false, error: error.message };
  }
});

// 处理保存文件
ipcMain.handle('save-file', async (event, data) => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      title: 'Save GAC Assessment',
      defaultPath: 'gac-assessment.json',
      filters: [
        { name: 'GAC Assessment Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (filePath) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      return { success: true, filePath };
    }
    return { success: false, cancelled: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 处理打开文件
ipcMain.handle('open-file', async () => {
  try {
    const { filePaths } = await dialog.showOpenDialog({
      title: 'Open GAC Assessment',
      filters: [
        { name: 'GAC Assessment Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (filePaths && filePaths.length > 0) {
      const fileContent = fs.readFileSync(filePaths[0], 'utf-8');
      const data = JSON.parse(fileContent);
      return { success: true, data, filePath: filePaths[0] };
    }
    return { success: false, cancelled: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 自动保存数据
ipcMain.handle('auto-save', async (event, data) => {
  try {
    fs.writeFileSync(autoSaveFilePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Auto-save failed:', error);
    return { success: false, error: error.message };
  }
});

// 自动加载数据（启动时检查上次打开的文件）
ipcMain.handle('auto-load', async () => {
  try {
    const result = { success: true };
    
    console.log('[auto-load] Starting auto-load...');
    console.log('[auto-load] lastFilePathStorage:', lastFilePathStorage);
    
    // 读取上次打开的文件路径
    if (fs.existsSync(lastFilePathStorage)) {
      result.lastFilePath = fs.readFileSync(lastFilePathStorage, 'utf-8').trim();
      console.log('[auto-load] Found last file path:', result.lastFilePath);
      
      // 尝试从该文件加载数据
      if (fs.existsSync(result.lastFilePath)) {
        try {
          const fileContent = fs.readFileSync(result.lastFilePath, 'utf-8');
          result.data = JSON.parse(fileContent);
          console.log('[auto-load] Loaded data from last file');
          console.log('[auto-load] Data keys:', Object.keys(result.data));
          if (result.data.allAnswers) {
            console.log('[auto-load] allAnswers dimensions:', Object.keys(result.data.allAnswers));
          }
        } catch (fileError) {
          console.error('[auto-load] Failed to read last file:', fileError);
        }
      } else {
        console.log('[auto-load] Last file does not exist');
      }
    } else {
      console.log('[auto-load] No last file path saved');
    }
    
    // 读取应用状态
    if (fs.existsSync(appStateStorage)) {
      const stateContent = fs.readFileSync(appStateStorage, 'utf-8');
      const state = JSON.parse(stateContent);
      result.appEntered = state.appEntered || false;
      console.log('[auto-load] Found app state, appEntered:', result.appEntered);
    } else {
      console.log('[auto-load] No app state file found');
    }
    
    // 读取当前页面状态
    if (fs.existsSync(currentPageStorage)) {
      const pageContent = fs.readFileSync(currentPageStorage, 'utf-8');
      result.currentPage = JSON.parse(pageContent);
      console.log('[auto-load] Found current page:', result.currentPage);
    } else {
      console.log('[auto-load] No current page file found');
    }
    
    console.log('[auto-load] Returning result with success:', result.success);
    return result;
  } catch (error) {
    console.error('Auto-load failed:', error);
    return { success: false, error: error.message };
  }
});

// 保存到指定文件
ipcMain.handle('save-to-file', async (event, arg1, arg2) => {
  try {
    console.log('[save-to-file] Called with args:', { arg1Type: typeof arg1, arg2Type: typeof arg2 });
    
    let filePath, data;
    
    // 兼容两种调用方式
    if (typeof arg1 === 'object' && arg1.dimension) {
      console.log('[save-to-file] New format - dimension:', arg1.dimension);
      console.log('[save-to-file] arg1.data exists:', !!arg1.data);
      console.log('[save-to-file] arg1.data.answers:', arg1.data?.answers ? 'exists' : 'undefined');
      console.log('[save-to-file] arg1.data.questionWeights:', arg1.data?.questionWeights ? 'exists' : 'undefined');
      
      // 新方式：{ dimension: 'green-ecology', data: {...} }
      // 这种方式需要先读取当前文件，合并数据后保存
      const currentFilePath = await getCurrentFilePath();
      console.log('[save-to-file] Current file path:', currentFilePath);
      
      if (!currentFilePath) {
        console.error('[save-to-file] No current file path found, creating default file...');
        // 如果没有文件路径，创建一个默认文件
        filePath = path.join(userDataPath, 'gac-default-project.json');
        console.log('[save-to-file] Using default path:', filePath);
        
        // 保存这个路径
        try {
          fs.writeFileSync(lastFilePathStorage, filePath, 'utf-8');
          console.log('[save-to-file] Saved default path to lastFilePathStorage');
        } catch (err) {
          console.error('[save-to-file] Failed to save default path:', err);
        }
      } else {
        filePath = currentFilePath;
      }
      
      // 读取现有数据
      let existingData = {};
      if (fs.existsSync(filePath)) {
        try {
          const fileContent = fs.readFileSync(filePath, 'utf-8');
          existingData = JSON.parse(fileContent);
          console.log('[save-to-file] Loaded existing data, keys:', Object.keys(existingData));
        } catch (err) {
          console.error('[save-to-file] Failed to parse existing file:', err);
        }
      } else {
        console.log('[save-to-file] File does not exist, will create new');
      }
      
      // 合并数据
      const dimensionKey = arg1.dimension;
      
      // 确保基础结构存在
      if (!existingData.allAnswers) existingData.allAnswers = {};
      if (!existingData.questionWeights) existingData.questionWeights = {};
      if (!existingData.scores) existingData.scores = {};
      if (!existingData.questionScores) existingData.questionScores = {};
      
      // 合并当前维度的数据
      existingData.allAnswers[dimensionKey] = arg1.data.answers;
      existingData.questionWeights[dimensionKey] = arg1.data.questionWeights;
      existingData.scores[dimensionKey] = arg1.data.score;
      
      if (arg1.data.questionScores) {
        existingData.questionScores[dimensionKey] = arg1.data.questionScores;
      }
      
      data = existingData;
      
      console.log('[save-to-file] Merged data structure:');
      console.log('[save-to-file] - allAnswers dimensions:', Object.keys(data.allAnswers || {}));
      console.log('[save-to-file] - questionWeights dimensions:', Object.keys(data.questionWeights || {}));
      console.log('[save-to-file] - scores dimensions:', Object.keys(data.scores || {}));
    } else {
      console.log('[save-to-file] Old format - direct file path');
      // 旧方式：(filePath, data)
      filePath = arg1;
      data = arg2;
    }
    
    console.log('[save-to-file] Writing to file:', filePath);
    console.log('[save-to-file] Data defined:', data !== undefined);
    console.log('[save-to-file] Data keys:', data ? Object.keys(data) : 'data is undefined');
    
    if (!data) {
      console.error('[save-to-file] ERROR: data is undefined!');
      return { success: false, error: 'Data is undefined' };
    }
    
    const jsonString = JSON.stringify(data, null, 2);
    console.log('[save-to-file] JSON string length:', jsonString.length);
    
    fs.writeFileSync(filePath, jsonString, 'utf-8');
    console.log('[save-to-file] File saved successfully');
    return { success: true };
  } catch (error) {
    console.error('[save-to-file] Save to file failed:', error);
    return { success: false, error: error.message };
  }
});

// 获取当前文件路径的辅助函数
async function getCurrentFilePath() {
  try {
    if (fs.existsSync(lastFilePathStorage)) {
      return fs.readFileSync(lastFilePathStorage, 'utf-8').trim();
    }
  } catch (error) {
    console.error('Get current file path failed:', error);
  }
  return null;
}

// 保存最后打开的文件路径
ipcMain.handle('save-last-file-path', async (event, filePath) => {
  try {
    fs.writeFileSync(lastFilePathStorage, filePath, 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Save last file path failed:', error);
    return { success: false, error: error.message };
  }
});

// 清除最后打开的文件路径
ipcMain.handle('clear-last-file-path', async () => {
  try {
    if (fs.existsSync(lastFilePathStorage)) {
      fs.unlinkSync(lastFilePathStorage);
    }
    if (fs.existsSync(appStateStorage)) {
      fs.unlinkSync(appStateStorage);
    }
    if (fs.existsSync(currentPageStorage)) {
      fs.unlinkSync(currentPageStorage);
    }
    console.log('[clear-last-file-path] Cleared all saved state');
    return { success: true };
  } catch (error) {
    console.error('Clear last file path failed:', error);
    return { success: false, error: error.message };
  }
});

// 标记应用已进入
ipcMain.handle('mark-app-entered', async () => {
  try {
    const state = { appEntered: true };
    fs.writeFileSync(appStateStorage, JSON.stringify(state), 'utf-8');
    console.log('[mark-app-entered] App state saved to:', appStateStorage);
    console.log('[mark-app-entered] State content:', state);
    return { success: true };
  } catch (error) {
    console.error('Mark app entered failed:', error);
    return { success: false, error: error.message };
  }
});

// 保存当前页面状态
ipcMain.handle('save-current-page', async (event, pageState) => {
  try {
    fs.writeFileSync(currentPageStorage, JSON.stringify(pageState), 'utf-8');
    console.log('[save-current-page] Page state saved:', pageState);
    return { success: true };
  } catch (error) {
    console.error('Save current page failed:', error);
    return { success: false, error: error.message };
  }
});

// 读取指定文件的数据
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(fileContent);
      console.log('[read-file] Data loaded from:', filePath);
      return { success: true, data };
    }
    console.log('[read-file] File not found:', filePath);
    return { success: false, notFound: true };
  } catch (error) {
    console.error('Read file failed:', error);
    return { success: false, error: error.message };
  }
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
