import React from 'react'
import { i18next } from 'gm-i18n'
import { MoreSelect } from '@gmfe/react'
import PropTypes from 'prop-types'

const SearchTypeFilter = (props) => {
  const { searchType, value, selected, onDataChange, searchText } = props
  return (
    <>
      {searchType === 5 ? (
        <MoreSelect
          id='orderInput'
          data={value || []}
          style={{ width: '275px' }}
          selected={selected}
          onSelect={(selected) => {
            onDataChange('create_user_id', selected)
          }}
          renderListFilterType='pinyin'
          placeholder={i18next.t('下单员')}
        />
      ) : (
        <input
          name='orderInput'
          className='gm-inline-block form-control'
          style={{ width: '275px' }}
          value={value}
          onChange={(e) => onDataChange(e.target.name, e.target.value)}
          placeholder={searchText[searchType]}
        />
      )}
    </>
  )
}

SearchTypeFilter.propTypes = {
  searchType: PropTypes.number,
  searchText: PropTypes.object,
  selected: PropTypes.object,
  value: PropTypes.string,
  onDataChange: PropTypes.func,
}

export default SearchTypeFilter
