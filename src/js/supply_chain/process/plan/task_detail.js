import { i18next } from 'gm-i18n'
import React from 'react'
import { Flex, Tabs } from '@gmfe/react'
import { observer } from 'mobx-react'
import { WithOrders, MaterialInfo } from './task_detail_tables'
import PropTypes from 'prop-types'
import { TaskStore as taskStore } from './store'

@observer
class TaskDetails extends React.Component {
  handleChange = (value) => {
    this.setState({ tabKey: value })
  }

  render() {
    const { index } = this.props
    const { name, status, tasks } = taskStore.taskList[index]

    const unPublish = status === 1
    const statusName = unPublish ? i18next.t('未发') : i18next.t('已发')

    return (
      <div className='b-plan'>
        <Flex className='b-plan-drawer-title' row>
          <Flex
            justifyCenter
            style={{
              background: unPublish ? '#ed6089' : '#86b04e',
              color: 'white',
              width: '40px',
            }}
            className='gm-margin-right-10'
          >
            {statusName}
          </Flex>
          {name}
        </Flex>
        <div className='gm-padding-tb-15 gm-padding-lr-20'>
          <Tabs
            tabs={[
              i18next.t('关联订单') + '(' + tasks.length + ')',
              i18next.t('物料信息'),
            ]}
            defaultActive={0}
            style={{ width: '100%' }}
          >
            <WithOrders key={0} skuIndex={index} />
            <MaterialInfo key={1} skuIndex={index} />
          </Tabs>
        </div>
      </div>
    )
  }
}

TaskDetails.propTypes = {
  index: PropTypes.number.isRequired,
}

export default TaskDetails
