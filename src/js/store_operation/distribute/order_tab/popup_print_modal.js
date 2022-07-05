import { i18next } from 'gm-i18n'
import React from 'react'
import {
  Flex,
  DropDown,
  DropDownItem,
  DropDownItems,
  Button,
  Tip,
} from '@gmfe/react'
import PropTypes from 'prop-types'
import globalStore from '../../../stores/global'
import './reducer.js'
import './actions.js'
import { observer } from 'mobx-react'
import printTemplateStore from 'common/components/select_print_template/store'
import {
  PrintTemplateRadioGroup,
  ToggleTemplateVersion,
} from 'common/components/select_print_template/print_template_radio_group'
import { openNewTab } from 'common/util'
import { handleCommonOrderPrint } from '../../common/util'

@observer
class PopupPrintModal extends React.Component {
  handlePrint() {
    const {
      curAddressId,
      curOrderId,
      orderIdList,
      deliveryType = 1,
      selectAllType,
      isSelectAll,
      filter,
      showKidPrint,
    } = this.props
    const {
      templateId,
      isOldVersion,
      splitOrderType,
      isPrintSid,
      isPrintKid,
      kidMergeType,
    } = printTemplateStore
    if (!isPrintKid && !isPrintSid) {
      Tip.warning(i18next.t('请选择单据类型'))
      return false
    }
    // 由showKidPrint && isPrintKid都为true才能判断为批量kid打印
    function isPrintKidMerge() {
      return showKidPrint && isPrintKid
    }

    const order_ids = curOrderId || orderIdList // 单个打印 or 批量打印

    let URL = isOldVersion
      ? '#/system/setting/distribute_templete/print'
      : '#/system/setting/order_printer/print'

    if (kidMergeType === 2 && isPrintKidMerge()) {
      URL = '#/system/setting/order_printer/print_sid_detail2'
    }

    handleCommonOrderPrint({
      URL,
      order_ids,
      address_id: curAddressId, // 当前商户id,用来拉分组分类配置
      template_id: templateId, // 模板id
      split_order_type: splitOrderType, // 0: 普通打印 1: 分单打印
      delivery_type: deliveryType,
      selectAllType,
      isSelectAll,
      filter,
      isPrintKid: isPrintKidMerge(),
      isPrintSid,
      kidMergeType,
    })

    this.props.closeModal()
  }

  handleEditDistributeOrder() {
    const { curOrderId } = this.props
    const { templateId } = printTemplateStore

    openNewTab(
      `#/supply_chain/distribute/task/edit_distribute?template_id=${templateId}&order_id=${curOrderId}`,
    )
    this.props.closeModal()
  }

  render() {
    const { curOrderId, showKidPrint, curAddressId } = this.props
    const canEdit = globalStore.hasPermission('edit_distribute_config')
    // 编辑配送单权限, 旧配送单方案才能编辑配送单
    const canEditDistribute =
      globalStore.hasPermission('distribution_order_edit') &&
      printTemplateStore.isOldVersion

    return (
      <Flex
        column
        style={{ width: '300px' }}
        className='b-distribute-order-popup-right'
      >
        <Flex
          justifyBetween
          alignCenter
          className='gm-border-bottom gm-padding-bottom-5 gm-padding-right-15'
        >
          <h4>{i18next.t('选择单据模板')}</h4>
          {curOrderId && canEditDistribute ? (
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
              <Button type='primary' onClick={this.handlePrint.bind(this)}>
                {i18next.t('打印')}
              </Button>
            </DropDown>
          ) : (
            <Button type='primary' onClick={this.handlePrint.bind(this)}>
              {i18next.t('打印')}
            </Button>
          )}
        </Flex>
        <ToggleTemplateVersion />
        <PrintTemplateRadioGroup
          addressId={curAddressId}
          showKidPrint={showKidPrint}
          canEdit={canEdit}
        />
      </Flex>
    )
  }
}

PopupPrintModal.propTypes = {
  curOrderId: PropTypes.string, // 单个打印,订单id
  curAddressId: PropTypes.string, // 单个打印,商户sid
  orderIdList: PropTypes.array, // 批量打印,订单数组
  deliveryType: PropTypes.number, // 调用打印接口类型 => 1: 旧打印接口 2: 新打印接口
  selectAllType: PropTypes.number, // 1: 当前页全选， 2: 所有页全选
  isSelectAll: PropTypes.bool, // 是否全选
  filter: PropTypes.object, // 搜索条件
  closeModal: PropTypes.func,
  showKidPrint: PropTypes.bool,
}

export default PopupPrintModal
