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
  Button,
} from '@gmfe/react'
import _ from 'lodash'
import { ENUM } from '../util'

class FormulaSetting extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      status: props.status === undefined ? 0 : props.status,
      info: props.info || {
        price_type: 0,
        cal_type: 0,
        cal_num: null,
      },
      filter_price_region: props.filter_price_region || 0,
      filter_price_type: props.filter_price_type || 0,
      price_region_min: props.price_region_min || null,
      price_region_max: props.price_region_max || null,
    }
  }

  handleChangeSwitch = () => {
    this.setState({
      status: this.state.status === 0 ? 1 : 0,
    })
  }

  handleChangeInfo = (name, value) => {
    const { info } = this.state
    info[name] = value

    this.setState({
      info,
    })
  }

  handleChange = (name, value) => {
    this.setState({
      [name]: value,
    })
  }

  handleSubmit = () => {
    // type 1-单个设置 2-批量设置
    const {
      status,
      info: { cal_num, price_type, cal_type },
      filter_price_region,
      filter_price_type,
      price_region_min,
      price_region_max,
    } = this.state
    const { type, onSave } = this.props
    let parmas = {
      formula_status: status,
      price_type,
      cal_type,
      cal_num,
    }

    if (type === 2) {
      parmas = Object.assign({}, parmas, {
        filter_price_region,
        filter_price_type,
      })
      if (price_region_max !== '')
        parmas = Object.assign({}, parmas, { price_region_max })
      if (price_region_min !== '')
        parmas = Object.assign({}, parmas, { price_region_min })
    }

    onSave(parmas)
  }

  handleCheckValue = () => {
    const { cal_type, cal_num } = this.state.info

    if (+cal_type === 2 && +cal_num === 0) {
      return i18next.t('值不能为0')
    }
    return ''
  }

  render() {
    const { onCancel, type } = this.props
    const {
      status,
      info: { price_type, cal_type, cal_num },
      filter_price_region,
      filter_price_type,
      price_region_min,
      price_region_max,
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
      <Form onSubmitValidated={this.handleSubmit} labelWidth='70px' horizontal>
        <FormItem label={i18next.t('是否开启')} unLabelTop>
          <Switch
            type='primary'
            checked={!!status}
            on={i18next.t('开启')}
            off={i18next.t('关闭')}
            onChange={this.handleChangeSwitch}
          />
        </FormItem>
        <FormItem label=' '>
          <p className='gm-text-desc gm-text-12'>
            {i18next.t('开启时：可用此公式对商品进行智能定价')}
          </p>
          <p className='gm-text-desc gm-text-12'>
            {i18next.t('关闭时：定价公式无法使用，且不做更新')}
          </p>
        </FormItem>
        {type === 2 && (
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
        {type === 2 && filter_price_region === 1 && (
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
              <InputNumberV2
                className='form-control'
                style={{ width: '90px' }}
                value={price_region_min}
                min={0}
                max={9999999999}
                precision={2}
                onChange={this.handleChange.bind(this, 'price_region_min')}
              />
              <div className='gm-margin-lr-5' style={{ lineHeight: '30px' }}>
                -
              </div>
              <InputNumberV2
                className='form-control'
                style={{ width: '90px' }}
                value={price_region_max}
                min={0}
                max={9999999999}
                precision={2}
                onChange={this.handleChange.bind(this, 'price_region_max')}
              />
            </Flex>
          </FormItem>
        )}
        {type === 2 && filter_price_region === 1 && (
          <FormItem label=' '>
            <div className='gm-text-desc'>
              {i18next.t('在已选的商品中将满足设置条件的商品进行定价')}
            </div>
          </FormItem>
        )}
        <FormItem label={i18next.t('销售单价')} {...addValidateProps(cal_num)}>
          <Flex>
            <Select
              className='gm-margin-right-5'
              name='price_type'
              value={price_type}
              onChange={this.handleChangeInfo.bind(this, 'price_type')}
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
              onChange={this.handleChangeInfo.bind(this, 'cal_type')}
            >
              {_.map(ENUM.calTypes, (cal, type) => (
                <Option value={cal.value} key={type}>
                  {cal.name}
                </Option>
              ))}
            </Select>
            <InputNumberV2
              className='form-control'
              style={{ width: '120px' }}
              value={cal_num}
              max={9999999999}
              precision={cal_type === 1 ? 3 : 2}
              onChange={this.handleChangeInfo.bind(this, 'cal_num')}
            />
          </Flex>
        </FormItem>
        <FormItem label=' '>
          <span className='gm-text-desc gm-text-12'>
            {i18next.t('以上公式均使用基本单位进行定价')}
          </span>
        </FormItem>
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

export default FormulaSetting
