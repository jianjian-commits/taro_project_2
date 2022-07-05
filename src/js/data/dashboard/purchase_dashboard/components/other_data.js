import React, { useState, useEffect } from 'react'
import { t } from 'gm-i18n'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import Panel from 'common/components/dashboard/panel'
import Box from 'common/components/dashboard/box'
import Grid from 'common/components/grid'
import store from '../store'
import { observer } from 'mobx-react'

const mockData = [
  {
    name: t('平均采销比'),
    data: '34.5%',
  },
  {
    name: t('采购任务数'),
    data: '128笔',
  },
  {
    name: t('采购单据'),
    data: '98笔',
  },
  {
    name: t('商品数'),
    data: '66种',
  },
  {
    name: t('退货单据'),
    data: '6笔',
  },
  {
    name: t('入库单据'),
    data: '88笔',
  },
]

const OtherData = ({ className, theme }) => {
  const { filter } = store
  const [data, setData] = useState([])

  useEffect(() => {
    fetchData(filter)
  }, [filter])

  const fetchData = () => {
    setData(mockData)
  }
  return (
    <Panel
      title={t('其他数据')}
      theme={theme}
      className={classNames('gm-flex gm-flex-column', className)}
    >
      <Grid className='gm-padding-0 gm-flex-flex' column={3} bg={false}>
        {data.map((item) => (
          <Box
            theme={theme}
            style={{ width: 'auto' }}
            data={item}
            key={item.name}
          />
        ))}
      </Grid>
    </Panel>
  )
}

OtherData.propTypes = {
  theme: PropTypes.any,
  className: PropTypes.string,
}
export default observer(OtherData)
