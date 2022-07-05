import { i18next } from 'gm-i18n'
import React, { useState } from 'react'
import { IconDownUp, Popover } from '@gmfe/react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import Big from 'big.js'

const Summary = (props) => {
  const { skus, viewType } = props
  const [show, setShow] = useState(false)

  const renderTable = (skus) => {
    const tempWithGroupBy = _.groupBy(skus, 'category_title_1')
    const category = []
    const lengths = []
    const sumArr = []

    _.forEach(tempWithGroupBy, (item, key) => {
      const all = _.reduce(item, (sum, n) => sum + n.total_item_price, 0)
      category.push(key)
      lengths.push(item.length)
      sumArr.push(all)
    })

    return (
      <div style={{ maxWidth: '500px', overflow: 'auto' }}>
        <table className='table-striped table-bordered'>
          <tbody>
            <tr>
              <td className='gm-padding-10'>{i18next.t('类别')}</td>
              {_.map(category, (item, i) => (
                <td key={i} className='gm-padding-10'>
                  {item}
                </td>
              ))}
            </tr>
            <tr>
              <td className='gm-padding-10'>{i18next.t('商品数')}</td>
              {_.map(lengths, (item, i) => (
                <td key={i} className='gm-padding-10'>
                  {item}
                </td>
              ))}
            </tr>
            <tr>
              <td className='gm-padding-10'>{i18next.t('金额小计')}</td>
              {_.map(sumArr, (item, i) => (
                <td key={i} className='gm-padding-10'>
                  {Big(item || 0)
                    .div(100)
                    .toFixed(2)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  if (viewType !== 'view' || !skus.length) return null

  return (
    <>
      <span className='gm-padding-lr-10 gm-text-desc'>|</span>
      <span>{i18next.t('分类统计: ')}</span>
      <Popover type='click' showArrow arrowLeft='90' popup={renderTable(skus)}>
        <a onClick={() => setShow(!show)} className='gm-cursor'>
          {i18next.t('点击查看')} <IconDownUp active={show} />
        </a>
      </Popover>
    </>
  )
}

Summary.displayName = 'Summary'

Summary.propTypes = {
  skus: PropTypes.array,
  viewType: PropTypes.string,
}

export default Summary
