import React from 'react'
import Tour from '../../components/tour'
import Content from '../../components/content'
import guideTypeHOC from '../../components/withType'

const InitUserDriver = (props) => {
  return (
    <Tour
      {...props}
      steps={[
        {
          selector: '[data-id="initUserDriver"]',
          content: (
            <Content title='新建司机'>
              新建司机账号，用于为订单分配司机
              <br />
              司机可以通过账号登录司机APP
            </Content>
          ),
        },
      ]}
    />
  )
}

InitUserDriver.TYPE = 'InitUserDriver'
InitUserDriver.pathname = '/supply_chain/distribute/driver_manage'

export default guideTypeHOC(InitUserDriver)
