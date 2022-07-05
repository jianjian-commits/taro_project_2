import { t } from 'gm-i18n'
import React from 'react'
import { FormGroup, Tip } from '@gmfe/react'
import CouponBasicInfo from './basic_info'
import CouponIssueRule from './rule'
import store from './store'
import { history, System } from 'common/service'
import { observer } from 'mobx-react'

import CouponDetailList from './detail_list'

@observer
class CouponDetail extends React.Component {
  constructor(props) {
    super(props)
    this.baseRef = React.createRef()
    this.issueRef = React.createRef()

    if (System.isC() && !props.location.query.id) {
      store.changeRule('audience_type', 21)
    }
  }

  componentDidMount() {
    const { id, isCopy } = this.props.location.query
    if (id) {
      store.getCouponDetail({ id, isCopy })
    }
    // 获取一级分类
    store.getCategoryIdOne()
    // 获取商户标签
    store.getAddressLabel()
    // 获取商户
    store.getMerchant()
    // 如果是零售优惠券，则max_discount_percent默认为100
    store.changeDetail('max_discount_percent', 100)
  }

  componentWillUnmount() {
    store.clear()
  }

  handleResult = (json, type) => {
    if (json.code === 0) {
      Tip.success(type + t('成功'))

      history.push(System.getUrl('/marketing/manage/coupon'))
    }
  }

  handleSaveRule = () => {
    const { id, isCopy } = this.props.location.query
    const isDetail = !!id && !isCopy
    if (isDetail) {
      store.edit().then((json) => {
        this.handleResult(json, t('修改'))
      })
    } else {
      store.save().then((json) => {
        this.handleResult(json, t('新建'))
      })
    }
  }

  handleCancel = () => {
    history.push(System.getUrl('/marketing/manage/coupon'))
  }

  render() {
    const { id, isCopy } = this.props.location.query
    const isDetail = !!id && !isCopy
    return (
      <FormGroup
        formRefs={[this.baseRef, this.issueRef]}
        onCancel={this.handleCancel}
        onSubmit={this.handleSaveRule}
      >
        <CouponBasicInfo
          ref={this.baseRef}
          isDetail={isDetail}
          {...this.props}
        />
        <CouponIssueRule
          ref={this.issueRef}
          isDetail={isDetail}
          {...this.props}
        />
        {isDetail && <CouponDetailList id={this.props.location.query.id} />}
      </FormGroup>
    )
  }
}

export default CouponDetail
