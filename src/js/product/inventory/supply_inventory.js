/* eslint-disable react/prop-types */
import { i18next } from 'gm-i18n'
import React from 'react'
import moment from 'moment'
import _ from 'lodash'
import { Table, TableUtil } from '@gmfe/table'
import {
  Flex,
  FilterSelect,
  Switch,
  InputNumber,
  DatePicker,
  Dialog,
  Button,
  Tip,
  ToolTip,
  BoxTable,
} from '@gmfe/react'
import { history } from '../../common/service'
import { pinYinFilter } from '@gm-common/tool'
import { renderPurchaseSpec } from '../../common/filter'
import { calculateCycleTime } from '../../common/util'
import './actions'
import './reducer'
import actions from '../../actions'
import TableListTips from 'common/components/table_list_tips'

class SupplyInventory extends React.Component {
  constructor(props) {
    super(props)
    const { supplementList } = this.props.inventory
    if (!supplementList || !supplementList.length) {
      history.push('/sales_invoicing/inventory/product')
    }

    this.state = {
      supplementList: supplementList.slice().map((it) => ({
        ...it,
        settle_supplier: {
          ...it.settle_supplier,
          value: it.settle_supplier?.id ?? '',
        },
      })),
    }

    actions.product_inventory_update_supplement_list(this.state.supplementList)
  }

  componentWillUnmount() {
    actions.product_inventory_update_supplement_list([])
  }

  renderTips(text, right) {
    return (
      <ToolTip
        right={right}
        popup={
          <div className='gm-padding-5' style={{ width: '170px' }}>
            {text}
          </div>
        }
      />
    )
  }

  withFilter = (list, query) =>
    list.map((it) => ({
      ...it,
      children: pinYinFilter(it.children, query, (value) => value.name),
    }))

  handleChange = (index, key, val) => {
    const supplementList = this.state.supplementList
    supplementList[index] = {
      ...supplementList[index],
      [key]: val,
    }

    this.setState({
      supplementList: supplementList,
    })
    actions.product_inventory_update_supplement_list(supplementList)
  }

  handleMultiChange = (index, obj) => {
    const supplementList = this.state.supplementList
    supplementList[index] = {
      ...supplementList[index],
      ...obj,
    }
    actions.product_inventory_update_supplement_list(supplementList)
  }

  handleCycleTimeChange = (index, e) => {
    const { serviceTimes } = this.props.inventory
    const value = e && e.target ? e.target.value : e

    this.handleMultiChange(index, {
      service_time: _.find(serviceTimes, (v) => v._id === value),
      cycle_start_time: moment(),
    })
  }

  handlePurchaseSpecChange(index, e) {
    const value = e && e.target ? e.target.value : e
    const item = this.props.inventory.supplementList[index]

    const purchase_spec = _.find(item.purchase_data, (v) => v.spec_id === value)

    // 默认选择已选供应商，无则选中首个
    const settle_supplier =
      _.find(
        purchase_spec.settle_suppliers,
        (v) => v.id === item.settle_supplier.id,
      ) || purchase_spec.settle_suppliers[0]

    this.handleMultiChange(index, {
      purchase_spec,
      settle_supplier,
    })
  }

  purchaseNumCell = ({ index, original: { purchase_num, purchase_spec } }) => {
    return (
      <div>
        <InputNumber
          max={999999999}
          className='form-control gm-margin-right-5'
          value={purchase_num}
          style={{ width: '60px', display: 'inline-block' }}
          onChange={this.handleChange.bind(this, index, 'purchase_num')}
        />
        <span>{purchase_spec.std_unit_name}</span>
      </div>
    )
  }

  purchaseSpecCell = ({
    index,
    original: { purchase_spec, purchase_data },
  }) => {
    return (
      <select
        value={purchase_spec.spec_id}
        onChange={this.handlePurchaseSpecChange.bind(this, index)}
        className='form-control gm-margin-right-5'
      >
        {_.map(purchase_data, (v) => {
          const spec_suffix = renderPurchaseSpec({
            ratio: v.sale_ratio,
            std_unit: v.std_unit_name,
            purchase_unit: v.sale_unit_name,
          })
          return (
            <option key={v.spec_id} value={v.spec_id}>
              {`${v.spec_name}(${spec_suffix})`}
            </option>
          )
        })}
      </select>
    )
  }

  periodCell = ({
    index,
    original: { service_time, isRelatePeriod, cycle_start_time },
  }) => {
    const { serviceTimes } = this.props.inventory

    const e_span_time =
      service_time.type === 2
        ? service_time.receive_time_limit.e_span_time
        : service_time.order_time_limit.e_span_time

    return (
      <Flex alignCenter>
        <Switch
          on={i18next.t('是')}
          off={i18next.t('否')}
          className='gm-margin-right-5'
          checked={isRelatePeriod}
          onChange={this.handleChange.bind(this, index, 'isRelatePeriod')}
        />
        {isRelatePeriod && (
          <>
            <select
              style={{ width: '100px' }}
              value={service_time._id}
              onChange={this.handleCycleTimeChange.bind(this, index)}
              className='form-control gm-margin-right-5'
            >
              {_.map(serviceTimes, (s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
            <DatePicker
              date={cycle_start_time}
              className='gm-flex-auto'
              onChange={this.handleChange.bind(this, index, 'cycle_start_time')}
              renderDate={() => {
                const cycle = calculateCycleTime(
                  cycle_start_time,
                  service_time,
                  'M-D',
                )
                return `${cycle.begin}~${cycle.end}${
                  service_time.type === 2
                    ? i18next.t('收货')
                    : i18next.t('下单')
                }`
              }}
              max={moment().add(e_span_time, 'd')}
            />
          </>
        )}
      </Flex>
    )
  }

  // FIXME https://www.tapd.cn/my_worktable?source_user=181902850&workspace_id=23671581&workitem_type=bug&workitem_id=1123671581001024769#&filter_close=true
  supplierCell = ({ index, original }) => {
    const { purchase_spec, default_supplier_id } = original
    const supplementList = this.state.supplementList

    const list = [
      { label: i18next.t('默认供应商'), children: [] },
      { label: i18next.t('推荐供应商'), children: [] },
      { label: i18next.t('其他供应商'), children: [] },
    ]
    if (Object.keys(purchase_spec).length > 0) {
      const { target_supplier, other_supplier } = purchase_spec.settle_suppliers
      list[1].children = target_supplier.map(({ id, name }) => ({
        name: name,
        value: id,
      }))
      list[2].children = other_supplier.map(({ id, name }) => ({
        name: name,
        value: id,
      }))
      list[0].children = [
        [...list[1].children, ...list[2].children].find(
          (it) => it.value === default_supplier_id,
        ),
      ].filter(Boolean)
    }

    return (
      // eslint-disable-next-line gm-react-app/no-deprecated-react-gm
      <FilterSelect
        isGroupList
        id='settle_supplier'
        list={list}
        selected={
          supplementList.length > 0 ? supplementList[index].settle_supplier : ''
        }
        withFilter={this.withFilter}
        placeholder={i18next.t('请选择供应商')}
        onSelect={this.handleChange.bind(this, index, 'settle_supplier')}
      />
    )
  }

  handleDelete = (index) => {
    const supplementList = this.props.inventory.supplementList.slice()
    supplementList.splice(index, 1)
    this.setState({
      supplementList,
    })
    actions.product_inventory_update_supplement_list(supplementList)
  }

  handleCancel = () => {
    Dialog.confirm({
      children: i18next.t('确定要离开此页面吗?'),
    }).then(
      () => {
        history.push('/sales_invoicing/inventory/product')
      },
      (_) => _,
    )
  }

  handleSave = () => {
    const { supplementList } = this.state
    if (supplementList.length === 0) {
      Tip.warning(i18next.t('当前没有记录'))
      return false
    }

    supplementList.find((item) => {
      if (item.purchase_data.length === 0 || !item.settle_supplier) {
        return Tip.warning('请补齐采购规格和供应商设置')
      }
    })

    actions
      .product_inventory_create_purchase(
        _.map(supplementList, (v) => {
          return {
            settle_supplier_id: v.settle_supplier.value,
            spec_id: v.purchase_spec.spec_id,
            plan_purchase_amount: Number(v.purchase_num || '0'),
            cycle_start_time: v.isRelatePeriod
              ? calculateCycleTime(v.cycle_start_time, v.service_time).begin +
                ':00'
              : '',
            time_config_id: v.isRelatePeriod ? v.service_time._id : '',
          }
        }),
      )
      .then(() => {
        actions.product_inventory_update_supplement_list([])
        Tip.success(i18next.t('采购任务已生成'))
        history.push('/supply_chain/purchase/task')
      })
  }

  /*
    ({ index, original: { purchase_spec, settle_supplier } })
     */
  render() {
    const { supplementList } = this.props.inventory

    return (
      <>
        <TableListTips
          tips={[i18next.t('将低于安全库存的商品快速生成采购任务')]}
        />
        <BoxTable
          action={
            <div>
              <Button onClick={this.handleCancel}>{i18next.t('取消')}</Button>
              <div className='gm-gap-10' />
              <Button type='primary' onClick={this.handleSave}>
                {i18next.t('确认生成')}
              </Button>
            </div>
          }
        >
          <Table
            data={supplementList}
            columns={[
              {
                Header: i18next.t('商品ID'),
                accessor: 'spu_id',
              },
              {
                Header: i18next.t('商品名'),
                accessor: 'spu_name',
              },
              {
                Header: i18next.t('商品分类'),
                accessor: 'category_2',
              },
              {
                Header: i18next.t('库存'),
                accessor: 'stock',
                Cell: ({ original: { stock, purchase_spec } }) => (
                  <>{stock + purchase_spec.std_unit_name || '-'}</>
                ),
              },
              {
                Header: i18next.t('安全库存'),
                accessor: 'safe_stock',
                Cell: ({ original: { safe_stock, purchase_spec } }) => (
                  <>{safe_stock + purchase_spec.std_unit_name || '-'}</>
                ),
              },
              {
                Header: (
                  <Flex alignCenter>
                    <span>{i18next.t('采购规格')}</span>
                    {this.renderTips(
                      i18next.t(
                        '采购规格：默认展示最近一次发布的采购规格；若无，则展示第一个采购规格',
                      ),
                    )}
                  </Flex>
                ),
                accessor: 'purchase_spec',
                width: 150,
                Cell: this.purchaseSpecCell,
              },
              {
                Header: (
                  <Flex alignCenter>
                    <span>{i18next.t('关联周期')}</span>
                    {this.renderTips(
                      i18next.t(
                        '未关联周期的条目仅在采购任务列表“按下单日期”下汇总',
                      ),
                    )}
                  </Flex>
                ),
                accessor: 'isRelatePeriod',
                width: 400,
                Cell: this.periodCell,
              },
              {
                Header: (
                  <Flex alignCenter>
                    <span>{i18next.t('采购量')}</span>
                    {this.renderTips(
                      i18next.t('采购量：默认填入「安全库存-库存」的数值'),
                    )}
                  </Flex>
                ),
                accessor: 'purchase_num',
                width: 100,
                Cell: this.purchaseNumCell,
              },
              {
                Header: (
                  <Flex alignCenter>
                    <span>{i18next.t('供应商设置')}</span>
                    {this.renderTips(
                      i18next.t(
                        '供应商设置：默认展示最近一次发布的供应商；若无，则默认展示供应此商品的第一个供应商',
                      ),
                      'right',
                    )}
                  </Flex>
                ),
                accessor: 'settle_supplier',
                width: 130,
                Cell: this.supplierCell,
              },
              {
                width: 40,
                Header: TableUtil.OperationHeader,
                Cell: ({ index }) => (
                  <TableUtil.OperationCell>
                    <a onClick={this.handleDelete.bind(this, index)}>
                      <i className='xfont xfont-delete' />
                    </a>
                  </TableUtil.OperationCell>
                ),
              },
            ]}
          />
        </BoxTable>
      </>
    )
  }
}

export default SupplyInventory
