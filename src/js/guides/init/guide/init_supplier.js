import React from 'react'
import Tour from '../../components/tour'
import Content from '../../components/content'
import guideTypeHOC from '../../components/withType'

const InitSupplier = (props) => {
  return (
    <Tour
      {...props}
      steps={[
        {
          selector: '[data-id="initSupplier"]',
          content: (
            <Content title='新建供应商'>
              在系统中创建你的供应商，可以设置供应商的可供应商品分类、默认采购员等信息
            </Content>
          ),
        },
      ]}
    />
  )
}

InitSupplier.TYPE = 'InitSupplier'
InitSupplier.pathname = '/sales_invoicing/base/supplier'

export default guideTypeHOC(InitSupplier)
