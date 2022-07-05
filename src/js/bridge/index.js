const UA = window.navigator.userAgent

let runtime
if (UA.includes('Electron')) {
  runtime = 'electron'
} else {
  runtime = 'browser'
}

let bridge = {
  runtime,
  weight: true,
  mes_app: require('./mes_chrome_app'),
  isElectron: false,
  printer: require('./chrome/printer'),
}

if (runtime === 'electron') {
  bridge = {
    ...bridge,
    printer: require('./electron/printer'),
    relaunch: require('./electron/relaunch'),
    open: require('./electron/open'),
    isElectron: true,
  }
} else {
  bridge = {
    ...bridge,
    open: function (url) {
      window.open(url)
    },
  }
}
export default bridge
