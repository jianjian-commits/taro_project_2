import { i18next } from 'gm-i18n'
import React from 'react'
import { Popover, Select, Option, ImagePreview } from '@gmfe/react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import moment from 'moment'
import SVGPhoto from 'svg/photo.svg'
import { observer } from 'mobx-react'

import globalStore from '../../../stores/global'
import orderDetailStore from '../../store'
import { editStatusArr } from '../../../common/enum'
import { orderState, getSignWay } from '../../../common/filter'
import StateContainer from '../../components/state_container'

const OrderStatus = observer((props) => {
  const { repair } = props
  const { orderDetail } = orderDetailStore
  const { viewType, status, ostatus } = orderDetail

  const isStatusEditable = globalStore.hasPermission('edit_order_status')

  const handleStatusChange = (value) => {
    orderDetailStore.receiveChange({ status: +value })
  }

  const openPhoto = () => {
    ImagePreview({
      images: [orderDetail.receive_img_url],
      index: 0,
    })
  }

  if (!repair && isStatusEditable && viewType === 'edit' && ostatus < 15) {
    const tmpArr = [...editStatusArr]
    if (ostatus === 1) {
      tmpArr.unshift({
        id: 1,
        text: i18next.t('等待分拣'),
      })
    }

    return (
      <Select
        className='gm-margin-left-10 gm-inline-block'
        style={{ width: '95px' }}
        value={status}
        onChange={handleStatusChange}
      >
        {_.map(
          _.filter(tmpArr, (v) => v.id >= ostatus),
          (val) => {
            return (
              <Option value={val.id} key={val.id}>
                {val.text}
              </Option>
            )
          }
        )}
      </Select>
    )
  } else if (orderDetail._id) {
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
              {i18next.t('订单状态')}：{orderState(orderDetail.status)}(
              {getSignWay(orderDetail.sign_way)})
            </div>
            <div>
              {i18next.t('签收时间')}：
              {orderDetail.receive_time
                ? moment(orderDetail.receive_time).format('YYYY-MM-DD HH:mm')
                : '-'}
            </div>
            <div>
              {i18next.t('分拣序号')}：{orderDetail.sort_id}
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
  } else {
    return null
  }
})

OrderStatus.displayName = 'OrderStatus'

OrderStatus.propTypes = {
  repair: PropTypes.bool,
}

export default OrderStatus
