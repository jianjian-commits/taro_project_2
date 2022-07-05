import React, { useRef, useState, useEffect } from 'react'
import { Price } from '@gmfe/react'
import { ManagePagination } from '@gmfe/business'
import { TableX, TableXUtil } from '@gmfe/table-x'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import Panel from 'common/components/dashboard/panel'
import store from '../../stores/category'
import Big from 'big.js'

const BTable = ({ className }) => {
  const paginationRef = useRef(null)
  const { filter, sortField, sortDirection } = store

  const [data, setData] = useState([])

  useEffect(() => {
    paginationRef.current && paginationRef.current.apiDoFirstRequest()
  }, [filter, sortField, sortDirection])

  const handleSort = (field, direction) => {
    // 改变mobx里面的值
    store.changeExportFiled(field, direction || 'asc')
  }

  const fetchList = (pagination) => {
    return store.fetchTableList(pagination).then((res) => {
      setData(res.data || [])
      return res
    })
  }

  return (
    <Panel title={t('明细表')} className={classNames('gm-bg', className)}>
      <ManagePagination
        id='pagination_in_finance_payment_accounts_detail_list'
        onRequest={fetchList}
        ref={(ref) => (paginationRef.current = ref)}
      >
        <TableX
          data={data}
          columns={[
            {
              accessor: 'category_id_1_name',
              Header: (
                <div>
                  {t('一级分类')}
                  {/* <TableXUtil.SortHeader
                    onChange={(direction) =>
                      handleSort('category_id_1_name', direction)
                    }
                    type={
                      sortField === 'category_id_1_name' ? sortDirection : null
                    }
                  /> */}
                </div>
              ),
            },
            {
              accessor: 'category_id_2_name',
              Header: (
                <div>
                  {t('二级分类')}
                  {/* <TableXUtil.SortHeader
                    onChange={(direction) =>
                      handleSort('category_id_2_name', direction)
                    }
                    type={
                      sortField === 'category_id_2_name' ? sortDirection : null
                    }
                  /> */}
                </div>
              ),
            },
            {
              accessor: 'pinlei_id_name',
              Header: (
                <div>
                  {t('品类')}
                  <TableXUtil.SortHeader
                    onChange={(direction) =>
                      handleSort('pinlei_id_name', direction)
                    }
                    type={sortField === 'pinlei_id_name' ? sortDirection : null}
                  />
                </div>
              ),
            },
            {
              id: 'order_price',
              accessor: (d) => Big(d.order_price).toFixed(2) + Price.getUnit(),
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
              id: 'outstock_price',
              accessor: (d) =>
                Big(d.account_price || 0).toFixed(2) + Price.getUnit(),
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
            },

            {
              id: 'tax',
              width: 80,
              Header: t('税额'),
              accessor: (d) => Big(d.tax).toFixed(2) + Price.getUnit(),
            },
            {
              id: 'account_price',
              accessor: (d) =>
                Big(d.account_price || 0).toFixed(2) + Price.getUnit(),
              width: 150,
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
            },
            {
              id: 'saleProfit',
              accessor: (d) =>
                Big(d.saleProfit || 0).toFixed(2) + Price.getUnit(),
              width: 180,
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
            },
            {
              id: 'saleProfitRate',
              accessor: (d) => Big(d.saleProfitRate || 0).toFixed(2) + '%',
              width: 180,
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
