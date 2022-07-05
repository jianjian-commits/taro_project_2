import { t } from 'gm-i18n'
import React from 'react'
import { Button, RightSideModal, Dialog } from '@gmfe/react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import qs from 'query-string'

import HeaderNav from '../../../../order/order_detail/components/detail_header_nav'
import globalStore from 'stores/global'
import { openNewTab } from 'common/util'
import PrintModal from '../../../../store_operation/distribute/order_tab/popup_print_modal'
import { isLK } from '../../../../order/util'
import { history } from 'common/service'
import store from '../order_detail/store'

const DetailHeaderAction = (props) => {
  const { query } = props
  const p_print = globalStore.hasPermission('get_distribute_print')
  const addException = globalStore.hasPermission('add_exception')
  const { orderDetail } = store
  const { _id, freeze, pay_status, settle_way } = orderDetail

  const handlePrint = async () => {
    // 是否存在称重商品当前尚未称重
    const unWeightedSku = _.find(
      orderDetail.details,
      (sku) => sku.is_weigh && !sku.weighted
    )
    let confirm = false

    if (unWeightedSku) {
      confirm = await Dialog.confirm({
        children: t('存在称重商品未称重或已缺货，确定要打印吗？'),
      })
        .then(() => {
          return true
        })
        .catch(() => {
          return false
        })
    }

    if (!unWeightedSku || confirm) {
      if (globalStore.isMalaysia()) {
        openNewTab(
          `#/system/setting/distribute_templete/malay_print?${qs.stringify({
            order_ids: _id,
          })}`
        )
      } else {
        RightSideModal.render({
          onHide: RightSideModal.hide,
          style: { width: '300px' },
          children: (
            <PrintModal curOrderId={_id} closeModal={RightSideModal.hide} />
          ),
        })
      }
    }
  }

  const handleAfterSales = () => {
    history.push(
      `/c_retail/order/list/abnormal_after_sales?${qs.stringify({
        id: _id,
        search: query.search,
        offset: query.offset,
      })}`
    )
  }

  return (
    <>
      {addException && !isLK(_id) && (
        <Button
          type='primary'
          disabled={!!(freeze || (pay_status === 1 && settle_way === 2))}
          onClick={handleAfterSales}
        >
          {t('售后')}
        </Button>
      )}
      {p_print && (
        <Button className='gm-margin-left-10' onClick={handlePrint}>
          {t('打印')}
        </Button>
      )}
      <div
        style={{ height: '20px' }}
        className='gm-padding-left-15 gm-margin-right-5 gm-border-right'
      />
      <HeaderNav query={query} viewType='view'>
        <div className='gm-padding-5' />
      </HeaderNav>
    </>
  )
}

DetailHeaderAction.propTypes = {
  query: PropTypes.object,
}

export default DetailHeaderAction
