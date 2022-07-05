import { i18next, t } from 'gm-i18n'
import React from 'react'
import { observer, Observer } from 'mobx-react'
import { Flex, Switch, Tip, Price, BoxTable, Button } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { Table, TableUtil } from '@gmfe/table'
import store from './store'
import SearchFilter from './search_filter'
import { productDefaultImg } from 'common/service'
import globalStore from 'stores/global'
import _ from 'lodash'
import TableTotalText from '../../../common/components/table_total_text'

@observer
class PointsMerchandise extends React.Component {
  constructor(props) {
    super(props)
    store.initList()
  }

  handleSearchRequest = (pagination) => {
    return store.fetchData(pagination)
  }

  componentDidMount() {
    store.pagination && store.pagination.apiDoFirstRequest()
  }

  handleCreate = () => {
    window.open('#/marketing/points/points_merchandise/detail')
  }

  handleChangeStatus = (reward_sku_id, value) => {
    const status = value ? 1 : 2
    store
      .changeStatus(reward_sku_id, status)
      .then(() => Tip.success(i18next.t('修改兑换状态成功')))
  }

  render() {
    const { list, count } = store
    const isAdd = globalStore.hasPermission('add_reward_sku')
    const isDelete = globalStore.hasPermission('delete_reward_sku')
    return (
      <div>
        <SearchFilter />
        <BoxTable
          info={
            <BoxTable.Info>
              <TableTotalText
                data={[
                  {
                    label: i18next.t('商品总数'),
                    content: count || 0,
                  },
                ]}
              />
            </BoxTable.Info>
          }
          action={
            isAdd && (
              <Button type='primary' onClick={this.handleCreate}>
                {i18next.t('新建积分商品')}
              </Button>
            )
          }
        >
          <ManagePaginationV2
            id='pagination_in_merchandise_points_goods_list'
            onRequest={this.handleSearchRequest}
            ref={(ref) => {
              ref && store.setPagination(ref)
            }}
          >
            <Table
              data={list}
              columns={[
                {
                  Header: i18next.t('积分商品图片'),
                  id: 'image',
                  accessor: (original) => (
                    <Flex
                      alignCenter
                      style={{ width: '40px', height: '40px' }}
                      className='gm-border'
                    >
                      <img
                        src={original.image || productDefaultImg}
                        style={{
                          maxWidth: '40px',
                          width: '100%',
                          height: '100%',
                        }}
                      />
                    </Flex>
                  ),
                },
                {
                  Header: i18next.t('积分商品名称'),
                  accessor: 'sku_name',
                },
                {
                  Header: i18next.t('规格'),
                  accessor: 'sale_unit',
                },
                {
                  Header: i18next.t('兑换状态'),
                  id: 'status',
                  Cell: ({ original }) => {
                    return (
                      <Observer>
                        {() => {
                          return (
                            <Switch
                              type='primary'
                              checked={original.status === 1}
                              on={i18next.t('上架')}
                              off={i18next.t('下架')}
                              onChange={this.handleChangeStatus.bind(
                                this,
                                original.reward_sku_id
                              )}
                            />
                          )
                        }}
                      </Observer>
                    )
                  },
                },
                {
                  Header: i18next.t('成本价'),
                  id: 'sku_cost',
                  Cell: (row) => (
                    <div>
                      {_.isNil(row.original.sku_cost)
                        ? '-'
                        : row.original.sku_cost}
                      {Price.getUnit()}
                    </div>
                  ),
                },
                {
                  Header: i18next.t('活动积分'),
                  accessor: 'cost_point',
                },
                {
                  Header: i18next.t('单次兑换'),
                  accessor: 'once_limit',
                },
                {
                  Header: i18next.t('活动库存'),
                  accessor: 'stock_num',
                },
                {
                  width: 100,
                  Header: TableUtil.OperationHeader,
                  Cell: (row) => {
                    return (
                      <TableUtil.OperationCell>
                        <div>
                          <TableUtil.OperationDetail
                            href={`#/marketing/points/points_merchandise/detail?reward_sku_id=${row.original.reward_sku_id}`}
                            open
                          />
                          {isDelete && (
                            <TableUtil.OperationDelete
                              title={t('删除积分商品')}
                              onClick={() =>
                                store
                                  .deletePointsMerchandise(
                                    row.original.reward_sku_id
                                  )
                                  .then(() => {
                                    Tip.success(i18next.t('删除积分商品成功'))
                                    store.pagination &&
                                      store.pagination.doFirstRequest()
                                  })
                              }
                            />
                          )}
                        </div>
                      </TableUtil.OperationCell>
                    )
                  },
                },
              ]}
            />
          </ManagePaginationV2>
        </BoxTable>
      </div>
    )
  }
}
export default PointsMerchandise
