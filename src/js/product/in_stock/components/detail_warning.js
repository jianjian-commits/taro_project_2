import { i18next } from 'gm-i18n'
import React from 'react'

class InStockDetailWarning extends React.Component {
  handleShowPurchaseSkus = () => {
    const { purchase_sheet_id } = this.props
    window.open(`#/supply_chain/purchase/bills/${purchase_sheet_id}`)
  }

  render() {
    const { purchase_sheet_id, status } = this.props
    return (
      <div className='gm-padding-tb-10'>
        {purchase_sheet_id && (
          <div className='gm-text-desc'>
            <i className='ifont ifont-warning gm-margin-right-5' />
            {i18next.t('当前入口商品信息来源自采购单据')}
            <a href='javascript:;' onClick={this.handleShowPurchaseSkus}>
              {purchase_sheet_id}
            </a>
            {i18next.t('，仅供参考，请根据实际情况修改入库商品信息')}
          </div>
        )}

        {status !== 0 && status !== 1 && (
          <div className='gm-margin-top-5 b-warning-tips'>
            <i className='ifont xfont-warning-circle' />
            {i18next.t(
              '当入库单中的商品用于出库、退货、盘点后，此入库单将不能再进行审核不通过和冲销操作'
            )}
          </div>
        )}
      </div>
    )
  }
}

export default InStockDetailWarning
