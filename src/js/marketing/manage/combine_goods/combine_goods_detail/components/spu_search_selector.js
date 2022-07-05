import React, { useState } from 'react'
import { MoreSelect } from '@gmfe/react'
import { observer } from 'mobx-react'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { Request } from '@gm-common/request'

const SpuSearchSelector = (props) => {
  const [list, setList] = useState([])

  const handleSearch = (q) => {
    Request('/combine_goods/search/material')
      .data({
        q,
        combine_level: props.combineLevel, // 通过组合商品类型来过滤可选商品
      })
      .get()
      .then((res) => {
        const list = res.data.map((d) => ({ ...d, text: d.name, value: d.id }))
        // 过滤已选的spu
        const filterList = _.filter(list, (item) => {
          return _.every(props.selectedSpus, (spu) => spu.value !== item.value)
        })
        setList(filterList)
      })
  }

  return (
    <MoreSelect
      data={list}
      selected={props.selected}
      onSelect={props.onSelect}
      onSearch={handleSearch}
      placeholder={t('请输入商品名搜索')}
      renderListFilterType='pinyin'
    />
  )
}

SpuSearchSelector.propTypes = {
  selected: PropTypes.object,
  selectedSpus: PropTypes.array,
  onSelect: PropTypes.func.isRequired,
  combineLevel: PropTypes.number.isRequired,
}

export default observer(SpuSearchSelector)
