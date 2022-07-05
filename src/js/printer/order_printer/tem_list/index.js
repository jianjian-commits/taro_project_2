import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import {
  RightSideModal,
  Button,
  DropDown,
  DropDownItems,
  DropDownItem,
} from '@gmfe/react'
import { isVersionSwitcherShow } from 'common/print_log'
import postPrinterVersion from 'common/components/post_printer_version_hoc'
import CustomerSettingModal from './components/customer_setting_modal'
import { Link } from 'react-router-dom'
import temListStore from './store'
import { observer } from 'mobx-react'
import globalStore from 'stores/global'
import OrderTemList from './components/order_tem_list'

@postPrinterVersion('old')
class RightBtn extends React.Component {
  state = {
    isVersionSwitcherShow: true,
  }

  async componentDidMount() {
    const isOk = await isVersionSwitcherShow()
    this.setState({ isVersionSwitcherShow: isOk })
  }

  render() {
    const canCreate = globalStore.hasPermission('add_print_template_new')

    return (
      <div>
        {this.state.isVersionSwitcherShow && (
          <Link
            to='/system/setting/distribute_templete'
            onClick={() => this.props.postPrinterVersion()}
            replace
          >
            {i18next.t('旧版本')}
          </Link>
        )}
        <div className='gm-gap-10' />
        {canCreate && (
          <DropDown
            split
            popup={
              <DropDownItems>
                <DropDownItem
                  onClick={() => {
                    window.location =
                      '#/system/setting/order_printer/template_editor'
                  }}
                >
                  {i18next.t('商户配送单')}
                </DropDownItem>
                <DropDownItem
                  onClick={() => {
                    window.location =
                      '#/system/setting/account_printer/template_editor'
                  }}
                >
                  {i18next.t('账户配送单')}
                </DropDownItem>
              </DropDownItems>
            }
          >
            <Button
              type='primary'
              onClick={() => {
                window.location =
                  '#/system/setting/order_printer/template_editor'
              }}
            >
              {i18next.t('新建模板')}
            </Button>
          </DropDown>
        )}
      </div>
    )
  }
}

RightBtn.propTypes = {
  postPrinterVersion: PropTypes.func,
}

@observer
class OrderList extends React.Component {
  static editURL = '/system/setting/order_printer/template_editor'

  handleCustomerSetting = (item) => {
    RightSideModal.render({
      onHide: RightSideModal.hide,
      style: { width: '570px' },
      children: (
        <CustomerSettingModal
          templateId={item.id}
          selected={item.address_ids}
        />
      ),
    })
  }

  render() {
    const canEdit = globalStore.hasPermission('edit_print_template_new')
    const canDelete = globalStore.hasPermission('delete_print_template_new')

    const props = {
      title: i18next.t('配送模板列表'),
      editURL: OrderList.editURL,
      canEdit,
      canDelete,
      handleCustomerSetting: this.handleCustomerSetting, // 商户设置
      temListStore,
      BoxTableAction: RightBtn,
    }

    return <OrderTemList {...props} />
  }
}

export default OrderList
