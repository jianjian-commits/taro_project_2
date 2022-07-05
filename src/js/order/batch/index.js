import { i18next } from 'gm-i18n'
import React, { useEffect } from 'react'
import { BoxTable, Loading, Flex, Modal, Button } from '@gmfe/react'
import { observer } from 'mobx-react'

import List from './list'
import { history } from '../../common/service'
import { ordersValidFun } from './util'
import store from './store'
import globalStore from '../../stores/global'

export default observer((props) => {
  const { serviceTime, loading, details } = store

  const fetchData = async () => {
    const { async_task_id } = props.location.query
    if (async_task_id) {
      await store.getErrorList(async_task_id)
    }
    store.fixReceiveTime()
  }

  const handleSave = () => {
    store.batchSave().then(() => {
      Modal.warning({
        children: i18next.t('数据处理中,请在任务栏查看进度！'),
        title: i18next.t('提示'),
        onOk() {
          history.push('/order_manage/order')
        },
      })
    })
  }

  useEffect(() => {
    globalStore.fetchCustomizedConfigs()
    fetchData()
    return () => {
      store.reset()
    }
  }, [])

  const { async_task_id } = props.location.query
  if (!async_task_id && !serviceTime) {
    history.replace('/order_manage/order/list')
    return null
  }

  if (loading) {
    return (
      <Flex justifyCenter style={{ paddingTop: '100px' }}>
        <Loading text={i18next.t('加载中...')} />
      </Flex>
    )
  }

  const isOrderValid = ordersValidFun(details) || !details.length
  return (
    <div className='b-order'>
      <BoxTable
        info={
          <BoxTable.Info>{`待提交订单列表（运营时间：${serviceTime.name}）`}</BoxTable.Info>
        }
        action={
          <Button type='primary' onClick={handleSave} disabled={isOrderValid}>
            {i18next.t('全部保存')}
          </Button>
        }
      >
        <List />
      </BoxTable>
    </div>
  )
})
