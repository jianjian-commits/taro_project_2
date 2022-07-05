import React, { useEffect, useCallback, useState } from 'react'
import { Flex, TreeV2, Button, Modal, Tip, InputNumberV2 } from '@gmfe/react'
import { t } from 'gm-i18n'
import { pinYinFilter } from '@gm-common/tool'
import store from './goods_store'
import { observer } from 'mobx-react'
import { TableXVirtualized, selectTableXHOC, TableXUtil } from '@gmfe/table-x'
import _ from 'lodash'
import TableTotalText from 'common/components/table_total_text'
import Position from 'common/components/position'

const SelectVirtualTable = selectTableXHOC(TableXVirtualized)
const { TABLE_X } = TableXUtil
const refList = React.createRef()

const AddProductModal = observer(() => {
  const [percentageOfSkus, setPercentageOfSkus] = useState(null)
  const [listIndex, setListIndex] = useState(null)
  // 默认获取第一个数据
  const [firstSelect, setFirstSelect] = useState(null)
  useEffect(() => {
    store.getTreeData().then((json) => {
      store.setTreeData(json)
      setFirstSelect(json[0].value)
    })
  }, [])

  const handleLeftChange = (data) => {
    store.setTreeSelected(data)
  }

  const handleTableSelect = (selected) => {
    store.setSkuTreeListSelect(selected)
    const data = store.skuTreeActive.length
      ? store.skuTreeActive
      : store.skuTreeSelected
    store.changePreSkuTreeDataSelected(data, selected)
  }

  const handleIsSelectorDisable = useCallback((original) => {
    const id_list = _.map(store.skus.slice(), (item) => item.id)
    return _.includes(id_list, original.sku_id)
  }, [])

  const handleHasAdd = (id) => {
    const id_list = _.map(store.skus.slice(), (item) => item.id)
    return _.includes(id_list, id)
  }

  const handleListHighLight = useCallback(
    (data, index) => {
      if (listIndex !== null && listIndex === index) {
        return true
      } else {
        return false
      }
    },
    [listIndex],
  )

  const handleActive = (data) => {
    store.getActiveTreeData(data)
  }

  const handleOk = () => {
    const sku_list_id = _.map(store.skus.slice(), (item) => item.id)
    const select_list = _.reduce(
      store.preSkuTreeData,
      (res, item) => {
        const new_selected = _.difference(item.selected, sku_list_id)
        return _.concat(
          res,
          _.reduce(
            item.list,
            (r, i) => {
              if (_.includes(new_selected, i.sku_id)) {
                return _.concat(r, [
                  {
                    ...i,
                    id: i.sku_id,
                    name: i.sku_name,
                    percentage: percentageOfSkus, // 批量设置分佣比例
                  },
                ])
              } else {
                return r
              }
            },
            [],
          ),
        )
      },
      [],
    )
    console.log('----select-list----', select_list)
    if (select_list.length > 0) {
      const new_skus = _.concat(select_list, store.skus.slice())
      store.setSkuList(new_skus)
    }
    store.clearSkuTreeData()
    Modal.hide()
  }

  const handleCancel = () => {
    Modal.hide()
  }

  const handleFind = (data, searchText) => {
    if (searchText === '') {
      Tip.warning(t('没有找到'))
      return []
    }
    const find_list = pinYinFilter(data, searchText, (v) => v.text)
    let res = find_list
    _.forEach(data, (item) => {
      if (item.children && item.children.length) {
        res = _.concat(res, handleFind(item.children, searchText))
      }
    })
    return res
  }

  const handleRenderItem = (data) => {
    const category_2 = store.preSkuTreeData[data.value]
    const count = category_2 ? category_2.selected.length : 0

    return (
      <div>
        {data.text}
        {count > 0 && (
          <span className='gm-margin-left-10 gm-text-desc'>
            <span>{t('已选：')}</span>
            <span style={{ color: '#56A3F2' }}>{count}</span>
          </span>
        )}
      </div>
    )
  }

  const {
    skuTree,
    skuTreeIndeterminate,
    skuTreeSelected,
    skuTreeList,
    skuTreeListLoading,
    skuTreeListSelect,
    preSkuTreeData,
  } = store

  const limit = 8
  const tableHeight =
    TABLE_X.HEIGHT_HEAD_TR +
    Math.min(limit, skuTreeList.length) * TABLE_X.HEIGHT_TR

  const sum = _.reduce(
    preSkuTreeData,
    (res, item) => {
      return res + item.selected.length
    },
    0,
  )

  return (
    <div>
      <Flex>
        <TreeV2
          withFindFilter={handleFind}
          withFilter={false}
          showAllCheck={false}
          placeholder='输入分类名称'
          list={skuTree.slice()}
          onActiveValues={handleActive}
          selectedValues={skuTreeSelected.slice()}
          onSelectValues={handleLeftChange}
          indeterminateList={skuTreeIndeterminate.slice()}
          activeValue={firstSelect}
          className='gm-padding-right-20'
          renderLeafItem={handleRenderItem}
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
            list={skuTreeList.slice()}
            tableRef={refList}
            onHighlight={(i) => setListIndex(i)}
            filterText={['sku_name', 'salemenu_name']}
            placeholder={t('请输入商品名或报价单名称')}
            className='gm-margin-bottom-20'
          />
          <SelectVirtualTable
            refVirtualized={refList}
            virtualizedItemSize={TABLE_X.HEIGHT_TR}
            virtualizedHeight={tableHeight}
            isSelectorDisable={handleIsSelectorDisable}
            data={skuTreeList.slice()}
            isTrHighlight={handleListHighLight}
            className='gm-margin-top-10'
            keyField='sku_id'
            fixedSelect
            loading={skuTreeListLoading}
            id='market_tag_edit_table'
            selected={skuTreeListSelect.slice()}
            onSelect={handleTableSelect}
            style={{
              width: '722px',
              height: '546px',
            }}
            columns={[
              {
                Header: t('商品'),
                width: 250,
                Cell: (cellProps) => {
                  const { sku_name, sku_id } = cellProps.row.original
                  const show = handleHasAdd(sku_id)
                  return (
                    <div>
                      <div>{sku_name}</div>
                      {show && (
                        <span
                          style={{
                            border: '1px solid #56A3F2',
                            color: '#56A3F2',
                          }}
                        >
                          {t('已加')}
                        </span>
                      )}
                      <span>{sku_id}</span>
                    </div>
                  )
                },
              },
              {
                Header: t('商品分类'),
                miniWidth: 50,
                Cell: (cellProps) => {
                  const {
                    category_1_name,
                    category_2_name,
                  } = cellProps.row.original
                  return <span>{`${category_1_name}/${category_2_name}`}</span>
                },
              },
              {
                Header: t('销售状态'),
                accessor: 'state',
                miniWidth: 50,
                Cell: (cellProps) => {
                  const { state } = cellProps.row.original
                  return (
                    <span
                      className='text-center'
                      style={{
                        width: '40px',
                        backgroundColor: state ? '#56A3F2' : '#e8eaf0',
                        color: '#fff',
                      }}
                    >
                      {state ? t('上架') : t('下架')}
                    </span>
                  )
                },
              },
              {
                Header: t('报价单'),
                accessor: 'salemenu_name',
                miniWidth: 100,
              },
            ]}
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
                  {sum}
                  <span style={{ color: '#000923', fontWeight: 'normal' }}>
                    {t('项')}
                  </span>
                </span>
              ),
            },
            {
              label: t('分佣规则'),
              content: (
                <span>
                  <InputNumberV2
                    style={{
                      width: '50px',
                      color: '#000923',
                      fontWeight: 'normal',
                    }}
                    onChange={(val) => setPercentageOfSkus(val)}
                    max={100}
                    min={0}
                    value={percentageOfSkus}
                  />{' '}
                  <span style={{ color: '#000923', fontWeight: 'normal' }}>
                    %
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

export default AddProductModal
