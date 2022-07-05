import React, { useRef, useEffect } from 'react'
import { observer } from 'mobx-react'
import { t } from 'gm-i18n'
import { BoxTable, Price } from '@gmfe/react'
import { TableX } from '@gmfe/table-x'
import TableTotalText from 'common/components/table_total_text'
import store from './store'
import { ManagePaginationV2 } from '@gmfe/business'
import { WithBreadCrumbs } from 'common/service'

const SettlementStatus = {
  1: t('待结算'),
  2: t('已结算')
}

const DetailList = props => {
  const { unsettle_money, total_settle_money, details } = store
  const { distributor_id } = props.location.query
  const pagination = useRef(null)

  useEffect(() => {
    store.setDoFirstRequest(pagination.current.apiDoFirstRequest)
    pagination.current.apiDoFirstRequest()
  }, [])

  const handleSearch = pagination => {
    store.fetchNumber(distributor_id)
    return store.fetchList(pagination, distributor_id)
  }

  return (
    <>
      <WithBreadCrumbs breadcrumbs={[t('佣金明细')]} />
      <BoxTable
        info={
          <BoxTable.Info>
            <TableTotalText
              data={[
                {
                  label: t('结算列表'),
                  content: details ? details.length : 0
                },
                {
                  label: t('总结算金额'),
                  content: Price.getCurrency() + total_settle_money
                },
                {
                  label: t('待结算金额'),
                  content: Price.getCurrency() + unsettle_money
                }
              ]}
            />
          </BoxTable.Info>
        }
      >
        <ManagePaginationV2
          id='commander_settlement_details'
          ref={pagination}
          onRequest={handleSearch}
        >
          <TableX
            data={details.slice()}
            columns={[
              {
                Header: t('订单号'),
                accessor: 'order_id'
              },
              {
                Header: t('下单时间'),
                accessor: 'order_time'
              },
              {
                Header: t('用户名'),
                accessor: 'customer_name'
              },
              {
                Header: t('销售额（不含运费）'),
                accessor: 'order_price'
              },
              {
                Header: t('佣金比例'),
                id: 'scale',
                accessor: d => `${d.scale} %`
              },
              {
                Header: t('应结佣金'),
                accessor: 'commission'
              },
              {
                Header: t('结算时间'),
                accessor: 'settle_time'
              },
              {
                Header: t('结算状态'),
                accessor: d => SettlementStatus[d.status]
              }
            ]}
          />
        </ManagePaginationV2>
      </BoxTable>
    </>
  )
}

export default observer(DetailList)
