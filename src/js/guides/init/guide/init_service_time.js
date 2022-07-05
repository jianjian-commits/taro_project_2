import React from 'react'
import Tour from '../../components/tour'
import Content from '../../components/content'
import guideTypeHOC from '../../components/withType'

const InitServiceTime = (props) => {
  return (
    <Tour
      {...props}
      steps={[
        {
          selector: '[data-id="initServiceTime"]',
          content: (
            <Content title='新建运营时间'>
              普通运营时间用于当日下单，次日收货
              <br />
              预售运营时间用于当日下单，自定义收货日期
            </Content>
          ),
        },
      ]}
    />
  )
}

InitServiceTime.TYPE = 'InitServiceTime'
InitServiceTime.pathname = '/system/setting/service_time'

export default guideTypeHOC(InitServiceTime)
