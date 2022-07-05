import React from 'react'
import { observer } from 'mobx-react'
import SkuListCard from './sku_group_card'
import SkuDetailFormGroup from './sku_detail_form_group'
import InitSaleCheckDetail from '../../../../guides/init/guide/init_sale_check_detail'
import skuStore from '../sku_store'

@observer
class SkuDetail extends React.Component {
  render() {
    return (
      <div className='gm-padding-top-20'>
        <SkuListCard {...this.props} />
        <SkuDetailFormGroup {...this.props} />
        <InitSaleCheckDetail ready={skuStore.activeIndex > 0} />
      </div>
    )
  }
}

export default SkuDetail
