import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { Tip, Dialog } from '@gmfe/react'
import { observer } from 'mobx-react'
import qs from 'query-string'

import afterSalesStore from './store'
import { history } from '../../common/service'
import CommonHeader from './components/common_header'

@observer
class AfterSalesHeader extends React.Component {
  state = {
    isSaving: false,
  }

  handleSubmit = () => {
    this.setState({
      isSaving: true,
    })

    const { _id, coupon_amount } = afterSalesStore.orderDetail
    if (coupon_amount !== 0) {
      const result = afterSalesStore.checkAfterSaleAmount()
      if (!result) {
        return
      }
      // 有使用优惠券
      afterSalesStore
        .checkReturnCoupon()
        .then((json) => {
          if (json.data.max_discount_percent) {
            Dialog.confirm({
              children:
                i18next.t(
                  /* src:`当前优惠比例已小于订单可享受的最大优惠比例${json.data.max_discount_percent}` => tpl:当前优惠比例已小于订单可享受的最大优惠比例${num} */ 'coupon_order_edit_abnormal_rate',
                  { num: json.data.max_discount_percent },
                ) +
                '%，' +
                i18next.t(
                  '保存后该笔订单将按原价计算销售额，优惠券返还至用户账户，是否继续保存？',
                ),
              title: i18next.t('提示'),
            }).then(
              () => {
                this.handleEdit(_id)
              },
              () => {
                console.log('reject')
              },
            )
          } else {
            this.handleEdit(_id)
          }
        })
        .finally(() => {
          this.setState({
            isSaving: false,
          })
        })
    } else {
      this.handleEdit(_id)
    }
  }

  handleEdit = (_id) => {
    this.setState({
      isSaving: true,
    })
    const result = afterSalesStore.checkAfterSaleAmount()
    if (!result) {
      this.setState({
        isSaving: false,
      })
      return
    }

    afterSalesStore
      .save()
      .then((json) => {
        if (!json.code) {
          Tip.success(i18next.t('订单售后修改成功'))
          history.replace(
            `/order_manage/order/list/detail?${qs.stringify({
              id: _id,
              search: this.props.query.search,
              offset: this.props.query.offset,
            })}`,
          )
        }
      })
      .finally(() => {
        this.setState({
          isSaving: false,
        })
      })
  }

  handleConfirmCancel = () => {
    Dialog.confirm({
      title: i18next.t('提示'),
      children: i18next.t('确认放弃此次修改吗？'),
      disableMaskClose: true,
      onOK: () => {
        this.handleCancel()
      },
    })
  }

  handleCancel = () => {
    history.replace(
      `/order_manage/order/list/detail?${qs.stringify({
        id: afterSalesStore.orderDetail._id,
        search: this.props.query.search,
        offset: this.props.query.offset,
      })}`,
    )
  }

  render() {
    return (
      <CommonHeader
        orderDetail={afterSalesStore.orderDetail}
        onSubmit={this.handleSubmit}
        onConfirmCancel={this.handleConfirmCancel}
        isSaving={this.state.isSaving}
      />
    )
  }
}

AfterSalesHeader.propTypes = {
  query: PropTypes.object,
}

export default AfterSalesHeader
