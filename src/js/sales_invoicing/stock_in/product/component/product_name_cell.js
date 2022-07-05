import React, { useState, useRef } from 'react'
import { observer } from 'mobx-react'
import { Flex, Tip } from '@gmfe/react'
import { KCMoreSelect } from '@gmfe/keyboard'
import _ from 'lodash'
import { t } from 'gm-i18n'
import store from '../store/receipt_store'
import PriceTrend from './price_trend'
import PurchaseTable from './purchase_table'
import DeletedProduct from './deleted_product'
import { isInShare, formatSkuList, isValid } from '../../util'
import memoComponentWithDataHoc from './memo_component_with_data_hoc'
import PropTypes from 'prop-types'
import { TableXUtil } from '@gmfe/table-x'
import '../../../../common/components/tree_list/tree_list.less'

const { TABLE_X } = TableXUtil

const ProductNameCell = observer((props) => {
  const { index, data } = props

  const { stockInShareList } = store
  const {
    id,
    name,
    displayName,
    purchase_amount,
    spu_status,
    money,
    unit_price,
    quantity,
  } = data

  const [skuList, setSkuList] = useState([])
  const nameRef = useRef()

  const handleSelect = (selected) => {
    const { stockInShareList } = store

    // 若空
    if (!selected) {
      store.changeProductNameSelected(index, selected)
    } else if (selected && isInShare(stockInShareList, selected.value)) {
      Tip.info(t('该商品已加入分摊不可重复添加，如需添加请取消分摊再进行操作'))
    } else {
      store.setProductNameSelected(index, selected)
    }

    // 避免修改供应商时数据不对，因此这里做清除处理
    setSkuList([])
  }

  const handleSearch = (value) => {
    const { settle_supplier_id } = store.stockInReceiptDetail
    nameRef.current = value
    const req = {
      name: value,
      settle_supplier_id,
    }

    if (_.trim(value)) {
      return store.fetchSkuList(req).then((json) => {
        if (req.name === nameRef.current) {
          setSkuList(formatSkuList(json.data))
        }
      })
    }
  }

  const renderProductItem = (item) => {
    return (
      <div>
        <span className='gm-margin-right-5'>{item.name}</span>
        <span
          className='tree-station'
          style={{
            marginRight: '4px',
            padding: '0px 1px',
          }}
        >
          {item.sku_p_type === 0 ? t('通用') : t('本站')}
        </span>
        {item.sku_active_count ? (
          <span className='gm-text-primary'>
            {t('在售')}:{item.sku_active_count}
          </span>
        ) : (
          <span className='gm-text-red'>{t('暂无在售')}</span>
        )}
      </div>
    )
  }

  const canShow =
    name && isValid(quantity) && isValid(unit_price) && isValid(money)

  let selected = null

  if (id && displayName) {
    selected = {
      value: id,
      text: displayName,
    }
  }
  return (
    <Flex row alignCenter>
      {/* 加入分摊后隐藏 */}
      {!isInShare(stockInShareList, id) ? (
        <KCMoreSelect
          style={{
            width: TABLE_X.WIDTH_SEARCH,
          }}
          data={skuList}
          isGroupList
          selected={selected}
          onSelect={handleSelect}
          onSearch={handleSearch}
          placeholder={t('请输入采购规格名')}
          renderListItem={renderProductItem}
          renderListFilter={(data) => {
            return data
          }}
        />
      ) : (
        name
      )}

      {canShow && (
        <>
          <PriceTrend index={index} type='add' />

          {purchase_amount && <PurchaseTable index={index} />}
        </>
      )}

      {spu_status === 0 && <DeletedProduct index={index} />}
    </Flex>
  )
})

ProductNameCell.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
}

export default memoComponentWithDataHoc(ProductNameCell)
