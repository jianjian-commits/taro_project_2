import React, { useState, useMemo, useEffect } from 'react'
import { t } from 'gm-i18n'
import { TreeV2, Flex, Button } from '@gmfe/react'
import { SvgRight, SvgLeft } from 'gm-svg'
import _ from 'lodash'
import PropTypes from 'prop-types'

import { filterGroupList } from '../../util'
import { getNodes } from './util'

const defaultOptions = {
  leftTitle: t('全部商品'),
  rightTitle: t('已选商品'),
  style: { width: '300px', height: '500px' },
}

const TransferV2 = ({
  data,
  selected,
  onChange,
  tree: isTree,
  options,
  className,
}) => {
  const [sel, setSel] = useState([])
  const [checkLeft, setCheckLeft] = useState([])
  const [checkRight, setCheckRight] = useState([])

  const left = useMemo(() => {
    const select = isTree ? getNodes(sel) : sel

    return filterGroupList(data, (v) => {
      return !_.includes(
        _.map(select, (s) => s.value),
        v.value
      )
    })
  }, [data, sel])

  useEffect(() => {
    // 获取树
    const tree = TreeV2.selectedValues2SelectedList(data, selected)

    const nodes = getNodes(tree)

    setSel(isTree ? tree : nodes)
  }, [selected])

  const handleCheckLeft = (check) => {
    setCheckLeft(check)
  }
  const handleCheckRight = (check) => {
    setCheckRight(check)
  }

  const handleAdd = () => {
    if (!checkLeft) return

    const select = [
      ..._.map(isTree ? getNodes(sel) : sel, (s) => s.value),
      ...checkLeft,
    ]

    // 获取树
    const tree = TreeV2.selectedValues2SelectedList(data, select)

    const nodes = getNodes(tree)

    onChange(nodes)
    setSel(isTree ? tree : nodes)
    setCheckLeft([])
  }

  const handleRemove = () => {
    if (!checkRight) return
    const select = _.filter(
      isTree ? getNodes(sel) : sel,
      (s) => !checkRight.includes(s.value)
    )
    onChange(select)
    setSel(select)
    setCheckRight([])
  }

  const { leftTitle, rightTitle, style, ...rest } = {
    ...defaultOptions,
    ...options,
  }

  return (
    <Flex className={className}>
      <TreeV2
        list={left}
        onSelectValues={handleCheckLeft}
        selectedValues={checkLeft}
        style={style}
        title={leftTitle}
        {...rest}
      />
      <div className='gm-gap-5' />
      <Flex column justifyCenter alignCenter className='gm-transfer-operation'>
        <Button
          disabled={checkLeft.length === 0}
          className='gm-margin-bottom-5'
          onClick={handleAdd}
        >
          <SvgRight />
        </Button>
        <Button disabled={checkRight.length === 0} onClick={handleRemove}>
          <SvgLeft />
        </Button>
      </Flex>
      <div className='gm-gap-5' />
      <TreeV2
        list={sel}
        onSelectValues={handleCheckRight}
        selectedValues={checkRight}
        style={style}
        title={rightTitle}
        {...rest}
      />
    </Flex>
  )
}

// 树节点的名称，后端的数据树节点名称不一定是{text,value, children}, 这里提供更换名称
TreeV2.transferKey = (arr, options) => {
  const { text, value, children } = {
    text: 'text',
    value: 'value',
    children: 'children',
    ...options,
  }
  arr.forEach((obj) => {
    obj.text = obj[text]
    obj.value = obj[value]
    delete obj[text]
    delete obj.value
    if (obj[children] instanceof Array) {
      TreeV2.transferKey(obj[children], options)
    }
  })
  return arr
}

export default TransferV2
TransferV2.propTypes = {
  data: PropTypes.array, // data会经过loadsh深拷贝处理，所以对于存在mobx的数据，toJS后再传进来
  selected: PropTypes.array,
  onChange: PropTypes.func,
  tree: PropTypes.bool, // 右边是否以树状结构展示
  options: PropTypes.object, // TreeV2的prop写在options里
  className: PropTypes.string,
}
TransferV2.defaultProps = {
  selected: [],
  tree: false,
}
