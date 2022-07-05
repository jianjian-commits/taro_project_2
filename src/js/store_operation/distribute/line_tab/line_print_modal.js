import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, Checkbox, Button } from '@gmfe/react'
import { observer } from 'mobx-react'
import {
  printerOptionsStore,
  TogglePrinterTemplateVersion,
  CommonPrinterOptions,
} from 'common/components/common_printer_options'
import globalStore from 'stores/global'
import PropTypes from 'prop-types'

@observer
class LinePrintModal extends React.Component {
  render() {
    const { templateId, to_print_checklist, setOptions } = printerOptionsStore

    const canEdit = globalStore.hasPermission('edit_distribute_config')
    // 分拣核查单，只有使用新版本才展现
    const canPrintCheckSheet = globalStore.hasPermission('print_check_sheet')

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
          <h4>{i18next.t('选择单据模板')}</h4>
          <Button type='primary' onClick={this.props.goToPrint}>
            {i18next.t('打印')}
          </Button>
        </Flex>
        <TogglePrinterTemplateVersion />
        <CommonPrinterOptions canEdit={canEdit} showCommonSwitchControl />
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

LinePrintModal.propTypes = {
  goToPrint: PropTypes.func.isRequired,
}

export default LinePrintModal
