import React from 'react'
import Tour from '../../components/tour'
import Content from '../../components/content'
import guideTypeHOC from '../../components/withType'

const InitManageSale = (props) => {
  return (
    <Tour
      {...props}
      steps={[
        {
          selector: '[data-id="initManageSale"]',
          content: (
            <Content title='新建报价单'>
              这里可以先为不同的客户创建不同的报价单，设置报价单的运营时间等信息，报价单中商品和价格等信息在下一步里再添加进来
            </Content>
          ),
        },
      ]}
    />
  )
}

InitManageSale.TYPE = 'InitManageSale'
InitManageSale.pathname = '/merchandise/manage/sale'

export default guideTypeHOC(InitManageSale)
