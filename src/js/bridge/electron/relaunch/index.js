const { remote } = window.require('electron')

module.exports = function relaunch() {
  remote.app.relaunch()
  remote.app.exit(0)
}
