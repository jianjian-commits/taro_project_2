import React, { useRef, useState, useEffect } from 'react'
import { ManagePagination } from '@gmfe/business'
import { TableX, TableXUtil } from '@gmfe/table-x'
import { t } from 'gm-i18n'
import { Price } from '@gmfe/react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Panel from 'common/components/dashboard/panel'
import store from '../../stores/goods_detail'
import { observer } from 'mobx-react'
import moment from 'moment'
import Big from 'big.js'
const BTable = ({ className }) => {
  const paginationRef = useRef(null)
  const [data, setData] = useState([])
  const { filter, sortField, sortDirection } = store

  useEffect(() => {
    paginationRef.current && paginationRef.current.apiDoFirstRequest()
  }, [filter, sortField, sortDirection])

  const handleSort = (field, direction) => {
    store.changeExportFiled(field, direction || 'asc')
  }

  const handlePage = (pagination) => {
    return store.fetchSaleTableList(pagination).then((list) => {
      setData(list.data || [])
      return list
    })
  }

  return (
    <Panel title={t('明细表')} className={classNames('gm-bg', className)}>
      <ManagePagination
        id='pagination_in_finance_payment_accounts_detail_list'
        onRequest={handlePage}
        ref={(ref) => (paginationRef.current = ref)}
      >
        <TableX
          data={data}
          columns={[
            {
              id: 'order_time',
              accessor: (d) => moment(d.order_time).format('YYYY-MM-DD'),
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
            },
            {
              id: 'quantity',
              accessor: (d) =>
                Big(d.std_quantity_forsale).toFixed(2) +
                d.sku_std_unit_name_forsale,
              Header: (
                <div>
                  {t('下单数（基本单位）')}
                  <TableXUtil.SortHeader
                    onChange={(direction) => handleSort('quantity', direction)}
                    type={sortField === 'quantity' ? sortDirection : null}
                  />
                </div>
              ),
            },
            {
              id: 'sku_std_outstock_quantity_forsale',
              Header: (
                <div>
                  {t('出库数（基本单位）')}
                  <TableXUtil.SortHeader
                    onChange={(direction) =>
                      handleSort('sku_std_outstock_quantity_forsale', direction)
                    }
                    type={
                      sortField === 'sku_std_outstock_quantity_forsale'
                        ? sortDirection
                        : null
                    }
                  />
                </div>
              ),
              accessor: (d) =>
                Big(d.sku_std_outstock_quantity_forsale).toFixed(2) +
                d.sku_std_unit_name_forsale,
            },
            {
              id: 'order_price',
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
              accessor: (d) => Big(d.order_price).toFixed(2) + Price.getUnit(),
            },
            {
              id: 'outstock_price',
              Header: (
                <div>
                  {t('出库金额')}
                  <TableXUtil.SortHeader
                    onChange={(direction) =>
                      handleSort('outstock_price', direction)
                    }
                    type={sortField === 'outstock_price' ? sortDirection : null}
                  />
                </div>
              ),
              accessor: (d) =>
                Big(d.outstock_price).toFixed(2) + Price.getUnit(),
            },

            {
              id: 'tax',
              Header: (
                <div>
                  {t('税额')}
                  <TableXUtil.SortHeader
                    onChange={(direction) => handleSort('tax', direction)}
                    type={sortField === 'tax' ? sortDirection : null}
                  />
                </div>
              ),
              accessor: (d) => Big(d.tax).toFixed(2) + Price.getUnit(),
            },
            {
              id: 'account_price',
              Header: (
                <div>
                  {t('销售额（不含运费）')}
                  <TableXUtil.SortHeader
                    onChange={(direction) =>
                      handleSort('account_price', direction)
                    }
                    type={sortField === 'account_price' ? sortDirection : null}
                  />
                </div>
              ),
              accessor: (d) =>
                Big(d.account_price).toFixed(2) + Price.getUnit(),
            },
            {
              id: 'saleProfit',
              Header: (
                <div>
                  {t('销售毛利（不含运费）')}
                  <TableXUtil.SortHeader
                    onChange={(direction) =>
                      handleSort('saleProfit', direction)
                    }
                    type={sortField === 'saleProfit' ? sortDirection : null}
                  />
                </div>
              ),
              accessor: (d) => Big(d.saleProfit).toFixed(2) + Price.getUnit(),
            },
            {
              id: 'saleProfitRate',
              Header: (
                <div>
                  {t('销售毛利率（不含运费）')}
                  <TableXUtil.SortHeader
                    onChange={(direction) =>
                      handleSort('saleProfitRate', direction)
                    }
                    type={sortField === 'saleProfitRate' ? sortDirection : null}
                  />
                </div>
              ),
              accessor: (d) => Big(d.saleProfitRate).toFixed(2) + '%',
            },
          ]}
        />
      </ManagePagination>
    </Panel>
  )
}

BTable.propTypes = {
  xxxx: PropTypes.bool,
  className: PropTypes.string,
}
export default observer(BTable)
