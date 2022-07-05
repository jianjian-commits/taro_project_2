import React from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import moment from 'moment'
import PropTypes from 'prop-types'
import { Flex, Button, Popover } from '@gmfe/react'
import ReceiptHeaderDetail from 'common/components/receipt_header_detail'
import { changeDomainName } from 'common/service'
import { renderOrderTypeName } from 'common/deal_order_process'
import {
  convertNumber2Sid,
  orderState,
  findReceiveWayById,
} from 'common/filter'
import { isStation } from '../../util'
import StateContainer from '../../components/state_container'
import { client as orderClient } from '../../order_detail/components/detail_header_two'

class CommonHeader extends React.Component {
  renderOrderTypeName = () => {
    const { order_process_name, client } = this.props.orderDetail
    return (
      <Flex row alignCenter>
        {renderOrderTypeName(order_process_name)}
        &nbsp;·&nbsp;
        {orderClient({ client })}
      </Flex>
    )
  }

  handleConfirmCancel = () => {
    this.props.onConfirmCancel()
  }

  handleSubmit = () => {
    this.props.onSubmit()
  }

  render() {
    const { totalData, orderDetail } = this.props
    const {
      customer,
      time_config_info,
      _id,
      remark,
      date_time,
      last_op_user,
      last_op_time,
      freeze,
      status,
      sort_id,
    } = orderDetail

    const hasCustomer = !_.isEmpty(customer)

    return (
      <ReceiptHeaderDetail
        className='b-order-detail-header'
        contentCol={3}
        contentLabelWidth={55}
        customeContentColWidth={[360, 360, 360]}
        totalData={!totalData ? undefined : totalData}
        HeaderInfo={[
          {
            label: t('商户'),
            item: (
              <Flex flex alignCenter>
                {hasCustomer ? (
                  <a
                    href={
                      changeDomainName('station', 'manage') +
                      `/#/customer_manage/customer/manage/${convertNumber2Sid(
                        customer.address_id,
                      )}`
                    }
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {`${customer.extender.resname}/${
                      isStation(customer.address_id)
                        ? customer.address_id
                        : convertNumber2Sid(customer.address_id)
                    }`}
                  </a>
                ) : (
                  '-'
                )}
              </Flex>
            ),
          },
          {
            label: t('订单号'),
            item: (
              <Flex flex alignCenter>
                {_id || '-'}&nbsp;&nbsp;
                {
                  <Popover
                    showArrow
                    type='hover'
                    left
                    top
                    popup={
                      <div
                        className='gm-bg gm-border gm-padding-5'
                        style={{ width: '220px' }}
                      >
                        {t('订单状态')}：{orderState(status)}
                        {t('，分拣序号')}：{sort_id}
                      </div>
                    }
                  >
                    <span>
                      <StateContainer status={status}>
                        {`${orderState(status)}(${sort_id || '-'})`}
                      </StateContainer>
                    </span>
                  </Popover>
                }
              </Flex>
            ),
          },
        ]}
        HeaderAction={
          <Flex justifyEnd>
            <Button
              className='gm-margin-top-5'
              onClick={this.handleConfirmCancel}
            >
              {t('取消')}
            </Button>
            <Button
              loading={this.props.isSaving}
              type='primary'
              className='gm-margin-top-5 gm-margin-left-5'
              disabled={!!freeze}
              onClick={this.handleSubmit}
            >
              {t('保存')}
            </Button>
          </Flex>
        }
        ContentInfo={[
          {
            label: t('运营时间'),
            item: (
              <div>{(time_config_info && time_config_info.name) || '-'}</div>
            ),
          },
          {
            label: t('收货时间'),
            item: (
              <div>
                {hasCustomer
                  ? `${customer.receive_begin_time}~${customer.receive_end_time}`
                  : '-'}
              </div>
            ),
          },
          {
            label: t('订单备注'),
            item: (
              <Popover
                showArrow
                type='hover'
                popup={
                  <div
                    className='gm-bg gm-padding-10'
                    style={{ width: '400px', wordBreak: 'break-all' }}
                  >
                    {remark || '-'}
                  </div>
                }
              >
                <Flex
                  flex
                  alignCenter
                  className='b-ellipsis-order-remark'
                  style={{ wordBreak: 'break-all' }}
                >
                  {remark || '-'}
                </Flex>
              </Popover>
            ),
          },
          {
            label: t('下单时间'),
            item: (
              <div>
                {date_time
                  ? moment(date_time).format('YYYY-MM-DD HH:mm:ss')
                  : '-'}
              </div>
            ),
          },
          {
            label: t('收货人'),
            item: (
              <div>
                {hasCustomer
                  ? `${customer.receiver_name}（${customer.receiver_phone}）`
                  : '-'}
              </div>
            ),
          },
          {
            label: t('订单类型'),
            item: this.renderOrderTypeName(),
          },
          {
            label: t('地址'),
            item: (
              <div>
                {customer ? (
                  <span
                    className='label label-primary gm-text-12'
                    style={{ padding: '1px 2px', marginRight: '2px' }}
                  >
                    {findReceiveWayById(customer.receive_way) || t('未知')}
                  </span>
                ) : null}
                {customer ? customer.address : '-'}
              </div>
            ),
          },
          {
            label: t('最后操作'),
            item: (
              <div>
                {last_op_user || '-'} (
                {last_op_time
                  ? moment(last_op_time).format('YYYY-MM-DD HH:mm:ss')
                  : '-'}
                )
              </div>
            ),
          },
        ]}
      />
    )
  }
}

CommonHeader.propTypes = {
  orderDetail: PropTypes.object.isRequired,
  totalData: PropTypes.array,
  onSubmit: PropTypes.func.isRequired,
  onConfirmCancel: PropTypes.func.isRequired,
  isSaving: PropTypes.bool.isRequired,
}

export default CommonHeader
