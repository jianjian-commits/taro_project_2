import React, { useContext } from 'react'
import { observer } from 'mobx-react'
import { Button, Dialog, FunctionSet, Tip } from '@gmfe/react'
import { t } from 'gm-i18n'
import { isNil } from 'lodash'
import global from 'stores/global'

import { storeContext } from './details_component'
import { history } from 'common/service'
import moment from 'moment'
import Big from 'big.js'

const ButtonGroup = () => {
  const store = useContext(storeContext)
  const { viewType, status, handleExport, id, is_frozen } = store

  const printSplitOrder = () => {
    window.open(
      `/#/sales_invoicing/processing_division/split_document/print?id=${id}`
    )
  }

  const handleSetViewType = () => {
    const { setViewType } = store
    setViewType('edit')
  }

  const handleSubmit = (status) => {
    const { handleUpdate, id, fetchDetails } = store
    return handleUpdate({ id, status }).then(() => {
      const tipMap = {
        2: t('审核成功'),
        3: t('审核不通过成功'),
      }
      Tip.success(tipMap[status])
      fetchDetails(id)
    })
  }

  const handleDelete = () => {
    const { handleDelete, id, fetchDetails } = store
    Dialog.confirm({
      title: t('确认冲销'),
      children: t('是否冲销此单据？'),
      onOK: () =>
        handleDelete().then(({ code, msg }) => {
          if (code === 0) {
            Tip.success(t('冲销成功'))
            fetchDetails(id)
          } else {
            Tip.warning(msg)
          }
        }),
    })
  }

  if (viewType === 'details') {
    return (
      <>
        {(status === 1 || status === 3) && // 未审核或审核不通过
          global.hasPermission('edit_split_sheet') && (
            <>
              {status === 1 && (
                <Button
                  type='primary'
                  className='gm-margin-right-10'
                  onClick={() => handleSubmit(2)}
                >
                  {t('审核通过')}
                </Button>
              )}
              <Button
                type='primary'
                className='gm-margin-right-10'
                onClick={handleSetViewType}
              >
                {t('修改单据')}
              </Button>
            </>
          )}
        <FunctionSet
          right
          data={[
            { text: t('打印分割单'), onClick: printSplitOrder },
            { text: t('导出分割单'), onClick: handleExport },
            {
              text: t('审核不通过'),
              show: status === 1 && !is_frozen,
              onClick: () => handleSubmit(3),
            },
            {
              text: t('冲销'),
              show: (status === 2 || status === 3) && !is_frozen,
              onClick: handleDelete,
            },
          ]}
        />
      </>
    )
  }

  const getDisabled = () => {
    const { splitPlan, sourceQuantity, splitTime, gainSpus } = store
    return (
      isNil(splitPlan) ||
      isNil(sourceQuantity) ||
      isNil(splitTime) ||
      gainSpus.some(
        (item) => isNil(item.real_quantity) || isNil(item.in_stock_price)
      )
    )
  }

  const handleCancel = async () => {
    if (viewType === 'edit') {
      const { fetchDetails, id, setViewType } = store
      await fetchDetails(id)
      setViewType('details')
    } else {
      window.closeWindow()
    }
  }

  const handleSave = () => {
    const { sourceQuantity, gainSpus } = store
    let realQuantity = 0
    gainSpus.forEach((spu) => {
      realQuantity = Big(spu.real_quantity).plus(realQuantity)
    })
    if (realQuantity.gt(sourceQuantity)) {
      Tip.warning(t('实际获得量之和大于待分割品消耗量'))
      return
    }
    const actionMap = {
      create: handleCreate,
      edit: handleUpdate,
    }
    actionMap[viewType]()
  }

  const handleCreate = async () => {
    const { handleCreate } = store
    const {
      data: { id },
    } = await handleCreate()
    Tip.success(t('创建成功'))
    history.push(
      `/sales_invoicing/processing_division/split_document/details?id=${id}`
    )
  }

  const handleUpdate = async () => {
    const {
      handleUpdate,
      id,
      setViewType,
      fetchDetails,
      sourceQuantity,
      splitTime,
      gainSpus,
    } = store
    const params = {
      id,
      source_quantity: sourceQuantity,
      split_time: moment(splitTime).format('YYYY-MM-DD HH:mm:ss'),
      gain_spus: JSON.stringify(
        gainSpus.map((item) => {
          const { spu_id, real_quantity, in_stock_price } = item
          return { spu_id, real_quantity, in_stock_price }
        })
      ),
    }
    await handleUpdate(params)
    Tip.success(t('修改成功'))
    await fetchDetails(id)
    setViewType('details')
  }

  return (
    <>
      <Button onClick={handleCancel}>{t('取消')}</Button>
      <Button
        type='primary'
        className='gm-margin-left-10'
        onClick={handleSave}
        disabled={getDisabled()}
      >
        {t('保存')}
      </Button>
    </>
  )
}

export default observer(ButtonGroup)
