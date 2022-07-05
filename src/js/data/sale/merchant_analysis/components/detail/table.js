import React, { useRef, useEffect } from 'react'
import { ManagePagination } from '@gmfe/business'
import { TableX, TableXUtil } from '@gmfe/table-x'
import { t } from 'gm-i18n'
import { Price } from '@gmfe/react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import Panel from 'common/components/dashboard/panel'
import moment from 'moment'
import store from '../../stores/detail'
import Big from 'big.js'

const BTable = ({ className }) => {
  const { filter, tableList, sortField, sortDirection } = store
  const paginationRef = useRef(null)
  useEffect(() => {
    paginationRef.current && paginationRef.current.apiDoFirstRequest()
  }, [filter, sortField, sortDirection])

  // 第一个参数是根据EMUN找到对应的排序号， 第二个是正反排序
  const handleSort = (sortField, sortDirection) => {
    store.changeExportFiled(sortField, sortDirection || 'asc')
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
          data={tableList.slice()}
          columns={[
            {
              accessor: 'order_time',
              Header: (
                <div>
                  {t('日期')}
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
              }) =>
                moment(
                  filter.type === 'order_time'
                    ? order_time
                    : receive_begin_time,
                ).format('YYYY-MM-DD'),
            },
            {
              Header: t('商户名'),
              accessor: 'shop_name',
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
                Big(d.order_price || 0).toFixed(2) + Price.getUnit(),
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
              id: 'account_price',
              accessor: (d) =>
                Big(d.account_price || 0).toFixed(2) + Price.getUnit(),
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
            {
              id: 'delta_money',
              accessor: (d) =>
                Big(Number(d.order_price))
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
