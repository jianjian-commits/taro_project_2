import { i18next } from 'gm-i18n'
import React from 'react'
import { Table } from '@gmfe/table'
import { observer } from 'mobx-react'
import moment from 'moment'
import { BoxTable, Price, Flex } from '@gmfe/react'
import { ManagePaginationV2 } from '@gmfe/business'
import store from './store'
import Big from 'big.js'
import { PURCHASE_SOURCE } from '../../../common/enum'
import { renderPurchaseSpec } from '../../../common/filter'
import TableTotalText from '../../../common/components/table_total_text'
import SupplierDel from 'common/components/supplier_del_sign'

@observer
class LogList extends React.Component {
  componentDidMount() {
    // 把函数存在store,提供给filter用
    store.setDoFirstRequest(this.pagination.doFirstRequest)
    this.pagination.apiDoFirstRequest()
  }

  render() {
    const { list, logLength, fetchLogList } = store

    return (
      <BoxTable
        info={
          <BoxTable.Info>
            <TableTotalText
              data={[
                {
                  label: i18next.t('询价记录'),
                  content: logLength,
                },
              ]}
            />
          </BoxTable.Info>
        }
      >
        <ManagePaginationV2
          id='pagination_in_purchase_task_quotation_list'
          onRequest={fetchLogList}
          ref={(ref) => {
            this.pagination = ref
          }}
          defaultLimit={20}
          disablePage
        >
          <Table
            data={list.slice()}
            className='gm-margin-bottom-10'
            columns={[
              {
                Header: i18next.t('询价时间'),
                id: 'create_time',
                accessor: (d) =>
                  moment(d.create_time).format('YYYY-MM-DD HH:mm:ss'),
              },
              {
                Header: i18next.t('采购规格ID'),
                accessor: 'spec_id',
              },
              {
                Header: i18next.t('规格名称'),
                accessor: 'spec_name',
              },
              {
                Header: i18next.t('分类'),
                id: 'fenlei',
                accessor: (d) =>
                  `${d.category1_name}/${d.category2_name}/${d.pinlei_name}`,
              },
              {
                Header: i18next.t('采购规格'),
                id: 'spec',
                accessor: (d) =>
                  renderPurchaseSpec({
                    ratio: d.ratio,
                    std_unit: d.std_unit_name,
                    purchase_unit: d.purchase_unit_name,
                  }),
              },
              {
                Header: i18next.t('供应商'),
                accessor: 'settle_supplier_name',
                Cell: (cellProps) => {
                  const {
                    supplier_status,
                    settle_supplier_name,
                  } = cellProps.original

                  return (
                    <Flex>
                      {supplier_status === 0 && <SupplierDel />}
                      {settle_supplier_name}
                    </Flex>
                  )
                },
              },
              {
                Header: i18next.t('询价价格（基本单位）'),
                id: 'std_unit_price',
                accessor: (d) =>
                  Big(d.std_unit_price).div(100).toFixed(2) +
                  Price.getUnit() +
                  `/${d.std_unit_name}`,
              },
              {
                Header: i18next.t('询价价格（采购单位）'),
                id: 'purchase_price',
                accessor: (d) =>
                  Big(d.purchase_price).div(100).toFixed(2) +
                  Price.getUnit() +
                  `/${d.purchase_unit_name}`,
              },
              {
                Header: i18next.t('产地'),
                accessor: 'origin_place',
              },
              {
                Header: i18next.t('描述'),
                accessor: 'remark',
              },
              {
                Header: i18next.t('询价来源'),
                id: 'source',
                accessor: (d) => PURCHASE_SOURCE[d.source],
              },
              {
                Header: i18next.t('询价人'),
                accessor: 'creator',
              },
            ]}
          />
        </ManagePaginationV2>
      </BoxTable>
    )
  }
}

export default LogList
