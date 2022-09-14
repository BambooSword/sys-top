const { app, Menu, Tray } = require('electron')
const path = require('path')
const log = require('electron-log')
const { ipcMain } = require('electron/main')
const MainWindow = require('./MainWindow')

const Store = require('./Store')
// Set env
process.env.NODE_ENV = 'development'

const isDev = process.env.NODE_ENV !== 'production' ? true : false
const isMac = process.platform === 'darwin' ? true : false

let mainWindow
let tray
// init store & defaults

const store = new Store({
  configName: 'user-settings',
  defaults: {
    settings: {
      cpuOverload: 80,
      alertFrequency: 5,
    },
  },
})

app.on('ready', () => {
  mainWindow = new MainWindow('./app/index.html', isDev)

  mainWindow.webContents.on('dom-ready', () => {
    mainWindow.webContents.send('settings:get', store.get('settings'))
  })

  const mainMenu = Menu.buildFromTemplate(menu)
  Menu.setApplicationMenu(mainMenu)

  mainWindow.on('close', e => {
    if (!app.isQuitting) {
      e.preventDefault()
      mainWindow.hide()
    }
    return true
  })

  const icon = path.join(__dirname, 'assets', 'icons', 'tray_icon.png')
  // create tray
  tray = new Tray(icon)

  tray.on('click', () => {
    if (mainWindow.isVisible() === true) {
      mainWindow.hide()
    } else {
      mainWindow.show()
    }
  })

  tray.on('right-click', () => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Quit',
        click: () => {
          app.isQuitting = true
          app.quit()
        },
      },
    ])
    tray.popUpContextMenu(contextMenu)
  })
  // mainWindow.on('ready', () => (mainWindow = null))
})

const menu = [
  ...(isMac ? [{ role: 'appMenu' }] : []),
  {
    role: 'fileMenu',
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Toggle Navigation',
        click: () => mainWindow.webContents.send('nav:toggle'),
      },
    ],
  },
  ...(isDev
    ? [
        {
          label: 'Developer',
          submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { type: 'separator' },
            { role: 'toggledevtools' },
          ],
        },
      ]
    : []),
]

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})

app.allowRendererProcessReuse = true

// Set settings
ipcMain.on('settings:set', (e, value) => {
  store.set('settings', value)
  mainWindow.webContents.send('settings:get', store.get('settings'))
})
