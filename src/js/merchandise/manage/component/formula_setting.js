import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Form,
  FormButton,
  FormItem,
  Switch,
  Validator,
  Flex,
  Select,
  Option,
  InputNumberV2,
  Price,
  Button,
} from '@gmfe/react'
import _ from 'lodash'
import { ENUM } from '../util'
import PropTypes from 'prop-types'
import Calculator from '../../../common/components/calculator/calculator'
import styled from 'styled-components'
import Big from 'big.js'
import SVGDeleted from '../../../../svg/deleted.svg'
import SVGPlus from '../../../../svg/plus.svg'
import { pennyToYuan } from '../../util'

const Icon = styled.span`
  padding-right: 4px;
  position: absolute;
  cursor: pointer;
`

class FormulaSetting extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      status: 0,
      info: {
        price_type: 0,
        cal_type: 0,
        cal_num: null,
      },
      filter_price_region: 0,
      filter_price_type: 0,
      price_region_min: null,
      price_region_max: null,
      formulaText: '',
      multi_price_regions: [{
        price_region_min: null,
        price_region_max: null,
        formula_text: ""
      }]
    }
  }

  handleChangeSwitch = () => {
    this.setState({
      status: this.state.status === 0 ? 1 : 0,
    })
  }

  handleChange = (name, value) => {
    this.setState({
      [name]: value,
    })
  }

  handleSubmit = () => {
    const {
      status,
      filter_price_region,
      filter_price_type,
      price_region_min,
      price_region_max,
      formulaText,
      multi_price_regions
    } = this.state
    const { onSave } = this.props
    let parmas = {
      formula_status: status,
      formula_text: formulaText,
    }

    parmas = Object.assign({}, parmas, {
      filter_price_region,
      filter_price_type,
    })
    if (price_region_max !== '')
      parmas = Object.assign({}, parmas, { price_region_max })
    if (price_region_min !== '')
      parmas = Object.assign({}, parmas, { price_region_min })

    if(filter_price_region === 2){
      let cloneMultiPriceRegions = _.cloneDeep(multi_price_regions)
      this.formatLaddersPrice(cloneMultiPriceRegions)
      parmas.multi_price_regions = JSON.stringify(cloneMultiPriceRegions) 
    }
    else{
      parmas.multi_price_regions = undefined
    }

    onSave(parmas)
  }

  // 格式化阶梯区间数据
  formatLaddersPrice(multi_price_regions){
    multi_price_regions = _.map(multi_price_regions, (item)=>{
      item.price_region_min = item.price_region_min ? pennyToYuan(item.price_region_min) : undefined
      item.price_region_max = item.price_region_max ? pennyToYuan(item.price_region_max) : undefined
      return item
    })
  }

  handleCheckValue = () => {
    const { cal_type, cal_num } = this.state.info
    if (+cal_type === 2 && +cal_num === 0) {
      return i18next.t('值不能为0')
    }
    return ''
  }

  /** 阶梯阶梯价格区间筛选 - 增加新区间 */
  handleAddPriceLadder() {
    let arr = _.cloneDeep(this.state.multi_price_regions)
    if(arr.length >= 10){
      return
    }
    arr.push({
      id: !_.isNil(arr[arr.length - 1]?.id) ? arr[arr.length - 1]?.id + 1 : 0,
      price_region_min: null,
      price_region_max: null,
      formula_text: ""
    })
    this.setState({ multi_price_regions: arr })
  }

  /** 阶梯阶梯价格区间筛选 - 删除已有区间 */
  handleDeletePriceLadder(index) {
    let arr = _.cloneDeep(this.state.multi_price_regions)
    if(arr.length == 1){
      return
    }
    arr.splice(index, 1)
    this.setState({ multi_price_regions: arr })
  }

  handleChangeFormula = (formulaText) => {
    this.setState({ formulaText })
  }

  /** 修改最小值 */
  handleChangeMin = (index, value) => {
    const { filter_price_region } = this.state

    if (filter_price_region === 1) {
      this.handleChange('price_region_min', value)
    }
    else if (filter_price_region === 2) {
      let arr = _.cloneDeep(this.state.multi_price_regions)
      arr[index].price_region_min = value
      this.setState({ multi_price_regions: arr })
    }
  }

  /** 最小值失焦 */
  handleBlurMin = (index, e) => {
    const { filter_price_region } = this.state
    if(e.target.value === ""){
      return
    }
    const value = Big(e.target.value || 0).toFixed(2)
    if (filter_price_region === 1) {
      this.handleChange('price_region_min', value)
    }
    else if (filter_price_region === 2) {
      let arr = _.cloneDeep(this.state.multi_price_regions)
      arr[index].price_region_min = value
      this.setState({ multi_price_regions: arr })
    }
  }

  /** 修改最大值 */
  handleChangeMax = (index, value) => {
    const { filter_price_region } = this.state

    if (filter_price_region === 1) {
      this.handleChange('price_region_max', value)
    }
    else if (filter_price_region === 2) {
      let arr = _.cloneDeep(this.state.multi_price_regions)
      arr[index].price_region_max = value
      this.setState({ multi_price_regions: arr })
    }
  }

  /** 最大值失焦 */
  handleBlurMax = (index, e) => {
    const { filter_price_region } = this.state
    if(e.target.value === ""){
      return
    }
    const value = Big(e.target.value || 0).toFixed(2)
    if (filter_price_region === 1) {
      this.handleChange('price_region_max', value)
    }
    else if (filter_price_region === 2) {
      let arr = _.cloneDeep(this.state.multi_price_regions)
      arr[index].price_region_max = value
      this.setState({ multi_price_regions: arr })
    }
  }

  handleChange_formula_text = (index, value) => {
    const { filter_price_region } = this.state
    if(filter_price_region === 2){
      let arr = _.cloneDeep(this.state.multi_price_regions)
      arr[index].formula_text = value
      this.setState({ multi_price_regions: arr })
      return
    }
    this.handleChangeFormula(value)
  }

  PriceSectionComponent(price_region_min, price_region_max, index = 0) {
    const { filter_price_region, filter_price_type, } = this.state
    return (<>
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
          <div className='input-group' style={{ width: '80px' }}>
            <InputNumberV2
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
          <div className='input-group' style={{ width: '80px' }}>
            <InputNumberV2
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
          {filter_price_region === 2 && (<Icon style={{right: "20px"}} onClick={this.handleAddPriceLadder.bind(this)}>
            <SVGPlus />
          </Icon>)}
          {filter_price_region === 2 && (<Icon style={{right: "0px"}} onClick={this.handleDeletePriceLadder.bind(this, index)}>
            <SVGDeleted />
          </Icon>)}
        </Flex>
        <div className='gm-text-desc gm-margin-top-5'>
          {i18next.t('在已选的商品中将满足设置条件的商品进行定价')}
        </div>
      </FormItem>
    </>)
  }

  SaleUnitPriceComponent(index = 0, formulaText) {
    const { status } = this.state

    const addValidateProps = (value) => {
      if (status === 0) {
        return null
      }
      return {
        required: true,
        validate: Validator.create([], value, this.handleCheckValue),
      }
    }
    return (<FormItem
      label={i18next.t('销售单价')}
      {...addValidateProps(formulaText)}
    >
      <Calculator onChange={(value) => this.handleChange_formula_text(index, value)} />
      <div className='gm-text-desc gm-margin-top-5'>
        {i18next.t(
          '以上公式均使用基本单位进行定价，且仅对未开启加工商品有效'
        )}
      </div>
    </FormItem>)
  }

  render() {
    const { onCancel } = this.props
    const {
      status,
      filter_price_region,
      filter_price_type,
      price_region_min,
      price_region_max,
      formulaText,
      multi_price_regions
    } = this.state

    const addValidateProps = (value) => {
      if (status === 0) {
        return null
      }
      return {
        required: true,
        validate: Validator.create([], value, this.handleCheckValue),
      }
    }

    return (
      <Form
        onSubmitValidated={this.handleSubmit}
        labelWidth='70px'
        horizontal
        colWidth='460px'
        style={{overflow: "auto", maxHeight: "60vh"}}
      >
        <FormItem label={i18next.t('是否开启')}>
          <Switch
            type='primary'
            checked={!!status}
            on={i18next.t('开启')}
            off={i18next.t('关闭')}
            onChange={this.handleChangeSwitch}
          />
          <div className='gm-text-desc gm-margin-top-5'>
            {i18next.t('开启时：可用此公式对商品进行智能定价')}
            <br />
            {i18next.t('关闭时：定价公式无法使用，且不做更新')}
          </div>
        </FormItem>
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
        {filter_price_region === 1 && this.PriceSectionComponent(price_region_min, price_region_max)}
        {filter_price_region === 2 && _.map(multi_price_regions, (item, index) => {
          return (
            <div key={item.id}>
              {this.PriceSectionComponent(item.price_region_min, item.price_region_max, index)}
              {this.SaleUnitPriceComponent(index, item.formula_text)}
            </div>)
        })}
        {filter_price_region !== 2 && this.SaleUnitPriceComponent(0, formulaText)}

        <FormButton>
          <Button onClick={onCancel}>{i18next.t('取消')}</Button>
          <span className='gm-gap-5' />
          <Button htmlType='submit' type='primary'>
            {i18next.t('保存')}
          </Button>
        </FormButton>
      </Form>
    )
  }
}

FormulaSetting.propTypes = {
  onCancel: PropTypes.func,
  onSave: PropTypes.func,
}

export default FormulaSetting
