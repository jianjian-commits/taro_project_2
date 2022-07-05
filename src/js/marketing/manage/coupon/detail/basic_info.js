import { i18next } from 'gm-i18n'
import React from 'react'
import {
  FormPanel,
  Flex,
  Form,
  FormItem,
  FormButton,
  Select,
  InputNumber,
  Button,
  Switch,
  Modal,
  Price,
  Validator,
  DateRangePicker,
} from '@gmfe/react'
import PropTypes from 'prop-types'
import _ from 'lodash'
import styled from 'styled-components'

import store from './store'
import { observer } from 'mobx-react'
import Big from 'big.js'
import { TYPE, TIME_TYPE } from '../util'
import MaxDiscountDemo from './max_discount_demo'
import CouponInstantDemo from './instant_demo'
import { System } from 'common/service'
import moment from 'moment'
import CouponCate from './components/coupon_cate'

const TYPE_LIST = _.map(TYPE, (value, key) => ({
  text: value,
  value: Number(key),
}))

const DateStyled = styled(DateRangePicker)`
  width: 260px;
`

@observer
class CouponBasicInfo extends React.Component {
  constructor(props) {
    super(props)
    this.basicBtn = React.createRef()
  }

  componentDidMount() {
    window.addEventListener('submit', this.handleSubmit)
  }

  handleSubmit = () => {
    this.basicBtn.current && this.basicBtn.current.click()
  }

  handleCheckName = () => {
    const { name } = store.basicInfo
    if (name === '' || name.length > 20) {
      return i18next.t('只能输入20个字以内')
    }
    return ''
  }

  handleCheckCondition = () => {
    const { min_total_price, price_value } = store.basicInfo
    if (min_total_price === '' || price_value === '' || +min_total_price <= 0) {
      return i18next.t('请输入大于0的数')
    }
    if (Big(price_value).gte(min_total_price)) {
      return i18next.t('使用条件的金额需大于单张面值金额')
    }
    return ''
  }

  handleCheckMaxPercent = () => {
    const {
      min_total_price,
      price_value,
      max_discount_percent,
    } = store.basicInfo
    if (min_total_price === '' || price_value === '') return ''

    if (+min_total_price <= 0) {
      return i18next.t('使用条件的值需大于0')
    }

    // 优惠券比例： （使用条件 - 单张面值）/ 使用条件
    const max = Big(Big(min_total_price).minus(price_value || 0))
      .div(min_total_price)
      .times(100)
      .toFixed(2)
    if (Big(max_discount_percent).gt(max)) {
      return i18next.t(
        /* tpl: 请输入大于0小于等于${max}的数，否则会造成优惠券无法使用 */ 'coupon_warning_count',
        { max },
      )
    }
    return ''
  }

  handleChangeInput = (e) => {
    store.changeDetail(e.target.name, e.target.value)
  }

  handleDetailSelectChange = (value) => {
    store.changeDetail('type', value)
  }

  handleChangeNumber = (name, val) => {
    store.changeDetail(name, val)
  }

  handleCheckValidityDay = () => {
    const { validity_day } = store.basicInfo
    if (+validity_day <= 0) {
      return i18next.t('请输入大于0的数')
    }
  }

  handleChangeSwitch = () => {
    const { is_active } = store.basicInfo
    store.changeDetail('is_active', is_active === 1 ? 0 : 1)
  }

  handleShowDemo = () => {
    Modal.render({
      title: i18next.t('示例'),
      style: { width: '700px' },
      onHide: Modal.hide,
      children: <MaxDiscountDemo />,
    })
  }

  handleSelectChange = (name, value) => {
    store.changeDetail(name, value)
  }

  handleCheckValidTime = () => {
    const { valid_time_end, valid_time_start } = store.basicInfo
    if (!valid_time_start || !valid_time_end) {
      return i18next.t('请选择有效期')
    }

    return ''
  }

  render() {
    const {
      basicInfo: {
        name,
        description,
        is_active,
        max_discount_percent,
        min_total_price,
        price_value,
        type,
        validity_day,
        time_type,
        valid_time_end,
        valid_time_start,
      },
    } = store
    return (
      <FormPanel title={i18next.t('基本信息')}>
        <Flex>
          <Flex flex={7}>
            <Form
              ref={this.props.forwardRef}
              disabledCol
              className='gm-padding-15'
              labelWidth='120px'
            >
              <FormItem
                label={i18next.t('优惠券名称')}
                required
                validate={Validator.create([], name, this.handleCheckName)}
              >
                <input
                  disabled={this.props.isDetail}
                  maxLength={20}
                  style={{ width: '260px' }}
                  placeholder={i18next.t('请输入优惠券名称（20个字以内）')}
                  type='text'
                  name='name'
                  value={name}
                  onChange={this.handleChangeInput}
                />
              </FormItem>
              <FormItem label={i18next.t('优惠券类型')} name='type' required>
                <Select
                  value={type}
                  name='type'
                  style={{ width: '260px' }}
                  disabled={this.props.isDetail}
                  data={TYPE_LIST}
                  onChange={this.handleDetailSelectChange}
                />
              </FormItem>
              {type === 2 && (
                <FormItem
                  label={i18next.t('优惠分类')}
                  name='category'
                  required
                >
                  <CouponCate disabled={this.props.isDetail} />
                </FormItem>
              )}
              <FormItem
                label={i18next.t('单张面值')}
                name='price_value'
                required
                validate={Validator.create([], price_value)}
              >
                <Flex alignCenter>
                  <InputNumber
                    value={price_value}
                    onChange={this.handleChangeNumber.bind(this, 'price_value')}
                    min={0}
                    disabled={this.props.isDetail}
                    max={999999999}
                    placeholder={i18next.t('请输入单张优惠券的面值')}
                    className='form-control input-sm'
                    style={{ width: '260px' }}
                  />
                  <span className='gm-padding-5'>{Price.getUnit()}</span>
                </Flex>
              </FormItem>
              <FormItem
                label={i18next.t('使用条件')}
                name='min_total_price'
                required
                validate={Validator.create(
                  [],
                  min_total_price,
                  this.handleCheckCondition,
                )}
              >
                <Flex alignCenter>
                  <span className='gm-padding-5'>
                    {i18next.t('单笔订单满')}
                  </span>
                  <InputNumber
                    value={min_total_price}
                    onChange={this.handleChangeNumber.bind(
                      this,
                      'min_total_price',
                    )}
                    min={0}
                    disabled={this.props.isDetail}
                    max={999999999}
                    className='form-control input-sm'
                    style={{ width: '138px' }}
                  />
                  <span className='gm-padding-5'>
                    {Price.getUnit()}
                    {i18next.t('可使用')}
                  </span>
                </Flex>
                <div className='gm-text-12 gm-text-desc'>
                  {i18next.t('仅支持微信商城的订单在支付时使用')}
                </div>
              </FormItem>
              <FormItem
                label={i18next.t('有效期类型')}
                name='time_type'
                required
              >
                <Select
                  value={time_type}
                  name='time_type'
                  style={{ width: '260px' }}
                  disabled={this.props.isDetail}
                  data={TIME_TYPE}
                  onChange={this.handleSelectChange.bind(this, 'time_type')}
                />
              </FormItem>
              {time_type === 1 && (
                <FormItem
                  label={i18next.t('有效期')}
                  name='validity_day'
                  required
                  validate={Validator.create(
                    [],
                    validity_day,
                    this.handleCheckValidityDay,
                  )}
                >
                  <Flex alignCenter>
                    <span className='gm-padding-5'>
                      {i18next.t('领取当天起')}
                    </span>
                    <InputNumber
                      value={validity_day}
                      onChange={this.handleChangeNumber.bind(
                        this,
                        'validity_day',
                      )}
                      min={0}
                      max={99999}
                      disabled={this.props.isDetail}
                      className='form-control input-sm'
                      style={{ width: '138px' }}
                    />
                    <span className='gm-padding-5'>
                      {i18next.t('天内有效')}
                    </span>
                  </Flex>
                </FormItem>
              )}
              {time_type === 2 && (
                <FormItem
                  label={i18next.t('自定义有效期')}
                  required
                  validate={Validator.create(
                    [],
                    valid_time_start,
                    this.handleCheckValidTime,
                  )}
                >
                  <DateStyled
                    begin={valid_time_start}
                    end={valid_time_end}
                    min={moment()}
                    onChange={(begin, end) => {
                      store.changeDetail('valid_time_start', begin)
                      store.changeDetail('valid_time_end', end)
                    }}
                    disabled={this.props.isDetail}
                    customQuickSelectList={[
                      {
                        range: [
                          [0, 'day'],
                          [0, 'day'],
                        ],
                        text: i18next.t('今天'),
                      },
                    ]}
                  />
                </FormItem>
              )}
              <FormItem label={i18next.t('使用说明')}>
                <textarea
                  name='description'
                  style={{ width: '260px' }}
                  value={description}
                  disabled={this.props.isDetail}
                  placeholder={i18next.t('可输入优惠券相关说明')}
                  onChange={this.handleChangeInput}
                />
              </FormItem>
              <FormItem label={i18next.t('优惠券状态')} required>
                <Switch
                  type='primary'
                  checked={is_active === 1}
                  on={i18next.t('有效')}
                  off={i18next.t('无效')}
                  onChange={this.handleChangeSwitch}
                />
              </FormItem>
              {!System.isC() ? (
                <FormItem
                  label={i18next.t('设置订单可享受的最大优惠比例')}
                  name='max_discount_percent'
                  required
                  validate={Validator.create(
                    [],
                    max_discount_percent,
                    this.handleCheckMaxPercent,
                  )}
                >
                  <Flex alignCenter style={{ paddingTop: '9px' }}>
                    <InputNumber
                      value={max_discount_percent}
                      onChange={this.handleChangeNumber.bind(
                        this,
                        'max_discount_percent',
                      )}
                      min={0}
                      max={100}
                      disabled={this.props.isDetail}
                      className='form-control input-sm'
                      style={{ width: '260px' }}
                    />
                    <span className='gm-padding-5'>%</span>
                  </Flex>
                  <div className='gm-text-12 gm-text-desc'>
                    <div>
                      {i18next.t(
                        '因使用优惠券支付后的订单仍存在异常、退货等导致订单金额变动的情况，可能会导致订单金额不足优惠券的使用门槛而导致优惠力度超出原有预期。',
                      )}
                    </div>
                    <div>
                      {i18next.t(
                        '填写允许的最大优惠比例，当【使用优惠券后的金额/使用优惠券前的金额】小于此比例时，已使用的优惠券将会回退进入消费者账户。',
                      )}
                    </div>
                    <div>
                      {i18next.t(
                        '比例的默认值为优惠券的最小使用门槛，如高于此比例，会导致优惠券不可使用',
                      )}
                    </div>
                    <Button
                      type='primary'
                      className='gm-margin-right-5 gm-margin-top-5'
                      onClick={this.handleShowDemo}
                    >
                      {i18next.t('查看示例')}
                    </Button>
                  </div>
                </FormItem>
              ) : null}
              <FormItem label={i18next.t('规则说明')}>
                {type === 1 ? (
                  <div className='gm-padding-5 gm-text-12'>
                    <div>{i18next.t('满减券适用于所有商品。')}</div>
                    <div>
                      {i18next.t(
                        '可与限购叠加使用，一笔订单每次最多使用一张。',
                      )}
                    </div>
                    <div>{i18next.t('商城订单支付时使用。')}</div>
                  </div>
                ) : (
                  <div className='gm-padding-5 gm-text-12'>
                    <div>{i18next.t('分类券适用于所选分类。')}</div>
                    <div>
                      {i18next.t(
                        '发生退货时仅判断订单金额是否满足最大退货比例。',
                      )}
                    </div>
                  </div>
                )}
              </FormItem>
              <div style={{ display: 'none' }}>
                <FormButton>
                  <Button type='primary' ref={this.basicBtn} htmlType='submit'>
                    {i18next.t('保存')}
                  </Button>
                </FormButton>
              </div>
            </Form>
          </Flex>
          <Flex flex={5}>
            <CouponInstantDemo />
          </Flex>
        </Flex>
      </FormPanel>
    )
  }
}

CouponBasicInfo.propTypes = {
  isDetail: PropTypes.bool,
  forwardRef: PropTypes.object,
}

// 转发form示例，在提交的时候能触发验证
export default React.forwardRef((props, ref) => (
  <CouponBasicInfo forwardRef={ref} {...props} />
))
