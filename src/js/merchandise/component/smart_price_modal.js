import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { ENUM } from '../util'
import {
  Form,
  FormButton,
  FormItem,
  Select,
  Option,
  Flex,
  InputNumber,
  Validator,
  Button,
} from '@gmfe/react'

import _ from 'lodash'

class SmartPriceModal extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      formula_type: 1,
      filter_price_region: 0,
      filter_price_type: 0,
      price_region_min: null,
      price_region_max: null,
      price_type: 0,
      cal_type: 0,
      cal_num: null,
    }
  }

  handleChange(name, value) {
    this.setState({
      [name]: value,
    })
  }

  handleCheckValue = () => {
    const { cal_type, cal_num } = this.state
    if (+cal_type === 2 && +cal_num === 0) {
      return i18next.t('值不能为0')
    }
    return ''
  }

  handleSave = () => {
    this.props.onNext(this.state)
  }

  render() {
    const {
      filter_price_region,
      filter_price_type,
      price_region_min,
      price_region_max,
      price_type,
      cal_type,
      cal_num,
      formula_type,
    } = this.state
    const isDiy = formula_type === 2
    const disabled = isDiy && (_.trim(cal_num) === '' || cal_num === null)

    return (
      <Form
        horizontal
        className='gm-padding-lr-5 gm-padding-tb-10'
        labelWidth='80px'
        onSubmitValidated={this.handleSave}
      >
        <FormItem label={i18next.t('定价公式')}>
          <Select
            name='formula_type'
            value={formula_type}
            onChange={this.handleChange.bind(this, 'formula_type')}
          >
            {_.map(ENUM.formulaTypes, (formula, type) => (
              <Option value={formula.value} key={type}>
                {formula.name}
              </Option>
            ))}
          </Select>
        </FormItem>
        {isDiy && (
          <FormItem label={i18next.t('定价范围')}>
            <Select
              name='filter_price_region'
              value={filter_price_region}
              onChange={this.handleChange.bind(this, 'filter_price_region')}
            >
              {_.map(ENUM.scopeTypes, (scope, type) => (
                <Option value={scope.value} key={type}>
                  {scope.name}
                </Option>
              ))}
            </Select>
          </FormItem>
        )}
        {isDiy && filter_price_region === 1 && (
          <FormItem label={i18next.t('区间设置')}>
            <Flex>
              <Select
                name='filter_price_type'
                value={filter_price_type}
                onChange={this.handleChange.bind(this, 'filter_price_type')}
              >
                {_.map(ENUM.priceTypes, (price, type) => (
                  <Option value={price.value} key={type}>
                    {price.name}
                  </Option>
                ))}
              </Select>
              <div className='gm-margin-lr-5' style={{ lineHeight: '30px' }}>
                {i18next.t('在')}
              </div>
              <div className='input-group' style={{ width: '90px' }}>
                <InputNumber
                  className='form-control'
                  value={price_region_min}
                  min={0}
                  max={9999999999}
                  precision={2}
                  onChange={this.handleChange.bind(this, 'price_region_min')}
                />
              </div>
              <div className='gm-margin-lr-5' style={{ lineHeight: '30px' }}>
                -
              </div>
              <div className='input-group' style={{ width: '90px' }}>
                <InputNumber
                  className='form-control'
                  value={price_region_max}
                  min={0}
                  max={9999999999}
                  precision={2}
                  onChange={this.handleChange.bind(this, 'price_region_max')}
                />
              </div>
            </Flex>
          </FormItem>
        )}
        {isDiy && filter_price_region === 1 && (
          <FormItem label=' '>
            <div className='gm-text-desc'>
              {i18next.t('在已选的商品中将满足设置条件的商品进行定价')}
            </div>
          </FormItem>
        )}
        {isDiy && (
          <FormItem
            required
            label={i18next.t('销售单价')}
            validate={Validator.create(
              [Validator.TYPE.required],
              cal_num,
              this.handleCheckValue
            )}
          >
            <Flex>
              <Select
                className='gm-margin-right-5'
                name='price_type'
                value={price_type}
                onChange={this.handleChange.bind(this, 'price_type')}
              >
                {_.map(ENUM.priceTypes, (price, type) => (
                  <Option value={price.value} key={type}>
                    {price.name}
                  </Option>
                ))}
              </Select>
              <Select
                className='gm-margin-right-5'
                name='cal_type'
                value={cal_type}
                onChange={this.handleChange.bind(this, 'cal_type')}
              >
                {_.map(ENUM.calTypes, (cal, type) => (
                  <Option value={cal.value} key={type}>
                    {cal.name}
                  </Option>
                ))}
              </Select>
              <InputNumber
                className='form-control'
                style={{ width: '120px' }}
                value={cal_num}
                max={9999999999}
                precision={cal_type === 1 ? 3 : 2}
                minus
                onChange={this.handleChange.bind(this, 'cal_num')}
              />
            </Flex>
          </FormItem>
        )}
        <div className='gm-text-red gm-text-12' style={{ marginLeft: '23px' }}>
          {isDiy ? (
            i18next.t('提示：均使用基本单位进行定价，计算公式为必填项')
          ) : (
            <div>
              <p className='gm-margin-bottom-5'>{i18next.t('提示：')}</p>
              <p className='gm-margin-bottom-5'>
                {i18next.t('1. 将使用商品预设的定价公式进行定价')}
              </p>
              <p className='gm-margin-bottom-5'>
                {i18next.t('2. 未开启定价公式的商品，将不做定价操作')}
              </p>
            </div>
          )}
          <div>
            <p className='gm-margin-bottom-5'>
              {i18next.t('智能定价仅对未开启加工商品有效')}
            </p>
          </div>
        </div>
        <FormButton>
          <Button onClick={this.props.onCancel}>{i18next.t('取消')}</Button>
          <span className='gm-gap-5' />
          <Button htmlType='submit' type='primary' disabled={disabled}>
            {i18next.t('下一步')}
          </Button>
        </FormButton>
      </Form>
    )
  }
}

SmartPriceModal.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
}

export default SmartPriceModal
