const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const url = require('url');

const isDev = !app.isPackaged;
let mainWindow;
let staticServer;

function startStaticServer() {
    const outDir = path.join(__dirname, '../out');
    const port = 3001; // use a dedicated port for the bundled app

    staticServer = http.createServer(async (req, res) => {
        try {
            const parsedUrl = url.parse(req.url);
            const sanitizePath = path.normalize(parsedUrl.pathname || '').replace(/^(\.\.[/\\])+/, '');
            let pathname = path.join(outDir, sanitizePath);

            // If directory, serve index.html
            let stat;
            try {
                stat = await fs.promises.stat(pathname);
                if (stat.isDirectory()) {
                    pathname = path.join(pathname, 'index.html');
                }
            } catch {
                // Not found; fall back to SPA index.html
                pathname = path.join(outDir, 'index.html');
            }

            const data = await fs.promises.readFile(pathname);
            const ext = path.parse(pathname).ext;
            const mimeTypes = {
                '.html': 'text/html',
                '.js': 'application/javascript',
                '.css': 'text/css',
                '.json': 'application/json',
                '.png': 'image/png',
                '.jpg': 'image/jpg',
                '.jpeg': 'image/jpeg',
                '.gif': 'image/gif',
                '.svg': 'image/svg+xml',
                '.ico': 'image/x-icon',
                '.woff': 'font/woff',
                '.woff2': 'font/woff2',
                '.ttf': 'font/ttf',
                '.map': 'application/json',
            };
            res.setHeader('Content-Type', mimeTypes[ext] || 'text/plain');
            res.end(data);
        } catch (err) {
            console.error('Static server error:', err);
            res.statusCode = 500;
            res.end('Internal Server Error');
        }
    });

    staticServer.listen(port, () => {
        console.log(`Static server running at http://localhost:${port}`);
    });

    return port;
}

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
        : `http://localhost:${startStaticServer()}`;

    mainWindow.loadURL(startUrl);

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', () => {
    createWindow();
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
    if (staticServer) {
        try {
            staticServer.close();
        } catch (e) {
            console.error('Error closing static server', e);
        }
    }
});
