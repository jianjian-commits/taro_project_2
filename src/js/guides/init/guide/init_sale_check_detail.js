import React from 'react'
import Tour from '../../components/tour'
import Content from '../../components/content'
import guideTypeHOC from '../../components/withType'

const InitSaleCheckDetail = (props) => {
  return (
    <Tour
      {...props}
      steps={[
        {
          selector: '[data-id="initSaleCheckDetailItem"]:first-child',
          content: (
            <Content title='查看商品销售规格'>
              点击查看刚刚新建的商品销售规格
            </Content>
          ),
        },
        {
          selector: '[data-id="initSaleCheckDetailItemSalemenu"]',
          content: <Content title='报价单'>该销售规格绑定的报价单</Content>,
        },
        {
          selector: '[data-id="initSaleCheckDetailItemPurchaseSpec"]',
          content: <Content title='采购规格'>该销售规格绑定的采购规格</Content>,
        },
      ]}
    />
  )
}

InitSaleCheckDetail.TYPE = 'InitSaleCheckDetail'
// 后面参数 /merchandise/manage/sale/sku_detail?spu_id=C874505&sku_id=D28438114&salemenuId=S33804&salemenuType=4&salemenuName=供港报价单
InitSaleCheckDetail.pathname = ''

export default guideTypeHOC(InitSaleCheckDetail)
