import React, { useRef, useState, useEffect } from 'react'
import { Flex, Price } from '@gmfe/react'
import { ManagePagination } from '@gmfe/business'
import { TableX, TableXUtil } from '@gmfe/table-x'
import { t } from 'gm-i18n'
import { observer } from 'mobx-react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Panel from 'common/components/dashboard/panel'
import store from '../../stores/index'
import { requestTableDataFromMerchant } from '../../service'
import Big from 'big.js'
import { convertNumber2Sid } from 'common/filter'
import { COUNT_LIST_ENUM } from '../../../constants'
import moment from 'moment'
import { history } from 'common/service'

const BTable = ({ className }) => {
  const { filter, sortField, sortDirection } = store
  const paginationRef = useRef(null)
  const [data, setData] = useState([])

  useEffect(() => {
    paginationRef.current && paginationRef.current.apiDoFirstRequest()
  }, [filter, sortField, sortDirection])

  const handleSort = (field, direction) => {
    // 改变mobx里面的值
    store.changeExportFiled(field, direction || 'asc')
  }

  const fetchList = (pagination) => {
    const params = {
      ...store.getParams(),
    }

    // reverse = 0, // 1表示逆序，不传或传0表示正序
    params.query_expr.reverse = sortDirection === 'desc' ? 1 : 0
    return requestTableDataFromMerchant(
      params,
      pagination,
      COUNT_LIST_ENUM[sortField],
    ).then((res) => {
      setData(res.data || [])
      return res
    })
  }

  const handleDetail = (id) => {
    history.push(
      `/data/sale/merchant_analysis/detail?id=${id}&begin=${moment(
        filter.begin_time,
      ).format('YYYY-MM-DD')}&end=${moment(filter.end_time).format(
        'YYYY-MM-DD',
      )}`,
    )
  }

  return (
    <Panel title={t('明细表')} className={classNames('gm-bg', className)}>
      <ManagePagination
        id='pagination_merchant_analysis_list'
        onRequest={fetchList}
        ref={(ref) => (paginationRef.current = ref)}
      >
        <TableX
          data={data}
          columns={[
            {
              Header: t('商户ID'),
              accessor: 'shop_id',
              width: 150,
              Cell: (cellProps) =>
                convertNumber2Sid(cellProps.row.original.shop_id),
            },
            {
              Header: t('账号ID'),
              accessor: (d) => 'K' + d.user_id,
              width: 150,
            },
            {
              Header: t('商户名'),
              accessor: 'shop_name',
              width: 150,
            },
            {
              accessor: 'area_id_name',
              Header: (
                <div>
                  <span>{t('地理标签')}</span>
                  {/* <TableXUtil.SortHeader
                    onChange={(direction) => handleSort('area_id', direction)}
                    type={sortField === 'area_id' ? sortDirection : null}
                  /> */}
                </div>
              ),
              width: 150,
              Cell: ({ row: { original } }) =>
                original.district_code_name + '-' + original.area_id_name ||
                '-',
            },
            {
              accessor: 'route_id',
              Header: (
                <div>
                  <span>{t('线路')}</span>
                  {/* <TableXUtil.SortHeader
                    onChange={(direction) => handleSort('route_id', direction)}
                    type={sortField === 'route_id' ? sortDirection : null}
                  /> */}
                </div>
              ),
              width: 150,
              Cell: ({ row: { original } }) => original.route_id_name || '-',
            },
            {
              id: 'receiver_name',
              Header: t('收货人'),
              accessor: (d) => d.receiver_name || '-',
              width: 150,
            },
            {
              id: 'receiver_phone',
              Header: t('收货人电话'),
              accessor: (d) => d.receiver_phone,
              width: 150,
            },
            {
              id: 'sales_emp_id',
              Header: t('销售经理'),
              accessor: (d) => d.sales_emp_id_name || '-',
              width: 150,
            },
            {
              accessor: 'old_order_id',
              Header: (
                <div>
                  <span> {t('订单数')}</span>
                  <TableXUtil.SortHeader
                    onChange={(direction) =>
                      handleSort('old_order_id', direction)
                    }
                    type={sortField === 'old_order_id' ? sortDirection : null}
                  />
                </div>
              ),
              width: 150,
            },
            {
              id: 'order_price',
              accessor: (d) =>
                Big(d.order_price || 0).toFixed(2) + Price.getUnit(),
              Header: (
                <div>
                  <span> {t('下单金额')}</span>
                  <TableXUtil.SortHeader
                    onChange={(direction) =>
                      handleSort('order_price', direction)
                    }
                    type={sortField === 'order_price' ? sortDirection : null}
                  />
                </div>
              ),
              width: 150,
            },
            {
              id: 'account_price',
              accessor: (d) =>
                Big(d.account_price || 0).toFixed(2) + Price.getUnit(),
              Header: (
                <div>
                  <span> {t('销售金额')}</span>
                  <TableXUtil.SortHeader
                    onChange={(direction) =>
                      handleSort('account_price', direction)
                    }
                    type={sortField === 'account_price' ? sortDirection : null}
                  />
                </div>
              ),
              width: 150,
            },
            {
              id: 'saleProfit',
              accessor: (d) => Big(d.saleProfit).toFixed(2) + Price.getUnit(),
              Header: (
                <div>
                  <span> {t('销售毛利')}</span>
                  <TableXUtil.SortHeader
                    onChange={(direction) =>
                      handleSort('saleProfit', direction)
                    }
                    type={sortField === 'saleProfit' ? sortDirection : null}
                  />
                </div>
              ),
              width: 150,
            },
            {
              id: 'saleProfitRate',
              accessor: (d) => Big(d.saleProfitRate).toFixed(2) + '%',
              Header: (
                <div>
                  <span>{t('销售毛利率')}</span>
                  <TableXUtil.SortHeader
                    onChange={(direction) =>
                      handleSort('saleProfitRate', direction)
                    }
                    type={sortField === 'saleProfitRate' ? sortDirection : null}
                  />
                </div>
              ),
              width: 150,
            },
            {
              width: 80,
              Header: TableXUtil.OperationHeader,
              accessor: 'operator',
              fixed: 'right',
              // eslint-disable-next-line react/prop-types
              Cell: ({ row: { original } }) => (
                <TableXUtil.OperationCell>
                  <Flex alignCenter justifyCenter>
                    <TableXUtil.OperationDetail
                      onClick={() => handleDetail(original.shop_id)}
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
