import _ from 'lodash'
import { sendToPrint } from './utils'
const { remote } = window.require('electron')

function getPrinters() {
  return _.map(
    remote.getCurrentWebContents().getPrinters(),
    ({ description, isDefault, name }) => ({
      description,
      isDefault,
      name,
    }),
  )
}

export { getPrinters, sendToPrint }
