import { Storage } from '@gmfe/react'
import { t } from 'gm-i18n'
import { getCSS } from 'gm-printer'
const { ipcRenderer } = window.require('electron')
const css = getCSS()
// 发送打印数据
const sendToPrint = ({ htmlString, cssString = css, ...rest }) => {
  const printerName = Storage.get('PRINTER_NAME_KEY')
  if (!printerName) {
    window.alert(t('还没有设定打印机，请设定'))
    return
  }
  const printParam = {
    ...rest,
    content: htmlString || '<div>hello world</div>',
    printerName,
    cssString,
  }
  // 客户端监听了 'print' 事件，然后转发给打印模板的 window
  ipcRenderer.send('print', printParam)
}

export { sendToPrint }
