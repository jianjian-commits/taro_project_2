import { i18next } from 'gm-i18n'
import React from 'react'
import { BoxTable } from '@gmfe/react'
import { Table } from '@gmfe/table'
import Big from 'big.js'
import qs from 'query-string'

import TableTotalText from 'common/components/table_total_text'

import store from './view_sku/store'
import { observer } from 'mobx-react'
@observer
class ReplaceResult extends React.Component {
  componentDidMount() {
    store.getFaildSkuResult(
      { task_id: this.props.location.query.task_id },
      'change'
    )
  }

  render() {
    const { failedReplaceList } = store

    return (
      <BoxTable
        info={
          <BoxTable.Info>
            <TableTotalText
              data={[
                {
                  label: i18next.t('商品总数'),
                  content: failedReplaceList.length,
                },
              ]}
            />
          </BoxTable.Info>
        }
      >
        <Table
          defaultPageSize={9999}
          data={failedReplaceList}
          columns={[
            {
              Header: i18next.t('商品名称'),
              accessor: 'name',
              Cell: ({ original }) => {
                return (
                  <div>
                    <p className='gm-padding-left-5'>{original.sku_name}</p>
                    <p>{original.sku_id}</p>
                  </div>
                )
              },
            },
            {
              Header: i18next.t('规格'),
              id: 'specification',
              Cell: ({ original: sku }) => {
                return sku.sku_std_unit_name_forsale ===
                  sku.sku_sale_unit_name && sku.sku_sale_ratio === 1
                  ? i18next.t('KEY6', { VAR1: sku.sku_std_unit_name_forsale })
                  : sku.sku_sale_ratio +
                      sku.sku_std_unit_name_forsale +
                      '/' +
                      sku.sku_sale_unit_name
              },
            },
            {
              Header: i18next.t('报价单'),
              accessor: 'sku_salemenu_name',
              Cell: ({ original, value }) => {
                return (
                  <div>
                    {value}
                    <br />
                    <span className='b-sheet-item-disable'>
                      {original.sku_salemenu_id}
                    </span>
                  </div>
                )
              },
            },
            {
              Header: i18next.t('下单数'),
              accessor: 'origin_quantity',
              Cell: ({ value, original }) => {
                return value
                  ? parseFloat(Big(value).toFixed(2), 10) +
                      original.sku_sale_unit_name
                  : '-'
              },
            },
            {
              Header: i18next.t('订单'),
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
              Header: i18next.t('替换商品'),
              accessor: 'new_sku_name',
            },
            {
              Header: i18next.t('替换商品规格'),
              id: 'new_specification',
              Cell: ({ original: sku }) => {
                return sku.new_sku_std_unit_name_forsale ===
                  sku.new_sku_sale_unit_name && sku.new_sku_sale_ratio === 1
                  ? i18next.t('KEY6', {
                      VAR1: sku.new_sku_std_unit_name_forsale,
                    })
                  : sku.new_sku_sale_ratio +
                      sku.new_sku_std_unit_name_forsale +
                      '/' +
                      sku.new_sku_sale_unit_name
              },
            },
            {
              Header: i18next.t('替换数量'),
              id: 'change_quantity',
              accessor: (d) => d.change_quantity + d.new_sku_sale_unit_name,
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

export default ReplaceResult
