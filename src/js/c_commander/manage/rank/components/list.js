import React from 'react'
import { observer } from 'mobx-react'
import { BoxTable, Flex, Pagination } from '@gmfe/react'
import { TableX, TableXUtil } from '@gmfe/table-x'
import { t } from 'gm-i18n'
import store from '../store'
import { quickSort, pageByLimit } from '../util'

@observer
class List extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      pagination: {
        count: 0,
        offset: 0,
        limit: 10
      }, // 假分页
      currentPage: 0, // 当前页
      sortList: [] // 排序list
    }
  }

  componentDidMount() {
    store.fetchList()
  }

  handleSortClick = (name, direction) => {
    const { updateList } = store
    let sortItem = {}
    let newSortList = []

    if (!direction) {
      sortItem = { sort_by: '', sort_direction: '' }
    } else {
      sortItem = { sort_by: name, sort_direction: direction }
      newSortList = quickSort(name, updateList, direction)

      this.setState({
        sortList: newSortList
      })
    }

    store.setSortItem(sortItem)
    this.setState({
      currentPage: 0,
      pagination: {
        count: updateList.length,
        limit: this.state.pagination.limit,
        offset: 0
      }
    })
  }

  onHandlePageChange = data => {
    const newPagination = { ...this.state.pagination, ...data }
    const offset = newPagination.offset
    const limit = newPagination.limit

    this.setState({
      pagination: {
        ...newPagination,
        count: store.updateList.length
      },
      currentPage: +(offset / limit)
    })
  }

  render() {
    const {
      updateList,
      loading,
      sortItem: { sort_by, sort_direction }
    } = store

    const { pagination, currentPage } = this.state
    const newPagination = {
      ...pagination,
      count: updateList.length
    }

    const list =
      updateList && updateList.length
        ? pageByLimit(
            sort_direction && this.state.sortList && this.state.sortList.length
              ? this.state.sortList
              : updateList,
            pagination.limit
          )[currentPage]
        : []

    return (
      <BoxTable>
        <TableX
          data={list.slice()}
          loading={loading}
          columns={[
            {
              Header: () => (
                <div>
                  {t('团长编号')}
                  <TableXUtil.SortHeader
                    type={sort_by === 'id' ? sort_direction : null}
                    onChange={direction =>
                      this.handleSortClick('id', direction)
                    }
                  />
                </div>
              ),
              accessor: 'id'
            },
            {
              Header: t('团长姓名'),
              accessor: 'name'
            },
            {
              Header: () => (
                <div>
                  {t('销售额')}
                  <TableXUtil.SortHeader
                    type={sort_by === 'sale_money' ? sort_direction : null}
                    onChange={direction =>
                      this.handleSortClick('sale_money', direction)
                    }
                  />
                </div>
              ),
              accessor: 'sale_money'
            },
            {
              Header: () => (
                <div>
                  {t('佣金')}
                  <TableXUtil.SortHeader
                    type={sort_by === 'commission' ? sort_direction : null}
                    onChange={direction =>
                      this.handleSortClick('commission', direction)
                    }
                  />
                </div>
              ),
              accessor: 'commission'
            },
            {
              Header: () => (
                <div>
                  {t('订单数')}
                  <TableXUtil.SortHeader
                    type={
                      sort_by === 'sale_order_count' ? sort_direction : null
                    }
                    onChange={direction =>
                      this.handleSortClick('sale_order_count', direction)
                    }
                  />
                </div>
              ),
              accessor: 'sale_order_count'
            },
            {
              Header: () => (
                <div>
                  {t('下单客户数')}
                  <TableXUtil.SortHeader
                    type={sort_by === 'customer_count' ? sort_direction : null}
                    onChange={direction =>
                      this.handleSortClick('customer_count', direction)
                    }
                  />
                </div>
              ),
              accessor: 'customer_count'
            }
          ]}
        />
        <Flex justifyEnd alignCenter className='gm-padding-20'>
          <Pagination data={newPagination} toPage={this.onHandlePageChange} />
        </Flex>
      </BoxTable>
    )
  }
}

export default List
