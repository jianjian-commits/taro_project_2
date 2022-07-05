import React from 'react'
import { observer } from 'mobx-react'
import { i18next } from 'gm-i18n'
import { Dialog, Popover, RightSideModal } from '@gmfe/react'
import { printerOptionsStore } from 'common/components/common_printer_options'
import OrderPrinterModal from './components/order_printer_modal'
import { handleCommonOrderPrint } from 'common/components/common_printer_options/util'
import PropTypes from 'prop-types'
import globalStore from 'stores/global'

const OrderPrePrintBtn = ({
  children,
  mustConfirm,
  orderIdList,
  curAddressId,
  deliveryType,
  selectAllType,
  isSelectAll,
  getFilter = () => {},
  sortType,
  showCommonSwitchControl,
  isViewEditDocument,
}) => {
  const {
    hidePrinterOptionsModal,
    goToPrintPage,
    syncObservableFromLocalstorage,
    goToPrintKid,
  } = printerOptionsStore

  const goToPrint = () => {
    // 商户单打印 ：账户单打印
    printerOptionsStore.isPrintSid
      ? goToPrintPage({
          orderIdList,
          curAddressId,
          deliveryType,
          selectAllType,
          isSelectAll,
          filter: getFilter(),
          sortType,
          isViewEditDocument,
        })
      : goToPrintKid({
          orderIdList,
          selectAllType,
          isSelectAll,
          filter: getFilter(),
        })
  }

  const openModal = () => {
    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '320px' },
      children: (
        <OrderPrinterModal
          goToPrint={goToPrint}
          curAddressId={curAddressId}
          orderIdList={orderIdList}
          showCommonSwitchControl={showCommonSwitchControl}
        />
      ),
    })
  }

  const printFlowStep = () => {
    if (globalStore.isMalaysia()) {
      handleCommonOrderPrint({
        URL: '#/system/setting/distribute_templete/malay_print',
        order_ids: orderIdList,
        selectAllType,
        isSelectAll,
        filter: getFilter(),
      })
    } else {
      if (!hidePrinterOptionsModal) {
        openModal()
      } else {
        goToPrint()
      }
    }
  }

  const handlePrint = () => {
    if (mustConfirm) {
      Dialog.confirm({
        children: i18next.t('存在称重商品未称重或已缺货，确定要打印吗？'),
      })
        .then(() => {
          printFlowStep()
        })
        .catch(() => {})
    } else {
      printFlowStep()
    }
  }

  return (
    <Popover
      offset={-80}
      popup={
        hidePrinterOptionsModal ? (
          <div className='gm-padding-10'>
            <a
              className='gm-cursor'
              onClick={() => {
                syncObservableFromLocalstorage()
                openModal()
              }}
            >
              {i18next.t('点击拉取单据模板')}
            </a>
            ，{i18next.t('自主选择打印模板。')}
          </div>
        ) : null
      }
      type='hover'
    >
      <span
        className='gm-inline-block'
        onClick={() => {
          syncObservableFromLocalstorage()
          handlePrint()
        }}
      >
        {children}
      </span>
    </Popover>
  )
}

OrderPrePrintBtn.propTypes = {
  mustConfirm: PropTypes.bool, // 是否需要提醒缺货
  curAddressId: PropTypes.string, // 单个打印必须要传商户sid  🚀🔥🚸🚸批量打印不用传
  orderIdList: PropTypes.array, // 批量打印,订单数组
  deliveryType: PropTypes.number, // 调用打印接口类型 => 1: 旧打印接口 2: 新打印接口 (不传,默认为1)

  selectAllType: PropTypes.number, // 1: 当前页全选， 2: 所有页全选
  isSelectAll: PropTypes.bool, // 是否全选
  getFilter: PropTypes.func, // 搜索条件
  sortType: PropTypes.string, // 排序类型 'xxxx_asc' 或者 'xxxx_desc'. xxxx为字段
  showCommonSwitchControl: PropTypes.bool, // 查看编辑单据不需要合并打印sid
}

export default observer(OrderPrePrintBtn)
