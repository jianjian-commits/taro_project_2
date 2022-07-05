import React, { useRef, useEffect } from 'react'
import { Price } from '@gmfe/react'
import { ManagePagination } from '@gmfe/business'
import { TableX, TableXUtil } from '@gmfe/table-x'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Panel from 'common/components/dashboard/panel'
import store from '../store'
import moment from 'moment'
import Big from 'big.js'
import { observer } from 'mobx-react'

const BTable = ({ className }) => {
  const { filter, sortDirection, sortField } = store

  const paginationRef = useRef(null)

  useEffect(() => {
    paginationRef.current && paginationRef.current.apiDoFirstRequest()
  }, [filter, sortDirection, sortField])

  const handleSort = (field, direction) => {
    store.changeExportFiled(field, direction || 'asc')
  }

  const fetchList = (pagination) => {
    return store.fetchTableList(pagination)
  }

  return (
    <Panel title={t('明细表')} className={classNames('gm-bg', className)}>
      <ManagePagination
        id='pagination_in_finance_payment_accounts_detail_list'
        onRequest={fetchList}
        ref={(ref) => (paginationRef.current = ref)}
      >
        <TableX
          data={store.tableList.slice()}
          columns={[
            {
              accessor: 'order_time',
              Header: (
                <div>
                  {t('时间')}
                  <TableXUtil.SortHeader
                    onChange={(direction) =>
                      handleSort('order_time', direction)
                    }
                    type={sortField === 'order_time' ? sortDirection : null}
                  />
                </div>
              ),
              Cell: ({
                row: {
                  original: { order_time, receive_begin_time },
                },
              }) => {
                return moment(
                  filter.type === 'order_time'
                    ? order_time
                    : receive_begin_time,
                ).format('YYYY-MM-DD')
              },
            },
            {
              accessor: 'old_order_id',
              Header: (
                <div>
                  {t('订单数')}
                  <TableXUtil.SortHeader
                    onChange={(direction) =>
                      handleSort('old_order_id', direction)
                    }
                    type={sortField === 'old_order_id' ? sortDirection : null}
                  />
                </div>
              ),
            },
            {
              id: 'order_price',
              accessor: (d) =>
                +Big(d.order_price || 0).toFixed(2) + Price.getUnit(),
              Header: (
                <div>
                  {t('下单金额')}
                  <TableXUtil.SortHeader
                    onChange={(direction) =>
                      handleSort('order_price', direction)
                    }
                    type={sortField === 'order_price' ? sortDirection : null}
                  />
                </div>
              ),
            },
            {
              id: 'shop_id',
              accessor: (d) => +Big(d.shop_id || 0),
              Header: (
                <div>
                  {t('下单商户数')}
                  <TableXUtil.SortHeader
                    onChange={(direction) => handleSort('shop_id', direction)}
                    type={sortField === 'shop_id' ? sortDirection : null}
                  />
                </div>
              ),
            },
            {
              id: 'account_price',
              accessor: (d) =>
                +Big(d.account_price || 0).toFixed(2) + Price.getUnit(),
              Header: (
                <div>
                  {t('销售金额')}
                  <TableXUtil.SortHeader
                    onChange={(direction) =>
                      handleSort('account_price', direction)
                    }
                    type={sortField === 'account_price' ? sortDirection : null}
                  />
                </div>
              ),
            },
            {
              id: 'saleProfit',
              accessor: (d) => Big(d.saleProfit).toFixed(2) + Price.getUnit(),
              Header: (
                <div>
                  {t('销售毛利')}
                  <TableXUtil.SortHeader
                    onChange={(direction) =>
                      handleSort('saleProfit', direction)
                    }
                    type={sortField === 'saleProfit' ? sortDirection : null}
                  />
                </div>
              ),
            },
            {
              width: 160,
              id: 'saleProfitRate',
              accessor: (d) => Big(d.saleProfitRate).toFixed(2) + '%',
              Header: (
                <div>
                  {t('销售毛利率')}
                  <TableXUtil.SortHeader
                    onChange={(direction) =>
                      handleSort('saleProfitRate', direction)
                    }
                    type={sortField === 'saleProfitRate' ? sortDirection : null}
                  />
                </div>
              ),
            },
            // 客单价需要前端计算，公式为：客单价 = 下单金额 / 商户数
            {
              width: 180,
              id: 'avg_customer_price',
              accessor: (d) =>
                Big(d.order_price)
                  .div(Number(d.shop_id) || 1)
                  .toFixed(2) + Price.getUnit(),
              Header: (
                <div>
                  {t('客单价')}
                  <TableXUtil.SortHeader
                    onChange={(direction) =>
                      handleSort('avg_customer_price', direction)
                    }
                    type={
                      sortField === 'avg_customer_price' ? sortDirection : null
                    }
                  />
                </div>
              ),
            },
            // 笔单价需要前端计算，公式为：笔单价 = 下单金额 / 订单数
            {
              width: 180,
              id: 'delta_money',
              accessor: (d) =>
                Big(d.order_price)
                  .div(Number(d.old_order_id) || 1)
                  .toFixed(2) + Price.getUnit(),
              Header: (
                <div>
                  {t('笔单价')}
                  <TableXUtil.SortHeader
                    onChange={(direction) =>
                      handleSort('delta_money', direction)
                    }
                    type={sortField === 'delta_money' ? sortDirection : null}
                  />
                </div>
              ),
            },
          ]}
        />
      </ManagePagination>
    </Panel>
  )
}

BTable.propTypes = {
  className: PropTypes.string,
}
export default observer(BTable)
