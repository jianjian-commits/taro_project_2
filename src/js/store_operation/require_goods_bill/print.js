import { i18next } from 'gm-i18n'
import React, { Component } from 'react'
import { Flex, Price } from '@gmfe/react'
import { Request } from '@gm-common/request'
import RequireGoodsPrintTable from './components/print_table'
import styles from './style.module.less'
import moment from 'moment'
import Big from 'big.js'
import _ from 'lodash'

function skuElementsGetter(list, index, type) {
  return _.map(list[index].address, (addr, i) => {
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
    const amount = addr.plan_amount

    return (
      <span key={i}>
        <strong>{amount + list[index].std_unit_name}</strong>*[
        {addr.res_name || '-'}]{sortId}
        {addr.remark}
      </span>
    )
  })
}

function PrintTable({ list, type }) {
  const columns = [
    {
      field: 'index',
      name: i18next.t('序'),
      accessor: (index, i) => {
        return i + 1
      },
    },
    {
      field: 'purchase_spec_name',
      name: i18next.t('商品'),
    },
    {
      field: 'ratio',
      name: i18next.t('规格'),
      className: 'b-white-space-nowarp',
      accessor: (ratio, index) => {
        const rg = list[index]
        return `${ratio}${rg.std_unit_name}/${rg.purchase_unit_name}`
      },
    },
    {
      field: 'plan_amount',
      name: i18next.t('计划'),
      accessor: (plan_amount, index) => {
        const rg = list[index]
        return plan_amount
          ? `${Big(plan_amount).div(rg.ratio).toFixed(2)}${
              rg.purchase_unit_name
            }(${plan_amount}${rg.std_unit_name})`
          : null
      },
    },
    {
      field: 'supply_purchase_amount',
      name: i18next.t('实供'),
      accessor: (supply_purchase_amount, index) => {
        return `${Big(supply_purchase_amount).toFixed(2)}${
          list[index].purchase_unit_name
        }`
      },
    },
    {
      field: 'supply_std_price',
      name: i18next.t('单价'),
      className: 'b-white-space-nowarp',
      accessor: (price, index) => {
        const rg = list[index]
        return `${price}${Price.getUnit() + '/'}${rg.std_unit_name}`
      },
    },
    {
      field: 'supply_std_price',
      name: <div className='gm-padding-lr-15'>{i18next.t('总价')}</div>,
      accessor: (supply_std_price, index) => {
        const rg = list[index]

        return rg.supply_purchase_amount
          ? `${Big(supply_std_price)
              .times(rg.supply_purchase_amount)
              .times(rg.ratio)
              .toFixed(2)}${Price.getUnit()}`
          : null
      },
    },
  ]

  return (
    <RequireGoodsPrintTable
      skuElementsGetter={skuElementsGetter}
      list={list}
      type={type}
      columns={columns}
    />
  )
}

class RequireGoodsPrint extends Component {
  constructor(props) {
    super(props)

    this.state = {
      require_goods: null,
    }
  }

  componentDidMount() {
    const { id } = this.props.location.query

    Request('/stock/require_goods_sheet/detail/print', {
      timeout: 60000,
    })
      .data({ id })
      .get()
      .then((json) => {
        this.setState(
          {
            require_goods: json.data,
          },
          () => {
            window.print()
          }
        )
      })
  }

  // 计算总
  computeTotalMoney(list) {
    let total_money = 0
    _.each(list, (lt) => {
      total_money =
        total_money +
        +Big(lt.supply_std_price)
          .times(lt.supply_purchase_amount)
          .times(lt.ratio)
          .toFixed(2)
    })
    return Big(total_money).toFixed(2)
  }

  render() {
    const { printType } = this.props.location.query
    if (!this.state.require_goods) {
      return <div />
    }
    const {
      sheet_no,
      apply_station_name,
      apply_time,
      apply_operator_username,
      details,
    } = this.state.require_goods

    const total_money = this.computeTotalMoney(details)

    return (
      <div className={'gm-margin-5' + styles.print}>
        <Flex column alignCenter>
          <div style={{ fontSize: '20px', fontWeight: 'bold' }}>
            {apply_station_name || '-'}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            {i18next.t('要货单据')}
          </div>
        </Flex>
        <Flex alignCenter className='gm-margin-top-5'>
          <Flex flex>
            {i18next.t('单据编号')}：{sheet_no || '-'}
          </Flex>
          <Flex flex>
            {i18next.t('申请时间')}：
            {apply_time ? moment(apply_time).format('YYYY-MM-DD HH:mm') : '-'}
          </Flex>
        </Flex>
        <Flex alignCenter className='gm-margin-top-5'>
          <Flex flex>
            {i18next.t('要货单位')}：{apply_station_name || '-'}
          </Flex>
          <Flex flex>
            {i18next.t('申请人')}：{apply_operator_username || '-'}
          </Flex>
        </Flex>
        <Flex alignCenter className='gm-margin-top-5'>
          <Flex flex>
            {i18next.t('打印时间')}：{moment().format('YYYY-MM-DD HH:mm')}
          </Flex>
          <Flex flex>
            {i18next.t('采购金额')}：{total_money + Price.getUnit()}
          </Flex>
        </Flex>

        <Flex alignCenter justifyStart className='gm-margin-bottom-5'>
          {i18next.t('明细')}：{details ? details.length : '-'}
        </Flex>

        {details && details.length > 0 && (
          <PrintTable list={details} type={printType} />
        )}

        <div className='gm-gap-10' />
        <Flex alignCenter>
          <Flex flex> {i18next.t('供应商经办人')}：</Flex>
          <Flex flex>{i18next.t('供应商')}：</Flex>
        </Flex>
      </div>
    )
  }
}

export default RequireGoodsPrint
