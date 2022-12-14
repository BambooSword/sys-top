const path = require('path')
const { ipcRenderer } = require('electron')
const osu = require('node-os-utils')
const cpu = osu.cpu
const mem = osu.mem
const os = osu.os

let cpuOverload
let alertFrequency

// get settings & values
ipcRenderer.on('settings:get', (e, settings) => {
  cpuOverload = +settings.cpuOverload
  alertFrequency = +settings.alertFrequency
})

// Run every 2 seconds
setInterval(() => {
  // cpu usage
  cpu.usage().then(info => {
    document.getElementById('cpu-usage').innerText = info + '%'

    document.getElementById('cpu-progress').style.width = info + '%'

    // Make progress bar red if overload
    if (info > cpuOverload) {
      document.getElementById('cpu-progress').style.background = 'red'
    } else {
      document.getElementById('cpu-progress').style.background = '#30c88b'
    }

    // Check overload
    if (info >= cpuOverload && runNotify(alertFrequency)) {
      notifyUser({
        title: 'CPU overload',
        body: `CPU is over ${cpuOverload}%`,
        icon: path.join(__dirname, 'img', 'icon.png'),
      })
      localStorage.setItem('lastNotify', +new Date())
    }
  })
  cpu.free().then(info => {
    document.getElementById('cpu-free').innerText = info + '%'
  })

  // uptime
  document.getElementById('sys-uptime').innerHTML = secondsToDhms(os.uptime())
}, 2000)

// set model
document.getElementById('cpu-model').innerHTML = cpu.model()

// computer name
document.getElementById('comp-name').innerHTML = os.hostname()

// os
document.getElementById('os').innerText = `${os.type()} ${os.arch()}`

// Total mem
mem.info().then(info => {
  console.log(info, '<== mem info')
  document.getElementById('mem-total').innerText = info.totalMemMb
})

// show days, hours, mins, seconds

function secondsToDhms(seconds) {
  seconds = +seconds
  const d = Math.floor(seconds / (3600 * 24))
  const h = Math.floor((seconds % (3600 * 24)) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)

  return `${d}天 ${h}小时 ${m}分 ${s}秒`
}

// send notification

function notifyUser(options) {
  new Notification(options.title, options)
}

// Check how much time has passed since notification
function runNotify(frequency) {
  if (localStorage.getItem('lastNotify') === null) {
    localStorage.setItem('lastNotify', +new Date())
    return true
  }
  const notifyTime = new Date(parseInt(localStorage.getItem('lastNotify')))
  const now = new Date()
  const diffTime = Math.abs(now - notifyTime)
  const minutesPassed = Math.ceil(diffTime / (1000 * 60))
  if (minutesPassed > frequency) {
    return true
  }
  return false
}
