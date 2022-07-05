import React from 'react'
import { i18next } from 'gm-i18n'
import { observer, Observer } from 'mobx-react'
import PropTypes from 'prop-types'
import { BoxTable, Button, Tip, Switch, Flex } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { selectTableV2HOC, Table, TableUtil } from '@gmfe/table'
import store from '../store'
import globalStore from 'stores/global'
import { productDefaultImg, history } from 'common/service'
import { showMultipleSaleMenus, combineLevel } from '../../util'

const SelectTable = selectTableV2HOC(Table)

@observer
class CommodityList extends React.Component {
  componentDidMount() {
    // 清除勾选数据
    store.selected([])
  }

  handleAddCombineGoods = () => {
    history.push('/marketing/manage/combine_goods/create')
  }

  // 修改销售状态
  handleChangeState = (index, id, checked) => {
    store.changeState(index, id, checked ? 1 : 0)
  }

  // 批量添加可见报价单
  handleBatchEditSaleMenu = () => {
    const query = store.isSelectAllPage
      ? {
          all: 1,
          ...store.fetchFilterData,
        }
      : {
          all: 0,
          combine_goods_ids: JSON.stringify(store.selectedList),
        }

    history.push(
      `/marketing/manage/combine_goods/add_salemenus?query=${JSON.stringify(
        query,
      )}`,
    )
  }

  handleDelete = (id) => {
    const { pagination } = this.props
    return store.delete(id).then(() => {
      Tip.success(i18next.t('删除成功'))
      pagination.current.apiDoFirstRequest()
    })
  }

  render() {
    const { combineGoodsList, selectedList, isSelectAllPage } = store
    const { pagination } = this.props
    const hasAddPermission = globalStore.hasPermission('add_combine_goods')
    const hasEditPermission = globalStore.hasPermission('edit_combine_goods')
    const hasEditBatchSaleMenuPermission = globalStore.hasPermission(
      'edit_batch_combine_goods',
    )
    const hasDeletePermission = globalStore.hasPermission(
      'delete_combine_goods',
    )

    return (
      <BoxTable
        action={
          hasAddPermission && (
            <Button type='primary' onClick={this.handleAddCombineGoods}>
              {i18next.t('新建组合商品')}
            </Button>
          )
        }
      >
        <ManagePaginationV2
          onRequest={store.handleCombineGoodsList}
          ref={pagination}
        >
          <SelectTable
            data={combineGoodsList.slice()}
            keyField='id'
            selected={selectedList.slice()}
            onSelect={(selected) => {
              store.selected(selected)
            }}
            onSelectAll={(isSelectedAll) => {
              store.selectAll(isSelectedAll)
            }}
            batchActionBar={
              selectedList.length ? (
                <TableUtil.BatchActionBar
                  isSelectAll={isSelectAllPage}
                  onClose={() => {
                    store.selectAll(false)
                  }}
                  toggleSelectAll={(bool) => {
                    store.selectAllPage(bool)
                  }}
                  count={isSelectAllPage ? null : selectedList.length}
                  batchActions={[
                    {
                      name: i18next.t('批量添加可见报价单'),
                      onClick: this.handleBatchEditSaleMenu,
                      show: hasEditBatchSaleMenuPermission,
                      type: 'business',
                    },
                  ]}
                />
              ) : null
            }
            columns={[
              {
                Header: i18next.t('组合商品图片'),
                accessor: 'image',
                Cell: ({ original: { image } }) => (
                  <img
                    style={{ width: '40px', height: '40px' }}
                    className='gm-border'
                    src={image || productDefaultImg}
                  />
                ),
              },
              {
                Header: i18next.t('组合商品'),
                accessor: 'name',
                width: 300,
                Cell: ({ original }) => (
                  <Flex column>
                    <span>{original.name}</span>
                    <span className='gm-text-desc'>{original.id}</span>
                    {original.has_sku_invalid && (
                      <span
                        className='gm-text-red'
                        show={original.has_sku_invalid}
                      >
                        {i18next.t(
                          '当前组合商品信息不完整，请进入详情页填写完善！',
                        )}
                      </span>
                    )}
                  </Flex>
                ),
              },
              {
                Header: i18next.t('类型'),
                accessor: 'combine_level',
                Cell: ({ original }) =>
                  combineLevel[original.combine_level] || '-',
              },
              {
                Header: i18next.t('销售状态'),
                accessor: 'state',
                Cell: ({ original, index }) => {
                  return (
                    <Observer>
                      {() => (
                        <Switch
                          type='primary'
                          checked={!!original.state}
                          on={i18next.t('上架')}
                          off={i18next.t('下架')}
                          disabled={!hasEditBatchSaleMenuPermission}
                          onChange={this.handleChangeState.bind(
                            this,
                            index,
                            original.id,
                          )}
                        />
                      )}
                    </Observer>
                  )
                },
              },
              {
                Header: i18next.t('可见报价单'),
                accessor: 'salemenu',
                Cell: ({ original }) => {
                  return (
                    <span>{showMultipleSaleMenus(original.salemenus)}</span>
                  )
                },
              },
              {
                Header: TableUtil.OperationHeader,
                Cell: ({ original }) => (
                  <TableUtil.OperationCell>
                    {hasEditPermission && (
                      <TableUtil.OperationDetail
                        open
                        href={`#/marketing/manage/combine_goods/detail?id=${original.id}`}
                      />
                    )}
                    {hasDeletePermission && (
                      <TableUtil.OperationDelete
                        title={i18next.t('警告')}
                        onClick={() => this.handleDelete(original.id)}
                      >
                        {i18next.t('是否确定删除组合商品')}
                      </TableUtil.OperationDelete>
                    )}
                  </TableUtil.OperationCell>
                ),
              },
            ]}
          />
        </ManagePaginationV2>
      </BoxTable>
    )
  }
}

CommodityList.propTypes = {
  pagination: PropTypes.object,
}

export default CommodityList
