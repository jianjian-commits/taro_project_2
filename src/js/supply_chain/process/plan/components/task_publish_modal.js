import React, { useEffect } from 'react'
import { observer, Observer } from 'mobx-react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import { InputNumberV2, Flex, Button, Modal, Tip } from '@gmfe/react'
import { remarkType, getEnumValue } from 'common/filter'
import { TableX, editTableXHOC } from '@gmfe/table-x'
import { TaskStore as taskStore } from '../store'
import _ from 'lodash'
import Big from 'big.js'
import globalStore from 'stores/global'
import { ORDER_PUBLISH_SETTING } from 'common/enum'
import WarningPopover from 'common/components/warning_popover'
import HeaderTip from 'common/components/header_tip'
import { history } from 'common/service'

const EditTable = editTableXHOC(TableX)

const View = observer(() => {
  const { order_request_release_amount_type } = globalStore.processInfo

  const text = getEnumValue(
    ORDER_PUBLISH_SETTING,
    order_request_release_amount_type,
  )
  return (
    <span>
      {t('批量生成生产计划时，计划生产数等于')}
      {text}
      {order_request_release_amount_type === 1 &&
        t('，当前库存充足的计划将不会被发布')}
      {t('，如需修改，请在“计划明细”中修改计划生产数')}
    </span>
  )
})

const PlanTip = observer(() => {
  const { order_request_release_amount_type } = globalStore.processInfo
  const text = getEnumValue(
    ORDER_PUBLISH_SETTING,
    order_request_release_amount_type,
  )

  const handleSetting = () => {
    Modal.hide()
    history.push('/system/setting/system_setting?activeType=process')
  }
  return (
    <div>
      {t('默认展示')}
      {text}，<a onClick={handleSetting}>{t('点此设置')}</a>
    </div>
  )
})

const Edit = observer(() => {
  const { publishSelectedData } = taskStore

  useEffect(() => {
    return () => taskStore.setPublishData([])
  }, [])

  const handleChangeAmount = (index, value) => {
    taskStore.changePublishDataItem(index, { req_release_amount: value })
  }

  return (
    <EditTable
      data={publishSelectedData.slice()}
      columns={[
        {
          Header: t('商品'),
          accessor: 'name',
          minWidth: 80,
        },
        {
          Header: t('分类'),
          accessor: 'pinlei_name',
          minWidth: 100,
          Cell: ({ row: { original } }) =>
            `${original.category1_name}/${original.category2_name}/${original.pinlei_name}`,
        },
        {
          Header: t('商品类型'),
          accessor: 'remark_type',
          minWidth: 60,
          Cell: ({
            row: {
              original: { remark_type },
            },
          }) => remarkType(remark_type),
        },
        {
          Header: t('下单数'),
          accessor: 'plan_amount',
          minWidth: 60,
          Cell: ({ row: { original } }) =>
            `${+Big(original.plan_amount).toFixed(2)}${
              original.sale_unit_name
            }`,
        },
        {
          Header: <HeaderTip title={t('计划生产数')} tip={<PlanTip />} />,
          accessor: 'req_release_amount',
          minWidth: 100,
          Cell: (cellProps) => {
            return (
              <Observer>
                {() => {
                  const { index, original } = cellProps.row
                  return (
                    <Flex alignCenter>
                      <InputNumberV2
                        onChange={(value) => handleChangeAmount(index, value)}
                        value={original.req_release_amount}
                        max={99999}
                        min={0}
                        precision={2}
                        style={{ width: '60px' }}
                      />
                      {original.sale_unit_name}
                      {original.req_release_amount === 0 && (
                        <WarningPopover text={t('计划生产数不能为0')} />
                      )}
                    </Flex>
                  )
                }}
              </Observer>
            )
          },
        },
        {
          Header: t('当前库存'),
          accessor: 'stock',
          minWidth: 70,
          Cell: ({ row: { original } }) =>
            `${original.stock}${original.sale_unit_name}`,
        },
      ]}
    />
  )
})

const OperateButton = observer((props) => {
  const { publishSelectedData } = taskStore
  const { viewType } = props
  const canSubmit =
    (viewType === 'edit' && publishSelectedData.length > 0) ||
    viewType === 'view' // 编辑状态下，需要有数据才能提交

  const handleCheck = () => {
    let checkZero = false
    _.each(publishSelectedData, (item) => {
      const amount = item.req_release_amount
      if (!amount) checkZero = true
    })
    if (checkZero) {
      Tip.warning(t('请填写计划生产数！'))
      return false
    }

    return true
  }

  const handlePublish = (submitType) => {
    const isOnlyOutOfStock = props.isOnlyOutOfStock
    // 编辑状态需要校验
    if ((viewType === 'edit' && handleCheck()) || viewType === 'view') {
      taskStore.postTaskList(submitType, isOnlyOutOfStock).then((json) => {
        Modal.hide()
        taskStore.doFirstRequest()
        if (!json.code) {
          Tip.success(t('发布成功!'))
        }
      })
    }
  }

  return (
    <Flex justifyEnd className='gm-margin-top-10'>
      <Button
        type='primary'
        plain
        onClick={() => handlePublish(0)}
        disabled={!canSubmit}
      >
        {t('仅发布任务')}
      </Button>
      <div className='gm-gap-10' />
      <Button
        type='primary'
        onClick={() => handlePublish(1)}
        disabled={!canSubmit}
      >
        {t('发布并下达加工单')}
      </Button>
    </Flex>
  )
})

OperateButton.propTypes = {
  // 显示类型，'edit'为可编辑，'view'为全选页时不可编辑态
  viewType: PropTypes.string.isRequired,
  // 是否是发布库存不足任务
  isOnlyOutOfStock: PropTypes.bool,
}

const TaskPublishModal = observer((props) => {
  const { viewType, selectedData, isOnlyOutOfStock } = props
  return (
    <>
      {viewType === 'edit' ? <Edit selectedData={selectedData} /> : <View />}
      <OperateButton viewType={viewType} isOnlyOutOfStock={isOnlyOutOfStock} />
    </>
  )
})

TaskPublishModal.propTypes = {
  // 显示类型，'edit'为可编辑，'view'为全选页时不可编辑态
  viewType: PropTypes.string.isRequired,
  selectedData: PropTypes.array.isRequired,
  isOnlyOutOfStock: PropTypes.bool,
}

export default TaskPublishModal
