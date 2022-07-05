import React from 'react'
import Tour from '../../components/tour'
import Content from '../../components/content'
import guideTypeHOC from '../../components/withType'

const InitPurchaseSpec = (props) => {
  return (
    <Tour
      {...props}
      steps={[
        {
          selector: '[data-id="initPurchaseSpec"]',
          content: (
            <Content title='新建采购规格'>
              新建采购员可以购买的商品采购规格
            </Content>
          ),
        },
      ]}
    />
  )
}

InitPurchaseSpec.TYPE = 'InitPurchaseSpec'
InitPurchaseSpec.pathname =
  '/supply_chain/purchase/information?tab=get_pur_spec'

export default guideTypeHOC(InitPurchaseSpec)
