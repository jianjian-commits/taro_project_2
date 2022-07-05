import { i18next } from 'gm-i18n'
import React from 'react'
import { BoxTable, Price } from '@gmfe/react'
import { Table } from '@gmfe/table'
import Big from 'big.js'
import qs from 'query-string'
import { observer } from 'mobx-react'

import TableTotalText from 'common/components/table_total_text'
import store from './view_sku/store'

@observer
class DeleteResult extends React.Component {
  componentDidMount() {
    store.getFaildSkuResult(
      { task_id: this.props.location.query.task_id },
      'delete'
    )
  }

  render() {
    const { failedDeleteList } = store

    return (
      <BoxTable
        info={
          <BoxTable.Info>
            <TableTotalText
              data={[
                {
                  label: i18next.t('商品总数'),
                  content: failedDeleteList.length,
                },
              ]}
            />
          </BoxTable.Info>
        }
      >
        <Table
          defaultPageSize={9999}
          data={failedDeleteList}
          columns={[
            {
              Header: i18next.t('商品名称'),
              id: 'sku_id',
              accessor: (d) => d.sku_name + '(' + d.sku_id + ')',
            },
            {
              Header: i18next.t('报价单'),
              id: 'salemenu_id',
              accessor: (d) => d.salemenu_name + '(' + d.salemenu_id + ')',
            },
            {
              Header: i18next.t('单价（基本单位）'),
              id: 'std_sale_price_forsale',
              accessor: (d) =>
                Big(d.std_sale_price_forsale).div(100).toFixed(2) +
                Price.getUnit(d.fee_type) +
                '/' +
                d.std_unit_name_forsale,
            },
            {
              Header: i18next.t('订单号'),
              id: 'order_id',
              accessor: (d) => {
                return (
                  <a
                    href={`#/order_manage/order/list/detail?${qs.stringify({
                      id: d.order_id,
                    })}`}
                    style={{ textDecoration: 'underline' }}
                    // eslint-disable-next-line react/jsx-no-target-blank
                    target='_blank'
                  >
                    {d.order_id}
                  </a>
                )
              },
            },
            {
              Header: i18next.t('商户名'),
              id: 'address_id',
              accessor: (d) => d.resname + '(' + d.address_id + ')',
            },
            {
              Header: i18next.t('失败原因'),
              id: 'err_msg',
              accessor: (d) => <p className='gm-text-red'>{d.err_msg}</p>,
            },
          ]}
          keyField='_skuId'
        />
      </BoxTable>
    )
  }
}

export default DeleteResult
