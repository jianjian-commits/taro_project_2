import React from 'react'
import _ from 'lodash'
import { i18next } from 'gm-i18n'
import PropTypes from 'prop-types'

// 要货单据单据 打印都有的四种模板
class RequireGoodsPrintTable extends React.Component {
  render() {
    const { columns, list, type, skuElementsGetter } = this.props
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
          {_.map(list, (rg, index) => {
            let skuElements = skuElementsGetter(list, index, type)
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
                        {accessor ? accessor(rg[field], index) : rg[field]}
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

RequireGoodsPrintTable.propTypes = {
  skuElementsGetter: PropTypes.func.isRequired,
  list: PropTypes.array.isRequired,
  type: PropTypes.string.isRequired,
  columns: PropTypes.array.isRequired,
}

export default RequireGoodsPrintTable
