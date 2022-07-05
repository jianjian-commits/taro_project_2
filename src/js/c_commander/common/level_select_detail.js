import React, { useState, useEffect } from 'react'
import { Request } from '@gm-common/request'
import _ from 'lodash'
import PropTypes from 'prop-types'
import { Select } from '@gmfe/react'

// 团长管理编辑页选团长等级
const LevelSelectDetail = ({ value, onChange, saleMoney, ...rest }) => {
  const [selectList, setSelectList] = useState([])

  useEffect(() => {
    fetchListData()
  }, [saleMoney])

  const fetchListData = () => {
    Request('/community/distributor/level_valid/list')
      .data()
      .get()
      .then((res) => {
        // 团长编辑页，团长等级只能修改比现有等级更高的等级
        const data = _.filter(
          res.data,
          (level) => +level.boundary >= saleMoney || level.id === value,
        )

        const levelList = _.map(data, (o) => {
          return { value: o.id, text: o.level_name }
        })

        setSelectList([...levelList])
      })
  }

  return (
    <Select value={value} data={selectList} onChange={onChange} {...rest} />
  )
}

LevelSelectDetail.propTypes = {
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func,
  saleMoney: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // 团长销售额
}

export default LevelSelectDetail
