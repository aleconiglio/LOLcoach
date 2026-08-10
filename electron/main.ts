import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import fs from 'fs';

let mainWindow: BrowserWindow | null = null;

const getSettingsFilePath = () => path.join(app.getPath('userData'), 'settings.json');
const getEnvFilePath = () => path.join(process.cwd(), '.env');

// Configure Auto-Updater
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

// Helper to send status to React frontend
function sendUpdaterStatus(data: any) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('updater:status', data);
  }
}

autoUpdater.on('checking-for-update', () => {
  sendUpdaterStatus({ status: 'checking' });
});

autoUpdater.on('update-available', (info) => {
  sendUpdaterStatus({
    status: 'available',
    version: info.version,
    releaseNotes: info.releaseNotes,
  });
});

autoUpdater.on('update-not-available', (info) => {
  sendUpdaterStatus({
    status: 'not-available',
    version: info?.version,
  });
});

autoUpdater.on('error', (err) => {
  sendUpdaterStatus({
    status: 'error',
    error: err?.message || 'Error desconocido en el auto-updater',
  });
});

autoUpdater.on('download-progress', (progressObj) => {
  sendUpdaterStatus({
    status: 'downloading',
    percent: Math.round(progressObj.percent),
    bytesPerSecond: progressObj.bytesPerSecond,
    transferred: progressObj.transferred,
    total: progressObj.total,
  });
});

autoUpdater.on('update-downloaded', (info) => {
  sendUpdaterStatus({
    status: 'downloaded',
    version: info.version,
  });
});

function createWindow() {
  const isDev = !app.isPackaged && process.env.NODE_ENV === 'development';

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 1024,
    minHeight: 700,
    title: 'League of Legends AI Coach Desktop',
    backgroundColor: '#010a13',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  // Remove default menu bar for clean native client look
  mainWindow.setMenu(null);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    const indexPath = path.join(app.getAppPath(), 'dist', 'index.html');
    mainWindow.loadFile(indexPath).catch((err) => {
      console.error('Failed to load index.html:', err);
    });
  }

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
      mainWindow.setAlwaysOnTop(true);
      setTimeout(() => mainWindow?.setAlwaysOnTop(false), 800);
    }
  });

  // Force show window after 1.2s timeout in case ready-to-show is delayed
  setTimeout(() => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
      mainWindow.setAlwaysOnTop(true);
      setTimeout(() => mainWindow?.setAlwaysOnTop(false), 800);
    }
  }, 1200);

  // Open external links in default web browser safely
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

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

// IPC Handler for version check
ipcMain.handle('app:get-version', () => app.getVersion());

// IPC Handlers for Auto-Updater
ipcMain.handle('updater:check', () => {
  return autoUpdater.checkForUpdates().catch((err) => {
    sendUpdaterStatus({ status: 'error', error: err.message });
  });
});

ipcMain.handle('updater:quit-and-install', () => {
  autoUpdater.quitAndInstall(false, true);
});

// IPC Handlers for Persistent Settings
ipcMain.handle('settings:get', () => {
  try {
    const filePath = getSettingsFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read settings file:', err);
  }
  return null;
});

ipcMain.handle('settings:save', (_event, settings) => {
  try {
    const filePath = getSettingsFilePath();
    const existing = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf-8')) : {};
    const updated = { ...existing, ...settings };
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');

    // Also persist to root .env file for Vite fallback
    try {
      const envPath = getEnvFilePath();
      const envContent = `VITE_RIOT_API_KEY=${updated.riotApiKey || ''}\nVITE_GROQ_API_KEY=${updated.groqApiKey || ''}\n`;
      fs.writeFileSync(envPath, envContent, 'utf-8');
    } catch (e) {
      // Ignore env write error if permission denied
    }

    return updated;
  } catch (err) {
    console.error('Failed to save settings file:', err);
    return null;
  }
});

