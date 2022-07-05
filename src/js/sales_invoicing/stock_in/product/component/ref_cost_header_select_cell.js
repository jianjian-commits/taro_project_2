import React from 'react'
import { observer } from 'mobx-react'
import { referenceCosts } from '../../util'
import _ from 'lodash'
import { Flex, Popover } from '@gmfe/react'
import classNames from 'classnames'
import { RefPriceToolTip } from '../../../../common/components/ref_price_type_hoc'
import store from '../store/receipt_store'

const RefCostHeaderSelectCell = observer(() => {
  const { showRefCostType } = store

  const handleChangeReferencePrice = (type) => {
    store.changeShowRefCostType(type)
  }
  const { text } =
    _.find(referenceCosts, (v) => v.value === showRefCostType) || {}

  return (
    <Flex alignCenter>
      <RefPriceToolTip name={text} />
      <Popover
        showArrow
        type='click'
        popup={
          <div className='gm-padding-tb-10 gm-padding-lr-15 b-sale-reference-price'>
            {_.map(referenceCosts, (item, i) => (
              <div
                key={i}
                onClick={() => handleChangeReferencePrice(item.value)}
                className={classNames(
                  'gm-border-bottom gm-margin-bottom-5 gm-padding-bottom-5',
                  {
                    'text-primary': item.value === showRefCostType,
                  }
                )}
              >
                {item.text}
              </div>
            ))}
          </div>
        }
      >
        <i
          className='ifont ifont-down-triangle text-primary gm-margin-left-5 gm-text-12'
          style={{ cursor: 'pointer' }}
        />
      </Popover>
    </Flex>
  )
})

export default RefCostHeaderSelectCell
