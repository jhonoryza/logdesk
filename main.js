// Modules to control application life and create native browser window
const { app, shell, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { electronApp, optimizer } = require('@electron-toolkit/utils')

let mainWindow

// start express js logic
const express = require('express')
const bodyParser = require('body-parser')

const expressApp = express()
const port = 33555

expressApp.use(bodyParser.json())
expressApp.use(express.static(__dirname + '/public'))

expressApp.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'))
})

expressApp.post('/api/echo', (req, res) => {
  const receivedData = req.body
  console.log(receivedData)
  mainWindow.webContents.send('echo', { data: receivedData.payloads })

  res.json({ message: 'OK' })
})

expressApp.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
// end express js logic

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux'
      ? {
          icon: path.join(__dirname, '../resources/icon.png')
        }
      : {}),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // and load the index.html of the app.
  // mainWindow.loadFile(path.join(__dirname, 'index.html'))
  mainWindow.loadURL(`http://localhost:${port}`)
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()
  ipcMain.on('toggle:top', function (event, value) {
    mainWindow.setAlwaysOnTop(value)
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  // if (process.platform !== 'darwin') {
  app.quit()
  // }
})

// code. You can also put them in separate files and require them here.
