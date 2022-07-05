import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { t } from 'gm-i18n'
import _ from 'lodash'
import { Request } from '@gm-common/request'
import { Button, Flex, Input, BoxTable, Tip } from '@gmfe/react'
import {
  TableXVirtualized,
  TableXUtil,
  editTableXHOC,
  selectTableXHOC,
} from '@gmfe/table-x'
import { keyboardTableXHOC } from '@gmfe/keyboard'
import TreeList from 'common/components/tree_list_v2'
import {
  onChangeNode,
  checkParent,
  clearChecked,
} from 'common/components/tree_list_v2/utils'
import { System } from 'common/service'
import { service } from './service'

import './index.less'

const Table = keyboardTableXHOC(
  selectTableXHOC(editTableXHOC(TableXVirtualized)),
)
const { TABLE_X } = TableXUtil

class TreeListTable extends Component {
  tableRef = React.createRef(null)

  /** 树的ref，用于定位 */
  treeListRef = React.createRef(null)

  state = {
    /** 分类树 */
    treeData: [],
    /** 勾选的id */
    checkList: [],
    /** 新建子分类中的input的值 */
    name: '',
    /** 实际勾选的spulist */
    checkData: [],
    /** 定位输入框的值 */
    location: '',
  }

  componentDidMount() {
    this.fetchTreeData()
  }

  /**
   * @description 同时获取一级分类、二级分类、品类，并从新组装
   */
  fetchTreeData = () => {
    return Promise.all([
      service.getCategory1(),
      service.getCategory2(),
      service.getPinLei(),
      service.getIcons(),
    ]).then(
      ([
        { data: category1 },
        { data: category2 },
        { data: pinLei },
        { data: icons },
      ]) => {
        category1.sort((pre, cur) => cur.rank - pre.rank)
        category2.sort((pre, cur) => cur.rank - pre.rank)
        pinLei.sort((pre, cur) => cur.rank - pre.rank)
        category1 = service.rebuildTreeNode(category1, 0, icons)
        category2 = service.rebuildTreeNode(category2, 1)
        pinLei = service.rebuildTreeNode(pinLei, 2)
        category2 = service.rebuildTree(category2, pinLei)
        const treeData = service.rebuildTree(category1, category2)

        this.setState({ treeData })
      },
    )
  }

  /**
   * @description 清除已选择的所有数据
   */
  clearCheckData = () => {
    const { treeData } = this.state
    const { onCheck } = this.props
    clearChecked(treeData)
    this.setState({ checkData: [], checkList: [], treeData })
    if (typeof onCheck === 'function') onCheck([])
  }

  /**
   * @description 勾选
   * @param checkList {string[]}
   */
  handleCheck = ({ checkList }) => {
    const { onCheck } = this.props
    const requests = []
    this.setState({ checkList })

    checkList
      .filter((item) => item[0] !== 'C')
      .forEach((item) => {
        const url = '/merchandise/spu/list'
        const option = {}
        switch (item[0]) {
          case 'A':
            option.category_id_1 = item
            break
          case 'B':
            option.category_id_2 = item
            break
          case 'P':
            option.pinlei_id = item
            break
        }
        if (System.isC()) option.is_retail_interface = 1
        requests.push(Request(url).data(option).get())
      })
    let checkData = []
    Promise.all(requests).then((value) => {
      const { treeData } = this.state
      const spuCheckList = checkList.filter((item) => item[0] === 'C')
      const spuCheckData = []
      service.getObjectById(spuCheckList, treeData, spuCheckData)
      value.forEach(({ data }) => {
        checkData = [...checkData, ...data]
      })
      checkData = [...checkData, ...spuCheckData]

      this.setState({ checkData })
      if (typeof onCheck === 'function') onCheck(checkData)
    })
  }

  /**
   * 展开子元素，包括获取商品
   * @param {boolean} expand
   * @param {object} value
   * @param {Boolean} isLoad 是否加载过
   */
  handleExpand = ({ expand, value, isLoad }) => {
    const { level, id, checked } = value
    const { rateSummary, urlParm } = this.props

    if (level !== 2) return

    if (expand && !isLoad) {
      value.loading = true
      Request('/merchandise/spu/list')
        .data({
          pinlei_id: id,
          is_retail_interface: System.isC() ? 1 : null,
          ...urlParm,
        })
        .get()
        .then(({ data }) => {
          value.loading = false
          value.children = data.map((item) => {
            const { pinlei_id, id, name } = item
            const leafData = {
              ...item,
              value: id,
              title: name,
              parent: pinlei_id,
              level: 3,
              children: [],
              checked,
            }
            // 变化率字段不在这个接口给出,默认变化率为 0% 或 1.0
            if (rateSummary) {
              leafData.change_rate = rateSummary[id] ?? 100
            }
            return leafData
          })

          this.setState(({ treeData }) => treeData)
        })
    }
  }

  /**
   * @description 通过分类名称查找对应分类的位置
   */
  handleFindLocation = () => {
    const { location, treeData } = this.state
    if (!location) return Tip.warning(t('请输入分类名'))

    service.resetTreeList(treeData)
    const { flag, node } = service.findTreeNode(location, treeData)

    if (!flag) return Tip.warning(t('没有找到该分类'))

    this.setState({ treeData })
    this.treeListRef.scrollTop = node.ref.offsetTop - 10
  }

  /**
   * @description 查找分类时 修改location的值
   * @param {*} e
   */
  handleChangeLocation = (e) => this.setState({ location: e.target.value })

  // 点击去除高亮是哪个人才想出来的
  handleClearHighlight = (value) => {
    value.highlight = false
    const { treeData } = this.state
    this.setState({ treeData })
  }

  /**
   * @param {*} id string | Array<string> 当前节点的或批量操作的id数组
   * @param {*} key string 所在节点你想要改变的字段名，name字段你就传 'name'
   * @param {*} value any 该字段名改变后的值
   */
  onRowChange = ({ id, key, value }) => {
    const { treeData } = this.state
    onChangeNode(treeData, id, key, value)
    this.setState({ treeData })
  }

  onSelect = (isChecked, idList) => {
    const { onCheck } = this.props
    let { checkData, treeData } = this.state

    idList.forEach((id) => {
      this.onRowChange({ id, key: 'checked', value: isChecked })
      checkParent(treeData, id)
      // TODO:checkData目前只是用来展示表格头的数字，如果需要展示详细信息，需要存入当前行的数据，暂时不做处理
      isChecked
        ? checkData.push({ id })
        : (checkData = checkData.filter((f) => f.id !== id))
    })
    if (typeof onCheck === 'function') onCheck(checkData)
    this.setState({ checkData })
  }

  /**
   * 渲染叶子节点
   * @param {*} data 父节点信息
   * @param {*} parentNode 父节点
   */
  renderLeafData = (data, parentNode) => {
    const { onCheckChange, checked } = parentNode
    const { columns } = this.props
    const selectedList = data
      .map((item) => item.checked && item.id)
      .filter((f) => f)
    return (
      <div className='resetTableStyle'>
        <Table
          key='id'
          onAddRow={() => {}}
          onSelect={(selected) => {
            // btw，onSelect方法为啥不把 rowData 暴露出来
            // 这块的逻辑比较***，建议先放在这里
            // 两个数组对比去重，cancelList有长度为取消勾选，checkList有长度为勾选
            const cancelList = _.difference(selectedList, selected) // 取消勾选
            const checkList = _.difference(selected, selectedList) // 勾选

            const isChecked = !cancelList.length
            const idList = isChecked ? checkList : cancelList
            // 当 idList和 data 长度 相等时，为全选，使用父节点的勾选即可
            if (idList.length === data.length) {
              onCheckChange(checked)
            } else {
              this.onSelect(isChecked, idList)
            }
          }}
          selected={selectedList}
          keyField='id'
          virtualizedHeight={
            TABLE_X.HEIGHT_HEAD_TR +
            Math.min(10, data.length) * TABLE_X.HEIGHT_TR
          }
          virtualizedItemSize={TABLE_X.HEIGHT_TR}
          data={data}
          columns={columns}
        />
      </div>
    )
  }

  render() {
    const { treeData, checkList, checkData, location } = this.state
    const {
      batchActionBar,
      tipTextList,
      businessInfo,
      actionType,
      isPosition,
    } = this.props

    return (
      <>
        {/* 头部提示 */}
        {tipTextList && (
          <div className='tree_list_table_tip_box'>
            {tipTextList.map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>
        )}
        {/* 商户信息 */}
        <div className='tree_list_table_bussiness_info'>
          {businessInfo && (
            <>
              <span className='gm-padding-right-15'>
                {t('商户ID')} : {businessInfo?.id || '-'}
              </span>
              <span>
                {t('商户名')} : {t(businessInfo?.name || '-')}
              </span>
            </>
          )}
          {/* 操作列 */}
          {actionType && (
            <div style={{ float: 'right', marginRight: '120px' }}>
              {actionType}
            </div>
          )}
        </div>
        <BoxTable
          action={
            <Flex alignCenter row>
              {isPosition && (
                <>
                  <Input
                    value={location}
                    className='form-control'
                    style={{ width: '220px' }}
                    placeholder={t('请输入分类名')}
                    onKeyboard={this.handleFindLocation}
                    onChange={this.handleChangeLocation}
                  />
                  <Button type='primary' onClick={this.handleFindLocation}>
                    {t('定位')}
                  </Button>
                </>
              )}
            </Flex>
          }
        >
          <TreeList
            treeData={treeData}
            clearCheckData={this.clearCheckData}
            checkList={checkList}
            checkData={checkData}
            ref={(ref) => (this.treeListRef = ref)}
            style={{
              maxHeight: 'calc(100vh - 280px)',
              overflowY: 'auto',
            }}
            batchActionBar={batchActionBar}
            renderLeafData={this.renderLeafData}
            onCheck={this.handleCheck}
            onExpand={this.handleExpand}
            onClearHighlight={this.handleClearHighlight}
          />
        </BoxTable>
      </>
    )
  }
}

TreeListTable.propTypes = {
  rateSummary: PropTypes.obj, // 已修改spu变化率的总表，对象形式
  isPosition: PropTypes.bool, // 是否有定位功能
  columns: PropTypes.array,
  onCheck: PropTypes.func,
  batchActionBar: PropTypes.array,
  urlParm: PropTypes.object, // 自定义参数
  tipTextList: PropTypes.array, // 列表头部文字提示
  businessInfo: PropTypes.object, // 商户信息 { name :'商户'，id:'23423'}
  actionType: PropTypes.element, // 操作栏
}

export default TreeListTable
