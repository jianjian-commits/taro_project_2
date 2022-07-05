import React from 'react'
import Tour from '../../components/tour'
import Content from '../../components/content'
import guideTypeHOC from '../../components/withType'

const InitSaleCheck = (props) => {
  return (
    <Tour
      {...props}
      steps={[
        {
          selector: '[data-id="InitSaleCheckDetail"]:first-child',
          content: (
            <Content title='查看商品销售规格'>
              点击查看刚刚新建的商品销售规格
            </Content>
          ),
          actionAfter: (node) => {
            if (node) {
              node.click()
            }
          },
        },
      ]}
    />
  )
}

InitSaleCheck.TYPE = 'InitSaleCheck'
// 后面参数 /merchandise/manage/sale/sale_list?id=&name&salemenuType
InitSaleCheck.pathname = '/merchandise/manage/sale/sku_detail'

export default guideTypeHOC(InitSaleCheck)
