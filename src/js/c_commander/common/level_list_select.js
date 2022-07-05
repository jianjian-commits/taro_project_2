import React, { useState, useEffect } from 'react'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import { MoreSelect } from '@gmfe/react'

// 团长等级
const LevelListSelect = ({ selected, onSelect, ...rest }) => {
  const [searchLevelList, setSearchLevelList] = useState([])

  useEffect(() => {
    fetchListData()
  }, [])

  const fetchListData = q => {
    Request('/community/distributor/level_valid/list')
      .data({ q })
      .get()
      .then(res => {
        const data = _.map(res.data, level => {
          return {
            value: level.id,
            text: level.level_name
          }
        })
        setSearchLevelList([{ value: null, text: t('全部等级') }, ...data])
      })
  }

  return (
    <MoreSelect
      data={searchLevelList}
      selected={selected}
      onSelect={onSelect}
      placeholder={t('全部等级')}
      renderListFilterType='pinyin'
      {...rest}
    />
  )
}

LevelListSelect.propTypes = {
  selected: PropTypes.object,
  onSelect: PropTypes.func
}

export default LevelListSelect
