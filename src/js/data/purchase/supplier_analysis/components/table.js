import React, { useEffect, useRef, useState } from 'react'
import { i18next } from 'gm-i18n'
import { observer } from 'mobx-react'
import { ManagePaginationV2 } from '@gmfe/business'
import { TableX } from '@gmfe/table-x'
import store from '../store'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { t } from 'gm-i18n'
import Panel from 'common/components/dashboard/panel'

const List = ({ className }) => {
  const { filter } = store
  const paginationRef = useRef()

  const [list, setList] = useState([])

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchList()
  }, [filter])

  const fetchList = () => {
    setLoading(true)
    setList([{}])
    setLoading(false)
  }

  return (
    <Panel title={t('表格')} className={classNames('gm-bg', className)}>
      <ManagePaginationV2
        id='settle_sheet_list'
        ref={paginationRef}
        onRequest={fetchList}
      >
        <TableX
          data={list}
          keyField='id'
          loading={loading}
          columns={[
            {
              Header: i18next.t('121321'),
              accessor: 'date_time',
            },
            {
              Header: i18next.t('结款单号'),
              width: '250',
            },
            {
              Header: i18next.t('供应商'),
              accessor: 'settle_supplier_name',
            },
            {
              Header: i18next.t('单据总金额'),
              accessor: 'total_price',
            },
            {
              Header: i18next.t('结算周期'),
              accessor: 'pay_method',
            },
            {
              Header: i18next.t('结款单状态'),
              accessor: 'status',
            },
            {
              Header: i18next.t('单据打印'),
              id: 'print_action',
              width: 80,
            },
          ]}
        />
      </ManagePaginationV2>
    </Panel>
  )
}

List.propTypes = {
  xxxx: PropTypes.bool,
  className: PropTypes.string,
}

export default observer(List)
