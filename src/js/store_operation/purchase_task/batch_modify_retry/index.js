import { i18next } from 'gm-i18n'
import React from 'react'
import { BoxPanel, MoreSelect, Tip } from '@gmfe/react'
import { Table } from '@gmfe/table'
import Big from 'big.js'
import { observer } from 'mobx-react'
import _ from 'lodash'
import TableListTips from 'common/components/table_list_tips'

import BatchModifyStore from './store'
import { toJS } from 'mobx'

@observer
class BatchModifyRetry extends React.Component {
  componentDidMount() {
    BatchModifyStore.init()
    const { task_id } = this.props.location.query
    BatchModifyStore.getTaskById(task_id)
  }

  handleSelect = (index, selected) => {
    const { tasks, type } = BatchModifyStore.task.result
    const key = type === 1 ? 'settle_supplier_id' : 'purchaser_id'
    BatchModifyStore.setSelectedList(index, selected)
    const ids = tasks[index].task_ids
    BatchModifyStore.updateTask(ids, {
      [key]: selected.value,
    }).then((json) => {
      Tip.success(i18next.t('修改成功'))
    })
  }

  handleSearchOptionals = (query, index) => {
    const { optionalList } = BatchModifyStore
    if (!optionalList[index]) {
      BatchModifyStore.getOptionalSuppliersPurchasers(query, index)
    }
  }

  render() {
    const { selectedList, task, optionalList } = BatchModifyStore
    const {
      type, // 1：修改供应商，2：修改采购员
      success_count,
      failure_count,
      tasks,
    } = task.result
    const reasonMap = {
      1: i18next.t('上游站点的采购任务条目不能修改'),
      2: i18next.t('已发布/已完成的采购任务无法修改供应商'),
      3: i18next.t('已完成的采购任务无法修改采购员'),
      4: i18next.t('供应商无法供应此商品'),
      5: i18next.t('采购员无法采购此供应商的商品'),
      6: i18next.t('采购任务未分配供应商'),
      7: i18next.t('已生成采购单的采购任务无法修改供应商'),
    }
    const tableColumns = [
      {
        Header: i18next.t('商品'),
        maxWidth: 120,
        id: 'name',
        accessor: ({ name, ratio, std_unit_name, unit_name }) =>
          `${name}(${ratio}${std_unit_name}/${unit_name})`,
      },
      {
        Header: i18next.t('分类'),
        id: 'category',
        Cell: ({ original, index }) => {
          const { category_1, category_2, pinlei } = original
          return <div>{`${category_1}/${category_2}/${pinlei}`}</div>
        },
      },
      {
        Header: i18next.t('库存'),
        id: 'stock_amount',
        maxWidth: 120,
        Cell: ({ original: { stock_amount, std_unit_name } }) => {
          return `${Big(stock_amount).toFixed(2)}${std_unit_name}`
        },
      },
      {
        Header: i18next.t('建议采购'),
        maxWidth: 120,
        id: 'suggest_purchase_num',
        Cell: ({
          original: { stock_amount, plan_purchase_amount, std_unit_name },
        }) => {
          const suggest_purchase_num = Big(plan_purchase_amount)
            .minus(stock_amount)
            .toFixed(2)
          if (Number(stock_amount) < 0) {
            return `${Big(plan_purchase_amount).toFixed(2)}${std_unit_name}`
          }
          return Number(suggest_purchase_num) > 0
            ? `${Big(suggest_purchase_num).toFixed(2)}${std_unit_name}`
            : i18next.t('库存充足')
        },
      },
      {
        Header: i18next.t('失败原因'),
        id: 'reason',
        accessor: ({ reason }) => `${reasonMap[reason]}`,
      },
      {
        Header: type === 1 ? i18next.t('修改供应商') : i18next.t('修改采购员'),
        id: 'modify',
        Cell: ({
          original: { spec_id, settle_supplier_id, editable },
          index,
        }) => {
          const query = type === 1 ? { spec_id } : { settle_supplier_id }
          const optionals = optionalList[index]
            ? optionalList[index][
                type === 1 ? 'optional_suppliers' : 'optional_purchasers'
              ]
            : []
          const selectList = _.map(optionals, (opt) => {
            return {
              value: opt[type === 1 ? 'settle_supplier_id' : 'purchaser_id'],
              text: opt[type === 1 ? 'supplier_name' : 'purchaser_name'],
            }
          })
          return editable ? (
            <div onClick={() => this.handleSearchOptionals(query, index)}>
              <MoreSelect
                disabled={!editable}
                data={selectList}
                selected={selectedList[index]}
                onSelect={(selected) => this.handleSelect(index, selected)}
                renderListFilterType='pinyin'
              />
            </div>
          ) : null
        },
      },
    ]

    if (type === 2) {
      tableColumns.splice(4, 0, {
        Header: i18next.t('供应商'),
        accessor: 'supplier_name',
      })
    }

    return (
      <BoxPanel
        icon='bill'
        title={
          type === 1
            ? i18next.t('批量设置供应商列表')
            : i18next.t('批量设置采购员列表')
        }
      >
        <TableListTips
          tips={[
            i18next.t(
              /* tpl:成功 ${VAR1}, 失败 ${VAR2} */ 'purchase_task_batch_modify_result',
              {
                VAR1: success_count,
                VAR2: failure_count,
              },
            ) + i18next.t('以下为批量修改失败列表，请手动进行修改'),
          ]}
        />
        <Table
          id='batch_modify_retry_table'
          style={{ maxWidth: '100%', maxHeight: '800px' }}
          data={toJS(tasks)}
          columns={tableColumns}
        />
      </BoxPanel>
    )
  }
}

export default BatchModifyRetry
