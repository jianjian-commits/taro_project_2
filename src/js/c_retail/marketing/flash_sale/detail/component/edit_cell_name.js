import React, { useState } from 'react'
import { observer } from 'mobx-react'
import { Flex } from '@gmfe/react'
import { KCMoreSelect } from '@gmfe/keyboard'
import _ from 'lodash'
import { t } from 'gm-i18n'
import store from '../store'
import memoComponentWithDataHoc from './memo_hoc'
import PropTypes from 'prop-types'
import { TableXUtil } from '@gmfe/table-x'
import FloatTip from '../../../../../common/components/float_tip'
import globalStore from '../../../../../stores/global'

const { TABLE_X } = TableXUtil

const ProductNameCell = observer(props => {
  const { index, data } = props
  const { sku_id, name, outer_id } = data

  const [skuList, setSkuList] = useState([])

  const handleSelect = selected => {
    store.changeListItemName(index, selected)
  }

  const handleSearch = value => {
    const req = {
      search_text: value,
      active: 0,
      salemenu_id: globalStore.c_salemenu_id,
      limit: 50
    }

    if (_.trim(value)) {
      return store.fetchSkuList(req).then(json => {
        const list = _.map(json.data, v => {
          if (_.findIndex(store.detail.skus, r => v.id === r.sku_id) === -1) {
            return {
              ...v,
              sku_id: v.id,
              value: v.id,
              text: v.name
            }
          }
        })
        setSkuList(list.filter(_ => _))
      })
    }
  }

  const selected = _.find(skuList, v => v.value === sku_id) || null

  return (
    <Flex row alignCenter>
      {!sku_id ? (
        <KCMoreSelect
          style={{
            width: TABLE_X.WIDTH_SEARCH
          }}
          data={skuList}
          selected={selected}
          onSelect={handleSelect}
          onSearch={handleSearch}
          placeholder={t('请输入商品名搜索')}
          renderListFilter={data => {
            return data
          }}
        />
      ) : (
        <div>
          {name}
          <br />
          <span className='b-second-text-opacity'>
            <FloatTip
              skuId={sku_id}
              tip={outer_id}
              showCustomer={globalStore.otherInfo.showSkuOuterId}
            />
          </span>
        </div>
      )}
    </Flex>
  )
})

ProductNameCell.propTypes = {
  data: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired
}

export default memoComponentWithDataHoc(ProductNameCell)
