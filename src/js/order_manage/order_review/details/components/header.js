import React from 'react'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import moment from 'moment'
import { Flex } from '@gmfe/react'
import classNames from 'classnames'

import store from '../store'
import globalStore from 'stores/global'
import ReceiptHeaderDetail from 'common/components/receipt_header_detail'
import HeaderActions from './header_actions'
import { orderState } from 'common/filter'

const Header = () => {
  const { details } = store
  const {
    order_id,
    address_name,
    address_id,
    order_time,
    edit_time,
    applicant,
    status,
  } = details
  const canEditOrderAudit = globalStore.hasPermission('edit_order_audit')

  return (
    <ReceiptHeaderDetail
      className='b-order-detail-header'
      contentLabelWidth={55}
      contentCol={4}
      customeContentColWidth={[360, 330, 330, 330]}
      HeaderInfo={[
        {
          label: t('订单号'),
          item: (
            <>
              {order_id}
              <Flex alignCenter className='gm-inline-block gm-margin-left-5'>
                <div
                  className={classNames('gm-inline-block b-order-status-tag', {
                    'gm-bg-primary': status !== 15,
                  })}
                />
                <span className='gm-text-desc gm-text-12'>
                  {orderState(status)}
                </span>
              </Flex>
            </>
          ),
        },
        {
          label: t('商户'),
          item: (
            <a
              className='gm-cursor'
              href={`https://manage.guanmai.cn/#/customer_manage/customer/manage/${address_id}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              {address_name}/{address_id}
            </a>
          ),
        },
      ]}
      HeaderAction={canEditOrderAudit && <HeaderActions />}
      ContentInfo={[
        {
          label: t('下单时间'),
          item: moment(order_time).format('YYYY-MM-DD HH:mm:ss'),
        },
        { label: t('改单申请'), item: `${applicant} (${edit_time})` },
      ]}
    />
  )
}

export default observer(Header)
