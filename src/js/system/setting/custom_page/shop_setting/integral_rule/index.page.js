import React, { useRef, useState } from 'react'
import { t } from 'gm-i18n'
import _ from 'lodash'
import TreeListTable from 'common/components/tree_list_table'
import { TableXUtil } from '@gmfe/table-x'
import { Request } from '@gm-common/request'
import {
  Button,
  Modal,
  Flex,
  InputNumber,
  Tip,
  RightSideModal,
} from '@gmfe/react'
import BatchIntegral from './batch_Integral'
import { changExchangeRatio } from './util'
import { withBreadcrumbs } from 'common/service'
import TaskList from '../../../../../task/task_list'
import '../style.less'

const tipTextList = [
  t(
    '表示支付当前分类或单品1元，对应获得多少积分，如设置白菜为10，则支付10元白菜，则获得1积分：',
  ),
  t(
    '1.批量编辑：勾选后点击批量编辑积分兑换比例，弹窗里输入的获得比例后保存，即勾选的商品都设置该积分获得列数值。',
  ),
  t(
    '2.单个编辑：依次展开以及分类、二级分类、品类后可单独设置商品的积分获得比例。单个设置商品获取积分比例为0表示该商品无法获取积分。',
  ),
]

const SetIntegral = () => {
  const [checkSpu, setCheckSpu] = useState([])
  const treeListRef = useRef(null)
  const onRowChange = ({ id, key, value }) => {
    treeListRef.current.onRowChange({ id, key, value })
  }

  const handleRowEdit = (id, isEdit, exchange_ratio) => {
    onRowChange({ id, key: 'isEdit', value: isEdit })
    if (!isEdit)
      onRowChange({ id, key: 'edit_exchange_ratio', value: exchange_ratio })
  }

  const handleCheck = (check) => setCheckSpu(_.map(check, ({ id }) => id))

  const handleSave = (row) => {
    const { id, edit_exchange_ratio } = row
    const exchange_ratio = changExchangeRatio(edit_exchange_ratio)
    Request('/station/point/reward_sku/exchange_ratio/update')
      .data({
        exchange_info: JSON.stringify([
          {
            spu_id: id,
            exchange_ratio,
          },
        ]),
      })
      .post()
      .then((json) => {
        Tip.success(t('修改成功'))
        onRowChange({
          id,
          key: 'exchange_ratio',
          value: exchange_ratio,
        })
        handleRowEdit(id, false)
      })
  }

  const handleBatch = (e) => {
    Modal.render({
      title: t('批量设置积分比例'),
      size: 'sm',
      children: (
        <BatchIntegral checkSpu={checkSpu} onBatchRowChange={onRowChange} />
      ),
      onHide: Modal.hide,
    })
  }

  const handleExport = () => {
    Request('/station/point/reward_sku/exchange_ratio/export')
      .data()
      .get()
      .then((res) => {
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
      maxWidth: 400,
      Cell: (cellProps) => {
        const { name } = cellProps.row.original
        return <span className='b-text-text-overflow'>{name}</span>
      },
    },
    {
      Header: <span style={{ textAlign: 'center' }}>{t('积分获得比例')}</span>,
      accessor: 'edit_exchange_ratio',
      isKeyboard: true,
      Cell: (cellProps) => {
        const {
          id,
          isEdit,
          exchange_ratio,
          edit_exchange_ratio = exchange_ratio,
        } = cellProps.row.original
        const isGlobal = edit_exchange_ratio === -1 // -1表示使用全局配置
        return (
          <Flex justifyCenter>
            {isEdit ? (
              <InputNumber
                className='form-control'
                value={isGlobal ? '' : edit_exchange_ratio}
                style={{
                  width: '220px',
                }}
                BatchIntegral={0}
                precision={0}
                min={0}
                max={999999}
                onChange={(e) =>
                  onRowChange({ id, key: 'edit_exchange_ratio', value: e })
                }
              />
            ) : (
              <span>{isGlobal ? '-' : exchange_ratio}</span>
            )}
          </Flex>
        )
      },
    },
    {
      Header: TableXUtil.OperationHeader,
      width: 200,
      accessor: 'operator',
      Cell: (cellProps) => {
        const { isEdit, id, exchange_ratio } = cellProps.row.original

        return (
          <TableXUtil.OperationRowEdit
            isEditing={!!isEdit}
            onClick={() => handleRowEdit(id, true)}
            onCancel={() => handleRowEdit(id, false, exchange_ratio)}
            onSave={() => handleSave(cellProps.row.original)}
          />
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
      tipTextList={tipTextList}
      ref={treeListRef}
      columns={columns}
      urlParm={{ need_reward_set: 1 }}
      onCheck={handleCheck}
      batchActionBar={[
        { name: t('批量编辑积分获得比例'), onClick: handleBatch },
      ]}
    />
  )
}

export default withBreadcrumbs([t('按商品分类单独设置积分规则')])(SetIntegral)
