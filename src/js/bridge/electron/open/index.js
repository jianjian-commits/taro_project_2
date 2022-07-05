const { shell } = window.require('electron')

module.exports = function open(url) {
  shell.openExternal(url)
}
