import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { ScannerManager } from './scanner.js';

let mainWindow: BrowserWindow | null = null;
const scanner = new ScannerManager(process.env.BACKEND_URL || 'http://localhost:3000');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 540,
    height: 700,
    minWidth: 480,
    minHeight: 600,
    frame: true,
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadFile(path.join(__dirname, '../src/renderer/index.html'));

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', async () => {
  scanner.stop();
  await scanner.notifyStop();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers
ipcMain.handle('pairing:validate', async (_event, { code, backendUrl }) => {
  const url = backendUrl || 'http://localhost:3000';
  const res = await fetch(`${url}/api/pairing/validate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: code.toUpperCase() }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Invalid or expired pairing code.');
  }

  return await res.json();
});

ipcMain.handle('monitoring:start', async (_event, { sessionId, sessionToken, backendUrl }) => {
  scanner.setSession(sessionId, sessionToken);
  scanner.start(
    (scan) => {
      mainWindow?.webContents.send('scanner:observation', {
        timestamp: scan.timestamp,
        count: scan.observations.length,
        active: scan.observations.find((o) => o.is_active)?.window_title || 'Desktop',
      });
    },
    (err) => {
      mainWindow?.webContents.send('scanner:error', err.message);
    }
  );
  return { status: 'monitoring' };
});

ipcMain.handle('monitoring:stop', async () => {
  scanner.stop();
  await scanner.notifyStop();
  return { status: 'stopped' };
});
