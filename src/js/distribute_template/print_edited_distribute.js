import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, Loading } from '@gmfe/react'
import _ from 'lodash'
import styles from './style.module.less'
import {
  renderHeadersOrFooters,
  coverProductTable,
  coverBlockConfig,
  printSizeMap,
  defaultFontSize,
  coverTable,
  getBackground,
  getFirstLineHeight,
} from './util'
import requirePdfMake from 'gm-service/src/require_module/require_pdfmake'
import { observer } from 'mobx-react'
import printLog from '../common/print_log'
import { printEditStore } from './store'
import Big from 'big.js'

const replaceNullOrUndefined = (value, replaceTo) =>
  _.isNull(value) || _.isUndefined(value) ? replaceTo : value

function coverAllnormalList(allAbnormalList) {
  if (!allAbnormalList.length) return {}

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

  _.each(allAbnormalList, (abnormal) => {
    abnormal.name = abnormal.name || '-'
    abnormal.amount_delta = abnormal.amount_delta || '-'
    abnormal.std_unit_name = replaceNullOrUndefined(abnormal.std_unit_name, '')
    abnormal.count = abnormal.amount_delta + abnormal.std_unit_name
  })

  return {
    columns: [
      [i18next.t('异常明细：'), coverTable(allAbnormalList, headerFieldList)],
    ],
  }
}

@observer
class PrintEditedDistribute extends React.Component {
  async componentDidMount() {
    const { template_id, data } = this.props.history.location.query
    await printEditStore.getTemplateConfig()
    printEditStore.setTemplateID(template_id)

    const templateConfig = printEditStore.curTemplateConfig
    if (!templateConfig) {
      window.alert(i18next.t('模板配置发生变化，请重试！'))
      window.closeWindow()
    }
    const printData = JSON.parse(data)

    // 整理数据
    _.each(printData.details, (sku) => {
      sku.specs =
        sku.std_unit_name === sku.sale_unit_name && +sku.sale_ratio === 1
          ? i18next.t('KEY6', {
              VAR1: sku.sale_unit_name,
            }) /* src:`按${sku.sale_unit_name}` => tpl:按${VAR1} */
          : `${sku.sale_ratio}${sku.std_unit_name}/${sku.sale_unit_name}`
      sku.quantity = sku.quantity + sku.sale_unit_name
      sku.real_weight_std = sku.real_weight + sku.std_unit_name // 出库数(基本单位)
      sku.real_weight_sale =
        parseFloat(Big(sku.real_weight).div(sku.sale_ratio).toFixed(2)) +
        sku.sale_unit_name // 出库数(销售单位)
      sku.name = sku.real_is_weight && !sku.is_weigh ? `*${sku.name}` : sku.name // 未称重商品名加*
    })

    const {
      category_number,
      category_total,
      tr,
      abnormals_detail,
    } = templateConfig.productBlockHeader
    const header = templateConfig.headerBlockLines
    const footer = templateConfig.footerBlockLines

    const contentDefinition = coverBlockConfig(
      printData,
      templateConfig.topInfoBlockLines
    )
    if (category_number) {
      const productNumberBlock = _.toArray(
        _.groupBy(printData.details, (sku) => sku.category_title_1)
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

    contentDefinition.push(
      coverProductTable(printData.details, tr, category_total)
    )
    abnormals_detail &&
      contentDefinition.push(coverAllnormalList(printData.allAbnormalList))
    contentDefinition.push(
      coverBlockConfig(printData, templateConfig.bottomInfoBlockLines)
    )

    // 第一行的高度(取这一行中的最大高度)
    const firstLineHeight = getFirstLineHeight(header)

    // 如果图片加载失败,那么背景图片为空
    const background = await getBackground(
      templateConfig.logo,
      firstLineHeight
    ).catch(() => [])

    const docDefinitions = [
      {
        pageMargins: [10, 0, 10, 2], // bottom加2px,hack修复表格数据错位问题.🤣
        pageSize: printSizeMap[templateConfig.print_size],
        background: background,
        info: {
          title: templateConfig.name,
        },
        header: renderHeadersOrFooters(printData, header),
        content: contentDefinition,
        footer: renderHeadersOrFooters(printData, footer),
        defaultStyle: {
          font: 'MicrosoftYaHei',
        },
      },
    ]

    requirePdfMake((pdfMake) => {
      pdfMake.createPdf(docDefinitions).print({}, window)
    })
    // 记录打印
    printLog({ sheet_type: 1, ids: JSON.stringify([printData.id]) })
  }

  render() {
    return (
      <Flex column alignCenter className={styles.printWrap}>
        <Loading text={i18next.t('数据请求中...')} />
      </Flex>
    )
  }
}

export default PrintEditedDistribute
