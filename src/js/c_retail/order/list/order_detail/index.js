import React from 'react'
import { i18next } from 'gm-i18n'
import { Loading, BoxPanel } from '@gmfe/react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'

import OrderDetailList from './list'
import store from './store'
import OrderDetailHeader from '../components/detail_header'
import { withBreadcrumbs } from 'common/service'
import { refPriceTypeHOC } from 'common/components/ref_price_type_hoc'
import { saleReferencePrice } from 'common/enum'
import { findItemFromType } from '../../../../order/order_detail/util'

import Summary from '../../../../order/order_detail/components/summary'
import PanelTitle from './panel_title'

// 若修改了列表相关字段，记得修改这里，因为localStorage会缓存!!!
const FILTER_STORAGE = '_toc_sku_detail_filterBox_V1.2'

@refPriceTypeHOC(3)
@withBreadcrumbs([i18next.t('订单详情')])
@observer
class OrderDetail extends React.Component {
  componentDidMount() {
    const { id } = this.props.location.query
    store.get(id)
  }

  componentWillUnmount() {
    // 清除订单详情数据
    store.clear()
  }

  render() {
    const { orderDetail, loading, total } = store
    const { query } = this.props.location
    const { details: skus } = orderDetail
    const { postRefPriceType, refPriceType } = this.props
    const referencePriceFlag =
      findItemFromType(saleReferencePrice, refPriceType).flag || ''

    if (loading) {
      return (
        <Loading
          style={{
            marginTop: '50px'
          }}
        />
      )
    }

    return (
      <div className='b-order col-md-12'>
        <OrderDetailHeader
          orderDetail={orderDetail}
          query={query}
          isOrderDetail
        />
        <BoxPanel
          icon='bill'
          title={i18next.t('订单明细')}
          summary={
            <>
              <PanelTitle total={total} />
              <Summary skus={skus} />
            </>
          }
          collapse
        >
          <OrderDetailList
            refPriceType={refPriceType}
            referencePriceFlag={referencePriceFlag}
            postRefPriceType={postRefPriceType}
            filterStorageKey={FILTER_STORAGE + 'view'}
          />
        </BoxPanel>
      </div>
    )
  }
}

OrderDetail.propTypes = {
  refPriceType: PropTypes.number,
  postRefPriceType: PropTypes.func
}

export default OrderDetail
