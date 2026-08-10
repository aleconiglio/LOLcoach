import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import fs from 'fs';
import http from 'http';

let mainWindow: BrowserWindow | null = null;

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

function startLocalServer(distPath: string): Promise<number> {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let reqPath = req.url || '/';
      if (reqPath.includes('?')) reqPath = reqPath.split('?')[0];

      let filePath = path.join(distPath, reqPath === '/' ? 'index.html' : reqPath);

      if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = path.join(distPath, 'index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';

      fs.readFile(filePath, (err, data) => {
        if (err) {
          res.writeHead(500);
          res.end('Server Error');
        } else {
          res.writeHead(200, { 'Content-Type': contentType });
          res.end(data);
        }
      });
    });

    server.listen(0, '127.0.0.1', () => {
      const address = server.address() as any;
      resolve(address.port);
    });
  });
}

const getSettingsFilePath = () => path.join(app.getPath('userData'), 'settings.json');

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
    error: err?.message || 'Error en auto-updater',
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

async function createWindow() {
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
      webSecurity: false,
    },
  });

  mainWindow.setMenu(null);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    try {
      const primaryDist = path.join(__dirname, '../dist');
      const appDist = path.join(app.getAppPath(), 'dist');
      const distFolder = fs.existsSync(primaryDist) ? primaryDist : appDist;

      const port = await startLocalServer(distFolder);
      await mainWindow.loadURL(`http://127.0.0.1:${port}`);
    } catch (err) {
      console.error('Error starting production local server:', err);
      const primaryPath = path.join(__dirname, '../dist/index.html');
      const appPath = path.join(app.getAppPath(), 'dist', 'index.html');
      const finalPath = fs.existsSync(primaryPath) ? primaryPath : appPath;
      mainWindow.loadFile(finalPath);
    }
  }

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Check for updates 3 seconds after startup if packaged
  if (app.isPackaged) {
    setTimeout(() => {
      autoUpdater.checkForUpdates().catch((err) => {
        console.log('AutoUpdater initial check:', err.message);
      });
    }, 3000);
  }
}

// IPC Handlers
ipcMain.handle('updater:version', () => app.getVersion());

ipcMain.handle('updater:check', async () => {
  try {
    return await autoUpdater.checkForUpdates();
  } catch (err: any) {
    return { error: err.message };
  }
});

ipcMain.handle('updater:quit-and-install', () => {
  autoUpdater.quitAndInstall();
});

ipcMain.handle('settings:get', () => {
  try {
    const filePath = getSettingsFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading settings file:', e);
  }
  return null;
});

ipcMain.handle('settings:save', (_event, settings) => {
  try {
    const filePath = getSettingsFilePath();
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf-8');
    return settings;
  } catch (e) {
    console.error('Error saving settings file:', e);
    return null;
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
