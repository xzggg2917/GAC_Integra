const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

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
      contextIsolation: false
    },
    autoHideMenuBar: true,
    title: 'GAC Integra - Green Analytical Chemistry Integration Platform'
  });

  // 开发环境加载开发服务器，生产环境加载构建后的文件
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

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
    
    // 读取上次打开的文件路径
    if (fs.existsSync(lastFilePathStorage)) {
      result.lastFilePath = fs.readFileSync(lastFilePathStorage, 'utf-8').trim();
      console.log('[auto-load] Found last file path:', result.lastFilePath);
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
    
    console.log('[auto-load] Returning result:', result);
    return result;
  } catch (error) {
    console.error('Auto-load failed:', error);
    return { success: false, error: error.message };
  }
});

// 保存到指定文件
ipcMain.handle('save-to-file', async (event, filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Save to file failed:', error);
    return { success: false, error: error.message };
  }
});

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
