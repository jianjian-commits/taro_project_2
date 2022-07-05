import React, { useRef, useEffect, useState, useCallback } from 'react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import { Flex, TreeV2, Button, Modal } from '@gmfe/react'
import { observer } from 'mobx-react'
import { TableXVirtualized, selectTableXHOC, TableXUtil } from '@gmfe/table-x'
import _ from 'lodash'

import { pinyinFind, filterRepeat } from './utils'
import store from './store'
import TableTotalText from 'common/components/table_total_text'
import Position from 'common/components/position'

const SelectVirtualTable = selectTableXHOC(TableXVirtualized)
const { TABLE_X } = TableXUtil

const handleFind = (data, searchText) => {
  return pinyinFind(data, searchText)
}

const handleTableSelect = (ids) => {
  store.setTableSelected(ids)

  // 分类选择的id，关联 allSelected
  const temp = {}
  _.forEach(store.active, (v) => {
    _.forEach(ids, (id) => {
      if (_.find(store.catchData[v].data.slice(), { id })) {
        temp[v] = temp[v] ? [...temp[v], id] : [id]
      }
    })
  })
  _.forEach(store.active, (n) => {
    store.setAllSelected(n, temp[n] || [])
  })

  checkTreeSelect()
}

// 检测数据，同步tree的状态。
const checkTreeSelect = () => {
  _.forEach(store.allSelected, (value, name) => {
    const { data } = store.catchData[name]
    // 勾选 tree
    if (data.length !== 0 && data.length === value.length) {
      if (!_.includes(store.treeSelected.slice(), name)) {
        store.setTreeSelected([...store.treeSelected.slice(), name])
      }

      // 剔除半勾选
      store.setIndeterminateSelected(
        _.difference(store.indeterminateSelected.slice(), [name]),
      )
    } else if (value.length === 0) {
      // 取消勾选
      store.setTreeSelected(_.difference(store.treeSelected.slice(), [name]))

      // 剔除半勾选
      store.setIndeterminateSelected(
        _.difference(store.indeterminateSelected.slice(), [name]),
      )
    } else {
      // 半勾选
      if (!_.includes(store.indeterminateSelected.slice(), name)) {
        store.setIndeterminateSelected([
          ...store.indeterminateSelected.slice(),
          name,
        ])
      }

      // 剔除勾选
      store.setTreeSelected(_.difference(store.treeSelected.slice(), [name]))
    }
  })
}

const handleRenderTreeItem = (data) => {
  const { value } = data
  const count = store.allSelected[value] ? store.allSelected[value].length : 0

  return (
    <div>
      {data.text}
      {count > 0 && (
        <span className='gm-margin-left-10 gm-text-desc'>
          <span>{t('已选：')}</span>
          <span className='gm-text-primary'>{count}</span>
        </span>
      )}
    </div>
  )
}

// 检测 tree 勾选分类，对应 table 的选择数据
const doTreeSelected = (data, id) => {
  const dataIds = _.map(data, (v) => v.id)

  store.setAllSelected(id, dataIds)

  const filterSelected = filterRepeat(store.tableSelected.slice(), dataIds)
  // 如果正在展示该分类的数据，则同步到 tableSelected
  if (_.includes(store.active, id)) {
    store.setTableSelected(filterSelected)
  }

  // 如果数据为空，取消勾选
  if (!data.length) {
    store.setTreeSelected(_.difference(store.treeSelected.slice(), [id]))
  }

  checkTreeSelect()
}

// 点击tree时，关联一些已选择的数据
const doTreeActive = (id) => {
  // 获取当前 active 的已选择的数据
  const selected = filterRepeat(
    store.tableSelected.slice(),
    store.allSelected[id].slice(),
  )
  store.setTableSelected(selected)
}

// 清除tree 未选择状态，与 table 的选择数据
const clearTreeSelected = (oldIds, ids) => {
  const noSelected = _.difference(oldIds, ids)
  _.forEach(noSelected, (v) => {
    const noSelectedIds = _.difference(
      store.tableSelected.slice(),
      store.allSelected[v].slice(),
    )
    store.setTableSelected(noSelectedIds)
    store.setAllSelected(v, [])
  })
}

const BatchSelectedModal = observer((props) => {
  const refList = useRef(null)
  const [lightIndex, setLightIndex] = useState(-1)
  useEffect(() => {
    store.setDisableIds(props.disableData)

    return () => {
      store.initStore()
    }
  }, [])

  const handleCancel = () => {
    Modal.hide()
    props.onCancel()
  }

  const handleOk = () => {
    const result = _.reduce(
      store.allSelected,
      (res, ids, n) => {
        if (ids.length) {
          const data = _.filter(store.catchData[n].data.slice(), (v) =>
            _.includes(ids, v.id),
          )
          return [...res, ...data]
        } else {
          return res
        }
      },
      [],
    )

    Modal.hide()
    props.onOk(result)
  }

  const handleIsSelectorDisable = (original) => {
    return _.includes(props.disableData, original.id)
  }

  const handleListHighLight = useCallback(
    (data, index) => {
      if (lightIndex !== null && lightIndex === index) {
        return true
      } else {
        return false
      }
    },
    [lightIndex],
  )

  const handleActive = (ids) => {
    store.setActive(ids)
    // 初始化展示的 table 和 tableSelected
    store.setTable([])
    store.setTableSelected([])

    _.forEach(ids, (id) => {
      // 过滤已缓存的id
      if (!_.includes(store.catchIds, id)) {
        store.setTableLoad(true)
        props
          .onTreeSelectedRequest(id)
          .then((data) => {
            store.setTableLoad(false)
            // 缓存数据
            store.saveData(id, data)

            // 避免用户操作过快，解决异步，数据不一致问题
            if (_.includes(store.active, id)) {
              // 关联右侧table，展示数据，使用响应数据
              store.setTable(_.concat(store.table.slice(), data))
            }
          })
          .catch(() => {
            store.setTableLoad(false)
          })
      } else {
        // 关联右侧table，展示数据，使用缓存数据
        store.setTable(
          _.concat(store.table.slice(), store.catchData[id].data.slice()),
        )
        // 已缓存的选择
        if (_.includes(store.allSelectedTreeIds, id)) {
          doTreeActive(id)
        }
      }
    })
  }

  const handleTreeSelected = (ids) => {
    clearTreeSelected(store.treeSelected.slice(), ids)
    store.setTreeSelected(ids)

    // 按照子节点id搜索
    _.forEach(ids, (id) => {
      // 过滤已缓存的id
      if (!_.includes(store.catchIds, id)) {
        store.setTableLoad(true)
        props
          .onTreeSelectedRequest(id)
          .then((data) => {
            store.setTableLoad(false)
            // 缓存数据
            store.saveData(id, data)

            // 避免用户操作过快，解决异步，数据不一致问题
            const hasSelected = _.includes(store.treeSelected, id)

            if (hasSelected) {
              doTreeSelected(data, id)
            }
          })
          .catch(() => {
            store.setTableLoad(false)
          })
      } else {
        doTreeSelected(store.catchData[id].data.slice(), id)
      }
    })
  }

  const { columns, tree } = props
  const {
    tableSelected,
    table,
    tableLoad,
    treeSelected,
    indeterminateSelected,
    sumSelectedCount,
  } = store

  const limit = 8
  const tableHeight =
    TABLE_X.HEIGHT_HEAD_TR + Math.min(limit, table.length) * TABLE_X.HEIGHT_TR

  return (
    <div>
      <Flex>
        <TreeV2
          withFindFilter={handleFind}
          withFilter={false}
          showAllCheck={false}
          placeholder='输入分类名称'
          list={tree}
          onActiveValues={handleActive}
          selectedValues={treeSelected.slice()}
          onSelectValues={handleTreeSelected}
          indeterminateList={indeterminateSelected.slice()}
          activeValue={tree[0]?.value}
          className='gm-padding-right-20'
          renderLeafItem={handleRenderTreeItem}
          style={{
            width: '230px',
            height: '596px',
            marginLeft: '10px',
            overflowY: 'auto',
            border: 'none',
            borderRight: '1px solid rgb(212, 216, 216)',
          }}
        />
        <div style={{ marginLeft: '30px' }}>
          <Position
            list={table.slice()}
            tableRef={refList}
            onHighlight={setLightIndex}
            placeholder={t('请输入商品名或报价单名称')}
            filterText={['sku_name', 'salemenu_name']}
            className='gm-margin-bottom-20'
          />
          <SelectVirtualTable
            refVirtualized={refList}
            virtualizedItemSize={TABLE_X.HEIGHT_TR}
            virtualizedHeight={tableHeight}
            isSelectorDisable={handleIsSelectorDisable}
            data={table.slice()}
            isTrHighlight={handleListHighLight}
            className='gm-margin-top-10'
            keyField='sku_id'
            fixedSelect
            loading={tableLoad}
            id='market_tag_edit_table'
            selected={tableSelected.slice()}
            onSelect={handleTableSelect}
            style={{
              width: '722px',
              height: '546px',
            }}
            columns={columns}
          />
        </div>
      </Flex>
      <Flex
        justifyBetween
        className='gm-margin-lr-20 gm-padding-tb-20 gm-border-top'
      >
        <TableTotalText
          data={[
            {
              label: t('已选商品'),
              content: (
                <span>
                  {sumSelectedCount}
                  <span style={{ color: '#000923', fontWeight: 'normal' }}>
                    {t('项')}
                  </span>
                </span>
              ),
            },
          ]}
        />
        <Flex>
          <Button className='btn gm-margin-right-20' onClick={handleCancel}>
            {t('取消')}
          </Button>
          <Button className='btn' type='primary' onClick={handleOk}>
            {t('确认')}
          </Button>
        </Flex>
      </Flex>
    </div>
  )
})

BatchSelectedModal.propTypes = {
  /** 左侧 */
  tree: PropTypes.array.isRequired, // [{ text, value, children? }]

  /** 右侧 */
  columns: PropTypes.array.isRequired, // 表格配置
  disableData: PropTypes.array, // [id]

  /** 事件 */
  onTreeSelectedRequest: PropTypes.func.isRequired, // 请求 Tree 详细的数据请求，响应数据需要 id 字段
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
}

BatchSelectedModal.defaultProps = {
  onOk: () => {},
  onCancel: () => {},
}

export default BatchSelectedModal
