import React from 'react'
import { observer } from 'mobx-react'
import skuStore from '../../sku_store'
import { Flex, Popover } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import _ from 'lodash'
import { refRatioTypes } from '../../util'
import classNames from 'classnames'
import SVGTriangle from 'svg/down-triangle.svg'

const RefTypeHeader = observer(() => {
  const { craftRefType } = skuStore

  return (
    <Flex alignCenter>
      {i18next.t('出成率参考值')}
      <Popover
        showArrow
        type='click'
        popup={
          <div className='gm-padding-tb-10 gm-padding-lr-15 b-sale-reference-price'>
            {_.map(refRatioTypes, (text, key) => (
              <div
                key={key}
                onClick={() => skuStore.changeCraftRefType(_.toNumber(key))}
                className={classNames(
                  'gm-border-bottom gm-margin-bottom-5 gm-padding-bottom-5',
                  {
                    'gm-text-primary': _.toNumber(key) === craftRefType,
                  }
                )}
              >
                {text}
              </div>
            ))}
          </div>
        }
      >
        <span className='gm-cursor gm-text-primary gm-margin-5'>
          <SVGTriangle />
        </span>
      </Popover>
    </Flex>
  )
})

export default RefTypeHeader
