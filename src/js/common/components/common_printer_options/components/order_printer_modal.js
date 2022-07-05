import { i18next, t } from 'gm-i18n'
import React from 'react'
import {
  Flex,
  DropDown,
  DropDownItem,
  DropDownItems,
  Button,
  RightSideModal,
  Storage,
  Tip,
} from '@gmfe/react'
import PropTypes from 'prop-types'
import globalStore from 'stores/global'
import { observer } from 'mobx-react'
import { openNewTab } from 'common/util'
import printerOptionsStore from '../printer_options_store'
import CommonPrinterOptions from './common_printer_options'
import TogglePrinterTemplateVersion from './toggle_printer_template_version'

@observer
class OrderPrinterModal extends React.Component {
  handlePrint = () => {
    if (this.canPrint()) {
      return Tip.warning(t('请选择至少一个分类进行打印!'))
    }
    this.props.goToPrint()
  }

  canPrint = () => {
    const printRange = Storage.get('PRINT_CATEGORY_RANGE')
    const {
      splitOrderTypeWay,
      category1ListSelected,
      category2ListSelected,
      splitOrderType,
    } = printerOptionsStore
    // 固定一个分类一张单且按部分分类打印的时候必须要勾选至少一个分类 否则弹出提示
    if (
      splitOrderTypeWay === 1 &&
      !category1ListSelected.length &&
      printRange &&
      splitOrderType === 1
    ) {
      return true
    }
    if (
      splitOrderTypeWay === 2 &&
      !category2ListSelected.length &&
      printRange &&
      splitOrderType === 1
    ) {
      return true
    }
    return false
  }

  handleEditDistributeOrder() {
    const { orderIdList } = this.props
    const { templateId } = printerOptionsStore

    openNewTab(
      `#/supply_chain/distribute/task/edit_distribute?template_id=${templateId}&order_id=${orderIdList[0]}`,
    )
    RightSideModal.hide()
  }

  render() {
    const { orderIdList, curAddressId, showCommonSwitchControl } = this.props
    const isSingleOrder = orderIdList.length === 1
    const canEdit = globalStore.hasPermission('edit_distribute_config')
    // 编辑配送单权限, 旧配送单方案才能编辑配送单
    const canEditDistribute =
      globalStore.hasPermission('distribution_order_edit') &&
      printerOptionsStore.isOldVersion

    return (
      <Flex column className='b-distribute-order-popup-right'>
        <Flex
          justifyBetween
          alignCenter
          className='gm-border-bottom gm-padding-bottom-5 gm-padding-right-15'
        >
          <h4>{i18next.t('选择单据模板')}</h4>
          {isSingleOrder && canEditDistribute ? (
            <DropDown
              split
              right
              popup={
                <DropDownItems>
                  <DropDownItem
                    onClick={this.handleEditDistributeOrder.bind(this)}
                  >
                    {i18next.t('编辑配送单')}
                  </DropDownItem>
                </DropDownItems>
              }
            >
              <Button type='primary' onClick={this.handlePrint}>
                {i18next.t('打印')}
              </Button>
            </DropDown>
          ) : (
            <Button type='primary' onClick={this.handlePrint}>
              {i18next.t('打印')}
            </Button>
          )}
        </Flex>
        <TogglePrinterTemplateVersion />
        <CommonPrinterOptions
          addressId={curAddressId}
          showKidPrint={!isSingleOrder}
          canEdit={canEdit}
          showCommonSwitchControl={showCommonSwitchControl}
        />
      </Flex>
    )
  }
}

OrderPrinterModal.propTypes = {
  goToPrint: PropTypes.func.isRequired,
  curAddressId: PropTypes.string, // 单个打印,商户sid
  orderIdList: PropTypes.array.isRequired, // 批量打印,订单数组
  showCommonSwitchControl: PropTypes.bool, // 查看编辑单据不需要合并打印配送单
}

export default OrderPrinterModal
