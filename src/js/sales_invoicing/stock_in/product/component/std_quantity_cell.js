/*
 * @Autor: xujiahao
 * @Date: 2021-11-11 11:10:41
 * @LastEditors: xujiahao
 * @LastEditTime: 2021-11-11 14:16:29
 * @FilePath: /gm_static_stationv2/src/js/sales_invoicing/stock_in/product/component/std_quantity_cell.js
 */
import React from 'react'
import { observer } from 'mobx-react'
import store from '../store/receipt_store'
import { Dialog, Flex, Popover } from '@gmfe/react'
import { isInShare } from '../../util'
import { SvgWeight } from 'gm-svg'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import globalStore from '../../../../stores/global'
import weightStore from '../../../../stores/weight'
import { t } from 'gm-i18n'
import Big from 'big.js'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'
import PropTypes from 'prop-types'
import { TableXUtil } from '@gmfe/table-x'

const { TABLE_X } = TableXUtil

const StdQuantityCell = observer((props) => {
  const { stockInShareList } = store
  const { index, data } = props
  const { quantity, std_unit, name, id, tare_quantity } = data
  const weigh_stock_in = globalStore.groundWeightInfo.weigh_stock_in

  const handleQuantityChange = (value) => {
    store.setQuantityChange(index, value)
  }

  const handleReadingPound = () => {
    const weight = Big(quantity || 0).toFixed(2)
    let weightBridgeData = +(weightStore.data || 0)
    // 如果开启了地磅称重，则减去皮重
    if (weigh_stock_in && tare_quantity) {
      weightBridgeData -= tare_quantity
    }

    if (+weight > 0) {
      Dialog.confirm({
        children: t('当前已有入库数，是否更新入库数？'),
        title: t('提示'),
      }).then(() => {
        handleQuantityChange(weightBridgeData)
      })
    } else {
      handleQuantityChange(weightBridgeData)
    }
  }

  return (
    <>
      {isInShare(stockInShareList, id) ? (
        quantity + (std_unit || '-')
      ) : (
        <Flex alignCenter>
          <KCInputNumberV2
            autocomplete='off'
            value={quantity}
            onChange={handleQuantityChange}
            min={0}
            precision={2}
            className='form-control input-sm'
            style={{ width: TABLE_X.WIDTH_NUMBER }}
          />
          <span className='gm-padding-5'>{std_unit || '-'}</span>
          {!!weigh_stock_in && name && (
            <Popover
              type='hover'
              showArrow
              right
              popup={
                <div className='gm-padding-5'>
                  {+(weightStore.data || 0)
                    ? `读磅数：${+weightStore.data}`
                    : '-'}
                </div>
              }
            >
              <button onClick={handleReadingPound}>
                <SvgWeight style={{ fontSize: '1.4em' }} />
                {t('读磅')}
              </button>
            </Popover>
          )}
        </Flex>
      )}
    </>
  )
})

StdQuantityCell.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(StdQuantityCell)
