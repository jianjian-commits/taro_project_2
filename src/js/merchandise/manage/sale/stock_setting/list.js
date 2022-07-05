import { i18next } from 'gm-i18n'
import React from 'react'
import PropTypes from 'prop-types'
import { observer, Observer } from 'mobx-react'
import store from './store'
import _ from 'lodash'
import { tipWarning } from './util'
import { ENUM, ENUMFilter } from '../../util'
import {
  BoxTable,
  Pagination,
  Flex,
  Select,
  ToolTip,
  InputNumber,
  Switch,
} from '@gmfe/react'
import { Table, TableUtil } from '@gmfe/table'
import qs from 'query-string'
import TableTotalText from 'common/components/table_total_text'

@observer
class StockSettingList extends React.Component {
  handlePageChange = (page) => {
    store.changePage(page)
    store.getStockSettingList(store.searchData, this.props.query.id)
  }

  handleChangeStockType = (index, selected) => {
    store.changeStock(index, 'stocks_type', selected)
  }

  handleDetail = (original) => {
    const {
      std_unit_name_forsale,
      sale_ratio,
      name,
      id,
      sale_unit_name,
    } = original
    window.open(
      '#/merchandise/manage/sale/stock_setting/detail?' +
        qs.stringify({
          sku_id: id,
          name,
          ratio: sale_ratio + std_unit_name_forsale + '/' + sale_unit_name,
        })
    )
  }

  handleChangeInherit = (index, value) => {
    store.changeStock(index, 'stocks_type', value ? 0 : 1)
  }

  handleChangeRemainStocks = (index, value) => {
    store.changeStock(index, 'remain_stocks', value)
  }

  handleSubmit = (index) => {
    store.saveItem(index, store.searchData, this.props.query.id)
  }

  render() {
    const { list, pagination } = store
    const { salemenuType } = this.props.query

    return (
      <BoxTable
        info={
          <BoxTable.Info>
            <TableTotalText
              data={[
                {
                  label: i18next.t('商品总数'),
                  content: pagination.count || 0,
                },
              ]}
            />
          </BoxTable.Info>
        }
      >
        <Table
          data={list.slice()}
          columns={[
            { Header: i18next.t('商品编号'), accessor: 'id' },
            { Header: i18next.t('商品名'), accessor: 'name' },
            {
              Header: i18next.t('分类'),
              id: 'category_name_1',
              accessor: (d) => d.category_name_1 + '/' + d.category_name_2,
            },
            {
              Header: i18next.t('销售规格'),
              accessor: 'sale_ratio',
              Cell: ({ original }) =>
                original.sale_ratio +
                original.std_unit_name_forsale +
                '/' +
                original.sale_unit_name,
            },
            {
              Header: i18next.t('商品状态'),
              accessor: 'state',
              Cell: ({ original }) => {
                return +original.state === 0 ? (
                  <div style={{ color: 'red' }}>{i18next.t('下架')}</div>
                ) : (
                  i18next.t('上架中')
                )
              },
            },
            {
              Header: i18next.t('是否读取上游库存'),
              show: +salemenuType === 2,
              accessor: 'stocks_type',
              Cell: ({ original, index }) => {
                return (
                  <Observer>
                    {() =>
                      original.__isEditing ? (
                        <Switch
                          on={i18next.t('是')}
                          off={i18next.t('否')}
                          type='primary'
                          checked={original.stocks_type === 0}
                          onChange={this.handleChangeInherit.bind(this, index)}
                        />
                      ) : (
                        <div>
                          {original.stocks_type === 0
                            ? i18next.t('是')
                            : i18next.t('否')}
                        </div>
                      )
                    }
                  </Observer>
                )
              },
            },
            {
              Header: (
                <Flex>
                  {i18next.t('销售库存设置')}
                  <ToolTip popup={tipWarning} />
                </Flex>
              ),
              accessor: 'stocks_type',
              Cell: ({ original, index }) => {
                return (
                  <Observer>
                    {() =>
                      original.__isEditing ? (
                        <Select
                          data={_.map(ENUM.stockTypes, (v) => ({
                            text: v.name,
                            value: v.value,
                          }))}
                          value={original.stocks_type}
                          onChange={this.handleChangeStockType.bind(
                            this,
                            index
                          )}
                        />
                      ) : (
                        ENUMFilter.stockType(original.stocks_type)
                      )
                    }
                  </Observer>
                )
              },
            },
            {
              Header: i18next.t('销售库存数'),
              accessor: 'remain_stocks',
              Cell: ({ original, index }) => {
                if (!original.__isEditing) {
                  return original.remain_stocks === '-'
                    ? '-'
                    : original.remain_stocks + original.sale_unit_name
                } else if (original.stocks_type === 2) {
                  return (
                    <Observer>
                      {() => (
                        <InputNumber
                          className='form-control'
                          value={
                            original.remain_stocks === '-'
                              ? ''
                              : original.remain_stocks
                          }
                          min={0}
                          precision={0}
                          onChange={this.handleChangeRemainStocks.bind(
                            this,
                            index
                          )}
                          style={{ width: '120px' }}
                        />
                      )}
                    </Observer>
                  )
                }
              },
            },
            {
              width: 100,
              Header: TableUtil.OperationHeader,
              Cell: ({ original, index }) => (
                <TableUtil.OperationRowEdit
                  isEditing={original.__isEditing}
                  onClick={() => store.itemToEdit(index, true)}
                  onSave={this.handleSubmit.bind(this, index)}
                  onCancel={() => store.itemToEdit(index, false)}
                >
                  <TableUtil.OperationDetail
                    onClick={this.handleDetail.bind(this, original)}
                  />
                </TableUtil.OperationRowEdit>
              ),
            },
          ]}
        />
        <Flex justifyEnd alignCenter className='gm-padding-20'>
          <Pagination data={pagination} toPage={this.handlePageChange} />
        </Flex>
      </BoxTable>
    )
  }
}

StockSettingList.propTypes = {
  query: PropTypes.object,
}

export default StockSettingList
