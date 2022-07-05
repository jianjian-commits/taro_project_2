import { i18next } from 'gm-i18n'
import React, { useEffect } from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'

import { observer } from 'mobx-react'
import { isLK } from '../../util'
import RemarkInput from '../../components/remark_input'
import { KCInput } from '@gmfe/keyboard'
import KCDisabledCell from '../../../common/components/kc_disabled_cell'
import orderDetailStore from '../../store'
import globalStore from '../../../stores/global'
import ViewPopoverRemark from 'common/components/view_popover_remark'

const RemarkCell = observer(
  ({ spu_remark = '', index, sku, onChange, onSelect }) => {
    const order = orderDetailStore.orderDetail
    const { viewType, _id } = order

    let isLKOrder = null

    useEffect(() => {
      // 如果开启了默认备注，则使用上一次的备注
      if (
        viewType !== 'view' &&
        globalStore?.orderInfo?.default_spu_remark &&
        sku._spu_remark &&
        !spu_remark
      ) {
        onSelect && onSelect(index, 'spu_remark', sku._spu_remark)
      }
    }, [sku._spu_remark])

    if (spu_remark !== null) {
      isLKOrder = isLK(_id)
    }

    if (viewType !== 'view') {
      let isRemarkInvalid = false
      if (sku.code || sku.isCombineGoodsTop) {
        return (
          <KCDisabledCell>
            <span> - </span>
          </KCDisabledCell>
        )
      }

      if (spu_remark !== null && spu_remark !== '') {
        isRemarkInvalid = spu_remark?.length > 100
      }

      if (!isLKOrder) {
        return (
          <RemarkInput
            spu_remark={sku._spu_remark}
            onSelect={(val) => onSelect && onSelect(index, 'spu_remark', val)}
          >
            <KCInput
              onChange={(e) => onChange && onChange(index, e)}
              value={spu_remark}
              onFocus={(e) => {
                e.target.select()
              }}
              style={{ width: '80px' }}
              className={classNames({
                'b-bg-warning': isRemarkInvalid,
              })}
              placeholder={i18next.t('备注')}
              title={isRemarkInvalid ? i18next.t('备注的长度不要超过100') : ''}
              disabled={false}
            />
          </RemarkInput>
        )
      }
    }

    return <ViewPopoverRemark value={spu_remark} />
  },
)

RemarkCell.displayName = 'RemarkCell'
RemarkCell.propTypes = {
  spu_remark: PropTypes.string,
  index: PropTypes.number,
  order: PropTypes.object,
  onChange: PropTypes.func,
  onSelect: PropTypes.func,
}

export default RemarkCell
