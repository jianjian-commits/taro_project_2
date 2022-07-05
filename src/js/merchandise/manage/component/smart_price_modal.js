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
  Price,
  Validator,
  Button,
} from '@gmfe/react'
import Big from 'big.js'
import _ from 'lodash'
import Calculator from '../../../common/components/calculator/calculator'
import styled from 'styled-components'
import SVGDeleted from '../../../../svg/deleted.svg'
import SVGPlus from '../../../../svg/plus.svg'
import { pennyToYuan } from '../../util'
const Icon = styled.span`
  padding-right: 4px;
  position: absolute;
  cursor: pointer;
`

class SmartPriceModal extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      formula_type: 1,
      filter_price_region: 0,
      filter_price_type: 0,
      price_region_min: null,
      price_region_max: null,
      formula_text: '',
      multi_price_regions: [
        {
          id: 0,
          price_region_min: null,
          price_region_max: null,
          formula_text: '',
        },
      ],
    }
  }

  handleChange = (name, value) => {
    this.setState({
      [name]: value,
    })
  }

  handleCheckValue = () => {
    const { formula_text, formula_type, filter_price_region } = this.state
    if (formula_type === 2 && filter_price_region === 1 && !formula_text) {
      return i18next.t('请输入销售单价')
    }
    return ''
  }

  handleSave = () => {
    const { filter_price_region } = this.state
    const state = _.cloneDeep(this.state)
    if (filter_price_region === 2) {
      this.formatLaddersPrice(state.multi_price_regions)
      state.multi_price_regions = JSON.stringify(state.multi_price_regions)
    } else {
      state.multi_price_regions = undefined
    }
    this.props.onNext(state)
  }

  // 格式化阶梯区间数据
  formatLaddersPrice(multi_price_regions) {
    multi_price_regions = _.map(multi_price_regions, (item) => {
      item.price_region_min = item.price_region_min
        ? pennyToYuan(item.price_region_min)
        : undefined
      item.price_region_max = item.price_region_max
        ? pennyToYuan(item.price_region_max)
        : undefined
      return item
    })
  }

  handleChangeFormula = (formula_text) => {
    this.setState({ formula_text })
  }

  /** 阶梯阶梯价格区间筛选 - 增加新区间 */
  handleAddPriceLadder() {
    const arr = _.cloneDeep(this.state.multi_price_regions)
    if (arr.length >= 10) {
      return
    }
    arr.push({
      id: !_.isNil(arr[arr.length - 1]?.id) ? arr[arr.length - 1]?.id + 1 : 0,
      price_region_min: null,
      price_region_max: null,
      formula_text: '',
    })
    this.setState({ multi_price_regions: arr })
  }

  /** 阶梯阶梯价格区间筛选 - 删除已有区间 */
  handleDeletePriceLadder(index) {
    const arr = _.cloneDeep(this.state.multi_price_regions)
    if (arr.length == 1) {
      return
    }
    arr.splice(index, 1)
    this.setState({ multi_price_regions: arr })
  }

  /** 修改最小值 */
  handleChangeMin = (index, value) => {
    const { filter_price_region } = this.state
    if (filter_price_region === 1) {
      this.handleChange('price_region_min', value)
    } else if (filter_price_region === 2) {
      const arr = _.cloneDeep(this.state.multi_price_regions)
      arr[index].price_region_min = value
      this.setState({ multi_price_regions: arr })
    }
  }

  /** 最小值失焦 */
  handleBlurMin = (index, e) => {
    const { filter_price_region } = this.state
    if (e.target.value === '') {
      return
    }
    const value = Big(e.target.value || 0).toFixed(2)
    if (filter_price_region === 1) {
      this.handleChange('price_region_min', value)
    } else if (filter_price_region === 2) {
      const arr = _.cloneDeep(this.state.multi_price_regions)
      arr[index].price_region_min = value
      this.setState({ multi_price_regions: arr })
    }
  }

  /** 修改最大值 */
  handleChangeMax = (index, value) => {
    const { filter_price_region } = this.state

    if (filter_price_region === 1) {
      this.handleChange('price_region_max', value)
    } else if (filter_price_region === 2) {
      const arr = _.cloneDeep(this.state.multi_price_regions)
      arr[index].price_region_max = value
      this.setState({ multi_price_regions: arr })
    }
  }

  handleBlurMax = (index, e) => {
    const { filter_price_region } = this.state
    if (e.target.value === '') {
      return
    }
    const value = Big(e.target.value || 0).toFixed(2)
    if (filter_price_region === 1) {
      this.handleChange('price_region_max', value)
    } else if (filter_price_region === 2) {
      const arr = _.cloneDeep(this.state.multi_price_regions)
      arr[index].price_region_max = value
      this.setState({ multi_price_regions: arr })
    }
  }

  handleChange_formula_text = (index, value) => {
    const { filter_price_region } = this.state
    if (filter_price_region === 2) {
      const arr = _.cloneDeep(this.state.multi_price_regions)
      arr[index].formula_text = value
      this.setState({ multi_price_regions: arr })
      return
    }
    this.handleChangeFormula(value)
  }

  PriceSectionComponent(price_region_min, price_region_max, index = 0) {
    const { filter_price_region, filter_price_type } = this.state
    return (
      <>
        <FormItem label={i18next.t('区间设置')}>
          <Flex alignCenter>
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
                onChange={this.handleChangeMin.bind(this, index)}
                onBlur={this.handleBlurMin.bind(this, index)}
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
                onChange={this.handleChangeMax.bind(this, index)}
                onBlur={this.handleBlurMax.bind(this, index)}
              />
            </div>
            <div className='gm-margin-lr-5' style={{ lineHeight: '30px' }}>
              {Price.getUnit()}
            </div>
            {filter_price_region === 2 && (
              <Icon
                style={{ right: '20px' }}
                onClick={this.handleAddPriceLadder.bind(this)}
              >
                <SVGPlus />
              </Icon>
            )}
            {filter_price_region === 2 && (
              <Icon
                style={{ right: '0px' }}
                onClick={this.handleDeletePriceLadder.bind(this, index)}
              >
                <SVGDeleted />
              </Icon>
            )}
          </Flex>
          <div className='gm-text-desc'>
            {i18next.t('在已选的商品中将满足设置条件的商品进行定价')}
          </div>
        </FormItem>
      </>
    )
  }

  SaleUnitPriceComponent(index = 0, formula_text) {
    const { status } = this.state

    return (
      <FormItem
        required
        label={i18next.t('销售单价')}
        validate={Validator.create([], formula_text, this.handleCheckValue)}
      >
        <Calculator
          onChange={(value) => this.handleChange_formula_text(index, value)}
        />
      </FormItem>
    )
  }

  render() {
    const {
      filter_price_region,
      filter_price_type,
      price_region_min,
      price_region_max,
      formula_type,
      formula_text,
      multi_price_regions,
    } = this.state
    const isDiy = formula_type === 2
    const disabled =
      isDiy &&
      filter_price_region !== 2 &&
      (_.isNil(formula_text) || formula_text === '')

    return (
      <Form
        horizontal
        className='gm-padding-lr-5 gm-padding-tb-10'
        labelWidth='80px'
        colWidth='490px'
        style={{ overflow: 'auto', maxHeight: '60vh' }}
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
        {isDiy &&
          filter_price_region === 1 &&
          this.PriceSectionComponent(price_region_min, price_region_max)}
        {isDiy &&
          filter_price_region === 2 &&
          _.map(multi_price_regions, (item, index) => {
            return (
              <div key={item.id}>
                {this.PriceSectionComponent(
                  item.price_region_min,
                  item.price_region_max,
                  index,
                )}
                {this.SaleUnitPriceComponent(index, item.formula_text)}
              </div>
            )
          })}
        {isDiy &&
          filter_price_region !== 2 &&
          this.SaleUnitPriceComponent(0, formula_text)}
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
