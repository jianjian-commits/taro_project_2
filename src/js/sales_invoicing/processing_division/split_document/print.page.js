import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Request } from '@gm-common/request'
import { t } from 'gm-i18n'
import Big from 'big.js'
import moment from 'moment'
import _ from 'lodash'

import { withRouter } from 'common/service'
import { SPLIT_SHEET_STATUS } from 'common/enum'

const Print = ({ location }) => {
  const hasPrinted = useRef(false)
  const [details, setDetails] = useState({})

  useEffect(() => {
    const { id } = location.query
    Request('/stock/split/sheet/detail')
      .data({ id })
      .get()
      .then(({ data }) => {
        setDetails(data)
      })
  }, [location.query])

  useLayoutEffect(() => {
    if (!_.isEmpty(details) && !hasPrinted.current) {
      window.print()
      hasPrinted.current = true
    }
  }, [details])

  let total = 0
  // eslint-disable-next-line no-unused-expressions
  details.gain_spus?.forEach((item) => {
    total = Big(total).plus(item.real_quantity)
  })

  return (
    <table className='table table-bordered b-split-document-print'>
      <thead>
        <tr className='title'>
          <th colSpan={4}>{t('分割单')}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{t('单号')}</td>
          <td>{details.sheet_no}</td>
          <td>{t('创建时间')}</td>
          <td>{moment(details.create_time).format('YYYY-MM-DD HH:mm:ss')}</td>
        </tr>
        <tr>
          <td>{t('分割损耗')}</td>
          <td colSpan={3}>{Big(details.split_loss || 0).toFixed(2)}</td>
        </tr>
        <tr>
          <td>{t('状态')}</td>
          <td>{SPLIT_SHEET_STATUS[details.status]}</td>
          <td>{t('操作人')}</td>
          <td>{details.operator}</td>
        </tr>
      </tbody>
      <thead>
        <tr className='title'>
          <th colSpan={4}>{t('待分割品信息')}</th>
        </tr>
        <tr>
          <th>{t('待分割品ID')}</th>
          <th>{t('待分割品名称')}</th>
          <th>{t('单位')}</th>
          <th>{t('消耗量')}</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>{details.source_spu?.spu_id}</td>
          <td>{details.source_spu?.spu_name}</td>
          <td>{details.source_spu?.std_unit_name}</td>
          <td>{Big(details.source_spu?.quantity || 0).toFixed(2)}</td>
        </tr>
      </tbody>
      <thead>
        <tr className='title'>
          <th colSpan={4}>{t('获得品信息')}</th>
        </tr>
        <tr>
          <th>{t('获得品ID')}</th>
          <th>{t('获得品名称')}</th>
          <th>{t('单位')}</th>
          <th>{t('实际获得量')}</th>
        </tr>
      </thead>
      <tbody>
        {details.gain_spus?.map((item) => (
          <tr key={item.spu_id}>
            <td>{item.spu_id}</td>
            <td>{item.spu_name}</td>
            <td>{item.std_unit_name}</td>
            <td>{Big(item.real_quantity || 0).toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td>{t('合计')}</td>
          <td colSpan={2} />
          <td>{Big(total).toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
  )
}

Print.propTypes = {
  location: PropTypes.object,
}

export default withRouter(Print)
