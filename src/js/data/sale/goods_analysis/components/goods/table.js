import React, { useRef, useState, useEffect } from 'react'
import { Flex, Price } from '@gmfe/react'
import { ManagePagination } from '@gmfe/business'
import { TableX, TableXUtil } from '@gmfe/table-x'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Panel from 'common/components/dashboard/panel'
import store from '../../stores/goods'
import Big from 'big.js'
import { observer } from 'mobx-react'
import moment from 'moment'
// Price.getUnit
const BTable = ({ className }) => {
  const { filter, sortField, sortDirection } = store
  const [data, setData] = useState([])
  const paginationRef = useRef(null)

  useEffect(() => {
    paginationRef.current && paginationRef.current.apiDoFirstRequest()
  }, [filter, sortField, sortDirection])

  const handleSort = (field, direction) => {
    // 改变mobx里面的值
    store.changeExportFiled(field, direction || 'asc')
  }

  const fetchList = (pagination) => {
    return store.fetchSaleTableList(pagination).then((res) => {
      setData(res.data || [])
      return res
    })
  }

  const handleDetail = ({ sku_id, salemenu_id }) => {
    window.open(
      `/#/data/sale/goods_analysis/goods_detail?sku_id=${sku_id}&salemenu_id=${salemenu_id}&begin_time=${moment(
        filter.begin_time,
      ).format('YYYY-MM-DD')}&end_time=${moment(filter.end_time).format(
        'YYYY-MM-DD',
      )}`,
      '_blank',
    )
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
              width: 150,
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
              width: 150,
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
              width: 150,
              accessor: 'pinlei_id_name',
              Header: (
                <div>
                  {t('品类')}
                  {/* <TableXUtil.SortHeader
                    onChange={(direction) =>
                      handleSort('pinlei_id_name', direction)
                    }
                    type={sortField === 'pinlei_id_name' ? sortDirection : null}
                  /> */}
                </div>
              ),
            },
            {
              width: 150,
              accessor: 'spu_id_name',
              Header: t('商品名称'),
            },
            {
              width: 150,
              accessor: 'spu_id',
              Header: (
                <div>
                  {t('商品ID')}
                  <TableXUtil.SortHeader
                    onChange={(direction) => handleSort('shop_id', direction)}
                    type={sortField === 'shop_id' ? sortDirection : null}
                  />
                </div>
              ),
            },
            {
              width: 150,
              accessor: 'sku_name',
              Header: t('规格名称'),
            },
            {
              width: 150,
              accessor: 'sku_id',
              Header: (
                <div>
                  {t('规格ID')}
                  <TableXUtil.SortHeader
                    onChange={(direction) => handleSort('skuid', direction)}
                    type={sortField === 'skuid' ? sortDirection : null}
                  />
                </div>
              ),
            },
            {
              width: 150,
              id: 'sale_ratio',
              Header: <div>{t('销售规格')}</div>,
              accessor: (d) => (
                <span>
                  {d.sku_sale_ratio == 1
                    ? `按${d.sku_std_unit_name_forsale}`
                    : d.sku_std_unit_name_forsale === d.sku_sale_unit_name
                    ? Big(d.sku_sale_ratio) + d.sku_std_unit_name_forsale
                    : Big(d.sku_sale_ratio) +
                      d.sku_std_unit_name_forsale +
                      '/' +
                      d.sku_sale_unit_name}
                </span>
              ),
            },
            {
              width: 150,
              id: 'quantity',
              Header: (
                <div>
                  {t('下单数（基本单位）')}
                  <TableXUtil.SortHeader
                    onChange={(direction) => handleSort('quantity', direction)}
                    type={sortField === 'quantity' ? sortDirection : null}
                  />
                </div>
              ),
              accessor: (d) =>
                Big(d.std_quantity_forsale).toFixed(2) +
                d.sku_std_unit_name_forsale,
            },
            {
              width: 150,
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
              width: 150,
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
              width: 150,
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
              width: 150,
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
              width: 150,
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
              width: 180,
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
              width: 180,
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
            {
              width: 80,
              Header: TableXUtil.OperationHeader,
              fixed: 'right',
              accessor: 'operator',
              // eslint-disable-next-line react/prop-types
              Cell: ({ row: { original } }) => (
                <TableXUtil.OperationCell>
                  <Flex alignCenter justifyCenter>
                    <TableXUtil.OperationDetail
                      onClick={() => handleDetail(original)}
                    />
                  </Flex>
                </TableXUtil.OperationCell>
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
