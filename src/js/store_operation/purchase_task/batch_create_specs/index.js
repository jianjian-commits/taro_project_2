import '../../../common/components/tree_list/tree_list.less'
import { i18next } from 'gm-i18n'
import { observer, Observer } from 'mobx-react'
import React from 'react'
import { Flex, Button, BoxPanel, Switch, Tip } from '@gmfe/react'
import {
  EditTable,
  fixedColumnsTableHOC,
  TableUtil,
  diyTableHOC,
} from '@gmfe/table'
import {
  KCMoreSelect,
  KCInputNumberV2,
  keyboardTableHoc,
  KCDatePicker,
  KCSelect,
} from '@gmfe/keyboard'
import { calculateCycleTime } from '../../../common/util'
import moment from 'moment'
import _ from 'lodash'
import specStore from './store'
import Big from 'big.js'
import { history } from '../../../common/service'

const { EditTableOperation, OperationHeader, referOfWidth } = TableUtil
const KeyboardDiyEditTable = diyTableHOC(
  fixedColumnsTableHOC(keyboardTableHoc(EditTable)),
)

@observer
class BatchCreateSpecs extends React.Component {
  state = {
    isSubmit: false,
  }

  componentDidMount() {
    const { serviceTimes, time_config_id } = this.props.location.query
    specStore.init(JSON.parse(serviceTimes), JSON.parse(time_config_id))
  }

  handleSpecSearch = (text) => {
    specStore.getMerchandiseSpec(text)
  }

  handleSpecChoose = (index, selectedSpec) => {
    specStore.setSpecsInfo(index, selectedSpec)
  }

  handleSubmit = () => {
    const taskList = specStore.tasks.slice()
    let isCreate = true
    const list = _.filter(taskList, (ls) => ls.selectedSpec.value)
    if (!list.length > 0) {
      Tip.warning(i18next.t('请添加商品'))
      isCreate = false
      return
    }

    const params = []
    _.each(list, (tl) => {
      if (!tl.selectedSpec.value) {
        Tip.warning(i18next.t('请输入有效的商品名'))
        isCreate = false
        return false
      } else if (!tl.selectedSupplier.value) {
        Tip.warning(i18next.t('请选择供应商'))
        isCreate = false
        return false
      } else if (!tl.plan_purchase_amount || +tl.plan_purchase_amount <= 0) {
        Tip.warning(i18next.t('请填写大于0的采购量'))
        isCreate = false
        return false
      }

      const task = {
        spec_id: tl.selectedSpec.value,
        plan_purchase_amount: +tl.plan_purchase_amount,
        settle_supplier_id: tl.selectedSupplier.value,
        purchaser_id: tl.selectedSupplier.supplier.default_purchaser_id,
      }

      if (tl.isRelatedTasksCycle) {
        const service_time = _.find(
          specStore.serviceTimes,
          (s) => s._id === tl.time_config_id,
        )
        const cycle_time =
          calculateCycleTime(tl.cycle_start_time, service_time).begin + ':00'

        task.time_config_id = tl.time_config_id
        task.cycle_start_time = cycle_time
      }
      params.push(task)
    })

    this.setState({
      isSubmit: true,
    })

    isCreate &&
      specStore
        .createPurchaseTask({ tasks: [JSON.stringify(params)] })
        .then(() => {
          history.push('/supply_chain/purchase/task')
        })
        .finally(() => {
          this.setState({
            isSubmit: false,
          })
        })
  }

  handleAddDeleteSpecs = (index, isAdd = true) => {
    specStore.addDeleteTaskDetail(index, isAdd)
  }

  handleCycleTimeChange = (index, e) => {
    const value = e && e.target ? e.target.value : e
    specStore.setSpecsDetailInfo(index, value, 'time_config_id')
  }

  handleChangePlanPurchaseAmount = (
    index,
    value,
    sale_ratio,
    is_std_unit = true,
  ) => {
    let amount = value
    if (value != null) {
      !is_std_unit &&
        (amount = +Big(+value)
          .times(sale_ratio)
          .toFixed(2))
    }
    specStore.setSpecsDetailInfo(index, amount, 'plan_purchase_amount')
  }

  handleChangePurchaseDesc = (index, value) => {
    specStore.setPurchaseDesc(index, value)
  }

  computedSpanTime = (time_config_id) => {
    const { serviceTimes } = specStore
    const serviceTime = _.find(
      serviceTimes,
      (serviceTime) => serviceTime._id === time_config_id,
    )
    let e_span_time = _.find(serviceTimes, (s) => s._id === time_config_id)
      .order_time_limit.e_span_time
    if (serviceTime.type === 2) {
      e_span_time = _.find(serviceTimes, (s) => s._id === time_config_id)
        .receive_time_limit.e_span_time
    }

    return e_span_time
  }

  handleDateChange = (index, date) => {
    specStore.setSpecsDetailInfo(index, date, 'cycle_start_time')
  }

  render() {
    const { tasks, serviceTimes, specList } = specStore

    return (
      <div>
        <BoxPanel
          title={i18next.t('批量创建采购条目')}
          collapse
          right={
            <Button
              loading={this.state.isSubmit}
              type='primary'
              className='gm-margin-right-5 gm-margin-tb-5'
              onClick={this.handleSubmit}
            >
              {i18next.t('提交')}
            </Button>
          }
        >
          <KeyboardDiyEditTable
            onAddRow={this.handleAddDeleteSpecs}
            style={{ maxWidth: '100%', maxHeight: '800px' }}
            id='batch_create_specs'
            data={tasks.slice()}
            diyGroupSorting={[i18next.t('基础字段')]}
            columns={[
              {
                Header: i18next.t('序号'),
                id: 'index',
                fixed: 'left',
                diyGroupName: i18next.t('基础字段'),
                width: 60,
                Cell: ({ index }) => (
                  <span style={{ padding: '5px 0 5px 10px' }}>{++index}</span>
                ),
              },
              {
                Header: OperationHeader,
                accessor: 'action',
                fixed: 'left',
                diyItemText: i18next.t('操作'),
                diyGroupName: i18next.t('基础字段'),
                diyEnable: false,
                width: 100,
                Cell: ({ index }) => {
                  const delDisable = tasks.length === 1
                  return (
                    <EditTableOperation
                      onAddRow={() => this.handleAddDeleteSpecs(index)}
                      onDeleteRow={
                        delDisable
                          ? undefined
                          : () => this.handleAddDeleteSpecs(index, false)
                      }
                    />
                  )
                },
              },
              {
                Header: i18next.t('商品ID'),
                accessor: 'spec_id',
                minWidth: 100,
                diyGroupName: i18next.t('基础字段'),
                diyEnable: false,
              },
              {
                Header: i18next.t('商品名称'),
                id: 'name',
                minWidth: referOfWidth.searchBox,
                diyGroupName: i18next.t('基础字段'),
                diyEnable: false,
                isKeyboard: true,
                Cell: ({ index, original }) => (
                  <Observer>
                    {() => {
                      const { selectedSpec } = original
                      return (
                        <KCMoreSelect
                          data={specList.slice()}
                          selected={
                            selectedSpec.value ? selectedSpec : undefined
                          }
                          onSelect={(selected) =>
                            this.handleSpecChoose(index, selected)
                          }
                          onSearch={this.handleSpecSearch}
                          placeholder={i18next.t('输入采购规格名')}
                          renderListItem={(item) => {
                            return (
                              <div>
                                <span className='gm-margin-right-5'>
                                  {item.text}
                                </span>
                                <span
                                  className='tree-station'
                                  style={{
                                    marginRight: '4px',
                                    padding: '0px 1px',
                                  }}
                                >
                                  {item.spec.p_type === 0
                                    ? i18next.t('通用')
                                    : i18next.t('本站')}
                                </span>
                                {item.spec.sku_active_count ? (
                                  <span className='gm-text-primary'>
                                    {i18next.t('在售')}:
                                    {item.spec.sku_active_count}
                                  </span>
                                ) : (
                                  <span className='gm-text-red'>
                                    {i18next.t('暂无在售')}
                                  </span>
                                )}
                              </div>
                            )
                          }}
                          renderListFilter={(data) => {
                            return specList.length > 0 ? data : []
                          }}
                        />
                      )
                    }}
                  </Observer>
                ),
              },
              {
                Header: i18next.t('商品分类'),
                accessor: 'pinlei_name',
                diyGroupName: i18next.t('基础字段'),
                minWidth: referOfWidth.operationCell,
                Cell: ({ original: { selectedSpec } }) => {
                  const category =
                    selectedSpec.spec && selectedSpec.spec.category_id_1_name
                      ? selectedSpec.spec.category_id_1_name +
                        '/' +
                        selectedSpec.spec.category_id_2_name +
                        '/' +
                        selectedSpec.spec.spu_name
                      : '-'
                  return <span>{category}</span>
                },
              },
              {
                Header: i18next.t('采购描述'),
                accessor: 'description',
                diyGroupName: i18next.t('基础字段'),
                show: false,
                minWidth: 150,
              },
              {
                Header: i18next.t('库存'),
                accessor: 'current_inventory',
                diyGroupName: i18next.t('基础字段'),
                minWidth: referOfWidth.operationCell,
                Cell: ({ original }) => {
                  return (
                    <span>
                      {original.selectedSpec.spec !== undefined
                        ? original.selectedSpec.spec.current_inventory
                        : '-'}
                    </span>
                  )
                },
              },
              {
                Header: i18next.t('采购量(基本单位)'),
                id: 'plan_purchase_amount',
                minWidth: 130,
                diyGroupName: i18next.t('基础字段'),
                diyEnable: false,
                isKeyboard: true,
                Cell: ({ index, original }) => {
                  const { selectedSpec, plan_purchase_amount } = original
                  return (
                    <Flex row alignCenter>
                      <KCInputNumberV2
                        autocomplete='off'
                        id={index}
                        value={plan_purchase_amount}
                        onChange={(value) =>
                          this.handleChangePlanPurchaseAmount(
                            index,
                            value,
                            selectedSpec.spec.sale_ratio,
                          )
                        }
                        min={0}
                        max={999999}
                        className='form-control input-sm'
                        placeholder={i18next.t('输入数量')}
                      />
                      <span style={{ wordBreak: 'normal' }}>
                        {selectedSpec.spec.std_unit_name || '-'}
                      </span>
                    </Flex>
                  )
                },
              },
              {
                Header: i18next.t('采购量(采购单位)'),
                id: 'sale_purchase_amount',
                diyGroupName: i18next.t('基础字段'),
                minWidth: 120,
                isKeyboard: true,
                Cell: ({ index, original }) => {
                  const { selectedSpec, plan_purchase_amount } = original
                  const sale_amount =
                    plan_purchase_amount === null
                      ? null
                      : +Big(plan_purchase_amount)
                          .div(selectedSpec.spec.sale_ratio || 1)
                          .toFixed(2)

                  return (
                    <Flex alignCenter>
                      <KCInputNumberV2
                        autocomplete='off'
                        id={index}
                        value={sale_amount}
                        onChange={(value) =>
                          this.handleChangePlanPurchaseAmount(
                            index,
                            value,
                            selectedSpec.spec.sale_ratio,
                            false,
                          )
                        }
                        min={0}
                        max={999999}
                        className='form-control input-sm'
                        placeholder={i18next.t('输入数量')}
                      />
                      <span style={{ wordBreak: 'normal' }}>
                        {selectedSpec.spec.sale_unit_name || '-'}
                      </span>
                    </Flex>
                  )
                },
              },
              {
                Header: i18next.t('供应商'),
                id: 'supplier',
                diyGroupName: i18next.t('基础字段'),
                diyEnable: false,
                minWidth: referOfWidth.selectBox,
                isKeyboard: true,
                Cell: ({ index, original }) => {
                  const { selectedSupplier, suppliers } = original
                  return (
                    <KCMoreSelect
                      isGroupList
                      data={suppliers ? suppliers.slice() : []}
                      selected={
                        selectedSupplier.value ? selectedSupplier : undefined
                      }
                      onSelect={(selectedSupplier) =>
                        specStore.setSelectedSupplier(index, selectedSupplier)
                      }
                      placeholder={i18next.t('输入供应商')}
                      renderListItem={(item) => {
                        return <div key={item.value}>{item.text}</div>
                      }}
                    />
                  )
                },
              },
              {
                Header: i18next.t('采购员'),
                accessor: 'purchaser',
                diyGroupName: i18next.t('基础字段'),
                minWidth: 130,
                isKeyboard: true,
                Cell: ({ index, original }) => {
                  const { selectedSupplier, purchaserList } = original
                  return (
                    <KCSelect
                      data={purchaserList.slice()}
                      value={
                        (selectedSupplier.supplier &&
                          selectedSupplier.supplier.default_purchaser_id) ||
                        ''
                      }
                      placeholder={i18next.t('请选择')}
                      onChange={(value) =>
                        specStore.setSelectedPurchaser(index, value)
                      }
                    />
                  )
                },
              },
              {
                Header: i18next.t('关联周期'),
                id: 'related_tasks_cycle',
                minWidth: 480,
                show: false,
                diyGroupName: i18next.t('基础字段'),
                Cell: ({ index, original }) => {
                  const cycle_data = _.map(serviceTimes, (st) => ({
                    text: st.name,
                    value: st._id,
                  }))
                  const e_span_time = this.computedSpanTime(
                    original.time_config_id,
                  )
                  return (
                    <Flex alignCenter>
                      <Switch
                        type='primary'
                        checked={original.isRelatedTasksCycle}
                        on={i18next.t('是')}
                        off={i18next.t('否')}
                        onChange={() =>
                          specStore.setRelatedTasksCycle(
                            index,
                            original.isRelatedTasksCycle,
                          )
                        }
                      />
                      {original.isRelatedTasksCycle && (
                        <Flex style={{ minWidth: '400px' }}>
                          <KCSelect
                            data={cycle_data}
                            value={original.time_config_id}
                            onChange={(e) =>
                              this.handleCycleTimeChange(index, e)
                            }
                            className='gm-margin-left-10'
                            style={{ minWidth: referOfWidth.selectBox }}
                          />
                          <KCDatePicker
                            date={original.cycle_start_time}
                            className='gm-flex-auto gm-margin-left-10'
                            onChange={(date) =>
                              this.handleDateChange(index, date)
                            }
                            renderDate={() => {
                              const serviceTime = _.find(
                                serviceTimes,
                                (serviceTime) =>
                                  serviceTime._id === original.time_config_id,
                              )
                              const cycle = calculateCycleTime(
                                original.cycle_start_time,
                                serviceTime,
                                'M-D',
                              )
                              return `${cycle.begin}~${cycle.end}${
                                serviceTime.type === 2
                                  ? i18next.t('收货')
                                  : i18next.t('下单')
                              }`
                            }}
                            max={moment().add(e_span_time, 'd')}
                          />
                        </Flex>
                      )}
                    </Flex>
                  )
                },
              },
            ]}
          />
        </BoxPanel>
      </div>
    )
  }
}

export default BatchCreateSpecs
