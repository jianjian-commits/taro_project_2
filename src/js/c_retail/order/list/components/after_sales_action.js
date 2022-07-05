import { t } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { Button, Dialog, Tip } from '@gmfe/react'
import qs from 'query-string'

import store from '../../after_sales/store'
import { history } from 'common/service'

const AfterSalesHeaderAction = observer((props) => {
  const { orderDetail } = store
  const { freeze } = orderDetail

  const handleCancel = () => {
    Dialog.confirm({
      title: t('提示'),
      children: t('确认放弃此次修改吗？'),
      disableMaskClose: true,
      onOK: () => {
        history.replace(
          `/c_retail/order/list/detail?${qs.stringify({
            id: orderDetail._id,
            search: props.query.search,
            offset: props.query.offset,
          })}`
        )
      },
    })
  }

  const handleEdit = (_id) => {
    const result = store.checkAfterSaleAmount()
    if (!result) {
      return
    }
    store.save().then((json) => {
      if (!json.code) {
        Tip.success(t('订单售后修改成功'))
        history.replace(
          `/c_retail/order/list/detail?${qs.stringify({
            id: _id,
            search: props.query.search,
            offset: props.query.offset,
          })}`
        )
      }
    })
  }

  const handleSubmit = () => {
    const { _id } = orderDetail
    handleEdit(_id)
  }

  return (
    <>
      <Button onClick={handleCancel}>{t('取消')}</Button>
      <Button
        type='primary'
        className='gm-margin-left-10'
        disabled={Boolean(freeze)}
        onClick={handleSubmit}
      >
        {t('保存')}
      </Button>
    </>
  )
})

export default AfterSalesHeaderAction
