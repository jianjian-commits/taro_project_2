import React, { useState } from 'react'
import { t } from 'gm-i18n'
import { Observer, observer } from 'mobx-react'
import { Tip, Dialog } from '@gmfe/react'
import qs from 'query-string'
import TinyPrice from 'common/components/tiny_price'
import { history } from 'common/service'
import CommonHeader from '../components/common_header'
import store from './store'

const Header = observer(({ query }) => {
  const [isSaving, setIsSaving] = useState(false)
  const { orderDetail } = store
  // 拿订单详情页的数据
  const totalData = [
    {
      text: t('下单金额'),
      value: (
        <Observer>
          {() => {
            const { fee_type = 0, total_price = 0 } = orderDetail
            return <TinyPrice value={+total_price} feeType={fee_type} />
          }}
        </Observer>
      ),
    },
    {
      text: t('出库金额'),
      value: (
        <Observer>
          {() => {
            const { fee_type = 0, real_price = 0 } = orderDetail
            return <TinyPrice value={+real_price} feeType={fee_type} />
          }}
        </Observer>
      ),
    },
    {
      text: t('销售额'),
      value: (
        <Observer>
          {() => {
            const { fee_type = 0, total_pay = 0 } = orderDetail
            return <TinyPrice value={+total_pay} feeType={fee_type} />
          }}
        </Observer>
      ),
    },
  ]

  const handleCancel = () => {
    history.replace(
      `/order_manage/order/list/detail?${qs.stringify({
        id: orderDetail._id,
        search: query.search,
        offset: query.offset,
      })}`,
    )
  }

  const handleConfirmCancel = () => {
    return Dialog.confirm({
      title: t('提示'),
      children: t('确认放弃此次修改吗？'),
      disableMaskClose: true,
      onOK: () => {
        handleCancel()
      },
    })
  }

  const handleSave = () => {
    if (store.checkSubmit()) {
      setIsSaving(true)
      store
        .save()
        .then((json) => {
          if (!json.code) {
            Tip.success(t('非商品异常修改成功'))
            history.replace(
              `/order_manage/order/list/detail?${qs.stringify({
                id: orderDetail._id,
                search: query.search,
                offset: query.offset,
              })}`,
            )
          }
        })
        .finally(() => {
          setIsSaving(false)
        })
    }
  }

  return (
    <CommonHeader
      totalData={totalData}
      orderDetail={orderDetail}
      onConfirmCancel={handleConfirmCancel}
      onSubmit={handleSave}
      isSaving={isSaving}
    />
  )
})

export default Header
