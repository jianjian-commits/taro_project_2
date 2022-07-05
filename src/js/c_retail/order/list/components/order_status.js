import { t } from 'gm-i18n'
import React from 'react'
import { Popover, ImagePreview } from '@gmfe/react'
import moment from 'moment'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'

import { orderState, getSignWay } from 'common/filter'
import StateContainer from '../../../../order/components/state_container'
import SVGPhoto from 'svg/photo.svg'

const OrderStatus = observer(props => {
  const { orderDetail } = props
  const { status } = orderDetail

  const openPhoto = () => {
    ImagePreview({
      images: [orderDetail.receive_img_url],
      index: 0
    })
  }

  return (
    <Popover
      showArrow
      left
      top
      type='hover'
      popup={
        <div
          className='gm-bg gm-border gm-padding-5'
          style={{ width: '220px' }}
        >
          <div>
            {t('订单状态')}：{orderState(status)}(
            {getSignWay(orderDetail.sign_way)})
          </div>
          <div>
            {t('签收时间')}：
            {orderDetail.receive_time
              ? moment(orderDetail.receive_time).format('YYYY-MM-DD HH:mm')
              : '-'}
          </div>
          <div>
            {t('分拣序号')}：{orderDetail.sort_id}
          </div>
        </div>
      }
    >
      <span>
        <StateContainer status={status}>
          {`${orderState(status)}(${orderDetail.sort_id || '-'})`}
          {orderDetail.receive_img_url && (
            <SVGPhoto
              className='text-primary gm-cursor gm-margin-left-5'
              onClick={openPhoto}
            />
          )}
        </StateContainer>
      </span>
    </Popover>
  )
})

OrderStatus.propTypes = {
  orderDetail: PropTypes.object
}

export default OrderStatus
