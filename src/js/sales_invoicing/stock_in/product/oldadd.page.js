import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Flex,
  Form,
  FormItem,
  InputNumberV2,
  Modal,
  Tip,
  Validator,
  Price,
  FormPanel,
  FormGroup,
  Popover,
  Button,
  MoreSelect,
} from '@gmfe/react'
import { toJS } from 'mobx'
import { observer } from 'mobx-react'
import _ from 'lodash'
import Big from 'big.js'
import PropTypes from 'prop-types'

import { history } from 'common/service'
import ShelfSelectModal from './clean_food_stock_in/shelf_select_modal'
import { isNumber } from 'common/util'

import store from './store/clean_food_store'
import styled from 'styled-components'
import { WithBreadCrumbs } from 'common/service'
import HeaderDetail from './component/header_detail'

const AStyled = styled.a`
  cursor: pointer;
`

const ConfirmModal = (props) => {
  return (
    <Flex column>
      <div>{i18next.t('是否将计划改为已完成状态，计划完成后无法二次入库')}</div>
      <Flex justifyEnd className='gm-margin-top-20'>
        <Button onClick={() => props.onSubmit(0)}>{i18next.t('否')}</Button>
        <Button
          type='primary'
          onClick={() => props.onSubmit(1)}
          className='gm-margin-left-10'
        >
          {i18next.t('是')}
        </Button>
      </Flex>
    </Flex>
  )
}

ConfirmModal.propTypes = {
  onSubmit: PropTypes.func.isRequired,
}

@observer
class AddProductStockIn extends React.Component {
  constructor(props) {
    super(props)
    const { batch_number } = this.props.location.query
    this.state = {
      create: batch_number === undefined,
      isProcOrderSelected: false,
      selected: null,
      skuSelected: null,
      shelf_name: '',
    }
    this.refform = React.createRef()
  }

  componentDidMount() {
    if (this.state.create) {
      store.init()
    } else {
      const { batch_number } = this.props.location.query
      store.getProductStockIn({ batch_number })
    }
  }

  handleSearch = (value) => {
    const q = value.trim()
    if (!q) {
      return null
    } else {
      store.getProcessOrderDetail(q)
    }
  }

  handleSelect = (selected) => {
    this.setState({
      isProcOrderSelected: true,
      selected,
      skuSelected: { value: selected.sku_id, text: selected.sku_name },
    })
    store.setStockInParam({
      ...store.stockInParams,
      proc_order_custom_id: selected.id,
      sku_id: selected.sku_id,
      price: selected.price,
      ratio: selected.ratio,
      sale_unit_name: selected.sale_unit_name,
      std_unit_name: selected.std_unit_name,
      version: selected.version,
      reference_cost: selected.reference_cost,
    })
  }

  handleSkuSearch = (value) => {
    const q = value.trim()
    if (!q) {
      store.skuData = []
    } else {
      store.searchSkuList(q)
    }
  }

  handleSkuSelect = (selected) => {
    this.setState({
      skuSelected: selected,
    })
    store.setStockInParam({
      ...store.stockInParams,
      sku_id: selected.id,
      ratio: selected.ratio,
      sale_unit_name: selected.sale_unit_name,
      std_unit_name: selected.std_unit_name,
      reference_cost: selected.unit_process_cost, // 搜索商品时选择的商品不是绑定加工单的商品，因此使用单位加工成本的值作为参考成本
      price: selected.unit_process_cost, // 默认为参考成本的值
      unit_process_cost: selected.unit_process_cost,
    })
  }

  handleShelfSelectOk = (shelf_id, shelf_name) => {
    if (shelf_id) {
      store.setStockInParam({
        ...store.stockInParams,
        shelf_id: shelf_id,
      })
      this.setState({
        shelf_name,
      })
    }
  }

  handleSelectShelf = () => {
    Modal.render({
      children: <ShelfSelectModal onShelfSelectOk={this.handleShelfSelectOk} />,
      title: `${i18next.t('选择货位')}`,
      onHide: Modal.hide,
    })
  }

  handleCancel = () => {
    if (this.state.create) {
      store.setStockInParam({})
      this.setState({
        isProcOrderSelected: false,
        selected: null,
        skuSelected: null,
        shelf_name: '',
      })
    }
    history.push('/sales_invoicing/stock_in/product?tabIndex=1')
  }

  handleSubmit = (type) => {
    store.setStockInParam({
      ...store.stockInParams,
      proc_order_finish: type,
    })

    this.handleSaveStockIn()
  }

  handleConfirm = () => {
    if (
      store.stockInParams.proc_order_custom_id ||
      store.stockInParams.process_order
    ) {
      Modal.render({
        children: <ConfirmModal onSubmit={this.handleSubmit} />,
        title: i18next.t('提示'),
        onHide: Modal.hide,
      })
    } else {
      this.handleSaveStockIn()
    }
  }

  handleSaveStockIn = () => {
    const { amount, price } = store.stockInParams
    if (
      this.state.create &&
      (_.toNumber(amount) === 0 || _.toNumber(price) === 0)
    ) {
      _.toNumber(amount) === 0 && Tip.warning(i18next.t('入库数不能为0'))
      _.toNumber(price) === 0 && Tip.warning(i18next.t('入库单价不能为0'))
      return false
    }
    if (this.state.create) {
      store.createProductStockIn().then(() => {
        Tip.success(i18next.t('保存成功'))
        store.setStockInParam({})
        this.setState({
          isProcOrderSelected: false,
          selected: null,
          skuSelected: null,
          shelf_name: '',
        })
        history.push('/sales_invoicing/stock_in/product?tabIndex=1')
      })
    } else {
      store.editProductStockIn().then(() => {
        Tip.success(i18next.t('保存成功'))
        store.setStockInParam({})
        this.setState({
          isProcOrderSelected: false,
          selected: null,
          skuSelected: null,
          shelf_name: '',
        })
        history.push('/sales_invoicing/stock_in/product?tabIndex=1')
      })
    }

    Modal.hide()
  }

  handleInputChange = (e) => {
    store.setStockInParam({
      ...store.stockInParams,
      [e.target.name]: e.target.value,
    })
  }

  handleNumInputChange = (key, value) => {
    store.setStockInParam({
      ...store.stockInParams,
      [key]: value,
    })
  }

  handleSyncPrice = (e) => {
    e.preventDefault()

    store.setStockInParam({
      ...store.stockInParams,
      price: store.stockInParams.reference_cost,
    })
    Tip.success(i18next.t('同步参考成本成功'))
  }

  render() {
    const { selected, skuSelected, create } = this.state
    const {
      ratio,
      std_unit_name,
      sale_unit_name,
      status,
      batch_num, // 兼容旧的创建 api
      batch_number,
      sku_name,
      process_order,
      amount,
      reference_cost,
      price,
    } = store.stockInParams

    return (
      <>
        {/* <WithBreadCrumbs breadcrumbs={[i18next.t('新建入库单')]} /> */}
        <HeaderDetail type='add' />
        <FormGroup
          formRefs={[this.refform]}
          onSubmitValidated={this.handleConfirm}
          disabled={!(create || status === 1)}
          onCancel={this.handleCancel}
        >
          <Form ref={this.refform} labelWidth='180px' colWidth='480px'>
            <FormItem
              label={i18next.t('入库批次')}
              required
              validate={Validator.create(
                [create ? 'number_or_letter' : ''],
                store.stockInParams[create ? 'batch_num' : 'batch_number'],
              )}
            >
              <input
                className='form-control'
                name={create ? 'batch_num' : 'batch_number'}
                disabled={!create}
                value={create ? batch_num : batch_number}
                onChange={this.handleInputChange}
              />
            </FormItem>
            <FormItem label={i18next.t('关联加工单')}>
              {create ? (
                <MoreSelect
                  disabled={!create}
                  id='process'
                  data={toJS(store.orderList)}
                  selected={selected}
                  onSearch={this.handleSearch}
                  onSelect={this.handleSelect}
                  renderListFilter={(data) => {
                    return data
                  }}
                  placeholder='输入商品名或加工单ID搜索加工单'
                  disabledClose
                />
              ) : (
                <input
                  disabled
                  className='form-control'
                  type='text'
                  value={process_order || ''}
                />
              )}
              <div className='gm-margin-top-5'>
                可选关联未完成的加工单，选中后无法修改入库商品；如不选择加工单，可自行填写入库商品
              </div>
            </FormItem>
            <FormItem
              label={i18next.t('入库商品')}
              required
              validate={Validator.create([], store.stockInParams.sku_id)}
              className='flex'
            >
              {create ? (
                <MoreSelect
                  id='sku'
                  data={store.formatSkusData.slice()}
                  isGroupList
                  selected={skuSelected}
                  onSearch={this.handleSkuSearch}
                  onSelect={this.handleSkuSelect}
                  placeholder={i18next.t('搜索')}
                  renderListFilter={(data) => {
                    return data
                  }}
                  disabled={
                    !!store.stockInParams.proc_order_custom_id || !create
                  }
                />
              ) : (
                <input
                  disabled
                  className='form-control'
                  type='text'
                  value={sku_name}
                />
              )}
            </FormItem>
            <FormItem label={i18next.t('销售规格')}>
              <div
                className='form-control gm-border-0 gm-padding-left-0'
                style={{ paddingTop: '6px' }}
              >
                {ratio && std_unit_name && sale_unit_name
                  ? `${ratio}${std_unit_name}/${sale_unit_name}`
                  : '-'}
              </div>
            </FormItem>
            <FormItem
              label={i18next.t('入库单价(基本单位)')}
              required
              validate={Validator.create([], price)}
            >
              <InputNumberV2
                value={price}
                className='form-control gm-inline'
                disabled={status === 2}
                style={{ width: '120px' }}
                onChange={(value) => this.handleNumInputChange('price', value)}
                precision={2}
                max={99999}
                min={0}
              />
              <span className='gm-margin-left-5 gm-margin-right-5'>
                {Price.getUnit() + '/'}
                {std_unit_name || '-'}
              </span>
              {isNumber(price) && status !== 2 && !create ? (
                <Popover
                  type='hover'
                  center
                  offset={80}
                  popup={
                    <span className='gm-margin-10'>
                      {i18next.t('入库单价=配比值*批次均价+单位加工成本')}
                    </span>
                  }
                >
                  <i className='xfont xfont-warning-circle text-primary' />
                </Popover>
              ) : null}
              {(status !== 2 || create) && (
                <AStyled
                  onClick={this.handleSyncPrice}
                  className='gm-margin-left-5'
                >
                  {i18next.t('同步参考成本')}
                </AStyled>
              )}
            </FormItem>
            <FormItem label={i18next.t('参考成本')}>
              <Flex alignCenter className='gm-margin-top-5'>
                {!_.isNil(reference_cost) ? (
                  <>
                    {reference_cost}
                    <span className='gm-margin-left-5 gm-margin-right-5'>
                      {Price.getUnit() + '/'}
                      {std_unit_name || '-'}
                    </span>
                  </>
                ) : (
                  '-'
                )}
                <Popover
                  type='hover'
                  center
                  offset={80}
                  popup={
                    <div className='gm-padding-5'>
                      {i18next.t(
                        '参考成本=配比值*批次均价+单位加工成本；未关联加工单时，参考成本=单位加工成本',
                      )}
                    </div>
                  }
                >
                  <i className='xfont xfont-warning-circle text-primary gm-margin-left-5' />
                </Popover>
              </Flex>
            </FormItem>
            <FormItem
              label={i18next.t('入库数(销售单位)')}
              required
              validate={Validator.create([], amount)}
            >
              <InputNumberV2
                value={amount}
                className='form-control gm-inline'
                disabled={status === 2}
                style={{ width: '120px' }}
                onChange={(value) => this.handleNumInputChange('amount', value)}
                precision={2}
                max={99999}
                min={0}
              />
              <span className='gm-margin-left-5 gm-margin-right-20'>
                {sale_unit_name || '-'}
              </span>
              {!amount && !create ? (
                <Popover
                  type='hover'
                  center
                  offset={80}
                  popup={
                    <span className='gm-margin-10'>
                      {i18next.t('默认展示加工单的计划生产数')}
                    </span>
                  }
                >
                  <i className='xfont xfont-warning-circle gm-margin-left-15 text-primary' />
                </Popover>
              ) : null}
            </FormItem>
            <FormItem label={i18next.t('入库数(基本单位)')}>
              <span
                className='form-control gm-border-0 gm-padding-left-0'
                style={{ paddingTop: '6px' }}
              >
                {amount && ratio && std_unit_name
                  ? `${Big(amount).times(ratio).toFixed(2)}${std_unit_name}`
                  : '-'}
                {!amount && !create ? (
                  <Popover
                    type='hover'
                    center
                    offset={80}
                    popup={
                      <span className='gm-margin-10'>
                        {i18next.t('默认展示加工单的计划生产数')}
                      </span>
                    }
                  >
                    <i className='xfont xfont-warning-circle gm-margin-left-20 text-primary' />
                  </Popover>
                ) : null}
              </span>
            </FormItem>
          </Form>
        </FormGroup>
      </>
    )
  }
}

export default AddProductStockIn
