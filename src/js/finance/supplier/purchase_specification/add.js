import { i18next } from 'gm-i18n'
import React from 'react'
import { connect } from 'react-redux'
import {
  Form,
  FormBlock,
  FormItem,
  FormButton,
  FilterSelect,
  RadioGroup,
  Radio,
  Flex,
  Validator,
  Tip,
  InputNumber,
  Switch,
  Price,
  Box,
  Button,
} from '@gmfe/react'
import _ from 'lodash'

import '../actions'
import '../reducer'
import actions from '../../../actions'
import { pinYinFilter } from '@gm-common/tool'
import { isNumberCombination, isNotBeginWithNumber } from '../../../common/util'
import styles from '../style.module.less'

class PurchaseSpecificationAdd extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      category1List: [],
      category2List: [],
      pinleiList: [],
      spuList: [],
      category1Selected: { name: '', value: '' },
      category2Selected: { name: '', value: '' },
      pinleiSelected: { name: '', value: '' },
      spuSelected: { name: '', value: '' },
      purchaseSpec: 1,
      name: '',
      unit_name: '',
      ratio: 1,
      barcode: '',
      has_max_stock_unit_price: false,
      max_stock_unit_price: '',
      description: '',
    }

    this.handleChangePurchaseSpec = ::this.handleChangePurchaseSpec
    this.handleValidated = ::this.handleValidated
    this.handleCheckPurchaseSpec = ::this.handleCheckPurchaseSpec
  }

  componentDidMount() {
    actions.supplier_get_category1().then((data) => {
      this.setState({ category1List: data })
    })
    actions.supplier_get_category2().then((data) => {
      this.setState({ category2List: data })
    })
    actions.supplier_get_pinlei().then((data) => {
      this.setState({ pinleiList: data })
    })
  }

  handleSearch(value, query) {
    const list = this.props.supplier[value]
    this.setState({ [value]: pinYinFilter(list, query, (value) => value.name) })
  }

  handleSelect(value, selected) {
    const me = this

    switch (value) {
      case 'category1Selected':
        me.setState({
          category2Selected: { name: '', value: '' },
          pinleiSelected: { name: '', value: '' },
          spuSelected: { name: '', value: '', std_unit_name: '' },
          name: '',
        })
        break
      case 'category2Selected':
        me.setState({
          pinleiSelected: { name: '', value: '' },
          spuSelected: { name: '', value: '', std_unit_name: '' },
          name: '',
        })
        break
      case 'pinleiSelected':
        me.setState({
          spuSelected: { name: '', value: '', std_unit_name: '' },
          name: '',
        })
        break
      case 'spuSelected':
        me.setState({ name: selected.name })
        break
      default:
        break
    }

    if (value === 'pinleiSelected') {
      actions.supplier_get_spu({ pinlei_id: selected.value }).then((data) => {
        me.setState({ spuList: data })
      })
    }

    me.setState({ [value]: selected || { name: '', value: '' } })
  }

  handleChangePurchaseSpec(value) {
    if (+value === 1) {
      this.setState({ ratio: 1 })
    }
    this.setState({ purchaseSpec: value })
  }

  handleChangeValue(field, e) {
    if (
      field === 'ratio' ||
      field === 'barcode' ||
      field === 'max_stock_unit_price'
    )
      this.setState({ [field]: e })
    else this.setState({ [field]: e.target.value })
  }

  handleValidated() {
    const {
      category1Selected,
      category2Selected,
      pinleiSelected,
      spuSelected,
      name,
      unit_name,
      ratio,
      purchaseSpec,
      barcode,
      has_max_stock_unit_price,
      max_stock_unit_price,
      description,
    } = this.state

    let req = {
      category_1: category1Selected.value,
      category_2: category2Selected.value,
      pinlei: pinleiSelected.value,
      spu_id: spuSelected.value,
      name,
      unit_name: +purchaseSpec === 1 ? spuSelected.std_unit_name : unit_name,
      ratio,
      description,
    }
    if (barcode) req = Object.assign({}, req, { barcode })
    if (has_max_stock_unit_price)
      req = Object.assign({}, req, { max_stock_unit_price })

    actions.supplier_purchase_specification_create(req).then(() => {
      Tip.success(i18next.t('添加成功'))
      this.props.onCreateSuccessed && this.props.onCreateSuccessed()
    })
  }

  handleCheckPurchaseSpec() {
    const { purchaseSpec, unit_name, ratio } = this.state
    if (
      +purchaseSpec === 2 &&
      (!this.isPositiveFloat(ratio) || _.trim(unit_name) === '')
    ) {
      return i18next.t('采购规格只能为正数且不能为空，请填写完善')
    } else if (+purchaseSpec === 2 && !isNotBeginWithNumber(_.trim(unit_name))) {
      return i18next.t('请填写正确计量单位')
    }
    return ''
  }

  handleCheckBarcode(barcode) {
    if (
      _.trim(barcode) === '' ||
      (barcode.length > 0 &&
        barcode.length < 14 &&
        isNumberCombination(barcode))
    ) {
      return ''
    } else {
      return i18next.t('规格条码仅支持限13位数字组成')
    }
  }

  // 是否为正浮点数,非负数且最大两位小数点,可用于验证价格
  isPositiveFloat(input) {
    return /^[+]?((\d+.(\d){1,2})|(\d)+)$/.test(input + '') && input > 0
  }

  handleChangeSwitch = (name) => {
    this.setState({
      [name]: !this.state[name],
    })
  }

  handleCheckMaxPrice(price) {
    if (this.state.has_max_stock_unit_price && price === '') {
      return i18next.t('最高入库单价只能为大于等于0的数，请填写完善')
    }
    return ''
  }

  render() {
    const {
      category1List,
      category2List,
      pinleiList,
      spuList,
      category1Selected,
      category2Selected,
      pinleiSelected,
      spuSelected,
      purchaseSpec,
      name,
      unit_name,
      ratio,
      barcode,
      has_max_stock_unit_price,
      max_stock_unit_price,
      description,
    } = this.state

    // 一级分类
    const c1List = _.map(category1List, (category1) => {
      return {
        value: category1.id,
        name: category1.name,
      }
    })
    const c1Select = _.find(c1List, (c1) => {
      return c1.value === category1Selected.value
    })

    // 二级分类
    const c2List = _.map(
      _.filter(category2List, (c2) => {
        return category1Selected.value === c2.upstream_id
      }),
      (category2) => {
        return {
          value: category2.id,
          name: category2.name,
        }
      }
    )
    const c2Select = _.find(c2List, (c2) => {
      return c2.value === category2Selected.value
    })

    // 品类
    const pList = _.map(
      _.filter(pinleiList, (p) => {
        return category2Selected.value === p.upstream_id
      }),
      (pinlei) => {
        return {
          value: pinlei.id,
          name: pinlei.name,
        }
      }
    )
    const pSelect = _.find(pList, (p) => {
      return p.value === pinleiSelected.value
    })

    // 商品
    const sList = _.map(spuList, (spu) => {
      return {
        value: spu.id,
        name: spu.name,
        std_unit_name: spu.std_unit_name,
      }
    })
    const sSelect = _.find(sList, (s) => {
      return s.value === spuSelected.value
    })

    const std_unit_name = spuSelected.std_unit_name
      ? spuSelected.std_unit_name
      : '-'

    return (
      <Box>
        <Form
          onSubmitValidated={this.handleValidated}
          horizontal
          disabledCol
          btnPosition='right'
          labelWidth='115px'
        >
          <FormBlock>
            <FormItem
              label={i18next.t('选择商品')}
              validate={Validator.create(
                [Validator.TYPE.required],
                category1Selected.value
              )}
            >
              <div style={{ width: '130px' }}>
                <FilterSelect
                  id='_first_'
                  list={c1List}
                  selected={c1Select}
                  onSearch={this.handleSearch.bind(this, 'category1List')}
                  onSelect={this.handleSelect.bind(this, 'category1Selected')}
                  placeholder={i18next.t('选择一级分类')}
                />
              </div>
            </FormItem>
            <FormItem
              labelWidth={0}
              validate={Validator.create(
                [Validator.TYPE.required],
                category2Selected.value
              )}
            >
              <div style={{ width: '130px' }}>
                <FilterSelect
                  id='_second_'
                  list={c2List}
                  selected={c2Select}
                  onSearch={this.handleSearch.bind(this, 'category2List')}
                  onSelect={this.handleSelect.bind(this, 'category2Selected')}
                  placeholder={i18next.t('选择二级分类')}
                />
              </div>
            </FormItem>
            <FormItem
              labelWidth={0}
              validate={Validator.create(
                [Validator.TYPE.required],
                pinleiSelected.value
              )}
            >
              <div style={{ width: '130px' }}>
                <FilterSelect
                  id='_third_'
                  list={pList}
                  selected={pSelect}
                  onSearch={this.handleSearch.bind(this, 'pinleiList')}
                  onSelect={this.handleSelect.bind(this, 'pinleiSelected')}
                  placeholder={i18next.t('选择品类')}
                />
              </div>
            </FormItem>
            <FormItem
              labelWidth={0}
              validate={Validator.create(
                [Validator.TYPE.required],
                spuSelected.value
              )}
            >
              <div style={{ width: '130px' }}>
                <FilterSelect
                  id='_four_'
                  list={sList}
                  selected={sSelect}
                  onSearch={this.handleSearch.bind(this, 'spuList')}
                  onSelect={this.handleSelect.bind(this, 'spuSelected')}
                  placeholder={i18next.t('选择商品')}
                />
              </div>
            </FormItem>
          </FormBlock>
          <FormItem
            label={i18next.t('采购规格')}
            validate={Validator.create(
              [Validator.TYPE.required],
              purchaseSpec,
              this.handleCheckPurchaseSpec
            )}
          >
            <RadioGroup
              name='purchaseSpec'
              inline
              value={purchaseSpec}
              onChange={this.handleChangePurchaseSpec}
            >
              <Radio value={1}>
                {i18next.t('按')}
                {std_unit_name}
              </Radio>
              <Radio value={2}>
                <div style={{ display: 'inline-block' }}>
                  <Flex alignCenter style={{ height: '26px' }}>
                    <InputNumber
                      value={+purchaseSpec === 1 ? '-' : ratio}
                      onChange={this.handleChangeValue.bind(this, 'ratio')}
                      min={0}
                      precision={2}
                      className={styles.inputWidth}
                    />
                    <div className={styles.stdUnitName}>{std_unit_name}/</div>
                    <input
                      className={styles.inputWidth}
                      type='text'
                      value={+purchaseSpec === 1 ? '-' : unit_name}
                      onChange={this.handleChangeValue.bind(this, 'unit_name')}
                    />
                  </Flex>
                </div>
              </Radio>
            </RadioGroup>
          </FormItem>
          <FormItem
            label={i18next.t('规格名称')}
            validate={Validator.create([Validator.TYPE.required], _.trim(name))}
          >
            <input
              style={{ width: '200px' }}
              type='text'
              name='name'
              value={name}
              onChange={this.handleChangeValue.bind(this, 'name')}
            />
          </FormItem>
          <FormItem
            label={i18next.t('规格条码')}
            validate={Validator.create(
              [],
              _.trim(barcode),
              this.handleCheckBarcode.bind(this, _.trim(barcode))
            )}
          >
            <InputNumber
              maxLength={13}
              value={barcode}
              className='form-control input-sm gm-inline-block'
              name='barcode'
              precision={0}
              autoComplete='off'
              style={{ width: '200px' }}
              onChange={this.handleChangeValue.bind(this, 'barcode')}
            />
          </FormItem>
          <FormItem label={i18next.t('采购描述')}>
            <input
              style={{ width: '200px' }}
              type='text'
              name='description'
              value={description}
              onChange={this.handleChangeValue.bind(this, 'description')}
            />
          </FormItem>
          <FormItem label={i18next.t('最高入库单价')}>
            <Flex column>
              <div>
                <Switch
                  type='primary'
                  checked={!!has_max_stock_unit_price}
                  on={i18next.t('设置')}
                  off={i18next.t('不设置')}
                  onChange={this.handleChangeSwitch.bind(
                    this,
                    'has_max_stock_unit_price'
                  )}
                />
              </div>
              {has_max_stock_unit_price && (
                <div className='gm-padding-top-10'>
                  <InputNumber
                    max={9999}
                    value={max_stock_unit_price}
                    className='form-control input-sm gm-inline-block'
                    name='max_stock_unit_price'
                    precision={2}
                    autoComplete='off'
                    style={{ width: '200px' }}
                    onChange={this.handleChangeValue.bind(
                      this,
                      'max_stock_unit_price'
                    )}
                  />
                  {Price.getUnit() +
                    '/' +
                    (purchaseSpec === 1
                      ? std_unit_name || '-'
                      : unit_name || '-')}
                </div>
              )}
            </Flex>
          </FormItem>
          <FormButton>
            <Button
              className='gm-margin-right-5'
              type='button'
              onClick={this.props.onCancel}
            >
              {i18next.t('取消')}
            </Button>
            <Button type='primary' htmlType='submit'>
              {i18next.t('确认新建')}
            </Button>
          </FormButton>
        </Form>
      </Box>
    )
  }
}

export default connect((state) => ({
  supplier: state.supplier,
}))(PurchaseSpecificationAdd)
