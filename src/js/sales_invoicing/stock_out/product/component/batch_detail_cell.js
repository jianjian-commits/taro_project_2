import React from 'react'
import { observer } from 'mobx-react'
import { Flex, Popover, RightSideModal, Tip } from '@gmfe/react'
import { i18next, t } from 'gm-i18n'
import HoverTips from './hover_tips'
import BatchSelect from './batch_select'
import memoComponentHoc from './memo_component'

const OutOfStockBatch = () => {
  return (
    <Flex row>
      <span
        className='gm-not-allowed gm-margin-right-5'
        style={{
          color: '#999999',
        }}
      >
        {t('选择批次')}
      </span>
      <Popover
        showArrow
        component={<div />}
        type='hover'
        popup={<HoverTips text={t('该商品出库数为0，无需选择批次')} />}
      >
        <i className='ifont xfont-warning-circle gm-text-red' />
      </Popover>
    </Flex>
  )
}

const Abnormal = () => {
  return (
    <div className='b-stock-out-anomaly'>
      <span
        style={{
          color: '#ff0000',
          textDecoration: 'underline',
          marginRight: '5px',
        }}
      >
        {t('选择批次')}
      </span>
      <Popover
        showArrow
        component={<div />}
        type='hover'
        popup={
          <HoverTips
            text={t('所选批次库存数小于出库数，请更改批次或修改退货数')}
          />
        }
      >
        <span
          style={{
            backgroundColor: '#ff0000',
            color: '#ffffff',
            padding: '2px',
          }}
        >
          {t('异常')}
        </span>
      </Popover>
    </div>
  )
}

const NotNormal = () => {
  return (
    <div className='b-stock-out-anomaly'>
      <span
        style={{
          color: '#ff0000',
          textDecoration: 'underline',
          marginRight: '5px',
        }}
      >
        {t('修改批次')}
      </span>
      <Popover
        showArrow
        component={<div />}
        type='hover'
        popup={
          <HoverTips text={t('当前批次状态为非正常状态，请重新选择批次')} />
        }
      >
        <span
          style={{
            backgroundColor: '#ff0000',
            color: '#ffffff',
            padding: '2px',
          }}
        >
          {t('异常')}
        </span>
      </Popover>
    </div>
  )
}

const BatchDetailCell = observer(({ index, type, data }) => {
  // status: 1  // M, int,-1，删除；1，待提交（净菜）；2，正常；3，损坏；4，临期；5，过期
  // const isAdd = window.location.href.includes('stock_out/product/add')
  const isAdd = type === 'add'
  const { out_of_stock, is_anomaly, batchSelected, batch_details } = data
  const notNormalBatch = batch_details.filter((it) => it.status !== 2)
  const isNormal = notNormalBatch.length === 0 || isAdd

  const is_has_selected = !!batchSelected.length && isNormal

  const handleBatch = () => {
    const { id, quantity } = data

    if (!(id && quantity)) {
      Tip.warning(i18next.t('请先填写商品名和出库数'))
      return false
    }

    RightSideModal.render({
      children: <BatchSelect index={index} />,
      title: t('选择出库批次'),
      onHide: RightSideModal.hide,
      opacityMask: true,
      style: {
        width: '1000px',
      },
    })
  }

  return (
    <>
      {/* 如果商品标记缺货，则不用选择批次 */}
      {out_of_stock ? (
        <OutOfStockBatch />
      ) : (
        <a onClick={handleBatch}>
          {is_has_selected ? (
            t('查看批次')
          ) : is_anomaly ? (
            <Abnormal />
          ) : !isNormal && batch_details.length !== 0 ? (
            <NotNormal />
          ) : (
            t('选择批次')
          )}
        </a>
      )}
    </>
  )
})

export default memoComponentHoc(BatchDetailCell)
