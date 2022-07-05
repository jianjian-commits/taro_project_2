import React, {
  useCallback,
  useState,
  useContext,
  useEffect,
  forwardRef,
} from 'react'
import PropTypes from 'prop-types'
import './tree_list.less'
import { Flex, Checkbox, Loading } from '@gmfe/react'
import classNames from 'classnames'
import SvgPlus from 'svg/expand.svg'
import SvgMinus from 'svg/minus.svg'
import SvgSort from 'svg/sort.svg'
import { checkListContext } from './tree_list'
import { t } from 'gm-i18n'
import { Sortable } from '@gmfe/sortable'
import globalStore from 'stores/global'
import { TableXUtil } from '@gmfe/table-x'
import { getAllCheckList } from '../tree_list_v2/utils'

const { OperationIconTip } = TableXUtil

/**
 * 判断当前节点勾选状态，并将其子节点的勾选状态设为一致
 * @param value {{checked,children}}
 */
function checkChildren(value) {
  const { checked, children } = value
  children.forEach((item) => {
    item.checked = checked
    checkChildren(item)
  })
}

/**
 * 通过当前节点勾选状态，判断其父节点是否需要勾选
 * @param id {string}
 * @param list {object[]}
 * @returns {boolean}
 */
function checkParent(list, id, level) {
  if (list.map((item) => item.id).includes(id)) {
    const value = list.find((item) => item.id === id)
    value.checked = value.children.every((item) => item.checked)
    return list.every((item) => item.checked)
  } else if (level === 2) {
    list.forEach((item) => {
      const value = item.children.find((childItem) => childItem.id === id)
      if (value) {
        item.checked = checkParent(item.children, value.id)
      }
    })
  } else if (level === 3) {
    list.forEach((item) => {
      item.children.forEach((childItem) => {
        const value = childItem.children.find((GCItem) => GCItem.id === id)
        if (value) {
          childItem.checked = checkParent(childItem.children, value.id)
          item.checked = checkParent(item.children, value.parent)
        }
      })
    })
  }
}

/**
 * 获取勾选的id集合
 * @param list {object[]}
 * @param checkedList {string[]}
 */
function getCheckList(list, checkedList) {
  list.forEach((item) => {
    if (item.checked) {
      checkedList.push(item.id)
    } else {
      getCheckList(item.children, checkedList)
    }
  })
}

const TreeNode = forwardRef((props, ref) => {
  const {
    value,
    treeData,
    onCheck,
    onExpand,
    noDataText,
    onSort,
    onClearHighlight,
  } = props
  const {
    children,
    id,
    title,
    actions,
    level,
    edit,
    highlight,
    parent,
    loading,
    showSort,
    station_id,
  } = value
  /* 勾选状态 */
  const [checked, changeChecked] = useState(false)
  /* 展开状态 */
  const [expand, changeExpand] = useState(false)

  useEffect(() => {
    changeChecked(value.checked)
  }, [value.checked])

  useEffect(() => {
    changeExpand(value.expand)
  }, [value.expand])

  const checkList = useContext(checkListContext)

  const toggle = useCallback((event) => {
    changeExpand(!event)
    value.expand = !value.expand
    onExpand({ expand: !event, value })
  }, []) // eslint-disable-line

  const check = (event) => {
    const checked = !event
    changeChecked(checked)
    value.checked = checked
    checkChildren(value)
    if (value.parent) {
      checkParent(treeData, value.parent, value.level)
    }
    if (checkList.includes(id)) {
      checkList.splice(
        checkList.findIndex((item) => item === id),
        1,
      )
    }
    const checkedList = []
    const completeCheckedList = []
    getCheckList(treeData, checkedList)
    getAllCheckList(treeData, completeCheckedList)
    onCheck({
      checked,
      value: checked ? value : null,
      checkList: checkedList,
      completeCheckedList,
    })
  } // eslint-disable-line

  const editMerchandiseOrder = globalStore.hasPermission(
    'edit_merchandise_order',
  )
  const editCategory = globalStore.hasPermission('edit_category')

  const renderTreeNode = () => {
    if (!expand) {
      return
    }
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

    if (!editMerchandiseOrder || (level === 2 && !showSort)) {
      return children.map((child) => (
        <TreeNode
          value={child}
          key={child.id}
          treeData={treeData}
          ref={(ref) => (child.ref = ref)}
          noDataText={noDataText}
          onCheck={onCheck}
          onExpand={onExpand}
          onClearHighlight={onClearHighlight}
        />
      ))
    }

    return (
      <Sortable
        data={children}
        onChange={onSort}
        renderItem={renderTreeNodeItem}
        options={{
          handle: '.tree-sortable-handle',
          chosenClass: 'sort-tree-item',
          ghostClass: 'sort-tree-ghost',
          dragClass: 'sort-tree-drag',
          group: parent,
        }}
      />
    )
  }

  const renderTreeNodeItem = (item) => (
    <TreeNode
      value={item}
      key={item.id}
      treeData={treeData}
      ref={(ref) => (item.ref = ref)}
      noDataText={noDataText}
      onCheck={onCheck}
      onExpand={onExpand}
      onSort={onSort}
      onClearHighlight={onClearHighlight}
    />
  )

  const handleClearHighlight = () => {
    if (highlight) {
      onClearHighlight(value)
    }
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
              <span onClick={() => toggle(expand)}>
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
              onChange={() => check(checked)}
              className='station-tree-checkbox'
            />
            <Flex flex={1} alignCenter>
              {title}
              {level === 0 && (
                <div className='tree-station'>
                  {station_id ? t('本站') : t('通用')}
                </div>
              )}

              <div className='gm-gap-10' />

              {editCategory ? edit : null}
              {onSort && (
                <>
                  <div className='gm-gap-10' />
                  <OperationIconTip tip={t('按住拖动排序')}>
                    <div className='tree-sortable-handle station-tree-edit gm-cursor-grab gm-text-hover-primary'>
                      <SvgSort />
                    </div>
                  </OperationIconTip>
                </>
              )}
            </Flex>
            {actions}
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
}

TreeNode.defaultProps = {
  value: {},
}

export default TreeNode
