import React, { createContext, useEffect, useState, forwardRef } from 'react'
import PropTypes from 'prop-types'
import TreeNode from './tree_node'
import SvgNoData from '../../../../svg/no_data.svg'
import { t } from 'gm-i18n'
import _ from 'lodash'
import './tree_list.less'
import { Flex, Modal, Tip } from '@gmfe/react'
import globalStore from '../../../stores/global'
import CheckNumber from './check_number'
import MoveModal from './move_modal'
import { Sortable } from '@gmfe/sortable'

export const checkListContext = createContext([])
const { Provider } = checkListContext

const TreeList = forwardRef((props, ref) => {
  const {
    treeData,
    style,
    noDataText,
    checkList,
    checkData,
    onCheck,
    onExpand,
    onMove,
    onSort,
    onClearHighlight,
    clearCheckData,
    onHandleBatchDelete,
  } = props

  /* 用于转移分类模态框中的LevelSelect的数据 */
  const [selectData, changeSelectData] = useState([])

  useEffect(() => {
    changeSelectData(rebuildTreeData(treeData))
  }, [treeData])

  /**
   * 递归查询一级分类，并标记
   * @returns // { category1: string, value: string }[]
   */
  const checkSort = (data, preId) => {
    let result = []
    _.forEach(data, ({ value, children }) => {
      if (preId) {
        if (children && children.length) {
          // 一级分类
          result = [...result, ...checkSort(children, preId)]
        }
        result.push({
          category1: preId,
          value,
        })
      } else {
        // 一级分类
        result.push([
          ...checkSort(children, value),
          {
            category1: value,
            value,
          },
        ])
      }
    })

    return result
  }

  /**
   * 转换分类
   */
  const transformSort = () => {
    // 获取本站一级分类
    const stationIds = _.map(
      _.filter(selectData, (v) => {
        return !!v.source.station_id
      }),
      (v) => v.value,
    )

    // 获取勾选的一级分类对应信息
    const categoryList = _.cloneDeep(_.flatten(checkSort(treeData)))
    const selectedCategory1 = _.uniq(
      _.map(
        _.filter(categoryList, (v) => _.includes(checkList, v.value)),
        (v) => v.category1,
      ),
    )

    // T: 通用，F: 站点
    let flag = true
    // 勾选全是本站
    if (
      _.uniq([...selectedCategory1, ...stationIds]).length === stationIds.length
    ) {
      flag = false
    }

    // 通用没有station_id,通用: station_id = F, flag = T;站点: station_id = T,flag = F,
    return {
      data: _.filter(selectData, (v) =>
        flag ? !v.source.station_id : v.source.station_id,
      ),
      isMixed:
        _.some(selectedCategory1, (v) => _.includes(stationIds, v)) &&
        !_.every(selectedCategory1, (v) => _.includes(stationIds, v)), // 判断是否有通用和站点混合选择
    }
  }

  /**
   * 打开转移分类的模态框
   */
  const handleMoveCategory = () => {
    const { data, isMixed } = transformSort()
    if (isMixed) {
      return Tip.warning(t('不能同时选择本站和通用'))
    }
    Modal.render({
      title: t('转移分类库设置'),
      children: <MoveModal data={data} onMove={handleMoveOk} />,
      size: 'md',
      style: {
        width: '700px',
      },
      onHide: Modal.hide,
    })
  }

  /**
   * 点击确认转移分类
   * @param value {{category_id_1:string, category_id_2:string, pinlei_id :string}}
   */
  const handleMoveOk = (value) => {
    onMove(value)
  }

  /**
   * 拖动排序
   * @param value {object[]}
   */
  const handleSort = (value) => {
    const [{ parent }] = value
    onSort(value, findObjectById(treeData, parent))
  }

  const renderItem = (item) => (
    <TreeNode
      value={item}
      key={item.id}
      ref={(ref) => (item.ref = ref)}
      noDataText={noDataText}
      onCheck={onCheck}
      onExpand={onExpand}
      onSort={handleSort}
      treeData={treeData}
      onClearHighlight={onClearHighlight}
    />
  )

  const renderTreeNode = () =>
    editMerchandiseOrder ? (
      <Sortable
        data={treeData}
        onChange={handleSort}
        renderItem={renderItem}
        options={{
          handle: '.tree-sortable-handle',
          chosenClass: 'sort-tree-item',
          ghostClass: 'sort-tree-ghost',
          dragClass: 'sort-tree-drag',
        }}
      />
    ) : (
      treeData.map((item) => renderItem(item))
    )

  const editMerchandiseOrder = globalStore.hasPermission(
    'edit_merchandise_order',
  )

  const moveCategory = globalStore.hasPermission('move_category')

  return (
    <Provider value={checkList}>
      {treeData.length ? (
        <div className='station-tree'>
          {moveCategory && (
            <CheckNumber
              isChecked={!!checkList.length}
              clearCheckData={clearCheckData}
              data={checkData}
              handleMoveCategory={handleMoveCategory}
              onHandleBatchDelete={onHandleBatchDelete}
            />
          )}
          <div style={style} ref={ref}>
            {renderTreeNode()}
          </div>
        </div>
      ) : (
        <Flex
          alignCenter
          column
          style={{ paddingTop: '180px', paddingBottom: '400px' }}
        >
          <SvgNoData style={{ fontSize: '60px' }} />
          <p style={{ color: '#798294' }}>{noDataText}</p>
        </Flex>
      )}
    </Provider>
  )
})

TreeList.propTypes = {
  /** 树状结构的数据 */
  treeData: PropTypes.array.isRequired,
  /** 勾选的id的集合 */
  checkList: PropTypes.arrayOf(PropTypes.string),
  /** 勾选的实际数据的集合 */
  checkData: PropTypes.array,
  /** 没有数据显示的文字 */
  noDataText: PropTypes.node,
  /** 样式 */
  style: PropTypes.object,
  /** 勾选事件 */
  onCheck: PropTypes.func,
  /** 展开事件 */
  onExpand: PropTypes.func,
  /** 转移分类库 */
  onMove: PropTypes.func,
  /** 排序事件 */
  onSort: PropTypes.func,
  /** 清除高亮 */
  onClearHighlight: PropTypes.func,
  /** 清除所有勾选 */
  clearCheckData: PropTypes.func,
  /** 删除商品一级分类、二级分类或品类 */
  onHandleBatchDelete: PropTypes.func,
}

TreeList.defaultProps = {
  treeData: [],
  checkList: [],
  noDataText: t('没有更多数据了'),
  allChecked: false,
  style: {},
}

export default TreeList

function rebuildTreeData(list) {
  return list.map((item) => {
    return {
      value: item.id,
      text: `${item.id}${item.name}`,
      children: item.children.length ? rebuildTreeData(item.children) : null,
      source: item,
    }
  })
}

function findObjectById(list, id) {
  let result
  if (list.some((item) => item.id === id)) {
    result = list.find((item) => item.id === id)
  } else {
    _.forEach(list, (item) => {
      if (item.children) {
        result = findObjectById(item.children, id)
        if (result) {
          return false
        }
      }
    })
  }
  return result
}
