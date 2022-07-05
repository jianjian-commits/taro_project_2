import { setTitle } from '@gm-common/tool'
import { ManagePaginationV2 } from '@gmfe/business'
import {
  Box,
  BoxTable,
  Button,
  DateRangePicker,
  Flex,
  Form,
  FormButton,
  FormItem,
  FunctionSet,
  Modal,
  Select,
  Tip,
} from '@gmfe/react'
import { Table, TableUtil } from '@gmfe/table'
import TableTotalText from 'common/components/table_total_text'
import { CYCLE_QUOTE_TYPE } from 'common/enum'
import { history } from 'common/service'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import globalStore from 'stores/global'
import EditStatusSelect from './components/edit_status'
import BatchAddRulesModal from './modals/batch_add_modal'
import BatchUpdateRulesModal from './modals/batch_update_modal'
import { getSupplier } from './service'
import store from './store'
const { Info } = BoxTable

const { OperationHeader, OperationRowEdit } = TableUtil
// 状态下拉选项
const statusOptions = [
  {
    text: i18next.t('全部状态'),
    value: '',
  },
  ...CYCLE_QUOTE_TYPE,
]

export const isStatusEditCode = CYCLE_QUOTE_TYPE.slice(0, 2).map(
  ({ value }) => value,
)

/**
 * 周期报价规则组件函数，用于展示供应商周期报价页
 * @return {Object} 组件渲染的内容
 */
function CycleQuoteRules() {
  const isSupply = globalStore.isSettleSupply()

  /**
   * 设置权限，供应商账号或者有相关权限
   */
  const canAddRule =
    isSupply || globalStore.hasPermission('add_cycle_quoted_price')
  const canBatchAddRules =
    isSupply || globalStore.hasPermission('add_import_cycle_quoted_price')
  const canBatchUpdateRules =
    isSupply || globalStore.hasPermission('edit_import_cycle_quoted_price')
  const canBatchOperateRules = canBatchAddRules || canBatchUpdateRules

  const batchOperations = [
    {
      text: i18next.t('批量导入新建'),
      onClick: handleLinkToBatchAdd,
      show: canBatchAddRules,
    },
    {
      text: i18next.t('批量导入修改'),
      onClick: handleLinkToBatchUpdate,
      show: canBatchUpdateRules,
    },
  ]

  const tableActions = (
    <div>
      {canAddRule ? (
        <Button type='primary' onClick={onAdd}>
          {i18next.t('新建规则')}
        </Button>
      ) : null}
      {canAddRule && canBatchOperateRules ? (
        <div className='gm-gap-10' />
      ) : null}
      {canBatchOperateRules ? (
        <FunctionSet data={batchOperations} right />
      ) : null}
    </div>
  )

  const { data, filterRules, pagination, loading } = store

  const { status, q } = filterRules

  const [suppliers, setSuppliers] = useState([])

  const paginationRef = useRef()

  useEffect(() => {
    getSupplier().then(({ data }) => {
      setSuppliers(data[0].settle_suppliers)
    })
  }, [])

  useEffect(() => {
    getList()
  }, [status])

  useEffect(() => {
    setTitle(i18next.t('周期报价规则'))

    return () => {
      store.clearStore()
    }
  }, [])

  /**
   * 获取周期报价列表并展示首页
   */
  function getList() {
    paginationRef.current.apiDoFirstRequest()
  }

  /**
   * 刷新周期报价列表并展示首页
   */
  function refreshList() {
    store.getList().then(() => {
      paginationRef.current.apiDoFirstRequest()
    })
  }

  /**
   * 搜索状态发生更改时触发的动作
   * @param {string} filterKey 要搜索的属性
   */
  function filterChange(filterKey) {
    return (e) => {
      // 输入框则取e.target.value，否则直接取值
      const value = e.target ? e.target.value : e
      store.filterChange({ [filterKey]: value })
    }
  }

  /**
   * 点击新建报价规则时触发，跳转到新建页
   */
  function onAdd() {
    history.push('/sales_invoicing/base/cycle_quote_rules/add')
  }

  /**
   * 点击批量导入时触发
   */
  function handleLinkToBatchAdd() {
    Modal.render({
      title: i18next.t('批量导入新建周期报价规则'),
      children: <BatchAddRulesModal onHide={refreshList} />,
      onHide: Modal.hide,
      style: {
        width: '600px',
      },
    })
  }

  /**
   * 点击批量修改时触发
   */
  function handleLinkToBatchUpdate() {
    Modal.render({
      title: i18next.t('批量导入修改周期报价规则'),
      children: (
        <BatchUpdateRulesModal suppliers={suppliers} onHide={refreshList} />
      ),
      onHide: Modal.hide,
      style: {
        width: '600px',
      },
    })
  }

  /**
   * 点击报价规则时触发，跳转到详情页
   */
  function jumpToDetail(quote_rule_id) {
    window.open(
      `/#/sales_invoicing/base/cycle_quote_rules/edit?id=${quote_rule_id}`,
    )
  }
  /**
   * 修改成功后触发
   */
  function saveCallback() {
    Tip.success(i18next.t('修改成功！'))
    getList()
  }

  /**
   * 设置列表展示栏
   */
  const columns = [
    {
      Header: i18next.t('序号'),
      accessor: 'id',
      width: 60,
      Cell: ({ index }) => index + 1,
    },
    {
      Header: i18next.t('规则编号'),
      accessor: 'quote_rule_id',
      id: 'quote_rule_id',
      width: 150,
      Cell: (cellProps) => {
        const {
          original: { quote_rule_id },
        } = cellProps
        return (
          <a onClick={() => jumpToDetail(quote_rule_id)}>{quote_rule_id}</a>
        )
      },
    },
    {
      Header: i18next.t('规则名称'),
      accessor: 'quote_rule_name',
    },
    !isSupply && {
      Header: i18next.t('供应商'),
      accessor: 'supplier_name',
    },
    {
      Header: i18next.t('商品数'),
      accessor: 'sku_nums',
    },
    {
      Header: i18next.t('起止时间'),
      accessor: 'start_end_time',
      width: 240,
      Cell: (cellProps) => {
        const { index, original } = cellProps
        const { updated } = original
        const { begin_time, end_time } = updated || original
        return updated ? (
          <DateRangePicker
            begin={moment(begin_time)}
            end={moment(end_time)}
            disabledDate={(date, { end }) => {
              if (end) {
                return false
              }
              return moment(date).endOf('day') < moment()
            }}
            onChange={(begin_time, end_time) => {
              updated.begin_time = moment(begin_time).startOf('day')
              updated.end_time = moment(end_time).endOf('day')
              store.changeRow(index, original, { updated })
            }}
            placeholder={[
              i18next.t('开始日当天生效'),
              i18next.t('结束日第二天失效'),
            ]}
          />
        ) : (
          <span>
            {moment(begin_time).format('YYYY-MM-DD')}
            <br />
            {i18next.t('KEY144', {
              VAR1: moment(end_time).format('YYYY-MM-DD'),
            })}
          </span>
        )
      },
    },
    {
      Header: i18next.t('状态'),
      accessor: 'status',
      Cell: (cellProps) => {
        const { index, original } = cellProps
        const { updated } = original
        return updated ? (
          <EditStatusSelect
            onChange={(status) =>
              store.changeRow(index, original, {
                updated: {
                  ...updated,
                  status,
                },
              })
            }
            {...original}
          />
        ) : (
          statusOptions.find(({ value }) => value === original.status).text
        )
      },
    },
    {
      Header: i18next.t('创建人'),
      id: 'creator',
      accessor: 'creator',
    },
    {
      Header: i18next.t('创建时间'),
      id: 'create_time',
      accessor: (d) => moment(d.create_time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      Header: i18next.t('最后修改人'),
      id: 'last_operater',
      accessor: 'last_operater',
    },
    {
      Header: i18next.t('最后修改时间'),
      id: 'last_modify_time',
      accessor: (d) => moment(d.last_modify_time).format('YYYY-MM-DD HH:mm:ss'),
    },
    // 供应商账户无法编辑
    !isSupply && {
      Header: OperationHeader,
      Cell: (cellProps) => {
        const { index, original } = cellProps
        const { updated } = original

        if (!isStatusEditCode.includes(status)) {
          return <Flex justifyCenter>-</Flex>
        }
        return (
          <OperationRowEdit
            isEditing={!!updated}
            onClick={() => store.editRow(index, original)}
            onSave={() => store.saveRow(index, original, saveCallback)}
            onCancel={() => store.cancelEdit(index, original)}
          />
        )
      },
    },
  ].filter(Boolean)
  return (
    <>
      <Box hasGap>
        <Form inline onSubmit={() => store.getList()}>
          <FormItem label={i18next.t('状态筛选')}>
            <Select
              value={status}
              data={statusOptions}
              onChange={filterChange('status')}
            />
          </FormItem>
          <FormItem label={i18next.t('搜索')}>
            <input
              className='form-control'
              value={q}
              placeholder={
                isSupply
                  ? i18next.t('输入规则编号、规则名称')
                  : i18next.t('输入供应商名称、规则编号、规则名称')
              }
              onChange={filterChange('q')}
            />
          </FormItem>
          <FormButton>
            <Button type='primary' onClick={getList}>
              {i18next.t('搜索')}
            </Button>
          </FormButton>
        </Form>
      </Box>
      <BoxTable
        info={
          <Info>
            <TableTotalText
              data={[
                {
                  label: i18next.t('规则总数'),
                  content: pagination.count,
                },
              ]}
            />
          </Info>
        }
        action={tableActions}
      >
        <ManagePaginationV2
          id='cycle_quote_rules_list'
          ref={paginationRef}
          onRequest={(pagination) => store.getList(pagination)}
        >
          <Table data={data.slice()} columns={columns} loading={loading} />
        </ManagePaginationV2>
      </BoxTable>
    </>
  )
}

export default observer(CycleQuoteRules)
