import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { MoreSelect } from '@gmfe/react'
import _ from 'lodash'
import { Request } from '@gm-common/request'
import { i18next } from 'gm-i18n'

const SalemenuSelect = (props) => {
  const { params, selected, onChange } = props

  const [data, setData] = useState([])

  useEffect(() => {
    Request('/salemenu/sale/list')
      .data(params)
      .get()
      .then((json) => {
        setData(json.data)
      })
  }, [])

  if (data.length === 0) {
    return <span style={{ height: '30px' }}>{i18next.t('当前无报价单')}</span>
  }

  const dataList = _.map(data, (v) => ({
    value: v.salemenu_id,
    text: v.salemenu_name,
  }))

  return (
    <MoreSelect
      style={{ width: '220px' }}
      data={dataList}
      selected={_.find(dataList, { value: selected })}
      onSelect={(value) => value && onChange(value.value)}
    />
  )
}

SalemenuSelect.propTypes = {
  params: PropTypes.object,
  selected: PropTypes.any,
  onChange: PropTypes.func.isRequired,
}

export default SalemenuSelect
