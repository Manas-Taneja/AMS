const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const isDev = !app.isPackaged;

let mainWindow;
let backendProcess;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    });

    const startUrl = isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../out/index.html')}`;

    mainWindow.loadURL(startUrl);

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function startBackend() {
    let backendPath;
    let venvPython;

    if (isDev) {
        backendPath = path.join(__dirname, '../../backend');
        venvPython = path.join(__dirname, '../../venv/bin/python');
    } else {
        // In production, resources are in resources/backend and resources/venv
        // process.resourcesPath points to the resources directory
        backendPath = path.join(process.resourcesPath, 'backend');
        venvPython = path.join(process.resourcesPath, 'venv/bin/python');
    }

    console.log('Starting backend from:', backendPath);
    console.log('Using python:', venvPython);

    backendProcess = spawn(venvPython, ['-m', 'uvicorn', 'main:app', '--host', '127.0.0.1', '--port', '8000'], {
        cwd: backendPath,
        stdio: 'inherit' // Pipe output to parent process
    });

    backendProcess.on('error', (err) => {
        console.error('Failed to start backend process:', err);
    });

    backendProcess.on('exit', (code, signal) => {
        console.log(`Backend process exited with code ${code} and signal ${signal}`);
    });
}

app.on('ready', () => {
    startBackend();
    // Give backend a moment to start
    setTimeout(createWindow, 1000);
});

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

app.on('will-quit', () => {
    if (backendProcess) {
        console.log('Killing backend process...');
        backendProcess.kill();
    }
});
