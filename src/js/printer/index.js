import { i18next } from 'gm-i18n'
import React from 'react'
import { FullTabV2 } from '@gmfe/frame'
import Delivery from './order_printer/tem_list'
import Purchase from './purchase_printer/tem_list'
import Label from './label'
import OldDelivery from '../distribute_template'
import StockIn from './stockin_printer/tem_list'
import StockOut from './stockout_printer/tem_list'
import Settle from './settle_printer/tem_list'
import PreSortList from './pre_sort_label/tem_list'
import OrderTemplate from '../order_template'
import QuotationImportTemplate from '../quotation_import_template'
import BoxLabel from './box_label'
import SalemenusList from './salemenus_printer/tem_list'
import { withViewStateStorage } from 'gm-service/src/action_storage'
import ACTION_STORAGE_KEY_NAMES from '../common/action_storage_key_names'

import globalStore from 'stores/global'

@withViewStateStorage({
  selector: ['tabKey'],
  name: ACTION_STORAGE_KEY_NAMES.TEMPLATE_INDEX,
})
class Printer extends React.Component {
  state = {
    tabKey: '0',
    deliveryVersion: 1, // 1旧 2新
  }

  componentDidMount() {
    const { activeType } = this.props.location.query
    if (activeType) {
      this.setState({ tabKey: activeType })
    }
    // 🚸旧版打印模板地址是: /system/setting/distribute_templete
    const deliveryVersion =
      window.location.hash === '#/system/setting/distribute_templete' ? 1 : 2
    this.setState({ deliveryVersion })
  }

  handleSelectTab = (tabKey) => {
    this.setState({ tabKey })
  }

  render() {
    const { tabKey, deliveryVersion } = this.state
    const { isCStation } = globalStore.otherInfo
    const isHKOrder = globalStore.isHuaKang()

    const tabs = [
      {
        name: i18next.t('配送模板'),
        key: '0',
        content: deliveryVersion === 1 ? <OldDelivery /> : <Delivery />,
      },
      { name: i18next.t('采购模板'), key: '1', content: <Purchase /> },
      { name: i18next.t('入库模板'), key: '2', content: <StockIn /> },
      { name: i18next.t('出库模板'), key: '3', content: <StockOut /> },
      { name: i18next.t('结款模板'), key: '4', content: <Settle /> },
      { name: i18next.t('分拣标签'), key: '5', content: <Label /> },
      { name: i18next.t('装箱标签'), key: '6', content: <BoxLabel /> },
      {
        name: i18next.t('报价单模板'),
        key: 'salemenus',
        content: <SalemenusList />,
      },
      !isHKOrder &&
        !isCStation && {
          name: i18next.t('订单导入模板'),
          key: '7',
          content: <OrderTemplate />,
        },
      {
        name: i18next.t('预分拣标签'),
        key: 'pre_sort',
        content: <PreSortList />,
      },
      {
        name: i18next.t('报价单导入模板'),
        key: '8',
        content: <QuotationImportTemplate />,
      },
    ].filter((o) => o)

    return (
      <FullTabV2
        activeKey={tabKey}
        tabs={tabs}
        onChange={this.handleSelectTab}
      />
    )
  }
}

export default Printer
