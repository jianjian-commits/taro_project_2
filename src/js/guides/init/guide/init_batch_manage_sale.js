import React from 'react'
import Tour from '../../components/tour'
import Content from '../../components/content'
import guideTypeHOC from '../../components/withType'

const InitBatchManageSale = (props) => {
  return (
    <Tour
      {...props}
      steps={[
        {
          selector: '[data-id="initBatchManageSale"]',
          content: (
            <Content title='批量新建销售规格'>
              给报价单添加商品销售规格，绑定该报价单的客户可以使用这些销售规格下单
            </Content>
          ),
        },
      ]}
    />
  )
}

InitBatchManageSale.TYPE = 'InitBatchManageSale'
InitBatchManageSale.pathname = '/merchandise/manage/sale'

export default guideTypeHOC(InitBatchManageSale)
