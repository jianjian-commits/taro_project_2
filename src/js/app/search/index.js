/**
 * @description 顶部导航--全局搜索
 */

import React, { useEffect, useRef, useState } from 'react'
import { t } from 'gm-i18n'
import SVGSearch from 'svg/search.svg'
import _ from 'lodash'
import { Popover, List } from '@gmfe/react'
import PropTypes from 'prop-types'
import { filterNavLeaf, fetchHelp, getRuleNumber } from './util'
import globalStore from 'stores/global'
import { gioTrackEvent } from '../../common/service'

const Input = ({ onChange, onKeyDown }) => {
  const [value, setValue] = useState('')

  const handleChange = useRef(
    _.debounce((text) => {
      onChange(text)
    }, 200),
  )

  return (
    <input
      type='text'
      placeholder={t('搜功能、搜问题、搜单据')}
      value={value}
      maxLength='62'
      onChange={(e) => {
        setValue(e.target.value)
        handleChange.current(e.target.value)
      }}
      onKeyDown={onKeyDown}
    />
  )
}

Input.propTypes = {
  onChange: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
}

const Search = () => {
  // 默认第一个
  const [willActiveIndex, setWillActiveIndex] = useState(0)
  const [query, setQuery] = useState('')
  const [help, setHelp] = useState([])
  const [nav, setNav] = useState([])
  const [ruleNumber, setRuleNumber] = useState([])

  const trimQuery = _.trim(query)

  useEffect(() => {
    if (!trimQuery) {
      setHelp([])
      setNav([])
      setRuleNumber([])
    } else {
      const rule = getRuleNumber(trimQuery)
      if (rule) {
        setHelp([])
        setNav([])
        setRuleNumber([rule])
      } else {
        setHelp([])
        setRuleNumber([])

        setNav(filterNavLeaf(trimQuery))

        fetchHelp(trimQuery).then((data) => {
          setHelp(data)
        })
      }
    }
  }, [trimQuery])

  const data = []
  if (nav.length > 0) {
    data.push({ label: t('系统功能'), children: nav.slice(0, 5) })
  }
  if (help.length > 0) {
    data.push({ label: t('常见问题解答'), children: help.slice(0, 5) })
  }
  if (ruleNumber.length > 0) {
    data.push({ label: t('单据'), children: ruleNumber })
  }

  const handleSearch = (e) => {
    e.preventDefault()

    // gio埋点
    gioTrackEvent('global_search', 1, {})

    const flatList = getFlatData()

    const item = flatList[willActiveIndex]
    if (item) {
      handleTo(item.value)
    }
  }

  const handleTo = (value) => {
    // gio埋点
    gioTrackEvent('global_search', 1, {})

    if (value.startsWith('/')) {
      window.open('#' + value)
    } else {
      window.open(value)
    }
  }

  const renderItem = (item) => {
    // 代表是帮助文档
    if (item.summary) {
      return <div dangerouslySetInnerHTML={{ __html: item.text }} />
    } else {
      return item.text
    }
  }

  const getFlatData = () => {
    return _.flatMap(data, (v) => v.children)
  }

  const handleKeyDown = (event) => {
    // 不是上下方向键，不用拦截
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
      return
    }

    let will = willActiveIndex

    if (event.key === 'ArrowUp') {
      will--
    } else if (event.key === 'ArrowDown') {
      will++
    }

    const flatList = getFlatData()

    // 修正
    if (will < 0) {
      will = flatList.length - 1
    } else if (willActiveIndex > flatList.length - 1) {
      will = 0
    }

    setWillActiveIndex(will)
  }

  return (
    <Popover
      popup={() =>
        trimQuery ? (
          data.length > 0 ? (
            <List
              className='b-search-popup'
              style={{ maxWidth: '600px' }}
              isGroupList
              data={data}
              onSelect={handleTo}
              renderItem={renderItem}
              willActiveIndex={willActiveIndex}
            />
          ) : (
            <div className='gm-padding-tb-5 gm-padding-lr-10 gm-text-desc'>
              无
            </div>
          )
        ) : null
      }
    >
      {globalStore.isShieldGuanMai() ? (
        <div />
      ) : (
        <form onSubmit={handleSearch} className='b-search' data-id='search'>
          <Input
            onChange={(text) => setQuery(text)}
            onKeyDown={handleKeyDown}
          />
          <SVGSearch onClick={handleSearch} />
        </form>
      )}
    </Popover>
  )
}

export default Search
