import { t } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { Price } from '@gmfe/react'
import stockList from './store'
import _ from 'lodash'
import Big from 'big.js'
import globalStore from 'stores/global'
import DragWeight from 'common/components/weight/drag_weight'
import bridge from '../../../bridge/index'

import ReceiptHeaderDetail from 'common/components/receipt_header_detail'
import Raw from './raw'
import Finished from './finished'

@observer
class StockOverview extends React.Component {
  componentDidMount() {
    stockList.getStockDetails(this.props.location.query.id)
  }

  render() {
    const { details } = stockList
    const {
      spu_id,
      name,
      avg_price,
      remain,
      unit_name,
      material,
      product,
      processing_amount,
      retention_warning_day,
    } = details

    const { id } = this.props.location.query

    let material_sum = 0
    let product_sum = 0
    _.forEach(material, (val) => {
      material_sum = Big(material_sum).plus(val.amount).toFixed(2)
    })

    _.forEach(product, (val) => {
      product_sum = Big(product_sum).plus(val.amount).toFixed(2)
    })

    // edit_sku_stocks
    const p_edit = globalStore.hasPermission('edit_sku_stocks')
    const weigh_check = globalStore.groundWeightInfo.weigh_check
    const { isInstalled } = bridge.mes_app.getChromeStatus()

    return (
      <div>
        <ReceiptHeaderDetail
          totalData={[
            {
              text: t('总库存'),
              value: remain + unit_name,
              left: true,
            },
            {
              text: t('原料库存'),
              value: material_sum + unit_name,
            },
            {
              text: t('成品库存'),
              value: product_sum + unit_name,
            },
            {
              text: t('加工中'),
              value: processing_amount + unit_name,
            },
          ]}
          HeaderInfo={[
            {
              label: t('商品信息'),
              item: (
                <div style={{ minWidth: '500px' }}>{name + '/' + spu_id}</div>
              ),
            },
          ]}
          ContentInfo={[
            {
              label: t('库存均价'),
              item: avg_price + Price.getUnit() + '/' + unit_name,
            },
          ]}
        />
        {/* 原料 */}
        <Raw
          data={material.slice()}
          id={id}
          edit={p_edit}
          retention_warning_day={retention_warning_day}
        />

        {/* 成品 */}
        <Finished
          data={product.slice()}
          edit={p_edit}
          id={id}
          retention_warning_day={retention_warning_day}
        />
        {!!weigh_check && isInstalled && <DragWeight />}
      </div>
    )
  }
}

export default StockOverview
