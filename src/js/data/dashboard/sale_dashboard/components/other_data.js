import React, { useState, useEffect } from 'react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { observer } from 'mobx-react'
import Panel from 'common/components/dashboard/panel'
import Box from 'common/components/dashboard/box'
import Grid from 'common/components/grid'
import store from '../store'
import { requestSaleOtherData } from '../service'

const data = [
  {
    text: t('新增客户数(个）'), // 暂无
    field: 'newAddress',
    value: 0,
    isNumber: true,
  },
  {
    text: t('客户复购率(%)'), // 暂无
    field: 'repeatCustomers',
    value: 0,
    isNumber: true,
    isPercent: true,
  },
  {
    text: t('售后订单数(个)'),
    field: 'afterSaleOrder',
    value: 0,
    isNumber: true,
  },
  {
    text: t('售后商品数(件)'),
    field: 'afterSaleGoods',
    value: 0,
    isNumber: true,
  },
]

const OtherData = ({ className }) => {
  const { filter } = store
  const [otherData, setOtherData] = useState([])
  useEffect(() => {
    fetchOtherData()
  }, [filter])

  const fetchOtherData = () => {
    requestSaleOtherData(store.getParams()).then((data) => {
      setOtherData(data)
    })
  }
  return (
    <Panel
      title={t('其他数据')}
      className={classNames('gm-bg gm-flex gm-flex-column', className)}
    >
      <Grid className='gm-bg gm-padding-0 gm-flex-flex' column={2}>
        {data.map((d) => {
          d = { ...d, ...(otherData[d.field] || {}) }
          return (
            <Box
              className='b-grid-span-1'
              style={{ width: 'auto' }}
              data={d}
              key={d.field}
            />
          )
        })}
      </Grid>
    </Panel>
  )
}

OtherData.propTypes = {
  xxxx: PropTypes.bool,
  className: PropTypes.string,
}
export default observer(OtherData)
