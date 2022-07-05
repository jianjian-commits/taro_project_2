import React, { useRef, useEffect } from 'react'
import { observer } from 'mobx-react'
import { TableX } from '@gmfe/table-x'
import { ManagePaginationV2 } from '@gmfe/business'
import { FormPanel } from '@gmfe/react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'

import store from './store'
import { isCStationAndC } from '../../../../common/service'

const CouponDetailList = observer((props) => {
  const { couponDetailList } = store
  const { id } = props
  const paginationRef = useRef()

  useEffect(() => {
    paginationRef.current.apiDoFirstRequest()
  }, [])

  const columns = [
    { Header: t('账户ID'), accessor: 'user_id', show: !isCStationAndC() },
    { Header: t('店铺名'), accessor: 'shop_name', show: !isCStationAndC() },
    { Header: t('客户名'), accessor: 'user_name', show: isCStationAndC() }, // c端字段
    { Header: t('手机号'), accessor: 'phone', show: isCStationAndC() }, // c端字段
    { Header: t('已领取数'), accessor: 'collect_num' },
    { Header: t('未领取数'), accessor: 'remain_num' },
    { Header: t('已使用数'), accessor: 'used_num' },
  ]

  const handlePage = (pagination) => {
    return store.fetchCouponDetailList(pagination, id)
  }

  return (
    <FormPanel title={t('领取明细')}>
      <ManagePaginationV2
        id='pagination_coupon_detail_list'
        onRequest={handlePage}
        ref={paginationRef}
      >
        <TableX data={couponDetailList.slice()} columns={columns} />
      </ManagePaginationV2>
    </FormPanel>
  )
})

CouponDetailList.propTypes = {
  id: PropTypes.string,
}

export default CouponDetailList
