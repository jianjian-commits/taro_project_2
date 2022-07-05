import React, { useEffect } from 'react'
import moment from 'moment'
import { Col } from '@gmfe/react'

import Filter from './components/detail/filter'
import Summary from './components/detail/summary'
import Panel from './components/detail/panel'
import List from './components/detail/list'
import { detailStore as store } from './store'

const Detail = (props) => {
  useEffect(() => {
    const { sku_id, start_time, end_time, sku_name } = props.location.query
    store.changeDetailFilter({
      sku_id,
      start_time: moment(start_time).startOf('day'),
      end_time: moment(end_time).startOf('day'),
      sku_name,
    })

    store.changeDetail({
      start_time: moment(start_time).startOf('day'),
      end_time: moment(end_time).startOf('day'),
    })

    // 获取报价历史数据
    store.getDetailList()

    return () => {
      store.initDetailFilter()
      store.initDetail()
    }
  }, [])

  return (
    <>
      <Filter />
      <Col
        style={{ backgroundColor: '#f6f7fb' }}
        className='gm-padding-lr-20 gm-padding-tb-10 b-home'
      >
        <Col>
          {/* 概况 */}
          <Summary />
        </Col>
        <Col className='gm-padding-top-10'>
          {/** 历史报价图表 */}
          <Panel />
        </Col>
        <Col className='gm-padding-top-10'>
          {/** 历史报价列表 */}
          <List />
        </Col>
      </Col>
    </>
  )
}

export default Detail
