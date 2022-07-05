import React, { useState, useEffect } from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { IconDownUp, Popover } from '@gmfe/react'
import PropTypes from 'prop-types'
import Big from 'big.js'
import store from '../../store'
import { withRouter } from 'react-router'

const TurnoverAll = withRouter((props) => {
  const [show, setShow] = useState(false)
  const { turnover_data } = store

  useEffect(() => {
    store.getTurnoverInfo(props.location.query.id)
  }, [])

  const Tr = (text, value) => {
    return (
      <tr>
        <td className='gm-padding-10'>{t(text)}</td>
        {_.map(turnover_data, (item, key) => (
          <td key={key} className='gm-padding-10'>
            {value === 'price'
              ? Big(item[value]).toFixed(2)
              : item[value] || '-'}
          </td>
        ))}
      </tr>
    )
  }

  const table = () => {
    return (
      <div style={{ maxWidth: '500px', overflow: 'auto' }}>
        <table className='table-striped table-bordered'>
          <tbody>
            {Tr('周转物名称', 'tname')}
            {Tr('关联商品', 'sku_name')}
            {Tr('预借出数', 'apply_amount')}
            {Tr('借出数', 'amount')}
            {Tr('单个货值', 'price')}
            <tr>
              <td className='gm-padding-10'>{t('货值')}</td>
              {_.map(turnover_data, ({ amount, price }, key) => (
                <td key={key} className='gm-padding-10'>
                  {amount ? Big(amount).times(price).toFixed(2) : '-'}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    )
  }

  // 没有周转物的话不展示
  if (turnover_data.length === 0 || props.viewType !== 'view') {
    return null
  }

  return (
    <>
      <span className='gm-padding-lr-10 gm-text-desc'>|</span>
      <span>{t('周转物: ')}</span>
      <Popover type='click' showArrow arrowLeft='90' popup={table}>
        <a onClick={() => setShow(!show)} className='gm-cursor'>
          {t('点击查看')} <IconDownUp active={show} />
        </a>
      </Popover>
    </>
  )
})

TurnoverAll.propTypes = {
  skus: PropTypes.array,
}

export default TurnoverAll
