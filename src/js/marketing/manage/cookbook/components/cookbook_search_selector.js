import React, { useState, useEffect } from 'react'
import { MoreSelect } from '@gmfe/react'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { Request } from '@gm-common/request'
import CookbookStore from '../store'

const CookbookSearchSelector = (props) => {
  const { saleMenus, setSaleMenus } = CookbookStore
  const [list, setList] = useState([])

  useEffect(() => {
    fetchListData()
  }, [])

  const fetchListData = (query) => {
    Request('/salemenu/sale/list')
      .data({ query })
      .get()
      .then((res) => {
        const list = res.data.map((d) => ({
          text: d.name,
          value: d.id,
        }))
        setList(list)
      })
  }

  const handleSearch = (q) => {
    fetchListData(q)
  }

  return (
    <MoreSelect
      multiple
      data={list}
      selected={saleMenus.slice()}
      onSelect={setSaleMenus}
      onSearch={handleSearch}
      placeholder={t('请输入报价单搜索')}
      renderListFilterType='pinyin'
    />
  )
}

CookbookSearchSelector.propTypes = {
  selected: PropTypes.array.isRequired,
  onSelect: PropTypes.func.isRequired,
}

export default observer(CookbookSearchSelector)
