import { i18next } from 'gm-i18n'
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  RightSideModal,
  Drawer,
  Storage,
  FunctionSet,
  Tip,
  Button,
  Dialog,
  Modal,
} from '@gmfe/react'
import _ from 'lodash'
import { observer } from 'mobx-react'

import CommonSkus from '../common_skus'
import OrderCopyModal from './order_copy_modal'
import { isOrderDistributing } from '../util'
import SkuRecognition from '../../sku_recognition/index'

import orderDetailStore from '../../store'
import globalStore from '../../../stores/global'
import SalePricesSelect from './sync_order_to_skus'

const Action = observer(({ isLKOrder, repair }) => {
  const [isRankSaving, setRankSavingState] = useState(false)

  const textRecognition = globalStore.hasPermission(
    'edit_order_by_recognize_text',
  )
  const imgRecognition = globalStore.hasPermission('add_skus_by_image')
  const isEditOrder = globalStore.hasPermission('edit_order')
  const isOldOrderEditable = globalStore.hasPermission('edit_old_order_change')
  const syncToSaleMenu = globalStore.hasPermission(
    'edit_order_price_sync_to_sku',
  )
  const isHKOrder = globalStore.isHuaKang()

  const { orderDetail } = orderDetailStore
  const { viewType, isRanking, _id } = orderDetail

  const isOrderDistribute = isOrderDistributing(orderDetail)
  const canEditSequence =
    viewType === 'view' &&
    ((isOldOrderEditable && isOrderDistribute) ||
      (isEditOrder && !isOrderDistribute))

  const handleUploadShow = () => {
    orderDetailStore.importChange({ importShow: true })
  }

  const handleCommonlistShow = () => {
    RightSideModal.render({
      children: <CommonSkus />,
      onHide: RightSideModal.hide,
      style: { width: '900px', overflowY: 'scroll' },
    })
  }

  const handleCopyOrder = () => {
    Drawer.render({
      children: <OrderCopyModal />,
      onHide: Drawer.hide,
      opacityMask: false,
      style: {
        width: '630px',
      },
    })
  }

  const handleHide = () => {
    // 保存关闭时间
    orderDetailStore.setRecognition()
    RightSideModal.hide()
  }

  const handleOrderRecognize = () => {
    const { time_config_info, customer } = orderDetail
    RightSideModal.render({
      children: (
        <SkuRecognition
          serviceTime={time_config_info}
          customer={customer}
          recognitionData={orderDetailStore.recognitionData}
          canRecognizeText={textRecognition}
          canRecognizeImg={imgRecognition}
        />
      ),
      onHide: handleHide,
      noCloseBtn: true,
      style: { width: '900px' },
    })
  }

  const handleToggleSequence = () => {
    const { isRanking, details, combine_goods_map } = orderDetail
    if (combine_goods_map && _.values(combine_goods_map).length) {
      return Tip.info('订单存在组合商品不允许排序')
    }

    if (isRanking) {
      // 保存顺序
      setRankSavingState(true)

      orderDetailStore
        .update()
        .then(() => {
          setRankSavingState(false)
          orderDetailStore.receiveChange({
            isRanking: false,
            category_sort_type: null,
            detailsBeforeRank: null,
          })
        })
        .catch(() => setRankSavingState(false))
    } else {
      // 修改顺序
      orderDetailStore.receiveChange({
        ...orderDetailStore.processDetail(isOrderDistribute),
        isRanking: true,
        detailsBeforeRank: details,
      })
    }
  }

  const handleToggle = () => {
    Storage.set('ORDER_DETAIL_VERSION', 'old')
    window.location.reload()
  }

  const getSkusSalePriceList = () => {
    const { details } = orderDetail
    const skusGroup = _.groupBy(details, (sku) => sku.id)
    const skusSalePriceList = _.map(skusGroup, (value, key) => {
      return {
        id: key,
        name: value[0].name,
        sale_price_list: _.uniqBy(
          _.map(value, (v) => ({
            sale_price: v.sale_price,
            detail_id: v.detail_id || v.sku_id,
            fee_type: v.fee_type,
            sale_unit_name: v.sale_unit_name,
            std_sale_price_forsale: v.std_sale_price_forsale,
          })),
          'sale_price',
        ), // 需要去掉重复价格
        selected: value[0].detail_id,
      }
    })
    return skusSalePriceList
  }

  const handleSyncToSku = () => {
    // 多sku存在一个商品有多个价格的情况，需要用户确认同步哪一个价格
    const skusSalePriceList = getSkusSalePriceList()
    const isSkusOrder =
      _.findIndex(
        skusSalePriceList,
        (sku) => sku.sale_price_list.length > 1,
      ) !== -1

    // 确认同步商品的哪个价格
    if (isSkusOrder) {
      Modal.render({
        children: (
          <SalePricesSelect order_id={_id} salePriceList={skusSalePriceList} />
        ),
        style: { width: '450px', maxHeight: '450px' },
        title: i18next.t('提示'),
        onHide: Modal.hide,
      })
      return
    }

    Dialog.confirm({
      children: (
        <div>
          <div>
            {i18next.t('确认后可将订单内商品价格同步至报价单，是否同步？')}
          </div>
          <div style={{ color: '#AAAAAA' }}>
            {i18next.t('阶梯定价商品的价格不能同步至报价单')}
          </div>
        </div>
      ),
      title: i18next.t('确认同步'),
    }).then(() => {
      orderDetailStore.orderSyncToSku({ order_id: _id })
    })
  }

  /**
   * 一键更新：更新为后台返回的价格，四舍五入之前的
   */
  const handleUpdate = () => {
    orderDetailStore.onBatchUpdatePrice()
  }

  // 新增站点隐藏订单旧版本, 现有最新站点1352
  const group_id = globalStore.groupId

  return (
    <div>
      {viewType === 'view' ? (
        canEditSequence && isRanking ? (
          <Button
            loading={isRankSaving}
            onClick={handleToggleSequence}
            className='gm-margin-right-10'
          >
            {i18next.t('保存顺序')}
          </Button>
        ) : (
          <Button
            type='primary'
            onClick={handleToggleSequence}
            className='gm-margin-right-10'
          >
            {i18next.t('修改顺序')}
          </Button>
        )
      ) : null}
      {!isHKOrder && viewType !== 'view' && group_id <= 1352 && (
        <div className='gm-flex gm-inline gm-margin-right-10'>
          <a onClick={handleToggle}>{i18next.t('旧版本')}</a>
        </div>
      )}
      {!isHKOrder && !isLKOrder && viewType !== 'view' && !repair && (
        <Button
          type='primary'
          onClick={handleUploadShow}
          className='gm-margin-right-10'
        >
          {i18next.t('模板导入')}
        </Button>
      )}
      {isHKOrder && viewType === 'create' && (
        <Button
          type='primary'
          onClick={handleCopyOrder}
          className='gm-margin-right-10'
        >
          {i18next.t('复制订单')}
        </Button>
      )}
      <FunctionSet
        right
        data={[
          {
            text: i18next.t('智能识别'),
            onClick: handleOrderRecognize,
            /**
             * 单独把智能识别放出来,不判断isHKOrder
             */
            show:
              (textRecognition || imgRecognition) &&
              (viewType === 'create' || viewType === 'edit'),
          },
          {
            text: i18next.t('复制订单'),
            onClick: handleCopyOrder,
            show: viewType === 'create' && !isHKOrder,
          },
          {
            text: i18next.t('常用商品'),
            onClick: handleCommonlistShow,
            show: !isLKOrder && !isHKOrder,
          },
          {
            text: i18next.t('同步至报价单'),
            onClick: handleSyncToSku,
            show: viewType === 'view' && syncToSaleMenu,
          },
          {
            text: i18next.t('一键更新真实单价'),
            onClick: handleUpdate,
            show: viewType === 'edit' || viewType === 'create',
          },
        ]}
      />
    </div>
  )
})

Action.displayName = 'Action'
Action.propTypes = {
  canEditSequence: PropTypes.bool,
  textRecognition: PropTypes.bool,
  imgRecognition: PropTypes.bool,
  isLKOrder: PropTypes.bool,
  repair: PropTypes.bool,
  order: PropTypes.object,
}

export default Action
