import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, Loading } from '@gmfe/react'
import _ from 'lodash'
import moment from 'moment'
import PropTypes from 'prop-types'
import actions from '../actions'
import './actions'
import './reducer'
import styles from './style.module.less'
import {
  renderDistribute,
  printSizeMap,
  defaultFontSize,
  renderDistributeItem,
} from './util'
import requirePdfMake from 'gm-service/src/require_module/require_pdfmake'
import globalStore from '../stores/global'
import printLog from '../common/print_log'

/* ------ 配送任务单 ------ */
function renderTask(driverInfo) {
  const taskTable = globalStore.isMalaysia()
    ? renderTaskTableForMalay
    : renderTaskTable
  return _.map(driverInfo, (driver) => {
    return {
      pageMargins: [10, 0, 10, 0],
      pageSize: printSizeMap.A4,
      info: {
        title: i18next.t('配送任务清单'),
      },
      header: {
        capital: false,
        alignment: 'center',
        fontSize: '18',
        bold: true,
        text: i18next.t('配送任务清单'),
      },
      content: [{ columns: renderHeader(driver) }, taskTable(driver)],
      defaultStyle: {
        font: 'MicrosoftYaHei',
      },
      driver_name: driver.driver_name,
    }
  })
}

function renderHeader(driver) {
  const { driver_name, driver_phone, car_num } = driver
  return [
    {
      text: i18next.t('KEY9', {
        VAR1: driver_name,
      }) /* src:`配送司机：${driver_name}` => tpl:配送司机：${VAR1} */,
      fontSize: 10,
    },
    {
      text: i18next.t('KEY10', {
        VAR1: car_num,
      }) /* src:`车牌号：${car_num}` => tpl:车牌号：${VAR1} */,
      fontSize: 10,
    },
    {
      text: i18next.t('KEY11', {
        VAR1: driver_phone,
      }) /* src:`联系方式：${driver_phone}` => tpl:联系方式：${VAR1} */,
      fontSize: 10,
    },
    {
      text: i18next.t('KEY12', {
        VAR1: moment().format('YYYY-MM-DD'),
      }) /* src:`打印日期：${moment().format('YYYY-MM-DD')}` => tpl:打印日期：${VAR1} */,
      fontSize: 10,
    },
  ]
}

// 希捷说:马来打印定制的司机任务单
function renderTaskTableForMalay(driver) {
  const tr = [
    { text: 'Order ID', field: 'order_id', width: 'auto' },
    { text: 'Customer Name', field: 'customer_name', width: 'auto' },
    { text: 'Address', field: 'receive_address', width: '*' },
    { text: 'Receiving time', field: 'receive_time', width: 'auto' },
    { text: 'Remark', field: 'null', width: 'auto' },
    { text: 'Box', field: 'null', width: 20 },
  ]
  const fields = _.map(tr, (td) => td.field)
  const widths = _.map(tr, (td) => td.width)
  const body = [_.map(tr, (td) => ({ text: td.text, bold: true }))]

  const taskList = _.sortBy(driver.order_detail, 'customer_name')

  _.each(taskList, (order) => {
    body.push(
      fields.map((field) => {
        switch (field) {
          case 'null':
            return { text: '' }
          case 'receive_time':
            return {
              text:
                moment(order.receive_begin_time).format('MM/DD-HH:mm') +
                '~\n' +
                moment(order.receive_end_time).format('MM/DD-HH:mm'),
            }
          default:
            return { text: order[field] || '-' }
        }
      }),
    )
  })

  return {
    table: {
      headerRows: 1,
      widths,
      body,
    },
    fontSize: defaultFontSize,
    marginTop: 10,
  }
}

function renderTaskTable(driver) {
  const tr = [
    { text: i18next.t('序号'), field: 'sort_id', width: 'auto' },
    { text: i18next.t('订单号'), field: 'order_id', width: 'auto' },
    { text: i18next.t('商户名'), field: 'customer_name', width: 'auto' },
    { text: i18next.t('收货地址'), field: 'receive_address', width: '*' },
    { text: i18next.t('收货时间'), field: 'receive_time', width: 'auto' },
    { text: i18next.t('配送框数'), field: 'null', width: 20 },
    { text: i18next.t('回收框数'), field: 'null', width: 20 },
    { text: i18next.t('订单备注'), field: 'null', width: 'auto' },
  ]
  const fields = _.map(tr, (td) => td.field)
  const widths = _.map(tr, (td) => td.width)
  const body = [_.map(tr, (td) => _.pick(td, 'text'))]

  const taskList = _.sortBy(driver.order_detail, 'sort_id')

  _.each(taskList, (order) => {
    body.push(
      fields.map((field) => {
        switch (field) {
          case 'null':
            return { text: '' }
          case 'receive_time':
            return {
              text:
                moment(order.receive_begin_time).format('MM/DD-HH:mm') +
                '~\n' +
                moment(order.receive_end_time).format('MM/DD-HH:mm'),
            }
          default:
            return { text: order[field] || '-' }
        }
      }),
    )
  })

  return {
    table: {
      headerRows: 1,
      widths,
      body,
    },
    fontSize: defaultFontSize,
    marginTop: 10,
  }
}

/* ------- 配送装车单 ------- */
function renderSku(driverInfo) {
  return _.map(driverInfo, (driver) => {
    return {
      pageMargins: [10, 0, 10, 0],
      pageSize: printSizeMap.A4,
      info: {
        title: i18next.t('配送装车清单'),
      },
      header: {
        capital: false,
        alignment: 'center',
        fontSize: '18',
        bold: true,
        text: i18next.t('配送装车清单'),
      },
      content: [
        {
          columns: renderHeader(driver),
          marginBottom: 10,
        },
        ...renderSkuTable(driver),
      ],
      defaultStyle: {
        font: 'MicrosoftYaHei',
      },
      driver_name: driver.driver_name,
    }
  })
}

function renderSkuTable(driver) {
  // 司机装车信息,按分拣方式分类 (分拣方式: 八卦, 统配, ...)
  const groupBySortName = _.groupBy(driver.sku_detail, 'sort_name')
  // 八卦不打印了!!(产品在上线后,又改需求.....)
  delete groupBySortName['八卦']
  // 每种分拣方式做一个表格
  const tableArr = _.map(groupBySortName, (skuList) => {
    return [renderSkuTableDetail(skuList)]
  })

  return tableArr
}

function renderSkuTableDetail(skuList) {
  const tr = [
    { text: i18next.t('商品名称'), field: 'sku_name', width: 'auto' },
    { text: i18next.t('总计'), field: 'quantity_and_unit', width: 'auto' },
    { text: i18next.t('分类'), field: 'category_2_name', width: 'auto' },
    { text: i18next.t('明细'), field: 'detail', width: '*' },
  ]
  const fields = _.map(tr, (td) => td.field)
  const widths = _.map(tr, (td) => td.width)
  const bold = _.map(tr, (td) => td.bold)

  // 排序后商品
  const skuListAfterSort = _.sortBy(skuList, ['category_1_id', 'category_2_id'])

  // 商品按一级分类分组
  const skuAfterGroup = _.groupBy(skuListAfterSort, 'category_1_name')

  // 每个分类建立一个表格
  function generateSheetListForEachGroup(group) {
    // 商品表格数组
    return _.map(group, (skuList, category_1_name) => {
      const body = [_.map(tr, (td) => _.pick(td, 'text'))]
      _.each(skuList, (sku) => {
        body.push(
          fields.map((field) => {
            switch (field) {
              case 'quantity_and_unit':
                return { text: sku.quantity + sku.std_unit }
              case 'detail': {
                const len = sku.customer_detail.length
                return {
                  text: _.flatten(
                    _.map(sku.customer_detail, (customer, index) => [
                      `[${customer.sort_id || '-'}]${customer.customer_name}*`,
                      customer.sku_amount,
                      (index + 1) % 2 === 0
                        ? '\n'
                        : len !== 1 && index !== len - 1
                        ? '+'
                        : '',
                    ]),
                  ),
                }
              }
              default:
                return { text: sku[field] }
            }
          }),
        )
      })

      return [
        { columns: [{ text: `${category_1_name}：${skuList.length}` }] },
        {
          table: {
            headerRows: 1,
            widths,
            bold,
            body,
          },
          fontSize: defaultFontSize,
          marginBottom: 10,
        },
      ]
    })
  }

  // 数据结构 [[{title}, {table}]]
  return generateSheetListForEachGroup(skuAfterGroup)
}

class DistributePrinter extends React.Component {
  constructor(props) {
    super(props)

    this.handlePrint = ::this.handlePrint
    this.renderDistributeByCustomer = ::this.renderDistributeByCustomer
    this.renderDistribute = ::this.renderDistribute
  }

  order_ids = [] // 订单id列表

  /**
   * 配送单据
   * @param  {[string | array]} query [订单id] || [筛选条件]
   * @param  {[number | string]} template_id     [模板编号]
   * @return {[array]}                        [pdf渲染描述]
   */
  renderDistribute(query, template_id) {
    return Promise.all([
      actions.fetch_distribute_info(query),
      actions.template_config_detail_fetch(template_id),
    ]).then((results) => {
      const [orders, templateConfig] = results

      // 全选所有页打印时: 前端不会传order_ids, 为保证打印次数正确, 需从后台接口中获取数据
      this.order_ids = _.map(orders, (item) => item.id)

      if (!templateConfig) {
        window.alert(i18next.t('模板配置发生变化，请重试！'))
        window.closeWindow()
      }
      return Promise.all(renderDistribute(orders, templateConfig))
    })
  }

  /**
   * 配送单据(按商户配置打印,模板根据商户配置来进行筛选)
   * @param  {[string | array]} query [订单id] || [筛选条件]
   * @return {[array]}                        [pdf渲染描述]
   */
  renderDistributeByCustomer(query) {
    return Promise.all([
      actions.fetch_distribute_info(query),
      actions.template_config_list_fetch(),
    ]).then((results) => {
      const [orders, templateConfigList] = results

      // 全选所有页打印时: 前端不会传order_ids, 为保证打印次数正确, 需从后台接口中获取数据
      this.order_ids = _.map(orders, (item) => item.id)

      // 配送单promise列表
      const distributeDoc = []
      // 未配置模板的商户
      const customerWhoNotHasTemplate = []

      _.each(orders, (order) => {
        // 根据每个订单按sid, 从模板列表查找商户配置的模板
        const templateConfig = _.find(templateConfigList, (template) =>
          _.includes(template.address_ids, +order.sid),
        )
        // 配送单对象
        if (templateConfig) {
          distributeDoc.push(renderDistributeItem(order, templateConfig))
        } else {
          customerWhoNotHasTemplate.push(order.resname)
        }
      })

      // 存在配置模板商户
      if (customerWhoNotHasTemplate.length > 0) {
        const customers = _.uniq(customerWhoNotHasTemplate).join(',')
        window.alert(
          i18next.t('KEY13', {
            VAR1: customers,
          }) /* src:`${customers}商户未配置打印模板，打印异常!` => tpl:${VAR1}商户未配置打印模板，打印异常! */,
        )
        window.closeWindow()
      }

      return Promise.all(distributeDoc)
    })
  }

  async componentDidMount() {
    const {
      template_id,
      order_ids,
      print_drivers,
      isPrintSid,
      to_print_sku,
      to_print_task,
      type,
    } = this.props.history.location.query
    let docDefinitions = []

    const ids = JSON.stringify(_.isArray(order_ids) ? order_ids : [order_ids])

    // 全选所有页: 传搜索条件，非全选(包含当前页全选): 传id
    const query = order_ids
      ? { ids }
      : { ...JSON.parse(this.props.history.location.query.filter) }

    // 打印配送单据
    if (isPrintSid === 'true') {
      // 按商户配置打印,每个订单根据
      if (template_id === '-1') {
        const distributeDoc = await this.renderDistributeByCustomer(query)
        docDefinitions = docDefinitions.concat(distributeDoc)
      } else {
        const distributeDoc = await this.renderDistribute(query, template_id)
        docDefinitions = docDefinitions.concat(distributeDoc)
      }
    }
    // 司机任务单 和 司机装车单
    if (to_print_task === 'true' || to_print_sku === 'true') {
      const driverInfo = await actions.fetch_driver_info(print_drivers)

      if (to_print_task === 'true' && to_print_sku === 'true') {
        const skuDoc = renderSku(driverInfo)
        const taskDoc = renderTask(driverInfo)

        const taskAfterSkuDoc = []
        _.each(skuDoc, (item, index) => {
          taskAfterSkuDoc.push(skuDoc[index])
          taskAfterSkuDoc.push(taskDoc[index])
        })
        docDefinitions = docDefinitions.concat(taskAfterSkuDoc)
      } else {
        // 打印司机任务单
        if (to_print_task === 'true') {
          const taskDoc = renderTask(driverInfo)
          docDefinitions = docDefinitions.concat(taskDoc)
        }
        // 打印司机装车单
        if (to_print_sku === 'true') {
          const skuDoc = renderSku(driverInfo)
          docDefinitions = docDefinitions.concat(skuDoc)
        }
      }
    }
    // 按司机排序
    docDefinitions =
      type === 'line'
        ? _.sortBy(docDefinitions, ['address_route_name', 'sort_id'])
        : _.sortBy(docDefinitions, [
            type === 'driver' ? (o) => o.driver_name : _.noop, // 如果有司机任务单 或者 司机装车单,那么先司机排序
            (o) => moment.now() - moment(o.origin_date_time), // 按下单时间降序打印
          ])

    if (docDefinitions.length > 0) {
      requirePdfMake((pdfMake) => {
        pdfMake.createPdf(docDefinitions).print({}, window)
      })
      // 记录配送单打印
      isPrintSid === 'true' &&
        printLog({
          sheet_type: 1,
          ids: JSON.stringify(this.order_ids),
        })
    } else {
      window.alert(i18next.t('打印订单数据异常,请联系客服!'))
    }
  }

  handlePrint() {
    this.pdfDocGenerator.print({}, window)
  }

  render() {
    return (
      <Flex column alignCenter className={styles.printWrap}>
        <Loading text={i18next.t('数据请求中...')} />
      </Flex>
    )
  }
}

DistributePrinter.propTypes = {
  history: PropTypes.object.isRequired,
}

export default DistributePrinter
