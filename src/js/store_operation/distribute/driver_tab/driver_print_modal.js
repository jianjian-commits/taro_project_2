import { i18next } from 'gm-i18n'
import React from 'react'
import { Checkbox, Flex, Button } from '@gmfe/react'
import { observer } from 'mobx-react'
import globalStore from 'stores/global'
import PropTypes from 'prop-types'
import {
  printerOptionsStore,
  TogglePrinterTemplateVersion,
  CommonPrinterOptions,
} from 'common/components/common_printer_options'

@observer
class DriverPrintModal extends React.Component {
  render() {
    const {
      templateId,
      to_print_sku,
      to_print_task,
      to_print_checklist,
      setOptions,
    } = printerOptionsStore

    const canPrintDistribute = globalStore.hasPermission('get_distribute_print')
    const canPrintDriverTask = globalStore.hasPermission('print_driver_tasks')
    // 分拣核查单，只有使用新版本才展现
    const canPrintCheckSheet = globalStore.hasPermission('print_check_sheet')
    const canEdit = globalStore.hasPermission('edit_distribute_config')

    return (
      <Flex
        column
        style={{ width: '350px' }}
        className='b-distribute-order-popup-right'
      >
        <Flex
          justifyBetween
          alignCenter
          className='gm-border-bottom gm-padding-bottom-5 gm-padding-right-15'
        >
          <h4>{i18next.t('选择单据')}</h4>
          <Button type='primary' onClick={this.props.goToPrint}>
            {i18next.t('打印')}
          </Button>
        </Flex>

        <TogglePrinterTemplateVersion />
        {canPrintDistribute && (
          <CommonPrinterOptions canEdit={canEdit} showCommonSwitchControl />
        )}

        {canPrintDriverTask &&
          !printerOptionsStore.isThermalPrinter(templateId) && (
            <div>
              <Checkbox
                checked={to_print_task}
                onChange={(e) =>
                  setOptions('to_print_task', e.currentTarget.checked)
                }
              >
                {i18next.t('司机任务单')}
              </Checkbox>
              <div className='gm-text-helper b-distribute-order-popup-padding-l-19'>
                {i18next.t('将单个司机所有订单汇总成一张配送单，一司机一单')}
              </div>
            </div>
          )}

        {canPrintDriverTask &&
          !globalStore.isMalaysia() &&
          !printerOptionsStore.isThermalPrinter(templateId) && (
            <div>
              <Checkbox
                checked={to_print_sku}
                onChange={(e) =>
                  setOptions('to_print_sku', e.currentTarget.checked)
                }
              >
                {i18next.t('司机装车单')}
              </Checkbox>
              <div className='gm-text-helper b-distribute-order-popup-padding-l-19'>
                {i18next.t(
                  '将单个司机所有订单中的「按司机投框」的商品汇总成一张单，一个司机一张单',
                )}
              </div>
            </div>
          )}

        {canPrintCheckSheet &&
          !printerOptionsStore.isOldVersion &&
          !printerOptionsStore.isThermalPrinter(templateId) && (
            <div>
              <Checkbox
                checked={to_print_checklist}
                onChange={(e) =>
                  setOptions('to_print_checklist', e.currentTarget.checked)
                }
              >
                {i18next.t('分拣核查单')}
              </Checkbox>
              <div className='gm-text-helper b-distribute-order-popup-padding-l-19'>
                {i18next.t(
                  '仅打印按订单投框商品用于「按分拣号投框方式」的商品核对',
                )}
              </div>
            </div>
          )}
      </Flex>
    )
  }
}

DriverPrintModal.propTypes = {
  goToPrint: PropTypes.func.isRequired,
  closeModal: PropTypes.func,
}

export default DriverPrintModal
