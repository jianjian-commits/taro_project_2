import React, { useRef } from 'react'
import { t } from 'gm-i18n'
import { Drawer, Tip } from '@gmfe/react'
import StockInScan from './stock_in_scan'
import store from '../store/receipt_store'
import { getSkuAdapter, isInShare } from '../../util'
import globalStore from '../../../../stores/global'
import _ from 'lodash'

const ScanDrawer = () => {
  const scanRef = useRef(null)

  const handleSearchByBarcode = async (data) => {
    const { stockInReceiptList, stockInShareList } = store

    const index = stockInReceiptList.length
    // 商品在分摊列表里就不能加入了
    if (!isInShare(stockInShareList, data.sku_id)) {
      // 同一规格商品多批次入库： 扫码一次为一个批次
      // 同一规格商品单批次入库： 若有相同的sku_id已存在于列表中，则不增加新批次，而是sku_id的入库数+1
      if (globalStore.otherInfo.batchInStock) {
        // 先添加一行空数据，以免默认数据丢失报错
        store.addStockInReceiptListItem()

        await store.setProductNameSelected(index, getSkuAdapter(data))

        store.setQuantityChange(index, 1)
        // 由于默认入库单价设置，现不取扫码的价格
        // store.setUnitPriceChange(index, price)
      } else {
        const skuIndex = _.findIndex(
          stockInReceiptList,
          (v) => v.id === data.sku_id
        )
        // 若已存在该商品，则数量加一
        if (skuIndex !== -1) {
          store.setQuantityChange(
            skuIndex,
            _.toNumber(stockInReceiptList[skuIndex].quantity) + 1
          )
          // 由于默认入库单价设置，现不取扫码的价格
          // store.setUnitPriceChange(index, price)
        } else {
          // 先添加一行空数据，以免默认数据丢失报错
          store.addStockInReceiptListItem()
          await store.setProductNameSelected(index, getSkuAdapter(data))

          store.setQuantityChange(index, 1)
          // 由于默认入库单价设置，现不取扫码的价格
          // store.setUnitPriceChange(index, price)
        }
      }
    } else {
      Tip.info(t('该商品已加入分摊不可重复添加，如需添加请取消分摊再进行操作'))
    }
  }

  const handlePopupScan = () => {
    let marginTop = 0
    if (scanRef.current) marginTop = scanRef.current.offsetTop

    Drawer.render({
      onHide: Drawer.hide,
      style: { width: '260px', height: '42px', marginTop: marginTop },
      opacityMask: true,
      children: <StockInScan onSearchByBarcode={handleSearchByBarcode} />,
    })
  }
  return (
    <div
      ref={scanRef}
      className='b-overview gm-border gm-padding-5'
      onClick={handlePopupScan}
    >
      {t('扫码')}
    </div>
  )
}

export default ScanDrawer
