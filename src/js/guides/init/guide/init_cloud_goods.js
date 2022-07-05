import React from 'react'
import Tour from '../../components/tour'
import Content from '../../components/content'
import guideTypeHOC from '../../components/withType'

const InitCloudGoods = (props) => {
  return (
    <Tour
      {...props}
      steps={[
        {
          selector: '.rt-table .rt-tbody .gm-checkbox',
          content: (
            <Content title='选择云商品'>
              通过商品分类筛选，或直接搜索商品名称找到您想要的商品，勾选起来
            </Content>
          ),
          actionAfter: async (node) => {
            if (node) {
              node.click()
            }
          },
        },
        {
          selector: '[data-id="cloudGoodsImport"]',
          content: (
            <Content title='导入云商品'>
              点击导入，讲所选商品导入你的商品库
            </Content>
          ),
          actionAfter: (node) => {
            if (node) {
              node.click()
            }
          },
        },
        {
          selector: '.gm-modal button[type="submit"]',
          content: (
            <Content title='确认导入'>
              默认将云商品所属分类信息自动创建至本地商品分类下
            </Content>
          ),
        },
      ]}
    />
  )
}

InitCloudGoods.TYPE = 'InitCloudGoods'
InitCloudGoods.pathname = '/merchandise/manage/list/cloud_goods'

export default guideTypeHOC(InitCloudGoods)
