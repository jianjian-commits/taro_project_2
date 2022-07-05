import React from 'react'
import { observer } from 'mobx-react'
import { i18next } from 'gm-i18n'
import { Dialog, Popover, RightSideModal } from '@gmfe/react'
import { printerOptionsStore } from 'common/components/common_printer_options'
import PropTypes from 'prop-types'

const CommonPrePrintBtn = ({
  children,
  mustConfirm,
  goToPrint,
  PrinterOptionsModal,
}) => {
  const {
    hidePrinterOptionsModal,
    syncObservableFromLocalstorage,
  } = printerOptionsStore

  const openModal = () => {
    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '350px' },
      children: PrinterOptionsModal,
    })
  }

  const printFlowStep = () => {
    if (!hidePrinterOptionsModal) {
      openModal()
    } else {
      goToPrint()
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

CommonPrePrintBtn.propTypes = {
  mustConfirm: PropTypes.bool, // 是否需要提醒框
  goToPrint: PropTypes.func.isRequired, // 打印函数
  PrinterOptionsModal: PropTypes.element.isRequired, // 模态框
}

export default observer(CommonPrePrintBtn)
