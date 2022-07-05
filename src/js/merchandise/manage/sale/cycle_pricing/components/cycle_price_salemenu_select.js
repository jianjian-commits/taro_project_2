/**
 * @description 带有输入功能的报价单筛选框
 */
import React, { useRef } from 'react'
import PropTypes from 'prop-types'
import { observer } from 'mobx-react'
import { MoreSelect } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import store from '../store'

function CyclePriceSalemenuSelect(props) {
  const { type, salemenuId, salemenuName, style } = props
  const { salemenuList } = store
  const selectRef = useRef()

  function handleSalemenuChange(item) {
    const obj = {
      salemenu_id: item?.value || '',
      salemenu_name: item?.text || '',
    }

    if (type === 'filter') {
      // 筛选
      store.filterChange(obj)
    } else {
      // 新建
      store.changeCyclePriceRule(obj)
    }
  }

  // 选取下拉框选中项
  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      // enter 要选择
      selectRef.current.apiDoSelectWillActive()
      window.document.body.click()
    }
  }

  return (
    <MoreSelect
      ref={selectRef}
      style={style}
      data={salemenuList.slice()}
      renderListFilterType='pinyin'
      placeholder={i18next.t('请选择报价单')}
      selected={
        salemenuId ? { value: salemenuId, text: salemenuName } : undefined
      }
      onKeyDown={handleKeyDown}
      onSelect={(item) => handleSalemenuChange(item)}
    />
  )
}

CyclePriceSalemenuSelect.propTypes = {
  // 应用页面类型：filter，new
  type: PropTypes.string,
  salemenuId: PropTypes.string,
  salemenuName: PropTypes.string,
  style: PropTypes.object,
}

export default observer(CyclePriceSalemenuSelect)
