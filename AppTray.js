const { app, Menu, Tray } = require('electron')

// [we do not support extending built in classes in Electron](https://github.com/electron/electron/issues/25721)
class AppTray {
  constructor(icon, mainWindow) {
    this.tray = new Tray(icon)
    this.mainWindow = mainWindow
    this.tray.setToolTip('SysTop')

    this.tray.on('click', this.onClick.bind(this))
    this.tray.on('right-click', () => this.onRightClick())
  }
  onClick() {
    if (this.mainWindow.isVisible() === true) {
      this.mainWindow.hide()
    } else {
      this.mainWindow.show()
    }
  }
  onRightClick() {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Quit',
        click: () => {
          app.isQuitting = true
          app.quit()
        },
      },
    ])
    this.tray.popUpContextMenu(contextMenu)
  }
}

module.exports = { AppTray }
