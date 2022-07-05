import React, { useState, useEffect } from 'react'
import { i18next } from 'gm-i18n'
import { Request } from '@gm-common/request'
import { Cascader } from '@gmfe/react'
import _ from 'lodash'
import PropTypes from 'prop-types'

// 地理标签转换为适合组件的数据结构
const transformAreaStruct = (data) => {
  const result = _.map(data, (v1) => {
    const r1 = {
      name: v1.city,
      value: v1.city_id,
    }

    r1.children = _.map(v1.districts, (v2) => {
      const r2 = {
        name: v2.district,
        value: v2.district_id,
      }
      r2.children = _.map(v2.areas, (v3) => {
        const r3 = {
          name: v3.area,
          value: v3.area_id,
        }
        return r3
      })
      r2.children.unshift({ name: i18next.t('全部'), value: null })
      return r2
    })
    r1.children.unshift({ name: i18next.t('全部'), value: null })
    return r1
  })
  return result
}

const mapList = (list, { district_code, area_l1, area_l2 }) => {
  const arr = []
  if (!district_code) {
    return []
  } else {
    const districtTarget = _.find(list, (item) => item.value === district_code)
    if (districtTarget) {
      arr.push(district_code)
      const area_l1T = _.find(
        districtTarget.children,
        (item) => item.value === area_l1
      )
      if (area_l1T) {
        arr.push(area_l1)
        const area_l2T = _.find(
          area_l1T.children,
          (item) => item.value === area_l2
        )
        if (area_l2T) arr.push(area_l2)
      }
      return arr
    } else {
      return []
    }
  }
}

function Component(props) {
  const [area, setArea] = useState({
    citySelected: [],
    list: [],
  })
  const [result, setResult] = useState({ data: [] })
  const handleCitySelect = (citySelected) => {
    const selected = citySelected.length ? citySelected : null
    props.onSelect(selected)
    setArea({
      ...area,
      citySelected,
    })
  }

  const fetchData = async () => {
    const result = await Request('/station/area_dict').get()
    setResult(result)
  }

  const reset = () => {
    setArea({
      citySelected: [],
      list: area.list,
    })
  }
  props.reset && props.reset(reset)

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    let selected = area.citySelected
    const list = transformAreaStruct(result.data)
    if (props.initData) {
      selected = mapList(list, props.initData)
    }
    setArea({
      citySelected: selected,
      list,
    })
  }, [props.initData, result])

  return (
    <Cascader
      filtrable
      data={area.list}
      value={area.citySelected}
      onChange={handleCitySelect}
      inputProps={{
        placeholder: area.citySelected.length ? '' : props.placeholder,
      }}
    />
  )
}

/* initData
 * {
 *   district_code, // 地区编码
 *   area_l1, // 第一维度
 *   area_l2 // 第二维度
 * }
 */
Component.propTypes = {
  onSelect: PropTypes.func.isRequired,
  initData: PropTypes.object,
  placeholder: PropTypes.string,
  reset: PropTypes.func,
}
Component.defaultProps = {
  placeholder: i18next.t('全部地理标签'),
}

export default Component
