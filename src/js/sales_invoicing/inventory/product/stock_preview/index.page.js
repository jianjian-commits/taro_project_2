import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { BoxTable, Flex } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import { t } from 'gm-i18n'
import { TableX } from '@gmfe/table-x'
import Big from 'big.js'
import styled from 'styled-components'
import { history, withBreadcrumbs } from 'common/service'
import TableTotalText from 'common/components/table_total_text'
import store from './store'

@withBreadcrumbs([t('库存预览')])
@observer
class StockPreview extends Component {
  pagination = React.createRef()

  handleRequest = (pagination) => {
    const { location } = this.props
    const { query } = location
    return store.fetchStockPreViewData(pagination, query.spu_id)
  }

  componentDidMount() {
    store.setDoFirstRequest(this.pagination.current.doFirstRequest)
    this.pagination.current.apiDoFirstRequest()
  }

  handleStockOrderNo = (id) => {
    history.push(`/sales_invoicing/stock_out/product/receipt?id=${id}`)
  }

  render() {
    const { list, stock_preview_info } = store
    return (
      <>
        <BoxTable
          info={
            <>
              <BoxTable.Info>
                <Flex justifyStart>
                  <ShowName>{stock_preview_info.name}</ShowName>
                  <TableTotalText
                    data={[
                      {
                        label: t('待出库库存'),
                        content: `${parseFloat(
                          Big(stock_preview_info.count_frozen).toFixed(2),
                        )} ${stock_preview_info.std_unit_name}`,
                      },
                    ]}
                  />
                </Flex>
              </BoxTable.Info>
            </>
          }
        >
          <ManagePaginationV2
            id='stock_preview'
            onRequest={this.handleRequest}
            ref={this.pagination}
          >
            <TableX
              data={list.slice()}
              columns={[
                {
                  Header: t('来源'),
                  accessor: 'id',
                  Cell: ({
                    row: {
                      original: { id },
                    },
                  }) => {
                    return (
                      <a
                        onClick={this.handleStockOrderNo.bind(this, id)}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='gm-cursor'
                      >
                        {`${id}`}
                      </a>
                    )
                  },
                },
                {
                  Header: t('创建时间'),
                  accessor: 'create_time',
                },
                {
                  Header: t('待出库'),
                  accessor: 'frozen',
                  Cell: ({
                    row: {
                      original: { frozen },
                    },
                  }) =>
                    `${parseFloat(Big(frozen).toFixed(2))}${
                      stock_preview_info.std_unit_name
                    }`,
                },
              ]}
            />
          </ManagePaginationV2>
        </BoxTable>
      </>
    )
  }
}

const ShowName = styled(Flex)`
  padding-top: 2px;
  margin-right: 20px;
  font-size: 14px;
`
export default StockPreview
