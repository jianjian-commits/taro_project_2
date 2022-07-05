import _ from 'lodash'
import { mmToPx } from './util'
import { paintBlock, paintCounter, paintTable, paintPseudoTable } from './paint'

const generateHeader = (header, data, opts) => {
  return paintBlock(header, data, { ...opts, target: 'header' })
}

const generateContents = (contents, data, opts) => {
  let configs = []
  let sheetDatas = []
  _.each(contents, (content, index) => {
    let c = null
    const id = `content_${index}`
    if (content.blocks) {
      const counter = _.find(content.blocks, (v) => v.type === 'counter')
      if (counter) {
        c = paintCounter(counter, data, id)
      } else {
        c = paintBlock(content, data, { ...opts, target: id })
      }
    } else if (content.type === 'table') {
      const list = data._table[content.dataKey] || data._table.orders
      const special = _.find(list, (column) => column._special)
      if (special) {
        c = paintPseudoTable(content, data, { ...opts, target: id })
      } else {
        c = paintTable(content, data, { ...opts, target: id })
      }
    }

    if (c) {
      configs = configs.concat(_.isArray(c.config) ? c.config : [c.config])
      sheetDatas = sheetDatas.concat(
        _.isArray(c.sheetData) ? c.sheetData : [c.sheetData],
      )
    }
  })
  return {
    configs,
    sheetDatas,
  }
}
const generateSign = (sign, data, opts) => {
  return paintBlock(sign, data, {
    opts,
    target: 'sign',
  })
}

const generateConfigAndData = (data, template) => {
  let config = [
    // global
    {
      type: 'style',
      colWidth: 12,
      rowHeight: 20,
    },
  ]
  let sheetDatas = []
  const { page, contents, sign, header } = template
  const opts = {
    pageWidth: mmToPx(page.size.width),
  }

  /**
   * header
   */
  const _h = generateHeader(header, data, opts)
  /**
   * contents
   */
  const _cs = generateContents(contents, data, opts)

  /**
   * sign
   */
  const _s = generateSign(sign, data, opts)
  config = config.concat([_h?.config, ..._cs.configs, _s?.config])
  sheetDatas = sheetDatas.concat([
    _h?.sheetData,
    ..._cs.sheetDatas,
    _s?.sheetData,
  ])
  return {
    config: _.filter(config, (_) => _),
    sheetDatas: _.filter(sheetDatas, (_) => _),
  }
}

/**
 * @param data
 * @param template
 * {footer: {blocks: [], style: {}}, contents: [], name: '', header: {blocks: [], style: {}}, sign: {blocks:[], style: {}}}
 */
export const parseTemplate = (data, template) => {
  return generateConfigAndData(data, template)
}
