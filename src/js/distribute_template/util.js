import { i18next } from 'gm-i18n'
import Big from 'big.js'
import _ from 'lodash'
import { Price } from '@gmfe/react'
import { coverDigit2Uppercase } from '../common/filter'
import { Request } from '@gm-common/request'
import globalStore from '../stores/global'

const defaultFontSize = 10

const printSizeMap = {
  A4: 'A4',
  [i18next.t('二分纸')]: 'A4/2',
  [i18next.t('三分纸')]: 'A4/3',
  [i18next.t('241纸')]: '241',
  [i18next.t('210纸')]: '210',
}

const originalTemplateConfig = {
  address_ids: [],
  name: '',
  print_size: 'A4',
  headerBlockLines: [
    {
      type: 'columns',
      content: [
        {
          capital: false,
          alignment: 'center',
          fontSize: '18',
          bold: true,
          text: i18next.t('配送单'),
        },
      ],
    },
    {
      type: 'columns',
      content: [
        { field: 'id_PL', text: i18next.t('订单号') },
        { field: 'sort_id', text: i18next.t('序号') },
      ],
    },
    {
      type: 'columns',
      content: [
        { field: 'date_time', text: i18next.t('下单时间') },
        {
          field: 'receive_time',
          text: i18next.t('配送时间'),
        },
        { field: 'print_time', text: i18next.t('打印时间') },
      ],
    },
  ],
  topInfoBlockLines: [
    {
      type: 'columns',
      content: [
        { field: 'resname', text: i18next.t('收货商户') },
        { field: 'receiver_name', text: i18next.t('收货人') },
      ],
    },
    {
      type: 'columns',
      content: [
        { field: 'receiver_phone', text: i18next.t('联系电话') },
        { field: 'address', text: i18next.t('收货地址') },
      ],
    },
    {
      type: 'columns',
      content: [{ field: 'remark', text: i18next.t('订单备注') }],
    },
  ],
  bottomInfoBlockLines: [
    {
      type: 'columns',
      content: [
        { field: 'total_price', text: i18next.t('下单金额') },
        {
          field: 'real_price',
          text: i18next.t('出库金额'),
        },
        { field: 'freight', text: i18next.t('运费') },
        { field: 'abnormal_money', text: i18next.t('异常金额') },
        {
          field: 'total_pay',
          text: i18next.t('应付金额'),
        },
      ],
    },
    { type: 'columns', content: [] },
    { type: 'columns', content: [] },
    {
      type: 'columns',
      content: [
        { text: '' },
        { text: '' },
        { text: '' },
        { text: '' },
        { field: '_receiver_name', text: i18next.t('签收人') },
      ],
    },
  ],
  productBlockHeader: {
    category_total: true,
    abnormals_detail: true,
    category_number: true,
    tr: [
      { field: '_index', text: i18next.t('序号'), width: 'auto' },
      { field: 'category_title_1', text: i18next.t('类别'), width: 'auto' },
      { field: 'name', text: i18next.t('商品名'), width: '*' },
      { field: 'specs', text: i18next.t('规格'), width: 'auto' },
      { field: 'quantity', text: i18next.t('下单数'), width: 'auto' },
      { field: 'real_weight_std', text: i18next.t('出库数'), width: 'auto' },
      { field: 'std_sale_price', text: i18next.t('单价(基本单位)'), width: 42 },
      { field: 'real_item_price', text: i18next.t('应付金额'), width: 'auto' },
    ],
  },
  footerBlockLines: [
    {
      type: 'columns',
      content: [
        {
          bold: false,
          capital: false,
          alignment: 'center',
          fontSize: 12,
          field: '_pageCount',
          text: i18next.t('页码'),
        },
      ],
    },
  ],
}

function isMoneyField(field) {
  const moneyField = [
    'total_pay',
    'abnormal_money',
    'freight',
    'real_price',
    'std_sale_price',
    'real_item_price',
    'total_price',
    'real_item_price',
    'sale_price',
    'real_item_price_without_tax',
    'sale_price_without_tax',
    'tax',
    'origin_item_price',
  ]
  return _.some(moneyField, (v) => v === field)
}

function renderHeadersOrFooters(info, block) {
  return function (currentPage, pageCount) {
    return coverBlockConfig(info, block, currentPage, pageCount)
  }
}

function coverTable(listInfo, header) {
  const body = [_.map(header, 'text')]
  const fields = _.map(header, 'field')
  const widths = _.map(header, (col) => {
    if (col.width === undefined || col.width === '') return '*'
    else return col.width
  })

  _.each(listInfo, (sku) => {
    body.push(_.map(fields, (f) => sku[f]))
  })

  return {
    table: {
      headerRows: 1,
      widths,
      body,
    },
    fontSize: defaultFontSize,
  }
}

// 处理topInfoBlockLines 和 bottomInfoBlockLines
function coverBlockConfig(info, block, currentPage, pageCount) {
  return _.map(block, (line) => {
    if (line.type === 'columns') {
      const columns = _.map(line.content, (column) => {
        const newCol = { ...column }

        if (!newCol.width) delete newCol.width
        else newCol.width = Number(newCol.width)

        if (newCol.height) {
          newCol.height = Number(newCol.height)
          const marginTB =
            (newCol.height - (newCol.fontSize || defaultFontSize)) / 2
          newCol.marginTop = marginTB
          newCol.marginBottom = marginTB
        }

        switch (newCol.field) {
          // 页码
          case '_pageCount': {
            newCol.text = `${newCol.text}：${currentPage || ''}/${pageCount}`
            break
          }

          // 结款方式
          case 'settle_way': {
            newCol.text = i18next.t('KEY14', {
              VAR1:
                info.settle_way === 1
                  ? i18next.t('先货后款')
                  : i18next.t('先款后货'),
            }) /* src:`结款方式: ${info.settle_way === 1 ? '先货后款' : '先款后货'}` => tpl:结款方式: ${VAR1} */
            break
          }

          // 经理
          case 'sale_employee': {
            newCol.text = `${newCol.text}:${info.sale_manager['name'] || '-'}`
            break
          }
          case 'sale_employee_phone': {
            newCol.text = `${newCol.text}:${info.sale_manager['phone'] || '-'}`
            break
          }

          default: {
            let value = info[newCol.field]

            if (newCol.field && newCol.capital) {
              const upper = `${newCol.text}(${i18next.t(
                '小写'
              )}):${Price.getCurrency()}${Big(value).toFixed(2)}`
              const lower = i18next.t('KEY16', {
                VAR1: coverDigit2Uppercase(value),
              }) /* src:`(大写):${coverDigit2Uppercase(value)}` => tpl:(大写):${VAR1} */

              newCol.text = `${upper} ${lower}`
            } else {
              if (isMoneyField(newCol.field)) {
                value = `${Price.getCurrency()}${Big(value || 0).toFixed(2)}`
              }

              newCol.text = newCol.field
                ? `${newCol.text}: ${value || ''} `
                : newCol.text
            }
          }
        }

        newCol.fontSize = Number(newCol.fontSize) || defaultFontSize

        return newCol
      })

      return { columns }
    } else if (line.type === 'table') {
      return coverTable(info.details, line.content)
    }
  })
}

function coverProductTable(skus, tr, is_category_total_show) {
  _.each(tr, (td) => {
    td.fontSize = Number(td.fontSize) || defaultFontSize
  })

  const body = [
    _.map(tr, (td) => _.pick(td, ['text', 'alignment', 'fontSize', 'bold'])),
  ]
  const fields = _.map(tr, 'field')
  const widths = _.map(tr, (td) => {
    if (td.width === undefined || td.width === '') return '*'
    else return td.width
  })
  let skuIndex = 0

  if (is_category_total_show) {
    const productNumberBlock = _.toArray(
      _.groupBy(skus, (sku) => sku.category_title_1)
    )

    _.each(productNumberBlock, (skuList) => {
      let categoryTotalNumber = Big(0)
      _.each(skuList, (sku) => {
        skuIndex++
        const line = coverTr(tr, sku)

        body.push(line)
        categoryTotalNumber = categoryTotalNumber.plus(sku.real_item_price)
      })

      body.push([
        {
          colSpan: fields.length,
          text: i18next.t('KEY17', {
            VAR1: categoryTotalNumber.toString(),
          }) /* src:`小计：${categoryTotalNumber.toString()} ` => tpl:小计：${VAR1}  */,
          bold: true,
        },
        ..._.fill(Array(fields.length - 1), ''),
      ])
    })
  } else {
    _.each(skus, (sku) => {
      skuIndex++
      const line = coverTr(tr, sku)
      body.push(line)
    })
  }

  function coverTr(tr, sku) {
    return _.map(tr, (td) => {
      // undefined 或者 null 打印会闪退
      let value = sku[td.field] || ''
      // 是否是时价商品
      const isTiming = sku['is_price_timing']

      if (td.field === '_index') {
        value = skuIndex
      }

      if (td.capital) {
        value = coverDigit2Uppercase(value)
      } else {
        if (isMoneyField(td.field)) {
          value = Big(value || 0).toFixed(2)
        }
      }

      if (isTiming && td.field === 'std_sale_price') {
        value = i18next.t('时价')
      }

      return {
        text: value,
        bold: td.bold,
        fontSize: td.fontSize || defaultFontSize,
        alignment: td.alignment,
      }
    })
  }

  return {
    table: {
      headerRows: 1,
      widths,
      body,
    },
    fontSize: defaultFontSize,
    marginBottom: 5,
  }
}

function coverAbnormalsDetail(details, abnormals, refunds) {
  const headerFieldList = [
    { field: 'name', text: i18next.t('商品名') },
    { field: 'type_text', text: i18next.t('异常原因') },
    {
      field: 'text',
      text: i18next.t('异常描述'),
    },
    { field: 'count', text: i18next.t('异常/退货(数量)') },
    { field: 'money_delta', text: i18next.t('异常/退货(金额)') },
  ]
  const allAbnormalList = []

  _.each(abnormals, (abnormal) => {
    const sku = _.find(details, (s) => s.id === abnormal.detail_id)
    if (sku) {
      allAbnormalList.push({
        ...abnormal,
        count: abnormal.amount_delta + sku.std_unit_name,
        name: sku.name,
      })
    } else {
      allAbnormalList.push({
        ...abnormal,
        count: '-',
        name: '-',
      })
    }
  })

  _.each(refunds, (refund) => {
    const sku = _.find(details, (s) => s.id === refund.detail_id)
    if (sku) {
      allAbnormalList.push({
        ...refund,
        count: refund.amount_delta + sku.std_unit_name,
        name: sku.name,
      })
    } else {
      allAbnormalList.push({
        ...refund,
        count: '-',
        name: '-',
      })
    }
  })

  if (!allAbnormalList.length) return {}

  return {
    columns: [
      [i18next.t('异常明细：'), coverTable(allAbnormalList, headerFieldList)],
    ],
  }
}

/**
 * 计算第一行最大高度
 * @param header
 * @return {number}
 */
function getFirstLineHeight(header) {
  let firstLineHeight = 20
  _.each(header[0].content, (line) => {
    if (Number(line.height) > firstLineHeight) firstLineHeight = line.height
  })
  return firstLineHeight
}

/***
 * 生成图片base64地址
 * @param imgURL   图片地址
 * @return {Promise<any>}
 */
function generateImgBase64ByUrl(imgURL) {
  return new Promise((resolve, reject) => {
    let image = new Image() // eslint-disable-line
    image.crossOrigin = 'Anonymous'
    image.src = imgURL
    image.onload = function () {
      let base64 = getBase64Image(image)
      resolve(base64)
    }
    image.onerror = function () {
      console.info(i18next.t('logo加载失败:'), imgURL)
      reject(new Error('logoDownloadErr'))
    }

    function getBase64Image(img) {
      let canvas = window.document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      let ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, img.width, img.height)
      let ext = img.src.substring(img.src.lastIndexOf('.') + 1).toLowerCase()
      let dataURL = canvas.toDataURL('image/' + ext)
      return dataURL
    }
  })
}

/**
 * 拿到背景图片配置
 * @param imgURL
 * @param logoMaxHeight  logo最大高度
 * @return {Promise<*>}
 */
async function getBackground(imgURL, logoMaxHeight) {
  // 如果有logo,那么就设置logo
  if (imgURL) {
    const imgBase64 = await generateImgBase64ByUrl(imgURL)
    return [
      {
        image: imgBase64,
        marginLeft: 10,
        marginTop: 2,
        fit: [80, logoMaxHeight],
      },
    ]
  } else {
    return []
  }
}

/**
 *
 * @param order 订单数据
 * @param templateConfig 模板配置
 * @return {Promise<{pageMargins: number[], pageSize: *, background: *, info: {title: *}, header: *, content: *, footer: *, defaultStyle: {font: string}}>}
 */
async function renderDistributeItem(order, templateConfig) {
  const {
    category_number,
    category_total,
    abnormals_detail,
    tr,
  } = templateConfig.productBlockHeader
  const header = templateConfig.headerBlockLines
  const footer = templateConfig.footerBlockLines
  const contentDefinition = coverBlockConfig(
    order,
    templateConfig.topInfoBlockLines
  )
  if (category_number) {
    const productNumberBlock = _.toArray(
      _.groupBy(order.details, (sku) => sku.category_title_1)
    )
    const body = [[], []]
    _.each(productNumberBlock, (skuList, index) => {
      body[0][index] = skuList[0].category_title_1
      body[1][index] = skuList.length
    })

    contentDefinition.push({
      table: { body },
      fontSize: defaultFontSize,
      marginTop: 10,
      marginBottom: 10,
    })
  }

  contentDefinition.push(coverProductTable(order.details, tr, category_total))
  abnormals_detail &&
    contentDefinition.push(
      coverAbnormalsDetail(order.details, order.abnormals, order.refunds)
    )
  contentDefinition.push(
    coverBlockConfig(order, templateConfig.bottomInfoBlockLines)
  )

  // 第一行的高度(取这一行中的最大高度)
  const firstLineHeight = getFirstLineHeight(header)
  // 如果图片加载失败,那么背景图片为空
  const background = await getBackground(
    templateConfig.logo,
    firstLineHeight
  ).catch(() => [])

  return {
    pageMargins: [10, 0, 10, 10], // bottom10px,现在打印表格里面字号不一样很容易导致bug,只能hack先解决,库的原因没什么特别好的方法😇
    pageSize: printSizeMap[templateConfig.print_size],
    background: background,
    info: {
      title: templateConfig.name,
    },
    header: renderHeadersOrFooters(order, header),
    content: contentDefinition,
    footer: renderHeadersOrFooters(order, footer),
    defaultStyle: {
      font: 'MicrosoftYaHei',
    },
    driver_name: order.driver_name,
    origin_date_time: order.origin_date_time,
    address_route_name: order.address_route_name,
    sort_id: order.sort_id,
  }
}

/**
 * 渲染配送单列表
 * @param orders {array}  配送单数据列表
 * @param templateConfig {object}  配送单模板
 * @return {Promise<*>}    配送单列表
 */
function renderDistribute(orders, templateConfig) {
  const docDefinitions = _.map(orders, (order) => {
    return renderDistributeItem(order, templateConfig)
  })
  // logo加载异步操作
  return docDefinitions
}

const filterTemplateList = (data) => {
  return _.map(data, (list) => {
    let tr = list.productBlockHeader.tr

    if (!globalStore.hasViewTaxRate()) {
      tr = _.filter(tr, (val) => {
        return (
          val.field !== 'tax' &&
          val.field !== 'tax_rate' &&
          val.field !== 'sale_price_without_tax' &&
          val.field !== 'real_item_price_without_tax'
        )
      })
    }

    list.productBlockHeader = Object.assign({}, list.productBlockHeader, { tr })
    return list
  })
}

// 过滤系统默认打印模板配置
const defaultTemplateConfig = filterTemplateList([
  _.cloneDeep(originalTemplateConfig),
])[0]

// 获取打印模板列表
function getTemplateList() {
  return Request('/station/distribute_config/get')
    .get()
    .then((json) => {
      const res = json.data.length
        ? json.data
        : [_.cloneDeep(originalTemplateConfig)]

      return filterTemplateList(res)
    })
}

// 获取具体打印模板详情
function getTemplateDetail(id) {
  return getTemplateList().then((list) => {
    return _.find(list, (t) => t.id === +id)
  })
}

export {
  defaultFontSize,
  printSizeMap,
  renderDistribute,
  renderDistributeItem,
  defaultTemplateConfig,
  isMoneyField,
  renderHeadersOrFooters,
  coverTable,
  coverBlockConfig,
  coverProductTable,
  coverAbnormalsDetail,
  getTemplateList,
  getBackground,
  getFirstLineHeight,
  getTemplateDetail,
}
