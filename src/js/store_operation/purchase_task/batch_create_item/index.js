import { i18next, t } from 'gm-i18n'
import React, { useEffect } from 'react'
import { get } from 'mobx'
import { observer, Observer } from 'mobx-react'
import {
  BoxTable,
  Flex,
  ToolTip,
  Button,
  Switch,
  DatePicker,
  MoreSelect,
  InputNumber,
} from '@gmfe/react'
import { Table, TableUtil } from '@gmfe/table'
import _ from 'lodash'
import store from './store'
import { calculateCycleTime } from '../../../common/util'
import TableListTips from 'common/components/table_list_tips'

import moment from 'moment'

const BatchCreateItem = () => {
  const {
    serviceTimes,
    getServiceTime,
    validSupplier,
    isValidAmount,
    handleChangeBind,
    handleChange,
    handleCycleSwitchChange,
    handleExport,
    handleSubmit,
    handleDelete,
    list,
    failList,
    supplierSpecMap,
    supplierSpecOther,
    supplierSpecTarget,
    allSupplier,
  } = store

  useEffect(() => {
    store.fetchServiceTime()
    store.fetchSupplier()
    return () => {
      store.reset()
    }
  }, [])
  const renderError = (text) => (
    <div className='gm-text-12 gm-text-red'>{text}</div>
  )

  return (
    <BoxTable
      info={<BoxTable.Info>{i18next.t('批量创建采购条目')}</BoxTable.Info>}
      action={
        <div>
          <Button
            type='primary'
            className='gm-margin-right-5'
            onClick={handleSubmit}
          >
            {i18next.t('确认新建')}
          </Button>
        </div>
      }
    >
      {_.size(failList) > 0 && (
        <TableListTips
          tips={[
            <span key='link'>
              {t('存在无法识别的采购规格ID，点击') + ' '}
              <a className='gm-cursor' onClick={handleExport}>
                {t('下载失败列表')}
              </a>
            </span>,
          ]}
        />
      )}

      <Table
        data={list.slice()}
        columns={[
          {
            Header: `${i18next.t('采购规格ID')}`,
            accessor: 'spec_id',
          },
          {
            Header: `${i18next.t('采购商品')}`,
            accessor: 'spu_name',
          },
          {
            Header: `${i18next.t('采购规格')}`,
            id: 'ratio',
            accessor: (d) =>
              `${d.ratio}${d.std_unit_name}/${d.purchase_unit_name}`,
          },
          {
            Header: `${i18next.t('供应商')}`,
            id: 'supplier_id',
            Cell: ({ original, index }) => {
              return (
                <Observer>
                  {() => {
                    const { supplier_id, spec_id } = original
                    const supplierList = [
                      {
                        label: '推荐供应商',
                        children: supplierSpecTarget,
                      },
                      {
                        label: '其他供应商',
                        children: supplierSpecOther,
                      },
                    ]
                    const supplierSelected = allSupplier.find(
                      (supplier) => supplier.value === supplier_id,
                    )
                    return (
                      <Flex column>
                        <MoreSelect
                          isGroupList
                          placeholder={'请选择供应商'}
                          data={supplierList}
                          selected={supplierSelected}
                          onSelect={(selected) => {
                            handleChange(
                              index,
                              'supplier_id',
                              _.get(selected || {}, 'value'),
                            )
                          }}
                          renderListFilterType='pinyin'
                          className='gm-margin-right-10'
                        />

                        {supplier_id &&
                          !validSupplier(supplier_id) &&
                          renderError(t('不存在的供应商'))}
                        {!supplier_id && renderError(t('请选择供应商'))}
                      </Flex>
                    )
                  }}
                </Observer>
              )
            },
          },
          {
            Header: i18next.t('采购量(基本单位)'),
            id: 'purchase_amount',
            Cell: ({ index, original }) => {
              return (
                <Observer>
                  {() => {
                    const { purchase_amount, std_unit_name } = original
                    return (
                      <Flex column>
                        <Flex alignCenter>
                          <InputNumber
                            value={purchase_amount}
                            className='form-control gm-inline gm-margin-right-5'
                            style={{ width: '120px' }}
                            onChange={handleChangeBind(
                              index,
                              'purchase_amount',
                            )}
                            precision={2}
                            max={99999}
                            min={0}
                          />
                          {std_unit_name}
                        </Flex>
                        {!isValidAmount(purchase_amount) &&
                          renderError(t('请填写大于0的正数'))}
                      </Flex>
                    )
                  }}
                </Observer>
              )
            },
          },
          {
            Header: (
              <Flex alignCenter>
                <span>{i18next.t('关联周期')}</span>
                <ToolTip
                  popup={
                    <div className='gm-padding-5' style={{ width: '170px' }}>
                      {t("未关联周期的条目仅在采购任务列表'按下单日期'下汇总")}
                    </div>
                  }
                />
              </Flex>
            ),
            width: 90,
            id: 'isRelatedTasksCycle',
            Cell: ({ index, original }) => {
              return (
                <Observer>
                  {() => {
                    return (
                      <Switch
                        type='primary'
                        checked={original.isRelatedTasksCycle}
                        on={i18next.t('是')}
                        off={i18next.t('否')}
                        onChange={handleCycleSwitchChange.bind(null, index)}
                      />
                    )
                  }}
                </Observer>
              )
            },
          },
          {
            Header: '',
            id: 'time_config_id',
            width: 340,
            Cell: (row) => {
              return (
                <Observer>
                  {() => {
                    const { original, index } = row
                    const { isRelatedTasksCycle } = original
                    const time_config_id = get(original, 'time_config_id')
                    const cycle_start_time = get(original, 'cycle_start_time')
                    if (!isRelatedTasksCycle) {
                      return null
                    }
                    const serviceTime = getServiceTime(time_config_id)
                    if (!serviceTime) {
                      return null
                    }
                    let e_span_time = serviceTime.order_time_limit.e_span_time
                    if (serviceTime.type === 2) {
                      e_span_time = serviceTime.receive_time_limit.e_span_time
                    }
                    return (
                      <Flex column>
                        <Flex alignCenter>
                          <select
                            name='time_config_id '
                            style={{ flex: '1' }}
                            value={time_config_id}
                            onChange={(e) => {
                              handleChange(
                                index,
                                'time_config_id',
                                e.target.value,
                              )
                            }}
                            className='form-control'
                          >
                            {_.map(serviceTimes, (s) => (
                              <option key={s._id} value={s._id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                          <DatePicker
                            className='gm-margin-left-5'
                            date={cycle_start_time}
                            style={{ width: 220 }}
                            onChange={handleChangeBind(
                              index,
                              'cycle_start_time',
                            )}
                            renderDate={() => {
                              const cycle = calculateCycleTime(
                                cycle_start_time,
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
                        {(!time_config_id || !cycle_start_time) &&
                          renderError(t('请选择周期'))}
                      </Flex>
                    )
                  }}
                </Observer>
              )
            },
          },

          {
            Header: TableUtil.OperationHeader,
            id: 'action',
            Cell: (row) => {
              return (
                <TableUtil.OperationCell>
                  <TableUtil.OperationDelete
                    title={t('确认删除')}
                    onClick={() => {
                      handleDelete(row.index)
                    }}
                  >
                    {t('是否删除此记录?')}
                  </TableUtil.OperationDelete>
                </TableUtil.OperationCell>
              )
            },
          },
        ]}
      />
    </BoxTable>
  )
}

BatchCreateItem.displayName = 'BatchCreatePurchaseItem'

export default observer(BatchCreateItem)
