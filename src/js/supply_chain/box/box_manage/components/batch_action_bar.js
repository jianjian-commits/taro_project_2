import { i18next } from 'gm-i18n'
import React from 'react'
import { observer } from 'mobx-react'
import { TableUtil } from '@gmfe/table'
import store from '../box_manage_store'
import _ from 'lodash'
import { toJS } from 'mobx'
import { TplPrintBtn } from 'common/components/tpl'

const BatchActionBar = observer((props) => {
  const { isSelectAllPage, selectedTree } = store

  const selectedKeys = _.flatMap(toJS(selectedTree), (skuKeys) => skuKeys)

  const skus = _.flatMap(toJS(store.list), (order) => order.children)
  const selectedSkus = _.filter(skus, (sku) => {
    return (
      sku.sku_box_status && !!_.find(selectedKeys, (key) => sku._key === key)
    )
  })

  const handleBatchPrint = (obj) => {
    const { selectedTree, isSelectAllPage } = store
    if (isSelectAllPage) {
      props.onPrintLabel({
        ...store.searchData,
        ...obj,
      })
      return
    }

    const selectedOrderIds = _.map(selectedTree, (skuKeys, order_id) => {
      if (skuKeys.length > 0) {
        return order_id
      }
      return null
    })
    const selectedOrders = _.filter(
      store.list,
      (order) => !!_.find(selectedOrderIds, (id) => id === order.order_id),
    )
    props.onPrintLabel({
      box_codes: _.uniq(
        _.flatMap(selectedSkus, (sku) =>
          _.map(sku.box_list, (box) => box.box_code),
        ),
      ),
      orders: selectedOrders,
      ...obj,
    })
  }

  return (
    <>
      <TableUtil.BatchActionBar
        onClose={() => props.onSelectAll(false)}
        toggleSelectAll={(bool) => {
          props.onSelectAll(true)
          store.toggleIsSelectAllPage(bool)
        }}
        batchActions={[
          {
            name: (
              <TplPrintBtn
                goToPrint={handleBatchPrint}
                tplStore={props.tplStore}
              >
                {i18next.t('批量打印')}
              </TplPrintBtn>
            ),
            onClick: () => {},
            show: true,
            type: 'business',
          },
        ]}
        count={isSelectAllPage ? null : selectedSkus.length}
        isSelectAll={isSelectAllPage}
      />
    </>
  )
})

export default BatchActionBar
