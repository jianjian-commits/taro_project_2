/**
 * @description 周期定价列表
 */
import React, { useEffect, useRef } from 'react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import { BoxTable, Button, Modal } from '@gmfe/react'
import { ManagePagination } from '@gmfe/business'
import { Table, selectTableV2HOC, TableUtil } from '@gmfe/table'
import { i18next } from 'gm-i18n'
import TableTotalText from 'common/components/table_total_text'
import TextTip from 'common/components/text_tip'
import CyclePriceNew from './cycle_price_new'
import CyclePriceAction from './cycle_price_action'
import CyclePriceOperation from './cycle_price_operation'
import CyclePriceEffectiveTime from './cycle_price_effective_time'
import store from '../store'
import { showTimeFormat } from '../utils'
import { STATUS_TYPE } from '../enum'

const SelectTable = selectTableV2HOC(Table)

const { OperationHeader } = TableUtil

function CyclePriceList() {
  const {
    cyclePriceData: { data, pagination },
    tableSelected,
    cyclePriceFilter: { salemenu_id, salemenu_name },
  } = store

  const refPagination = useRef(null)

  useEffect(() => {
    // 获取分页请求数据事件
    store.setDoFirstRequest(
      refPagination.current.apiDoFirstRequest,
      refPagination.current.apiDoCurrentRequest,
    )

    store.doCyclePriceFirstRequest()
  }, [])

  // 新建规则
  function handleCreate() {
    store.clearCyclePriceRule()
    store.changeCyclePriceRule({ salemenu_id, salemenu_name })
    openCyclePriceModal(false)
  }

  // 打开弹窗
  function openCyclePriceModal(isEdit) {
    const modalTitle = isEdit ? '编辑规则' : '新建规则'
    Modal.render({
      title: i18next.t(modalTitle),
      onHide: Modal.hide,
      children: <CyclePriceNew isEdit={isEdit} />,
    })
  }

  // 翻页
  function handlePage(page) {
    store.filterChange(page)
    return store.getCyclePriceList()
  }
  return (
    <BoxTable
      info={
        <BoxTable.Info>
          <TableTotalText
            data={[
              {
                label: i18next.t('规则总数'),
                content: pagination.count || 0,
              },
            ]}
          />
        </BoxTable.Info>
      }
      // 新建规则
      action={
        <Button type='primary' onClick={handleCreate}>
          {i18next.t('新建规则')}
        </Button>
      }
    >
      <ManagePagination
        id='pagination_in_cycle_price_list'
        ref={refPagination}
        onRequest={handlePage}
      >
        <SelectTable
          data={data.slice()}
          keyField='rule_id'
          selected={tableSelected.slice()}
          onSelect={(selected) => store.onTableSelect(selected)}
          onSelectAll={(isSelectAll) => store.selectAll(isSelectAll)}
          batchActionBar={tableSelected.length ? <CyclePriceAction /> : null}
          columns={[
            {
              Header: i18next.t('规则名称'),
              accessor: 'rule_name',
            },
            {
              Header: i18next.t('报价单'),
              accessor: 'salemenu_name',
            },
            {
              Header: i18next.t('生效时间'),
              accessor: 'effective_time',
              Cell: (cellProps) => {
                const { effective_time, rule_status } = cellProps.original
                return (
                  <span>
                    {showTimeFormat(effective_time)}
                    {rule_status === 0 && (
                      <CyclePriceEffectiveTime original={cellProps.original} />
                    )}
                  </span>
                )
              },
            },
            {
              Header: i18next.t('状态'),
              accessor: 'rule_status',
              Cell: (cellProps) => {
                const {
                  rule_status,
                  abnormal_status,
                  task_result,
                } = cellProps.original
                const statusObj = _.find(
                  STATUS_TYPE,
                  (item) => item.value === rule_status,
                )
                return (
                  <span>
                    {statusObj.text || '-'}
                    {abnormal_status ? (
                      <TextTip
                        content={
                          <div className='gm-inline-block gm-bg gm-flex'>
                            {i18next.t('导入异常')}&nbsp;
                            <a onClick={() => window.open(task_result.link)}>
                              {i18next.t(task_result.msg)}
                            </a>
                          </div>
                        }
                      >
                        <i className='glyphicon glyphicon-warning-sign text-danger gm-padding-left-5' />
                      </TextTip>
                    ) : null}
                  </span>
                )
              },
            },
            {
              Header: i18next.t('创建人'),
              accessor: 'creator',
            },
            {
              Header: i18next.t('创建时间'),
              accessor: 'create_time',
              Cell: ({ original }) => showTimeFormat(original.create_time),
            },
            {
              Header: i18next.t('最后修改人'),
              accessor: 'last_operator',
            },
            {
              Header: i18next.t('最后修改时间'),
              accessor: 'modify_time',
              Cell: ({ original }) => showTimeFormat(original.modify_time),
            },
            {
              width: 90,
              Header: OperationHeader,
              Cell: (cellProps) => (
                <CyclePriceOperation
                  original={cellProps.original}
                  openCyclePriceModal={() => openCyclePriceModal(true)}
                />
              ),
            },
          ]}
        />
      </ManagePagination>
    </BoxTable>
  )
}

export default observer(CyclePriceList)
