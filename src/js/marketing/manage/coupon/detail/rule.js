import { i18next } from 'gm-i18n'
import React from 'react'
import {
  FormPanel,
  Form,
  FormItem,
  Select,
  DatePicker,
  Popover,
  Flex,
  ToolTip,
  MultipleFilterSelect,
  Transfer,
  Validator,
  InputNumberV2,
} from '@gmfe/react'
import store from './store'
import { observer } from 'mobx-react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { pinYinFilter } from '@gm-common/tool'
import { AUDIENCETYPE, createCouponUrl, RECEIVETYPT } from '../util'
import Copy from 'common/components/copy'
import { System } from 'common/service'

import drawImg from 'img/coupon_draw.png'
import issueImg from 'img/coupon_issue.png'

const AUDIENCETYPE_LIST = (type) => {
  return _.map(AUDIENCETYPE(), (value, key) => {
    // 1 用户领取： 全部商户、指定商户、商户标签、会员券
    // 2 平台发放： 新商户券、邀请返券、红包分享
    // 不是用户领取就是平台发放，tob，toc的区分加到type中一起判断即可
    const inPlatform = +key === 22 || +key === 2 || +key === 26 || +key === 27

    if (type === 1 && !inPlatform) {
      return {
        text: value,
        value: Number(key),
      }
    } else if (type === 2 && inPlatform) {
      return {
        text: value,
        value: Number(key),
      }
    }
  }).filter((_) => _)
}

@observer
class CouponIssueRule extends React.Component {
  handleTransferSelect = (selected) => {
    store.changeView('merchant', selected)
    store.changeRule('kids', selected)
  }

  handleRuleSelectChange = (name, val) => {
    store.changeRule(name, val)
  }

  handleLabelSelectChange = (item) => {
    store.changeView('addressLabel', item)
    store.changeRule(
      'address_label_ids',
      _.map(item, (v) => v.id),
    )
  }

  handleChangeDate = (val) => {
    store.changeRule('release_time', val)
  }

  onFilter = (list, query) => {
    return pinYinFilter(list, query, (value) => value.name)
  }

  onTransferFilter = (list, query) => {
    return pinYinFilter(list, query, (e) => {
      return 'k' + e.value + e.name.props.children[1].props.children // e.name 是jsx
    })
  }

  handleChangeNumber = (name, value) => {
    store.changeRule(name, value)
  }

  render() {
    const {
      rule: {
        audience_type,
        release_time,
        receive_type,
        collect_limit,
        max_received_num,
      },
      view: { addressLabel, merchant },
      merchantList,
      cms_key,
      merchantLabelList,
    } = store
    const isNew = audience_type === 2 || audience_type === 22
    const promotionUrl =
      this.props.isDetail && cms_key
        ? createCouponUrl(this.props.location.query.id, cms_key)
        : '-'

    let tips = i18next.t('coupon_activity', {
      name:
        audience_type === 3 ||
        audience_type === 23 ||
        audience_type === 4 ||
        audience_type === 24
          ? '所选'
          : '全部',
    })
    if (audience_type === 26) {
      tips = i18next.t(
        '优惠券活动有效期间，商户邀请新商户成功后可享受到优惠券。',
      )
    } else if (audience_type === 25) {
      tips = i18next.t('优惠券活动有效期间，会员用户领取后可享受到该优惠券。')
    } else if (audience_type === 27) {
      tips = i18next.t(
        '优惠券活动有效期间，商户可分享红包给好友领取后可享受到优惠券。',
      )
    }

    const isShareRedEnvelope = audience_type === 27 // 红包
    const isInvited = audience_type === 26 // 邀请有礼

    const canShowSendTime = !isShareRedEnvelope && !isInvited

    return (
      <FormPanel title={i18next.t('发放规则')}>
        <Form
          ref={this.props.forwardRef}
          className='gm-margin-15'
          disabledCol
          labelWidth='120px'
        >
          <FormItem label={i18next.t('领取方式')}>
            <Flex alignCenter style={{ paddingTop: '6px' }}>
              <Select
                value={receive_type}
                name='type'
                data={RECEIVETYPT()}
                disabled={this.props.isDetail}
                style={{ width: '260px' }}
                onChange={this.handleRuleSelectChange.bind(
                  this,
                  'receive_type',
                )}
              />
              <span>
                {isNew || audience_type === 26
                  ? i18next.t('平台发放')
                  : System.isC()
                  ? i18next.t('客户领取')
                  : i18next.t('商户领取')}
              </span>
              <ToolTip
                top
                popup={
                  <div className='gm-border gm-padding-5 gm-bg'>
                    <img
                      src={receive_type === 2 ? issueImg : drawImg}
                      style={{ width: '280px' }}
                    />
                  </div>
                }
                className='gm-margin-left-5'
              />
            </Flex>
          </FormItem>
          {audience_type !== 26 && !isShareRedEnvelope && (
            <FormItem
              label={
                System.isC()
                  ? i18next.t('单个客户限领取')
                  : i18next.t('单个用户限领取')
              }
              name='collect_limit'
              required
              validate={Validator.create([], collect_limit)}
            >
              <Flex alignCenter>
                <InputNumberV2
                  value={collect_limit}
                  onChange={this.handleChangeNumber.bind(this, 'collect_limit')}
                  min={0}
                  max={999999999}
                  disabled={this.props.isDetail}
                  placeholder={i18next.t(
                    '请输入单个账户最大可领取的优惠券数量',
                  )}
                  className='form-control input-sm'
                  style={{ width: '260px' }}
                />
                <span className='gm-padding-5'>{i18next.t('张')}</span>
              </Flex>
            </FormItem>
          )}
          <FormItem label={i18next.t('可见范围')} required>
            <Select
              value={audience_type}
              name='type'
              data={AUDIENCETYPE_LIST(receive_type)}
              disabled={this.props.isDetail}
              style={{ width: '260px' }}
              onChange={this.handleRuleSelectChange.bind(this, 'audience_type')}
            />
            <div className='gm-text-12 gm-text-desc'>{tips}</div>
          </FormItem>
          {isShareRedEnvelope && (
            <FormItem
              label={i18next.t('单个红包券数')}
              name='max_received_num'
              required
              validate={Validator.create([], max_received_num)}
            >
              <Flex alignCenter>
                <InputNumberV2
                  value={max_received_num}
                  onChange={this.handleChangeNumber.bind(
                    this,
                    'max_received_num',
                  )}
                  min={0}
                  max={999999999}
                  placeholder={i18next.t('请输入单个红包内优惠券数量')}
                  className='form-control input-sm'
                  style={{ width: '260px' }}
                  disabled={this.props.isDetail}
                />
              </Flex>
            </FormItem>
          )}
          {(audience_type === 3 || audience_type === 23) && (
            <FormItem
              label={i18next.t('商户标签')}
              name='address_label_ids'
              required
              width='180px'
            >
              <div style={{ width: '260px' }}>
                <MultipleFilterSelect
                  id='id'
                  disabled={this.props.isDetail}
                  list={merchantLabelList.slice()}
                  selected={addressLabel.slice()}
                  onSelect={this.handleLabelSelectChange}
                  withFilter={this.onFilter}
                  placeholder={i18next.t('全部商户标签')}
                />
              </div>
            </FormItem>
          )}
          {(audience_type === 4 || audience_type === 24) && (
            <FormItem
              label={i18next.t('商户')}
              name='address_label_ids'
              required
            >
              <Transfer
                listStyle={{
                  width: '400px',
                  height: '350px',
                }}
                disabled={this.props.isDetail}
                leftWithFilter={this.onTransferFilter}
                rightWithFilter={this.onTransferFilter}
                list={merchantList}
                selectedValues={merchant}
                onSelect={this.handleTransferSelect}
                leftTitle={i18next.t('全部商户')}
                rightTitle={i18next.t('已选商户')}
                leftPlaceHolder={
                  audience_type === 24
                    ? i18next.t('输入用户名、手机号')
                    : i18next.t('输入账户ID、店铺名称')
                }
                rightPlaceHolder={
                  audience_type === 24
                    ? i18next.t('输入用户名、手机号')
                    : i18next.t('输入账户ID、店铺名称')
                }
              />
            </FormItem>
          )}
          {canShowSendTime && (
            <FormItem
              label={i18next.t('发放时间')}
              name='release_time'
              required
            >
              <Flex alignCenter>
                <span className='gm-padding-5'>{i18next.t('请选择，自')}</span>
                <DatePicker
                  disabled={this.props.isDetail}
                  date={release_time}
                  onChange={this.handleChangeDate}
                  min={new Date()}
                  enabledTimeSelect
                />
                <span className='gm-padding-5'>{i18next.t('发放')}</span>
              </Flex>
            </FormItem>
          )}
          {this.props.isDetail &&
          audience_type !== 2 &&
          audience_type !== 22 ? (
            <FormItem label={i18next.t('推广链接')}>
              <Copy text={promotionUrl}>
                <div>
                  <span className='gm-cursor'>{promotionUrl}</span>
                  <Popover
                    type='hover'
                    popup={
                      <span className='gm-inline-block gm-padding-5'>
                        {i18next.t('复制')}
                      </span>
                    }
                    showArrow
                    top
                  >
                    <i className='gm-margin-left-15 gm-cursor ifont ifont-clipboard' />
                  </Popover>
                </div>
              </Copy>
              <div className='gm-text-desc gm-text-12'>
                {i18next.t(
                  '固定URL可用于外部推广，通过链接跳转至相应优惠券领取页面',
                )}
              </div>
            </FormItem>
          ) : (
            <FormItem label={i18next.t('推广链接')}>
              <span className='gm-inline-block gm-padding-tb-5'>-</span>
            </FormItem>
          )}
        </Form>
      </FormPanel>
    )
  }
}

CouponIssueRule.propTypes = {
  isDetail: PropTypes.bool,
  forwardRef: PropTypes.object,
}

// 转发form实例，在form提交时候能出触发验证
export default React.forwardRef((props, ref) => (
  <CouponIssueRule forwardRef={ref} {...props} />
))
