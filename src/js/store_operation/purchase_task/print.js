import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, Price } from '@gmfe/react'
import './actions.js'
import './reducer.js'
import actions from '../../actions'
import moment from 'moment'
import styles from './style.module.less'
import _ from 'lodash'
import Big from 'big.js'
import { money } from '../../common/filter'
import globalStore from '../../stores/global'
import PurchasePrintTable from './components/purchase_print_table'

function skuElementsGetter(tasks, index, type) {
  return _.map(tasks[index].addresses, (addr, i) => {
    let sortId = ''
    // 明细 模板2和模板3 添加分拣序号
    // showSidePrintModal 处定义的
    if (type === '3' || type === '4') {
      sortId = (
        <React.Fragment>
          *[<strong>{addr.sort_id || '-'}</strong>]
        </React.Fragment>
      )
    }
    const amount = parseFloat(
      Big(addr.plan_purchase_amount).div(tasks[index].sale_ratio).toFixed(2),
      10
    )

    return (
      <span key={i}>
        <strong>{amount + tasks[index].sale_unit_name}</strong>*[
        {addr.res_name || '-'}]{sortId}
        {addr.remark}
      </span>
    )
  })
}

function PrintTable({ tasks, type }) {
  const columns = [
    {
      field: 'index',
      name: i18next.t('序'),
      accessor: (index, i) => {
        return i + 1
      },
    },
    {
      field: 'sku_name',
      name: i18next.t('商品'),
    },
    {
      field: 'sale_ratio',
      name: i18next.t('规格'),
      className: 'b-white-space-nowarp',
      accessor: (sale_ratio, index) => {
        const sku = tasks[index]
        return `${sale_ratio}${sku.std_unit_name}/${sku.sale_unit_name}`
      },
    },
    {
      field: 'plan_purchase_amount',
      name: i18next.t('计划'),
      accessor: (plan_purchase_amount, index) => {
        const sku = tasks[index]
        return `${Big(plan_purchase_amount).div(sku.sale_ratio).toFixed(2)}${
          sku.sale_unit_name
        }(${Big(plan_purchase_amount).div(1).toFixed(2)}${sku.std_unit_name})`
      },
    },
    {
      field: 'stock',
      name: i18next.t('库存'),
      accessor: (stock, index) => {
        const task = tasks[index]
        return `${Big(stock).toFixed(2)}${task.std_unit_name}`
      },
    },
    /* TODO 希捷说,深圳小龙女需要屏蔽建议采购这一列喔 */
    !globalStore.isXNN() && {
      field: 'plan_purchase_amount',
      name: i18next.t('建议采购'),
      accessor: (suggest_purchase_num, index) => {
        // 打印会汇集相同商品的记录，计划采购是总和，每个商品对应的库存相同。建议采购的值：总和计划 - 库存（自己算）
        const task = tasks[index]
        if (Number(task.stock) < 0) {
          return `${Big(task.plan_purchase_amount).toFixed(2)}${
            task.std_unit_name
          }`
        }
        return Number(suggest_purchase_num) > 0
          ? `${Big(suggest_purchase_num).toFixed(2)}${task.std_unit_name}`
          : i18next.t('库存充足')
      },
    },
    {
      field: '__empty',
      name: <div className='gm-padding-lr-15'>{i18next.t('实采')}</div>,
      className: 'b-white-space-nowarp',
    },
    {
      field: 'price',
      name: i18next.t('参考成本'),
      className: 'b-white-space-nowarp',
      accessor: (stock, index) => {
        const task = tasks[index]
        return `${task.price ? money(task.price) : 0}${Price.getUnit() + '/'}${
          task.std_unit_name
        }`
      },
    },
    {
      field: 'price_sum',
      name: <div className='gm-padding-lr-15'>{i18next.t('总价')}</div>,
      className: 'b-white-space-nowarp',
    },
  ]

  return (
    <PurchasePrintTable
      tasks={tasks}
      type={type}
      columns={columns}
      skuElementsGetter={skuElementsGetter}
    />
  )
}

class PurchasePrint extends React.Component {
  componentDidMount() {
    const query = this.props.location.query
    // 设置边距为5mm
    let css = document.createElement('style')
    css.innerText = '@page {margin: 5mm;}'
    document.head.appendChild(css)
    actions.purchase_task_print(query).then(() => {
      window.print()
    })
  }

  render() {
    const { printType } = this.props.location.query
    const { station_name } = globalStore.user

    const { printList } = this.props.purchase_task
    return _.map(printList, (printInfo, i) => {
      let { tasks = [] } = printInfo
      let purchase_money = Big(0)
      _.each(tasks, (task) => {
        task.plan_purchase_amount = _.reduce(
          task.addresses,
          (sum, addr) => (sum += addr.plan_purchase_amount),
          0
        )
        purchase_money = Big(task.plan_purchase_amount)
          .times(task.price || 0)
          .plus(purchase_money)
      })
      if (printType === '-1') {
        // 采购任务才有 type === -1
        let num = 1
        let sum = Big(0)
        return (
          <div
            className={'gm-margin-5 ' + styles.print}
            key={i}
            style={{ pageBreakBefore: 'always' }}
          >
            <Flex justifyBetween>
              <div>
                {station_name} {i18next.t('商品采购订单')}
              </div>
              <div>{moment().format('YYYY-MM-DD HH:mm')}</div>
            </Flex>
            <div
              className='gm-margin-bottom-5'
              style={{
                textAlign: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              {printInfo.settle_supplier_name}
            </div>
            <table className='table table-hover table-bordered gm-bg b-purchase-print'>
              <thead>
                <tr>
                  <th>{i18next.t('序号')}</th>
                  <th>{i18next.t('商品名称')}</th>
                  <th>{i18next.t('规格')}</th>
                  <th>{i18next.t('单位')}</th>
                  <th>{i18next.t('订单数量')}</th>
                  <th>{i18next.t('客户名称')}</th>
                  <th>{i18next.t('备注')}</th>
                </tr>
              </thead>
              <tbody>
                {_.map(tasks, (task) => {
                  return _.map(task.addresses, (addr) => {
                    sum = sum.plus(addr.plan_purchase_amount)
                    return (
                      <tr>
                        <td>{num++}</td>
                        <td>{task.sku_name}</td>
                        <td>
                          {task.sale_ratio}
                          {task.std_unit_name}/{task.sale_unit_name}
                        </td>
                        <td>{task.std_unit_name}</td>
                        <td>{Big(addr.plan_purchase_amount).toFixed(2)}</td>
                        <td>{addr.res_name}</td>
                        <td>{addr.remark}</td>
                      </tr>
                    )
                  })
                })}
                <tr>
                  <td />
                  <td />
                  <td />
                  <td>{i18next.t('小计')}</td>
                  <td>{sum.toFixed(2)}</td>
                  <td />
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        )
      }
      return (
        <div
          className={'gm-margin-5 ' + styles.print}
          key={i}
          style={{ pageBreakBefore: 'always' }}
        >
          <Flex column alignCenter>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
              {printInfo.settle_supplier_name}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              {i18next.t('采购任务汇总')}
            </div>
          </Flex>
          <Flex alignCenter className='gm-margin-top-5'>
            <Flex flex>
              {i18next.t('采购单位')}：{station_name}
            </Flex>
            <Flex flex>
              {i18next.t('采购经办')}：
              {_.join(_.map(printInfo.purchaser, 'purchaser_name'), ',')}
            </Flex>
          </Flex>
          <Flex alignCenter className='gm-margin-top-5'>
            <Flex flex>
              {i18next.t('打印时间')}：{moment().format('YYYY-MM-DD HH:mm:ss')}
            </Flex>
            <Flex flex>
              {i18next.t('采购金额')}：{purchase_money.div(100).toFixed(2)}
              {Price.getUnit()}
            </Flex>
          </Flex>
          <div className='gm-gap-5' />

          <Flex alignCenter justifyStart className='gm-margin-bottom-5'>
            {i18next.t('任务数')}：{tasks.length}
          </Flex>

          <PrintTable tasks={tasks} type={printType} />

          <div className='gm-gap-10' />

          <Flex alignCenter>
            <Flex flex> {i18next.t('采购经办')}：</Flex>
            <Flex flex>{i18next.t('供应商')}：</Flex>
          </Flex>
        </div>
      )
    })
  }
}

export default PurchasePrint
