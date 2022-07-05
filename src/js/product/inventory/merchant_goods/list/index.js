import { i18next, t } from 'gm-i18n'
import React, { useRef, useCallback, useEffect, useState } from 'react'
import {
  Price,
  Form,
  FormItem,
  FormButton,
  Button,
  Box,
  BoxTable,
} from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import store from './store'
import { history } from 'common/service'
import api from './api'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import { convertNumber2Sid } from 'common/filter'
import TableTotalText from 'common/components/table_total_text'

import { Table, expandTableHOC, TableUtil, subTableHOC } from '@gmfe/table'

const ExpandTable = expandTableHOC(Table)
const SubTable = subTableHOC(Table)

const handleDetailFunc = (spu_id, address_id) => () => {
  history.push({
    pathname: '/sales_invoicing/inventory/merchant_goods/detail',
    query: { spu_id, address_id },
  })
}

const RowRender = (props) => {
  const { index } = props
  const [spus, setSpus] = useState([])
  const [isLoading, setLoading] = useState(false)
  const paginationRef = useRef()
  const { address_id } = store.merchantList[index]
  const hasLoad = useRef(false)
  const fetchSpuList = useCallback(
    (pagination) => {
      const params = {
        address_id,
        ...pagination,
      }
      // 展开才loading
      if (!hasLoad.current) {
        setLoading(true)
      }

      return api.fetchSpuListApi(params).then((json) => {
        hasLoad.current = true
        setLoading(false)
        setSpus(json.data)
        return json
      })
    },
    [address_id]
  )

  useEffect(() => {
    paginationRef.current.apiDoFirstRequest()
  }, [])

  return (
    <ManagePaginationV2
      id='pagination_in_product_merchant_goods_list_sub'
      disablePage
      onRequest={fetchSpuList}
      ref={paginationRef}
    >
      <SubTable
        data={spus.slice()}
        loading={isLoading}
        columns={[
          { Header: i18next.t('商品ID'), accessor: 'spu_id' },
          { Header: i18next.t('商品名称'), accessor: 'spu_name' },
          { Header: i18next.t('基本单位'), accessor: 'std_unit_name' },
          {
            Header: i18next.t('当前库存'),
            accessor: 'stock',
            Cell: ({ original }) => original.stock + original.std_unit_name,
          },
          {
            Header: i18next.t('当前库存均价'),
            accessor: 'avg_price',
            Cell: ({ original }) =>
              original.avg_price +
              Price.getUnit() +
              '/' +
              original.std_unit_name,
          },
          {
            Header: i18next.t('当前货值'),
            accessor: 'stock_value',
            Cell: ({ original }) => original.stock_value + Price.getUnit(),
          },
          {
            Header: TableUtil.OperationHeader,
            Cell: (cellProps) => (
              <TableUtil.OperationCell>
                <TableUtil.OperationDetail
                  onClick={handleDetailFunc(
                    cellProps.original.spu_id,
                    address_id
                  )}
                />
              </TableUtil.OperationCell>
            ),
          },
        ]}
      />
    </ManagePaginationV2>
  )
}
RowRender.propTypes = {
  index: PropTypes.number.isRequired,
}

@observer
class MearchantGoodsList extends React.Component {
  paginationRef = React.createRef()

  handleExpandedRowRender = (index) => {
    return <RowRender index={index} />
  }

  componentDidMount() {
    store.setPagination(this.paginationRef.current)
    store.handleSearch()
  }

  render() {
    const {
      filter: { search },
      amountInfo,
      merchantList,
      handleFilterChange,
      handleSearch,
      handleExport,
    } = store

    const table_total_data = [
      {
        label: i18next.t('商户数'),
        content: amountInfo.address_count,
      },
      {
        label: i18next.t('总货值'),
        content: Price.getCurrency() + amountInfo.total_stock_value,
      },
    ]

    return (
      <>
        <Box hasGap>
          <Form inline onSubmit={handleSearch} colWidth='260px'>
            <FormItem label={i18next.t('搜索')}>
              <input
                value={search}
                onChange={(e) => {
                  handleFilterChange('search', e.target.value)
                }}
                className='form-control'
                placeholder={i18next.t('输入商户名或商户ID搜索')}
              />
            </FormItem>
            <FormButton>
              <Button type='primary' htmlType='submit'>
                {i18next.t('搜索')}
              </Button>
              <div className='gm-gap-10' />
              <Button onClick={handleExport}>{i18next.t('导出')}</Button>
            </FormButton>
          </Form>
        </Box>

        <BoxTable
          info={
            <BoxTable.Info>
              <TableTotalText data={table_total_data} />
            </BoxTable.Info>
          }
        >
          <ManagePaginationV2
            id='pagination_in_product_merchant_goods_list_expand'
            disablePage
            onRequest={store.fetchList}
            ref={this.paginationRef}
          >
            <ExpandTable
              data={merchantList.slice()}
              SubComponent={({ index }) => this.handleExpandedRowRender(index)}
              columns={[
                {
                  Header: t('商户ID'),
                  accessor: 'address_id',
                  Cell: ({ original }) =>
                    convertNumber2Sid(original.address_id),
                },
                { Header: t('商户名称'), accessor: 'address_name' },
                {
                  Header: t('当前货值'),
                  accessor: 'stock_value',
                  Cell: ({ original }) =>
                    original.stock_value + Price.getUnit(),
                },
              ]}
            />
          </ManagePaginationV2>
        </BoxTable>
      </>
    )
  }
}

export default MearchantGoodsList
