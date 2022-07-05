import { i18next } from 'gm-i18n'
import React from 'react'
import { MoreSelect, Flex, Button } from '@gmfe/react'
import _ from 'lodash'
import { history } from '../common/service'
import PropTypes from 'prop-types'

import './actions'
import './reducer'
import actions from '../actions'
import ReceiptHeaderDetail from '../common/components/receipt_header_detail'

class SupplierSelect extends React.Component {
  componentDidMount() {
    actions.product_suppliers()
  }

  componentWillUnmount() {
    actions.product_selected_supplier(null)
  }

  handleNextStep = (event) => {
    event.preventDefault()
    const { selectSupplier } = this.props.product

    if (this.props.params.operate === 'refund') {
      actions
        .product_refund_stock_add({
          settle_supplier_id: selectSupplier.value,
          supplier_name: selectSupplier.text,
        })
        .then((json) => {
          history.push(`/sales_invoicing/stock_out/refund/add/${json.data.id}`)
        })
      return false
    }

    actions
      .product_in_stock_add({
        settle_supplier_id: selectSupplier.value,
        supplier_name: selectSupplier.text,
      })
      .then((json) => {
        history.push(`/sales_invoicing/stock_in/product/add/${json.data.id}`)
      })
  }

  handleCancel = (e) => {
    e.preventDefault()
    window.closeWindow()
  }

  handleSelect = (selectedData) => {
    actions.product_selected_supplier(selectedData)
  }

  render() {
    const { supplyGroup, selectSupplier } = this.props.product
    const isRefund = this.props.params.operate === 'refund'
    return (
      <ReceiptHeaderDetail
        contentLabelWidth={80}
        contentBlockWidth={250}
        HeaderInfo={[
          {
            label: isRefund ? i18next.t('退货单号') : i18next.t('入库单号'),
            item: <div>-</div>,
          },
          {
            label: i18next.t('供应商信息'),
            item: (
              <MoreSelect
                data={supplyGroup}
                selected={selectSupplier}
                isGroupList
                onSelect={this.handleSelect}
                renderListFilterType='pinyin'
                placeholder={
                  isRefund
                    ? i18next.t('请选择退货供应商')
                    : i18next.t('请选择入库供应商')
                }
              />
            ),
          },
        ]}
        ContentInfo={[
          {
            label: isRefund ? i18next.t('退货状态') : i18next.t('入库单状态'),
            item: <div> - </div>,
          },
          {
            label: isRefund ? i18next.t('退货时间') : i18next.t('入库时间'),
            item: <div> - </div>,
          },
          {
            label: isRefund ? i18next.t('退货人') : i18next.t('建单人'),
            item: <div> - </div>,
          },
        ]}
        HeaderAction={
          <Flex justifyEnd>
            <Button className='gm-margin-right-5' onClick={this.handleCancel}>
              {i18next.t('取消')}
            </Button>
            <Button
              type='primary'
              htmlType='submit'
              disabled={_.isEmpty(selectSupplier)}
              onClick={this.handleNextStep}
            >
              {i18next.t('保存')}
            </Button>
          </Flex>
        }
      />
    )
  }
}

SupplierSelect.propTypes = {
  product: PropTypes.object,
}

export default SupplierSelect
