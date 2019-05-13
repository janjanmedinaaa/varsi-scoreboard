const { app, BrowserWindow, ipcMain, ipcRenderer } = require('electron')

let scoreboardWindow
let controllerWindow

function createWindow () {
    // Create the browser window.
    scoreboardWindow = new BrowserWindow({ width: 900, height: 700, fullscreen: true })
    controllerWindow = new BrowserWindow({ width: 700, height: 600 })
    
    // Hide Menu
    scoreboardWindow.setMenu(null);

    // and load the index.html of the app.
    scoreboardWindow.loadFile('scoreboard/index.html')
    controllerWindow.loadFile('controller/index.html')

    // Open the DevTools.
    scoreboardWindow.webContents.openDevTools()
    controllerWindow.webContents.openDevTools()

    ipcMain.on('send-data-from-controller-to-scoreboard', (event, arg) => {
        // Request to update the label in the renderer process of the second window
        scoreboardWindow.webContents.send('message-from-controller-to-scoreboard', arg);
    });

    ipcMain.on('send-data-from-scoreboard-to-controller', (event, arg) => {
        // Request to update the label in the renderer process of the second window
        controllerWindow.webContents.send('message-from-scoreboard-to-controller', arg);
    });

    // Emitted when the window is closed.
    scoreboardWindow.on('closed', () => {
        scoreboardWindow = null
        controllerWindow = null
    })

    // Emitted when the window is closed.
    controllerWindow.on('closed', () => {
        scoreboardWindow = null
        controllerWindow = null
    })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
    app.quit()
})

app.on('activate', () => {
    if (win === null) {
        createWindow()
    }
})