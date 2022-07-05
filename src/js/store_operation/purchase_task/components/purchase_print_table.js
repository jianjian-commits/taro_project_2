import React from 'react'
import _ from 'lodash'
import { i18next } from 'gm-i18n'
import Big from 'big.js'

// 采购任务 和 采购单据 打印都有的四种模板
class PurchasePrintTable extends React.Component {
  render() {
    const { columns, tasks, type, skuElementsGetter } = this.props
    if (type === '0') {
      return <NBLATable tasks={tasks} />
    }
    return (
      <table className='table table-hover table-bordered gm-bg b-purchase-print'>
        <thead>
          <tr>
            {_.map(columns, (column) => {
              return (
                column && <th className={column.className}> {column.name} </th>
              )
            })}
            {
              // 商品 + 明细 一行展示
              type === '4' && <th> {i18next.t('明细')} </th>
            }
          </tr>
        </thead>
        <tbody>
          {_.map(tasks, (task, index) => {
            let skuElements = skuElementsGetter(tasks, index, type)
            return (
              <React.Fragment>
                <tr>
                  {_.map(columns, (column) => {
                    if (!column) {
                      return null
                    }
                    let { field, accessor } = column
                    return (
                      <td>
                        {accessor ? accessor(task[field], index) : task[field]}
                      </td>
                    )
                  })}
                  {
                    // 商品 + 明细 一行展示
                    type === '4' && (
                      <td className='b-purchase-print-sku-desc'>
                        {_.map(skuElements, (sku, i) => {
                          let s = null
                          if (i !== skuElements.length - 1) {
                            s = { borderBottom: '1px dashed #ddd' }
                          }
                          return <div style={s}> {sku} </div>
                        })}
                      </td>
                    )
                  }
                </tr>
                {
                  // 明细与商品 两行展示
                  type === '2' && (
                    <tr>
                      <td colSpan='99' className='b-purchase-print-sku-desc'>
                        {_.map(skuElements, (sku, i) => {
                          return i === 0 ? (
                            sku
                          ) : (
                            <React.Fragment>
                              {' + '}
                              {sku}
                            </React.Fragment>
                          )
                        })}
                      </td>
                    </tr>
                  )
                }
                {
                  // 明细两列展示
                  type === '3' &&
                    _.range(0, Math.ceil(skuElements.length / 2)).map(
                      (rowIndex) => {
                        const curStartIndex = 2 * rowIndex
                        return (
                          <tr>
                            <td
                              colSpan='5'
                              className='b-purchase-print-bg-gray b-purchase-print-sku-desc'
                            >
                              {skuElements[curStartIndex]}
                            </td>
                            <td
                              colSpan='4'
                              className='b-purchase-print-bg-gray b-purchase-print-sku-desc'
                            >
                              {skuElements[curStartIndex + 1]}
                            </td>
                          </tr>
                        )
                      }
                    )
                }
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    )
  }
}

// 宁波绿奥NBLA,下面是定制的table, group_id = 716
class NBLATable extends React.Component {
  render() {
    // 为了客户特别定制...
    const style = { paddingTop: '2px', paddingBottom: '2px', height: '10px' }
    const { tasks } = this.props
    return (
      <table className='table table-hover table-bordered gm-bg'>
        <thead>
          <tr style={style}>
            <th style={{ width: '50px' }}>{i18next.t('序号')}</th>
            <th style={{ width: '150px' }}>{i18next.t('商品名')}</th>
            <td style={{ border: 'none' }} />
          </tr>
        </thead>
        <tbody>
          {_.map(tasks, (v, index) => (
            <React.Fragment>
              <tr style={style} key={index}>
                <td style={{ width: '50px', ...style }}>{++index}</td>
                <td style={{ width: '150px', fontWeight: 'bold', ...style }}>
                  {v.sku_name}
                </td>
                <td />
              </tr>
              <tr key={index} style={style}>
                <td colSpan={10} style={{ textAlign: 'left', ...style }}>
                  {_.map(v.addresses, (addr, i) => {
                    const num = parseFloat(
                      Big(addr.plan_purchase_amount)
                        .div(v.sale_ratio)
                        .toFixed(2),
                      10
                    )
                    const address = `(${addr.res_name || '-'})`
                    const remark = addr.remark ? (
                      <strong>[{addr.remark}]</strong>
                    ) : (
                      ''
                    )

                    return (
                      <span key={i}>
                        {i === 0 ? '' : ' + '}
                        <strong>{num}</strong>
                        {v.sale_unit_name}
                        {remark}
                        {address}
                      </span>
                    )
                  })}
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>
    )
  }
}

export default PurchasePrintTable
