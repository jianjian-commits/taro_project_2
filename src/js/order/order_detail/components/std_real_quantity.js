import { i18next } from 'gm-i18n'
import React from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { KCInputNumberV2 } from '@gmfe/keyboard'
import { observer } from 'mobx-react'

import { isAbnormalFun } from '../../util'
import ModifyTip from '../../../common/components/modify/modify_tip'
import KCDisabledCell from '../../../common/components/kc_disabled_cell'

const StdRealQuantity = observer(
  ({
    index,
    sku,
    isQuantityEditable,
    viewType,
    onChange,
    onKeyDown,
    inputWidth,
  }) => {
    if (viewType === 'create') {
      return '-'
    }

    if (sku.isNewItem && viewType !== 'view') {
      return (
        <KCDisabledCell>
          <span>-</span>
        </KCDisabledCell>
      )
    }

    let unit = null
    let renderValue = null
    let valueBackup = null
    // 是否缺货
    let outOfStock = null
    // 是否异常
    let isAbnormal = false
    // 是否是记重任务
    // is_weight是搜索商品时的是否称重商品，带t，详情的is_weight是不带t
    let isWeigh = null
    // 是否已称重
    let weighted = null
    let isPrint = null
    // 当【未称重】时，显示为空

    if (sku.std_real_quantity !== null) {
      unit = sku.std_unit_name_forsale
      valueBackup = sku.std_real_quantity_backup
      outOfStock = sku.out_of_stock
      isAbnormal = isAbnormalFun(sku)
      isWeigh = sku.is_weigh === undefined ? sku.is_weight : sku.is_weigh
      weighted = sku.weighted
      isPrint = sku.is_print
      renderValue =
        sku.std_real_quantity === '' ? null : sku.std_real_quantity * 1.0
    }

    // 净菜商品不能修改基本单位
    if (!sku.clean_food && isQuantityEditable && viewType !== 'view') {
      return (
        <div>
          <KCInputNumberV2
            disabled={Boolean(isAbnormal)}
            value={isAbnormal ? valueBackup : renderValue}
            onChange={(v) => onChange && onChange(index, v)}
            style={{ width: inputWidth }}
            min={0}
            className={classNames('form-control gm-inline')}
          />
          <span className='gm-padding-5'>{unit}</span>
          <ModifyTip
            realIsWeight={isWeigh}
            printed={isPrint}
            isWeight={weighted}
            outOfStock={outOfStock}
          />
        </div>
      )
    } else {
      if (!outOfStock && sku.std_real_quantity !== null) {
        return (
          <div>
            <span
              className={classNames('gm-inline-block', {
                'b-order-active-color': isWeigh && !!weighted,
              })}
            >
              {(sku.std_real_quantity || sku.std_real_quantity_backup) + unit}
            </span>
            <ModifyTip
              realIsWeight={isWeigh}
              printed={isPrint}
              isWeight={weighted}
              outOfStock={outOfStock}
            />
          </div>
        )
      } else if (outOfStock || sku.std_real_quantity === 0) {
        return (
          <div>
            <span className='gm-text-red gm-inline-block'>
              {i18next.t('缺货')}
            </span>
            <ModifyTip
              realIsWeight={isWeigh}
              printed={isPrint}
              isWeight={weighted}
              outOfStock={outOfStock}
              isSellout
            />
          </div>
        )
      } else {
        return '-'
      }
    }
  }
)

StdRealQuantity.displayName = 'StdRealQuantity'
StdRealQuantity.propTypes = {
  index: PropTypes.number,
  sku: PropTypes.object,
  isQuantityEditable: PropTypes.bool,
  viewType: PropTypes.string,
  onChange: PropTypes.func,
}

export default StdRealQuantity
