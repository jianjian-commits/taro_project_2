import React, { createContext, forwardRef } from 'react'
import PropTypes from 'prop-types'
import TreeNode from './tree_node'
import SvgNoData from '../../../../svg/no_data.svg'
import { t } from 'gm-i18n'
import './tree_list.less'
import { Flex } from '@gmfe/react'
import BatchAction from './batch_action_bar'

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
    onClearHighlight,
    renderLeafData,
    batchActionBar,
    clearCheckData,
  } = props

  return (
    <Provider value={checkList}>
      {treeData.length ? (
        <div className='station-tree'>
          {checkData.length > 0 && (
            <BatchAction
              checkData={checkData}
              batchActionBar={batchActionBar}
              clearCheckData={clearCheckData}
            />
          )}

          <div style={style} ref={ref}>
            {treeData.map((item) => (
              <TreeNode
                value={item}
                key={item.id}
                ref={(ref) => (item.ref = ref)}
                noDataText={noDataText}
                onCheck={onCheck}
                onExpand={onExpand}
                treeData={treeData}
                renderLeafData={renderLeafData}
                onClearHighlight={onClearHighlight}
              />
            ))}
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
  /** 渲染表格头 */
  renderLeafData: PropTypes.element,
  batchActionBar: PropTypes.array,
  clearCheckData: PropTypes.func,
}

TreeList.defaultProps = {
  treeData: [],
  checkList: [],
  noDataText: t('没有更多数据了'),
  allChecked: false,
  style: {},
}

export default TreeList
