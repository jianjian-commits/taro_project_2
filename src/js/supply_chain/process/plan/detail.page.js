import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { toJS } from 'mobx'
import {
  DatePicker,
  Dialog,
  FilterSelect,
  Flex,
  Form,
  FormItem,
  InputNumber,
  Modal,
  Tip,
  FormGroup,
  FormPanel,
} from '@gmfe/react'
import { Table } from '@gmfe/table'
import { planDetailStore } from './store'
import { remarkType } from 'common/filter'
import { history } from 'common/service'
import _ from 'lodash'
import ModalDetail from './components/modal_detail'
import ModalConfirm from './components/modal_confirm'

const store = planDetailStore
const convert2 = (num) => parseFloat(Number(num).toFixed(2))

// 根据状态判断是否disabled
const shouldBeDisabled = (status) => status === 2 || status === 3

@observer
class PlanDetail extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      list: [],
    }

    this.handleModalClick = ::this.handleModalClick
    this.handleSelect = ::this.handleSelect
    this.handleSearchAjax = ::this.handleSearchAjax
    this.handleConfirm = ::this.handleConfirm
    this.handleCancel = ::this.handleCancel
    this.handleDelete = ::this.handleDelete
    this.refform = React.createRef()
    this.targetRef = React.createRef()
  }

  componentWillUnmount() {
    Modal.hide()
    store.clearDetail()
    store.setFilterChange('custom_id', '')
    store.setFilterChange('hasChangeBatch', false)
  }

  componentDidMount() {
    const { id } = this.props.location.query
    if (id) {
      store.processPlanDetailGet({ id })
    } else {
      // 新建的时候默认 原料
      store.setFilterChange('feederType', 1)
    }
  }

  handleCustomIdChange(e) {
    const { name, value } = e.target
    if (!/[^0-9a-zA-Z-]/g.test(value) || !value) {
      store.setFilterChange(name, value.toUpperCase())
    }
  }

  handlePlanAmountChange(value) {
    store.setFilterChange('plan_amount', value)
  }

  handleSelectChange(name, value) {
    store.setFilterChange(name, value)
    if (name === 'feederType') {
      store.clearBatch()
    }
  }

  handleModalClick(e) {
    e.preventDefault()
    const { product } = store
    const detail = toJS(store.detail)
    const currentStock = toJS(store.currentStock)

    if (!product.id) {
      Tip.warning(i18next.t('请先选择生产成品!'))
      return
    }

    // 备份
    store.batchBackupAction()

    if (shouldBeDisabled(detail.status)) {
      // 如果是已经下达的加工单
      Modal.render({
        children: <ModalDetail disabled detail={currentStock} />,
        title: i18next.t('查看当前领取的批次'),
        onHide: Modal.hide,
      })
    } else {
      Modal.render({
        disableMaskClose: true,
        children: <ModalDetail detail={currentStock} />,
        title: i18next.t('选择领取的批次'),
        onHide: Modal.hide,
      })
    }
  }

  handleSelect(data) {
    store.setFilterChange('product', data)
    store.getProcessOrderStock(data.id).then((json) => {
      const data = json.data
      store.clearDetail(true)
      store.setFilterChange('plan_amount', 1)
      store.setFilterChange('currentStock', data)
    })
  }

  handleSearchAjax(name) {
    name = name.trim()
    name &&
      store.searchForSkuProduct(name).then((json) => {
        const data = json.data
        _.each(data, (item) => {
          item.text = item.name
          item.value = item.id
        })
        this.setState({
          list: data,
        })
      })
  }

  handleStartDateChange(date) {
    store.setFilterChange('startDate', date)
  }

  handleCompleteDateChange(date) {
    store.setFilterChange('completeDate', date)
  }

  handleCancel() {
    history.push('/supply_chain/process/plan?active=1')
  }

  handleDelete() {
    const { id } = this.props.location.query
    if (id) {
      Dialog.confirm({
        title: i18next.t('删除'),
        children: <div>{i18next.t('是否删除该加工单')}</div>,
        onOK: () => {
          store.postDelete(id).then(() => {
            Tip.success(i18next.t('删除成功!'))
            history.push('/supply_chain/process/plan?active=1')
          })
        },
      })
    }
  }

  handleConfirm() {
    const { id } = this.props.location.query
    const { feederType, mobxDoneList, hasChangeBatch } = store

    if (store.isReadyPost() === 1) {
      Tip.warning(i18next.t('请填写完整信息!'))
      return
    } else if (store.isReadyPost() === 2) {
      Tip.warning(i18next.t('请选择投料与批次信息'))
      return
    }
    // 半成品同步工艺: 是否更改了批次
    const shouldBeSync = mobxDoneList.slice().length

    if (feederType === 2 && hasChangeBatch) {
      if (shouldBeSync) {
        Modal.render({
          children: <ModalConfirm id={id} />,
          title: i18next.t('已完成同步工艺'),
          onHide: Modal.hide,
        })
        return
      }
    }
    if (id) {
      store.postUpdate(id).then(() => {
        Tip.success(i18next.t('更新成功!'))
        history.push(`/supply_chain/process/plan/detail?id=${id}`)
      })
    } else {
      store.postCreate().then((json) => {
        Tip.success(i18next.t('新建成功!'))
        history.push(`/supply_chain/process/plan/detail?id=${json.data.id}`)
      })
    }
  }

  render() {
    const {
      product,
      currentStock,
      detail,
      // feederTypeList, feederType, batch, hasLaunch
      plan_amount,
      custom_id,
    } = store
    let { startDate, completeDate } = store
    startDate = startDate && new Date(startDate)
    completeDate = completeDate && new Date(completeDate)

    const planId = this.props.location.query.id
    const { list } = this.state
    const check_unit_name = product.std_unit_name !== product.sale_unit_name
    const productList = toJS(currentStock)

    return (
      <FormGroup
        formRefs={[this.refform]}
        onSubmit={this.handleConfirm}
        onCancel={this.handleCancel}
        disabled={shouldBeDisabled(detail.status)}
      >
        <FormPanel
          title={i18next.t('加工计划')}
          right={
            !planId || shouldBeDisabled(detail.status) ? null : (
              <span
                onClick={this.handleDelete}
                className='glyphicon glyphicon-trash gm-cursor'
              />
            )
          }
        >
          <Form ref={this.refform} labelWidth='150px' colWidth='700px'>
            {shouldBeDisabled(detail.status) ? (
              <FormItem label={i18next.t('计划编号')}>
                <div className='form-control gm-border-0'>{custom_id}</div>
              </FormItem>
            ) : (
              <FormItem label={i18next.t('计划编号')} required>
                <input
                  className='form-control'
                  name='custom_id'
                  onChange={this.handleCustomIdChange}
                  value={custom_id}
                  maxLength={30}
                />
              </FormItem>
            )}
            {planId ? (
              <FormItem label={i18next.t('生产成品')}>
                <div className='form-control gm-border-0'>{product.name}</div>
              </FormItem>
            ) : (
              <FormItem label={i18next.t('生产成品')} required>
                {/* eslint-disable-next-line gm-react-app/no-deprecated-react-gm */}
                <FilterSelect
                  id='product'
                  list={list}
                  selected={_.isEmpty(product) ? '' : product}
                  onSearch={this.handleSearchAjax}
                  onSelect={this.handleSelect}
                  placeholder={i18next.t('搜索商品')}
                />
              </FormItem>
            )}
            <FormItem label={i18next.t('销售规格')}>
              <div className='form-control gm-border-0'>
                {_.isEmpty(product)
                  ? '-'
                  : check_unit_name
                  ? `${product.ratio} ${product.std_unit_name}/${product.sale_unit_name}`
                  : `${i18next.t('按')} ${product.std_unit_name}`}
              </div>
            </FormItem>
            <FormItem label={i18next.t('当前待出库数')}>
              <div className='form-control gm-border-0'>
                {_.isEmpty(product)
                  ? '-'
                  : check_unit_name
                  ? `${convert2(product.freeze)}${
                      product.sale_unit_name
                    } (${convert2(product.freeze * product.ratio)} ${
                      product.std_unit_name
                    })`
                  : `${convert2(product.freeze)}${product.sale_unit_name}`}
              </div>
            </FormItem>
            <FormItem label={i18next.t('成品库存数')}>
              <div className='form-control gm-border-0'>
                {_.isEmpty(product)
                  ? '-'
                  : check_unit_name
                  ? `${convert2(product.product_stock)}${
                      product.sale_unit_name
                    } (${convert2(product.product_stock * product.ratio)} ${
                      product.std_unit_name
                    })`
                  : `${convert2(product.product_stock)}${
                      product.sale_unit_name
                    }`}
              </div>
            </FormItem>
            <FormItem label={i18next.t('物料库存数')}>
              <Table
                data={productList.slice()}
                className='gm-border'
                columns={[
                  {
                    Header: i18next.t('物料名'),
                    accessor: 'ingredient_name',
                  },
                  {
                    Header: i18next.t('商品类型'),
                    id: 'remark_type',
                    accessor: (d) => remarkType(d.remark_type),
                  },
                  {
                    Header: (
                      <Flex column>
                        <div>{i18next.t('所需数量')}</div>
                        <div>{i18next.t('(基本单位)')}</div>
                      </Flex>
                    ),
                    id: 'proportion',
                    Cell: ({ original }) =>
                      `${convert2(original.proportion * plan_amount)}${
                        original.std_unit_name
                      }`,
                  },
                  {
                    Header: (
                      <Flex column>
                        <div>{i18next.t('所需数量')}</div>
                        <div>{i18next.t('(包装单位)')}</div>
                      </Flex>
                    ),
                    id: 'ratio',
                    Cell: ({ original }) =>
                      `${convert2(
                        (plan_amount * original.proportion) / original.ratio
                      )}${original.sale_unit_name}`,
                  },
                  {
                    Header: i18next.t('当前库存'),
                    id: 'ingredient_stock',
                    Cell: ({ original }) => {
                      const {
                        std_unit_name,
                        sale_unit_name,
                        sale_ingredient_stock,
                      } = original
                      const std = `${convert2(
                        original.ingredient_stock || 0
                      )}${std_unit_name}`
                      const saleAndStd = `${sale_ingredient_stock}${sale_unit_name} (${std})`
                      return std_unit_name === sale_unit_name
                        ? std
                        : sale_ingredient_stock
                        ? saleAndStd
                        : std
                    },
                  },
                ]}
              />
            </FormItem>
            <FormItem label={i18next.t('计划生产数')} required>
              <InputNumber
                className='gm-inline-block'
                onChange={this.handlePlanAmountChange}
                value={plan_amount}
                minus={false}
                precision={2}
                max={99999}
                style={{ width: 80 }}
                disabled={shouldBeDisabled(detail.status)}
              />
              {product.sale_unit_name}
            </FormItem>
            <FormItem label={i18next.t('计划开始时间')} required>
              <DatePicker
                date={startDate}
                disabled={shouldBeDisabled(detail.status)}
                placeholder={i18next.t('请选择日期')}
                onChange={this.handleStartDateChange}
                max={completeDate}
                style={{ width: '200px' }}
              />
            </FormItem>
            <FormItem label={i18next.t('计划完成时间')} required>
              <DatePicker
                date={completeDate}
                disabled={shouldBeDisabled(detail.status)}
                placeholder={i18next.t('请选择日期')}
                onChange={this.handleCompleteDateChange}
                min={startDate}
                style={{ width: '200px' }}
              />
            </FormItem>
            {productList.length === 1 && <div style={{ height: 60 }} />}
          </Form>
        </FormPanel>
      </FormGroup>
    )
  }
}

export default PlanDetail
