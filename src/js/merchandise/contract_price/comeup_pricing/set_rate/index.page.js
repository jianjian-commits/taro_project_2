import React, { useEffect, useRef } from 'react'
import { t } from 'gm-i18n'
import TreeListTable from 'common/components/tree_list_table/index'
import { TableXUtil } from '@gmfe/table-x'
import {
  Button,
  Modal,
  RightSideModal,
  Tip,
  Flex,
  InputNumberV2,
} from '@gmfe/react'
import BatchRateModal from './batch_rate_modal'
import store from './store.js'
import TaskList from '../../../../task/task_list'
import globalStore from '../../../../stores/global'
import Big from 'big.js'

const tipTextList = [
  t('支持批量和单个编辑：'),
  t(
    '1.批量编辑：勾选后点击批量编辑变化率，弹窗里输入的变化率后保存，即勾选的商品都设置该上浮率数值。',
  ),
  t(
    '2.单个编辑：依次展开以及分类、二级分类、品类后可单独设置商品的上浮率数值。',
  ),
]

const SetRateList = (props) => {
  const treeListRef = useRef(null)
  const {
    location: {
      query: { price_rule_id },
    },
  } = props
  // contract_rate_format 为 1，百分数形式。 为2 小数形式
  const {
    orderInfo: { contract_rate_format },
  } = globalStore
  const isPercent = contract_rate_format === 1
  const { rateSummary, businessInfo } = store
  useEffect(() => {
    store.fetchRateList(price_rule_id)
  }, [])

  // 清除选择项
  const clearCheckData = () => treeListRef.current.clearCheckData()

  const onCheck = (checkData) => store.onCheck(checkData)

  const onRowChange = ({ id, key, value }) =>
    treeListRef.current.onRowChange({ id, key, value })

  const handleRowEdit = (id, isEdit) => {
    onRowChange({ id, key: 'isEdit', value: isEdit })
    // 消编辑时，将树中的rate字段重置
    if (isEdit) onRowChange({ id, key: 'edit_rate', value: undefined })
  }

  // 批量编辑变化率
  const handleBatchEdit = () =>
    Modal.render({
      children: (
        <BatchRateModal
          isPercent={isPercent}
          onSave={handeBatchSava}
          onCancel={() => Modal.hide()}
        />
      ),
      title: t('批量设置变化率'),
      style: {
        width: '400px',
      },
      onHide: Modal.hide,
    })

  /**
   * 单个修改变化率
   * @param {*} row
   */
  const handleSave = (row) => {
    const {
      change_rate,
      category_id_1,
      category_id_2,
      pinlei_id,
      name,
      edit_rate,
    } = row
    let yx_price

    if (typeof edit_rate === 'number') {
      yx_price = isPercent
        ? Big(edit_rate).plus(100)
        : Big(edit_rate).times(100)
    } else {
      yx_price = change_rate
    }

    const spu = {
      category_id_1,
      category_id_2,
      pinlei_id,
      spu_id: row.id,
      name,
      rule_type: 2, // 固定传2 乘法
      yx_price, // 变化率
    }

    store.handleEditPriceRule(price_rule_id, [spu]).then(() => {
      Tip.success(t('保存成功'))
      store.fetchRateList(price_rule_id).then(() => {
        onRowChange({
          id: row.id,
          key: 'change_rate',
          value: yx_price ?? change_rate,
        })
        handleRowEdit(row.id, false)
      })
    })
  }

  /**
   * 批量修改变化率
   * @param {string} rate
   */
  const handeBatchSava = (rate) => {
    if (typeof rate !== 'number') return
    const yx_price = isPercent ? Big(rate).plus(100) : Big(rate).times(100)

    const spus = store.checkData.map(
      ({ category_id_1, category_id_2, pinlei_id, id, name }) => ({
        category_id_1,
        category_id_2,
        pinlei_id,
        spu_id: id,
        name,
        rule_type: 2,
        yx_price,
      }),
    )
    store.handleEditPriceRule(price_rule_id, spus).then(() => {
      Tip.success(t('批量编辑变化率成功'))
      clearCheckData()
      store.fetchRateList(price_rule_id).then(() => {
        onRowChange({
          id: spus.map((spu) => spu.spu_id),
          key: 'change_rate',
          value: yx_price,
        })
      })
    })
  }

  // 导出
  const handleExport = () => {
    store.handleExport(price_rule_id).then((res) => {
      RightSideModal.render({
        children: <TaskList />,
        onHide: RightSideModal.hide,
        style: {
          width: '300px',
        },
      })
    })
  }

  const columns = [
    {
      Header: t('商品名'),
      accessor: 'name',
      width: 100,
    },
    {
      Header: <span style={{ textAlign: 'center' }}>{t('变化率')}</span>,
      accessor: 'edit_rate',
      Cell: (cellProps) => {
        const {
          change_rate,
          id,
          isEdit,
          edit_rate = isPercent
            ? +Big(change_rate).minus(100)
            : +Big(change_rate).div(100).toFixed(2),
        } = cellProps.row.original
        const changeRate = isPercent
          ? +Big(change_rate).minus(100)
          : +Big(change_rate).div(100).toFixed(2)

        return (
          <Flex columns alignCenter style={{ margin: '0 auto' }}>
            {isEdit ? (
              <InputNumberV2
                value={edit_rate}
                min={isPercent ? -99.99 : 0}
                max={999999999}
                className='form-control'
                style={{ width: '120px' }}
                placeholder={t('请输入变化率')}
                onChange={(value) =>
                  onRowChange({ id, key: 'edit_rate', value })
                }
              />
            ) : (
              changeRate
            )}
            {isPercent && '%'}
          </Flex>
        )
      },
    },
    {
      Header: TableXUtil.OperationHeader,
      width: 200,
      accessor: 'operator',
      Cell: (cellProps) => {
        const { isEdit, id } = cellProps.row.original

        return (
          globalStore.hasPermission('update_change_rate') && (
            <TableXUtil.OperationRowEdit
              isEditing={!!isEdit}
              onClick={() => handleRowEdit(id, true)}
              onCancel={() => handleRowEdit(id, false)}
              onSave={() => handleSave(cellProps.row.original)}
            />
          )
        )
      },
    },
  ]

  return (
    <TreeListTable
      actionType={
        <Button className='gm-margin-left-10' onClick={handleExport}>
          {t('导出')}
        </Button>
      }
      businessInfo={businessInfo}
      tipTextList={tipTextList}
      ref={treeListRef}
      columns={columns}
      onCheck={onCheck}
      rateSummary={rateSummary}
      batchActionBar={
        globalStore.hasPermission('update_change_rate')
          ? [{ name: t('批量编辑变化率'), onClick: handleBatchEdit }]
          : []
      }
    />
  )
}

export default SetRateList
