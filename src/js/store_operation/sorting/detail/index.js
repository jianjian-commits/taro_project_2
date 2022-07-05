import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { FullTab } from '@gmfe/frame'
import SortingOrder from './sorting_order'
import SortingMerchandise from './sorting_merchandise'
import SalesSpecification from './sales_specification'
import PackageDetail from '../package_detail'
import globalStore from '../../../stores/global'

@observer
class SortingDetail extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      active: Number(this.props.location.query.tab) || 0,
    }
  }

  componentDidMount() {
    globalStore.fetchCustomizedConfigs()
  }

  render() {
    const canExportPackage = globalStore.hasPermission('export_package')
    return (
      <FullTab
        active={this.state.active}
        onChange={(tab) => this.setState({ active: tab })}
        tabs={
          canExportPackage
            ? [
                i18next.t('按商品分拣'),
                i18next.t('按订单分拣'),
                i18next.t('打包明细'),
                i18next.t('按销售规格分拣'),
              ]
            : [
                i18next.t('按商品分拣'),
                i18next.t('按订单分拣'),
                i18next.t('按销售规格分拣'),
              ]
        }
      >
        <SortingMerchandise />
        <SortingOrder />
        {canExportPackage && <PackageDetail />}
        <SalesSpecification />
      </FullTab>
    )
  }
}

export default SortingDetail
