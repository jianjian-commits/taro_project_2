import React from 'react'
import Tour from '../../components/tour'
import Content from '../../components/content'
import guideTypeHOC from '../../components/withType'

const InitUserPurchase = (props) => {
  return (
    <Tour
      {...props}
      steps={[
        {
          selector: '[data-id="initUserPurchase"]',
          content: (
            <Content title='新建采购员'>
              新建采购员账号，用于为采购任务分配采购员
              <br />
              采购员可以通过账号登录采购APP
            </Content>
          ),
        },
      ]}
    />
  )
}

InitUserPurchase.TYPE = 'InitUserPurchase'
InitUserPurchase.pathname = '/supply_chain/purchase/information'

export default guideTypeHOC(InitUserPurchase)
