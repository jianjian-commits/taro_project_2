import React from 'react'
import { Table } from '@gmfe/table'
import { Pagination, Flex } from '@gmfe/react'
import { QuickPanel } from '@gmfe/react-deprecated'
import { i18next } from 'gm-i18n'
import store from './store'
import { observer } from 'mobx-react'

@observer
class InventoryErrorList extends React.Component {
  componentDidMount() {
    const { task_id } = this.props.location.query

    store.setErrorTaskId(task_id)
    store.getErrorInventoryList()
  }

  handlePage = (pagination) => {
    store.getErrorInventoryList(pagination)
  }

  render() {
    const { inventoryErrorList, errorPagination } = store
    const reason = {
      1: '由于该商品在盘点时正在操作出入库，请在完成出入库操作后再进行盘点操作',
    }

    return (
      <QuickPanel icon='bill' title={i18next.t('盘点商品列表')}>
        <Table
          data={inventoryErrorList.slice()}
          className='gm-margin-bottom-10'
          columns={[
            {
              Header: i18next.t('商品ID'),
              accessor: 'spu_id',
            },
            {
              Header: i18next.t('商品名'),
              accessor: 'name',
            },
            {
              id: 'category_name',
              Header: i18next.t('商品分类'),
              accessor: (d) => {
                return (
                  <span>{d.category_name_1 + '/' + d.category_name_2}</span>
                )
              },
            },
            {
              id: 'reason',
              Header: i18next.t('失败原因'),
              accessor: (d) => {
                return (
                  <span className='gm-text-red'>{reason[d.reason_type]}</span>
                )
              },
            },
          ]}
        />
        <Flex justifyCenter>
          <Pagination
            toPage={this.handlePage}
            data={errorPagination}
            nextDisabled={errorPagination.count - errorPagination.offset <= 10}
          />
        </Flex>
      </QuickPanel>
    )
  }
}

export default InventoryErrorList
