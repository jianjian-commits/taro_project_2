import React, { useState, useEffect, forwardRef } from 'react'
import PropTypes from 'prop-types'
import './tree_list.less'
import { Flex, Checkbox, Loading } from '@gmfe/react'
import classNames from 'classnames'
import SvgPlus from 'svg/expand.svg'
import SvgMinus from 'svg/minus.svg'
import { t } from 'gm-i18n'
import { checkChildren, checkParent, getCheckList } from './utils'

const TreeNode = forwardRef((props, ref) => {
  const {
    value,
    treeData,
    onCheck,
    onExpand,
    noDataText,
    onClearHighlight,
    renderLeafData,
  } = props
  const { children, id, title, level, highlight, loading } = value

  /* 勾选状态 */
  const [checked, setChecked] = useState(false)
  /* 展开状态 */
  const [expand, setExpand] = useState(false)

  useEffect(() => {
    setChecked(value.checked)
  }, [value.checked])

  useEffect(() => {
    setExpand(value.expand)
  }, [value.expand])

  const toggle = () => {
    setExpand(!expand)
    value.expand = !value.expand
    onExpand({ expand: !expand, isLoad: value.children?.length, value }) // 叶子节点如果加载过，无需再次加载
  }

  const onCheckChange = () => {
    setChecked(!checked)
    value.checked = !checked

    if (value.children && value.children.length) checkChildren(value)
    if (value.parent) checkParent(treeData, value.id)

    const checkedList = []
    getCheckList(treeData, checkedList)
    onCheck({
      checked: !checked,
      value: checked ? null : value,
      checkList: checkedList,
    })
  }

  const renderTreeNode = () => {
    if (!expand) return

    if (!children.length) {
      return loading ? (
        <Loading text={t('加载中')} />
      ) : (
        <p
          className='no-data-text'
          style={{ paddingLeft: `${level * 49 + 20}px` }}
        >
          {noDataText}
        </p>
      )
    }

    if (level === 2 && renderLeafData) {
      // 给一个新的地址，避免无法触发重渲染
      return renderLeafData([...children], {
        onCheckChange,
        checked,
        id,
      })
    }

    return (
      <>
        {children.map((item) => (
          <TreeNode
            value={item}
            key={item.id}
            treeData={treeData}
            noDataText={noDataText}
            onCheck={onCheck}
            onExpand={onExpand}
            ref={(ref) => (item.ref = ref)}
            onClearHighlight={onClearHighlight}
            renderLeafData={renderLeafData}
          />
        ))}
      </>
    )
  }

  const handleClearHighlight = () => {
    if (highlight) onClearHighlight(value)
  }

  return (
    <>
      <div
        ref={ref}
        className={classNames('station-tree-item', { selected: highlight })}
        onClick={handleClearHighlight}
      >
        <div className='station-tree-item-container'>
          <Flex
            alignCenter
            style={{
              paddingLeft: `${level * 49 - (level === 3 ? 24 : 0) + 10}px`,
            }}
          >
            {children.length || level === 2 ? (
              <span onClick={toggle}>
                {expand ? (
                  <SvgMinus className='station-tree-icon' />
                ) : (
                  <SvgPlus className='station-tree-icon station-tree-icon-plus' />
                )}
              </span>
            ) : (
              <div className='gm-gap-15' />
            )}
            <div className='gm-gap-10' />
            <Checkbox
              checked={checked}
              name={id}
              onChange={onCheckChange}
              className='station-tree-checkbox'
            />
            <Flex flex={1} alignCenter>
              {title}
              <div className='gm-gap-10' />
            </Flex>
          </Flex>
        </div>
      </div>
      {renderTreeNode()}
    </>
  )
})

TreeNode.propTypes = {
  /** 当前节点 */
  value: PropTypes.object.isRequired,
  /** 整棵树的数据 */
  treeData: PropTypes.array.isRequired,
  /** 没有数据显示的文字 */
  noDataText: PropTypes.node,
  /** 勾选事件 */
  onCheck: PropTypes.func,
  /** 展开事件 */
  onExpand: PropTypes.func,
  /** 排序事件 */
  onSort: PropTypes.func,
  /** 清除高光 */
  onClearHighlight: PropTypes.func,
  // 叶子节点的表格头
  renderLeafData: PropTypes.func,
}

TreeNode.defaultProps = {
  value: {},
}

export default TreeNode
