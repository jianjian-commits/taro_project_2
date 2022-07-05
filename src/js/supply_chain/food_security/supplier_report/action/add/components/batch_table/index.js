import React from 'react'
import {
  TableX,
  selectTableXHOC,
  editTableXHOC,
  TableXUtil,
} from '@gmfe/table-x'
import { observer, Observer } from 'mobx-react'
import { MoreSelect } from '@gmfe/react'
import { i18next } from 'gm-i18n'
import moment from 'moment'
import store from './index.store'

const SelectTableX = selectTableXHOC(TableX)
const EditTableX = editTableXHOC(SelectTableX)
const { TABLE_X, OperationHeader, EditOperation } = TableXUtil

@observer
class BatchTable extends React.Component {
  columns = [
    {
      Header: '序号',
      accessor: 'data.index',
      fixed: 'left',
      width: TABLE_X.WIDTH_NO,
      maxWidth: TABLE_X.WIDTH_NO,
      Cell: ({ row }) => row.index + 1,
    },
    {
      id: 'operation',
      Header: () => <OperationHeader />,
      fixed: 'left',
      width: TABLE_X.WIDTH_OPERATION,
      maxWidth: TABLE_X.WIDTH_OPERATION,
      Cell: ({ row: { index, original }, data }) => {
        return (
          <EditOperation
            onAddRow={() => store.newItem()}
            onDeleteRow={
              data.length > 1 ? () => store.removeItem(index) : undefined
            }
          />
        )
      },
    },
    {
      Header: '入库时间',
      id: 'data.in_stock_time',
      accessor: (v) => {
        return v.data?.in_stock_time
          ? moment(v.data.in_stock_time).format('YYYY-MM-DD HH:mm')
          : ''
      },
    },
    {
      Header: '批次号',
      accessor: 'data.batch_number',
      width: TABLE_X.WIDTH_SELECT * 2.5,
      Cell: ({ row: { original, index } }) => {
        return (
          <Observer>
            {() => {
              return (
                <MoreSelect
                  disabledClose
                  data={original.candidates
                    // 过滤已存在
                    .filter(
                      (candidate) =>
                        !store.list.find(
                          (row) =>
                            row.data?.batch_number === candidate.batch_number,
                        ),
                    )
                    .map(({ batch_number }) => {
                      return {
                        text: batch_number,
                        value: batch_number,
                      }
                    })
                    .slice()}
                  selected={original.selectedCandidate}
                  onSelect={(selected) => {
                    original.setSelectedCandidate(index, selected)
                    store.list.splice(index, 1, original)
                  }}
                  onSearch={(str) => str && original.searchBatches(str)}
                  placeholder={
                    original.data?.batch_number ? (
                      <div className='gm-text-black'>
                        {original.data?.batch_number}
                      </div>
                    ) : (
                      i18next.t('请输入批次号搜索')
                    )
                  }
                  renderListFilterType='pinyin'
                />
              )
            }}
          </Observer>
        )
      },
    },
    {
      Header: '供应商',
      accessor: 'data.supplier_name',
    },
    {
      Header: '商品分类',
      accessor: 'data.category',
    },
    {
      Header: '入库规格名',
      accessor: 'data.spu_name',
    },
  ]

  render() {
    return (
      <>
        <EditTableX
          keyField='id'
          columns={this.columns}
          data={store.list.slice()}
          selected={store.selected.slice()}
          onSelect={(selected) => store.setSelected(selected)}
        />
      </>
    )
  }
}

export default BatchTable
